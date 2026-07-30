const THAKAA_INTERNAL_PAUSE_BEATS = 0.5;
const THAKAA_TRAILING_GAP_BEATS = 1.0;
const THAKKA_INTERNAL_PAUSE_BEATS = 0.5;
const THAKKA_TRAILING_GAP_BEATS = 0;
// Adjust this interval after confirming which Treble/Chenda beats align with Bass counts 1, 2, and 3.
const COUNT_123_INTERVAL_BEATS = 0.75;
const COUNT_123_TRAILING_GAP_BEATS = 0;
const THA_PICKUP_GAP_BEATS = 1.0;

const WORD_DEFINITIONS = {
  THA: {
    hits: [{ hand: "R", offsetBeats: 0, accented: false }],
    durationBeats: 1,
    colorClass: "word-tha",
    color: { fill: "#f2b94b", glow: "rgba(242,185,75,.48)", text: "#090a0e" },
    pickupGapAfterBeats: THA_PICKUP_GAP_BEATS,
    pickupTarget: "nextNonTHA",
    description: "One right-hand hit followed by a pause before the next non-THA word."
  },
  THAKA: {
    hits: [{ hand: "R", offsetBeats: 0, accented: false }, { hand: "L", offsetBeats: 1, accented: false }],
    durationBeats: 2,
    colorClass: "word-thaka",
    color: { fill: "#42c8c8", glow: "rgba(66,200,200,.42)", text: "#071011" },
    description: "Right then Left with normal sequential spacing."
  },
  THAKAA: {
    hits: [{ hand: "R", offsetBeats: 0, accented: false }, { hand: "L", offsetBeats: 1 + THAKAA_INTERNAL_PAUSE_BEATS, accented: false }],
    durationBeats: 2 + THAKAA_INTERNAL_PAUSE_BEATS,
    trailingGapBeats: THAKAA_TRAILING_GAP_BEATS,
    colorClass: "word-thakaa",
    color: { fill: "#60d67f", glow: "rgba(96,214,127,.42)", text: "#07100a" },
    description: "Right, 0.5-beat pause, Left, then 1 full silent beat before the next word."
  },
  THAKKA: {
    hits: [{ hand: "R", offsetBeats: 0, accented: false }, { hand: "L", offsetBeats: 1 + THAKKA_INTERNAL_PAUSE_BEATS, accented: false }],
    durationBeats: 2,
    trailingGapBeats: THAKKA_TRAILING_GAP_BEATS,
    colorClass: "word-thakka",
    color: { fill: "#e95a45", glow: "rgba(233,90,69,.5)", text: "#fff8ec" },
    description: "Right at the normal word start, a slightly extended pause, then Left close to the next word."
  },
  THAKITA: {
    hits: [{ hand: "R", offsetBeats: 0, accented: false }, { hand: "R", offsetBeats: 1, accented: false }, { hand: "L", offsetBeats: 2, accented: false }],
    durationBeats: 3,
    colorClass: "word-thakita",
    color: { fill: "#8d7cff", glow: "rgba(141,124,255,.46)", text: "#090a0e" },
    description: "Right, Right, Left."
  },
  "123": {
    hits: [
      { hand: "R", offsetBeats: 0, accented: false, displayLabel: "1" },
      { hand: "R", offsetBeats: COUNT_123_INTERVAL_BEATS, accented: false, displayLabel: "2" },
      { hand: "R", offsetBeats: COUNT_123_INTERVAL_BEATS * 2, accented: false, displayLabel: "3" }
    ],
    durationBeats: COUNT_123_INTERVAL_BEATS * 3,
    trailingGapBeats: COUNT_123_TRAILING_GAP_BEATS,
    colorClass: "word-123",
    preferredPart: "bass",
    color: { fill: "#ff8fc7", glow: "rgba(255,143,199,.42)", text: "#130811" },
    description: "Three evenly spaced Right-hand Bass hits counted as 1, 2, 3."
  }
};

const REST_DEFINITIONS = {
  REST1: { durationBeats: 1, description: "One silent beat" },
  REST2: { durationBeats: 2, description: "Two silent beats" },
  REST4: { durationBeats: 4, description: "Four silent beats" }
};

const DEFAULT_SECTION_COUNT = 4;
const DISPLAY_WORD_ORDER = ["THA", "THAKA", "THAKAA", "THAKKA", "THAKITA", "123"];
const DISPLAY_REST_ORDER = ["REST1", "REST2", "REST4"];
const LEGACY_WORD_ALIASES = { TA: "THA" };
const SONG_LIBRARY_KEY = "chendaPracticeSongs";
const PARTS = ["treble", "bass"];
const countInBeats = 4;
const prepGapBeats = 4;
const hitFadeBeats = 0.34;
const defaultSong = {
  id: "",
  name: "Unsaved practice song",
  sections: [
    { id: "section-draft-1", name: "", treblePattern: "THAKITA THAKA\nTHAKKA THAKA", bassPattern: "THA THAKA REST1\nTHAKKA THAKA" },
    { id: "section-draft-2", name: "", treblePattern: "", bassPattern: "" },
    { id: "section-draft-3", name: "", treblePattern: "", bassPattern: "" },
    { id: "section-draft-4", name: "", treblePattern: "", bassPattern: "" }
  ],
  lastPart: "treble"
};

const $ = id => document.getElementById(id);
const app = $("app");
const savedSongsSelect = $("savedSongs");
const newSongBtn = $("newSong");
const editSongBtn = $("editSong");
const deleteSongBtn = $("deleteSong");
const bpm = $("bpm");
const bpmNumber = $("bpmNumber");
const metronomeToggle = $("metronomeToggle");
const metronomeVolume = $("metronomeVolume");
const metronomeSubdivision = $("metronomeSubdivision");
const startBtn = $("start");
const stopBtn = $("stop");
const restartBtn = $("restart");
const fullscreenBtn = $("fullscreen");
const fullscreenStopBtn = $("fullscreenStop");
const fullscreenRestartBtn = $("fullscreenRestart");
const exitFullscreenBtn = $("exitFullscreen");
const stateEl = $("state");
const songTitleEl = $("songTitle");
const activeEditorLabel = $("activeEditorLabel");
const insertButtonsEl = $("insertButtons");
const sectionIndicatorEl = $("sectionIndicator");
const loopStatusEl = $("loopStatus");
const playTimerEl = $("playTimer");
const trebleEditorsEl = $("trebleEditors");
const bassEditorsEl = $("bassEditors");
const trebleNowEl = $("trebleNow");
const bassNowEl = $("bassNow");
const wordDefinitionListEl = $("wordDefinitionList");
const songModal = $("songModal");
const songModalTitle = $("songModalTitle");
const songNameInput = $("songNameInput");
const sectionEditorList = $("sectionEditorList");
const addSectionBtn = $("addSection");
const saveSongBtn = $("saveSong");
const cancelSongBtn = $("cancelSong");
const cancelSongTopBtn = $("cancelSongTop");
const canvases = {
  treble: { canvas: $("trebleLane"), nowEl: trebleNowEl, hits: [], groups: [] },
  bass: { canvas: $("bassLane"), nowEl: bassNowEl, hits: [], groups: [] }
};
PARTS.forEach(part => { canvases[part].ctx = canvases[part].canvas.getContext("2d"); });

let currentSongId = "";
let currentSong = cloneSong(defaultSong);
let editorSong = null;
let activeEditor = null;
let activeEditorPart = "treble";
let running = false;
let startTime = 0;
let pauseElapsed = 0;
let raf = 0;
let loopCount = 4;
let builtLoopCount = 0;
let totalBeats = 0;
let completedLoops = 0;
let loopEndBeats = [];
let sectionBoundaries = [];
let lineBoundaries = [];
let lastActiveLineKey = "";
let metronomeOn = false;
let lastMetronomeBeat = -1;
let audioContext = null;
let appInitialized = false;
const editorCursor = new WeakMap();

