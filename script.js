const hero = document.querySelector("#hero");
const revealButton = document.querySelector("#revealButton");
const petalsContainer = document.querySelector("#petals");
const audioPlayer = document.querySelector("#audioPlayer");
const trackName = document.querySelector("#trackName");
const playPause = document.querySelector("#playPause");
const previousTrack = document.querySelector("#previousTrack");
const nextTrack = document.querySelector("#nextTrack");
const seekBar = document.querySelector("#seekBar");
const currentTime = document.querySelector("#currentTime");
const durationTime = document.querySelector("#duration");
const jumpTo = document.querySelector("#jumpTo");

let playlist = [];
let currentTrackIndex = 0;

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

function startCelebration() {
  hero.classList.add("revealed");

  if (!petalsContainer.childElementCount) {
    const petals = Array.from({ length: 48 }, (_, index) => createPetal(index));
    petalsContainer.append(...petals);
  }
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function parseTimeToSeconds(value) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return 0;
  }

  if (cleanValue.includes(":")) {
    const parts = cleanValue.split(":").map((part) => Number(part));

    if (parts.some((part) => Number.isNaN(part))) {
      return audioPlayer.currentTime;
    }

    return parts.reduce((total, part) => total * 60 + part, 0);
  }

  const seconds = Number(cleanValue);
  return Number.isNaN(seconds) ? audioPlayer.currentTime : seconds;
}

function updateTrackInfo() {
  const track = playlist[currentTrackIndex];
  trackName.textContent = track ? track.name.replace(/\.mp3$/i, "") : "Elegí uno o más MP3";
}

function loadTrack(index, shouldPlay = false) {
  if (!playlist.length) {
    return;
  }

  currentTrackIndex = (index + playlist.length) % playlist.length;
  audioPlayer.src = playlist[currentTrackIndex].url;
  updateTrackInfo();

  if (shouldPlay) {
    audioPlayer.play();
  }
}

function updatePlayButton() {
  playPause.textContent = audioPlayer.paused ? "▶" : "⏸";
}

function seekTo(seconds) {
  if (!Number.isFinite(audioPlayer.duration)) {
    return;
  }

  audioPlayer.currentTime = Math.min(Math.max(seconds, 0), audioPlayer.duration);
}

revealButton.addEventListener("click", startCelebration);

playPause.addEventListener("click", () => {
if (!playlist.length) {
  return;
}

  if (audioPlayer.paused) {
    audioPlayer.play();
  } else {
    audioPlayer.pause();
  }
});

previousTrack.addEventListener("click", () => loadTrack(currentTrackIndex - 1, !audioPlayer.paused));
nextTrack.addEventListener("click", () => loadTrack(currentTrackIndex + 1, !audioPlayer.paused));


audioPlayer.addEventListener("loadedmetadata", () => {
  seekBar.max = Math.floor(audioPlayer.duration);
  durationTime.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener("timeupdate", () => {
  seekBar.value = Math.floor(audioPlayer.currentTime);
  currentTime.textContent = formatTime(audioPlayer.currentTime);
});

audioPlayer.addEventListener("play", updatePlayButton);
audioPlayer.addEventListener("pause", updatePlayButton);
audioPlayer.addEventListener("ended", () => loadTrack(currentTrackIndex + 1, true));

seekBar.addEventListener("input", () => seekTo(Number(seekBar.value)));

jumpTo.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    seekTo(parseTimeToSeconds(jumpTo.value));
    jumpTo.value = "";
  }
});
