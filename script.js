const THAKAA_INTERNAL_PAUSE_BEATS = 0.5;
const THAKKA_INTERNAL_PAUSE_BEATS = 0.5;
const THAKKA_TRAILING_GAP_BEATS = 0;
// Adjust this interval after confirming which Treble/Chenda beats align with Bass counts 1, 2, and 3.
const COUNT_123_INTERVAL_BEATS = 0.75;
const COUNT_123_TRAILING_GAP_BEATS = 0;
const THA_PICKUP_GAP_BEATS = 1.0;
const BEAT_TOLERANCE = 0.001;

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
    trailingGapBeats: 0,
    colorClass: "word-thakaa",
    color: { fill: "#60d67f", glow: "rgba(96,214,127,.42)", text: "#07100a" },
    description: "Right, slight pause, then Left."
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
  "REST0.5": { durationBeats: 0.5, description: "One-half silent beat" },
  REST1: { durationBeats: 1, description: "One silent beat" },
  REST2: { durationBeats: 2, description: "Two silent beats" },
  REST4: { durationBeats: 4, description: "Four silent beats" }
};

const DEFAULT_SECTION_COUNT = 4;
const DISPLAY_WORD_ORDER = ["THA", "THAKA", "THAKAA", "THAKKA", "THAKITA", "123"];
const DISPLAY_REST_ORDER = ["REST0.5", "REST1", "REST2", "REST4"];
const LEGACY_WORD_ALIASES = { TA: "THA" };
const SONG_LIBRARY_KEY = "chendaPracticeSongs";
const INSTRUMENT_VIEW_KEY = "chendaPracticeInstrumentView";
const FULLSCREEN_INSTRUMENT_KEY = "chendaPracticeFullscreenInstrument";
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
const loadSongBtn = $("loadSong");
const newSongBtn = $("newSong");
const deleteSongBtn = $("deleteSong");
const saveSongBtn = $("saveSong");
const saveAsSongBtn = $("saveAsSong");
const songNameInput = $("songNameInput");
const songSaveStatusEl = $("songSaveStatus");
const bpm = $("bpm");
const bpmNumber = $("bpmNumber");
const metronomeToggle = $("metronomeToggle");
const metronomeVolume = $("metronomeVolume");
const metronomeSubdivision = $("metronomeSubdivision");
const startBtn = $("start");
const stopBtn = $("stop");
const restartBtn = $("restart");
const fullscreenBtn = $("fullscreen");
const viewButtons = Array.from(document.querySelectorAll("[data-view]"));
const fullscreenChoice = $("fullscreenChoice");
const fullscreenTrebleBtn = $("fullscreenTreble");
const fullscreenBassBtn = $("fullscreenBass");
const fullscreenCancelBtn = $("fullscreenCancel");
const fullscreenStartBtn = $("fullscreenStart");
const fullscreenStopBtn = $("fullscreenStop");
const fullscreenRestartBtn = $("fullscreenRestart");
const fullscreenMetronomeBtn = $("fullscreenMetronome");
const exitFullscreenBtn = $("exitFullscreen");
const fullscreenInstrumentName = $("fullscreenInstrumentName");
const fullscreenStatus = $("fullscreenStatus");
const stateEl = $("state");
const songTitleEl = $("songTitle");
const activeEditorLabel = $("activeEditorLabel");
const insertButtonsEl = $("insertButtons");
const restInsertButtonsEl = $("restInsertButtons");
const insertTargetButtons = Array.from(document.querySelectorAll("[data-insert-target]"));
const sectionIndicatorEl = $("sectionIndicator");
const loopStatusEl = $("loopStatus");
const playTimerEl = $("playTimer");
const trebleEditorsEl = $("trebleEditors");
const bassEditorsEl = $("bassEditors");
const trebleNowEl = $("trebleNow");
const bassNowEl = $("bassNow");
const wordDefinitionListEl = $("wordDefinitionList");
const canvases = {
  treble: { canvas: $("trebleLane"), nowEl: trebleNowEl, hits: [], groups: [] },
  bass: { canvas: $("bassLane"), nowEl: bassNowEl, hits: [], groups: [] }
};
PARTS.forEach(part => { canvases[part].ctx = canvases[part].canvas.getContext("2d"); });

let currentSongId = "";
let currentSong = cloneSong(defaultSong);
let isDirty = false;
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
let instrumentView = localStorage.getItem(INSTRUMENT_VIEW_KEY) || "both";
let fullscreenInstrument = localStorage.getItem(FULLSCREEN_INSTRUMENT_KEY) || "treble";
let preFullscreenScroll = { x: 0, y: 0 };
let resizeTimer = 0;
const editorCursor = new WeakMap();

