const THAKAA_INTERNAL_PAUSE_BEATS = 0.5;
const THAKAA_TRAILING_GAP_BEATS = 1.0;
const THAKKA_INTERNAL_PAUSE_BEATS = 0.5;
const THAKKA_TRAILING_GAP_BEATS = 0.25;
const THA_PICKUP_GAP_BEATS = 1.0;

const WORD_DEFINITIONS = {
  THA: {
    hits: [{ hand: "R", offsetBeats: 0, accented: false }],
    durationBeats: 1,
    colorClass: "word-tha",
    color: { fill: "#f2b94b", glow: "rgba(242,185,75,.72)", text: "#090a0e" },
    pickupGapAfterBeats: THA_PICKUP_GAP_BEATS,
    pickupTarget: "nextNonTHA",
    description: "One right-hand hit followed by a pause before the next non-THA word."
  },
  THAKA: {
    hits: [{ hand: "R", offsetBeats: 0, accented: false }, { hand: "L", offsetBeats: 1, accented: false }],
    durationBeats: 2,
    colorClass: "word-thaka",
    color: { fill: "#42c8c8", glow: "rgba(66,200,200,.72)", text: "#071011" },
    description: "Right then Left with normal sequential spacing."
  },
  THAKAA: {
    hits: [{ hand: "R", offsetBeats: 0, accented: false }, { hand: "L", offsetBeats: 1 + THAKAA_INTERNAL_PAUSE_BEATS, accented: false }],
    durationBeats: 2 + THAKAA_INTERNAL_PAUSE_BEATS,
    trailingGapBeats: THAKAA_TRAILING_GAP_BEATS,
    colorClass: "word-thakaa",
    color: { fill: "#60d67f", glow: "rgba(96,214,127,.72)", text: "#07100a" },
    description: "Right, 0.5-beat pause, Left, then 1 full silent beat before the next word."
  },
  THAKKA: {
    hits: [{ hand: "R", offsetBeats: 0, accented: false }, { hand: "L", offsetBeats: 1 + THAKKA_INTERNAL_PAUSE_BEATS, accented: false }],
    durationBeats: 2 + THAKKA_INTERNAL_PAUSE_BEATS,
    trailingGapBeats: THAKKA_TRAILING_GAP_BEATS,
    colorClass: "word-thakka",
    color: { fill: "#e95a45", glow: "rgba(233,90,69,.78)", text: "#fff8ec" },
    description: "Right, slight pause, Left, then a short gap before the next word."
  },
  THAKITA: {
    hits: [{ hand: "R", offsetBeats: 0, accented: false }, { hand: "R", offsetBeats: 1, accented: false }, { hand: "L", offsetBeats: 2, accented: false }],
    durationBeats: 3,
    colorClass: "word-thakita",
    color: { fill: "#8d7cff", glow: "rgba(141,124,255,.74)", text: "#090a0e" },
    description: "Right, Right, Left."
  }
};

const REST_DEFINITIONS = {
  REST1: { durationBeats: 1, description: "One silent beat" },
  REST2: { durationBeats: 2, description: "Two silent beats" },
  REST4: { durationBeats: 4, description: "Four silent beats" }
};

const DISPLAY_WORD_ORDER = ["THA", "THAKA", "THAKAA", "THAKKA", "THAKITA"];
const DISPLAY_REST_ORDER = ["REST1", "REST2", "REST4"];
const LEGACY_WORD_ALIASES = { TA: "THA" };
const songLibraryKey = "chendaPracticeSongs";
const countInBeats = 4, prepGapBeats = 4, hitFadeBeats = .34;

const $ = id => document.getElementById(id);
const app = $("app"), canvas = $("lane"), ctx = canvas.getContext("2d"), patternInput = $("patternInput"), warning = $("warning"), bpm = $("bpm"), bpmNumber = $("bpmNumber"), startBtn = $("start"), stopBtn = $("stop"), restartBtn = $("restart"), metronomeToggle = $("metronomeToggle"), metronomeVolume = $("metronomeVolume"), metronomeSubdivision = $("metronomeSubdivision"), fullscreenBtn = $("fullscreen"), fullscreenStopBtn = $("fullscreenStop"), fullscreenRestartBtn = $("fullscreenRestart"), exitFullscreenBtn = $("exitFullscreen"), savedSongsSelect = $("savedSongs"), newSongBtn = $("newSong"), editSongBtn = $("editSong"), deleteSongBtn = $("deleteSong"), bassPartBtn = $("bassPartButton"), treblePartBtn = $("treblePartButton"), songPracticeLabel = $("songPracticeLabel"), sectionIndicatorEl = $("sectionIndicator"), songModal = $("songModal"), songModalTitle = $("songModalTitle"), songNameInput = $("songNameInput"), sectionEditorList = $("sectionEditorList"), addSectionBtn = $("addSection"), saveSongBtn = $("saveSong"), cancelSongBtn = $("cancelSong"), cancelSongTopBtn = $("cancelSongTop"), compactToggle = $("compactToggle"), stateEl = $("state"), wordCountEl = $("wordCount"), hitCountEl = $("hitCount"), nowWordEl = $("nowWord"), playTimerEl = $("playTimer"), insertButtonsEl = $("insertButtons"), wordDefinitionListEl = $("wordDefinitionList");

let baseSections = [], words = [], hits = [], groups = [], loopEndBeats = [], timelineSections = [];
let running = false, startTime = 0, pauseElapsed = 0, raf = 0, loopCount = 4, builtLoopCount = 0, totalBeats = 0, completedLoops = 0;
let compactLanes = true, metronomeOn = false, lastMetronomeBeat = -1, audioContext = null;
let currentSongId = "", selectedSongPart = "bass", editingSongId = "", editorSections = [], activeSongTimeline = null;
let appInitialized = false;
const editorCursor = new WeakMap();

