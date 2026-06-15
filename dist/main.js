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
  modeBtns: [...document.querySelectorAll('[data-mode]')],
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
  missionWrap: $('#missionWrap'),
  missionLabel: $('#missionLabel'),
  missionText: $('#missionText'),
  threatMeter: $('#threatMeter'),
  badgeLine: $('#badgeLine'),
  bestScore: $('#bestScore'),
  bestDistance: $('#bestDistance'),
  bestCombo: $('#bestCombo'),
  bestScoreLabel: $('#bestScoreLabel'),
  bestDistanceLabel: $('#bestDistanceLabel'),
  bestComboLabel: $('#bestComboLabel'),
  finalScore: $('#finalScore'),
  finalDistance: $('#finalDistance'),
  finalCombo: $('#finalCombo'),
  finalChili: $('#finalChili'),
  overReason: $('#overReason'),
  recordLine: $('#recordLine'),
  overTitle: $('#overTitle'),
  shareBtn: $('#shareBtn'),
  skinPreview: $('#skinPreview'),
  skinName: $('#skinName'),
  skinTrait: $('#skinTrait'),
  prevSkin: $('#prevSkin'),
  nextSkin: $('#nextSkin'),
  randomSkinBtn: $('#randomSkinBtn'),
  touchControls: $('#touchControls'),
};

const LEGACY_STORAGE_KEY = 'wudu-goose-runner-record-v1';
const STORAGE_KEY = 'wudu-goose-runner-record-v2';
const SETTINGS_KEY = 'wudu-goose-runner-settings-v1';
const MODE_KEY = 'wudu-goose-selected-mode';
const isTouchDevice = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

const GAME_MODES = {
  endless: {
    id: 'endless',
    name: '无尽跑酷',
    startText: '开始无尽',
    badge: '无尽跑酷：活得越久，连击越高，分数越夸张。',
    baseSpeed: 292,
    speedGrowth: 0.09,
    maxSpeed: 610,
    difficultyStart: 0,
    difficultyScale: 1650,
    difficultyMax: 1.6,
    hpBase: 3,
  },
  extreme: {
    id: 'extreme',
    name: '极限跑酷',
    startText: '挑战极限',
    badge: '极限跑酷：1888m 追击关卡，别让鹅追击值涨满！',
    baseSpeed: 326,
    speedGrowth: 0.12,
    maxSpeed: 675,
    difficultyStart: 0.42,
    difficultyScale: 1040,
    difficultyMax: 2.18,
    hpBase: 2,
    finishDistance: 1888,
    initialThreat: 18,
    gates: [
      { distance: 320, name: '轻轨穿楼', bonus: 320 },
      { distance: 690, name: '洪崖洞低空', bonus: 420 },
      { distance: 1050, name: '索道急坠', bonus: 520 },
      { distance: 1420, name: '火锅蒸汽阵', bonus: 620 },
      { distance: 1710, name: '解放碑终点冲刺', bonus: 800 },
    ],
  },
};

const MEDAL_RANK = { '未通关': 0, B: 1, A: 2, S: 3, SS: 4, SSS: 5 };
let selectedMode = localStorage.getItem(MODE_KEY) || 'endless';
if (!GAME_MODES[selectedMode]) selectedMode = 'endless';

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

function seedFromString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
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

function defaultRecord() {
  const skin = SKINS[selectedSkinIndex]?.id || '18';
  return {
    endless: { score: 0, distance: 0, combo: 0, skin },
    extreme: { score: 0, distance: 0, combo: 0, bestTime: null, medal: '未通关', clears: 0, skin, ghost: [] },
  };
}

function normalizeRecord(raw = {}) {
  const base = defaultRecord();
  const legacyLooksFlat = raw && ('score' in raw || 'distance' in raw || 'combo' in raw) && !raw.endless;
  const merged = {
    endless: { ...base.endless, ...(legacyLooksFlat ? raw : raw.endless || {}) },
    extreme: { ...base.extreme, ...(raw.extreme || {}) },
  };
  if (!Array.isArray(merged.extreme.ghost)) merged.extreme.ghost = [];
  if (!Number.isFinite(merged.extreme.bestTime)) merged.extreme.bestTime = null;
  if (!MEDAL_RANK[merged.extreme.medal]) merged.extreme.medal = '未通关';
  return merged;
}

