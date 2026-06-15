const $ = (selector) => document.querySelector(selector);

const canvas = $('#gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

const ui = {
  loading: $('#loading'),
  loadBar: $('#loadBar'),
  loadText: $('#loadText'),
  menu: $('#menu'),
  startBtn: $('#startBtn'),
  howBtn: $('#howBtn'),
  helpPanel: $('#helpPanel'),
  gameOver: $('#gameOver'),
  restartBtn: $('#restartBtn'),
  backMenuBtn: $('#backMenuBtn'),
  pauseBtn: $('#pauseBtn'),
  soundBtn: $('#soundBtn'),
  hud: $('#hud'),
  hudScore: $('#hudScore'),
  hudDistance: $('#hudDistance'),
  hudCombo: $('#hudCombo'),
  dashMeter: $('#dashMeter'),
  heartBox: $('#heartBox'),
  badgeLine: $('#badgeLine'),
  bestScore: $('#bestScore'),
  bestDistance: $('#bestDistance'),
  bestCombo: $('#bestCombo'),
  finalScore: $('#finalScore'),
  finalDistance: $('#finalDistance'),
  finalCombo: $('#finalCombo'),
  finalChili: $('#finalChili'),
  overReason: $('#overReason'),
  recordLine: $('#recordLine'),
  skinPreview: $('#skinPreview'),
  skinName: $('#skinName'),
  skinTrait: $('#skinTrait'),
  prevSkin: $('#prevSkin'),
  nextSkin: $('#nextSkin'),
  randomSkinBtn: $('#randomSkinBtn'),
  touchControls: $('#touchControls'),
};

const STORAGE_KEY = 'wudu-goose-runner-record-v1';
const SETTINGS_KEY = 'wudu-goose-runner-settings-v1';
const isTouchDevice = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

const SKINS = [
  { id: '05', file: 'goose-05.webp', name: '雾都巫师鹅', trait: '魔杖会把远处辣椒轻轻拽过来，磁吸半径 +14%。', mod: { magnetRadius: 1.14 } },
  { id: '06', file: 'goose-06.webp', name: '涂鸦朋克鹅', trait: '开局自带 16 点雾能，前期更容易打出第一次冲刺。', mod: { dashStart: 16 } },
  { id: '07', file: 'goose-07.webp', name: '山城骑士鹅', trait: '护盾持续时间 +0.7 秒，适合稳扎稳打冲远距。', mod: { shieldBonus: 0.7 } },
  { id: '08', file: 'goose-08.webp', name: '火锅魔王鹅', trait: '冲刺破障额外 +22% 分数，是高分玩家的暴力选择。', mod: { obstacleScore: 1.22 } },
  { id: '09', file: 'goose-09.webp', name: '特勤机枪鹅', trait: '滑铲判定更宽，霓虹招牌关卡容错更高。', mod: { slideAssist: 1.12 } },
  { id: '10', file: 'goose-10.webp', name: '丛林侦察鹅', trait: '每颗辣椒 +10% 分数，连击路线收益更高。', mod: { coinScore: 1.1 } },
  { id: '11', file: 'goose-11.webp', name: '木乃伊学长鹅', trait: '受击后的无敌时间 +0.45 秒，适合新手救场。', mod: { hitIframes: 0.45 } },
  { id: '12', file: 'goose-12.webp', name: '暗影术士鹅', trait: '每次雾能冲刺少消耗 6 点，冲刺频率更高。', mod: { dashCost: -6 } },
  { id: '13', file: 'goose-13.webp', name: '赤甲战神鹅', trait: '破坏机关时连击时间刷新更多，适合硬核连击。', mod: { comboOnBreak: 0.75 } },
  { id: '14', file: 'goose-14.webp', name: '冰刃穿楼鹅', trait: '二段跳高度 +3%，极限空中路线更容易接上。', mod: { jump: 1.03 } },
  { id: '15', file: 'goose-15.webp', name: '蘑菇冒险鹅', trait: '弹簧台与云梯奖励 +25%，喜欢跳台路线就选它。', mod: { platformScore: 1.25 } },
  { id: '16', file: 'goose-16.webp', name: '青衣道法鹅', trait: '磁吸持续时间 +18%，辣椒阵更容易全收。', mod: { magnetTime: 1.18 } },
  { id: '17', file: 'goose-17.webp', name: '山城大侠鹅', trait: '开局多 1 点生命，容错最高，但分数仍要靠操作。', mod: { hp: 1 } },
  { id: '18', file: 'goose-18.webp', name: '格子疾风鹅', trait: '连击保持时间 +0.7 秒，最适合追求排行榜。', mod: { comboGrace: 0.7 } },
  { id: '19', file: 'goose-19.webp', name: '忍者盲盒鹅', trait: '冲刺后的速度线更久，雾能回复略快。', mod: { dashRegen: 1.1 } },
];

const STAGES = [
  { name: '嘉陵雾桥', sign: '嘉陵雾桥', sky: ['#121633', '#233e73'], glow: '#64e9ff', accent: '#ffd45c', river: '#14345f' },
  { name: '轻轨穿楼', sign: '李子坝轻轨', sky: ['#11182e', '#3a275d'], glow: '#ff70b6', accent: '#72f7ff', river: '#1b2b58' },
  { name: '洪崖洞夜梯', sign: '洪崖洞', sky: ['#1a1030', '#582947'], glow: '#ffb84d', accent: '#ff5d7a', river: '#281d46' },
  { name: '长江索道', sign: '长江索道', sky: ['#08192c', '#164d62'], glow: '#9bff8f', accent: '#64e9ff', river: '#0c5264' },
  { name: '赛博解放碑', sign: '解放碑', sky: ['#0b1029', '#28245d'], glow: '#9f82ff', accent: '#ffd45c', river: '#171a46' },
];

const POWER_LABEL = {
  shield: '雾盾护体',
  magnet: '火锅磁吸',
  slow: '慢动作雾场',
  boost: '索道推进',
};

const CHUNK_TYPES = ['stone', 'rail', 'spring', 'cloud', 'lift', 'rope'];

const assets = {
  images: new Map(),
};

const input = {
  left: false,
  right: false,
  down: false,
  jumpBuffer: 0,
  dashBuffer: 0,
};

let logicalWidth = 1280;
let logicalHeight = 720;
let selectedSkinIndex = Number(localStorage.getItem('wudu-goose-selected-skin') || 13);
if (!Number.isFinite(selectedSkinIndex) || selectedSkinIndex < 0 || selectedSkinIndex >= SKINS.length) selectedSkinIndex = 13;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

function invLerp(a, b, v) {
  return clamp((v - a) / (b - a), 0, 1);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

function formatNumber(value) {
  return Math.max(0, Math.floor(value)).toLocaleString('zh-CN');
}

function hash01(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function makeRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function randRange(rng, min, max) {
  return min + (max - min) * rng();
}

function choose(rng, list) {
  return list[Math.floor(rng() * list.length) % list.length];
}

function aabb(a, b, pad = 0) {
  return a.x + pad < b.x + b.w && a.x + a.w - pad > b.x && a.y + pad < b.y + b.h && a.y + a.h - pad > b.y;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function drawRoundRect(context, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + w, y, x + w, y + h, radius);
  context.arcTo(x + w, y + h, x, y + h, radius);
  context.arcTo(x, y + h, x, y, radius);
  context.arcTo(x, y, x + w, y, radius);
  context.closePath();
}

function fillRoundRect(context, x, y, w, h, r, fillStyle) {
  drawRoundRect(context, x, y, w, h, r);
  context.fillStyle = fillStyle;
  context.fill();
}

function strokeRoundRect(context, x, y, w, h, r, strokeStyle, lineWidth = 1) {
  drawRoundRect(context, x, y, w, h, r);
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.stroke();
}

function colorWithAlpha(hex, alpha) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function loadRecord() {
  try {
    return { score: 0, distance: 0, combo: 0, skin: SKINS[selectedSkinIndex]?.id || '18', ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
  } catch {
    return { score: 0, distance: 0, combo: 0, skin: '18' };
  }
}

function saveRecord(record) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

function loadSettings() {
  try {
    return { sound: true, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}) };
  } catch {
    return { sound: true };
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

class SoundBox {
  constructor() {
    this.settings = loadSettings();
    this.enabled = this.settings.sound !== false;
    this.context = null;
    this.master = null;
    this.lastStep = 0;
    this.updateButton();
  }

  init() {
    if (!this.enabled) return;
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') this.context.resume();
  }

  updateButton() {
    ui.soundBtn.classList.toggle('on', this.enabled);
    ui.soundBtn.textContent = this.enabled ? '音效开' : '音效关';
  }

  toggle() {
    this.enabled = !this.enabled;
    this.settings.sound = this.enabled;
    saveSettings(this.settings);
    this.updateButton();
    if (this.enabled) {
      this.init();
      this.blip(740, 0.08, 'triangle', 0.5);
    }
  }

  blip(freq, dur = 0.08, type = 'sine', volume = 0.8, slide = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), now + dur);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  jump(doubleJump = false) { this.blip(doubleJump ? 620 : 480, 0.11, 'triangle', 0.65, doubleJump ? 180 : 120); }
  coin(combo = 1) { this.blip(640 + Math.min(combo, 12) * 34, 0.055, 'sine', 0.42, 120); }
  dash() { this.blip(220, 0.16, 'sawtooth', 0.5, 760); }
  hit() { this.blip(140, 0.22, 'square', 0.45, -70); }
  power() { this.blip(880, 0.13, 'triangle', 0.48, 360); }
  over() { this.blip(160, 0.34, 'sawtooth', 0.5, -80); }
}

const sound = new SoundBox();

class Game {
  constructor() {
    this.state = 'loading';
    this.width = logicalWidth;
    this.height = logicalHeight;
    this.time = 0;
    this.menuTime = 0;
    this.cameraX = 0;
    this.rng = makeRng(1);
    this.skylineSalt = Math.floor(Math.random() * 9000);
    this.record = loadRecord();
    this.selectedSkin = SKINS[selectedSkinIndex];
    this.platforms = [];
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.particles = [];
    this.floatTexts = [];
    this.stageIndex = 0;
    this.badgeTimer = 0;
    this.badgeText = '';
    this.pauseHeld = false;
    this.previewGooseBob = 0;
    this.initMenuScene();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  floorY() {
    return Math.min(this.height - 88, this.height * 0.78);
  }

  topY() {
    return Math.max(165, this.height * 0.28);
  }

  currentStage() {
    return STAGES[this.stageIndex % STAGES.length];
  }

  stageForDistance(distanceMeters) {
    return Math.floor(distanceMeters / 420) % STAGES.length;
  }

  initMenuScene() {
    this.cameraX = 0;
    this.platforms = [
      { x: -160, y: this.floorY(), w: 820, h: 48, type: 'rail', id: 1, alpha: 1 },
      { x: 760, y: this.floorY() - 80, w: 260, h: 42, type: 'spring', id: 2, alpha: 1 },
      { x: 1120, y: this.floorY() - 120, w: 350, h: 42, type: 'cloud', id: 3, alpha: 0.85 },
    ];
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.particles = [];
  }

  start() {
    sound.init();
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xFFFFFFFF)) >>> 0;
    this.rng = makeRng(seed);
    this.state = 'playing';
    this.time = 0;
    this.cameraX = 0;
    this.distanceMeters = 0;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.chili = 0;
    this.destroyed = 0;
    this.stageIndex = 0;
    this.speed = 295;
    this.difficulty = 0;
    this.lastPlatform = null;
    this.nextPlatformId = 1;
    this.platforms = [];
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.particles = [];
    this.floatTexts = [];
    this.badgeTimer = 0;
    this.selectedSkin = SKINS[selectedSkinIndex];

    const baseY = this.floorY();
    const hp = 3 + (this.selectedSkin.mod.hp || 0);
    this.player = {
      x: 160,
      y: baseY - 86,
      prevX: 160,
      prevY: baseY - 86,
      w: 56,
      h: 86,
      baseH: 86,
      vx: 300,
      vy: 0,
      grounded: true,
      coyote: 0.1,
      jumps: 0,
      hp,
      maxHp: hp,
      invuln: 1.1,
      dashCharge: clamp(22 + (this.selectedSkin.mod.dashStart || 0), 0, 100),
      dashTime: 0,
      dashCooldown: 0,
      sliding: false,
      slideSpark: 0,
      shield: 0,
      magnet: 0,
      slow: 0,
      boost: 0,
      platform: null,
      landedPlatformId: null,
    };

    const startPlatform = { x: -120, y: baseY, w: 980, h: 52, type: 'rail', id: this.nextPlatformId++, alpha: 1 };
    this.platforms.push(startPlatform);
    this.lastPlatform = startPlatform;
    this.addCoinLine(300, baseY - 100, 720, baseY - 120, 6, 'chili');
    this.generateUntil(this.width + 1800);
    this.showBadge('雾都起跑！二段跳、滑铲、冲刺都能拿分');
    this.syncHud();
    setPlayingUI(true);
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.showBadge('已暂停，按 P / Esc 继续');
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.showBadge('继续飞升！');
  }

  togglePause() {
    if (this.state === 'playing') this.pause();
    else if (this.state === 'paused') this.resume();
  }

  goMenu() {
    this.state = 'menu';
    this.initMenuScene();
    setPlayingUI(false);
    hideModal(ui.gameOver);
    updateMenuRecords(this.record);
  }

  requestJump() {
    input.jumpBuffer = 0.14;
  }

  requestDash() {
    input.dashBuffer = 0.14;
  }

  update(dt) {
    const safeDt = clamp(dt, 0, 1 / 28);
    this.menuTime += safeDt;
    if (this.state === 'menu' || this.state === 'loading') {
      this.updateAmbient(safeDt);
      return;
    }
    if (this.state !== 'playing') {
      this.updateAmbient(safeDt * 0.25);
      return;
    }

    this.time += safeDt;
    input.jumpBuffer = Math.max(0, input.jumpBuffer - safeDt);
    input.dashBuffer = Math.max(0, input.dashBuffer - safeDt);

    const p = this.player;
    p.prevX = p.x;
    p.prevY = p.y;
    p.prevH = p.h;

    this.distanceMeters = Math.max(this.distanceMeters, Math.floor(p.x / 10));
    this.difficulty = clamp(this.distanceMeters / 1650, 0, 1.6);
    const nextStage = this.stageForDistance(this.distanceMeters);
    if (nextStage !== this.stageIndex) {
      this.stageIndex = nextStage;
      this.showBadge(`进入「${this.currentStage().name}」：机关密度上升`);
      this.addBurst(p.x, p.y + 20, 36, this.currentStage().glow);
    }

    const slowFactor = p.slow > 0 ? 0.68 : 1;
    const boostFactor = p.boost > 0 ? 1.16 : 1;
    this.speed = (292 + this.distanceMeters * 0.09 + Math.sin(this.time * 0.9) * 6) * slowFactor * boostFactor;
    this.speed = clamp(this.speed, 260, 610);

    p.shield = Math.max(0, p.shield - safeDt);
    p.magnet = Math.max(0, p.magnet - safeDt);
    p.slow = Math.max(0, p.slow - safeDt);
    p.boost = Math.max(0, p.boost - safeDt);
    p.invuln = Math.max(0, p.invuln - safeDt);
    p.dashCooldown = Math.max(0, p.dashCooldown - safeDt);
    p.dashTime = Math.max(0, p.dashTime - safeDt);
    p.coyote = p.grounded ? 0.11 : Math.max(0, p.coyote - safeDt);

    if (p.dashTime <= 0) {
      const regenMod = this.selectedSkin.mod.dashRegen || 1;
      p.dashCharge = clamp(p.dashCharge + safeDt * (9.5 + this.combo * 0.22) * regenMod, 0, 100);
    }

    this.updatePlatforms(safeDt);
    this.updatePlayer(safeDt);
    this.updateObjects(safeDt);
    this.updateParticles(safeDt);

    this.cameraX = Math.max(0, lerp(this.cameraX, p.x - this.width * 0.28, 0.12));
    this.score += safeDt * (this.speed * 0.11 + Math.max(0, this.combo) * 0.7);

    if (this.combo > 0) {
      const grace = 1.95 + (this.selectedSkin.mod.comboGrace || 0);
      this.comboTimer = Math.max(0, this.comboTimer - safeDt);
      if (this.comboTimer <= 0) this.combo = 0;
      else this.comboTimer = Math.min(this.comboTimer, grace);
    }

    if (p.x < this.cameraX + 8 && p.invuln <= 0 && p.dashTime <= 0) {
      this.damage('被镜头甩下了：别一直按左，冲刺可以救场。');
      p.x = this.cameraX + 42;
      p.vx = Math.max(p.vx, this.speed * 0.9);
    }
    if (p.y > this.height + 170) {
      this.end('掉进嘉陵江雾里了：起跳前观察平台高度，空中可二段跳。');
    }

    this.generateUntil(this.cameraX + this.width + 1800);
    this.cleanup();
    this.syncHud();
  }

  updateAmbient(dt) {
    this.time += dt;
    this.previewGooseBob += dt;
    this.updateParticles(dt);
    if (Math.random() < dt * 1.4) {
      this.particles.push({
        x: this.cameraX + Math.random() * this.width,
        y: this.height + 20,
        vx: -30 - Math.random() * 70,
        vy: -40 - Math.random() * 80,
        life: 1.4 + Math.random() * 1.2,
        maxLife: 2.6,
        size: 1 + Math.random() * 3,
        color: 'rgba(120, 230, 255, 0.45)',
        kind: 'mist',
      });
    }
  }

  updatePlatforms(dt) {
    for (const platform of this.platforms) {
      if (platform.type === 'lift') {
        platform.y = platform.baseY + Math.sin(this.time * platform.freq + platform.phase) * platform.amp;
      } else if (platform.type === 'rope') {
        platform.y = platform.baseY + Math.sin(this.time * platform.freq + platform.phase) * platform.amp * 0.55;
        platform.x += Math.sin(this.time * platform.freq * 0.8 + platform.phase) * dt * 10;
      }
      if (platform.type === 'cloud' && platform.touched) {
        platform.decay -= dt;
        platform.alpha = clamp(platform.decay, 0.08, 1);
        if (platform.decay < 0.32) platform.solid = false;
      }
    }
  }

  updatePlayer(dt) {
    const p = this.player;
    const skinMod = this.selectedSkin.mod;

    if (input.jumpBuffer > 0 && (p.grounded || p.coyote > 0 || p.jumps < 2)) {
      const wasGrounded = p.grounded || p.coyote > 0;
      const jumpPower = (wasGrounded ? 650 : 590) * (skinMod.jump || 1);
      p.vy = -jumpPower;
      p.grounded = false;
      p.coyote = 0;
      p.jumps = wasGrounded ? 1 : p.jumps + 1;
      input.jumpBuffer = 0;
      this.addScore(wasGrounded ? 12 : 34, 'jump');
      if (!wasGrounded) this.showFloatText(p.x, p.y - 18, '二段跳 +34', '#64e9ff');
      this.addDust(p.x + p.w * 0.5, p.y + p.h, wasGrounded ? 14 : 9, wasGrounded ? '#ffd45c' : '#64e9ff');
      sound.jump(!wasGrounded);
    }

    const dashCost = clamp(44 + (skinMod.dashCost || 0), 28, 60);
    if (input.dashBuffer > 0 && p.dashCooldown <= 0 && p.dashCharge >= dashCost) {
      p.dashCharge -= dashCost;
      p.dashTime = 0.36;
      p.dashCooldown = 0.28;
      p.invuln = Math.max(p.invuln, 0.42);
      p.vx = Math.max(p.vx, this.speed + 520);
      input.dashBuffer = 0;
      this.addScore(80, 'dash');
      this.showFloatText(p.x, p.y - 24, '雾能冲刺 +80', '#ffd45c');
      this.addBurst(p.x + p.w, p.y + p.h * 0.5, 26, '#ffd45c');
      sound.dash();
    }

    const oldBottom = p.y + p.h;
    const wantsSlide = input.down;
    p.sliding = wantsSlide && (p.grounded || p.vy > -80);
    const targetH = p.sliding ? 50 : p.baseH;
    p.h = lerp(p.h, targetH, dt * 16);
    p.y = oldBottom - p.h;
    if (p.sliding) p.slideSpark += dt;

    if (p.dashTime > 0) {
      p.vx = lerp(p.vx, this.speed + 580, dt * 12);
    } else {
      const control = (input.right ? 118 : 0) - (input.left ? 92 : 0);
      const targetVx = this.speed + control;
      p.vx = lerp(p.vx, targetVx, dt * 7.5);
    }

    if (input.down && !p.grounded) p.vy += 1180 * dt;
    p.vy += 1720 * dt;
    p.vy = clamp(p.vy, -900, 1060);

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (p.x < this.cameraX - 70) p.x = this.cameraX - 70;

    p.grounded = false;
    p.platform = null;
    const oldBottom2 = p.prevY + (p.prevH || p.baseH);
    const hitboxLeft = p.x + p.w * 0.12;
    const hitboxRight = p.x + p.w * 0.88;
    for (const platform of this.platforms) {
      if (platform.solid === false) continue;
      if (hitboxRight < platform.x || hitboxLeft > platform.x + platform.w) continue;
      const top = platform.y;
      if (p.vy >= 0 && oldBottom2 <= top + 18 && p.y + p.h >= top && p.y + p.h <= top + 56) {
        p.y = top - p.h;
        p.vy = 0;
        p.grounded = true;
        p.platform = platform;
        p.coyote = 0.11;
        p.jumps = 0;
        if (p.landedPlatformId !== platform.id) {
          p.landedPlatformId = platform.id;
          this.onPlatformLand(platform);
        }
        break;
      }
    }

    if (p.grounded && p.sliding && p.slideSpark > 0.045) {
      p.slideSpark = 0;
      this.particles.push({
        x: p.x + 12,
        y: p.y + p.h - 4,
        vx: -80 - Math.random() * 120,
        vy: -20 - Math.random() * 45,
        life: 0.34,
        maxLife: 0.34,
        size: 2 + Math.random() * 3,
        color: 'rgba(255, 212, 92, 0.72)',
        kind: 'spark',
      });
    }
  }

  onPlatformLand(platform) {
    const p = this.player;
    if (platform.type === 'spring') {
      p.vy = -820 * (this.selectedSkin.mod.jump || 1);
      p.grounded = false;
      p.jumps = 1;
      const score = 90 * (this.selectedSkin.mod.platformScore || 1);
      this.addScore(score, 'spring');
      this.increaseCombo(2);
      this.showFloatText(p.x, platform.y - 26, `弹簧飞升 +${Math.floor(score)}`, '#ffd45c');
      this.addBurst(p.x + p.w / 2, platform.y, 28, '#ffd45c');
      sound.jump(true);
    }
    if (platform.type === 'cloud' && !platform.touched) {
      platform.touched = true;
      platform.decay = 1.05;
      const score = 45 * (this.selectedSkin.mod.platformScore || 1);
      this.addScore(score, 'cloud');
      this.showFloatText(p.x, platform.y - 22, `云梯会塌 +${Math.floor(score)}`, '#8df7ff');
    }
    if (platform.type === 'rope') {
      p.dashCharge = clamp(p.dashCharge + 5, 0, 100);
    }
  }

  updateObjects(dt) {
    const p = this.player;
    const playerCenter = { x: p.x + p.w * 0.5, y: p.y + p.h * 0.52 };
    const magnetRadius = 142 * (this.selectedSkin.mod.magnetRadius || 1);

    for (const coin of this.coins) {
      if (coin.collected) continue;
      coin.spin += dt * 5.2;
      coin.y = coin.baseY + Math.sin(this.time * 4 + coin.phase) * 5;
      const coinCenter = { x: coin.x, y: coin.y };
      const d = distance(playerCenter, coinCenter);
      if (p.magnet > 0 && d < magnetRadius) {
        const force = (1 - d / magnetRadius) * 520 * dt;
        coin.x += (playerCenter.x - coin.x) * force / Math.max(1, d);
        coin.baseY += (playerCenter.y - coin.y) * force / Math.max(1, d);
      }
      if (d < (coin.type === 'big' ? 42 : 30)) this.collectCoin(coin);
    }

    for (const power of this.powerups) {
      if (power.collected) continue;
      power.spin += dt * 3.2;
      power.y = power.baseY + Math.sin(this.time * 3 + power.phase) * 7;
      if (distance(playerCenter, power) < 40) this.collectPower(power);
    }

    for (const obstacle of this.obstacles) {
      if (obstacle.destroyed) continue;
      obstacle.t += dt;
      if (obstacle.type === 'drone') {
        obstacle.y = obstacle.baseY + Math.sin(this.time * 2.3 + obstacle.phase) * obstacle.amp;
        obstacle.x += Math.sin(this.time * 3.1 + obstacle.phase) * dt * 22;
      }
      if (obstacle.type === 'steam') {
        obstacle.hot = Math.sin(this.time * 3.8 + obstacle.phase) > -0.35;
      }
      const slidePad = p.sliding ? 8 * (this.selectedSkin.mod.slideAssist || 1) : 0;
      const playerBox = { x: p.x + 7, y: p.y + (p.sliding ? 8 : 4), w: p.w - 14, h: p.h - (p.sliding ? 16 : 8) };
      if (obstacle.type === 'gate' && p.sliding) {
        const gateBox = { ...obstacle, y: obstacle.y + 4, h: obstacle.h - 8 };
        if (aabb(playerBox, gateBox, slidePad)) {
          obstacle.passed = true;
          obstacle.destroyed = true;
          this.addScore(115, 'slide');
          this.increaseCombo(2);
          this.showFloatText(obstacle.x, obstacle.y - 16, '低空滑铲 +115', '#64e9ff');
          this.addDust(p.x + p.w / 2, p.y + p.h, 16, '#64e9ff');
          sound.coin(6);
        }
        continue;
      }
      if (obstacle.type === 'steam' && !obstacle.hot) continue;
      if (aabb(playerBox, obstacle, 4)) {
        if (p.dashTime > 0 || p.shield > 0 || p.invuln > 0.05) {
          this.breakObstacle(obstacle, p.dashTime > 0 ? '冲刺破障' : '护盾破障');
        } else {
          this.damage(this.hitReason(obstacle.type));
          obstacle.destroyed = true;
        }
      }
    }
  }

  hitReason(type) {
    const map = {
      pepper: '撞上火锅辣椒刺：冲刺或跳过都可以处理它。',
      gate: '撞上低矮霓虹牌：看到招牌时按下滑铲。',
      drone: '被轻轨巡航无人机撞到：二段跳或冲刺更稳。',
      steam: '被热锅蒸汽烫到：等待蒸汽间隙或冲刺穿过。',
    };
    return map[type] || '撞上障碍了。';
  }

  collectCoin(coin) {
    coin.collected = true;
    const mult = coin.type === 'big' ? 3 : 1;
    const value = (64 * mult + this.combo * 4) * (this.selectedSkin.mod.coinScore || 1);
    this.chili += mult;
    this.addScore(value, 'coin');
    this.increaseCombo(1);
    this.player.dashCharge = clamp(this.player.dashCharge + 3.2 * mult, 0, 100);
    this.showFloatText(coin.x, coin.y - 20, mult > 1 ? `重庆辣椒 +${Math.floor(value)}` : `+${Math.floor(value)}`, '#ffd45c');
    this.addBurst(coin.x, coin.y, mult > 1 ? 18 : 8, '#ffd45c');
    sound.coin(this.combo);
  }

  collectPower(power) {
    power.collected = true;
    const p = this.player;
    if (power.type === 'shield') p.shield = Math.max(p.shield, 5.0 + (this.selectedSkin.mod.shieldBonus || 0));
    if (power.type === 'magnet') p.magnet = Math.max(p.magnet, 6.2 * (this.selectedSkin.mod.magnetTime || 1));
    if (power.type === 'slow') p.slow = Math.max(p.slow, 4.6);
    if (power.type === 'boost') p.boost = Math.max(p.boost, 4.2);
    this.addScore(160, 'power');
    this.increaseCombo(3);
    this.showBadge(`${POWER_LABEL[power.type]}！连击继续`);
    this.showFloatText(power.x, power.y - 20, `${POWER_LABEL[power.type]} +160`, '#8dffcc');
    this.addBurst(power.x, power.y, 30, '#8dffcc');
    sound.power();
  }

  breakObstacle(obstacle, label) {
    obstacle.destroyed = true;
    this.destroyed += 1;
    const base = label.startsWith('冲刺') ? 180 : 130;
    const value = base * (this.selectedSkin.mod.obstacleScore || 1);
    this.addScore(value, 'break');
    this.increaseCombo(3 + (this.selectedSkin.mod.comboOnBreak || 0));
    this.player.dashCharge = clamp(this.player.dashCharge + 8, 0, 100);
    this.showFloatText(obstacle.x, obstacle.y - 18, `${label} +${Math.floor(value)}`, '#ff7d42');
    this.addBurst(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2, 30, '#ff7d42');
    sound.coin(9);
  }

  damage(reason) {
    const p = this.player;
    if (p.invuln > 0 || p.shield > 0 || p.dashTime > 0) return;
    p.hp -= 1;
    p.invuln = 1.22 + (this.selectedSkin.mod.hitIframes || 0);
    p.vx = Math.max(this.speed * 0.72, p.vx * 0.72);
    p.vy = -360;
    this.combo = 0;
    this.addBurst(p.x + p.w / 2, p.y + p.h / 2, 30, '#ff4f6d');
    this.showBadge(`受击！剩余生命 ${Math.max(0, p.hp)}：${reason}`);
    sound.hit();
    if (p.hp <= 0) this.end(reason);
  }

  end(reason) {
    if (this.state === 'gameover') return;
    this.state = 'gameover';
    setPlayingUI(false);
    this.addBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 44, '#ff4f6d');
    sound.over();

    const finalScore = Math.floor(this.score);
    const finalDistance = Math.floor(this.distanceMeters);
    const finalCombo = Math.floor(this.maxCombo);
    const record = { ...this.record };
    let lines = [];
    if (finalScore > (record.score || 0)) { record.score = finalScore; lines.push('分数新纪录'); }
    if (finalDistance > (record.distance || 0)) { record.distance = finalDistance; lines.push('距离新纪录'); }
    if (finalCombo > (record.combo || 0)) { record.combo = finalCombo; lines.push('连击新纪录'); }
    record.skin = this.selectedSkin.id;
    this.record = record;
    saveRecord(this.record);
    updateMenuRecords(this.record);

    ui.finalScore.textContent = formatNumber(finalScore);
    ui.finalDistance.textContent = `${finalDistance}m`;
    ui.finalCombo.textContent = `${finalCombo}x`;
    ui.finalChili.textContent = formatNumber(this.chili);
    ui.overReason.textContent = reason || '鹅被雾都地形教育了。';
    ui.recordLine.textContent = lines.length ? `恭喜：${lines.join('、')}！` : `最佳分数 ${formatNumber(this.record.score || 0)}，继续挑战连击路线。`;
    showModal(ui.gameOver);
  }

  addScore(value) {
    this.score += value;
  }

  increaseCombo(amount = 1) {
    this.combo += amount;
    this.maxCombo = Math.max(this.maxCombo, Math.floor(this.combo));
    this.comboTimer = 1.95 + (this.selectedSkin.mod.comboGrace || 0);
    if (Math.floor(this.combo) > 0 && Math.floor(this.combo) % 12 === 0) {
      this.showBadge(`连击 ${Math.floor(this.combo)}x！雾能回复加快`);
    }
  }

  showBadge(text) {
    this.badgeText = text;
    this.badgeTimer = 2.5;
    ui.badgeLine.textContent = text;
    ui.badgeLine.classList.remove('hidden');
  }

  showFloatText(x, y, text, color) {
    this.floatTexts.push({ x, y, text, color, life: 0.92, maxLife: 0.92, vy: -28 });
  }

  addDust(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: -40 - Math.random() * 180,
        vy: -30 - Math.random() * 60,
        life: 0.35 + Math.random() * 0.28,
        maxLife: 0.62,
        size: 2 + Math.random() * 4,
        color,
        kind: 'dust',
      });
    }
  }

  addBurst(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.45 + Math.random() * 0.55,
        maxLife: 0.9,
        size: 2 + Math.random() * 4,
        color,
        kind: 'spark',
      });
    }
  }

  updateParticles(dt) {
    for (const particle of this.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      if (particle.kind !== 'mist') particle.vy += 260 * dt;
      else particle.vy -= 4 * dt;
    }
    for (const text of this.floatTexts) {
      text.life -= dt;
      text.y += text.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    this.floatTexts = this.floatTexts.filter((t) => t.life > 0);
    if (this.badgeTimer > 0) {
      this.badgeTimer -= dt;
      if (this.badgeTimer <= 0) ui.badgeLine.classList.add('hidden');
    }
  }

  generateUntil(worldX) {
    while ((this.lastPlatform?.x || 0) + (this.lastPlatform?.w || 0) < worldX) {
      this.generateChunk();
    }
  }

  generateChunk() {
    const prev = this.lastPlatform;
    const rng = this.rng;
    const diff = clamp(this.difficulty, 0, 1.65);
    const prevEnd = prev.x + prev.w;
    let gap = randRange(rng, 96 + diff * 30, 210 + diff * 58);
    let width = randRange(rng, 220 - diff * 42, 450 - diff * 82);
    width = clamp(width, 132, 480);
    const minY = this.topY();
    const maxY = this.floorY();
    let y = clamp(prev.y + randRange(rng, -118, 94), minY, maxY);
    if (y < prev.y - 86) gap *= 0.84;
    if (prev.type === 'spring') gap *= 1.14;

    let type = choose(rng, CHUNK_TYPES);
    if (this.distanceMeters < 130) type = rng() < 0.65 ? 'stone' : 'rail';
    if (type === 'cloud' && diff < 0.25) type = 'stone';
    if (type === 'lift' || type === 'rope') width = Math.max(170, width * 0.82);
    if (type === 'spring') width = Math.max(150, width * 0.7);

    const platform = {
      x: prevEnd + gap,
      y,
      w: width,
      h: type === 'rope' ? 34 : 42,
      type,
      id: this.nextPlatformId++,
      alpha: 1,
      solid: true,
    };
    if (type === 'lift' || type === 'rope') {
      platform.baseY = y;
      platform.amp = randRange(rng, 26, 70);
      platform.freq = randRange(rng, 1.0, 1.7);
      platform.phase = rng() * Math.PI * 2;
    }
    if (type === 'cloud') platform.decay = 1;
    this.platforms.push(platform);

    this.addCoinArc(prev, platform, rng, diff);
    this.addPlatformCollectibles(platform, rng, diff);
    this.addObstacleMaybe(platform, rng, diff);
    this.addPowerMaybe(platform, rng, diff);
    this.lastPlatform = platform;
  }

  addCoinLine(x1, y1, x2, y2, count, type = 'chili') {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      this.coins.push({
        x: lerp(x1, x2, t),
        y: lerp(y1, y2, t),
        baseY: lerp(y1, y2, t),
        type,
        spin: Math.random() * 6,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  addCoinArc(prev, platform, rng, diff) {
    const count = Math.floor(randRange(rng, 4, 8 + diff * 3));
    const x1 = prev.x + prev.w - 18;
    const x2 = platform.x + Math.min(platform.w * 0.62, 250);
    const y1 = prev.y - 85;
    const y2 = platform.y - 90;
    const arcHeight = randRange(rng, 30, 100 + diff * 20);
    for (let i = 0; i < count; i++) {
      const t = (i + 1) / (count + 1);
      const arc = Math.sin(t * Math.PI) * arcHeight;
      const type = rng() < 0.08 + diff * 0.035 ? 'big' : 'chili';
      this.coins.push({
        x: lerp(x1, x2, t),
        y: lerp(y1, y2, t) - arc,
        baseY: lerp(y1, y2, t) - arc,
        type,
        spin: rng() * Math.PI * 2,
        phase: rng() * Math.PI * 2,
      });
    }
  }

  addPlatformCollectibles(platform, rng, diff) {
    if (platform.w < 180 || rng() > 0.72) return;
    const count = Math.floor(randRange(rng, 2, 5 + diff * 2));
    for (let i = 0; i < count; i++) {
      const x = platform.x + 44 + i * Math.min(42, (platform.w - 88) / Math.max(1, count - 1));
      const y = platform.y - randRange(rng, 72, 112);
      this.coins.push({ x, y, baseY: y, type: rng() < 0.05 ? 'big' : 'chili', spin: rng() * 6, phase: rng() * 6 });
    }
  }

  addObstacleMaybe(platform, rng, diff) {
    if (platform.x < 1100 || platform.w < 150) return;
    const chance = 0.26 + diff * 0.28;
    if (rng() > chance) return;
    const typeRoll = rng();
    let obstacle;
    if (typeRoll < 0.34) {
      obstacle = { type: 'pepper', x: platform.x + platform.w * randRange(rng, 0.35, 0.72), y: platform.y - 44, w: 44, h: 44 };
    } else if (typeRoll < 0.58) {
      obstacle = { type: 'gate', x: platform.x + platform.w * randRange(rng, 0.34, 0.66), y: platform.y - 96, w: 82, h: 42 };
    } else if (typeRoll < 0.82) {
      obstacle = { type: 'drone', x: platform.x + platform.w * randRange(rng, 0.36, 0.8), y: platform.y - randRange(rng, 136, 184), baseY: platform.y - randRange(rng, 136, 184), w: 54, h: 42, amp: randRange(rng, 12, 34), phase: rng() * 6, t: 0 };
    } else {
      obstacle = { type: 'steam', x: platform.x + platform.w * randRange(rng, 0.35, 0.74), y: platform.y - 116, w: 52, h: 116, phase: rng() * 6, t: 0, hot: true };
    }
    this.obstacles.push(obstacle);
  }

  addPowerMaybe(platform, rng, diff) {
    if (platform.x < 1200 || rng() > 0.105 + diff * 0.025) return;
    const type = choose(rng, ['shield', 'magnet', 'slow', 'boost']);
    const x = platform.x + platform.w * randRange(rng, 0.28, 0.78);
    const y = platform.y - randRange(rng, 128, 185);
    this.powerups.push({ type, x, y, baseY: y, phase: rng() * 6, spin: rng() * 6 });
  }

  cleanup() {
    const left = this.cameraX - 520;
    this.platforms = this.platforms.filter((p) => p.x + p.w > left && p.alpha > 0.05);
    this.obstacles = this.obstacles.filter((o) => o.x + o.w > left && !o.destroyed);
    this.coins = this.coins.filter((c) => c.x > left && !c.collected);
    this.powerups = this.powerups.filter((p) => p.x > left && !p.collected);
  }

  syncHud() {
    ui.hudScore.textContent = formatNumber(this.score || 0);
    ui.hudDistance.textContent = `${Math.floor(this.distanceMeters || 0)}m`;
    ui.hudCombo.textContent = `${Math.floor(this.combo || 0)}x`;
    ui.dashMeter.style.width = `${Math.floor(this.player?.dashCharge || 0)}%`;
    const p = this.player;
    ui.heartBox.innerHTML = '';
    if (p) {
      for (let i = 0; i < p.maxHp; i++) {
        const heart = document.createElement('i');
        heart.className = `heart${i >= p.hp ? ' empty' : ''}`;
        ui.heartBox.appendChild(heart);
      }
    }
  }

  draw(context) {
    const stage = this.currentStage();
    this.drawBackground(context, stage);
    this.drawWorld(context, stage);
    this.drawParticles(context);
    this.drawPlayer(context, stage);
    this.drawForeground(context, stage);
    if (this.state === 'paused') this.drawPauseOverlay(context);
  }

  drawBackground(context, stage) {
    const w = this.width;
    const h = this.height;
    const grad = context.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, stage.sky[0]);
    grad.addColorStop(0.58, stage.sky[1]);
    grad.addColorStop(1, '#080b18');
    context.fillStyle = grad;
    context.fillRect(0, 0, w, h);

    // 远景星点与飞雾，不使用外部资源，保证 GitHub Pages 静态部署稳定。
    context.save();
    for (let i = 0; i < 85; i++) {
      const hx = hash01(i + this.skylineSalt) * w;
      const hy = hash01(i * 2.3 + 5) * h * 0.48;
      const twinkle = 0.25 + Math.sin(this.time * 1.7 + i) * 0.18;
      context.globalAlpha = 0.18 + twinkle;
      context.fillStyle = i % 9 === 0 ? stage.accent : '#ffffff';
      context.fillRect(hx, hy, i % 11 === 0 ? 3 : 2, i % 11 === 0 ? 3 : 2);
    }
    context.restore();

    this.drawMountains(context, 0.12, h * 0.55, colorWithAlpha('#020817', 0.32));
    this.drawMountains(context, 0.22, h * 0.62, colorWithAlpha(stage.sky[0], 0.42));
    this.drawSkyline(context, 0.34, h * 0.72, stage);
    this.drawSkyline(context, 0.52, h * 0.83, stage, true);

    // 江面
    const riverY = h * 0.83;
    const river = context.createLinearGradient(0, riverY, 0, h);
    river.addColorStop(0, colorWithAlpha(stage.river, 0.72));
    river.addColorStop(1, 'rgba(3, 6, 18, 0.96)');
    context.fillStyle = river;
    context.fillRect(0, riverY, w, h - riverY);
    context.globalAlpha = 0.32;
    context.strokeStyle = stage.glow;
    context.lineWidth = 2;
    for (let i = -2; i < 12; i++) {
      const y = riverY + 22 + i * 22 + Math.sin(this.time + i) * 2;
      context.beginPath();
      for (let x = -80; x < w + 100; x += 28) {
        const yy = y + Math.sin((x + this.cameraX * 0.1) * 0.016 + i) * 5;
        if (x === -80) context.moveTo(x, yy);
        else context.lineTo(x, yy);
      }
      context.stroke();
    }
    context.globalAlpha = 1;

    this.drawRail(context, stage);
    this.drawStageSign(context, stage);
  }

  drawMountains(context, parallax, baseline, fill) {
    const start = Math.floor(this.cameraX * parallax / 360) * 360 - 720;
    context.fillStyle = fill;
    context.beginPath();
    context.moveTo(-100, this.height);
    for (let x = start; x < this.cameraX * parallax + this.width + 720; x += 120) {
      const sx = x - this.cameraX * parallax;
      const peak = baseline - 90 - hash01(x * 0.07) * 160;
      context.lineTo(sx, baseline);
      context.lineTo(sx + 80, peak);
      context.lineTo(sx + 180, baseline);
    }
    context.lineTo(this.width + 100, this.height);
    context.closePath();
    context.fill();
  }

  drawSkyline(context, parallax, baseline, stage, front = false) {
    const step = front ? 88 : 112;
    const start = Math.floor(this.cameraX * parallax / step) * step - step * 3;
    for (let wx = start; wx < this.cameraX * parallax + this.width + step * 3; wx += step) {
      const sx = wx - this.cameraX * parallax;
      const r = hash01(wx * 0.013 + (front ? 8 : 3));
      const bw = step * (0.55 + r * 0.55);
      const bh = (front ? 130 : 88) + hash01(wx * 0.041) * (front ? 260 : 180);
      const x = sx;
      const y = baseline - bh;
      const fill = front ? 'rgba(24, 38, 77, 0.86)' : 'rgba(18, 28, 60, 0.62)';
      fillRoundRect(context, x, y, bw, bh, front ? 8 : 5, fill);
      context.globalAlpha = front ? 0.82 : 0.48;
      context.fillStyle = hash01(wx) > 0.55 ? stage.accent : stage.glow;
      for (let wy = y + 18; wy < baseline - 16; wy += 28) {
        for (let px = x + 12; px < x + bw - 10; px += 24) {
          if (hash01(px * 2.1 + wy * 1.7) > 0.58) context.fillRect(px, wy, 6, 11);
        }
      }
      context.globalAlpha = 1;
    }
  }

  drawRail(context, stage) {
    const h = this.height;
    const yBase = h * 0.36 + Math.sin(this.time * 0.35) * 6;
    context.save();
    context.globalAlpha = 0.52;
    context.lineWidth = 7;
    context.strokeStyle = stage.glow;
    context.beginPath();
    for (let x = -160; x <= this.width + 160; x += 36) {
      const y = yBase + Math.sin((x + this.cameraX * 0.36) * 0.012) * 46;
      if (x === -160) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    context.lineWidth = 2;
    context.strokeStyle = '#ffffff';
    context.globalAlpha = 0.42;
    context.stroke();
    context.restore();

    // 偶尔驶过一辆轻轨，增强“穿楼”主题。
    const trainX = ((this.time * 150 - this.cameraX * 0.16) % (this.width + 520)) - 260;
    const trainY = yBase + Math.sin((trainX + this.cameraX * 0.36) * 0.012) * 46 - 26;
    context.save();
    context.globalAlpha = 0.82;
    fillRoundRect(context, trainX, trainY, 210, 34, 14, 'rgba(230, 246, 255, 0.84)');
    fillRoundRect(context, trainX + 18, trainY + 8, 46, 14, 5, 'rgba(16, 31, 67, 0.75)');
    fillRoundRect(context, trainX + 78, trainY + 8, 46, 14, 5, 'rgba(16, 31, 67, 0.75)');
    fillRoundRect(context, trainX + 138, trainY + 8, 46, 14, 5, 'rgba(16, 31, 67, 0.75)');
    context.fillStyle = stage.accent;
    context.fillRect(trainX + 8, trainY + 25, 190, 3);
    context.restore();
  }

  drawStageSign(context, stage) {
    const signX = this.width - 210;
    const signY = 112;
    context.save();
    context.globalAlpha = this.state === 'playing' ? 0.9 : 0.72;
    fillRoundRect(context, signX, signY, 162, 52, 16, 'rgba(7, 10, 26, 0.46)');
    strokeRoundRect(context, signX, signY, 162, 52, 16, colorWithAlpha(stage.glow, 0.6), 2);
    context.fillStyle = stage.accent;
    context.font = '800 20px "Microsoft YaHei", sans-serif';
    context.textAlign = 'center';
    context.fillText(stage.sign, signX + 81, signY + 33);
    context.restore();
  }

  drawWorld(context, stage) {
    for (const platform of this.platforms) this.drawPlatform(context, platform, stage);
    for (const coin of this.coins) if (!coin.collected) this.drawCoin(context, coin, stage);
    for (const power of this.powerups) if (!power.collected) this.drawPower(context, power, stage);
    for (const obstacle of this.obstacles) if (!obstacle.destroyed) this.drawObstacle(context, obstacle, stage);
  }

  drawPlatform(context, platform, stage) {
    const x = platform.x - this.cameraX;
    const y = platform.y;
    if (x + platform.w < -120 || x > this.width + 120) return;
    const alpha = platform.alpha ?? 1;
    context.save();
    context.globalAlpha = alpha;
    let topColor = '#394062';
    let sideColor = '#171d38';
    let glow = colorWithAlpha(stage.glow, 0.18);
    if (platform.type === 'rail') { topColor = '#5a617b'; sideColor = '#23283f'; glow = 'rgba(120, 235, 255, 0.22)'; }
    if (platform.type === 'spring') { topColor = '#ffb74b'; sideColor = '#8a3726'; glow = 'rgba(255, 212, 92, 0.36)'; }
    if (platform.type === 'cloud') { topColor = 'rgba(166, 241, 255, 0.72)'; sideColor = 'rgba(45, 102, 128, 0.42)'; glow = 'rgba(144, 246, 255, 0.30)'; }
    if (platform.type === 'lift') { topColor = '#6d59a9'; sideColor = '#25203d'; glow = 'rgba(170, 130, 255, 0.26)'; }
    if (platform.type === 'rope') { topColor = '#7c5a37'; sideColor = '#2b1e16'; glow = 'rgba(255, 215, 140, 0.22)'; }

    context.shadowColor = glow;
    context.shadowBlur = 24;
    fillRoundRect(context, x, y, platform.w, platform.h, 16, topColor);
    context.shadowBlur = 0;
    fillRoundRect(context, x + 8, y + platform.h - 8, platform.w - 16, 24, 12, sideColor);
    context.globalAlpha = alpha * 0.9;
    context.strokeStyle = platform.type === 'spring' ? '#fff3b2' : colorWithAlpha(stage.glow, 0.48);
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x + 18, y + 9);
    context.lineTo(x + platform.w - 18, y + 9);
    context.stroke();

    if (platform.type === 'rail') {
      context.strokeStyle = 'rgba(12, 18, 38, 0.62)';
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(x + 18, y + 18);
      context.lineTo(x + platform.w - 18, y + 18);
      context.moveTo(x + 18, y + 30);
      context.lineTo(x + platform.w - 18, y + 30);
      context.stroke();
      for (let tx = x + 30; tx < x + platform.w - 20; tx += 34) {
        context.fillStyle = 'rgba(255,255,255,0.28)';
        context.fillRect(tx, y + 16, 4, 18);
      }
    }

    if (platform.type === 'spring') {
      context.strokeStyle = '#5b2017';
      context.lineWidth = 3;
      for (let sx = x + 26; sx < x + platform.w - 24; sx += 26) {
        context.beginPath();
        context.moveTo(sx, y + 15);
        context.lineTo(sx + 12, y + 30);
        context.lineTo(sx + 24, y + 15);
        context.stroke();
      }
    }

    if (platform.type === 'cloud') {
      context.globalAlpha = alpha * 0.55;
      context.fillStyle = '#ffffff';
      for (let cx = x + 18; cx < x + platform.w; cx += 38) {
        context.beginPath();
        context.ellipse(cx, y + 8, 28, 18, 0, 0, Math.PI * 2);
        context.fill();
      }
    }

    if (platform.type === 'lift' || platform.type === 'rope') {
      context.globalAlpha = alpha * 0.5;
      context.strokeStyle = platform.type === 'rope' ? 'rgba(255, 230, 170, 0.55)' : colorWithAlpha(stage.glow, 0.55);
      context.lineWidth = 2;
      for (let k = 0; k < 3; k++) {
        context.beginPath();
        context.moveTo(x + 24 + k * 56, y);
        context.lineTo(x + 8 + k * 56, 40);
        context.stroke();
      }
    }
    context.restore();
  }

  drawCoin(context, coin, stage) {
    const x = coin.x - this.cameraX;
    const y = coin.y;
    if (x < -60 || x > this.width + 60) return;
    const big = coin.type === 'big';
    const size = big ? 18 : 12;
    context.save();
    context.translate(x, y);
    context.rotate(Math.sin(coin.spin) * 0.18);
    context.shadowColor = '#ffd45c';
    context.shadowBlur = big ? 18 : 12;
    context.fillStyle = big ? '#ff4545' : '#ff6b31';
    context.beginPath();
    context.moveTo(0, -size);
    context.bezierCurveTo(size * 0.95, -size * 0.55, size * 0.8, size * 0.75, -size * 0.18, size * 1.12);
    context.bezierCurveTo(-size * 0.9, size * 0.52, -size * 0.78, -size * 0.62, 0, -size);
    context.fill();
    context.shadowBlur = 0;
    context.strokeStyle = '#ffd45c';
    context.lineWidth = big ? 3 : 2;
    context.stroke();
    context.strokeStyle = '#60f2a0';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(-2, -size + 1);
    context.quadraticCurveTo(5, -size - 9, 13, -size - 5);
    context.stroke();
    context.restore();
  }

  drawPower(context, power, stage) {
    const x = power.x - this.cameraX;
    const y = power.y;
    if (x < -70 || x > this.width + 70) return;
    const labels = { shield: '盾', magnet: '磁', slow: '慢', boost: '冲' };
    const colors = { shield: '#73f4ff', magnet: '#ffd45c', slow: '#b8a1ff', boost: '#8dffcc' };
    context.save();
    context.translate(x, y);
    context.rotate(power.spin * 0.5);
    context.shadowColor = colors[power.type];
    context.shadowBlur = 20;
    context.fillStyle = 'rgba(8, 13, 30, 0.82)';
    context.beginPath();
    context.arc(0, 0, 22, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = colors[power.type];
    context.lineWidth = 4;
    context.stroke();
    context.rotate(-power.spin * 0.5);
    context.shadowBlur = 0;
    context.fillStyle = colors[power.type];
    context.font = '900 20px "Microsoft YaHei", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(labels[power.type], 0, 1);
    context.restore();
  }

  drawObstacle(context, obstacle, stage) {
    const x = obstacle.x - this.cameraX;
    const y = obstacle.y;
    if (x + obstacle.w < -80 || x > this.width + 80) return;
    context.save();
    if (obstacle.type === 'pepper') {
      context.translate(x + obstacle.w / 2, y + obstacle.h / 2);
      context.shadowColor = '#ff4f6d';
      context.shadowBlur = 12;
      context.fillStyle = '#c71535';
      context.beginPath();
      context.moveTo(0, -24);
      context.lineTo(23, 21);
      context.lineTo(-23, 21);
      context.closePath();
      context.fill();
      context.strokeStyle = '#ffd45c';
      context.lineWidth = 3;
      context.stroke();
      context.fillStyle = '#fff2a8';
      context.fillRect(-4, -4, 8, 18);
    } else if (obstacle.type === 'gate') {
      fillRoundRect(context, x, y, obstacle.w, obstacle.h, 10, 'rgba(10, 12, 28, 0.92)');
      strokeRoundRect(context, x, y, obstacle.w, obstacle.h, 10, '#ff5da8', 3);
      context.fillStyle = '#ffd45c';
      context.font = '900 15px "Microsoft YaHei", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('低空', x + obstacle.w / 2, y + obstacle.h / 2);
      context.strokeStyle = 'rgba(255, 93, 168, 0.6)';
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(x + 12, y + obstacle.h + 2);
      context.lineTo(x + 2, y + obstacle.h + 42);
      context.moveTo(x + obstacle.w - 12, y + obstacle.h + 2);
      context.lineTo(x + obstacle.w - 2, y + obstacle.h + 42);
      context.stroke();
    } else if (obstacle.type === 'drone') {
      context.translate(x + obstacle.w / 2, y + obstacle.h / 2);
      context.fillStyle = '#202943';
      context.shadowColor = stage.glow;
      context.shadowBlur = 14;
      fillRoundRect(context, -22, -14, 44, 28, 12, '#202943');
      context.fillStyle = '#ff4f6d';
      context.beginPath();
      context.arc(0, 0, 5, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#cbd7ff';
      context.lineWidth = 3;
      for (const sx of [-32, 32]) {
        context.beginPath();
        context.arc(sx, -12, 11 + Math.sin(obstacle.t * 20) * 2, 0, Math.PI * 2);
        context.stroke();
        context.beginPath();
        context.arc(sx, 12, 11 - Math.sin(obstacle.t * 20) * 2, 0, Math.PI * 2);
        context.stroke();
      }
    } else if (obstacle.type === 'steam') {
      const active = obstacle.hot;
      context.globalAlpha = active ? 0.82 : 0.28;
      const grad = context.createLinearGradient(x, y, x, y + obstacle.h);
      grad.addColorStop(0, active ? 'rgba(255, 96, 86, 0.82)' : 'rgba(180, 230, 255, 0.42)');
      grad.addColorStop(1, 'rgba(255, 212, 92, 0.08)');
      context.fillStyle = grad;
      for (let i = 0; i < 3; i++) {
        context.beginPath();
        const cx = x + obstacle.w * (0.26 + i * 0.24) + Math.sin(this.time * 5 + i) * 5;
        context.ellipse(cx, y + obstacle.h * 0.5, 12, obstacle.h * 0.5, 0, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      context.fillStyle = '#4a1e1a';
      fillRoundRect(context, x + 5, y + obstacle.h - 14, obstacle.w - 10, 18, 7, '#4a1e1a');
    }
    context.restore();
  }

  drawParticles(context) {
    context.save();
    for (const particle of this.particles) {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      const x = particle.x - (particle.kind === 'mist' ? this.cameraX * 0.08 : this.cameraX);
      const y = particle.y;
      if (x < -80 || x > this.width + 80 || y < -100 || y > this.height + 120) continue;
      context.globalAlpha = alpha;
      context.fillStyle = particle.color;
      if (particle.kind === 'mist') {
        context.beginPath();
        context.ellipse(x, y, particle.size * 9, particle.size * 2.6, 0, 0, Math.PI * 2);
        context.fill();
      } else {
        context.beginPath();
        context.arc(x, y, particle.size * (0.6 + alpha * 0.7), 0, Math.PI * 2);
        context.fill();
      }
    }
    for (const text of this.floatTexts) {
      const alpha = clamp(text.life / text.maxLife, 0, 1);
      const x = text.x - this.cameraX;
      const y = text.y;
      context.globalAlpha = alpha;
      context.fillStyle = text.color;
      context.font = '900 18px "Microsoft YaHei", sans-serif';
      context.textAlign = 'center';
      context.strokeStyle = 'rgba(0,0,0,0.58)';
      context.lineWidth = 4;
      context.strokeText(text.text, x, y);
      context.fillText(text.text, x, y);
    }
    context.restore();
  }

  drawPlayer(context, stage) {
    const skin = this.selectedSkin || SKINS[selectedSkinIndex];
    const img = assets.images.get(skin.file);
    const p = this.player || {
      x: this.cameraX + this.width * 0.52,
      y: this.floorY() - 102 + Math.sin(this.previewGooseBob * 2) * 8,
      w: 68,
      h: 96,
      vx: 0,
      vy: 0,
      grounded: true,
      dashTime: 0,
      invuln: 0,
      shield: 0,
      magnet: 0,
      slow: 0,
      boost: 0,
      sliding: false,
    };
    const x = p.x - this.cameraX;
    const y = p.y;
    if (x < -120 || x > this.width + 120) return;
    context.save();
    context.globalAlpha = p.invuln > 0 && Math.sin(this.time * 30) > 0.45 ? 0.55 : 1;

    // 阴影
    context.fillStyle = 'rgba(0, 0, 0, 0.38)';
    context.beginPath();
    context.ellipse(x + p.w / 2, y + p.h + 8, p.w * (p.sliding ? 0.88 : 0.72), 13, 0, 0, Math.PI * 2);
    context.fill();

    if (p.shield > 0 || p.dashTime > 0) {
      context.save();
      context.globalAlpha = p.dashTime > 0 ? 0.55 : 0.38 + Math.sin(this.time * 8) * 0.08;
      context.strokeStyle = p.dashTime > 0 ? '#ffd45c' : '#64e9ff';
      context.lineWidth = 4;
      context.shadowColor = context.strokeStyle;
      context.shadowBlur = 24;
      context.beginPath();
      context.ellipse(x + p.w / 2, y + p.h / 2, p.w * 0.82, p.h * 0.62, 0, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }

    if (p.magnet > 0) {
      context.save();
      context.globalAlpha = 0.16 + Math.sin(this.time * 5) * 0.04;
      context.strokeStyle = '#ffd45c';
      context.lineWidth = 2;
      context.beginPath();
      context.arc(x + p.w / 2, y + p.h / 2, 122, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }

    const drawH = p.sliding ? 84 : 116;
    const aspect = img ? img.width / img.height : 0.78;
    const drawW = drawH * aspect;
    const bob = p.grounded ? Math.sin(this.time * 13) * 2.2 : 0;
    const lean = p.dashTime > 0 ? -0.18 : clamp(p.vy / 1800, -0.24, 0.24);
    const squashY = p.grounded ? 1 + Math.sin(this.time * 13) * 0.018 : 1;
    const squashX = p.grounded ? 1 - Math.sin(this.time * 13) * 0.012 : 1;

    if (p.dashTime > 0 && img) {
      context.save();
      for (let i = 1; i <= 4; i++) {
        context.globalAlpha = 0.12 - i * 0.018;
        context.translate(0, 0);
        context.drawImage(img, x + p.w / 2 - drawW / 2 - i * 28, y + p.h - drawH + bob - 4, drawW, drawH);
      }
      context.restore();
    }

    context.translate(x + p.w / 2, y + p.h - drawH * 0.48 + bob);
    context.rotate(p.sliding ? -0.18 : lean);
    context.scale(squashX, squashY);
    if (img) {
      context.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      this.drawFallbackGoose(context, drawW, drawH, stage);
    }
    context.restore();
  }

  drawFallbackGoose(context, w, h, stage) {
    context.fillStyle = '#151515';
    context.beginPath();
    context.ellipse(0, 0, w * 0.34, h * 0.42, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ff9d32';
    context.beginPath();
    context.ellipse(0, h * 0.02, w * 0.28, h * 0.1, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(-w * 0.12, -h * 0.1, w * 0.08, 0, Math.PI * 2);
    context.arc(w * 0.12, -h * 0.1, w * 0.08, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#1b1b1b';
    context.beginPath();
    context.arc(-w * 0.1, -h * 0.1, w * 0.035, 0, Math.PI * 2);
    context.arc(w * 0.1, -h * 0.1, w * 0.035, 0, Math.PI * 2);
    context.fill();
  }

  drawForeground(context, stage) {
    context.save();
    // 速度线
    if (this.state === 'playing' && this.speed > 360) {
      const alpha = invLerp(360, 610, this.speed) * 0.34;
      context.globalAlpha = alpha;
      context.strokeStyle = stage.accent;
      context.lineWidth = 2;
      for (let i = 0; i < 30; i++) {
        const y = hash01(i * 7 + Math.floor(this.time * 2)) * this.height;
        const x = ((hash01(i * 13) * this.width - this.time * this.speed * (0.4 + hash01(i))) % (this.width + 200)) - 100;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 50 + hash01(i) * 100, y - 5);
        context.stroke();
      }
    }

    // 底部雾气
    const fog = context.createLinearGradient(0, this.height * 0.72, 0, this.height);
    fog.addColorStop(0, 'rgba(255,255,255,0)');
    fog.addColorStop(1, 'rgba(210,240,255,0.16)');
    context.globalAlpha = 1;
    context.fillStyle = fog;
    context.fillRect(0, this.height * 0.68, this.width, this.height * 0.32);
    context.restore();
  }

  drawPauseOverlay(context) {
    context.save();
    context.fillStyle = 'rgba(0, 0, 0, 0.35)';
    context.fillRect(0, 0, this.width, this.height);
    context.fillStyle = '#fff8e6';
    context.font = '900 54px "Microsoft YaHei", sans-serif';
    context.textAlign = 'center';
    context.fillText('暂停中', this.width / 2, this.height / 2 - 24);
    context.font = '600 20px "Microsoft YaHei", sans-serif';
    context.fillStyle = 'rgba(255,248,230,0.75)';
    context.fillText('按 P / Esc 继续，或点击右上角暂停键', this.width / 2, this.height / 2 + 24);
    context.restore();
  }
}

const game = new Game();

function updateMenuRecords(record = game.record) {
  ui.bestScore.textContent = formatNumber(record.score || 0);
  ui.bestDistance.textContent = `${Math.floor(record.distance || 0)}m`;
  ui.bestCombo.textContent = `${Math.floor(record.combo || 0)}x`;
}

function updateSkinUI() {
  selectedSkinIndex = (selectedSkinIndex + SKINS.length) % SKINS.length;
  const skin = SKINS[selectedSkinIndex];
  game.selectedSkin = skin;
  ui.skinPreview.src = `./assets/characters/${skin.file}`;
  ui.skinPreview.alt = skin.name;
  ui.skinName.textContent = skin.name;
  ui.skinTrait.textContent = skin.trait;
  localStorage.setItem('wudu-goose-selected-skin', String(selectedSkinIndex));
}

function setPlayingUI(playing) {
  ui.menu.classList.toggle('hidden', playing);
  ui.hud.classList.toggle('hidden', !playing);
  ui.pauseBtn.classList.toggle('hidden', !playing);
  ui.touchControls.classList.toggle('hidden', !(playing && isTouchDevice));
}

function showModal(node) {
  node.classList.remove('hidden');
}

function hideModal(node) {
  node.classList.add('hidden');
}

function startFromMenu() {
  hideModal(ui.helpPanel);
  hideModal(ui.gameOver);
  ui.loading.classList.add('hidden');
  game.start();
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  logicalWidth = window.innerWidth;
  logicalHeight = window.innerHeight;
  canvas.width = Math.floor(logicalWidth * dpr);
  canvas.height = Math.floor(logicalHeight * dpr);
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  game.resize(logicalWidth, logicalHeight);
}

function renderFrame(now) {
  if (!renderFrame.last) renderFrame.last = now;
  const dt = (now - renderFrame.last) / 1000;
  renderFrame.last = now;
  game.update(dt);
  game.draw(ctx);
  requestAnimationFrame(renderFrame);
}

function bindInputs() {
  const preventCodes = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  window.addEventListener('keydown', (event) => {
    if (preventCodes.has(event.code)) event.preventDefault();
    if (event.code === 'KeyP' || event.code === 'Escape') {
      game.togglePause();
      return;
    }
    if (game.state === 'menu' && (event.code === 'Enter' || event.code === 'Space')) {
      startFromMenu();
      return;
    }
    if (game.state !== 'playing') return;
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') input.left = true;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') input.right = true;
    if (event.code === 'ArrowDown' || event.code === 'KeyS') input.down = true;
    if (!event.repeat && (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW')) game.requestJump();
    if (!event.repeat && (event.code === 'ShiftLeft' || event.code === 'ShiftRight' || event.code === 'KeyJ')) game.requestDash();
  }, { passive: false });

  window.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') input.left = false;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') input.right = false;
    if (event.code === 'ArrowDown' || event.code === 'KeyS') input.down = false;
  });

  let pointerStart = null;
  canvas.addEventListener('pointerdown', (event) => {
    if (game.state === 'menu') return;
    pointerStart = { x: event.clientX, y: event.clientY, time: performance.now() };
    if (game.state === 'playing') sound.init();
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!pointerStart || game.state !== 'playing') return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    const dt = performance.now() - pointerStart.time;
    pointerStart = null;
    if (Math.abs(dy) > 36 && Math.abs(dy) > Math.abs(dx) * 1.15) {
      if (dy < 0) game.requestJump();
      else {
        input.down = true;
        setTimeout(() => { input.down = false; }, 260);
      }
    } else if (Math.abs(dx) > 72 && dt < 420) {
      game.requestDash();
    } else {
      game.requestJump();
    }
  });

  ui.touchControls.addEventListener('pointerdown', (event) => {
    const button = event.target.closest('button[data-touch]');
    if (!button || game.state !== 'playing') return;
    event.preventDefault();
    const action = button.dataset.touch;
    sound.init();
    if (action === 'jump') game.requestJump();
    if (action === 'dash') game.requestDash();
    if (action === 'slide') input.down = true;
  });
  ui.touchControls.addEventListener('pointerup', (event) => {
    const button = event.target.closest('button[data-touch]');
    if (button?.dataset.touch === 'slide') input.down = false;
  });
  ui.touchControls.addEventListener('pointercancel', () => { input.down = false; });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state === 'playing') game.pause();
  });
}

function bindUI() {
  ui.startBtn.addEventListener('click', startFromMenu);
  ui.restartBtn.addEventListener('click', startFromMenu);
  ui.backMenuBtn.addEventListener('click', () => game.goMenu());
  ui.howBtn.addEventListener('click', () => showModal(ui.helpPanel));
  ui.pauseBtn.addEventListener('click', () => game.togglePause());
  ui.soundBtn.addEventListener('click', () => sound.toggle());
  ui.prevSkin.addEventListener('click', () => { selectedSkinIndex -= 1; updateSkinUI(); });
  ui.nextSkin.addEventListener('click', () => { selectedSkinIndex += 1; updateSkinUI(); });
  ui.randomSkinBtn.addEventListener('click', () => { selectedSkinIndex = Math.floor(Math.random() * SKINS.length); updateSkinUI(); });
  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => hideModal($(`#${button.dataset.close}`)));
  });
}

async function loadAssets() {
  const total = SKINS.length;
  let loaded = 0;
  const promises = SKINS.map((skin) => new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      assets.images.set(skin.file, image);
      loaded += 1;
      const progress = Math.floor((loaded / total) * 100);
      ui.loadBar.style.width = `${progress}%`;
      ui.loadText.textContent = `加载角色素材 ${progress}%`;
      resolve();
    };
    image.onerror = () => {
      loaded += 1;
      resolve();
    };
    image.src = `./assets/characters/${skin.file}`;
  }));
  await Promise.all(promises);
}

async function boot() {
  resizeCanvas();
  bindUI();
  bindInputs();
  updateMenuRecords(game.record);
  updateSkinUI();
  requestAnimationFrame(renderFrame);
  await loadAssets();
  ui.loading.classList.add('hidden');
  ui.menu.classList.remove('hidden');
  game.state = 'menu';
  updateSkinUI();
}

window.addEventListener('resize', resizeCanvas);
boot();
