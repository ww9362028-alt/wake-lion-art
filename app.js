const lions = [
  {
    name: "丹霞瑞狮",
    title: "赤焰 · 勇气",
    blessing: "愿你目有星火，脚下有风，勇敢奔向每一次新奇。",
    palette: "朱砂 × 鎏金",
    number: "01",
    position: "0% 0%",
    color: "#9d231c",
  },
  {
    name: "云锦福狮",
    title: "云锦 · 丰盛",
    blessing: "愿你的奇思妙想，都能在温柔的日光里开花。",
    palette: "象牙 × 琥珀",
    number: "02",
    position: "50% 0%",
    color: "#c78316",
  },
  {
    name: "碧玉醒狮",
    title: "青岚 · 新生",
    blessing: "愿你永远保有好奇，在生长里遇见更大的世界。",
    palette: "翡翠 × 珊瑚",
    number: "03",
    position: "100% 0%",
    color: "#356c58",
  },
  {
    name: "星海蓝狮",
    title: "星海 · 远志",
    blessing: "愿你心怀远方，也珍惜每一颗照亮当下的小星星。",
    palette: "靛蓝 × 金橙",
    number: "04",
    position: "0% 100%",
    color: "#194c83",
  },
  {
    name: "桃夭喜狮",
    title: "桃夭 · 欢喜",
    blessing: "愿你的笑意像春日花朵，把快乐分享给身边的人。",
    palette: "桃粉 × 赤金",
    number: "05",
    position: "50% 100%",
    color: "#d05f4c",
  },
  {
    name: "紫气灵狮",
    title: "紫气 · 灵光",
    blessing: "愿每一个天马行空的念头，都成为独一无二的灵光。",
    palette: "绛紫 × 暖金",
    number: "06",
    position: "100% 100%",
    color: "#70478a",
  },
];

const drawCard = document.querySelector(".draw-card");
const cardNumber = document.querySelector(".card-number");
const artFrame = document.querySelector(".art-frame");
const resultCopy = document.querySelector(".result-copy");
const drawButton = document.querySelector(".draw-button");
const buttonLabel = document.querySelector(".button-label");

let status = "idle";
let selectedIndex = null;
let audioContext = null;

const drumMarkup = () => `
  <div class="drum-cover" aria-hidden="true">
    <div class="drum-stage">
      <span class="drum-wave wave-one"></span>
      <span class="drum-wave wave-two"></span>
      <span class="drum-wave wave-three"></span>
      <span class="drum-stick stick-left"></span>
      <span class="drum-stick stick-right"></span>
      <div class="festival-drum">
        <div class="drum-head">
          <span class="drum-emblem">醒</span>
        </div>
      </div>
    </div>
    <div class="drum-caption">
      <span>击鼓唤狮</span>
      <small>CLICK TO AWAKEN</small>
    </div>
  </div>
  <div class="frame-line frame-line-top" aria-hidden="true"></div>
  <div class="frame-line frame-line-bottom" aria-hidden="true"></div>
`;

function setStatus(nextStatus) {
  status = nextStatus;
  drawCard.className = `draw-card is-${status}`;
  drawButton.disabled = status === "drawing";
}

function playDrumSequence() {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    const play = () => {
      const strike = (delay, startFrequency, volume) => {
        const now = audioContext.currentTime + delay;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(startFrequency, now);
        oscillator.frequency.exponentialRampToValueAtTime(46, now + 0.34);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(620, now);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.44);
      };

      const gong = (delay) => {
        const now = audioContext.currentTime + delay;
        [196, 294, 412].forEach((frequency, index) => {
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          oscillator.type = index === 0 ? "triangle" : "sine";
          oscillator.frequency.setValueAtTime(frequency, now);
          gain.gain.setValueAtTime(0.12 / (index + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.75);
        });
      };

      strike(0.02, 132, 0.62);
      strike(0.34, 116, 0.54);
      strike(0.68, 148, 0.68);
      gong(0.82);
    };

    if (audioContext.state === "suspended") {
      audioContext.resume().then(play);
    } else {
      play();
    }
  } catch {
    // The visual interaction still works if a browser blocks Web Audio.
  }
}

function drawLion() {
  if (status === "drawing") return;

  playDrumSequence();
  setStatus("drawing");
  artFrame.innerHTML = drumMarkup();
  resultCopy.innerHTML = `
    <p class="result-kicker">咚 · 咚 · 锵</p>
    <h2>灵狮正在赶来</h2>
    <p>循着鼓点，遇见这一刻的缘分</p>
  `;
  buttonLabel.textContent = "灵狮醒来中…";

  window.setTimeout(() => {
    let next = Math.floor(Math.random() * lions.length);
    if (lions.length > 1 && next === selectedIndex) {
      next =
        (next + 1 + Math.floor(Math.random() * (lions.length - 1))) %
        lions.length;
    }

    selectedIndex = next;
    const lion = lions[next];
    cardNumber.textContent = `NO. ${lion.number}`;
    artFrame.innerHTML = `
      <div
        class="lion-art"
        role="img"
        aria-label="${lion.name}，${lion.palette}配色"
        style="background-position:${lion.position};--lion-color:${lion.color}"
      ></div>
      <div class="frame-line frame-line-top" aria-hidden="true"></div>
      <div class="frame-line frame-line-bottom" aria-hidden="true"></div>
    `;
    resultCopy.innerHTML = `
      <p class="result-kicker">${lion.name} · ${lion.palette}</p>
      <h2>${lion.title}</h2>
      <p>${lion.blessing}</p>
    `;
    buttonLabel.textContent = "再遇一只灵狮";
    drawButton.setAttribute("aria-label", "再抽一只专属狮头");
    setStatus("revealed");
  }, 1100);
}

const sprite = new Image();
sprite.src = "./assets/lion-gallery-sprite.jpg";
drawButton.addEventListener("click", drawLion);