function loadRecord() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved) return normalizeRecord(saved);
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null');
    return normalizeRecord(legacy || {});
  } catch {
    return defaultRecord();
  }
}

function saveRecord(record) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeRecord(record)));
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '--';
  return `${seconds.toFixed(2)}s`;
}

function compressGhostTrack(track) {
  if (!Array.isArray(track) || !track.length) return [];
  const result = [];
  let lastTime = -999;
  for (const point of track) {
    if (!Number.isFinite(point.t) || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    if (point.t - lastTime < 0.18 && result.length) continue;
    result.push({ t: +point.t.toFixed(2), x: Math.round(point.x), y: Math.round(point.y) });
    lastTime = point.t;
    if (result.length >= 380) break;
  }
  return result;
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
    this.mode = selectedMode;
    this.modeConfig = GAME_MODES[this.mode];
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
    this.extreme = null;
    this.ghostTrack = [];
    this.ghostSampleTimer = 0;
    this.lastSummary = '';
    this.won = false;
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
    this.mode = selectedMode;
    this.modeConfig = GAME_MODES[this.mode];
    const today = new Date();
    const dayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const seed = this.mode === 'extreme'
      ? seedFromString(`extreme-${dayKey}-${selectedSkinIndex}`)
      : (Date.now() ^ Math.floor(Math.random() * 0xFFFFFFFF)) >>> 0;
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
    this.speed = this.modeConfig.baseSpeed;
    this.difficulty = this.modeConfig.difficultyStart;
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
    this.extreme = null;
    this.ghostTrack = [];
    this.ghostSampleTimer = 0;
    this.lastSummary = '';
    this.won = false;

    if (this.mode === 'extreme') {
      const record = this.record.extreme || {};
      this.extreme = {
        time: 0,
        threat: this.modeConfig.initialThreat,
        finishDistance: this.modeConfig.finishDistance,
        nextGate: 0,
        gates: this.modeConfig.gates.map((gate) => ({ ...gate, x: gate.distance * 10, done: false })),
        ghost: Array.isArray(record.ghost) ? record.ghost : [],
        bestTime: record.bestTime || null,
      };
    }

    const baseY = this.floorY();
    const hp = this.modeConfig.hpBase + (this.selectedSkin.mod.hp || 0);
    this.player = {
      x: 160,
      y: baseY - 86,
      prevX: 160,
      prevY: baseY - 86,
      w: 56,
      h: 86,
      baseH: 86,
      vx: this.mode === 'extreme' ? 338 : 300,
      vy: 0,
      grounded: true,
      coyote: 0.1,
      jumps: 0,
      hp,
      maxHp: hp,
      invuln: this.mode === 'extreme' ? 0.9 : 1.1,
      dashCharge: clamp((this.mode === 'extreme' ? 34 : 22) + (this.selectedSkin.mod.dashStart || 0), 0, 100),
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

    const startPlatform = { x: -120, y: baseY, w: this.mode === 'extreme' ? 880 : 980, h: 52, type: 'rail', id: this.nextPlatformId++, alpha: 1 };
    this.platforms.push(startPlatform);
    this.lastPlatform = startPlatform;
    this.addCoinLine(300, baseY - 100, 720, baseY - 120, this.mode === 'extreme' ? 8 : 6, 'chili');
    if (this.mode === 'extreme') {
      this.powerups.push({ type: 'shield', x: 760, y: baseY - 150, baseY: baseY - 150, phase: 0.5, spin: 0 });
    }
    this.generateUntil(this.width + 1800);
    this.showBadge(this.modeConfig.badge);
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
    const cfg = this.modeConfig || GAME_MODES.endless;
    this.difficulty = clamp(cfg.difficultyStart + this.distanceMeters / cfg.difficultyScale + (this.mode === 'extreme' ? (this.extreme?.time || 0) / 120 : 0), cfg.difficultyStart, cfg.difficultyMax);
    const nextStage = this.stageForDistance(this.distanceMeters);
    if (nextStage !== this.stageIndex) {
      this.stageIndex = nextStage;
      this.showBadge(`进入「${this.currentStage().name}」：机关密度上升`);
      this.addBurst(p.x, p.y + 20, 36, this.currentStage().glow);
    }

    const slowFactor = p.slow > 0 ? 0.68 : 1;
    const boostFactor = p.boost > 0 ? 1.16 : 1;
    const tensionFactor = this.mode === 'extreme' ? 1 + (this.extreme?.threat || 0) * 0.0016 : 1;
    this.speed = (cfg.baseSpeed + this.distanceMeters * cfg.speedGrowth + Math.sin(this.time * 0.9) * 6) * slowFactor * boostFactor * tensionFactor;
    this.speed = clamp(this.speed, 260, cfg.maxSpeed);

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
    this.score += safeDt * (this.speed * 0.11 + Math.max(0, this.combo) * 0.7) * (this.mode === 'extreme' ? 1.12 : 1);

    if (this.combo > 0) {
      const grace = 1.95 + (this.selectedSkin.mod.comboGrace || 0);
      this.comboTimer = Math.max(0, this.comboTimer - safeDt);
      if (this.comboTimer <= 0) this.combo = 0;
      else this.comboTimer = Math.min(this.comboTimer, grace);
    }

    this.updateExtreme(safeDt);
    if (this.state !== 'playing') {
      this.syncHud();
      return;
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

  updateExtreme(dt) {
    if (this.mode !== 'extreme' || !this.extreme || !this.player || this.state !== 'playing') return;
    const e = this.extreme;
    const p = this.player;
    e.time += dt;
    e.threat += dt * (2.05 + this.difficulty * 1.35);
    if (p.dashTime > 0) e.threat -= dt * 10.5;
    if (p.boost > 0) e.threat -= dt * 3.4;
    if (this.combo >= 10) e.threat -= dt * Math.min(5.2, this.combo * 0.075);
    e.threat = clamp(e.threat, 0, 100);

    this.ghostSampleTimer += dt;
    if (this.ghostSampleTimer >= 0.2) {
      this.ghostSampleTimer = 0;
      this.ghostTrack.push({ t: e.time, x: p.x, y: p.y });
    }

    while (e.nextGate < e.gates.length && this.distanceMeters >= e.gates[e.nextGate].distance) {
      const gate = e.gates[e.nextGate];
      gate.done = true;
      e.nextGate += 1;
      e.threat = clamp(e.threat - 18, 0, 100);
      p.dashCharge = clamp(p.dashCharge + 22, 0, 100);
      this.addScore(gate.bonus, 'gate');
      this.increaseCombo(4);
      this.showBadge(`突破检查点「${gate.name}」 +${gate.bonus}，追击值下降`);
      this.showFloatText(p.x + 80, p.y - 34, `CHECKPOINT +${gate.bonus}`, '#8dffcc');
      this.addBurst(p.x + p.w / 2, p.y + p.h / 2, 42, '#8dffcc');
      sound.power();
    }

    if (this.distanceMeters >= e.finishDistance) {
      this.completeExtreme();
      return;
    }
    if (e.threat >= 100) this.end('身后的暴走鹅追上来了：极限模式要用冲刺、辣椒和连击压低追击值。');
  }

  completeExtreme() {
    if (this.state !== 'playing' || this.mode !== 'extreme' || !this.extreme) return;
    const e = this.extreme;
    e.threat = 0;
    const timeBonus = Math.max(420, 2300 - e.time * 18);
    const survivalBonus = (this.player?.hp || 0) * 360;
    this.addScore(timeBonus + survivalBonus, 'finish');
    this.won = true;
    const medal = this.extremeMedal();
    this.addBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, 72, '#ffd45c');
    this.end(`极限通关！用时 ${formatTime(e.time)}，评级 ${medal}。`, { won: true, medal });
  }

  extremeMedal() {
    if (this.mode !== 'extreme' || !this.extreme) return '未通关';
    const time = this.extreme.time;
    const hp = this.player?.hp || 0;
    const combo = this.maxCombo || 0;
    const threat = this.extreme.threat || 0;
    if (time <= 55 && hp >= 2 && combo >= 34 && threat < 42) return 'SSS';
    if (time <= 64 && hp >= 1 && combo >= 25 && threat < 58) return 'SS';
    if (time <= 74 && combo >= 16) return 'S';
    if (time <= 88) return 'A';
    return 'B';
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
    if (this.mode === 'extreme' && this.extreme) this.extreme.threat = clamp(this.extreme.threat - 0.9 * mult, 0, 100);
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
    if (this.mode === 'extreme' && this.extreme) this.extreme.threat = clamp(this.extreme.threat - 8, 0, 100);
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
    if (this.mode === 'extreme' && this.extreme) this.extreme.threat = clamp(this.extreme.threat - 5, 0, 100);
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
    if (this.mode === 'extreme' && this.extreme) this.extreme.threat = clamp(this.extreme.threat + 18, 0, 100);
    this.addBurst(p.x + p.w / 2, p.y + p.h / 2, 30, '#ff4f6d');
    this.showBadge(`受击！剩余生命 ${Math.max(0, p.hp)}：${reason}`);
    sound.hit();
    if (p.hp <= 0) this.end(reason);
  }

  end(reason, options = {}) {
    if (this.state === 'gameover') return;
    const won = Boolean(options.won);
    this.state = 'gameover';
    setPlayingUI(false);
    if (this.player) this.addBurst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, won ? 58 : 44, won ? '#ffd45c' : '#ff4f6d');
    if (won) sound.power();
    else sound.over();

    const finalScore = Math.floor(this.score);
    const finalDistance = Math.floor(this.distanceMeters);
    const finalCombo = Math.floor(this.maxCombo);
    const record = normalizeRecord(this.record);
    const bucket = record[this.mode] || record.endless;
    let lines = [];

    if (finalScore > (bucket.score || 0)) { bucket.score = finalScore; lines.push('分数新纪录'); }
    if (finalDistance > (bucket.distance || 0)) { bucket.distance = finalDistance; lines.push('距离新纪录'); }
    if (finalCombo > (bucket.combo || 0)) { bucket.combo = finalCombo; lines.push('连击新纪录'); }
    bucket.skin = this.selectedSkin.id;

    let recordLine = lines.length ? `恭喜：${lines.join('、')}！` : `最佳分数 ${formatNumber(bucket.score || 0)}，继续挑战连击路线。`;
    if (this.mode === 'extreme') {
      const runTime = this.extreme?.time || 0;
      const medal = options.medal || (won ? this.extremeMedal() : '未通关');
      const track = compressGhostTrack(this.ghostTrack);
      const previousBestTime = bucket.bestTime;
      const previousDistance = bucket.distance || 0;
      if (won) {
        bucket.clears = (bucket.clears || 0) + 1;
        if (!previousBestTime || runTime < previousBestTime) {
          bucket.bestTime = runTime;
          lines.push('通关用时新纪录');
        }
        if (MEDAL_RANK[medal] > MEDAL_RANK[bucket.medal || '未通关']) {
          bucket.medal = medal;
          lines.push(`最高评级 ${medal}`);
        }
      }
      const shouldSaveGhost = track.length && (
        (won && (!previousBestTime || runTime <= previousBestTime || !bucket.ghost?.length)) ||
        (!won && finalDistance >= previousDistance && finalDistance > 180) ||
        (!bucket.ghost?.length && finalDistance > 240)
      );
      if (shouldSaveGhost) {
        bucket.ghost = track;
        lines.push('幽灵影子已保存');
      }
      recordLine = won
        ? `极限用时 ${formatTime(runTime)}，评级 ${medal}。${lines.length ? lines.join('、') : '继续压缩通关路线！'}`
        : `极限进度 ${finalDistance}/${this.modeConfig.finishDistance}m，追击值 ${Math.floor(this.extreme?.threat || 0)}%。${lines.length ? lines.join('、') : '冲刺和连击能压低追击值。'}`;
      bucket.lastRun = { score: finalScore, distance: finalDistance, combo: finalCombo, time: +runTime.toFixed(2), medal, won };
    }

    record[this.mode] = bucket;
    this.record = record;
    saveRecord(this.record);
    updateMenuRecords(this.record);

    ui.overTitle.textContent = this.mode === 'extreme' ? (won ? '极限通关！' : '极限挑战结束') : '本轮飞升结束';
    ui.finalScore.textContent = formatNumber(finalScore);
    ui.finalDistance.textContent = `${finalDistance}m`;
    ui.finalCombo.textContent = `${finalCombo}x`;
    ui.finalChili.textContent = formatNumber(this.chili);
    ui.overReason.textContent = reason || (won ? '你甩开了身后的暴走鹅。' : '鹅被雾都地形教育了。');
    ui.recordLine.textContent = recordLine;

    const modeName = GAME_MODES[this.mode]?.name || '跑酷';
    this.lastSummary = this.mode === 'extreme'
      ? `雾都飞升：暴走鹅跑酷｜${modeName}｜${won ? '通关' : '挑战'}｜分数 ${finalScore}｜距离 ${finalDistance}m｜用时 ${formatTime(this.extreme?.time || 0)}｜最高连击 ${finalCombo}x｜辣椒 ${this.chili}`
      : `雾都飞升：暴走鹅跑酷｜${modeName}｜分数 ${finalScore}｜距离 ${finalDistance}m｜最高连击 ${finalCombo}x｜辣椒 ${this.chili}`;
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
    const diff = clamp(this.difficulty, 0, this.mode === 'extreme' ? 2.18 : 1.65);
    const prevEnd = prev.x + prev.w;
    let gap = randRange(rng, 96 + diff * 30, 210 + diff * 58);
    let width = randRange(rng, 220 - diff * 42, 450 - diff * 82);
    if (this.mode === 'extreme') {
      gap *= randRange(rng, 0.96, 1.12);
      width *= randRange(rng, 0.84, 0.96);
    }
    width = clamp(width, this.mode === 'extreme' ? 118 : 132, 480);
    const minY = this.topY();
    const maxY = this.floorY();
    let y = clamp(prev.y + randRange(rng, -118, 94), minY, maxY);
    if (y < prev.y - 86) gap *= 0.84;
    if (prev.type === 'spring') gap *= 1.14;

    let type = choose(rng, CHUNK_TYPES);
    if (this.mode === 'extreme' && this.distanceMeters > 420 && rng() < 0.18) type = choose(rng, ['cloud', 'lift', 'rope', 'spring']);
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
    const minObstacleX = this.mode === 'extreme' ? 820 : 1100;
    if (platform.x < minObstacleX || platform.w < 150) return;
    const chance = this.mode === 'extreme' ? 0.40 + diff * 0.24 : 0.26 + diff * 0.28;
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
    const minPowerX = this.mode === 'extreme' ? 900 : 1200;
    const chance = this.mode === 'extreme' ? 0.125 + diff * 0.028 : 0.105 + diff * 0.025;
    if (platform.x < minPowerX || rng() > chance) return;
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
    if (this.mode === 'extreme' && this.extreme && this.state !== 'menu') {
      const remain = Math.max(0, this.extreme.finishDistance - Math.floor(this.distanceMeters || 0));
      ui.missionWrap.classList.remove('hidden');
      ui.missionLabel.textContent = '极限追击';
      ui.missionText.textContent = `${formatTime(this.extreme.time)} · 剩 ${remain}m`;
      ui.threatMeter.style.width = `${Math.floor(this.extreme.threat || 0)}%`;
    } else {
      ui.missionWrap.classList.add('hidden');
      ui.threatMeter.style.width = '0%';
    }
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
    this.drawGhost(context, stage);
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
    this.drawExtremeMarkers(context, stage);
    for (const coin of this.coins) if (!coin.collected) this.drawCoin(context, coin, stage);
    for (const power of this.powerups) if (!power.collected) this.drawPower(context, power, stage);
    for (const obstacle of this.obstacles) if (!obstacle.destroyed) this.drawObstacle(context, obstacle, stage);
  }

  drawExtremeMarkers(context, stage) {
    if (this.mode !== 'extreme' || !this.extreme) return;
    const markers = [
      ...this.extreme.gates,
      { x: this.extreme.finishDistance * 10, name: '极限终点', distance: this.extreme.finishDistance, finish: true },
    ];
    context.save();
    for (const marker of markers) {
      const x = marker.x - this.cameraX;
      if (x < -120 || x > this.width + 140) continue;
      const top = this.topY() - 34;
      const bottom = this.floorY() + 20;
      const color = marker.finish ? '#ffd45c' : (marker.done ? '#8dffcc' : stage.glow);
      context.globalAlpha = marker.done ? 0.42 : 0.86;
      context.strokeStyle = color;
      context.lineWidth = marker.finish ? 5 : 3;
      context.setLineDash(marker.finish ? [] : [10, 8]);
      context.beginPath();
      context.moveTo(x, top);
      context.lineTo(x, bottom);
      context.stroke();
      context.setLineDash([]);
      fillRoundRect(context, x - 72, top - 28, 144, 36, 16, marker.finish ? 'rgba(255, 212, 92, 0.22)' : 'rgba(8, 12, 30, 0.72)');
      strokeRoundRect(context, x - 72, top - 28, 144, 36, 16, colorWithAlpha(color, 0.74), 2);
      context.fillStyle = marker.finish ? '#fff3ad' : color;
      context.font = '900 15px "Microsoft YaHei", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(marker.finish ? '终点 1888m' : marker.name, x, top - 10);
    }

    const p = this.player;
    if (p) {
      const threat = this.extreme.threat || 0;
      const chaseX = p.x - (360 - threat * 2.25) - this.cameraX;
      if (chaseX > -160 && chaseX < this.width + 80) {
        const chaseY = p.y + p.h * 0.5;
        context.globalAlpha = 0.2 + threat * 0.004;
        context.shadowColor = '#ff4f6d';
        context.shadowBlur = 26;
        context.fillStyle = 'rgba(7, 5, 12, 0.86)';
        context.beginPath();
        context.ellipse(chaseX, chaseY + 8, 52, 66, -0.1, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#ff4f6d';
        context.beginPath();
        context.arc(chaseX - 15, chaseY - 10, 7, 0, Math.PI * 2);
        context.arc(chaseX + 15, chaseY - 10, 7, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
        context.font = '900 16px "Microsoft YaHei", sans-serif';
        context.textAlign = 'center';
        context.fillText('别回头', chaseX, chaseY - 68);
      }
    }
    context.restore();
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

  drawGhost(context, stage) {
    if (this.mode !== 'extreme' || !this.extreme || !Array.isArray(this.extreme.ghost) || this.extreme.ghost.length < 2) return;
    const track = this.extreme.ghost;
    const t = this.extreme.time;
    if (t < track[0].t || t > track[track.length - 1].t + 0.4) return;
    let hi = track.findIndex((point) => point.t >= t);
    if (hi <= 0) hi = 1;
    const p0 = track[hi - 1];
    const p1 = track[Math.min(hi, track.length - 1)];
    const mix = invLerp(p0.t, p1.t, t);
    const worldX = lerp(p0.x, p1.x, mix);
    const y = lerp(p0.y, p1.y, mix);
    const x = worldX - this.cameraX;
    if (x < -120 || x > this.width + 120) return;
    const skin = this.selectedSkin || SKINS[selectedSkinIndex];
    const img = assets.images.get(skin.file);
    context.save();
    context.globalAlpha = 0.24;
    context.shadowColor = stage.glow;
    context.shadowBlur = 20;
    context.translate(x + 28, y + 44);
    context.rotate(-0.06);
    if (img) {
      const drawH = 108;
      const drawW = drawH * (img.width / img.height);
      context.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      context.fillStyle = colorWithAlpha(stage.glow, 0.75);
      context.beginPath();
      context.ellipse(0, 0, 28, 40, 0, 0, Math.PI * 2);
      context.fill();
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

    if (this.mode === 'extreme' && this.extreme?.threat > 58) {
      const pulse = (this.extreme.threat - 58) / 42;
      context.globalAlpha = clamp(pulse * (0.18 + Math.sin(this.time * 9) * 0.04), 0, 0.26);
      const danger = context.createRadialGradient(this.width / 2, this.height / 2, this.height * 0.18, this.width / 2, this.height / 2, this.height * 0.78);
      danger.addColorStop(0, 'rgba(255, 79, 109, 0)');
      danger.addColorStop(1, 'rgba(255, 79, 109, 0.92)');
      context.fillStyle = danger;
      context.fillRect(0, 0, this.width, this.height);
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
  const normalized = normalizeRecord(record);
  const modeRecord = normalized[selectedMode] || normalized.endless;
  if (selectedMode === 'extreme') {
    ui.bestScoreLabel.textContent = '极限最高分';
    ui.bestDistanceLabel.textContent = modeRecord.bestTime ? '最佳通关' : '最远进度';
    ui.bestComboLabel.textContent = '最高评级';
    ui.bestScore.textContent = formatNumber(modeRecord.score || 0);
    ui.bestDistance.textContent = modeRecord.bestTime ? formatTime(modeRecord.bestTime) : `${Math.floor(modeRecord.distance || 0)}m`;
    ui.bestCombo.textContent = modeRecord.medal || '未通关';
  } else {
    ui.bestScoreLabel.textContent = '最佳分数';
    ui.bestDistanceLabel.textContent = '最远距离';
    ui.bestComboLabel.textContent = '最高连击';
    ui.bestScore.textContent = formatNumber(modeRecord.score || 0);
    ui.bestDistance.textContent = `${Math.floor(modeRecord.distance || 0)}m`;
    ui.bestCombo.textContent = `${Math.floor(modeRecord.combo || 0)}x`;
  }
}

function selectMode(mode) {
  if (!GAME_MODES[mode]) return;
  selectedMode = mode;
  game.mode = mode;
  game.modeConfig = GAME_MODES[mode];
  localStorage.setItem(MODE_KEY, selectedMode);
  ui.modeBtns.forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === selectedMode);
  });
  ui.startBtn.textContent = GAME_MODES[selectedMode].startText;
  updateMenuRecords(game.record);
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
  if (!playing) ui.missionWrap.classList.add('hidden');
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

async function copyBattleReport() {
  const fallback = '雾都飞升：暴走鹅跑酷｜双模式 H5 跑酷小游戏｜无尽刷分 + 极限追击';
  const text = game.lastSummary || fallback;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
  const old = ui.shareBtn.textContent;
  ui.shareBtn.textContent = '已复制';
  setTimeout(() => { ui.shareBtn.textContent = old; }, 1200);
}

function bindUI() {
  ui.startBtn.addEventListener('click', startFromMenu);
  ui.restartBtn.addEventListener('click', startFromMenu);
  ui.modeBtns.forEach((button) => button.addEventListener('click', () => selectMode(button.dataset.mode)));
  ui.backMenuBtn.addEventListener('click', () => game.goMenu());
  ui.howBtn.addEventListener('click', () => showModal(ui.helpPanel));
  ui.pauseBtn.addEventListener('click', () => game.togglePause());
  ui.soundBtn.addEventListener('click', () => sound.toggle());
  ui.shareBtn.addEventListener('click', copyBattleReport);
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
  selectMode(selectedMode);
  updateSkinUI();
  requestAnimationFrame(renderFrame);
  await loadAssets();
  ui.loading.classList.add('hidden');
  ui.menu.classList.remove('hidden');
  game.state = 'menu';
  selectMode(selectedMode);
  updateSkinUI();
}

window.addEventListener('resize', resizeCanvas);
boot();