function cloneSong(song) { return JSON.parse(JSON.stringify(song)); }
function wordDef(token) { return WORD_DEFINITIONS[token]; }
function restDef(token) { return REST_DEFINITIONS[token]; }
function tokenDef(token) { return wordDef(token) || restDef(token); }
function supportedWords() { return DISPLAY_WORD_ORDER.filter(word => wordDef(word)); }
function supportedRests() { return DISPLAY_REST_ORDER.filter(rest => restDef(rest)); }
function normalizeToken(token) { return LEGACY_WORD_ALIASES[token] || token; }
function tokenize(text) { return (String(text || "").toUpperCase().match(/[A-Z0-9]+/g) || []).map(normalizeToken); }
function splitPatternLines(text) { return String(text || "").replace(/\r\n?/g, "\n").split("\n"); }
function normalizePatternText(text) { return splitPatternLines(text).map(line => tokenize(line).filter(token => tokenDef(token)).join(" ")).join("\n"); }
function invalidPatternTokens(text) { return [...new Set(tokenize(text).filter(token => !tokenDef(token)))]; }
function lineTokens(pattern, lineIndex) { return tokenize(splitPatternLines(pattern)[lineIndex] || "").filter(token => tokenDef(token)); }
function patternLineCount(section) { return Math.max(1, splitPatternLines(section.treblePattern).length, splitPatternLines(section.bassPattern).length); }
function partLabel(part) { return part === "bass" ? "Bass" : "Treble"; }
function patternKey(part) { return part === "bass" ? "bassPattern" : "treblePattern"; }
function makeSection(seed = {}) {
  return {
    id: seed.id || "section-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    name: seed.name || "",
    treblePattern: normalizePatternText(seed.treblePattern || ""),
    bassPattern: normalizePatternText(seed.bassPattern || "")
  };
}
function createDefaultSections() { return Array.from({ length: DEFAULT_SECTION_COUNT }, (_, index) => makeSection({ name: "", treblePattern: "", bassPattern: "", id: "section-" + Date.now() + "-" + index + "-" + Math.random().toString(36).slice(2, 8) })); }
function normalizeSong(song) {
  const id = song && song.id ? String(song.id) : "song-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const oldParts = song && song.parts && typeof song.parts === "object" ? song.parts : null;
  const rawSections = Array.isArray(song && song.sections) && song.sections.length ? song.sections : [{ name: "", bassPattern: oldParts ? oldParts.bass : song?.bassPattern, treblePattern: oldParts ? oldParts.treble : song?.treblePattern }];
  return {
    id,
    name: String(song && song.name ? song.name : "Untitled Song"),
    sections: rawSections.map(makeSection),
    lastPart: "treble"
  };
}
function readSongLibrary() {
  try {
    const raw = localStorage.getItem(SONG_LIBRARY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : Object.values(parsed || {});
    return list.map(normalizeSong).filter(song => song.name.trim());
  } catch (error) {
    return [];
  }
}
function writeSongLibrary(songs) { localStorage.setItem(SONG_LIBRARY_KEY, JSON.stringify(songs.map(normalizeSong))); }
function findSong(id = currentSongId) { return readSongLibrary().find(song => song.id === id); }
function saveCurrentSongIfPersisted() {
  if (!currentSongId) return;
  const songs = readSongLibrary();
  const index = songs.findIndex(song => song.id === currentSongId);
  if (index >= 0) {
    songs[index] = normalizeSong(currentSong);
    writeSongLibrary(songs);
    refreshSavedSongs(currentSongId);
  }
}
function refreshSavedSongs(selectedId = currentSongId) {
  const songs = readSongLibrary().sort((a, b) => a.name.localeCompare(b.name));
  savedSongsSelect.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = songs.length ? "Choose a saved song" : "No saved songs";
  savedSongsSelect.appendChild(empty);
  songs.forEach(song => {
    const option = document.createElement("option");
    option.value = song.id;
    option.textContent = song.name;
    savedSongsSelect.appendChild(option);
  });
  if (selectedId && songs.some(song => song.id === selectedId)) savedSongsSelect.value = selectedId;
}
function loadSong(id) {
  const song = findSong(id);
  if (!song) return;
  currentSongId = song.id;
  currentSong = normalizeSong(song);
  renderWorkspace();
  resetReference();
}
function clearSelectedSong() {
  currentSongId = "";
  currentSong = cloneSong(defaultSong);
  renderWorkspace();
  resetReference();
}

function beatMs() { return 60000 / Number(bpm.value); }
function clampBpm(value) { const parsed = Number(value); if (!Number.isFinite(parsed)) return Number(bpm.value) || 100; return Math.max(100, Math.min(500, Math.round(parsed))); }
function formatTime(ms) { const total = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0"); }
function updatePlayTimer(now) { playTimerEl.textContent = formatTime(now); }
function isInfiniteLoop() { return loopCount === Infinity; }
function loopDisplay() { return isInfiniteLoop() ? "\u221e" : "x" + loopCount; }
function beatsText(value) { const text = Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""); return text + " " + (Math.abs(value - 1) < .001 ? "beat" : "beats"); }

function firstTokenAfterLine(pattern, lineIndex) {
  const lines = splitPatternLines(pattern);
  for (let index = lineIndex; index < lines.length; index++) {
    const token = lineTokens(pattern, index)[0];
    if (token) return token;
  }
  return "";
}
function patternDuration(pattern) { const lines = splitPatternLines(pattern); return lines.reduce((sum, line, index) => sum + measureTokens(tokenize(line).filter(token => tokenDef(token)), firstTokenAfterLine(pattern, index + 1)), 0); }
function sectionDuration(pattern) { return patternDuration(pattern); }
function measureTokens(tokens, nextLineFirstToken = "") {
  let beat = 0;
  tokens.forEach((token, index) => {
    const def = tokenDef(token);
    const next = tokens[index + 1] || (index === tokens.length - 1 ? nextLineFirstToken : "");
    if (!def) return;
    if (restDef(token)) { beat += def.durationBeats; return; }
    beat += def.durationBeats;
    if (next && wordDef(next) && def.trailingGapBeats) beat += def.trailingGapBeats;
    if (next && wordDef(next) && def.pickupGapAfterBeats && def.pickupTarget === "nextNonTHA" && next !== "THA") beat += def.pickupGapAfterBeats;
  });
  return beat;
}
function lineAlignment(section, lineIndex) {
  const treble = measureTokens(lineTokens(section.treblePattern, lineIndex), firstTokenAfterLine(section.treblePattern, lineIndex + 1));
  const bass = measureTokens(lineTokens(section.bassPattern, lineIndex), firstTokenAfterLine(section.bassPattern, lineIndex + 1));
  const duration = treble;
  const diff = bass - treble;
  const aligned = Math.abs(diff) < .001;
  const bassSilentBeats = diff < 0 ? Math.abs(diff) : 0;
  const bassOverflowBeats = diff > 0 ? diff : 0;
  const status = aligned ? "Aligned to Treble" : bassOverflowBeats ? "Bass exceeds Treble by " + beatsText(bassOverflowBeats) : "Bass silent for final " + beatsText(bassSilentBeats);
  return { line: lineIndex + 1, treble, bass, duration, aligned, shorter: bassSilentBeats ? "bass" : "", overflow: bassOverflowBeats > 0, bassSilentBeats, bassOverflowBeats, text: "Line " + (lineIndex + 1) + " - Treble duration: " + beatsText(treble) + " - Bass duration: " + beatsText(bass) + " - " + status };
}
function sectionLineAlignments(section) { return Array.from({ length: patternLineCount(section) }, (_, index) => lineAlignment(section, index)); }
function sectionAlignment(section) {
  const lines = sectionLineAlignments(section);
  const treble = lines.reduce((sum, line) => sum + line.treble, 0);
  const bass = lines.reduce((sum, line) => sum + line.bass, 0);
  const duration = lines.reduce((sum, line) => sum + line.duration, 0);
  const bassSilentBeats = lines.reduce((sum, line) => sum + line.bassSilentBeats, 0);
  const bassOverflowBeats = lines.reduce((sum, line) => sum + line.bassOverflowBeats, 0);
  const overflowLines = lines.filter(line => line.overflow).length;
  const aligned = !bassSilentBeats && !bassOverflowBeats;
  const text = aligned ? "Manual sync aligned: " + beatsText(duration) : bassOverflowBeats ? "Manual sync: Bass exceeds Treble on " + overflowLines + " " + (overflowLines === 1 ? "line" : "lines") + " by " + beatsText(bassOverflowBeats) : "Manual sync: Bass silent for " + beatsText(bassSilentBeats);
  return { treble, bass, duration, aligned, shorter: bassSilentBeats ? "bass" : "", overflow: bassOverflowBeats > 0, bassSilentBeats, bassOverflowBeats, text, lines };
}
function restPaddingForBeats(beats) {
  const rounded = Math.round(beats);
  if (Math.abs(beats - rounded) > .001) return null;
  const tokens = [];
  let remaining = rounded;
  [["REST4", 4], ["REST2", 2], ["REST1", 1]].forEach(([token, size]) => {
    while (remaining >= size) { tokens.push(token); remaining -= size; }
  });
  return tokens;
}
function appendTokens(text, tokens) { const clean = normalizePatternText(text); return (clean ? clean + " " : "") + tokens.join(" "); }

function timingSummary(section, part, lineIndex) {
  const pattern = section[patternKey(part)];
  const tokens = lineTokens(pattern, lineIndex);
  const nextLineFirstToken = firstTokenAfterLine(pattern, lineIndex + 1);
  let beat = 0;
  const entries = [];
  tokens.forEach((token, index) => {
    const def = tokenDef(token);
    const next = tokens[index + 1] || (index === tokens.length - 1 ? nextLineFirstToken : "");
    if (!def) return;
    const start = beat;
    if (restDef(token)) {
      beat += def.durationBeats;
      entries.push(token + " = beats " + beatNumber(start) + "-" + beatNumber(beat));
      return;
    }
    const hitText = def.hits
      .slice()
      .sort((a, b) => a.offsetBeats - b.offsetBeats)
      .map(hit => (hit.displayLabel || hit.hand) + "@" + beatNumber(start + hit.offsetBeats))
      .join(", ");
    entries.push(token + " begins at beat " + beatNumber(start) + " (" + hitText + ")");
    beat += def.durationBeats;
    if (next && wordDef(next) && def.trailingGapBeats) beat += def.trailingGapBeats;
    if (next && wordDef(next) && def.pickupGapAfterBeats && def.pickupTarget === "nextNonTHA" && next !== "THA") beat += def.pickupGapAfterBeats;
  });
  return entries.length ? entries.join("; ") : "No tokens";
}
function beatNumber(value) { return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""); }

