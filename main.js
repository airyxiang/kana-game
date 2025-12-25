const MAX_LEVEL = 6;
const SETTINGS_KEY = "kana-typing-settings-v1";
const LEGACY_STATS_KEY = "kana-typing-stats-v1";
const PROFILE_INDEX_KEY = "kana-typing-profile-index-v1";
const PROFILE_DATA_PREFIX = "kana-typing-profile-data-v1:";
const PROFILE_VERSION = 1;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const scriptModeEl = document.getElementById("scriptMode");
const showHintsEl = document.getElementById("showHints");
const lengthOnlyEl = document.getElementById("lengthOnly");
const practiceOnlyEl = document.getElementById("practiceOnly");
const fallSpeedEl = document.getElementById("fallSpeed");
const hitsGoalEl = document.getElementById("hitsGoal");
const missLimitEl = document.getElementById("missLimit");
const subtitleEl = document.getElementById("subtitle");
const rangeDetailsEl = document.getElementById("rangeDetails");
const selectAllBtn = document.getElementById("selectAllBtn");
const selectNoneBtn = document.getElementById("selectNoneBtn");
const enableYouonEl = document.getElementById("enableYouon");
const enableSokuonEl = document.getElementById("enableSokuon");
const gojuonGridEl = document.getElementById("gojuonGrid");
const focusModeEl = document.getElementById("focusMode");
const mistakesTopNWrapEl = document.getElementById("mistakesTopNWrap");
const mistakesTopNEl = document.getElementById("mistakesTopN");
const confusablePresetWrapEl = document.getElementById("confusablePresetWrap");
const confusablePresetEl = document.getElementById("confusablePreset");
const focusPreviewEl = document.getElementById("focusPreview");
const profileSelectEl = document.getElementById("profileSelect");
const newProfileBtn = document.getElementById("newProfileBtn");
const exportProfileBtn = document.getElementById("exportProfileBtn");
const importProfileBtn = document.getElementById("importProfileBtn");
const resetProfileBtn = document.getElementById("resetProfileBtn");
const importProfileFileEl = document.getElementById("importProfileFile");
const profileMetaEl = document.getElementById("profileMeta");
const levelModalEl = document.getElementById("levelModal");
const modalTitleEl = document.getElementById("modalTitle");
const modalBodyEl = document.getElementById("modalBody");
const modalPrimaryBtn = document.getElementById("modalPrimaryBtn");
const modalSecondaryBtn = document.getElementById("modalSecondaryBtn");
const stageEl = document.querySelector(".stage");

const levelLabel = document.getElementById("levelLabel");
const hitsLabel = document.getElementById("hitsLabel");
const hitsGoalLabel = document.getElementById("hitsGoalLabel");
const missesLabel = document.getElementById("missesLabel");
const missLimitLabel = document.getElementById("missLimitLabel");
const targetLabel = document.getElementById("targetLabel");
const messageEl = document.getElementById("message");
const statsEl = document.getElementById("stats");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(String(value), 10);
  if (Number.isNaN(n)) {
    return fallback;
  }
  return clamp(n, min, max);
}

function clampFloat(value, min, max, fallback) {
  const n = Number.parseFloat(String(value));
  if (Number.isNaN(n)) {
    return fallback;
  }
  return clamp(n, min, max);
}

function shouldRecordScoredStats() {
  return !game.practiceOnly;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nowMs() {
  return performance.now();
}

function toHiragana(str) {
  let out = "";
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code >= 0x30a1 && code <= 0x30f6) {
      out += String.fromCodePoint(code - 0x60);
    } else {
      out += ch;
    }
  }
  return out;
}

function toKatakana(str) {
  let out = "";
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code >= 0x3041 && code <= 0x3096) {
      out += String.fromCodePoint(code + 0x60);
    } else {
      out += ch;
    }
  }
  return out;
}

const MONOGRAPHS = {
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  さ: "sa",
  し: "shi",
  す: "su",
  せ: "se",
  そ: "so",
  た: "ta",
  ち: "chi",
  つ: "tsu",
  て: "te",
  と: "to",
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  は: "ha",
  ひ: "hi",
  ふ: "fu",
  へ: "he",
  ほ: "ho",
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  わ: "wa",
  を: "o",
  ん: "n",
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  ざ: "za",
  じ: "ji",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  だ: "da",
  ぢ: "ji",
  づ: "zu",
  で: "de",
  ど: "do",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",
  ぁ: "a",
  ぃ: "i",
  ぅ: "u",
  ぇ: "e",
  ぉ: "o",
  ゃ: "ya",
  ゅ: "yu",
  ょ: "yo",
};

const DIGRAPHS = {
  きゃ: "kya",
  きゅ: "kyu",
  きょ: "kyo",
  ぎゃ: "gya",
  ぎゅ: "gyu",
  ぎょ: "gyo",
  しゃ: "sha",
  しゅ: "shu",
  しょ: "sho",
  じゃ: "ja",
  じゅ: "ju",
  じょ: "jo",
  ちゃ: "cha",
  ちゅ: "chu",
  ちょ: "cho",
  にゃ: "nya",
  にゅ: "nyu",
  にょ: "nyo",
  ひゃ: "hya",
  ひゅ: "hyu",
  ひょ: "hyo",
  びゃ: "bya",
  びゅ: "byu",
  びょ: "byo",
  ぴゃ: "pya",
  ぴゅ: "pyu",
  ぴょ: "pyo",
  みゃ: "mya",
  みゅ: "myu",
  みょ: "myo",
  りゃ: "rya",
  りゅ: "ryu",
  りょ: "ryo",
};

const GOJUON_GROUPS = [
  { id: "a", label: "あ行", kana: ["あ", "い", "う", "え", "お"] },
  { id: "ka", label: "か行", kana: ["か", "き", "く", "け", "こ"] },
  { id: "sa", label: "さ行", kana: ["さ", "し", "す", "せ", "そ"] },
  { id: "ta", label: "た行", kana: ["た", "ち", "つ", "て", "と"] },
  { id: "na", label: "な行", kana: ["な", "に", "ぬ", "ね", "の"] },
  { id: "ha", label: "は行", kana: ["は", "ひ", "ふ", "へ", "ほ"] },
  { id: "ma", label: "ま行", kana: ["ま", "み", "む", "め", "も"] },
  { id: "ya", label: "や行", kana: ["や", "ゆ", "よ"] },
  { id: "ra", label: "ら行", kana: ["ら", "り", "る", "れ", "ろ"] },
  { id: "wa", label: "わ行", kana: ["わ", "を", "ん"] },
  { id: "ga", label: "が行", kana: ["が", "ぎ", "ぐ", "げ", "ご"] },
  { id: "za", label: "ざ行", kana: ["ざ", "じ", "ず", "ぜ", "ぞ"] },
  { id: "da", label: "だ行", kana: ["だ", "ぢ", "づ", "で", "ど"] },
  { id: "ba", label: "ば行", kana: ["ば", "び", "ぶ", "べ", "ぼ"] },
  { id: "pa", label: "ぱ行", kana: ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"] },
];

const CONFUSABLE_PRESETS = [
  {
    id: "ma-mo-sa-ki-me-nu",
    label: "ま・も・さ・き・め・ぬ",
    kana: ["ま", "も", "さ", "き", "め", "ぬ"],
  },
  {
    id: "nu-ne-me-re-wa",
    label: "ぬ・ね・め・れ・わ",
    kana: ["ぬ", "ね", "め", "れ", "わ"],
  },
  {
    id: "shi-tsu-so-n",
    label: "し・つ・そ・ん",
    kana: ["し", "つ", "そ", "ん"],
  },
];

function getLastVowel(romaji) {
  for (let i = romaji.length - 1; i >= 0; i -= 1) {
    const c = romaji[i];
    if ("aeiou".includes(c)) {
      return c;
    }
  }
  return "";
}

function sokuonPrefix(nextRomaji) {
  if (nextRomaji.startsWith("ch")) {
    return "t";
  }
  if (nextRomaji.startsWith("sh")) {
    return "s";
  }
  if (nextRomaji.startsWith("ts")) {
    return "t";
  }
  if (nextRomaji.length === 0) {
    return "";
  }
  return nextRomaji[0];
}

function kanaToRomaji(kana) {
  const src = toHiragana(kana);
  let out = "";
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if (ch === "っ") {
      const next2 = src.slice(i + 1, i + 3);
      const next1 = src.slice(i + 1, i + 2);
      const nextRomaji = DIGRAPHS[next2] || MONOGRAPHS[next1] || "";
      out += sokuonPrefix(nextRomaji);
      i += 1;
      continue;
    }

    if (ch === "ー") {
      const v = getLastVowel(out);
      if (v) {
        out += v;
      }
      i += 1;
      continue;
    }

    const two = src.slice(i, i + 2);
    if (DIGRAPHS[two]) {
      out += DIGRAPHS[two];
      i += 2;
      continue;
    }

    if (!MONOGRAPHS[ch]) {
      throw new Error(`Unsupported kana: ${ch}`);
    }
    out += MONOGRAPHS[ch];
    i += 1;
  }

  return out;
}