function wordDef(token) { return WORD_DEFINITIONS[token]; }
function restDef(token) { return REST_DEFINITIONS[token]; }
function tokenDef(token) { return wordDef(token) || restDef(token); }
function supportedWords() { return DISPLAY_WORD_ORDER.filter(word => wordDef(word)); }
function supportedRests() { return DISPLAY_REST_ORDER.filter(rest => restDef(rest)); }
function normalizeToken(token) { return LEGACY_WORD_ALIASES[token] || token; }
function tokenize(text) { return (String(text || "").toUpperCase().match(/[A-Z0-9]+/g) || []).map(normalizeToken); }
function normalizePatternText(text) { return tokenize(text).filter(token => tokenDef(token)).join(" "); }
function invalidPatternTokens(text) { return [...new Set(tokenize(text).filter(token => !tokenDef(token)))]; }
function validateSongPattern(text, label) { const bad = invalidPatternTokens(text); if (bad.length) { window.alert(label + " has unsupported tokens: " + bad.join(", ")); return false; } return true; }
function patternForPart(section, part) { return part === "treble" ? section.treblePattern || "" : section.bassPattern || ""; }
function newSection(seed = {}) { return { id: seed.id || "section-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8), name: seed.name || "", treblePattern: normalizePatternText(seed.treblePattern || ""), bassPattern: normalizePatternText(seed.bassPattern || "") }; }
function normalizeSection(section) { return newSection(section || {}); }
function normalizeSong(song) {
  const id = song && song.id ? String(song.id) : "song-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const oldParts = song && song.parts && typeof song.parts === "object" ? song.parts : null;
  const rawSections = Array.isArray(song && song.sections) && song.sections.length ? song.sections : [{ name: "", bassPattern: oldParts ? oldParts.bass : song?.bassPattern, treblePattern: oldParts ? oldParts.treble : song?.treblePattern }];
  return { id, name: String(song && song.name ? song.name : "Untitled Song"), sections: rawSections.map(normalizeSection), lastPart: song && song.lastPart === "treble" ? "treble" : "bass" };
}
function readSongLibrary() { try { const raw = localStorage.getItem(songLibraryKey); const parsed = raw ? JSON.parse(raw) : []; const list = Array.isArray(parsed) ? parsed : Object.values(parsed || {}); return list.map(normalizeSong).filter(song => song.name.trim()); } catch (error) { return []; } }
function writeSongLibrary(songs) { localStorage.setItem(songLibraryKey, JSON.stringify(songs.map(normalizeSong))); }
function migrateSongLibrary() { const songs = readSongLibrary(); writeSongLibrary(songs); return songs; }
function findSong(id = currentSongId) { return readSongLibrary().find(song => song.id === id); }
function preferredSongPart(song) { return song && song.lastPart === "treble" ? "treble" : "bass"; }
function partLabel(part = selectedSongPart) { return part === "treble" ? "Treble" : "Bass"; }
function selectedPartSections(song = findSong(), part = selectedSongPart) {
  if (!song) return [];
  return song.sections.map((section, index) => ({ id: section.id, number: index + 1, name: section.name, tokens: tokenize(patternForPart(section, part)).filter(token => tokenDef(token)) }));
}
function partTextForSong(song, part) { return song.sections.map(section => normalizePatternText(patternForPart(section, part))).filter(Boolean).join("\n"); }
function updateSongPracticeLabel() { const song = findSong(); songPracticeLabel.textContent = song ? "Song: " + song.name + "   Part: " + partLabel() : "Song: -   Part: -"; }
function refreshSavedSongs(selectedId = currentSongId) {
  const songs = readSongLibrary().sort((a, b) => a.name.localeCompare(b.name));
  savedSongsSelect.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = songs.length ? "Choose a saved song" : "No saved songs";
  savedSongsSelect.appendChild(empty);
  songs.forEach(song => { const option = document.createElement("option"); option.value = song.id; option.textContent = song.name; savedSongsSelect.appendChild(option); });
  if (selectedId && songs.some(song => song.id === selectedId)) { currentSongId = selectedId; savedSongsSelect.value = selectedId; }
  else if (!songs.some(song => song.id === currentSongId)) currentSongId = "";
  updateSongPracticeLabel();
}
function saveLastPart(songId, part) { const songs = readSongLibrary(); const song = songs.find(item => item.id === songId); if (song) { song.lastPart = part; writeSongLibrary(songs); } }
function loadSongPart(song = findSong()) {
  if (!song) { activeSongTimeline = null; updateSongPracticeLabel(); return; }
  const was = running;
  if (was) stopReference();
  patternInput.value = partTextForSong(song, selectedSongPart);
  activeSongTimeline = { songId: song.id, part: selectedSongPart, sections: selectedPartSections(song, selectedSongPart) };
  parsePattern();
  pauseElapsed = 0;
  draw(0);
  if (was) startReference();
  updateSongPracticeLabel();
}
function setSongPart(part, { load = true } = {}) {
  selectedSongPart = part === "treble" ? "treble" : "bass";
  document.querySelectorAll("[data-part]").forEach(button => button.classList.toggle("active", button.dataset.part === selectedSongPart));
  if (currentSongId) saveLastPart(currentSongId, selectedSongPart);
  if (load) loadSongPart();
  updateSongPracticeLabel();
}
function selectSong(id) { currentSongId = id || ""; const song = findSong(); if (!song) { activeSongTimeline = null; updateSongPracticeLabel(); return; } setSongPart(preferredSongPart(song), { load: false }); loadSongPart(song); }

function sectionDuration(pattern) { return measureTokens(tokenize(pattern).filter(token => tokenDef(token))); }
function measureTokens(tokens) {
  let beat = 0;
  tokens.forEach((token, index) => {
    const def = tokenDef(token);
    const next = tokens[index + 1];
    if (!def) return;
    if (restDef(token)) { beat += def.durationBeats; return; }
    beat += def.durationBeats;
    if (next && wordDef(next) && def.trailingGapBeats) beat += def.trailingGapBeats;
    if (def.pickupGapAfterBeats && next && wordDef(next) && def.pickupTarget === "nextNonTHA" && next !== "THA") beat += def.pickupGapAfterBeats;
  });
  return beat;
}
function beatText(value) { return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""); }
function beatsLabel(value) { return beatText(value) + " " + (Math.abs(value - 1) < .001 ? "beat" : "beats"); }
function sectionAlignment(section) {
  const treble = sectionDuration(section.treblePattern);
  const bass = sectionDuration(section.bassPattern);
  const diff = Math.abs(treble - bass);
  if (diff < .001) return { treble, bass, diff: 0, text: "Aligned: " + beatsLabel(treble), aligned: true };
  return { treble, bass, diff, text: (treble > bass ? "Bass" : "Treble") + " is short by " + beatsLabel(diff), aligned: false, shorter: treble > bass ? "bass" : "treble" };
}
function restPaddingForBeats(beats) {
  const rounded = Math.round(beats);
  if (Math.abs(beats - rounded) > .001) return null;
  const tokens = [];
  let remaining = rounded;
  [["REST4", 4], ["REST2", 2], ["REST1", 1]].forEach(([token, size]) => { while (remaining >= size) { tokens.push(token); remaining -= size; } });
  return tokens;
}
function appendTokens(text, tokens) { const clean = normalizePatternText(text); return (clean ? clean + " " : "") + tokens.join(" "); }
function isDesktopViewport() { return window.matchMedia ? window.matchMedia("(min-width: 761px)").matches : window.innerWidth > 760; }
function collectEditorSections() {
  if (!sectionEditorList) return;
  sectionEditorList.querySelectorAll(".songSectionEditor").forEach(card => {
    const index = Number(card.dataset.index);
    if (!editorSections[index]) return;
    const name = card.querySelector("[data-section-name]");
    const treble = card.querySelector("[data-section-part='treble']");
    const bass = card.querySelector("[data-section-part='bass']");
    editorSections[index].name = name ? name.value.trim() : "";
    editorSections[index].treblePattern = treble ? treble.value : "";
    editorSections[index].bassPattern = bass ? bass.value : "";
  });
}
function createPartEditor(section, index, part) {
  const wrap = document.createElement("div");
  wrap.className = "partEditor";
  const label = document.createElement("label");
  label.textContent = partLabel(part);
  const textarea = document.createElement("textarea");
  textarea.spellcheck = false;
  textarea.value = patternForPart(section, part);
  textarea.dataset.sectionIndex = String(index);
  textarea.dataset.sectionPart = part;
  const buttons = document.createElement("div");
  buttons.className = "restButtons";
  supportedRests().forEach(rest => { const button = document.createElement("button"); button.type = "button"; button.className = "loop"; button.dataset.insertRest = rest; button.textContent = "Rest " + REST_DEFINITIONS[rest].durationBeats; buttons.appendChild(button); });
  wrap.append(label, textarea, buttons);
  return wrap;
}
function updateSectionMetrics(index) {
  const card = sectionEditorList.querySelector("[data-index='" + index + "']");
  if (!card || !editorSections[index]) return;
  const info = sectionAlignment(editorSections[index]);
  const metrics = card.querySelector("[data-section-metrics]");
  const pad = card.querySelector("[data-section-action='pad']");
  if (metrics) metrics.innerHTML = "<span>Treble: " + beatsLabel(info.treble) + "</span><span>Bass: " + beatsLabel(info.bass) + "</span><strong>" + info.text + "</strong>";
  if (pad) pad.hidden = info.aligned;
}
function renderSongSections() {
  sectionEditorList.innerHTML = "";
  editorSections.forEach((section, index) => {
    const card = document.createElement("section");
    card.className = "songSectionEditor";
    card.dataset.index = String(index);
    const head = document.createElement("div");
    head.className = "sectionEditorHead";
    const title = document.createElement("div");
    title.className = "sectionTitle";
    title.textContent = "Section " + (index + 1);
    const name = document.createElement("input");
    name.type = "text";
    name.placeholder = "Optional section name";
    name.value = section.name || "";
    name.dataset.sectionName = "true";
    const actions = document.createElement("div");
    actions.className = "sectionActions";
    [["up", "Up"], ["down", "Down"], ["duplicate", "Duplicate"], ["delete", "Delete"]].forEach(([action, text]) => { const button = document.createElement("button"); button.type = "button"; button.className = action === "delete" ? "restart" : "loop"; button.dataset.sectionAction = action; button.textContent = text; if ((action === "up" && index === 0) || (action === "down" && index === editorSections.length - 1)) button.disabled = true; actions.appendChild(button); });
    head.append(title, name, actions);
    const parts = document.createElement("div");
    parts.className = "sectionParts";
    parts.append(createPartEditor(section, index, "treble"), createPartEditor(section, index, "bass"));
    const metrics = document.createElement("div");
    metrics.className = "sectionMetrics";
    metrics.dataset.sectionMetrics = "true";
    const pad = document.createElement("button");
    pad.type = "button";
    pad.className = "loop padButton";
    pad.dataset.sectionAction = "pad";
    pad.textContent = "Pad Shorter Part";
    card.append(head, parts, metrics, pad);
    sectionEditorList.appendChild(card);
    updateSectionMetrics(index);
  });
}
function openSongEditor(song = null) {
  editingSongId = song ? song.id : "";
  songModalTitle.textContent = song ? "Edit Song" : "New Song";
  songNameInput.value = song ? song.name : "";
  editorSections = song ? song.sections.map(normalizeSection) : [newSection()];
  renderSongSections();
  songModal.hidden = false;
  if (isDesktopViewport()) setTimeout(() => songNameInput.focus(), 0);
}
function closeSongEditor() { songModal.hidden = true; editingSongId = ""; editorSections = []; }
function saveSongFromEditor() {
  collectEditorSections();
  const name = songNameInput.value.trim();
  if (!name) { window.alert("Enter a song name."); return; }
  for (let i = 0; i < editorSections.length; i++) {
    if (!validateSongPattern(editorSections[i].treblePattern, "Section " + (i + 1) + " Treble") || !validateSongPattern(editorSections[i].bassPattern, "Section " + (i + 1) + " Bass")) return;
  }
  const songs = readSongLibrary();
  let song = songs.find(item => item.id === editingSongId);
  if (!song) { song = { id: "song-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8), name, sections: [], lastPart: selectedSongPart }; songs.push(song); }
  song.name = name;
  song.sections = editorSections.map(section => normalizeSection({ ...section, treblePattern: normalizePatternText(section.treblePattern), bassPattern: normalizePatternText(section.bassPattern) }));
  song.lastPart = selectedSongPart;
  writeSongLibrary(songs);
  currentSongId = song.id;
  closeSongEditor();
  refreshSavedSongs(song.id);
  selectSong(song.id);
}
function deleteSelectedSong() { const song = findSong(); if (!song) { window.alert("Select a song to delete."); return; } if (!window.confirm("Delete saved song: " + song.name + "?")) return; writeSongLibrary(readSongLibrary().filter(item => item.id !== song.id)); currentSongId = ""; activeSongTimeline = null; refreshSavedSongs(""); updateSongPracticeLabel(); parsePattern(); draw(0); }
function handleSectionAction(button) {
  collectEditorSections();
  const card = button.closest(".songSectionEditor");
  const index = card ? Number(card.dataset.index) : -1;
  const action = button.dataset.sectionAction;
  if (action === "up" && index > 0) [editorSections[index - 1], editorSections[index]] = [editorSections[index], editorSections[index - 1]];
  if (action === "down" && index < editorSections.length - 1) [editorSections[index + 1], editorSections[index]] = [editorSections[index], editorSections[index + 1]];
  if (action === "duplicate" && editorSections[index]) editorSections.splice(index + 1, 0, newSection({ ...editorSections[index], id: "" }));
  if (action === "delete") { if (editorSections.length <= 1) { window.alert("A song needs at least one section."); return; } editorSections.splice(index, 1); }
  if (action === "pad" && editorSections[index]) {
    const info = sectionAlignment(editorSections[index]);
    if (info.aligned) return;
    const padding = restPaddingForBeats(info.diff);
    if (!padding) { window.alert("This section is short by " + beatsLabel(info.diff) + ". REST1, REST2, and REST4 can only pad whole beats."); return; }
    const key = info.shorter === "treble" ? "treblePattern" : "bassPattern";
    editorSections[index][key] = appendTokens(editorSections[index][key], padding);
  }
  renderSongSections();
}
function insertRestIntoTextarea(textarea, rest) {
  const saved = editorCursor.get(textarea) || {};
  const start = Number.isFinite(saved.start) ? saved.start : textarea.selectionStart ?? textarea.value.length;
  const end = Number.isFinite(saved.end) ? saved.end : textarea.selectionEnd ?? start;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  const prefix = before && !/\s$/.test(before) ? " " : "";
  const insert = prefix + rest + " ";
  textarea.value = before + insert + after;
  const pos = before.length + insert.length;
  editorCursor.set(textarea, { start: pos, end: pos });
  const index = Number(textarea.dataset.sectionIndex);
  const key = textarea.dataset.sectionPart === "treble" ? "treblePattern" : "bassPattern";
  if (editorSections[index]) { editorSections[index][key] = normalizePatternText(textarea.value); updateSectionMetrics(index); }
}

function ensureAudioContext() { const AudioCtor = window.AudioContext || window.webkitAudioContext; if (!AudioCtor) return null; if (!audioContext) audioContext = new AudioCtor(); if (audioContext.state === "suspended") audioContext.resume(); return audioContext; }
function playMetronomeClick(strong = false) { if (!metronomeOn) return; const context = ensureAudioContext(); if (!context) return; const now = context.currentTime; const volume = Math.max(0, Math.min(1, Number(metronomeVolume.value) || 0)); const gain = context.createGain(); gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime((strong ? .12 : .075) * volume, now + .004); gain.gain.exponentialRampToValueAtTime(0.0001, now + (strong ? .075 : .055)); gain.connect(context.destination); const osc = context.createOscillator(); osc.type = strong ? "triangle" : "sine"; osc.frequency.setValueAtTime(strong ? 520 : 920, now); osc.frequency.exponentialRampToValueAtTime(strong ? 360 : 760, now + .045); osc.connect(gain); osc.start(now); osc.stop(now + .08); }
function triggerMetronome(nowBeat) { if (!metronomeOn || !running) return; const beatIndex = Math.floor(nowBeat); if (beatIndex < 0 || beatIndex > Math.ceil(totalBeats)) return; if (beatIndex === lastMetronomeBeat) return; lastMetronomeBeat = beatIndex; const subdivision = Math.max(1, Number(metronomeSubdivision.value) || 1); if (beatIndex % subdivision !== 0) return; try { playMetronomeClick(beatIndex % 4 === 0); } catch (error) { console.warn("Metronome click skipped", error); } }
function toggleMetronome() { metronomeOn = !metronomeOn; metronomeToggle.textContent = metronomeOn ? "Metronome: On" : "Metronome: Off"; metronomeToggle.classList.toggle("active", metronomeOn); metronomeToggle.setAttribute("aria-pressed", String(metronomeOn)); lastMetronomeBeat = -1; if (metronomeOn) { try { ensureAudioContext(); } catch (error) { console.warn("Metronome audio unavailable", error); } } }
function resizeCanvas() { const rect = canvas.getBoundingClientRect(); const ratio = Math.min(window.devicePixelRatio || 1, 2); const width = Math.max(320, Math.round(rect.width * ratio)); const height = Math.max(340, Math.round(rect.height * ratio)); if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; } }
function beatMs() { return 60000 / Number(bpm.value); }
function clampBpm(value) { const parsed = Number(value); if (!Number.isFinite(parsed)) return Number(bpm.value) || 100; return Math.max(100, Math.min(500, Math.round(parsed))); }
function applyBpm(value, { restart = false } = {}) { const next = clampBpm(value); bpm.value = String(next); bpmNumber.value = String(next); if (next > 300 && metronomeSubdivision.value === "1") metronomeSubdivision.value = "4"; const was = running; if (restart && was) stopReference(); parsePattern(); if (restart && was) startReference(); else draw(pauseElapsed); }
function isInfiniteLoop() { return loopCount === Infinity; }
function loopDisplay() { return isInfiniteLoop() ? "\u221e" : "x" + loopCount; }
function formatTime(ms) { const total = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0"); }
function updatePlayTimer(now) { if (playTimerEl) playTimerEl.textContent = formatTime(now); }
function makeManualSections() { return [{ number: 1, name: "", tokens: tokenize(patternInput.value).filter(token => tokenDef(token)) }]; }
function parsePattern() {
  const sourceSections = activeSongTimeline && activeSongTimeline.songId === currentSongId && activeSongTimeline.part === selectedSongPart ? activeSongTimeline.sections : makeManualSections();
  const bad = activeSongTimeline ? [] : invalidPatternTokens(patternInput.value);
  baseSections = sourceSections.map((section, index) => ({ number: section.number || index + 1, name: section.name || "", tokens: section.tokens.filter(token => tokenDef(token)) }));
  warning.textContent = bad.length ? "Ignored: " + bad.join(", ") : "";
  buildTimeline();
  completedLoops = 0;
  updateInfo(0);
  updatePlayTimer(pauseElapsed);
}
function appendSectionTokens(section, loopNumber) {
  const sectionStart = totalBeats;
  const boundary = { loopNumber: loopNumber + 1, sectionNumber: section.number, sectionName: section.name, startBeat: sectionStart, endBeat: sectionStart };
  section.tokens.forEach((token, sourceIndex) => {
    const def = tokenDef(token);
    const next = section.tokens[sourceIndex + 1];
    if (!def) return;
    if (restDef(token)) { totalBeats += def.durationBeats; return; }
    const index = words.length;
    const startBeat = totalBeats;
    const lastHitOffset = Math.max(...def.hits.map(hit => hit.offsetBeats));
    words.push(token);
    def.hits.forEach((part, offsetIndex) => hits.push({ hand: part.hand, accent: !!part.accented, word: token, wordIndex: index, part: offsetIndex, timeBeat: startBeat + part.offsetBeats, loopNumber: loopNumber + 1, sectionNumber: section.number }));
    groups.push({ word: token, index, startBeat, endBeat: startBeat + lastHitOffset, centerBeat: startBeat + lastHitOffset / 2, loopNumber: loopNumber + 1, sectionNumber: section.number });
    totalBeats += def.durationBeats;
    if (next && wordDef(next) && def.trailingGapBeats) totalBeats += def.trailingGapBeats;
    if (def.pickupGapAfterBeats && next && wordDef(next) && def.pickupTarget === "nextNonTHA" && next !== "THA") totalBeats += def.pickupGapAfterBeats;
  });
  boundary.endBeat = totalBeats;
  timelineSections.push(boundary);
}
function appendPatternLoop() { const loopNumber = builtLoopCount; baseSections.forEach(section => appendSectionTokens(section, loopNumber)); loopEndBeats.push(totalBeats); builtLoopCount++; }
function buildTimeline() { hits = []; groups = []; words = []; loopEndBeats = []; timelineSections = []; builtLoopCount = 0; totalBeats = countInBeats + prepGapBeats; const loopsToBuild = isInfiniteLoop() ? 8 : loopCount; for (let i = 0; i < loopsToBuild; i++) appendPatternLoop(); }
function ensureInfiniteTimeline(nowBeat) { if (!isInfiniteLoop()) return; while (totalBeats - nowBeat < 32) appendPatternLoop(); }
function currentSectionInfo(nowBeat) {
  if (!timelineSections.length) return null;
  const active = timelineSections.find(section => nowBeat >= section.startBeat && nowBeat < Math.max(section.endBeat, section.startBeat + .01));
  if (active) return active;
  if (nowBeat < countInBeats + prepGapBeats) return timelineSections[0];
  return timelineSections[timelineSections.length - 1];
}
function updateSectionIndicator(nowBeat) { if (!sectionIndicatorEl) return; const section = currentSectionInfo(nowBeat); sectionIndicatorEl.textContent = activeSongTimeline && section ? "Section " + section.sectionNumber + " of " + baseSections.length : "Section -"; }
function updateInfo(now) { wordCountEl.textContent = isInfiniteLoop() ? words.length + "+" : words.length; hitCountEl.textContent = isInfiniteLoop() ? hits.length + "+" : hits.length; const b = now / beatMs(); updateSectionIndicator(b); if (b < countInBeats) { nowWordEl.textContent = String(Math.min(4, Math.floor(b) + 1)); return; } if (b < countInBeats + prepGapBeats) { nowWordEl.textContent = "Ready"; return; } const active = groups.find(g => b >= g.startBeat - .22 && b <= g.endBeat + .22); nowWordEl.textContent = active ? active.word : "-"; }
function updateLoopCompletion(nowBeat) { while (completedLoops < loopEndBeats.length && nowBeat >= loopEndBeats[completedLoops]) completedLoops++; }
function resetReference() { parsePattern(); pauseElapsed = 0; startTime = performance.now(); draw(0); }
function startReference() { if (running) return; running = true; lastMetronomeBeat = -1; app.classList.add("playing"); stateEl.textContent = "Count-in"; startTime = performance.now() - pauseElapsed; loop(); }
function stopReference() { if (!running) return; running = false; pauseElapsed = performance.now() - startTime; app.classList.remove("playing"); stateEl.textContent = "Stopped"; cancelAnimationFrame(raf); draw(pauseElapsed); }
function finishReference(now) { running = false; pauseElapsed = now; app.classList.remove("playing"); stateEl.textContent = "Stopped"; cancelAnimationFrame(raf); draw(now); updateInfo(now); }
function restartReference() { running = false; lastMetronomeBeat = -1; cancelAnimationFrame(raf); parsePattern(); pauseElapsed = 0; startReference(); }
function elapsed() { return running ? performance.now() - startTime : pauseElapsed; }
function fullscreenVisualScale() { return app.classList.contains("practiceFullscreen") && window.innerWidth > 760 ? 1.55 : 1; }
function loop() { const now = elapsed(); const b = now / beatMs(); ensureInfiniteTimeline(b); stateEl.textContent = b < countInBeats ? "Count-in" : "Playing"; triggerMetronome(b); updateLoopCompletion(b); draw(now); updateInfo(now); if (!isInfiniteLoop() && b > totalBeats + 1.15) { finishReference(now); return; } if (running) raf = requestAnimationFrame(loop); }
function draw(now) { resizeCanvas(); updatePlayTimer(now); const w = canvas.width, h = canvas.height; const visualScale = fullscreenVisualScale(); const full = visualScale > 1; const hitY = h - (full ? 140 : 112); const topPad = full ? 104 : 84; const leadBeats = 8; const msPerBeat = beatMs(); const laneW = full ? (compactLanes ? Math.min(270, w * .34) : Math.min(360, w * .42)) : (compactLanes ? Math.min(150, w * .22) : Math.min(230, w * .3)); const gap = full ? (compactLanes ? Math.max(12, Math.min(20, w * .024)) : Math.min(70, w * .08)) : (compactLanes ? Math.max(6, Math.min(10, w * .018)) : Math.min(60, w * .08)); const leftX = w / 2 - laneW / 2 - gap / 2; const rightX = w / 2 + laneW / 2 + gap / 2; const linePad = full ? 42 : 16; ctx.clearRect(0, 0, w, h); const bg = ctx.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, "#151923"); bg.addColorStop(1, "#08090d"); ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); drawLane(leftX, laneW, "Left hand lane", "#42c8c8", visualScale); drawLane(rightX, laneW, "Right hand lane", "#f2b94b", visualScale); drawDivider(leftX, rightX, visualScale); ctx.save(); ctx.shadowBlur = full ? 18 : 0; ctx.shadowColor = "rgba(255,241,160,.7)"; ctx.strokeStyle = "#fff1a0"; ctx.lineWidth = full ? 12 : 7; ctx.beginPath(); ctx.moveTo(leftX - laneW / 2 - linePad, hitY); ctx.lineTo(rightX + laneW / 2 + linePad, hitY); ctx.stroke(); ctx.restore(); ctx.fillStyle = "rgba(242,185,75,.18)"; ctx.fillRect(leftX - laneW / 2 - linePad, hitY - (full ? 22 : 15), rightX - leftX + laneW + linePad * 2, full ? 44 : 30); const nowBeat = now / msPerBeat; updateSectionIndicator(nowBeat); drawCountIn(nowBeat, w, h, hitY, visualScale); groups.forEach(group => { const y = hitY - (group.centerBeat - nowBeat) / leadBeats * (hitY - topPad); if (y < -80 || y > h + 80) return; const def = wordDef(group.word); const x1 = laneXForHand(def.hits[0].hand, leftX, rightX); const x2 = laneXForHand(def.hits[def.hits.length - 1].hand, leftX, rightX); ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = "rgba(255,248,236,.82)"; ctx.font = "900 " + Math.round(16 * visualScale) + "px Inter, system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(group.word, (x1 + x2) / 2, y - (full ? 58 : 42)); ctx.restore(); }); hits.forEach(hit => { const delta = nowBeat - hit.timeBeat; if (delta > hitFadeBeats) return; const y = delta >= 0 ? hitY : hitY - (hit.timeBeat - nowBeat) / leadBeats * (hitY - topPad); if (y < -90 || y > h + 90) return; drawNote(laneXForHand(hit.hand, leftX, rightX), y, hit, delta, visualScale); }); drawLoopCounters(nowBeat, w, h, hitY, leftX, rightX, laneW, visualScale); ctx.fillStyle = "rgba(255,248,236,.72)"; ctx.font = "800 " + Math.round(17 * visualScale) + "px Inter, system-ui"; ctx.textAlign = "left"; ctx.fillText("BPM " + bpm.value, 24, full ? 42 : 34); ctx.fillText("Loop " + loopDisplay(), 24, full ? 72 : 58); ctx.fillText(compactLanes ? "Compact lanes" : "Wide lanes", 24, full ? 102 : 82); const next = hits.find(hit => hit.timeBeat >= nowBeat - .05); ctx.fillText(next ? "Next: " + next.word + " " + next.hand : isInfiniteLoop() ? "Looping" : "Pattern complete", 24, full ? 132 : 106); }
function currentLoopNumber(nowBeat) { if (!baseSections.length) return 0; if (!isInfiniteLoop() && completedLoops >= loopCount) return loopCount; return completedLoops + 1; }
function drawLoopCounters(nowBeat, w, h, hitY, leftX, rightX, laneW, visualScale = 1) { const total = isInfiniteLoop() ? "\u221e" : String(loopCount); const current = currentLoopNumber(nowBeat); const y = Math.min(h - 34, hitY + (visualScale > 1 ? 64 : 48)); const leftText = "Loops completed: " + completedLoops; const rightText = "Loop: " + current + " / " + total; ctx.save(); ctx.font = "850 " + Math.round(15 * Math.min(1.25, visualScale)) + "px Inter, system-ui"; ctx.textBaseline = "middle"; const leftMax = Math.max(150, leftX - laneW / 2 - 34); const rightMax = Math.max(150, w - (rightX + laneW / 2) - 34); const leftW = Math.min(Math.max(ctx.measureText(leftText).width + 24, 168), leftMax); const rightW = Math.min(Math.max(ctx.measureText(rightText).width + 24, 150), rightMax); ctx.fillStyle = "rgba(9,10,14,.58)"; ctx.strokeStyle = "rgba(255,248,236,.22)"; ctx.lineWidth = 1.5; roundRect(20, y - 18, leftW, 36, 8); ctx.fill(); ctx.stroke(); roundRect(w - 20 - rightW, y - 18, rightW, 36, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = "rgba(255,248,236,.82)"; ctx.textAlign = "left"; ctx.fillText(leftText, 32, y); ctx.textAlign = "right"; ctx.fillText(rightText, w - 32, y); ctx.restore(); }
function drawCountIn(nowBeat, w, h, hitY, visualScale = 1) { if (nowBeat >= countInBeats) return; const count = Math.floor(nowBeat) + 1; const progress = nowBeat - Math.floor(nowBeat); const full = visualScale > 1; ctx.save(); ctx.globalAlpha = .95 - progress * .2; ctx.fillStyle = "rgba(255,248,236,.12)"; ctx.beginPath(); ctx.arc(w / 2, hitY - (full ? 210 : 156), (full ? 92 : 70) + progress * (full ? 26 : 18), 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff8ec"; ctx.font = "950 " + Math.round(84 * visualScale) + "px Inter, system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(count), w / 2, hitY - (full ? 214 : 158)); ctx.font = "850 " + Math.round(16 * visualScale) + "px Inter, system-ui"; ctx.fillStyle = "rgba(255,248,236,.72)"; ctx.fillText("count-in", w / 2, hitY - (full ? 132 : 98)); ctx.restore(); }
function drawLane(x, laneW, label, color, visualScale = 1) { ctx.fillStyle = "rgba(255,255,255,.055)"; ctx.fillRect(x - laneW / 2, 0, laneW, canvas.height); ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = visualScale > 1 ? 3 : 2; ctx.strokeRect(x - laneW / 2, 0, laneW, canvas.height); ctx.fillStyle = color; ctx.font = "900 " + Math.round(20 * visualScale) + "px Inter, system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(label, x, visualScale > 1 ? 24 : 18); ctx.fillStyle = "rgba(255,255,255,.045)"; const step = visualScale > 1 ? 52 : 40; for (let y = visualScale > 1 ? 92 : 74; y < canvas.height; y += step) ctx.fillRect(x - laneW / 2, y, laneW, 1); }
function drawDivider(leftX, rightX, visualScale = 1) { const x = (leftX + rightX) / 2; ctx.save(); ctx.strokeStyle = "rgba(255,248,236,.38)"; ctx.lineWidth = visualScale > 1 ? 2 : 1; ctx.setLineDash(visualScale > 1 ? [12, 10] : [8, 8]); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
function laneXForHand(hand, leftX, rightX) { return hand === "R" ? rightX : leftX; }
function drawNote(x, y, hit, delta = -1, visualScale = 1) { const def = wordDef(hit.word) || wordDef("THA"); const palette = def.color; const hitting = delta >= 0; const progress = hitting ? Math.min(1, delta / hitFadeBeats) : 0; const hitScale = hitting ? 1.08 - progress * .08 : 1; const alpha = hitting ? 1 - progress : .98; const full = visualScale > 1; ctx.save(); ctx.translate(x, y); ctx.scale(hitScale, hitScale); ctx.globalAlpha = alpha; ctx.shadowBlur = hitting ? (full ? 42 : 30) - progress * (full ? 18 : 12) : (full ? 34 : 22); ctx.shadowColor = palette.glow; ctx.fillStyle = palette.fill; const noteW = full ? Math.max(118, Math.min(164, canvas.width * .17)) : Math.max(72, Math.min(104, canvas.width * .14)); const noteH = full ? Math.max(78, Math.min(96, canvas.height * .13)) : Math.max(50, Math.min(60, canvas.height * .11)); const radius = full ? 14 : 10; roundRect(-noteW / 2, -noteH / 2, noteW, noteH, radius); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = hitting ? "#fff8ec" : "rgba(255,248,236,.86)"; ctx.lineWidth = hit.accent ? (full ? 6 : 4) : (full ? 4 : 3); roundRect(-noteW / 2, -noteH / 2, noteW, noteH, radius); ctx.stroke(); ctx.fillStyle = palette.text; ctx.font = "950 " + (full ? 50 : 34) + "px Inter, system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(hit.hand, 0, full ? -4 : -2); ctx.fillStyle = hit.word === "THAKKA" ? "rgba(255,248,236,.86)" : "rgba(9,10,14,.72)"; ctx.font = "850 " + (full ? 14 : 10) + "px Inter, system-ui"; ctx.fillText(hit.word, 0, noteH * .34); ctx.fillStyle = "rgba(255,248,236,.98)"; ctx.strokeStyle = "rgba(9,10,14,.42)"; ctx.lineWidth = full ? 2 : 1; ctx.beginPath(); ctx.arc(0, 0, full ? 8 : 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore(); }
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function setLoop(value) { loopCount = value; document.querySelectorAll(".loop[data-loop]").forEach(button => button.classList.toggle("active", Number(button.dataset.loop) === loopCount)); const was = running; if (was) stopReference(); parsePattern(); pauseElapsed = 0; draw(0); if (was) startReference(); }
function insertWord(word) { activeSongTimeline = null; const start = patternInput.selectionStart ?? patternInput.value.length; const end = patternInput.selectionEnd ?? start; const before = patternInput.value.slice(0, start); const after = patternInput.value.slice(end); const prefix = before && !/\s$/.test(before) ? " " : ""; const insert = prefix + word + " "; patternInput.value = before + insert + after; const pos = (before + insert).length; patternInput.setSelectionRange(pos, pos); const was = running; if (was) stopReference(); parsePattern(); pauseElapsed = 0; draw(0); }
function toggleCompact() { compactLanes = !compactLanes; compactToggle.textContent = compactLanes ? "Compact lanes: ON" : "Compact lanes: OFF"; compactToggle.classList.toggle("active", compactLanes); draw(elapsed()); }
function setFullscreenMode(active) { app.classList.toggle("practiceFullscreen", active); fullscreenBtn.textContent = active ? "Fullscreen: ON" : "Fullscreen"; setTimeout(() => draw(elapsed()), 60); }
async function enterPracticeFullscreen() { setFullscreenMode(true); try { if (!document.fullscreenElement && app.requestFullscreen) await app.requestFullscreen(); } catch (error) {} draw(elapsed()); }
async function exitPracticeFullscreen() { try { if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen(); } catch (error) {} setFullscreenMode(false); }
function syncFullscreenState() { if (!document.fullscreenElement && app.classList.contains("practiceFullscreen")) setFullscreenMode(false); }
function hitLegend(def) { const sorted = [...def.hits].sort((a, b) => a.offsetBeats - b.offsetBeats); const parts = []; sorted.forEach((hit, index) => { if (index) { const gap = hit.offsetBeats - sorted[index - 1].offsetBeats; if (gap > 1) parts.push("pause"); } parts.push(hit.accented ? "accented " + hit.hand : hit.hand); }); return parts.join(parts.includes("pause") || parts.some(p => p.startsWith("accented")) ? ", " : " "); }
function renderWordControls() {
  insertButtonsEl.innerHTML = "";
  wordDefinitionListEl.innerHTML = "";
  supportedWords().forEach(word => {
    const def = wordDef(word);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wordButton " + def.colorClass;
    button.dataset.insert = word;
    button.textContent = word;
    insertButtonsEl.appendChild(button);
    const row = document.createElement("div");
    row.className = "mapRow definitionRow";
    const label = document.createElement("span");
    label.className = "wordLabel " + def.colorClass;
    label.textContent = word;
    const text = document.createElement("span");
    text.className = "definitionText";
    text.textContent = hitLegend(def) + (def.pickupGapAfterBeats ? "; pause before the next word" : "") + (def.trailingGapBeats ? "; trailing gap " + def.trailingGapBeats + " beat" : "");
    row.append(label, text);
    wordDefinitionListEl.appendChild(row);
  });
  supportedRests().forEach(rest => {
    const row = document.createElement("div");
    row.className = "mapRow definitionRow";
    const label = document.createElement("span");
    label.className = "wordLabel restLabel";
    label.textContent = rest;
    const text = document.createElement("span");
    text.className = "definitionText";
    text.textContent = REST_DEFINITIONS[rest].description;
    row.append(label, text);
    wordDefinitionListEl.appendChild(row);
  });
  document.querySelectorAll(".wordButton").forEach(button => { button.addEventListener("pointerdown", event => event.preventDefault()); button.addEventListener("click", () => insertWord(button.dataset.insert)); });
}
function requiredElements() { return { savedSongsSelect, newSongBtn, editSongBtn, deleteSongBtn, bassPartBtn, treblePartBtn, songModal, songNameInput, sectionEditorList, addSectionBtn, saveSongBtn, cancelSongBtn, cancelSongTopBtn, patternInput, bpm, bpmNumber, startBtn, stopBtn, restartBtn, fullscreenBtn, sectionIndicatorEl }; }
function warnMissingElements() { const missing = Object.entries(requiredElements()).filter(([, element]) => !element).map(([name]) => name); if (missing.length) console.warn("Chenda Practice Trainer missing required elements:", missing.join(", ")); return missing.length === 0; }
function bindEvent(element, type, handler, name) { if (!element) { console.warn("Chenda Practice Trainer could not bind " + name + ": missing element."); return; } element.addEventListener(type, handler); }
function initializeApp() {
  if (appInitialized) return;
  appInitialized = true;
  warnMissingElements();
  migrateSongLibrary();
  bindEvent(bpm, "input", () => applyBpm(bpm.value, { restart: true }), "BPM slider");
  bindEvent(bpmNumber, "input", () => { bpm.value = String(clampBpm(bpmNumber.value)); draw(pauseElapsed); }, "BPM number input");
  bindEvent(bpmNumber, "change", () => applyBpm(bpmNumber.value, { restart: true }), "BPM number change");
  bindEvent(bpmNumber, "blur", () => applyBpm(bpmNumber.value, { restart: true }), "BPM number blur");
  bindEvent(patternInput, "input", () => { activeSongTimeline = null; const was = running; if (was) stopReference(); parsePattern(); pauseElapsed = 0; draw(0); }, "pattern input");
  document.querySelectorAll(".loop[data-loop]").forEach(button => button.addEventListener("click", () => setLoop(Number(button.dataset.loop))));
  bindEvent(compactToggle, "click", toggleCompact, "compact lane toggle");
  bindEvent(metronomeToggle, "click", toggleMetronome, "metronome toggle");
  bindEvent(metronomeSubdivision, "change", () => { lastMetronomeBeat = -1; }, "metronome subdivision");
  bindEvent(savedSongsSelect, "change", () => selectSong(savedSongsSelect.value), "saved song dropdown");
  bindEvent(newSongBtn, "click", () => openSongEditor(), "new song");
  bindEvent(editSongBtn, "click", () => { const song = findSong(); if (!song) { window.alert("Select a song to edit."); return; } openSongEditor(song); }, "edit song");
  bindEvent(deleteSongBtn, "click", deleteSelectedSong, "delete song");
  document.addEventListener("click", event => { const partButton = event.target.closest && event.target.closest("[data-part]"); if (partButton) setSongPart(partButton.dataset.part); });
  bindEvent(addSectionBtn, "click", () => { collectEditorSections(); editorSections.push(newSection()); renderSongSections(); }, "add section");
  bindEvent(sectionEditorList, "pointerdown", event => { const restButton = event.target.closest && event.target.closest("[data-insert-rest]"); if (restButton) event.preventDefault(); }, "section rest pointer guard");
  bindEvent(sectionEditorList, "click", event => {
    const actionButton = event.target.closest && event.target.closest("[data-section-action]");
    if (actionButton) { handleSectionAction(actionButton); return; }
    const restButton = event.target.closest && event.target.closest("[data-insert-rest]");
    if (restButton) { const editor = restButton.closest(".partEditor"); const textarea = editor && editor.querySelector("textarea"); if (textarea) insertRestIntoTextarea(textarea, restButton.dataset.insertRest); }
  }, "section editor clicks");
  bindEvent(sectionEditorList, "input", event => {
    const target = event.target;
    const card = target.closest && target.closest(".songSectionEditor");
    if (!card) return;
    const index = Number(card.dataset.index);
    if (!editorSections[index]) return;
    if (target.dataset.sectionName) editorSections[index].name = target.value;
    if (target.dataset.sectionPart) editorSections[index][target.dataset.sectionPart === "treble" ? "treblePattern" : "bassPattern"] = target.value;
    updateSectionMetrics(index);
  }, "section editor input");
  bindEvent(sectionEditorList, "keyup", event => { if (event.target && event.target.dataset.sectionPart) editorCursor.set(event.target, { start: event.target.selectionStart, end: event.target.selectionEnd }); }, "section cursor keyup");
  bindEvent(sectionEditorList, "mouseup", event => { if (event.target && event.target.dataset.sectionPart) editorCursor.set(event.target, { start: event.target.selectionStart, end: event.target.selectionEnd }); }, "section cursor mouseup");
  bindEvent(saveSongBtn, "click", saveSongFromEditor, "save song");
  bindEvent(cancelSongBtn, "click", closeSongEditor, "cancel song");
  bindEvent(cancelSongTopBtn, "click", closeSongEditor, "close song editor");
  bindEvent(songModal, "click", event => { if (event.target === songModal) closeSongEditor(); }, "song modal backdrop");
  document.addEventListener("keydown", event => { if (event.key === "Escape" && songModal && !songModal.hidden) closeSongEditor(); });
  bindEvent(fullscreenBtn, "click", enterPracticeFullscreen, "fullscreen");
  bindEvent(fullscreenStopBtn, "click", stopReference, "fullscreen stop");
  bindEvent(fullscreenRestartBtn, "click", restartReference, "fullscreen restart");
  bindEvent(exitFullscreenBtn, "click", exitPracticeFullscreen, "exit fullscreen");
  document.addEventListener("fullscreenchange", syncFullscreenState);
  window.addEventListener("resize", () => draw(elapsed()));
  window.addEventListener("orientationchange", () => setTimeout(() => draw(elapsed()), 120));
  bindEvent(startBtn, "click", startReference, "start");
  bindEvent(stopBtn, "click", stopReference, "stop");
  bindEvent(restartBtn, "click", restartReference, "restart");
  renderWordControls();
  refreshSavedSongs();
  setSongPart(selectedSongPart, { load: false });
  resetReference();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
else initializeApp();