function buildTimeline() {
  PARTS.forEach(part => { canvases[part].hits = []; canvases[part].groups = []; });
  sectionBoundaries = [];
  lineBoundaries = [];
  loopEndBeats = [];
  builtLoopCount = 0;
  completedLoops = 0;
  totalBeats = countInBeats + prepGapBeats;
  const loopsToBuild = isInfiniteLoop() ? 8 : loopCount;
  for (let i = 0; i < loopsToBuild; i++) appendSongLoop();
}
function appendSongLoop() {
  const loopNumber = builtLoopCount + 1;
  currentSong.sections.forEach((section, sectionIndex) => {
    const sectionStart = totalBeats;
    const lineCount = patternLineCount(section);
    let lineStart = sectionStart;
    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      const trebleDuration = schedulePartLine(section, "treble", lineIndex, lineStart, loopNumber, sectionIndex + 1);
      const bassDuration = schedulePartLine(section, "bass", lineIndex, lineStart, loopNumber, sectionIndex + 1);
      const lineDuration = trebleDuration;
      lineBoundaries.push({ loopNumber, sectionNumber: sectionIndex + 1, sectionName: section.name || "", lineNumber: lineIndex + 1, startBeat: lineStart, endBeat: lineStart + lineDuration });
      lineStart += lineDuration;
    }
    sectionBoundaries.push({ loopNumber, sectionNumber: sectionIndex + 1, sectionName: section.name || "", startBeat: sectionStart, endBeat: lineStart });
    totalBeats = lineStart;
  });
  loopEndBeats.push(totalBeats);
  builtLoopCount++;
}
function schedulePartLine(section, part, lineIndex, lineStart, loopNumber, sectionNumber) {
  const tokens = lineTokens(section[patternKey(part)], lineIndex);
  const nextLineFirstToken = firstTokenAfterLine(section[patternKey(part)], lineIndex + 1);
  let beat = lineStart;
  tokens.forEach((token, index) => {
    const def = tokenDef(token);
    const next = tokens[index + 1] || (index === tokens.length - 1 ? nextLineFirstToken : "");
    if (restDef(token)) { beat += def.durationBeats; return; }
    const lastHitOffset = Math.max(...def.hits.map(hit => hit.offsetBeats));
    def.hits.forEach((hit, hitIndex) => {
      canvases[part].hits.push({ hand: hit.hand, displayLabel: hit.displayLabel || hit.hand, accent: !!hit.accented, word: token, part, hitIndex, timeBeat: beat + hit.offsetBeats, loopNumber, sectionNumber, lineNumber: lineIndex + 1 });
    });
    canvases[part].groups.push({ word: token, startBeat: beat, endBeat: beat + lastHitOffset, centerBeat: beat + lastHitOffset / 2, loopNumber, sectionNumber, lineNumber: lineIndex + 1 });
    beat += def.durationBeats;
    if (next && wordDef(next) && def.trailingGapBeats) beat += def.trailingGapBeats;
    if (next && wordDef(next) && def.pickupGapAfterBeats && def.pickupTarget === "nextNonTHA" && next !== "THA") beat += def.pickupGapAfterBeats;
  });
  return beat - lineStart;
}
function ensureInfiniteTimeline(nowBeat) { if (!isInfiniteLoop()) return; while (totalBeats - nowBeat < 32) appendSongLoop(); }
function updateLoopCompletion(nowBeat) { while (completedLoops < loopEndBeats.length && nowBeat >= loopEndBeats[completedLoops]) completedLoops++; }
function currentSection(nowBeat) {
  if (!sectionBoundaries.length) return null;
  return sectionBoundaries.find(section => nowBeat >= section.startBeat && nowBeat < section.endBeat) || (nowBeat < countInBeats + prepGapBeats ? sectionBoundaries[0] : sectionBoundaries[sectionBoundaries.length - 1]);
}
function currentLine(nowBeat) {
  if (!lineBoundaries.length) return null;
  return lineBoundaries.find(line => nowBeat >= line.startBeat && nowBeat < line.endBeat) || (nowBeat < countInBeats + prepGapBeats ? lineBoundaries[0] : lineBoundaries[lineBoundaries.length - 1]);
}
function updateStatus(nowBeat) {
  const section = currentSection(nowBeat);
  const line = currentLine(nowBeat);
  sectionIndicatorEl.textContent = section ? "Section " + section.sectionNumber + " of " + currentSong.sections.length + (line ? "   Line " + line.lineNumber : "") : "Section -";
  const currentLoop = isInfiniteLoop() ? completedLoops + 1 : Math.min(loopCount, completedLoops + 1);
  loopStatusEl.textContent = "Loop: " + currentLoop + " / " + (isInfiniteLoop() ? "\u221e" : loopCount) + "   Completed: " + completedLoops;
  highlightActiveLine(line);
  PARTS.forEach(part => {
    const next = canvases[part].hits.find(hit => hit.timeBeat >= nowBeat - .05);
    const active = canvases[part].groups.find(group => nowBeat >= group.startBeat - .22 && nowBeat <= group.endBeat + .22);
    canvases[part].nowEl.textContent = nowBeat < countInBeats ? String(Math.min(4, Math.floor(nowBeat) + 1)) : nowBeat < countInBeats + prepGapBeats ? "Ready" : active ? active.word : next ? "Next " + next.word : "-";
  });
}
function highlightActiveLine(line) {
  document.querySelectorAll(".lineRow.activeLine").forEach(row => row.classList.remove("activeLine"));
  if (!line || !running) { lastActiveLineKey = ""; return; }
  const activeKey = line.loopNumber + ":" + line.sectionNumber + ":" + line.lineNumber;
  const shouldReveal = activeKey !== lastActiveLineKey;
  lastActiveLineKey = activeKey;
  PARTS.forEach(part => {
    const row = document.querySelector(".lineRow[data-part='" + part + "'][data-section-index='" + (line.sectionNumber - 1) + "'][data-line-index='" + (line.lineNumber - 1) + "']");
    if (row) {
      row.classList.add("activeLine");
      revealActiveLineInsideEditor(row, shouldReveal);
    }
  });
}

