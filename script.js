const hero = document.querySelector("#hero");
const revealButton = document.querySelector("#revealButton");
const petalsContainer = document.querySelector("#petals");
const audioPlayer = document.querySelector("#audioPlayer");
const trackName = document.querySelector("#trackName");
const playPause = document.querySelector("#playPause");
const previousTrack = document.querySelector("#previousTrack");
const nextTrack = document.querySelector("#nextTrack");
const volumeControl = document.querySelector("#volumeControl");
const volumeValue = document.querySelector("#volumeValue");

const playlist = [
  "Music is my Saviour - S3RL feat Mixie Moon.mp3",
  "Jenevieve - Love Quotes (Official Music Video).mp3",
  "Internet Baby - S3RL x BEANIE.mp3",
  "Holding You, Holding Me - Cigarettes After Sex.mp3",
  "Calvin Harris, The Weeknd - Over Now (Official Video).mp3"
].map((fileName) => ({
  name: fileName.replace(/\.mp3$/i, ""),
  url: encodeURI(fileName)
}));

const fallbackTrack = {
  name: "Melodía de cumpleaños",
  notes: [
    [392, 0.2], [392, 0.2], [440, 0.45], [392, 0.45], [523.25, 0.45], [493.88, 0.8],
    [392, 0.2], [392, 0.2], [440, 0.45], [392, 0.45], [587.33, 0.45], [523.25, 0.8],
    [392, 0.2], [392, 0.2], [783.99, 0.45], [659.25, 0.45], [523.25, 0.45], [493.88, 0.45], [440, 0.8],
    [698.46, 0.2], [698.46, 0.2], [659.25, 0.45], [523.25, 0.45], [587.33, 0.45], [523.25, 0.9]
  ]
};

let currentTrackIndex = 0;
let shouldResumeAfterError = false;
let fallbackAudioContext;
let fallbackGain;
let fallbackTimer;
let fallbackNoteIndex = 0;
let isFallbackPlaying = false;

function createPetal(index) {
  const petal = document.createElement("span");
  const size = 12 + Math.random() * 20;
  const duration = 7 + Math.random() * 8;
  const delay = Math.random() * -duration;
  const drift = (Math.random() > 0.5 ? 1 : -1) * (45 + Math.random() * 140);

  petal.className = "petal";
  petal.style.left = `${(index * 7 + Math.random() * 9) % 100}vw`;
  petal.style.setProperty("--size", `${size}px`);
  petal.style.setProperty("--duration", `${duration}s`);
  petal.style.setProperty("--delay", `${delay}s`);
  petal.style.setProperty("--drift", `${drift}px`);

  return petal;
}

function updateTrackInfo(message) {
  if (message) {
    trackName.textContent = message;
    return;
  }

  if (isFallbackPlaying) {
    trackName.textContent = fallbackTrack.name;
    return;
  }

  const track = playlist[currentTrackIndex];
  trackName.textContent = track ? track.name : fallbackTrack.name;
}

function updateControls() {
  const hasTracks = playlist.length > 0 || Boolean(window.AudioContext || window.webkitAudioContext);

  playPause.disabled = !hasTracks;
  previousTrack.disabled = !hasTracks;
  nextTrack.disabled = !hasTracks;
  playPause.setAttribute("aria-disabled", String(!hasTracks));
  previousTrack.setAttribute("aria-disabled", String(!hasTracks));
  nextTrack.setAttribute("aria-disabled", String(!hasTracks));
}

function updatePlayButton() {
  playPause.textContent = audioPlayer.paused && !isFallbackPlaying ? "▶" : "⏸";
}

function updateVolume() {
  const volume = Number(volumeControl.value);
  audioPlayer.volume = volume / 100;
  volumeValue.textContent = `${volume}%`;

  if (fallbackGain) {
    fallbackGain.gain.value = volume / 100;
  }
}

function stopFallbackMusic() {
  window.clearTimeout(fallbackTimer);
  fallbackTimer = undefined;
  isFallbackPlaying = false;
  fallbackNoteIndex = 0;
  updatePlayButton();
}