function cloneSong(song) { return JSON.parse(JSON.stringify(song)); }
function wordDef(token) { return WORD_DEFINITIONS[token]; }
function restDef(token) { return REST_DEFINITIONS[token]; }
function tokenDef(token) { return wordDef(token) || restDef(token); }
function supportedWords() { return DISPLAY_WORD_ORDER.filter(word => wordDef(word)); }
function supportedRests() { return DISPLAY_REST_ORDER.filter(rest => restDef(rest)); }
function normalizeToken(token) { return LEGACY_WORD_ALIASES[token] || token; }
function tokenize(text) { return (String(text || "").toUpperCase().match(/[A-Z0-9.]+/g) || []).map(normalizeToken); }
function splitPatternLines(text) { return String(text || "").replace(/\r\n?/g, "\n").split("\n"); }
function normalizePatternText(text) { return splitPatternLines(text).map(line => tokenize(line).filter(token => tokenDef(token)).join(" ")).join("\n"); }
function invalidPatternTokens(text) { return [...new Set(tokenize(text).filter(token => !tokenDef(token)))]; }
function lineTokens(pattern, lineIndex) { return tokenize(splitPatternLines(pattern)[lineIndex] || "").filter(token => tokenDef(token)); }
function lineInvalidTokens(pattern, lineIndex) { return tokenize(splitPatternLines(pattern)[lineIndex] || "").filter(token => !tokenDef(token)); }
function lineHasPlayableContent(pattern, lineIndex) { return lineTokens(pattern, lineIndex).length > 0; }
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
function makeBlankSong() { return { id: "", name: "", sections: createDefaultSections(), lastPart: "treble" }; }
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
function setDirty(value, message = "") {
  isDirty = !!value;
  updateSongStatus(message);
}
function markDirty() { setDirty(true); }
function updateSongStatus(message = "") {
  if (!songSaveStatusEl) return;
  if (message) songSaveStatusEl.textContent = message;
  else if (isDirty) songSaveStatusEl.textContent = "\u25cf Unsaved changes";
  else if (currentSongId) songSaveStatusEl.textContent = "\u2713 Saved";
  else songSaveStatusEl.textContent = "New song - not saved";
  songSaveStatusEl.classList.toggle("dirty", isDirty);
  songSaveStatusEl.classList.toggle("saved", !isDirty && !!currentSongId);
}
function confirmDiscardChanges(message = "You have unsaved changes. Load another song and discard them?") {
  return !isDirty || window.confirm(message);
}
function loadSong(id, { protect = true } = {}) {
  if (protect && !confirmDiscardChanges()) return false;
  const song = findSong(id);
  if (!song) return false;
  currentSongId = song.id;
  currentSong = normalizeSong(song);
  setDirty(false);
  renderWorkspace();
  resetReference();
  return true;
}
function loadSelectedSong() {
  const id = savedSongsSelect.value;
  if (!id) { window.alert("Select a saved song to load."); return; }
  loadSong(id);
}
function clearSelectedSong({ protect = true } = {}) {
  if (protect && !confirmDiscardChanges("You have unsaved changes. Start a new song and discard them?")) return false;
  currentSongId = "";
  currentSong = makeBlankSong();
  if (savedSongsSelect) savedSongsSelect.value = "";
  setDirty(false, "New song - not saved");
  renderWorkspace();
  resetReference();
  return true;
}
function validateCurrentSong() {
  const name = songNameInput.value.trim();
  if (!name) { window.alert("Enter a song name before saving."); return null; }
  for (let i = 0; i < currentSong.sections.length; i++) {
    const section = currentSong.sections[i];
    const trebleBad = invalidPatternTokens(section.treblePattern);
    const bassBad = invalidPatternTokens(section.bassPattern);
    if (trebleBad.length || bassBad.length) {
      window.alert("Section " + (i + 1) + " has unsupported tokens: " + [...new Set([...trebleBad, ...bassBad])].join(", "));
      return null;
    }
  }
  return name;
}
function saveCurrentSong() {
  const name = validateCurrentSong();
  if (!name) return false;
  const songs = readSongLibrary();
  let id = currentSongId;
  let index = songs.findIndex(song => song.id === id);
  if (!id || index < 0) {
    id = "song-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    currentSongId = id;
    index = songs.length;
  }
  currentSong.name = name;
  currentSong.id = id;
  songs[index] = normalizeSong(currentSong);
  writeSongLibrary(songs);
  refreshSavedSongs(id);
  setDirty(false, "\u2713 Saved");
  renderWorkspace();
  resetReference();
  return true;
}
function saveCurrentSongAs() {
  const cleanName = songNameInput.value.trim();
  if (!cleanName) { window.alert("Enter a song name before saving."); return false; }
  const original = currentSongId ? findSong(currentSongId) : null;
  if (original && original.name.trim() === cleanName) {
    updateSongStatus("Enter a new Song Name, then click Save As");
    if (isDesktopViewport()) {
      songNameInput.focus();
      if (songNameInput.select) songNameInput.select();
    }
    return false;
  }
  const invalid = currentSong.sections.flatMap(section => [...invalidPatternTokens(section.treblePattern), ...invalidPatternTokens(section.bassPattern)]);
  if (invalid.length) { window.alert("Unsupported tokens: " + [...new Set(invalid)].join(", ")); return false; }
  const id = "song-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const copy = normalizeSong({ ...currentSong, id, name: cleanName, sections: currentSong.sections.map(section => ({ ...section, id: "" })) });
  const songs = readSongLibrary();
  songs.push(copy);
  writeSongLibrary(songs);
  currentSongId = id;
  currentSong = normalizeSong(copy);
  refreshSavedSongs(id);
  setDirty(false, "\u2713 Saved");
  renderWorkspace();
  resetReference();
  return true;
}
function deleteSelectedSong() {
  const song = findSong();
  if (!song) { window.alert("Select a saved song to delete."); return; }
  if (isDirty && !window.confirm("You have unsaved changes. Delete this saved song and discard them?")) return;
  if (!window.confirm("Delete saved song: " + song.name + "?")) return;
  writeSongLibrary(readSongLibrary().filter(item => item.id !== song.id));
  const remaining = readSongLibrary();
  if (remaining.length) {
    const next = remaining.sort((a, b) => a.name.localeCompare(b.name))[0];
    currentSongId = next.id;
    currentSong = normalizeSong(next);
    setDirty(false);
    refreshSavedSongs(next.id);
  } else {
    currentSongId = "";
    currentSong = makeBlankSong();
    setDirty(false, "New song - not saved");
    refreshSavedSongs("");
  }
  renderWorkspace();
  resetReference();
}