function revealActiveLineInsideEditor(row, shouldReveal) {
  const pageX = window.scrollX || 0;
  const pageY = window.scrollY || 0;
  const details = row.closest("details.sectionCard");
  if (details) details.open = true;
  if (shouldReveal) {
    const container = row.closest(".partEditorArea");
    if (container && typeof container.scrollTop === "number") {
      const rowTop = row.offsetTop;
      const rowBottom = rowTop + row.offsetHeight;
      const viewTop = container.scrollTop;
      const viewBottom = viewTop + container.clientHeight;
      if (rowTop < viewTop) container.scrollTop = Math.max(0, rowTop - 12);
      if (rowBottom > viewBottom) container.scrollTop = rowBottom - container.clientHeight + 12;
    }
  }
  if (typeof window.scrollTo === "function") window.scrollTo(pageX, pageY);
}

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.round(rect.width * ratio));
  const height = Math.max(360, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
}
function laneXForHand(hand, leftX, rightX) { return hand === "R" ? rightX : leftX; }
function draw(now) {
  const nowBeat = now / beatMs();
  updatePlayTimer(now);
  updateStatus(nowBeat);
  PARTS.forEach(part => drawPart(part, nowBeat));
}
function drawPart(part, nowBeat) {
  const target = canvases[part];
  const canvas = target.canvas;
  const ctx = target.ctx;
  resizeCanvas(canvas);
  const w = canvas.width, h = canvas.height;
  const full = app.classList.contains("practiceFullscreen") && window.innerWidth > 760;
  const visualScale = full ? 1.35 : 1;
  const hitY = h - (full ? 128 : 104);
  const topPad = full ? 92 : 72;
  const leadBeats = 8;
  const laneW = full ? Math.min(180, w * .32) : Math.min(138, w * .28);
  const gap = full ? Math.max(10, Math.min(18, w * .035)) : Math.max(8, Math.min(12, w * .03));
  const leftX = w / 2 - laneW / 2 - gap / 2;
  const rightX = w / 2 + laneW / 2 + gap / 2;
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, part === "treble" ? "#161923" : "#141923");
  bg.addColorStop(1, "#08090d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  drawLane(ctx, canvas, leftX, laneW, "Left", "#42c8c8", visualScale);
  drawLane(ctx, canvas, rightX, laneW, "Right", "#f2b94b", visualScale);
  drawDivider(ctx, canvas, leftX, rightX);
  drawHitLine(ctx, leftX, rightX, laneW, hitY, w, full);
  drawCountIn(ctx, nowBeat, w, h, hitY, visualScale);
  drawSectionBands(ctx, nowBeat, sectionBoundaries, hitY, topPad, leadBeats, w, h);
  target.groups.forEach(group => {
    const y = hitY - (group.centerBeat - nowBeat) / leadBeats * (hitY - topPad);
    if (y < -80 || y > h + 80) return;
    const def = wordDef(group.word);
    const x1 = laneXForHand(def.hits[0].hand, leftX, rightX);
    const x2 = laneXForHand(def.hits[def.hits.length - 1].hand, leftX, rightX);
    ctx.save();
    ctx.globalAlpha = .8;
    ctx.fillStyle = "rgba(255,248,236,.74)";
    ctx.font = "900 " + Math.round(14 * visualScale) + "px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(group.word, (x1 + x2) / 2, y - (full ? 52 : 39));
    ctx.restore();
  });
  target.hits.forEach(hit => {
    const delta = nowBeat - hit.timeBeat;
    if (delta > hitFadeBeats) return;
    const y = delta >= 0 ? hitY : hitY - (hit.timeBeat - nowBeat) / leadBeats * (hitY - topPad);
    if (y < -90 || y > h + 90) return;
    drawNote(ctx, canvas, laneXForHand(hit.hand, leftX, rightX), y, hit, delta, visualScale);
  });
}
function drawLane(ctx, canvas, x, laneW, label, color, visualScale) {
  ctx.fillStyle = "rgba(255,255,255,.045)";
  ctx.fillRect(x - laneW / 2, 0, laneW, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,.14)";
  ctx.lineWidth = visualScale > 1 ? 3 : 2;
  ctx.strokeRect(x - laneW / 2, 0, laneW, canvas.height);
  ctx.fillStyle = color;
  ctx.font = "850 " + Math.round(16 * visualScale) + "px Inter, system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, x, visualScale > 1 ? 22 : 16);
  ctx.fillStyle = "rgba(255,255,255,.038)";
  for (let y = visualScale > 1 ? 76 : 64; y < canvas.height; y += visualScale > 1 ? 50 : 40) ctx.fillRect(x - laneW / 2, y, laneW, 1);
}
function drawDivider(ctx, canvas, leftX, rightX) {
  const x = (leftX + rightX) / 2;
  ctx.save();
  ctx.strokeStyle = "rgba(255,248,236,.32)";
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}
function drawHitLine(ctx, leftX, rightX, laneW, hitY, w, full) {
  const linePad = full ? 34 : 18;
  ctx.fillStyle = "rgba(242,185,75,.13)";
  ctx.fillRect(leftX - laneW / 2 - linePad, hitY - (full ? 19 : 14), rightX - leftX + laneW + linePad * 2, full ? 38 : 28);
  ctx.save();
  ctx.shadowBlur = full ? 14 : 6;
  ctx.shadowColor = "rgba(255,241,160,.54)";
  ctx.strokeStyle = "#fff1a0";
  ctx.lineWidth = full ? 10 : 7;
  ctx.beginPath();
  ctx.moveTo(Math.max(18, leftX - laneW / 2 - linePad), hitY);
  ctx.lineTo(Math.min(w - 18, rightX + laneW / 2 + linePad), hitY);
  ctx.stroke();
  ctx.restore();
}
function drawCountIn(ctx, nowBeat, w, h, hitY, visualScale) {
  if (nowBeat >= countInBeats) return;
  const count = Math.floor(nowBeat) + 1;
  const progress = nowBeat - Math.floor(nowBeat);
  ctx.save();
  ctx.globalAlpha = .92 - progress * .2;
  ctx.fillStyle = "rgba(255,248,236,.11)";
  ctx.beginPath();
  ctx.arc(w / 2, hitY - 138 * visualScale, (58 + progress * 16) * visualScale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff8ec";
  ctx.font = "950 " + Math.round(62 * visualScale) + "px Inter, system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(count), w / 2, hitY - 140 * visualScale);
  ctx.restore();
}
function drawSectionBands(ctx, nowBeat, sections, hitY, topPad, leadBeats, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,248,236,.16)";
  ctx.fillStyle = "rgba(255,248,236,.48)";
  ctx.font = "800 12px Inter, system-ui";
  ctx.textAlign = "left";
  sections.forEach(section => {
    const y = hitY - (section.startBeat - nowBeat) / leadBeats * (hitY - topPad);
    if (y < -30 || y > h + 30) return;
    ctx.beginPath();
    ctx.moveTo(18, y);
    ctx.lineTo(w - 18, y);
    ctx.stroke();
    ctx.fillText("Section " + section.sectionNumber, 24, y + 14);
  });
  ctx.restore();
}
function drawNote(ctx, canvas, x, y, hit, delta, visualScale) {
  const def = wordDef(hit.word) || wordDef("THA");
  const palette = def.color;
  const hitting = delta >= 0;
  const progress = hitting ? Math.min(1, delta / hitFadeBeats) : 0;
  const hitScale = hitting ? 1.08 - progress * .08 : 1;
  const alpha = hitting ? 1 - progress : .98;
  const noteW = Math.max(68 * visualScale, Math.min(118 * visualScale, canvas.width * .22));
  const noteH = Math.max(48 * visualScale, Math.min(74 * visualScale, canvas.height * .13));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(hitScale, hitScale);
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = hitting ? 26 * visualScale - progress * 10 : 18 * visualScale;
  ctx.shadowColor = palette.glow;
  ctx.fillStyle = palette.fill;
  roundRect(ctx, -noteW / 2, -noteH / 2, noteW, noteH, 10 * visualScale);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hitting ? "#fff8ec" : "rgba(255,248,236,.78)";
  ctx.lineWidth = 3 * visualScale;
  roundRect(ctx, -noteW / 2, -noteH / 2, noteW, noteH, 10 * visualScale);
  ctx.stroke();
  ctx.fillStyle = palette.text;
  ctx.font = "950 " + Math.round(31 * visualScale) + "px Inter, system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(hit.displayLabel || hit.hand, 0, -2 * visualScale);
  ctx.fillStyle = hit.word === "THAKKA" ? "rgba(255,248,236,.86)" : "rgba(9,10,14,.72)";
  ctx.font = "850 " + Math.round(10 * visualScale) + "px Inter, system-ui";
  ctx.fillText(hit.word, 0, noteH * .34);
  ctx.fillStyle = "rgba(255,248,236,.95)";
  ctx.strokeStyle = "rgba(9,10,14,.38)";
  ctx.lineWidth = 1.4 * visualScale;
  ctx.beginPath();
  ctx.arc(0, 0, 4.5 * visualScale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function renderWorkspace() {
  songTitleEl.textContent = currentSong.name || "Unsaved practice song";
  renderPartEditors("treble", trebleEditorsEl);
  renderPartEditors("bass", bassEditorsEl);
  updateAllMetrics();
  buildTimeline();
  draw(pauseElapsed);
}
function renderPartEditors(part, container) {
  container.innerHTML = "";
  currentSong.sections.forEach((section, index) => {
    const card = document.createElement("details");
    card.className = "sectionCard";
    card.open = index === 0;
    card.dataset.sectionIndex = String(index);
    card.dataset.partCard = part;
    const head = document.createElement("summary");
    head.className = "sectionCardHead";
    const title = document.createElement("div");
    title.className = "sectionName";
    title.textContent = "Section " + (index + 1) + (section.name ? " - " + section.name : "");
    const metric = document.createElement("div");
    metric.className = "sectionMetric";
    metric.dataset.metricFor = String(index);
    metric.dataset.metricPart = part;
    const pad = document.createElement("button");
    pad.type = "button";
    pad.className = "ghost padSection";
    pad.dataset.padSection = String(index);
    pad.textContent = "Pad Bass Section";
    const preview = document.createElement("div");
    preview.className = "sectionPreview";
    preview.textContent = patternPreview(section[patternKey(part)]);
    head.append(title, metric, preview, pad);
    const editorShell = document.createElement("div");
    editorShell.className = "codeEditor";
    const numbers = document.createElement("pre");
    numbers.className = "lineNumbers";
    const textarea = document.createElement("textarea");
    textarea.spellcheck = false;
    textarea.value = section[patternKey(part)] || "";
    textarea.dataset.part = part;
    textarea.dataset.sectionIndex = String(index);
    textarea.setAttribute("aria-label", partLabel(part) + " section " + (index + 1) + " pattern");
    numbers.textContent = lineNumberText(textarea.value);
    editorShell.append(numbers, textarea);
    const restButtons = document.createElement("div");
    const preferredTokens = supportedWords().filter(word => WORD_DEFINITIONS[word].preferredPart === part);
    restButtons.className = "localRestButtons" + (preferredTokens.length ? " withPreferredTokens" : "");
    preferredTokens.forEach(word => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "insertButton " + WORD_DEFINITIONS[word].colorClass;
      button.dataset.insertToken = word;
      button.dataset.insertPart = part;
      button.dataset.insertSection = String(index);
      button.textContent = word;
      restButtons.appendChild(button);
    });
    supportedRests().forEach(rest => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ghost";
      button.dataset.insertToken = rest;
      button.dataset.insertPart = part;
      button.dataset.insertSection = String(index);
      button.textContent = "Rest " + REST_DEFINITIONS[rest].durationBeats;
      restButtons.appendChild(button);
    });
    const lineAnalysis = document.createElement("div");
    lineAnalysis.className = "lineAnalysis";
    lineAnalysis.dataset.lineAnalysisFor = String(index);
    lineAnalysis.dataset.lineAnalysisPart = part;
    card.append(head, editorShell, restButtons, lineAnalysis);
    container.appendChild(card);
  });
}
function patternPreview(pattern) {
  const first = splitPatternLines(pattern).map(line => line.trim()).find(Boolean);
  return first ? first.slice(0, 72) : "Empty section";
}
function lineNumberText(text) { return Array.from({ length: Math.max(1, splitPatternLines(text).length) }, (_, index) => String(index + 1)).join("\n"); }
function syncLineNumbers(textarea) {
  const editor = textarea.closest(".codeEditor");
  const numbers = editor && editor.querySelector(".lineNumbers");
  if (numbers) {
    numbers.textContent = lineNumberText(textarea.value);
    numbers.scrollTop = textarea.scrollTop;
  }
}
function renderLineAnalysis(section, sectionIndex, part) {
  const container = document.querySelector("[data-line-analysis-for='" + sectionIndex + "'][data-line-analysis-part='" + part + "']");
  if (!container) return;
  container.innerHTML = "";
  sectionLineAlignments(section).forEach(info => {
    const row = document.createElement("div");
    row.className = "lineRow" + (part === "bass" && info.overflow ? " overflowLine" : "") + (part === "bass" && info.bassSilentBeats ? " silentLine" : "");
    row.dataset.part = part;
    row.dataset.sectionIndex = String(sectionIndex);
    row.dataset.lineIndex = String(info.line - 1);
    const text = document.createElement("span");
    text.textContent = info.text;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost padLine";
    button.dataset.padSection = String(sectionIndex);
    button.dataset.padLine = String(info.line - 1);
    button.textContent = "Pad Bass Line";
    button.hidden = !(part === "bass" && info.bassSilentBeats > 0);
    const details = document.createElement("details");
    details.className = "lineTiming";
    const summary = document.createElement("summary");
    summary.textContent = "Timing details";
    const trebleDetail = document.createElement("div");
    trebleDetail.textContent = "Treble: " + timingSummary(section, "treble", info.line - 1);
    const bassDetail = document.createElement("div");
    bassDetail.textContent = "Bass: " + timingSummary(section, "bass", info.line - 1);
    details.append(summary, trebleDetail, bassDetail);
    row.append(text, button, details);
    container.appendChild(row);
  });
}
function updateAllMetrics() {
  currentSong.sections.forEach((section, index) => {
    const info = sectionAlignment(section);
    document.querySelectorAll("[data-metric-for='" + index + "']").forEach(metric => {
      metric.textContent = "Treble: " + beatsText(info.treble) + " - Bass: " + beatsText(info.bass) + " - " + info.text;
    });
    document.querySelectorAll(".padSection[data-pad-section='" + index + "']").forEach(button => { button.hidden = !(info.bassSilentBeats > 0 && !info.overflow); });
    PARTS.forEach(part => renderLineAnalysis(section, index, part));
  });
}
function setActiveEditor(textarea) {
  if (!textarea) return;
  activeEditor = textarea;
  activeEditorPart = textarea.dataset.part === "bass" ? "bass" : "treble";
  activeEditorLabel.textContent = "Editing: " + partLabel(activeEditorPart);
  document.querySelectorAll("textarea[data-part]").forEach(item => item.classList.toggle("activePattern", item === textarea));
  editorCursor.set(textarea, { start: textarea.selectionStart ?? textarea.value.length, end: textarea.selectionEnd ?? textarea.selectionStart ?? textarea.value.length });
}
function updatePatternFromEditor(textarea) {
  const index = Number(textarea.dataset.sectionIndex);
  const part = textarea.dataset.part === "bass" ? "bass" : "treble";
  if (!currentSong.sections[index]) return;
  syncLineNumbers(textarea);
  currentSong.sections[index][patternKey(part)] = textarea.value;
  saveCurrentSongIfPersisted();
  buildTimeline();
  updateAllMetrics();
  draw(pauseElapsed);
}
function padLine(sectionIndex, lineIndex) {
  const section = currentSong.sections[sectionIndex];
  if (!section) return;
  const info = lineAlignment(section, lineIndex);
  if (!info.bassSilentBeats) {
    if (info.overflow) window.alert("Bass exceeds Treble by " + beatsText(info.bassOverflowBeats) + ". Remove Bass words or adjust REST tokens manually.");
    return;
  }
  const padding = restPaddingForBeats(info.bassSilentBeats);
  if (!padding) { window.alert("Bass is silent for " + beatsText(info.bassSilentBeats) + ". REST1, REST2, and REST4 can only pad whole beats."); return; }
  const key = "bassPattern";
  const lines = splitPatternLines(section[key]);
  while (lines.length <= lineIndex) lines.push("");
  lines[lineIndex] = appendTokens(lines[lineIndex], padding);
  section[key] = lines.join("\n");
  saveCurrentSongIfPersisted();
  renderWorkspace();
}
function insertToken(token) {
  if (!activeEditor) activeEditor = document.querySelector("textarea[data-part='treble']");
  if (!activeEditor) return;
  const saved = editorCursor.get(activeEditor) || {};
  const start = Number.isFinite(saved.start) ? saved.start : activeEditor.selectionStart ?? activeEditor.value.length;
  const end = Number.isFinite(saved.end) ? saved.end : activeEditor.selectionEnd ?? start;
  const before = activeEditor.value.slice(0, start);
  const after = activeEditor.value.slice(end);
  const prefix = before && !/\s$/.test(before) ? " " : "";
  const insert = prefix + token + " ";
  activeEditor.value = before + insert + after;
  const pos = before.length + insert.length;
  editorCursor.set(activeEditor, { start: pos, end: pos });
  setActiveEditor(activeEditor);
  updatePatternFromEditor(activeEditor);
}
function insertTokenForPart(token, part, sectionIndex) {
  const textarea = document.querySelector("textarea[data-part='" + part + "'][data-section-index='" + sectionIndex + "']");
  if (textarea) setActiveEditor(textarea);
  insertToken(token);
}
function padSection(index) {
  const section = currentSong.sections[index];
  if (!section) return;
  const info = sectionAlignment(section);
  if (!info.bassSilentBeats || info.overflow) {
    if (info.overflow) window.alert("Bass exceeds Treble by " + beatsText(info.bassOverflowBeats) + ". Remove Bass words or adjust REST tokens manually.");
    return;
  }
  const padding = restPaddingForBeats(info.bassSilentBeats);
  if (!padding) { window.alert("Bass is silent for " + beatsText(info.bassSilentBeats) + ". REST1, REST2, and REST4 can only pad whole beats."); return; }
  section.bassPattern = appendTokens(section.bassPattern, padding);
  saveCurrentSongIfPersisted();
  renderWorkspace();
}

