const hero = document.querySelector("#hero");
const revealButton = document.querySelector("#revealButton");
const petalsContainer = document.querySelector("#petals");
const audioPlayer = document.querySelector("#audioPlayer");
const trackName = document.querySelector("#trackName");
const playPause = document.querySelector("#playPause");
const previousTrack = document.querySelector("#previousTrack");
const nextTrack = document.querySelector("#nextTrack");
const musicFiles = document.querySelector("#musicFiles");

let playlist = [];
let currentTrackIndex = 0;
let objectUrls = [];

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

  const track = playlist[currentTrackIndex];
  trackName.textContent = track ? track.name : "Elegí uno o más MP3";
}

function updateControls() {
  const hasTracks = playlist.length > 0;

  playPause.disabled = !hasTracks;
  previousTrack.disabled = !hasTracks;
  nextTrack.disabled = !hasTracks;
  playPause.setAttribute("aria-disabled", String(!hasTracks));
  previousTrack.setAttribute("aria-disabled", String(!hasTracks));
  nextTrack.setAttribute("aria-disabled", String(!hasTracks));
}

function updatePlayButton() {
  playPause.textContent = audioPlayer.paused ? "▶" : "⏸";
}

function loadTrack(index, shouldPlay = false) {
  if (!playlist.length) {
    audioPlayer.removeAttribute("src");
    audioPlayer.load();
    updateTrackInfo();
    updateControls();
    updatePlayButton();
    return;
  }

  currentTrackIndex = (index + playlist.length) % playlist.length;
  audioPlayer.src = playlist[currentTrackIndex].url;
  updateTrackInfo();
  updateControls();

  if (shouldPlay) {
    audioPlayer.play().catch(() => {
      updatePlayButton();
    });
  }
}

function startCelebration() {
  hero.classList.add("revealed");

  if (!petalsContainer.childElementCount) {
    const petals = Array.from({ length: 48 }, (_, index) => createPetal(index));
    petalsContainer.append(...petals);
  }
}

function clearObjectUrls() {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  objectUrls = [];
}

function loadSelectedFiles(files) {
  clearObjectUrls();

  playlist = Array.from(files, (file) => {
    const url = URL.createObjectURL(file);
    objectUrls.push(url);

    return {
      name: file.name.replace(/\.mp3$/i, ""),
      url
    };
  });

  if (playlist.length) {
    loadTrack(0, true);
  } else {
    loadTrack(0);
  }
}

revealButton.addEventListener("click", startCelebration);

musicFiles.addEventListener("change", (event) => {
  loadSelectedFiles(event.target.files);
});

playPause.addEventListener("click", () => {
  if (!playlist.length) {
    updateTrackInfo("Primero elegí uno o más MP3");
    return;
  }

  if (!audioPlayer.src) {
    loadTrack(0, true);
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play().catch(() => {
      updatePlayButton();
    });
  } else {
    audioPlayer.pause();
  }
});

previousTrack.addEventListener("click", () => {
  loadTrack(currentTrackIndex - 1, true);
});

nextTrack.addEventListener("click", () => {
  loadTrack(currentTrackIndex + 1, true);
});

audioPlayer.addEventListener("play", updatePlayButton);
audioPlayer.addEventListener("pause", updatePlayButton);
audioPlayer.addEventListener("error", () => {
  updateTrackInfo("No se pudo cargar la canción");
  updatePlayButton();
});

audioPlayer.addEventListener("ended", () => {
  loadTrack(currentTrackIndex + 1, true);
});

window.addEventListener("beforeunload", clearObjectUrls);

updateTrackInfo();
updateControls();
updatePlayButton();