function beatMs() { return 60000 / Number(bpm.value); }
function clampBpm(value) { const parsed = Number(value); if (!Number.isFinite(parsed)) return Number(bpm.value) || 100; return Math.max(100, Math.min(500, Math.round(parsed))); }
function formatTime(ms) { const total = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0"); }
function updatePlayTimer(now) { playTimerEl.textContent = formatTime(now); }
function isInfiniteLoop() { return loopCount === Infinity; }
function loopDisplay() { return isInfiniteLoop() ? "\u221e" : "x" + loopCount; }
function beatsText(value) {
  const roundedHalf = Math.round(value * 2) / 2;
  const normalized = Math.abs(value - roundedHalf) < BEAT_TOLERANCE ? roundedHalf : value;
  const text = Number.isInteger(normalized) ? String(normalized) : normalized.toFixed(1);
  return text + " " + (Math.abs(normalized - 1) < BEAT_TOLERANCE ? "beat" : "beats");
}

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
function getReferenceDuration(trebleDuration, bassDuration, trebleHasContent, bassHasContent) {
  if (trebleHasContent) return trebleDuration;
  if (bassHasContent) return bassDuration;
  return 0;
}
function lineReferenceInfo(section, lineIndex) {
  const trebleTokens = lineTokens(section.treblePattern, lineIndex);
  const bassTokens = lineTokens(section.bassPattern, lineIndex);
  const invalidTokens = [...new Set([...lineInvalidTokens(section.treblePattern, lineIndex), ...lineInvalidTokens(section.bassPattern, lineIndex)])];
  const trebleHasContent = trebleTokens.length > 0;
  const bassHasContent = bassTokens.length > 0;
  const treble = measureTokens(trebleTokens, firstTokenAfterLine(section.treblePattern, lineIndex + 1));
  const bass = measureTokens(bassTokens, firstTokenAfterLine(section.bassPattern, lineIndex + 1));
  const duration = getReferenceDuration(treble, bass, trebleHasContent, bassHasContent);
  const referencePart = trebleHasContent ? "treble" : bassHasContent ? "bass" : "";
  return { treble, bass, duration, referencePart, trebleHasContent, bassHasContent, invalidTokens };
}
function lineAlignment(section, lineIndex) {
  const info = lineReferenceInfo(section, lineIndex);
  const diff = info.bass - info.treble;
  const bassSilentBeats = info.referencePart === "treble" && diff < -BEAT_TOLERANCE ? Math.abs(diff) : 0;
  const bassOverflowBeats = info.referencePart === "treble" && diff > BEAT_TOLERANCE ? diff : 0;
  const aligned = info.duration === 0 || (info.referencePart === "bass" && !info.trebleHasContent) || Math.abs(diff) < BEAT_TOLERANCE;
  let status = info.invalidTokens.length ? "Unsupported tokens: " + info.invalidTokens.join(", ") : "Blank line skipped";
  if (info.referencePart === "bass") status = "Bass reference";
  if (info.referencePart === "treble") status = aligned ? "Aligned to Treble" : bassOverflowBeats ? "Bass exceeds Treble by " + beatsText(bassOverflowBeats) : "Bass silent for final " + beatsText(bassSilentBeats);
  return { line: lineIndex + 1, treble: info.treble, bass: info.bass, duration: info.duration, referencePart: info.referencePart, trebleHasContent: info.trebleHasContent, bassHasContent: info.bassHasContent, aligned, shorter: bassSilentBeats ? "bass" : "", overflow: bassOverflowBeats > 0, bassSilentBeats, bassOverflowBeats, text: "Line " + (lineIndex + 1) + " - Treble duration: " + beatsText(info.treble) + " - Bass duration: " + beatsText(info.bass) + " - " + status };
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
  const aligned = bassSilentBeats < BEAT_TOLERANCE && bassOverflowBeats < BEAT_TOLERANCE;
  const text = aligned ? "Manual sync aligned: " + beatsText(duration) : bassOverflowBeats ? "Manual sync: Bass exceeds Treble on " + overflowLines + " " + (overflowLines === 1 ? "line" : "lines") + " by " + beatsText(bassOverflowBeats) : "Manual sync: Bass silent for " + beatsText(bassSilentBeats);
  return { treble, bass, duration, aligned, shorter: bassSilentBeats ? "bass" : "", overflow: bassOverflowBeats > 0, bassSilentBeats, bassOverflowBeats, text, lines };
}
function restPaddingForBeats(beats) {
  const rounded = Math.round(beats * 2) / 2;
  if (Math.abs(beats - rounded) > BEAT_TOLERANCE) return null;
  const tokens = [];
  let remaining = rounded;
  [["REST4", 4], ["REST2", 2], ["REST1", 1], ["REST0.5", 0.5]].forEach(([token, size]) => {
    while (remaining + BEAT_TOLERANCE >= size) {
      tokens.push(token);
      remaining = Math.round((remaining - size) * 2) / 2;
    }
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
  const loopStart = totalBeats;
  currentSong.sections.forEach((section, sectionIndex) => {
    const sectionStart = totalBeats;
    const lineCount = patternLineCount(section);
    let lineStart = sectionStart;
    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      const reference = lineReferenceInfo(section, lineIndex);
      if (reference.duration <= 0) continue;
      const trebleDuration = schedulePartLine(section, "treble", lineIndex, lineStart, loopNumber, sectionIndex + 1);
      const bassDuration = schedulePartLine(section, "bass", lineIndex, lineStart, loopNumber, sectionIndex + 1);
      const lineDuration = reference.duration;
      lineBoundaries.push({ loopNumber, sectionNumber: sectionIndex + 1, sectionName: section.name || "", lineNumber: lineIndex + 1, referencePart: reference.referencePart, startBeat: lineStart, endBeat: lineStart + lineDuration, trebleDuration, bassDuration });
      lineStart += lineDuration;
    }
    if (lineStart > sectionStart) sectionBoundaries.push({ loopNumber, sectionNumber: sectionIndex + 1, sectionName: section.name || "", startBeat: sectionStart, endBeat: lineStart });
    totalBeats = lineStart;
  });
  loopEndBeats.push(totalBeats);
  builtLoopCount++;
  return totalBeats - loopStart;
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
function ensureInfiniteTimeline(nowBeat) { if (!isInfiniteLoop()) return; while (totalBeats - nowBeat < 32) { if (appendSongLoop() <= 0) break; } }
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
  if (rect.width < 2 || rect.height < 2) return false;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.round(rect.width * ratio));
  const height = Math.max(360, Math.round(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  return true;
}
function laneXForHand(hand, leftX, rightX) { return hand === "R" ? rightX : leftX; }
function draw(now) {
  const nowBeat = now / beatMs();
  updatePlayTimer(now);
  updateStatus(nowBeat);
  updateFullscreenCompactStatus();
  PARTS.forEach(part => drawPart(part, nowBeat));
}
function drawPart(part, nowBeat) {
  const target = canvases[part];
  const canvas = target.canvas;
  const ctx = target.ctx;
  if (!resizeCanvas(canvas)) return;
  const w = canvas.width, h = canvas.height;
  const full = app.classList.contains("practiceFullscreen") && window.innerWidth > 760;
  const mobileFocus = document.body.classList.contains("mobile-practice-focus-mode") || document.body.classList.contains("mobile-practice-fullscreen");
  const visualScale = full ? 1.35 : 1;
  const focusScale = mobileFocus ? 1.22 : visualScale;
  const hitY = h - (mobileFocus ? 112 : full ? 128 : 104);
  const topPad = mobileFocus ? 78 : full ? 92 : 72;
  const leadBeats = 8;
  const laneW = mobileFocus ? Math.min(168, w * .33) : full ? Math.min(180, w * .32) : Math.min(138, w * .28);
  const gap = mobileFocus ? Math.max(10, Math.min(16, w * .035)) : full ? Math.max(10, Math.min(18, w * .035)) : Math.max(8, Math.min(12, w * .03));
  const leftX = w / 2 - laneW / 2 - gap / 2;
  const rightX = w / 2 + laneW / 2 + gap / 2;
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, part === "treble" ? "#161923" : "#141923");
  bg.addColorStop(1, "#08090d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  drawLane(ctx, canvas, leftX, laneW, "Left", "#42c8c8", focusScale);
  drawLane(ctx, canvas, rightX, laneW, "Right", "#f2b94b", focusScale);
  drawDivider(ctx, canvas, leftX, rightX);
  drawHitLine(ctx, leftX, rightX, laneW, hitY, w, full);
  drawCountIn(ctx, nowBeat, w, h, hitY, focusScale);
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
    ctx.font = "900 " + Math.round(14 * focusScale) + "px Inter, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(group.word, (x1 + x2) / 2, y - (mobileFocus ? 48 : full ? 52 : 39));
    ctx.restore();
  });
  target.hits.forEach(hit => {
    const delta = nowBeat - hit.timeBeat;
    if (delta > hitFadeBeats) return;
    const y = delta >= 0 ? hitY : hitY - (hit.timeBeat - nowBeat) / leadBeats * (hitY - topPad);
    if (y < -90 || y > h + 90) return;
    drawNote(ctx, canvas, laneXForHand(hit.hand, leftX, rightX), y, hit, delta, focusScale);
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
  const mobileFocus = document.body.classList.contains("mobile-practice-focus-mode") || document.body.classList.contains("mobile-practice-fullscreen");
  const linePad = mobileFocus ? 28 : full ? 34 : 18;
  ctx.fillStyle = "rgba(242,185,75,.13)";
  ctx.fillRect(leftX - laneW / 2 - linePad, hitY - (mobileFocus ? 18 : full ? 19 : 14), rightX - leftX + laneW + linePad * 2, mobileFocus ? 36 : full ? 38 : 28);
  ctx.save();
  ctx.shadowBlur = mobileFocus ? 12 : full ? 14 : 6;
  ctx.shadowColor = "rgba(255,241,160,.54)";
  ctx.strokeStyle = "#fff1a0";
  ctx.lineWidth = mobileFocus ? 9 : full ? 10 : 7;
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
  if (songNameInput) songNameInput.value = currentSong.name || "";
  renderPartEditors("treble", trebleEditorsEl);
  renderPartEditors("bass", bassEditorsEl);
  setActiveEditor(document.querySelector("textarea[data-part='" + activeEditorPart + "']") || document.querySelector("textarea[data-part='treble']"));
  updateAllMetrics();
  updateSongStatus();
  buildTimeline();
  draw(pauseElapsed);
}
function renderPartEditors(part, container) {
  container.innerHTML = "";
  const toolbar = document.createElement("div");
  toolbar.className = "editorToolbar";
  const toolbarText = document.createElement("span");
  toolbarText.textContent = partLabel(part) + " sections";
  const add = document.createElement("button");
  add.type = "button";
  add.className = "secondary";
  add.dataset.sectionAction = "add";
  add.textContent = "Add Section";
  add.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); handleInlineSectionAction(add); });
  toolbar.append(toolbarText, add);
  container.appendChild(toolbar);
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
    title.textContent = "Section " + (index + 1);
    const name = document.createElement("input");
    name.type = "text";
    name.className = "sectionNameInput";
    name.placeholder = "Section title";
    name.value = section.name || "";
    name.dataset.sectionName = "true";
    name.dataset.sectionIndex = String(index);
    name.addEventListener("click", event => event.stopPropagation());
    name.addEventListener("keydown", event => event.stopPropagation());
    const actions = document.createElement("div");
    actions.className = "sectionActions";
    [["up", "Up"], ["down", "Down"], ["duplicate", "Duplicate"], ["delete", "Delete"]].forEach(([action, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = action === "delete" ? "danger" : "secondary";
      button.dataset.sectionAction = action;
      button.dataset.sectionIndex = String(index);
      button.textContent = label;
      if ((action === "up" && index === 0) || (action === "down" && index === currentSong.sections.length - 1)) button.disabled = true;
      button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); handleInlineSectionAction(button); });
      actions.appendChild(button);
    });
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
    head.append(title, name, actions, metric, preview, pad);
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
    const restTools = document.createElement("div");
    restTools.className = "localRestTools";
    const restToolsLabel = document.createElement("span");
    restToolsLabel.textContent = "Line Spacing Tools";
    const restButtons = document.createElement("div");
    restButtons.className = "localRestButtons";
    supportedRests().forEach(rest => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ghost";
      button.dataset.insertToken = rest;
      button.textContent = "Rest " + REST_DEFINITIONS[rest].durationBeats;
      restButtons.appendChild(button);
    });
    restTools.append(restToolsLabel, restButtons);
    const lineAnalysis = document.createElement("div");
    lineAnalysis.className = "lineAnalysis";
    lineAnalysis.dataset.lineAnalysisFor = String(index);
    lineAnalysis.dataset.lineAnalysisPart = part;
    card.append(head, editorShell, restTools, lineAnalysis);
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
  updateInsertTargetButtons();
  editorCursor.set(textarea, { start: textarea.selectionStart ?? textarea.value.length, end: textarea.selectionEnd ?? textarea.selectionStart ?? textarea.value.length });
}
function setInsertTarget(part) {
  const nextPart = part === "bass" ? "bass" : "treble";
  const preferred = activeEditor && activeEditor.dataset.part === nextPart ? activeEditor : document.querySelector("textarea[data-part='" + nextPart + "']");
  if (preferred) setActiveEditor(preferred);
  else {
    activeEditorPart = nextPart;
    activeEditorLabel.textContent = "Editing: " + partLabel(activeEditorPart);
    updateInsertTargetButtons();
  }
}
function updateInsertTargetButtons() {
  insertTargetButtons.forEach(button => {
    const active = button.dataset.insertTarget === activeEditorPart;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}
function updatePatternFromEditor(textarea) {
  const index = Number(textarea.dataset.sectionIndex);
  const part = textarea.dataset.part === "bass" ? "bass" : "treble";
  if (!currentSong.sections[index]) return;
  syncLineNumbers(textarea);
  currentSong.sections[index][patternKey(part)] = textarea.value;
  markDirty();
  buildTimeline();
  updateAllMetrics();
  draw(pauseElapsed);
}
function updateSongNameFromInput() {
  currentSong.name = songNameInput.value;
  songTitleEl.textContent = currentSong.name.trim() || "Unsaved practice song";
  markDirty();
}
function updateSectionNameFromInput(input) {
  const index = Number(input.dataset.sectionIndex);
  if (!currentSong.sections[index]) return;
  currentSong.sections[index].name = input.value;
  document.querySelectorAll("[data-section-name][data-section-index='" + index + "']").forEach(item => {
    if (item !== input) item.value = input.value;
  });
  markDirty();
}
function handleInlineSectionAction(button) {
  const action = button.dataset.sectionAction;
  const index = Number(button.dataset.sectionIndex);
  if (action === "add") currentSong.sections.push(makeSection());
  if (action === "up" && index > 0) [currentSong.sections[index - 1], currentSong.sections[index]] = [currentSong.sections[index], currentSong.sections[index - 1]];
  if (action === "down" && index < currentSong.sections.length - 1) [currentSong.sections[index + 1], currentSong.sections[index]] = [currentSong.sections[index], currentSong.sections[index + 1]];
  if (action === "duplicate" && currentSong.sections[index]) currentSong.sections.splice(index + 1, 0, makeSection({ ...currentSong.sections[index], id: "" }));
  if (action === "delete") {
    if (currentSong.sections.length <= 1) { window.alert("A song needs at least one section."); return; }
    if (!window.confirm("Delete Section " + (index + 1) + "?")) return;
    currentSong.sections.splice(index, 1);
  }
  markDirty();
  renderWorkspace();
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
  if (!padding) { window.alert("Bass is silent for " + beatsText(info.bassSilentBeats) + ". REST0.5, REST1, REST2, and REST4 can only pad half-beat increments."); return; }
  const key = "bassPattern";
  const lines = splitPatternLines(section[key]);
  while (lines.length <= lineIndex) lines.push("");
  lines[lineIndex] = appendTokens(lines[lineIndex], padding);
  section[key] = lines.join("\n");
  markDirty();
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
  if (!padding) { window.alert("Bass is silent for " + beatsText(info.bassSilentBeats) + ". REST0.5, REST1, REST2, and REST4 can only pad half-beat increments."); return; }
  section.bassPattern = appendTokens(section.bassPattern, padding);
  markDirty();
  renderWorkspace();
}

function renderInsertButtons() {
  insertButtonsEl.innerHTML = "";
  if (restInsertButtonsEl) restInsertButtonsEl.innerHTML = "";
  supportedWords().forEach(word => appendInsertButton(insertButtonsEl, word, word, WORD_DEFINITIONS[word].colorClass));
  supportedRests().forEach(rest => appendInsertButton(restInsertButtonsEl || insertButtonsEl, rest, "Rest " + REST_DEFINITIONS[rest].durationBeats, "restButton"));
}
function appendInsertButton(container, token, label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "insertButton " + className;
  button.dataset.insertToken = token;
  button.textContent = label;
  container.appendChild(button);
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
function validInstrumentView(view) { return ["both", "treble", "bass"].includes(view) ? view : "both"; }
function validInstrument(part) { return part === "bass" ? "bass" : "treble"; }
function isMobileViewport() { return window.matchMedia ? window.matchMedia("(max-width: 760px)").matches : window.innerWidth <= 760; }
function applyInstrumentView(view, { persist = true, redraw = true } = {}) {
  instrumentView = validInstrumentView(view);
  app.dataset.instrumentView = instrumentView;
  viewButtons.forEach(button => {
    const active = button.dataset.view === instrumentView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (persist) localStorage.setItem(INSTRUMENT_VIEW_KEY, instrumentView);
  if (redraw) requestVisualResize();
}
function requestVisualResize(delay = 0) {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    requestAnimationFrame(() => draw(elapsed()));
  }, delay);
}
function updateFullscreenCompactStatus() {
  if (!fullscreenStatus) return;
  fullscreenInstrumentName.textContent = fullscreenInstrument === "bass" ? "Bass" : "Treble / Chenda";
  fullscreenStatus.textContent = "BPM " + bpm.value + " | " + loopStatusEl.textContent + " | " + playTimerEl.textContent + " | " + sectionIndicatorEl.textContent;
  fullscreenMetronomeBtn.textContent = metronomeOn ? "Metro On" : "Metro Off";
  fullscreenMetronomeBtn.classList.toggle("active", metronomeOn);
  fullscreenMetronomeBtn.setAttribute("aria-pressed", String(metronomeOn));
}
function openFullscreenChoice() {
  fullscreenChoice.hidden = false;
}
function closeFullscreenChoice() {
  fullscreenChoice.hidden = true;
}
function chooseFullscreenFromCurrentView() {
  if (!isMobileViewport()) return enterPracticeFullscreen("both");
  if (instrumentView === "treble" || instrumentView === "bass") return enterPracticeFullscreen(instrumentView);
  openFullscreenChoice();
}
async function enterPracticeFullscreen(instrument = "both") {
  closeFullscreenChoice();
  preFullscreenScroll = { x: window.scrollX || 0, y: window.scrollY || 0 };
  fullscreenInstrument = instrument === "both" && isMobileViewport() ? validInstrument(localStorage.getItem(FULLSCREEN_INSTRUMENT_KEY)) : validInstrument(instrument);
  if (!isMobileViewport() && instrument === "both") fullscreenInstrument = "treble";
  localStorage.setItem(FULLSCREEN_INSTRUMENT_KEY, fullscreenInstrument);
  app.dataset.fullscreenInstrument = fullscreenInstrument;
  if (isMobileViewport()) {
    document.body.classList.remove("mobile-practice-focus-mode", "mobile-practice-fullscreen");
    try {
      if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else throw new Error("Fullscreen API unavailable");
      document.body.classList.add("mobile-practice-fullscreen");
    } catch (error) {
      document.body.classList.add("mobile-practice-focus-mode");
    }
    setFullscreenMode(true);
    requestVisualResize(40);
    return;
  }
  setFullscreenMode(true);
  try { if (!document.fullscreenElement && app.requestFullscreen) await app.requestFullscreen(); } catch (error) {}
  requestVisualResize(40);
}
async function exitPracticeFullscreen() {
  closeFullscreenChoice();
  try { if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen(); } catch (error) {}
  setFullscreenMode(false);
  window.scrollTo(preFullscreenScroll.x, preFullscreenScroll.y);
}
function setFullscreenMode(active) {
  app.classList.toggle("practiceFullscreen", active);
  document.body.classList.toggle("practice-mode-active", active);
  if (!active) document.body.classList.remove("mobile-practice-fullscreen", "mobile-practice-focus-mode");
  fullscreenBtn.textContent = active ? "Fullscreen: On" : "Fullscreen";
  updateFullscreenCompactStatus();
  requestVisualResize(60);
}
function syncFullscreenState() {
  if (!document.fullscreenElement && document.body.classList.contains("mobile-practice-fullscreen")) {
    setFullscreenMode(false);
    window.scrollTo(preFullscreenScroll.x, preFullscreenScroll.y);
  } else if (!document.fullscreenElement && app.classList.contains("practiceFullscreen") && !document.body.classList.contains("mobile-practice-focus-mode")) {
    setFullscreenMode(false);
  }
}
function isDesktopViewport() { return window.matchMedia ? window.matchMedia("(min-width: 761px)").matches : window.innerWidth > 760; }

function requiredElements() {
  return { app, savedSongsSelect, loadSongBtn, newSongBtn, saveSongBtn, saveAsSongBtn, deleteSongBtn, songNameInput, songSaveStatusEl, bpm, bpmNumber, metronomeToggle, metronomeVolume, metronomeSubdivision, startBtn, stopBtn, restartBtn, fullscreenBtn, fullscreenChoice, fullscreenTrebleBtn, fullscreenBassBtn, fullscreenCancelBtn, fullscreenStartBtn, fullscreenStopBtn, fullscreenRestartBtn, fullscreenMetronomeBtn, exitFullscreenBtn, trebleEditorsEl, bassEditorsEl, insertButtonsEl, restInsertButtonsEl, activeEditorLabel, sectionIndicatorEl, loopStatusEl, playTimerEl };
}
function warnMissingElements() { const missing = Object.entries(requiredElements()).filter(([, element]) => !element).map(([name]) => name); if (missing.length) console.warn("Chenda Practice Trainer missing required elements:", missing.join(", ")); }
function bindEvent(element, type, handler, name) { if (!element) { console.warn("Chenda Practice Trainer could not bind " + name + ": missing element."); return; } element.addEventListener(type, handler); }
function initializeApp() {
  if (appInitialized) return;
  appInitialized = true;
  warnMissingElements();
  writeSongLibrary(readSongLibrary());
  refreshSavedSongs();
  applyInstrumentView(instrumentView, { persist: false, redraw: false });
  renderInsertButtons();
  renderDefinitions();
  renderWorkspace();
  bindEvent(loadSongBtn, "click", loadSelectedSong, "load song");
  bindEvent(savedSongsSelect, "change", () => updateSongStatus(), "saved song dropdown");
  bindEvent(newSongBtn, "click", () => clearSelectedSong(), "new song");
  bindEvent(saveSongBtn, "click", saveCurrentSong, "save song");
  bindEvent(saveAsSongBtn, "click", saveCurrentSongAs, "save as song");
  bindEvent(deleteSongBtn, "click", deleteSelectedSong, "delete song");
  bindEvent(songNameInput, "input", updateSongNameFromInput, "song name");
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
  viewButtons.forEach(button => button.addEventListener("click", () => applyInstrumentView(button.dataset.view)));
  bindEvent(fullscreenBtn, "click", chooseFullscreenFromCurrentView, "fullscreen");
  bindEvent(fullscreenTrebleBtn, "click", () => enterPracticeFullscreen("treble"), "fullscreen treble");
  bindEvent(fullscreenBassBtn, "click", () => enterPracticeFullscreen("bass"), "fullscreen bass");
  bindEvent(fullscreenCancelBtn, "click", closeFullscreenChoice, "fullscreen cancel");
  bindEvent(fullscreenChoice, "click", event => { if (event.target === fullscreenChoice) closeFullscreenChoice(); }, "fullscreen choice backdrop");
  bindEvent(fullscreenStartBtn, "click", startReference, "fullscreen start");
  bindEvent(fullscreenStopBtn, "click", stopReference, "fullscreen stop");
  bindEvent(fullscreenRestartBtn, "click", restartReference, "fullscreen restart");
  bindEvent(fullscreenMetronomeBtn, "click", toggleMetronome, "fullscreen metronome");
  bindEvent(exitFullscreenBtn, "click", exitPracticeFullscreen, "exit fullscreen");
  bindEvent(insertButtonsEl, "pointerdown", event => { if (event.target.closest("[data-insert-token]")) event.preventDefault(); }, "insert pointer guard");
  bindEvent(insertButtonsEl, "click", event => { const button = event.target.closest("[data-insert-token]"); if (button) insertToken(button.dataset.insertToken); }, "insert buttons");
  bindEvent(restInsertButtonsEl, "pointerdown", event => { if (event.target.closest("[data-insert-token]")) event.preventDefault(); }, "rest insert pointer guard");
  bindEvent(restInsertButtonsEl, "click", event => { const button = event.target.closest("[data-insert-token]"); if (button) insertToken(button.dataset.insertToken); }, "rest insert buttons");
  if (!insertTargetButtons.length) console.warn("Chenda Practice Trainer missing insert target buttons.");
  insertTargetButtons.forEach(button => button.addEventListener("click", () => setInsertTarget(button.dataset.insertTarget)));
  document.addEventListener("focusin", event => { if (event.target.matches && event.target.matches("textarea[data-part]")) setActiveEditor(event.target); });
  document.addEventListener("keyup", event => { if (event.target.matches && event.target.matches("textarea[data-part]")) setActiveEditor(event.target); });
  document.addEventListener("mouseup", event => { if (event.target.matches && event.target.matches("textarea[data-part]")) setActiveEditor(event.target); });
  document.addEventListener("input", event => { if (event.target.matches && event.target.matches("textarea[data-part]")) { setActiveEditor(event.target); updatePatternFromEditor(event.target); } });
  document.addEventListener("input", event => { if (event.target.matches && event.target.matches("[data-section-name]")) updateSectionNameFromInput(event.target); });
  document.addEventListener("scroll", event => { if (event.target.matches && event.target.matches("textarea[data-part]")) syncLineNumbers(event.target); }, true);
  document.addEventListener("toggle", event => { if (event.target.matches && event.target.matches("details")) requestVisualResize(80); }, true);
  document.addEventListener("click", event => {
    const sectionAction = event.target.closest("[data-section-action]");
    if (sectionAction) { handleInlineSectionAction(sectionAction); return; }
    const tokenButton = event.target.closest("[data-insert-token]");
    const isWorkspaceInsert = tokenButton && (insertButtonsEl.contains(tokenButton) || (restInsertButtonsEl && restInsertButtonsEl.contains(tokenButton)));
    if (tokenButton && !isWorkspaceInsert) {
      if (tokenButton.dataset.insertPart && tokenButton.dataset.insertSection) insertTokenForPart(tokenButton.dataset.insertToken, tokenButton.dataset.insertPart, tokenButton.dataset.insertSection);
      else insertToken(tokenButton.dataset.insertToken);
      return;
    }
    const lineButton = event.target.closest("[data-pad-line]");
    if (lineButton) { padLine(Number(lineButton.dataset.padSection), Number(lineButton.dataset.padLine)); return; }
    const padButton = event.target.closest("[data-pad-section]");
    if (padButton) padSection(Number(padButton.dataset.padSection));
  });
  window.addEventListener("beforeunload", event => {
    if (!isDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
  document.addEventListener("fullscreenchange", syncFullscreenState);
  window.addEventListener("resize", () => requestVisualResize(80));
  window.addEventListener("orientationchange", () => requestVisualResize(160));
  setActiveEditor(document.querySelector("textarea[data-part='" + (instrumentView === "bass" ? "bass" : "treble") + "']"));
  resetReference();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
else initializeApp();