function renderInsertButtons() {
  insertButtonsEl.innerHTML = "";
  supportedWords().forEach(word => appendInsertButton(word, word, WORD_DEFINITIONS[word].colorClass));
  supportedRests().forEach(rest => appendInsertButton(rest, "Rest " + REST_DEFINITIONS[rest].durationBeats, "restButton"));
}
function appendInsertButton(token, label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "insertButton " + className;
  button.dataset.insertToken = token;
  button.textContent = label;
  insertButtonsEl.appendChild(button);
}
function renderDefinitions() {
  wordDefinitionListEl.innerHTML = "";
  supportedWords().forEach(word => {
    const def = wordDef(word);
    const row = document.createElement("div");
    row.className = "definitionRow";
    const label = document.createElement("span");
    label.className = "wordLabel " + def.colorClass;
    label.textContent = word;
    const text = document.createElement("span");
    const notes = [hitLegend(def)];
    if (def.pickupGapAfterBeats) notes.push("pause before the next word");
    if (def.trailingGapBeats) notes.push("trailing gap " + def.trailingGapBeats + " beat");
    if (def.description) notes.push(def.description);
    text.textContent = notes.join("; ");
    row.append(label, text);
    wordDefinitionListEl.appendChild(row);
  });
  supportedRests().forEach(rest => {
    const row = document.createElement("div");
    row.className = "definitionRow";
    const label = document.createElement("span");
    label.className = "wordLabel restLabel";
    label.textContent = rest;
    const text = document.createElement("span");
    text.textContent = REST_DEFINITIONS[rest].description;
    row.append(label, text);
    wordDefinitionListEl.appendChild(row);
  });
}
function hitLegend(def) {
  const sorted = [...def.hits].sort((a, b) => a.offsetBeats - b.offsetBeats);
  const parts = [];
  sorted.forEach((hit, index) => {
    if (index) {
      const gap = hit.offsetBeats - sorted[index - 1].offsetBeats;
      if (gap > 1) parts.push("pause");
    }
    parts.push(hit.hand);
  });
  return parts.join(parts.includes("pause") ? ", " : " ");
}