function kanaToTokens(kana) {
  const src = toHiragana(kana);
  const tokens = [];
  let i = 0;

  while (i < src.length) {
    const ch = src[i];
    if (ch === "っ") {
      tokens.push("っ");
      i += 1;
      continue;
    }
    if (ch === "ー") {
      tokens.push("ー");
      i += 1;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (DIGRAPHS[two]) {
      tokens.push(two);
      i += 2;
      continue;
    }
    tokens.push(ch);
    i += 1;
  }

  return tokens;
}

const BASE_MORA = Object.keys(MONOGRAPHS)
  .filter((k) => k.length === 1)
  .filter((k) => !["ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ゃ", "ゅ", "ょ"].includes(k));

const DIGRAPH_MORA = Object.keys(DIGRAPHS);

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return {
        scriptMode: "both",
        showHints: false,
        lengthOnly: false,
        practiceOnly: false,
        fallSpeed: 1.0,
        hitsToClear: 50,
        missesToFail: 10,
        focusMode: "gojuon",
        mistakesTopN: 12,
        confusablePreset: "ma-mo-sa-ki-me-nu",
        enabledGroups: GOJUON_GROUPS.map((g) => g.id),
        enableYouon: true,
        enableSokuon: true,
      };
    }
    const parsed = JSON.parse(raw);
    const enabledGroups = Array.isArray(parsed.enabledGroups)
      ? parsed.enabledGroups.filter((id) => GOJUON_GROUPS.some((g) => g.id === id))
      : GOJUON_GROUPS.map((g) => g.id);
    return {
      scriptMode: parsed.scriptMode || "both",
      showHints: Boolean(parsed.showHints),
      lengthOnly: Boolean(parsed.lengthOnly),
      practiceOnly: Boolean(parsed.practiceOnly),
      fallSpeed: clampFloat(parsed.fallSpeed, 0.5, 3, 1.0),
      hitsToClear: clampInt(parsed.hitsToClear, 1, 999, 50),
      missesToFail: clampInt(parsed.missesToFail, 1, 999, 10),
      focusMode:
        parsed.focusMode === "mistakes" || parsed.focusMode === "confusable"
          ? parsed.focusMode
          : "gojuon",
      mistakesTopN: clampInt(parsed.mistakesTopN, 3, 60, 12),
      confusablePreset:
        typeof parsed.confusablePreset === "string"
          ? parsed.confusablePreset
          : "ma-mo-sa-ki-me-nu",
      enabledGroups: enabledGroups.length ? enabledGroups : GOJUON_GROUPS.map((g) => g.id),
      enableYouon: parsed.enableYouon !== undefined ? Boolean(parsed.enableYouon) : true,
      enableSokuon: parsed.enableSokuon !== undefined ? Boolean(parsed.enableSokuon) : true,
    };
  } catch {
    return {
      scriptMode: "both",
      showHints: false,
      lengthOnly: false,
      practiceOnly: false,
      fallSpeed: 1.0,
      hitsToClear: 50,
      missesToFail: 10,
      focusMode: "gojuon",
      mistakesTopN: 12,
      confusablePreset: "ma-mo-sa-ki-me-nu",
      enabledGroups: GOJUON_GROUPS.map((g) => g.id),
      enableYouon: true,
      enableSokuon: true,
    };
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function profileDataKey(profileId) {
  return `${PROFILE_DATA_PREFIX}${profileId}`;
}

function loadProfileIndex() {
  try {
    const raw = localStorage.getItem(PROFILE_INDEX_KEY);
    if (!raw) {
      return { version: PROFILE_VERSION, activeId: "default", profiles: {} };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { version: PROFILE_VERSION, activeId: "default", profiles: {} };
    }
    const profiles = parsed.profiles && typeof parsed.profiles === "object" ? parsed.profiles : {};
    const activeId = typeof parsed.activeId === "string" ? parsed.activeId : "default";
    return { version: PROFILE_VERSION, activeId, profiles };
  } catch {
    return { version: PROFILE_VERSION, activeId: "default", profiles: {} };
  }
}

function saveProfileIndex(index) {
  localStorage.setItem(PROFILE_INDEX_KEY, JSON.stringify(index));
}

function sanitizeProfileId(name) {
  const base = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "profile";
}

function createEmptyProfileData(name) {
  const iso = new Date().toISOString();
  return {
    version: PROFILE_VERSION,
    name,
    createdAt: iso,
    updatedAt: iso,
    stats: {},
    totals: { hits: 0, misses: 0, typos: 0, practiceAttempts: 0 },
  };
}

function normalizeProfileData(raw, nameFallback) {
  const name = typeof raw?.name === "string" && raw.name.trim() ? raw.name.trim() : nameFallback;
  const stats = raw?.stats && typeof raw.stats === "object" ? raw.stats : {};
  const totalsRaw = raw?.totals && typeof raw.totals === "object" ? raw.totals : {};
  const totals = {
    hits: clampInt(totalsRaw.hits, 0, 1_000_000_000, 0),
    misses: clampInt(totalsRaw.misses, 0, 1_000_000_000, 0),
    typos: clampInt(totalsRaw.typos, 0, 1_000_000_000, 0),
    practiceAttempts: clampInt(totalsRaw.practiceAttempts, 0, 1_000_000_000, 0),
  };
  const createdAt = typeof raw?.createdAt === "string" ? raw.createdAt : new Date().toISOString();
  const updatedAt = new Date().toISOString();
  return { version: PROFILE_VERSION, name, createdAt, updatedAt, stats, totals };
}

function loadProfileData(profileId, nameFallback) {
  try {
    const raw = localStorage.getItem(profileDataKey(profileId));
    if (!raw) {
      return createEmptyProfileData(nameFallback);
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return createEmptyProfileData(nameFallback);
    }
    return normalizeProfileData(parsed, nameFallback);
  } catch {
    return createEmptyProfileData(nameFallback);
  }
}

function saveProfileData(profileId, data) {
  const normalized = normalizeProfileData(data, data?.name || profileId);
  localStorage.setItem(profileDataKey(profileId), JSON.stringify(normalized));
}

function ensureDefaultProfile() {
  const index = loadProfileIndex();
  if (!index.profiles.default) {
    index.profiles.default = { name: "Default" };
    saveProfileIndex(index);
    if (!localStorage.getItem(profileDataKey("default"))) {
      const legacy = localStorage.getItem(LEGACY_STATS_KEY);
      if (legacy) {
        try {
          const legacyStats = JSON.parse(legacy);
          saveProfileData("default", {
            ...createEmptyProfileData("Default"),
            stats: legacyStats && typeof legacyStats === "object" ? legacyStats : {},
          });
        } catch {
          saveProfileData("default", createEmptyProfileData("Default"));
        }
      } else {
        saveProfileData("default", createEmptyProfileData("Default"));
      }
    }
  }
  if (!index.activeId || !index.profiles[index.activeId]) {
    index.activeId = "default";
    saveProfileIndex(index);
  }
  return index;
}

function listProfiles() {
  const index = ensureDefaultProfile();
  return Object.entries(index.profiles).map(([id, meta]) => ({
    id,
    name: typeof meta?.name === "string" && meta.name.trim() ? meta.name.trim() : id,
  }));
}

function loadActiveProfileIntoGame() {
  const index = ensureDefaultProfile();
  const profileId = index.activeId;
  const nameFallback = index.profiles[profileId]?.name || profileId;
  const data = loadProfileData(profileId, nameFallback);
  game.profileId = profileId;
  game.profile = { ...data, name: nameFallback };
}

function saveActiveProfileFromGame() {
  const index = ensureDefaultProfile();
  if (!index.profiles[game.profileId]) {
    index.profiles[game.profileId] = { name: game.profile.name };
    saveProfileIndex(index);
  } else if (index.profiles[game.profileId].name !== game.profile.name) {
    index.profiles[game.profileId].name = game.profile.name;
    saveProfileIndex(index);
  }
  saveProfileData(game.profileId, game.profile);
}

function setActiveProfile(profileId) {
  const index = ensureDefaultProfile();
  if (!index.profiles[profileId]) {
    return false;
  }
  index.activeId = profileId;
  saveProfileIndex(index);
  loadActiveProfileIntoGame();
  return true;
}

function createNewProfile(name) {
  const index = ensureDefaultProfile();
  const base = sanitizeProfileId(name);
  let id = base;
  let i = 2;
  while (index.profiles[id]) {
    id = `${base}-${i}`;
    i += 1;
  }
  index.profiles[id] = { name };
  index.activeId = id;
  saveProfileIndex(index);
  saveProfileData(id, createEmptyProfileData(name));
  loadActiveProfileIntoGame();
  return id;
}

function ensureStat(stats, key) {
  if (!stats[key]) {
    stats[key] = { missed: 0, typos: 0, hit: 0, seen: 0 };
  }
  return stats[key];
}

function weightFor(stats, key) {
  const s = ensureStat(stats, key);
  const missedScore = s.missed * 2.5;
  const typoScore = s.typos * 0.4;
  return clamp(1 + missedScore + typoScore, 1, 40);
}

function weightedPick(keys, getWeight) {
  let total = 0;
  const weights = keys.map((k) => {
    const w = getWeight(k);
    total += w;
    return w;
  });
  let r = Math.random() * total;
  for (let i = 0; i < keys.length; i += 1) {
    r -= weights[i];
    if (r <= 0) {
      return keys[i];
    }
  }
  return keys[keys.length - 1];
}

function buildKanaString(level, stats, practice) {
  const maxKanaLen = level;
  const desiredLen = Math.floor(Math.random() * maxKanaLen) + 1;

  let hira = "";
  while (hira.length < desiredLen) {
    const remaining = desiredLen - hira.length;

    const canDigraph = remaining >= 2 && level >= 2;
    const canSokuon = remaining >= 2 && level >= 3;

    const options = [];
    options.push({ kind: "mono", minLen: 1, maxLen: 1, weight: 1.0 });
    if (canDigraph && practice.enableYouon && practice.allowedDigraphs.length) {
      options.push({ kind: "digraph", minLen: 2, maxLen: 2, weight: 1.0 });
    }
    if (canSokuon && practice.enableSokuon) {
      options.push({ kind: "sokuon", minLen: 2, maxLen: 3, weight: 0.7 });
    }

    const option = weightedPick(options, (o) => o.weight);
    if (option.kind === "mono") {
      const keys = practice.allowedMonos.filter((k) => {
        if (remaining === 1 && level >= 2) {
          return true;
        }
        return k !== "ん";
      });
      const picked = weightedPick(keys, (k) => weightFor(stats, k));
      hira += picked;
      continue;
    }

    if (option.kind === "digraph") {
      const picked = weightedPick(practice.allowedDigraphs, (k) => weightFor(stats, k));
      if (picked.length <= remaining) {
        hira += picked;
      }
      continue;
    }

    if (option.kind === "sokuon") {
      if (remaining === 2) {
        const candidates = practice.allowedMonos.filter((k) => k !== "ん");
        const next = weightedPick(candidates, (k) => weightFor(stats, k));
        hira += `っ${next}`;
        continue;
      }
      const next =
        practice.enableYouon &&
        practice.allowedDigraphs.length &&
        Math.random() < 0.55
          ? weightedPick(practice.allowedDigraphs, (k) => weightFor(stats, k))
          : weightedPick(
              practice.allowedMonos.filter((k) => k !== "ん"),
              (k) => weightFor(stats, k),
            );
      if (`っ${next}`.length <= remaining) {
        hira += `っ${next}`;
      }
      continue;
    }
  }

  const scriptMode = scriptModeEl.value;
  if (scriptMode === "hiragana") {
    return hira;
  }
  if (scriptMode === "katakana") {
    return toKatakana(hira);
  }
  return Math.random() < 0.5 ? hira : toKatakana(hira);
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const bgCanvas = document.createElement("canvas");
const bgCtx = bgCanvas.getContext("2d");

function drawPerspectiveGrid(context, rect) {
  const horizonY = rect.height * 0.22;
  const bottomY = rect.height;
  const vanishX = rect.width * 0.5;
  const vanishY = horizonY;

  context.save();
  context.globalCompositeOperation = "source-over";
  context.strokeStyle = "rgba(255,255,255,0.045)";
  context.lineWidth = 1;

  const half = Math.floor(rect.width / 70);
  const span = rect.width * 0.72;
  for (let i = -half; i <= half; i += 1) {
    const u = half === 0 ? 0 : i / half;
    const xBottom = vanishX + u * span;
    context.beginPath();
    context.moveTo(xBottom, bottomY);
    context.lineTo(vanishX, vanishY);
    context.stroke();
  }

  const rows = 22;
  const exp = 0.58;
  for (let i = 1; i <= rows; i += 1) {
    const t = i / rows;
    const y = horizonY + (bottomY - horizonY) * (1 - Math.pow(t, exp));
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(rect.width, y);
    context.stroke();
  }

  context.restore();
}

function renderStaticBackground() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  bgCanvas.width = canvas.width;
  bgCanvas.height = canvas.height;
  bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  bgCtx.clearRect(0, 0, rect.width, rect.height);
  const g = bgCtx.createLinearGradient(0, 0, 0, rect.height);
  g.addColorStop(0, "rgba(255,255,255,0.04)");
  g.addColorStop(1, "rgba(255,255,255,0.00)");
  bgCtx.fillStyle = g;
  bgCtx.fillRect(0, 0, rect.width, rect.height);

  drawPerspectiveGrid(bgCtx, rect);

  const vignette = bgCtx.createRadialGradient(
    rect.width * 0.5,
    rect.height * 0.35,
    rect.height * 0.1,
    rect.width * 0.5,
    rect.height * 0.6,
    rect.height * 0.95
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");
  bgCtx.fillStyle = vignette;
  bgCtx.fillRect(0, 0, rect.width, rect.height);
}

function setMessage(text, kind = "") {
  messageEl.textContent = text;
  messageEl.className = `message ${kind}`.trim();
  messageEl.classList.remove("bump");
  // Force reflow to restart animation.
  // eslint-disable-next-line no-unused-expressions
  messageEl.offsetWidth;
  messageEl.classList.add("bump");
}

function applyAlpha(color, multiplier) {
  if (!color.startsWith("rgba(")) {
    return color;
  }
  const inner = color.slice(5, -1);
  const parts = inner.split(",").map((p) => p.trim());
  const rgb = parts.slice(0, 3).join(",");
  const baseA = Number(parts[3] || "1");
  return `rgba(${rgb},${baseA * multiplier})`;
}

function enqueueFlash(color) {
  game.flash = { color, alpha: 1.0 };
}

function enqueueShake(durationMs, mag) {
  game.shake.untilMs = nowMs() + durationMs;
  game.shake.durationMs = durationMs;
  game.shake.mag = Math.max(game.shake.mag, mag);
}

function burstOrigin(drop) {
  ctx.font = `800 ${drop.fontSize}px "Noto Sans JP", system-ui, sans-serif`;
  const w = ctx.measureText(drop.kana).width;
  return {
    x: drop.x + w * 0.5,
    y: drop.y - drop.fontSize * 0.55,
  };
}

function enqueueBurst(drop, color) {
  const origin = burstOrigin(drop);
  const n = 14;
  for (let i = 0; i < n; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const s = 60 + Math.random() * 180;
    game.effects.push({
      type: "p",
      x: origin.x,
      y: origin.y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 70,
      size: 2 + Math.random() * 2.2,
      ageMs: 0,
      ttlMs: 520 + Math.random() * 220,
      color,
    });
  }
}

function drawEffects(dt) {
  if (!game.effects.length) {
    return;
  }
  const remaining = [];
  for (const e of game.effects) {
    e.ageMs += dt * 1000;
    if (e.ageMs >= e.ttlMs) {
      continue;
    }
    const p = e.ageMs / e.ttlMs;
    const alpha = 1 - p;
    e.vy += 260 * dt;
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    ctx.fillStyle = applyAlpha(e.color, alpha);
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size * (0.85 + 0.15 * alpha), 0, Math.PI * 2);
    ctx.fill();
    remaining.push(e);
  }
  game.effects = remaining;
}

function drawFlash(rect, dt) {
  if (!game.flash) {
    return;
  }
  if (game.flash.alpha <= 0.01) {
    game.flash = null;
    return;
  }
  ctx.fillStyle = applyAlpha(game.flash.color, game.flash.alpha);
  ctx.fillRect(0, 0, rect.width, rect.height);
  game.flash.alpha = Math.max(0, game.flash.alpha - dt * 4.0);
}

function formatProfileSummary(profile, limit = 6) {
  const totals = profile.totals || { hits: 0, misses: 0, typos: 0 };
  const scoredAttempts = (totals.hits || 0) + (totals.misses || 0);
  const accuracy = scoredAttempts ? ((totals.hits / scoredAttempts) * 100).toFixed(1) : "—";
  const practiceAttempts = totals.practiceAttempts || 0;

  const entries = Object.entries(profile.stats || {})
    .filter(([, v]) => v && (v.missed || v.typos))
    .map(([k, v]) => ({
      kana: k,
      missed: v.missed || 0,
      typos: v.typos || 0,
      score: (v.missed || 0) * 3 + (v.typos || 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const mistakesLine =
    entries.length === 0
      ? "Mistakes: —"
      : `Mistakes: ${entries
          .map((e) => `${e.kana} (miss ${e.missed}, typo ${e.typos})`)
          .join(" · ")}`;

  return [
    `Profile: ${profile.name}`,
    `Scored: ${scoredAttempts} (hit ${totals.hits}, miss ${totals.misses}, typo ${totals.typos})`,
    `Accuracy: ${accuracy}%`,
    `Practice-only attempts: ${practiceAttempts}`,
    mistakesLine,
  ].join("\n");
}

function randomId() {
  return `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

function difficultyLevel() {
  if (game.practiceOnly) {
    return 1;
  }
  return game.lengthOnly ? 1 : game.level;
}

function baseSpeedForLevel(level) {
  if (level === 1) {
    return 56;
  }
  return 68 + level * 18;
}

function spawnIntervalMsForLevel(level) {
  if (level === 1) {
    return 1300;
  }
  return clamp(950 - level * 95, 260, 980);
}

function spawnBatchForLevel(level) {
  if (level <= 1) {
    return 1;
  }
  if (level <= 3) {
    return Math.random() < 0.25 ? 2 : 1;
  }
  if (level <= 5) {
    return 1 + (Math.random() < 0.35 ? 1 : 0);
  }
  return 1 + (Math.random() < 0.45 ? 1 : 0);
}

const game = {
  running: false,
  level: 1,
  hits: 0,
  misses: 0,
  lastTime: 0,
  spawnAccMs: 0,
  drops: [],
  effects: [],
  flash: null,
  shake: { untilMs: 0, durationMs: 0, mag: 0 },
  targetId: null,
  finished: false,
  modalOpen: false,
  input: "",
  inputValid: true,
  profileId: "default",
  profile: {
    name: "Default",
    stats: {},
    totals: { hits: 0, misses: 0, typos: 0, practiceAttempts: 0 },
  },
  lengthOnly: false,
  practiceOnly: false,
  fallSpeed: 1.0,
  hitsToClear: 50,
  missesToFail: 10,
  practice: {
    enabledGroups: new Set(),
    enableYouon: true,
    enableSokuon: true,
    focusMode: "gojuon",
    mistakesTopN: 12,
    confusablePreset: "ma-mo-sa-ki-me-nu",
    allowedMonos: [],
    allowedDigraphs: [],
  },
};

function bumpTokenStats(tokens, field) {
  if (!shouldRecordScoredStats()) {
    return;
  }
  for (const t of tokens) {
    ensureStat(game.profile.stats, t)[field] += 1;
  }
}

function computePractice() {
  const focusMode = game.practice.focusMode;
  let allowedMonos = [];

  if (focusMode === "mistakes") {
    allowedMonos = topMistakeMonos(game.profile.stats, game.practice.mistakesTopN);
  } else if (focusMode === "confusable") {
    allowedMonos = confusablePresetKana(game.practice.confusablePreset).filter((k) =>
      BASE_MORA.includes(k),
    );
  } else {
    const enabled = game.practice.enabledGroups;
    const kana = [];
    for (const g of GOJUON_GROUPS) {
      if (!enabled.has(g.id)) {
        continue;
      }
      for (const k of g.kana) {
        if (MONOGRAPHS[k]) {
          kana.push(k);
        }
      }
    }
    allowedMonos = [...new Set(kana)].filter((k) => BASE_MORA.includes(k));
  }

  const monoSet = new Set(allowedMonos);
  const allowedDigraphs = DIGRAPH_MORA.filter((d) => monoSet.has(d[0]));

  game.practice.allowedMonos = allowedMonos;
  game.practice.allowedDigraphs = allowedDigraphs;
}

function persistSettings() {
  saveSettings({
    scriptMode: scriptModeEl.value,
    showHints: showHintsEl.checked,
    lengthOnly: game.lengthOnly,
    practiceOnly: game.practiceOnly,
    fallSpeed: game.fallSpeed,
    hitsToClear: game.hitsToClear,
    missesToFail: game.missesToFail,
    focusMode: game.practice.focusMode,
    mistakesTopN: game.practice.mistakesTopN,
    confusablePreset: game.practice.confusablePreset,
    enabledGroups: [...game.practice.enabledGroups],
    enableYouon: game.practice.enableYouon,
    enableSokuon: game.practice.enableSokuon,
  });
}

function updateSubtitle() {
  const mode = game.practiceOnly
    ? "Practice-only"
    : game.lengthOnly
      ? "Length-only"
      : "Standard";
  const target = game.practiceOnly
    ? "endless · fixed L1"
    : `${game.hitsToClear} hits/level · ${game.missesToFail} misses fail`;
  subtitleEl.textContent = `Mode: ${mode} · ${target} · Speed x${game.fallSpeed.toFixed(1)} · Enter clears · Space pauses`;
}

function updateModeUi() {
  const disabled = game.practiceOnly;
  hitsGoalEl.disabled = disabled;
  missLimitEl.disabled = disabled;
  lengthOnlyEl.disabled = disabled;
  if (disabled) {
    hitsGoalEl.title = "Disabled in practice-only mode";
    missLimitEl.title = "Disabled in practice-only mode";
    lengthOnlyEl.title = "Disabled in practice-only mode";
  } else {
    hitsGoalEl.title = "";
    missLimitEl.title = "";
    lengthOnlyEl.title = "";
  }
}

function topMistakeMonos(stats, limit) {
  const entries = Object.entries(stats)
    .filter(([k, v]) => {
      if (!v || typeof v !== "object") {
        return false;
      }
      if (!BASE_MORA.includes(k)) {
        return false;
      }
      return (v.missed || 0) > 0 || (v.typos || 0) > 0;
    })
    .map(([k, v]) => ({
      kana: k,
      score: (v.missed || 0) * 3 + (v.typos || 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return entries.map((e) => e.kana);
}

function confusablePresetKana(presetId) {
  const preset = CONFUSABLE_PRESETS.find((p) => p.id === presetId);
  return preset ? preset.kana : [];
}

function updatePracticeAvailability() {
  computePractice();
  const hasAny = game.practice.allowedMonos.length > 0;
  if (!hasAny) {
    if (game.running) {
      setRunning(false);
    }
    startPauseBtn.disabled = true;
    if (game.practice.focusMode === "mistakes") {
      setMessage("No mistakes recorded yet. Play a bit or change Focus.", "danger");
    } else if (game.practice.focusMode === "confusable") {
      setMessage("Select a confusable set in Focus.", "danger");
    } else {
      setMessage("Select at least one kana row in Practice range.", "danger");
    }
  } else if (!game.finished) {
    startPauseBtn.disabled = false;
  }
  const preview = formatKanaForDisplay(game.practice.allowedMonos);
  const previewTitle =
    game.practice.focusMode === "mistakes"
      ? `Target (top ${game.practice.mistakesTopN} mistakes):`
      : game.practice.focusMode === "confusable"
        ? "Target (confusables):"
        : "Target:";
  focusPreviewEl.textContent = hasAny ? `${previewTitle}\n${preview}` : "";
  updateHud();
}

function formatKanaForDisplay(kanaList) {
  const mode = scriptModeEl.value;
  if (mode === "katakana") {
    return kanaList.map((k) => toKatakana(k)).join(" ");
  }
  if (mode === "both") {
    return kanaList.map((k) => `${k}/${toKatakana(k)}`).join(" ");
  }
  return kanaList.join(" ");
}

function renderPracticeUI() {
  gojuonGridEl.innerHTML = "";
  const allowRowSelection = game.practice.focusMode === "gojuon";
  for (const g of GOJUON_GROUPS) {
    const wrapper = document.createElement("div");
    wrapper.className = "gojuonGroup";

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = game.practice.enabledGroups.has(g.id);
    checkbox.disabled = !allowRowSelection;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        game.practice.enabledGroups.add(g.id);
      } else {
        game.practice.enabledGroups.delete(g.id);
      }
      persistSettings();
      updatePracticeAvailability();
    });

    const title = document.createElement("span");
    title.className = "gojuonTitle";
    title.textContent = g.label;

    const kana = document.createElement("span");
    kana.className = "gojuonKana";
    kana.textContent = formatKanaForDisplay(g.kana);

    label.appendChild(checkbox);
    label.appendChild(title);
    label.appendChild(kana);
    wrapper.appendChild(label);
    gojuonGridEl.appendChild(wrapper);
  }
}

function updateFocusUi() {
  const mode = game.practice.focusMode;
  mistakesTopNWrapEl.hidden = mode !== "mistakes";
  confusablePresetWrapEl.hidden = mode !== "confusable";
  selectAllBtn.disabled = mode !== "gojuon";
  selectNoneBtn.disabled = mode !== "gojuon";
}

function renderConfusablePresets() {
  confusablePresetEl.innerHTML = "";
  for (const p of CONFUSABLE_PRESETS) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.label;
    confusablePresetEl.appendChild(opt);
  }
}

function renderProfileSelect() {
  const profiles = listProfiles();
  profileSelectEl.innerHTML = "";
  for (const p of profiles) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    profileSelectEl.appendChild(opt);
  }
  profileSelectEl.value = game.profileId;
}

function updateHud() {
  levelLabel.textContent = String(game.level);
  hitsLabel.textContent = String(game.hits);
  hitsGoalLabel.textContent = game.practiceOnly ? "∞" : String(game.hitsToClear);
  missesLabel.textContent = String(game.misses);
  missLimitLabel.textContent = game.practiceOnly ? "∞" : String(game.missesToFail);
  const target = game.drops.find((d) => d.id === game.targetId);
  targetLabel.textContent = target ? `${target.kana} → ${target.romaji}` : "—";
  const summary = formatProfileSummary(game.profile);
  statsEl.textContent = summary;
  profileMetaEl.textContent = summary;
}

function clearAllDrops() {
  game.drops = [];
  game.targetId = null;
}

function setRunning(running, options = {}) {
  const wasRunning = game.running;
  game.running = running;
  startPauseBtn.textContent = running ? "Pause" : "Start";
  const silent = Boolean(options.silent);
  document.body.classList.toggle("running", running);
  resizeCanvas();
  renderStaticBackground();
  if (running) {
    game.lastTime = nowMs();
    requestAnimationFrame(tick);
    setMessage(`Level ${game.level} in progress…`, "");
    if (rangeDetailsEl.open) {
      rangeDetailsEl.open = false;
    }
  } else {
    if (wasRunning && !game.finished && !silent) {
      setMessage("Paused.", "");
    }
  }
}

let modalPrimaryAction = null;
let modalSecondaryAction = null;

function closeModal() {
  game.modalOpen = false;
  levelModalEl.classList.remove("open");
  levelModalEl.setAttribute("aria-hidden", "true");
  modalPrimaryAction = null;
  modalSecondaryAction = null;
}

function openModal({
  title,
  body,
  primaryText,
  secondaryText,
  onPrimary,
  onSecondary,
}) {
  game.modalOpen = true;
  modalTitleEl.textContent = title;
  modalBodyEl.textContent = body;
  modalPrimaryBtn.textContent = primaryText;
  modalSecondaryBtn.textContent = secondaryText;
  modalPrimaryAction = onPrimary;
  modalSecondaryAction = onSecondary;
  levelModalEl.classList.add("open");
  levelModalEl.setAttribute("aria-hidden", "false");
  modalPrimaryBtn.focus({ preventScroll: true });
}

function startLevel(level) {
  game.level = game.practiceOnly ? 1 : clamp(level, 1, MAX_LEVEL);
  game.hits = 0;
  game.misses = 0;
  game.spawnAccMs = 0;
  game.finished = false;
  clearAllDrops();
  game.input = "";
  game.inputValid = true;
  setMessage(`Ready for Level ${game.level}. Press Start.`, "");
  startPauseBtn.disabled = false;
  updateHud();
  updateSubtitle();
}

function endAsFailed() {
  game.finished = true;
  setRunning(false, { silent: true });
  clearAllDrops();
  startPauseBtn.disabled = true;
  setMessage("Failed: too many misses. Press Reset to retry.", "danger");
  if (stageEl) {
    stageEl.classList.remove("failShake");
    // Force reflow to restart animation.
    // eslint-disable-next-line no-unused-expressions
    stageEl.offsetWidth;
    stageEl.classList.add("failShake");
  }
  openModal({
    title: "Failed",
    body: `Too many misses (limit: ${game.missesToFail}). Press Reset to retry.`,
    primaryText: "Reset",
    secondaryText: "Close",
    onPrimary: () => {
      closeModal();
      game.finished = false;
      startLevel(1);
    },
    onSecondary: () => {
      closeModal();
    },
  });
  updateHud();
}

function endAsCleared() {
  setRunning(false, { silent: true });
  clearAllDrops();
  game.input = "";
  game.inputValid = true;
  startPauseBtn.disabled = true;

  const clearedLevel = game.level;
  if (clearedLevel >= MAX_LEVEL) {
    game.finished = true;
    openModal({
      title: "All Levels Cleared",
      body: "You cleared all 6 levels. Press Reset to play again.",
      primaryText: "Reset",
      secondaryText: "Close",
      onPrimary: () => {
        closeModal();
        game.finished = false;
        startLevel(1);
      },
      onSecondary: () => {
        closeModal();
      },
    });
    return;
  }

  openModal({
    title: `Level ${clearedLevel} Cleared`,
    body: `Goal reached (${game.hitsToClear} hits). Press Continue to enter the next level.`,
    primaryText: "Continue",
    secondaryText: "Reset",
    onPrimary: () => {
      closeModal();
      startLevel(clearedLevel + 1);
      startPauseBtn.disabled = false;
      setRunning(true);
    },
    onSecondary: () => {
      closeModal();
      startLevel(1);
    },
  });
}

function spawnOne() {
  const genLevel = game.practiceOnly ? 1 : game.level;
  const kana = buildKanaString(genLevel, game.profile.stats, game.practice);
  const tokens = kanaToTokens(kana);
  const romaji = kanaToRomaji(kana);
  const rect = canvas.getBoundingClientRect();

  const fontSize = clamp(28 - Math.floor(game.level / 3) * 1, 22, 28);
  ctx.font = `700 ${fontSize}px "Noto Sans JP", system-ui, sans-serif`;
  const textWidth = ctx.measureText(kana).width;
  const margin = 14;
  const x = Math.random() * Math.max(1, rect.width - textWidth - margin * 2) + margin;
  const difficulty = difficultyLevel();

  const d = {
    id: randomId(),
    kana,
    tokens,
    romaji,
    x,
    y: -fontSize - 8,
    speed: baseSpeedForLevel(difficulty) * game.fallSpeed * (0.9 + Math.random() * 0.3),
    fontSize,
    createdAt: nowMs(),
  };

  bumpTokenStats(tokens, "seen");
  game.drops.push(d);
}

function spawnBatch() {
  if (!game.practice.allowedMonos.length) {
    return;
  }
  const difficulty = difficultyLevel();
  const batch = spawnBatchForLevel(difficulty);
  const maxOnScreen =
    difficulty === 1 ? 6 : clamp(9 + difficulty * 2, 10, 18);
  const available = Math.max(0, maxOnScreen - game.drops.length);
  const count = Math.min(batch, available);
  for (let i = 0; i < count; i += 1) {
    spawnOne();
  }
}

function dropMissed(drop) {
  game.misses += 1;
  bumpTokenStats(drop.tokens, "missed");
  if (game.practiceOnly) {
    game.profile.totals.practiceAttempts += 1;
  } else {
    game.profile.totals.misses += 1;
  }
  saveActiveProfileFromGame();
  enqueueBurst(drop, "rgba(255,77,109,0.95)");
  enqueueFlash("rgba(255,77,109,0.09)");
  enqueueShake(180, 6);

  if (!game.practiceOnly && game.misses >= game.missesToFail) {
    endAsFailed();
  } else {
    setMessage(`Missed: ${drop.kana} (${drop.romaji})`, "danger");
  }
}

function dropHit(drop) {
  game.hits += 1;
  bumpTokenStats(drop.tokens, "hit");
  if (game.practiceOnly) {
    game.profile.totals.practiceAttempts += 1;
  } else {
    game.profile.totals.hits += 1;
  }
  saveActiveProfileFromGame();
  enqueueBurst(drop, "rgba(45,212,191,0.95)");
  enqueueFlash("rgba(45,212,191,0.08)");
  setMessage(`Hit: ${drop.kana} (${drop.romaji})`, "ok");

  if (!game.practiceOnly && game.hits >= game.hitsToClear) {
    endAsCleared();
  }
}

function recomputeTarget(prefix) {
  const candidates = game.drops
    .filter((d) => d.romaji.startsWith(prefix))
    .sort((a, b) => b.y - a.y);
  game.targetId = candidates.length ? candidates[0].id : null;
}

function onInputChanged() {
  const value = game.input.trim().toLowerCase();
  if (!value) {
    game.inputValid = true;
    game.targetId = null;
    updateHud();
    return;
  }

  const target = game.drops.find((d) => d.id === game.targetId);
  if (target && target.romaji.startsWith(value)) {
    game.inputValid = true;
    updateHud();
  } else {
    recomputeTarget(value);
    game.inputValid = game.targetId !== null;
    updateHud();
  }

  const finalTarget = game.drops.find((d) => d.id === game.targetId);
  if (finalTarget && finalTarget.romaji === value) {
    game.drops = game.drops.filter((d) => d.id !== finalTarget.id);
    dropHit(finalTarget);
    game.input = "";
    game.inputValid = true;
    game.targetId = null;
    updateHud();
  }
}

function togglePauseHotkey() {
  if (game.modalOpen) {
    return;
  }
  if (game.running) {
    setRunning(false);
    keepInputFocused();
    return;
  }
  if (game.finished || startPauseBtn.disabled) {
    return;
  }
  if (!game.practice.allowedMonos.length) {
    rangeDetailsEl.open = true;
    setMessage("Select a Practice range first.", "danger");
    keepInputFocused();
    return;
  }
  setRunning(true);
  keepInputFocused();
}

function registerTypo() {
  const value = game.input.trim().toLowerCase();
  if (!value) {
    return;
  }
  const anyMatch = game.drops.some((d) => d.romaji.startsWith(value));
  if (anyMatch) {
    return;
  }

  const nearest = [...game.drops].sort((a, b) => b.y - a.y)[0];
  if (nearest) {
    bumpTokenStats(nearest.tokens, "typos");
    if (!game.practiceOnly) {
      game.profile.totals.typos += 1;
      saveActiveProfileFromGame();
    }
    updateHud();
  }
}

function drawBackground(rect, ts) {
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.drawImage(bgCanvas, 0, 0, rect.width, rect.height);

  const t = ts / 1000;
  const cx = rect.width * (0.3 + 0.07 * Math.sin(t * 0.22));
  const cy = rect.height * (0.22 + 0.06 * Math.cos(t * 0.18));
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rect.height * 0.9);
  glow.addColorStop(0, "rgba(124,92,255,0.08)");
  glow.addColorStop(0.55, "rgba(45,212,191,0.05)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, rect.width, rect.height);
}

function drawDrops(rect, ts) {
  const showHints = showHintsEl.checked;
  const prefix = game.input.trim().toLowerCase();
  const targetId = game.targetId;
  const bottomY = rect.height - 78;
  const warnSeconds = 3;
  const warnY = clamp(
    bottomY - baseSpeedForLevel(difficultyLevel()) * game.fallSpeed * warnSeconds,
    16,
    bottomY - 16
  );

  ctx.save();
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, warnY);
  ctx.lineTo(rect.width, warnY);
  ctx.stroke();
  ctx.restore();

  for (const d of game.drops) {
    const isTarget = d.id === targetId && prefix.length > 0;
    const alpha = isTarget ? 1.0 : 0.92;
    const color = isTarget ? "rgba(45,212,191,0.98)" : `rgba(255,255,255,${alpha})`;
    const t = ts / 1000;
    const bob = isTarget ? Math.sin(t * 7.2 + d.createdAt * 0.002) * 2.0 : 0;
    ctx.font = `800 ${d.fontSize}px "Noto Sans JP", system-ui, sans-serif`;
    if (isTarget) {
      ctx.save();
      ctx.shadowColor = "rgba(45,212,191,0.45)";
      ctx.shadowBlur = 16;
      ctx.fillStyle = color;
      ctx.fillText(d.kana, d.x, d.y + bob);
      ctx.restore();
    } else {
      ctx.fillStyle = color;
      ctx.fillText(d.kana, d.x, d.y);
    }

    const timeLeft = (bottomY - d.y) / d.speed;
    const autoHints = timeLeft <= warnSeconds;
    const shouldShowHints = showHints || autoHints;
    if (shouldShowHints) {
      ctx.font = `600 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      if (isTarget) {
        ctx.fillStyle = "rgba(45,212,191,0.85)";
      } else if (autoHints && !showHints) {
        ctx.fillStyle = "rgba(255,255,255,0.72)";
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.55)";
      }
      ctx.fillText(d.romaji, d.x, d.y + 16 + bob);
    }
  }

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, rect.height - 74);
  ctx.lineTo(rect.width, rect.height - 74);
  ctx.stroke();
}

function roundedRectPath(context, x, y, w, h, r) {
  const radius = clamp(r, 0, Math.min(w, h) / 2);
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + w - radius, y);
  context.quadraticCurveTo(x + w, y, x + w, y + radius);
  context.lineTo(x + w, y + h - radius);
  context.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  context.lineTo(x + radius, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawTypedInput(rect) {
  const text = game.input;
  if (!text) {
    return;
  }
  const target = game.drops.find((d) => d.id === game.targetId);
  const fontSize = target ? target.fontSize : 26;
  const bottomY = rect.height - 78;
  const y = bottomY - 30;

  ctx.save();
  ctx.font = `800 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  const w = ctx.measureText(text).width;
  const padX = 12;
  const padY = 10;
  const boxW = w + padX * 2;
  const boxH = fontSize + padY * 2;
  const x = rect.width * 0.5 - boxW * 0.5;
  const boxY = y - fontSize - padY;
  const valid = game.inputValid;

  roundedRectPath(ctx, x, boxY, boxW, boxH, 14);
  ctx.fillStyle = valid ? "rgba(0,0,0,0.35)" : "rgba(80,0,10,0.42)";
  ctx.fill();
  ctx.strokeStyle = valid ? "rgba(255,255,255,0.18)" : "rgba(255,77,109,0.45)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = valid ? "rgba(255,255,255,0.92)" : "rgba(255,77,109,0.95)";
  ctx.fillText(text, x + padX, y);
  ctx.restore();
}

function tick(ts) {
  if (!game.running) {
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const dt = (ts - game.lastTime) / 1000;
  game.lastTime = ts;

  game.spawnAccMs += dt * 1000;
  const interval = spawnIntervalMsForLevel(difficultyLevel());
  while (game.spawnAccMs >= interval) {
    game.spawnAccMs -= interval;
    spawnBatch();
  }

  const bottomY = rect.height - 78;
  const remaining = [];
  for (const d of game.drops) {
    d.y += d.speed * dt;
    if (d.y >= bottomY) {
      dropMissed(d);
      if (!game.running) {
        return;
      }
    } else {
      remaining.push(d);
    }
  }
  game.drops = remaining;

  const inputPrefix = game.input.trim().toLowerCase();
  if (inputPrefix) {
    const currentTarget = game.drops.find((d) => d.id === game.targetId);
    if (!currentTarget || !currentTarget.romaji.startsWith(inputPrefix)) {
      recomputeTarget(inputPrefix);
    }
  } else {
    game.targetId = null;
  }

  const shakeRemaining = game.shake.untilMs - ts;
  const shakeActive = shakeRemaining > 0 && game.shake.durationMs > 0;
  let shakeX = 0;
  let shakeY = 0;
  if (shakeActive) {
    const p = clamp(shakeRemaining / game.shake.durationMs, 0, 1);
    const mag = game.shake.mag * p;
    shakeX = Math.sin(ts * 0.09) * mag;
    shakeY = Math.cos(ts * 0.11) * mag;
  }

  drawBackground(rect, ts);
  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawDrops(rect, ts);
  drawEffects(dt);
  drawTypedInput(rect);
  ctx.restore();
  drawFlash(rect, dt);
  updateHud();

  requestAnimationFrame(tick);
}

function keepInputFocused() {}

function isUiControlTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }
  if (target.closest(".controls")) {
    return true;
  }
  if (target.closest("details.range")) {
    return true;
  }
  if (target.closest(".modal")) {
    return true;
  }
  const tag = target.tagName.toLowerCase();
  if (["select", "option", "button", "summary"].includes(tag)) {
    return true;
  }
  if (tag === "input") {
    return true;
  }
  return false;
}

function init() {
  const onResize = () => {
    resizeCanvas();
    renderStaticBackground();
  };
  onResize();
  window.addEventListener("resize", onResize);

  const settings = loadSettings();
  loadActiveProfileIntoGame();
  scriptModeEl.value = settings.scriptMode;
  showHintsEl.checked = settings.showHints;
  lengthOnlyEl.checked = Boolean(settings.lengthOnly);
  game.lengthOnly = Boolean(settings.lengthOnly);
  practiceOnlyEl.checked = Boolean(settings.practiceOnly);
  game.practiceOnly = Boolean(settings.practiceOnly);
  game.fallSpeed = clampFloat(settings.fallSpeed, 0.5, 3, 1.0);
  fallSpeedEl.value = String(game.fallSpeed);
  game.hitsToClear = clampInt(settings.hitsToClear, 1, 999, 50);
  game.missesToFail = clampInt(settings.missesToFail, 1, 999, 10);
  hitsGoalEl.value = String(game.hitsToClear);
  missLimitEl.value = String(game.missesToFail);
  enableYouonEl.checked = Boolean(settings.enableYouon);
  enableSokuonEl.checked = Boolean(settings.enableSokuon);
  game.practice.focusMode = settings.focusMode;
  game.practice.mistakesTopN = clampInt(settings.mistakesTopN, 3, 60, 12);
  game.practice.confusablePreset = settings.confusablePreset;
  focusModeEl.value = game.practice.focusMode;
  mistakesTopNEl.value = String(game.practice.mistakesTopN);
  renderConfusablePresets();
  if (!CONFUSABLE_PRESETS.some((p) => p.id === game.practice.confusablePreset)) {
    game.practice.confusablePreset = CONFUSABLE_PRESETS[0].id;
    persistSettings();
  }
  confusablePresetEl.value = game.practice.confusablePreset;
  game.practice.enabledGroups = new Set(settings.enabledGroups);
  game.practice.enableYouon = Boolean(settings.enableYouon);
  game.practice.enableSokuon = Boolean(settings.enableSokuon);
  computePractice();
  renderPracticeUI();
  updateFocusUi();
  renderProfileSelect();
  updateSubtitle();
  updateHud();
  updatePracticeAvailability();
  updateModeUi();

  scriptModeEl.addEventListener("change", () => {
    persistSettings();
    renderPracticeUI();
    updatePracticeAvailability();
    keepInputFocused();
  });
  showHintsEl.addEventListener("change", () => {
    persistSettings();
    keepInputFocused();
  });
  lengthOnlyEl.addEventListener("change", () => {
    game.lengthOnly = lengthOnlyEl.checked;
    persistSettings();
    keepInputFocused();
  });
  practiceOnlyEl.addEventListener("change", () => {
    if (game.running) {
      practiceOnlyEl.checked = game.practiceOnly;
      setMessage("Pause the game to change practice mode.", "danger");
      return;
    }
    game.practiceOnly = practiceOnlyEl.checked;
    persistSettings();
    updateModeUi();
    startLevel(1);
    updatePracticeAvailability();
    keepInputFocused();
  });

  const onFallSpeedChanged = () => {
    game.fallSpeed = clampFloat(fallSpeedEl.value, 0.5, 3, 1.0);
    fallSpeedEl.value = String(game.fallSpeed);
    persistSettings();
    updateSubtitle();
    keepInputFocused();
  };
  fallSpeedEl.addEventListener("change", onFallSpeedChanged);
  fallSpeedEl.addEventListener("blur", onFallSpeedChanged);
  focusModeEl.addEventListener("change", () => {
    game.practice.focusMode = focusModeEl.value;
    persistSettings();
    updateFocusUi();
    renderPracticeUI();
    updatePracticeAvailability();
    keepInputFocused();
  });
  mistakesTopNEl.addEventListener("change", () => {
    game.practice.mistakesTopN = clampInt(mistakesTopNEl.value, 3, 60, 12);
    mistakesTopNEl.value = String(game.practice.mistakesTopN);
    persistSettings();
    updatePracticeAvailability();
    keepInputFocused();
  });
  confusablePresetEl.addEventListener("change", () => {
    game.practice.confusablePreset = confusablePresetEl.value;
    persistSettings();
    updatePracticeAvailability();
    keepInputFocused();
  });

  profileSelectEl.addEventListener("change", () => {
    const selected = profileSelectEl.value;
    if (game.running) {
      profileSelectEl.value = game.profileId;
      setMessage("Pause the game to switch profile.", "danger");
      return;
    }
    if (setActiveProfile(selected)) {
      renderProfileSelect();
      updateHud();
      updatePracticeAvailability();
    }
    keepInputFocused();
  });
  newProfileBtn.addEventListener("click", () => {
    if (game.running) {
      setMessage("Pause the game to create a new profile.", "danger");
      return;
    }
    const name = window.prompt("New profile name:", "My Profile");
    if (!name || !name.trim()) {
      return;
    }
    createNewProfile(name.trim());
    renderProfileSelect();
    updateHud();
    updatePracticeAvailability();
    keepInputFocused();
  });
  resetProfileBtn.addEventListener("click", () => {
    if (game.running) {
      setMessage("Pause the game to reset stats.", "danger");
      return;
    }
    const ok = window.confirm(`Reset stats for profile "${game.profile.name}"?`);
    if (!ok) {
      return;
    }
    game.profile.stats = {};
    game.profile.totals = { hits: 0, misses: 0, typos: 0, practiceAttempts: 0 };
    saveActiveProfileFromGame();
    updateHud();
    updatePracticeAvailability();
    keepInputFocused();
  });

  function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  exportProfileBtn.addEventListener("click", () => {
    if (game.running) {
      setMessage("Pause the game to export profile.", "danger");
      return;
    }
    saveActiveProfileFromGame();
    downloadJson(`${sanitizeProfileId(game.profile.name)}.json`, {
      version: PROFILE_VERSION,
      name: game.profile.name,
      totals: game.profile.totals,
      stats: game.profile.stats,
      exportedAt: new Date().toISOString(),
    });
    keepInputFocused();
  });
  importProfileBtn.addEventListener("click", () => {
    if (game.running) {
      setMessage("Pause the game to import profile.", "danger");
      return;
    }
    importProfileFileEl.value = "";
    importProfileFileEl.click();
  });
  importProfileFileEl.addEventListener("change", async () => {
    const file = importProfileFileEl.files && importProfileFileEl.files[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid JSON");
      }
      const nameFromFile = file.name.replace(/\\.json$/i, "");
      const name =
        typeof parsed.name === "string" && parsed.name.trim()
          ? parsed.name.trim()
          : nameFromFile || "Imported";

      const existing = listProfiles().find((p) => p.name === name);
      let profileId = existing ? existing.id : null;
      if (profileId && !window.confirm(`Overwrite existing profile "${name}"?`)) {
        return;
      }
      if (!profileId) {
        profileId = createNewProfile(name);
      }
      saveProfileData(profileId, normalizeProfileData(parsed, name));
      setActiveProfile(profileId);
      renderProfileSelect();
      updateHud();
      updatePracticeAvailability();
      setMessage(`Imported profile: ${name}`, "ok");
    } catch (e) {
      setMessage(`Import failed: ${e.message || "invalid file"}`, "danger");
    } finally {
      keepInputFocused();
    }
  });

  const onThresholdChanged = () => {
    game.hitsToClear = clampInt(hitsGoalEl.value, 1, 999, 50);
    game.missesToFail = clampInt(missLimitEl.value, 1, 999, 10);
    hitsGoalEl.value = String(game.hitsToClear);
    missLimitEl.value = String(game.missesToFail);
    persistSettings();
    updateHud();
    updateSubtitle();
    if (game.running && !game.practiceOnly) {
      if (game.hits >= game.hitsToClear) {
        endAsCleared();
      } else if (game.misses >= game.missesToFail) {
        endAsFailed();
      }
    }
    keepInputFocused();
  };

  hitsGoalEl.addEventListener("change", onThresholdChanged);
  missLimitEl.addEventListener("change", onThresholdChanged);
  hitsGoalEl.addEventListener("blur", onThresholdChanged);
  missLimitEl.addEventListener("blur", onThresholdChanged);
  enableYouonEl.addEventListener("change", () => {
    game.practice.enableYouon = enableYouonEl.checked;
    persistSettings();
    updatePracticeAvailability();
    keepInputFocused();
  });
  enableSokuonEl.addEventListener("change", () => {
    game.practice.enableSokuon = enableSokuonEl.checked;
    persistSettings();
    updatePracticeAvailability();
    keepInputFocused();
  });

  selectAllBtn.addEventListener("click", () => {
    for (const g of GOJUON_GROUPS) {
      game.practice.enabledGroups.add(g.id);
    }
    renderPracticeUI();
    persistSettings();
    updatePracticeAvailability();
    keepInputFocused();
  });
  selectNoneBtn.addEventListener("click", () => {
    game.practice.enabledGroups.clear();
    renderPracticeUI();
    persistSettings();
    updatePracticeAvailability();
    keepInputFocused();
  });
  rangeDetailsEl.addEventListener("toggle", () => {
    if (!rangeDetailsEl.open) {
      keepInputFocused();
    }
  });

  startPauseBtn.addEventListener("click", () => {
    keepInputFocused();
    if (!game.practice.allowedMonos.length) {
      rangeDetailsEl.open = true;
      setMessage("Select a Practice range first.", "danger");
      return;
    }
    if (game.finished) {
      game.finished = false;
    }
    if (!game.running) {
      if (game.hits === 0 && game.misses === 0 && game.drops.length === 0) {
        setMessage(`Level ${game.level} started.`, "");
      }
      setRunning(true);
      return;
    }
    setRunning(false);
  });

  resetBtn.addEventListener("click", () => {
    if (game.modalOpen) {
      closeModal();
    }
    setRunning(false);
    startLevel(1);
    keepInputFocused();
  });
  document.addEventListener("keydown", (e) => {
    if (game.modalOpen) {
      if (e.key === "Enter" && typeof modalPrimaryAction === "function") {
        e.preventDefault();
        modalPrimaryAction();
      } else if (e.key === "Escape" && typeof modalSecondaryAction === "function") {
        e.preventDefault();
        modalSecondaryAction();
      }
      return;
    }
    if (isUiControlTarget(e.target)) {
      return;
    }
    if (document.activeElement && isUiControlTarget(document.activeElement)) {
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      togglePauseHotkey();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      game.input = "";
      game.inputValid = true;
      game.targetId = null;
      updateHud();
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      if (game.input) {
        game.input = game.input.slice(0, -1);
        onInputChanged();
      }
      return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
      game.input += e.key.toLowerCase();
      onInputChanged();
      setTimeout(registerTypo, 0);
    }
  });

  startLevel(1);
  drawBackground(canvas.getBoundingClientRect(), nowMs());
  keepInputFocused();

  modalPrimaryBtn.addEventListener("click", () => {
    if (typeof modalPrimaryAction === "function") {
      modalPrimaryAction();
    }
  });
  modalSecondaryBtn.addEventListener("click", () => {
    if (typeof modalSecondaryAction === "function") {
      modalSecondaryAction();
    }
  });
  levelModalEl.addEventListener("pointerdown", (e) => {
    if (e.target === levelModalEl && typeof modalSecondaryAction === "function") {
      modalSecondaryAction();
    }
  });
}

init();