function scheduleFallbackNote() {
  if (!isFallbackPlaying || !fallbackAudioContext || !fallbackGain) {
    return;
  }

  const [frequency, duration] = fallbackTrack.notes[fallbackNoteIndex];
  const oscillator = fallbackAudioContext.createOscillator();
  const noteGain = fallbackAudioContext.createGain();
  const now = fallbackAudioContext.currentTime;

  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;
  noteGain.gain.setValueAtTime(0, now);
  noteGain.gain.linearRampToValueAtTime(0.9, now + 0.02);
  noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(noteGain).connect(fallbackGain);
  oscillator.start(now);
  oscillator.stop(now + duration);

  fallbackNoteIndex = (fallbackNoteIndex + 1) % fallbackTrack.notes.length;
  fallbackTimer = window.setTimeout(scheduleFallbackNote, duration * 1000 + 45);
}

function startFallbackMusic() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    updateTrackInfo("Tu navegador no permite reproducir música");
    updatePlayButton();
    return;
  }

  if (!fallbackAudioContext) {
    fallbackAudioContext = new AudioContext();
    fallbackGain = fallbackAudioContext.createGain();
    fallbackGain.connect(fallbackAudioContext.destination);
    updateVolume();
  }

  audioPlayer.pause();
  shouldResumeAfterError = false;
  fallbackAudioContext.resume().then(() => {
    if (isFallbackPlaying) {
      return;
    }

    isFallbackPlaying = true;
    fallbackNoteIndex = 0;
    updateTrackInfo();
    updatePlayButton();
    scheduleFallbackNote();
  });
}

function playCurrentTrack() {
  shouldResumeAfterError = true;
  stopFallbackMusic();

  return audioPlayer.play().catch(() => {
    startFallbackMusic();
  });
}

function loadTrack(index, shouldPlay = false) {
  if (!playlist.length) {
    audioPlayer.removeAttribute("src");
    audioPlayer.load();
    updateTrackInfo();
    updateControls();
    updatePlayButton();

    if (shouldPlay) {
      startFallbackMusic();
    }
    return;
  }

  stopFallbackMusic();
  currentTrackIndex = (index + playlist.length) % playlist.length;
  audioPlayer.src = playlist[currentTrackIndex].url;
  updateTrackInfo();
  updateControls();

  if (shouldPlay) {
    playCurrentTrack();
  }
}

function startCelebration() {
  hero.classList.add("revealed");

  if (!petalsContainer.childElementCount) {
    const petals = Array.from({ length: 48 }, (_, index) => createPetal(index));
    petalsContainer.append(...petals);
  }

  if (!audioPlayer.src) {
    loadTrack(0, true);
    return;
  }

  if (audioPlayer.paused) {
    playCurrentTrack();
  }
}

revealButton.addEventListener("click", startCelebration);

playPause.addEventListener("click", () => {
  if (isFallbackPlaying) {
    stopFallbackMusic();
    return;
  }

  if (!playlist.length) {
    startFallbackMusic();
    return;
  }

  if (!audioPlayer.src) {
    loadTrack(0, true);
    return;
  }

  if (audioPlayer.paused) {
    playCurrentTrack();
  } else {
    shouldResumeAfterError = false;
    audioPlayer.pause();
  }
});

previousTrack.addEventListener("click", () => {
  loadTrack(currentTrackIndex - 1, true);
});

nextTrack.addEventListener("click", () => {
  loadTrack(currentTrackIndex + 1, true);
});

volumeControl.addEventListener("input", updateVolume);

audioPlayer.addEventListener("play", updatePlayButton);
audioPlayer.addEventListener("pause", updatePlayButton);
audioPlayer.addEventListener("error", () => {
  if (shouldResumeAfterError) {
    startFallbackMusic();
    return;
  }

  updateTrackInfo("No se pudo cargar la canción");
  updatePlayButton();
});

audioPlayer.addEventListener("ended", () => {
  loadTrack(currentTrackIndex + 1, true);
});

updateVolume();
loadTrack(0);
updateControls();
updatePlayButton();