function openSongEditor(song = null) {
  editorSong = song ? normalizeSong(song) : { id: "", name: "", sections: createDefaultSections(), lastPart: "treble" };
  songModalTitle.textContent = song ? "Edit Song" : "New Song";
  songNameInput.value = editorSong.name;
  renderModalSections();
  songModal.hidden = false;
  if (isDesktopViewport()) setTimeout(() => songNameInput.focus(), 0);
}
function closeSongEditor() { songModal.hidden = true; editorSong = null; }
function collectModalSections() {
  if (!editorSong) return;
  sectionEditorList.querySelectorAll(".songSectionEditor").forEach(card => {
    const index = Number(card.dataset.index);
    if (!editorSong.sections[index]) return;
    const name = card.querySelector("[data-section-name]");
    const treble = card.querySelector("[data-modal-part='treble']");
    const bass = card.querySelector("[data-modal-part='bass']");
    editorSong.sections[index].name = name ? name.value.trim() : "";
    editorSong.sections[index].treblePattern = treble ? treble.value : "";
    editorSong.sections[index].bassPattern = bass ? bass.value : "";
  });
}
function renderModalSections() {
  sectionEditorList.innerHTML = "";
  editorSong.sections.forEach((section, index) => {
    const card = document.createElement("section");
    card.className = "songSectionEditor";
    card.dataset.index = String(index);
    const head = document.createElement("div");
    head.className = "sectionEditorHead";
    const title = document.createElement("div");
    title.className = "modalSectionTitle";
    title.textContent = "Section " + (index + 1);
    const name = document.createElement("input");
    name.type = "text";
    name.placeholder = "Optional section title";
    name.value = section.name || "";
    name.dataset.sectionName = "true";
    const actions = document.createElement("div");
    actions.className = "sectionActions";
    [["up", "Up"], ["down", "Down"], ["duplicate", "Duplicate"], ["delete", "Delete"]].forEach(([action, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = action === "delete" ? "danger" : "secondary";
      button.dataset.sectionAction = action;
      button.textContent = label;
      if ((action === "up" && index === 0) || (action === "down" && index === editorSong.sections.length - 1)) button.disabled = true;
      actions.appendChild(button);
    });
    head.append(title, name, actions);
    const parts = document.createElement("div");
    parts.className = "modalParts";
    parts.append(createModalPart(section, index, "treble"), createModalPart(section, index, "bass"));
    const metric = document.createElement("div");
    metric.className = "sectionMetric modalMetric";
    const alignment = sectionAlignment(section);
    metric.textContent = alignment.text;
    const pad = document.createElement("button");
    pad.type = "button";
    pad.className = "ghost";
    pad.dataset.sectionAction = "pad";
    pad.textContent = "Pad Bass Section";
    pad.hidden = !(alignment.bassSilentBeats > 0 && !alignment.overflow);
    card.append(head, parts, metric, pad);
    sectionEditorList.appendChild(card);
  });
}
function createModalPart(section, index, part) {
  const wrap = document.createElement("div");
  wrap.className = "modalPartEditor";
  const label = document.createElement("label");
  label.textContent = partLabel(part);
  const textarea = document.createElement("textarea");
  textarea.value = section[patternKey(part)] || "";
  textarea.spellcheck = false;
  textarea.dataset.modalPart = part;
  textarea.dataset.sectionIndex = String(index);
  wrap.append(label, textarea);
  return wrap;
}
function handleModalSectionAction(button) {
  collectModalSections();
  const card = button.closest(".songSectionEditor");
  const index = card ? Number(card.dataset.index) : -1;
  const action = button.dataset.sectionAction;
  if (action === "up" && index > 0) [editorSong.sections[index - 1], editorSong.sections[index]] = [editorSong.sections[index], editorSong.sections[index - 1]];
  if (action === "down" && index < editorSong.sections.length - 1) [editorSong.sections[index + 1], editorSong.sections[index]] = [editorSong.sections[index], editorSong.sections[index + 1]];
  if (action === "duplicate" && editorSong.sections[index]) editorSong.sections.splice(index + 1, 0, makeSection({ ...editorSong.sections[index], id: "" }));
  if (action === "delete") {
    if (editorSong.sections.length <= 1) { window.alert("A song needs at least one section."); return; }
    editorSong.sections.splice(index, 1);
  }
  if (action === "pad" && editorSong.sections[index]) {
    const info = sectionAlignment(editorSong.sections[index]);
    if (!info.bassSilentBeats || info.overflow) {
      if (info.overflow) window.alert("Bass exceeds Treble by " + beatsText(info.bassOverflowBeats) + ". Remove Bass words or adjust REST tokens manually.");
      return;
    }
    const padding = restPaddingForBeats(info.bassSilentBeats);
    if (!padding) { window.alert("Bass is silent for " + beatsText(info.bassSilentBeats) + ". REST tokens can only pad whole beats."); return; }
    editorSong.sections[index].bassPattern = appendTokens(editorSong.sections[index].bassPattern, padding);
  }
  renderModalSections();
}
function saveSongFromEditor() {
  collectModalSections();
  const name = songNameInput.value.trim();
  if (!name) { window.alert("Enter a song name."); return; }
  for (let i = 0; i < editorSong.sections.length; i++) {
    const section = editorSong.sections[i];
    const trebleBad = invalidPatternTokens(section.treblePattern);
    const bassBad = invalidPatternTokens(section.bassPattern);
    if (trebleBad.length || bassBad.length) {
      window.alert("Section " + (i + 1) + " has unsupported tokens: " + [...new Set([...trebleBad, ...bassBad])].join(", "));
      return;
    }
  }
  const songs = readSongLibrary();
  let song = currentSongId && songs.find(item => item.id === currentSongId && editorSong.id === currentSongId);
  if (!song && editorSong.id) song = songs.find(item => item.id === editorSong.id);
  if (!song) { song = { id: "song-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8), name, sections: [] }; songs.push(song); }
  song.name = name;
  song.sections = editorSong.sections.map(section => makeSection(section));
  writeSongLibrary(songs);
  currentSongId = song.id;
  currentSong = normalizeSong(song);
  closeSongEditor();
  refreshSavedSongs(song.id);
  renderWorkspace();
  resetReference();
}
function deleteSelectedSong() {
  const song = findSong();
  if (!song) { window.alert("Select a song to delete."); return; }
  if (!window.confirm("Delete saved song: " + song.name + "?")) return;
  writeSongLibrary(readSongLibrary().filter(item => item.id !== song.id));
  currentSongId = "";
  currentSong = cloneSong(defaultSong);
  refreshSavedSongs("");
  renderWorkspace();
  resetReference();
}

function ensureAudioContext() { const AudioCtor = window.AudioContext || window.webkitAudioContext; if (!AudioCtor) return null; if (!audioContext) audioContext = new AudioCtor(); if (audioContext.state === "suspended") audioContext.resume(); return audioContext; }
function playMetronomeClick(strong = false) { if (!metronomeOn) return; const context = ensureAudioContext(); if (!context) return; const now = context.currentTime; const volume = Math.max(0, Math.min(1, Number(metronomeVolume.value) || 0)); const gain = context.createGain(); gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime((strong ? .12 : .075) * volume, now + .004); gain.gain.exponentialRampToValueAtTime(0.0001, now + (strong ? .075 : .055)); gain.connect(context.destination); const osc = context.createOscillator(); osc.type = strong ? "triangle" : "sine"; osc.frequency.setValueAtTime(strong ? 520 : 920, now); osc.frequency.exponentialRampToValueAtTime(strong ? 360 : 760, now + .045); osc.connect(gain); osc.start(now); osc.stop(now + .08); }
function triggerMetronome(nowBeat) { if (!metronomeOn || !running) return; const beatIndex = Math.floor(nowBeat); if (beatIndex < 0 || beatIndex > Math.ceil(totalBeats)) return; if (beatIndex === lastMetronomeBeat) return; lastMetronomeBeat = beatIndex; const subdivision = Math.max(1, Number(metronomeSubdivision.value) || 1); if (beatIndex % subdivision !== 0) return; try { playMetronomeClick(beatIndex % 4 === 0); } catch (error) { console.warn("Metronome click skipped", error); } }
function toggleMetronome() { metronomeOn = !metronomeOn; metronomeToggle.textContent = metronomeOn ? "On" : "Off"; metronomeToggle.classList.toggle("active", metronomeOn); metronomeToggle.setAttribute("aria-pressed", String(metronomeOn)); lastMetronomeBeat = -1; if (metronomeOn) { try { ensureAudioContext(); } catch (error) { console.warn("Metronome audio unavailable", error); } } }
function applyBpm(value, { restart = false } = {}) { const next = clampBpm(value); bpm.value = String(next); bpmNumber.value = String(next); if (next > 300 && metronomeSubdivision.value === "1") metronomeSubdivision.value = "4"; const was = running; if (restart && was) stopReference(); buildTimeline(); if (restart && was) startReference(); else draw(pauseElapsed); }
function setLoop(value) { loopCount = value; document.querySelectorAll(".loop[data-loop]").forEach(button => button.classList.toggle("active", Number(button.dataset.loop) === loopCount)); const was = running; if (was) stopReference(); buildTimeline(); pauseElapsed = 0; draw(0); if (was) startReference(); }
function resetReference() { buildTimeline(); pauseElapsed = 0; startTime = performance.now(); completedLoops = 0; draw(0); }
function startReference() { if (running) return; running = true; lastMetronomeBeat = -1; app.classList.add("playing"); stateEl.textContent = "Count-in"; startTime = performance.now() - pauseElapsed; loop(); }
function stopReference() { if (!running) return; running = false; pauseElapsed = performance.now() - startTime; app.classList.remove("playing"); stateEl.textContent = "Stopped"; cancelAnimationFrame(raf); draw(pauseElapsed); }
function finishReference(now) { running = false; pauseElapsed = now; app.classList.remove("playing"); stateEl.textContent = "Stopped"; cancelAnimationFrame(raf); draw(now); }
function restartReference() { running = false; lastMetronomeBeat = -1; cancelAnimationFrame(raf); pauseElapsed = 0; completedLoops = 0; buildTimeline(); startReference(); }
function elapsed() { return running ? performance.now() - startTime : pauseElapsed; }
function loop() { const now = elapsed(); const nowBeat = now / beatMs(); ensureInfiniteTimeline(nowBeat); stateEl.textContent = nowBeat < countInBeats ? "Count-in" : "Playing"; triggerMetronome(nowBeat); updateLoopCompletion(nowBeat); draw(now); if (!isInfiniteLoop() && nowBeat > totalBeats + 1.15) { finishReference(now); return; } if (running) raf = requestAnimationFrame(loop); }
async function enterPracticeFullscreen() { setFullscreenMode(true); try { if (!document.fullscreenElement && app.requestFullscreen) await app.requestFullscreen(); } catch (error) {} draw(elapsed()); }
async function exitPracticeFullscreen() { try { if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen(); } catch (error) {} setFullscreenMode(false); }
function setFullscreenMode(active) { app.classList.toggle("practiceFullscreen", active); fullscreenBtn.textContent = active ? "Fullscreen: On" : "Fullscreen"; setTimeout(() => draw(elapsed()), 60); }
function syncFullscreenState() { if (!document.fullscreenElement && app.classList.contains("practiceFullscreen")) setFullscreenMode(false); }
function isDesktopViewport() { return window.matchMedia ? window.matchMedia("(min-width: 761px)").matches : window.innerWidth > 760; }

function requiredElements() {
  return { app, savedSongsSelect, newSongBtn, editSongBtn, deleteSongBtn, bpm, bpmNumber, metronomeToggle, metronomeVolume, metronomeSubdivision, startBtn, stopBtn, restartBtn, fullscreenBtn, trebleEditorsEl, bassEditorsEl, insertButtonsEl, sectionIndicatorEl, loopStatusEl, playTimerEl, songModal, songNameInput, sectionEditorList, addSectionBtn, saveSongBtn, cancelSongBtn, cancelSongTopBtn };
}
function warnMissingElements() { const missing = Object.entries(requiredElements()).filter(([, element]) => !element).map(([name]) => name); if (missing.length) console.warn("Chenda Practice Trainer missing required elements:", missing.join(", ")); }
function bindEvent(element, type, handler, name) { if (!element) { console.warn("Chenda Practice Trainer could not bind " + name + ": missing element."); return; } element.addEventListener(type, handler); }
function initializeApp() {
  if (appInitialized) return;
  appInitialized = true;
  warnMissingElements();
  writeSongLibrary(readSongLibrary());
  refreshSavedSongs();
  renderInsertButtons();
  renderDefinitions();
  renderWorkspace();
  bindEvent(savedSongsSelect, "change", () => { savedSongsSelect.value ? loadSong(savedSongsSelect.value) : clearSelectedSong(); }, "saved song dropdown");
  bindEvent(newSongBtn, "click", () => openSongEditor(null), "new song");
  bindEvent(editSongBtn, "click", () => { const song = findSong(); if (!song) { window.alert("Select a song to edit."); return; } openSongEditor(song); }, "edit song");
  bindEvent(deleteSongBtn, "click", deleteSelectedSong, "delete song");
  bindEvent(bpm, "input", () => applyBpm(bpm.value, { restart: true }), "BPM slider");
  bindEvent(bpmNumber, "input", () => { bpm.value = String(clampBpm(bpmNumber.value)); draw(pauseElapsed); }, "BPM number input");
  bindEvent(bpmNumber, "change", () => applyBpm(bpmNumber.value, { restart: true }), "BPM number change");
  bindEvent(bpmNumber, "blur", () => applyBpm(bpmNumber.value, { restart: true }), "BPM number blur");
  bindEvent(metronomeToggle, "click", toggleMetronome, "metronome toggle");
  bindEvent(metronomeSubdivision, "change", () => { lastMetronomeBeat = -1; }, "metronome subdivision");
  document.querySelectorAll(".loop[data-loop]").forEach(button => button.addEventListener("click", () => setLoop(Number(button.dataset.loop))));
  bindEvent(startBtn, "click", startReference, "start");
  bindEvent(stopBtn, "click", stopReference, "stop");
  bindEvent(restartBtn, "click", restartReference, "restart");
  bindEvent(fullscreenBtn, "click", enterPracticeFullscreen, "fullscreen");
  bindEvent(fullscreenStopBtn, "click", stopReference, "fullscreen stop");
  bindEvent(fullscreenRestartBtn, "click", restartReference, "fullscreen restart");
  bindEvent(exitFullscreenBtn, "click", exitPracticeFullscreen, "exit fullscreen");
  bindEvent(insertButtonsEl, "pointerdown", event => { if (event.target.closest("[data-insert-token]")) event.preventDefault(); }, "insert pointer guard");
  bindEvent(insertButtonsEl, "click", event => { const button = event.target.closest("[data-insert-token]"); if (button) insertToken(button.dataset.insertToken); }, "insert buttons");
  document.addEventListener("focusin", event => { if (event.target.matches && event.target.matches("textarea[data-part]")) setActiveEditor(event.target); });
  document.addEventListener("keyup", event => { if (event.target.matches && event.target.matches("textarea[data-part]")) setActiveEditor(event.target); });
  document.addEventListener("mouseup", event => { if (event.target.matches && event.target.matches("textarea[data-part]")) setActiveEditor(event.target); });
  document.addEventListener("input", event => { if (event.target.matches && event.target.matches("textarea[data-part]")) { setActiveEditor(event.target); updatePatternFromEditor(event.target); } });
  document.addEventListener("scroll", event => { if (event.target.matches && event.target.matches("textarea[data-part]")) syncLineNumbers(event.target); }, true);
  document.addEventListener("click", event => {
    const tokenButton = event.target.closest("[data-insert-token]");
    if (tokenButton && !insertButtonsEl.contains(tokenButton)) {
      if (tokenButton.dataset.insertPart && tokenButton.dataset.insertSection) insertTokenForPart(tokenButton.dataset.insertToken, tokenButton.dataset.insertPart, tokenButton.dataset.insertSection);
      else insertToken(tokenButton.dataset.insertToken);
      return;
    }
    const lineButton = event.target.closest("[data-pad-line]");
    if (lineButton) { padLine(Number(lineButton.dataset.padSection), Number(lineButton.dataset.padLine)); return; }
    const padButton = event.target.closest("[data-pad-section]");
    if (padButton) padSection(Number(padButton.dataset.padSection));
  });
  bindEvent(addSectionBtn, "click", () => { collectModalSections(); editorSong.sections.push(makeSection()); renderModalSections(); }, "add section");
  bindEvent(sectionEditorList, "click", event => { const button = event.target.closest("[data-section-action]"); if (button) handleModalSectionAction(button); }, "modal section actions");
  bindEvent(saveSongBtn, "click", saveSongFromEditor, "save song");
  bindEvent(cancelSongBtn, "click", closeSongEditor, "cancel song");
  bindEvent(cancelSongTopBtn, "click", closeSongEditor, "close song editor");
  bindEvent(songModal, "click", event => { if (event.target === songModal) closeSongEditor(); }, "song modal backdrop");
  document.addEventListener("keydown", event => { if (event.key === "Escape" && songModal && !songModal.hidden) closeSongEditor(); });
  document.addEventListener("fullscreenchange", syncFullscreenState);
  window.addEventListener("resize", () => draw(elapsed()));
  window.addEventListener("orientationchange", () => setTimeout(() => draw(elapsed()), 120));
  setActiveEditor(document.querySelector("textarea[data-part='treble']"));
  resetReference();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
else initializeApp();
