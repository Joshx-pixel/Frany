const hero = document.querySelector("#hero");
const revealButton = document.querySelector("#revealButton");
const petalsContainer = document.querySelector("#petals");
const audioPlayer = document.querySelector("#audioPlayer");
const trackName = document.querySelector("#trackName");
const playPause = document.querySelector("#playPause");
const previousTrack = document.querySelector("#previousTrack");
const nextTrack = document.querySelector("#nextTrack");

let playlist = [
  {
    name: "Music is my Saviour - S3RL feat Mixie Moon",
    url: "music/Music is my Saviour - S3RL feat Mixie Moon.mp3"
  },
  {
    name: "Love Quotes",
    url: "music/Jenevieve - Love Quotes (Official Music Video).mp3"
  },
  {
    name: "Internet Baby",
    url: "music/Internet Baby - S3RL x BEANIE.mp3"
  },
  {
    name: "Holding You, Holding Me",
    url: "music/Holding You, Holding Me - Cigarettes After Sex.mp3"
  },
  {
    name: "Over Now",
    url: "music/Calvin Harris, The Weeknd - Over Now (Official Video).mp3"
  }
];

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
    const petals = Array.from(
      { length: 48 },
      (_, index) => createPetal(index)
    );
    petalsContainer.append(...petals);
  }

  if (!audioPlayer.src) {
    loadTrack(0, true);
  }
}

function updateTrackInfo() {
  const track = playlist[currentTrackIndex];
  trackName.textContent = track ? track.name : "";
}

function loadTrack(index, shouldPlay = false) {
  if (!playlist.length) {
    return;
  }

  currentTrackIndex = (index + playlist.length) % playlist.length;
  audioPlayer.src = playlist[currentTrackIndex].url;
  updateTrackInfo();

  if (shouldPlay) {
    audioPlayer.play().catch(() => {});
  }
}

function updatePlayButton() {
  playPause.textContent = audioPlayer.paused ? "▶" : "⏸";
}

revealButton.addEventListener("click", startCelebration);

playPause.addEventListener("click", () => {
  if (!audioPlayer.src) {
    loadTrack(0, true);
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play();
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

audioPlayer.addEventListener("ended", () => {
  loadTrack(currentTrackIndex + 1, true);
});

updateTrackInfo();
