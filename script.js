const hero = document.querySelector("#hero");
const revealButton = document.querySelector("#revealButton");
const petalsContainer = document.querySelector("#petals");
const fireworksContainer = document.querySelector("#fireworks");
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
  url: encodeURI(`music/${fileName}`)
}));

let currentTrackIndex = 0;
let fireworksTimer;

const fireworkColors = [
  ["#ff4d8d", "#ffd166", "#fff7ad"],
  ["#5ee7ff", "#7c4dff", "#d7b8ff"],
  ["#69ff97", "#00d4ff", "#faff70"],
  ["#ff7a3d", "#ffdf5d", "#ff4dd2"],
  ["#ffffff", "#8df7ff", "#b8ff6a"]
];

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


function createFirework() {
  const firework = document.createElement("span");
  const palette = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
  const sparkCount = 18 + Math.floor(Math.random() * 10);

  firework.className = "firework";
  firework.style.left = `${10 + Math.random() * 80}vw`;
  firework.style.top = `${8 + Math.random() * 55}vh`;
  firework.style.setProperty("--burst-color", palette[0]);
  firework.style.setProperty("--burst-glow", palette[1]);

  for (let index = 0; index < sparkCount; index += 1) {
    const spark = document.createElement("i");
    const angle = (360 / sparkCount) * index + Math.random() * 10;
    const distance = 70 + Math.random() * 110;
    const color = palette[index % palette.length];

    spark.style.setProperty("--angle", `${angle}deg`);
    spark.style.setProperty("--distance", `${distance}px`);
    spark.style.setProperty("--spark-color", color);
    firework.append(spark);
  }

  fireworksContainer.append(firework);
  window.setTimeout(() => firework.remove(), 1400);
}

function startFireworks() {
  if (fireworksTimer) {
    return;
  }

  createFirework();
  fireworksTimer = window.setInterval(createFirework, 1500);
}

function updateTrackInfo(message) {
  if (message) {
    trackName.textContent = message;
    return;
  }

  const track = playlist[currentTrackIndex];
  trackName.textContent = track ? track.name : "Sin canciones disponibles";
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

function updateVolume() {
  const volume = Number(volumeControl.value);
  audioPlayer.volume = volume / 100;
  volumeValue.textContent = `${volume}%`;
}

function playCurrentTrack() {
  return audioPlayer.play().catch(() => {
    updateTrackInfo("No se pudo reproducir la canción");
    updatePlayButton();
  });
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
    playCurrentTrack();
  }
}

function startCelebration() {
  hero.classList.add("revealed");
  startFireworks();

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
  if (!playlist.length) {
    return;
  }

  if (!audioPlayer.src) {
    loadTrack(0, true);
    return;
  }

  if (audioPlayer.paused) {
    playCurrentTrack();
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

volumeControl.addEventListener("input", updateVolume);

audioPlayer.addEventListener("play", updatePlayButton);
audioPlayer.addEventListener("pause", updatePlayButton);
audioPlayer.addEventListener("error", () => {
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
