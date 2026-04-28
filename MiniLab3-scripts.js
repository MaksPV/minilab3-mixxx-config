var MiniLab3 = {};

// ⏱ Настройки задержки двойного клика (мс)
MiniLab3.doubleClickDelay = 300;
MiniLab3.vuTimer = null;
MiniLab3.displayTimer = null;
MiniLab3.deck1BlinkOffTimer = null;
MiniLab3.deck2BlinkOffTimer = null;
MiniLab3.deck1FadeTimer = null;
MiniLab3.deck2FadeTimer = null;
MiniLab3.deck1AccentTimer = null;
MiniLab3.deck2AccentTimer = null;
MiniLab3.connections = [];
MiniLab3.padIds = [0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B];
MiniLab3.deck1PadIds = [0x04, 0x05, 0x06, 0x07];
MiniLab3.deck2PadIds = [0x08, 0x09, 0x0A, 0x0B];
MiniLab3.padLedMode = 0x02; // 0x00 = User mode, 0x02 = DAW mode
MiniLab3.bpmBlinkEveryBeats = 4; // 2 = раз в 2 удара, 4 = раз в 4 удара
MiniLab3.bpmFlashMs = 100; // длительность яркой фазы
MiniLab3.bpmFadeMs = 0; // не используется: оставляем для совместимости
MiniLab3.deck1Color = [0x1C, 0x46, 0x3C]; // pastel mint
MiniLab3.deck2Color = [0x52, 0x31, 0x28]; // pastel coral
MiniLab3.deck1LoopColor = [0x3A, 0x4A, 0x1E]; // pastel lime (loop active)
MiniLab3.deck2LoopColor = [0x3A, 0x24, 0x4C]; // pastel violet (loop active)
MiniLab3.deck1BeatCount = 0;
MiniLab3.deck2BeatCount = 0;
MiniLab3.deckPulseDimFactor = 0.35;
MiniLab3.deck1LoopActive = false;
MiniLab3.deck2LoopActive = false;
MiniLab3.deck1LoopStep = 0;
MiniLab3.deck2LoopStep = 0;
MiniLab3.deck1Accent = false;
MiniLab3.deck2Accent = false;
MiniLab3.downbeatAccentMs = 140;
MiniLab3.displayEnabled = true;
MiniLab3.displayRefreshMs = 500;
MiniLab3.displayOverlayUntil = 0;
MiniLab3.displayOverlayTimer = null;

// 📦 Состояние кнопки
MiniLab3.btnState = {
    lastPress: 0,
    clickTimer: null
};

MiniLab3.init = function() {
    MiniLab3.setDeckBaseGlow();
    MiniLab3.showDisplayText("MiniLab3", "Mixxx Ready");
    MiniLab3.setupBeatConnections();
    MiniLab3.startVuTimer();
    MiniLab3.startDisplayTimer();
    print("MiniLab3 Techno script initialized");
};

MiniLab3.shutdown = function() {
    if (MiniLab3.btnState.clickTimer) {
        engine.stopTimer(MiniLab3.btnState.clickTimer);
    }
    MiniLab3.stopBpmBlinkTimer();
    MiniLab3.stopVuTimer();
    MiniLab3.stopDisplayTimer();
    MiniLab3.disconnectBeatConnections();
    MiniLab3.setPadsColor(0x00);
    print("MiniLab3 Techno script shutdown");
};

MiniLab3.startVuTimer = function() {
    if (MiniLab3.vuTimer !== null) return;
    MiniLab3.vuTimer = engine.beginTimer(70, MiniLab3.renderVuFrame, false);
};

MiniLab3.stopVuTimer = function() {
    if (MiniLab3.vuTimer !== null) {
        engine.stopTimer(MiniLab3.vuTimer);
        MiniLab3.vuTimer = null;
    }
};

MiniLab3.startDisplayTimer = function() {
    if (!MiniLab3.displayEnabled || MiniLab3.displayTimer !== null) return;
    MiniLab3.displayTimer = engine.beginTimer(MiniLab3.displayRefreshMs, MiniLab3.updateDisplay, false);
};

MiniLab3.stopDisplayTimer = function() {
    if (MiniLab3.displayTimer !== null) {
        engine.stopTimer(MiniLab3.displayTimer);
        MiniLab3.displayTimer = null;
    }
    if (MiniLab3.displayOverlayTimer !== null) {
        engine.stopTimer(MiniLab3.displayOverlayTimer);
        MiniLab3.displayOverlayTimer = null;
    }
};

MiniLab3.setupBeatConnections = function() {
    MiniLab3.connections = [
        engine.makeConnection("[Channel1]", "beat_active", MiniLab3.onDeck1Beat),
        engine.makeConnection("[Channel2]", "beat_active", MiniLab3.onDeck2Beat),
        engine.makeConnection("[Channel1]", "play", MiniLab3.onDeck1PlayChanged),
        engine.makeConnection("[Channel2]", "play", MiniLab3.onDeck2PlayChanged),
        engine.makeConnection("[Channel1]", "loop_enabled", MiniLab3.onDeck1LoopChanged),
        engine.makeConnection("[Channel2]", "loop_enabled", MiniLab3.onDeck2LoopChanged),
        engine.makeConnection("[Channel1]", "volume", function(value) { MiniLab3.showDeckOverlayFromNormalized(1, "VOL", value, "%"); }),
        engine.makeConnection("[Channel2]", "volume", function(value) { MiniLab3.showDeckOverlayFromNormalized(2, "VOL", value, "%"); }),
        engine.makeConnection("[Channel1]", "pregain", function(value) { MiniLab3.showDeckOverlayScaled(1, "GAIN", value, 200, "%"); }),
        engine.makeConnection("[Channel2]", "pregain", function(value) { MiniLab3.showDeckOverlayScaled(2, "GAIN", value, 200, "%"); }),
        engine.makeConnection("[EqualizerRack1_[Channel1]_Effect1]", "parameter1", function(value) { MiniLab3.showDeckOverlayScaled(1, "EQ L", value, 200, "%"); }),
        engine.makeConnection("[EqualizerRack1_[Channel1]_Effect1]", "parameter2", function(value) { MiniLab3.showDeckOverlayScaled(1, "EQ M", value, 200, "%"); }),
        engine.makeConnection("[EqualizerRack1_[Channel1]_Effect1]", "parameter3", function(value) { MiniLab3.showDeckOverlayScaled(1, "EQ H", value, 200, "%"); }),
        engine.makeConnection("[EqualizerRack1_[Channel2]_Effect1]", "parameter1", function(value) { MiniLab3.showDeckOverlayScaled(2, "EQ L", value, 200, "%"); }),
        engine.makeConnection("[EqualizerRack1_[Channel2]_Effect1]", "parameter2", function(value) { MiniLab3.showDeckOverlayScaled(2, "EQ M", value, 200, "%"); }),
        engine.makeConnection("[EqualizerRack1_[Channel2]_Effect1]", "parameter3", function(value) { MiniLab3.showDeckOverlayScaled(2, "EQ H", value, 200, "%"); }),
        engine.makeConnection("[Channel1]", "rate", function(value) { MiniLab3.showRateOverlay(1, value); }),
        engine.makeConnection("[Channel2]", "rate", function(value) { MiniLab3.showRateOverlay(2, value); }),
        engine.makeConnection("[Channel1]", "sync_enabled", function(value) { MiniLab3.showDeckOverlay(1, "SYNC", value > 0 ? "ON" : "OFF"); }),
        engine.makeConnection("[Channel2]", "sync_enabled", function(value) { MiniLab3.showDeckOverlay(2, "SYNC", value > 0 ? "ON" : "OFF"); }),
        engine.makeConnection("[Channel1]", "cue_default", function(value) { if (value > 0) MiniLab3.showDeckOverlay(1, "CUE", "TRIG"); }),
        engine.makeConnection("[Channel2]", "cue_default", function(value) { if (value > 0) MiniLab3.showDeckOverlay(2, "CUE", "TRIG"); }),
        engine.makeConnection("[Channel1]", "play", function(value) { MiniLab3.showDeckOverlay(1, "PLAY", value > 0 ? "ON" : "OFF"); }),
        engine.makeConnection("[Channel2]", "play", function(value) { MiniLab3.showDeckOverlay(2, "PLAY", value > 0 ? "ON" : "OFF"); }),
        engine.makeConnection("[Channel1]", "loop_enabled", function(value) { MiniLab3.showDeckOverlay(1, "LOOP", value > 0 ? "ON" : "OFF"); }),
        engine.makeConnection("[Channel2]", "loop_enabled", function(value) { MiniLab3.showDeckOverlay(2, "LOOP", value > 0 ? "ON" : "OFF"); })
    ];
    MiniLab3.deck1LoopActive = engine.getValue("[Channel1]", "loop_enabled") > 0;
    MiniLab3.deck2LoopActive = engine.getValue("[Channel2]", "loop_enabled") > 0;
    MiniLab3.setDeckBaseGlow();
};

MiniLab3.disconnectBeatConnections = function() {
    for (var i = 0; i < MiniLab3.connections.length; i++) {
        MiniLab3.connections[i].disconnect();
    }
    MiniLab3.connections = [];
};

MiniLab3.onDeck1PlayChanged = function(value) {
    if (value <= 0) {
        MiniLab3.deck1BeatCount = 0;
        MiniLab3.applyDeckDim(1);
    } else {
        MiniLab3.applyDeckDim(1);
    }
};

MiniLab3.onDeck2PlayChanged = function(value) {
    if (value <= 0) {
        MiniLab3.deck2BeatCount = 0;
        MiniLab3.applyDeckDim(2);
    } else {
        MiniLab3.applyDeckDim(2);
    }
};

MiniLab3.onDeck1LoopChanged = function(value) {
    MiniLab3.deck1LoopActive = value > 0;
    if (!MiniLab3.deck1LoopActive) {
        MiniLab3.deck1LoopStep = 0;
    }
    MiniLab3.applyDeckDim(1);
};

MiniLab3.onDeck2LoopChanged = function(value) {
    MiniLab3.deck2LoopActive = value > 0;
    if (!MiniLab3.deck2LoopActive) {
        MiniLab3.deck2LoopStep = 0;
    }
    MiniLab3.applyDeckDim(2);
};

MiniLab3.stopBpmBlinkTimer = function() {
    if (MiniLab3.deck1BlinkOffTimer !== null) {
        engine.stopTimer(MiniLab3.deck1BlinkOffTimer);
        MiniLab3.deck1BlinkOffTimer = null;
    }
    if (MiniLab3.deck2BlinkOffTimer !== null) {
        engine.stopTimer(MiniLab3.deck2BlinkOffTimer);
        MiniLab3.deck2BlinkOffTimer = null;
    }
    if (MiniLab3.deck1FadeTimer !== null) {
        engine.stopTimer(MiniLab3.deck1FadeTimer);
        MiniLab3.deck1FadeTimer = null;
    }
    if (MiniLab3.deck2FadeTimer !== null) {
        engine.stopTimer(MiniLab3.deck2FadeTimer);
        MiniLab3.deck2FadeTimer = null;
    }
    if (MiniLab3.deck1AccentTimer !== null) {
        engine.stopTimer(MiniLab3.deck1AccentTimer);
        MiniLab3.deck1AccentTimer = null;
    }
    if (MiniLab3.deck2AccentTimer !== null) {
        engine.stopTimer(MiniLab3.deck2AccentTimer);
        MiniLab3.deck2AccentTimer = null;
    }
};

MiniLab3.onDeck1Beat = function(value) {
    if (value <= 0 || engine.getValue("[Channel1]", "play") <= 0) return;
    if (!MiniLab3.isDeckActiveForLights("[Channel1]")) {
        MiniLab3.setPadsGroupColor(MiniLab3.deck1PadIds, 0x00, 0x00, 0x00);
        return;
    }
    MiniLab3.deck1BeatCount += 1;
    if (MiniLab3.deck1LoopActive) {
        MiniLab3.deck1LoopStep = (MiniLab3.deck1LoopStep + 1) % MiniLab3.deck1PadIds.length;
        MiniLab3.renderLoopRunner(1);
        return;
    }
    if (MiniLab3.deck1BeatCount % 4 === 1) {
        MiniLab3.triggerDownbeatAccent(1);
    }
};

MiniLab3.onDeck2Beat = function(value) {
    if (value <= 0 || engine.getValue("[Channel2]", "play") <= 0) return;
    if (!MiniLab3.isDeckActiveForLights("[Channel2]")) {
        MiniLab3.setPadsGroupColor(MiniLab3.deck2PadIds, 0x00, 0x00, 0x00);
        return;
    }
    MiniLab3.deck2BeatCount += 1;
    if (MiniLab3.deck2LoopActive) {
        MiniLab3.deck2LoopStep = (MiniLab3.deck2LoopStep + 1) % MiniLab3.deck2PadIds.length;
        MiniLab3.renderLoopRunner(2);
        return;
    }
    if (MiniLab3.deck2BeatCount % 4 === 1) {
        MiniLab3.triggerDownbeatAccent(2);
    }
};

MiniLab3.triggerDownbeatAccent = function(deck) {
    var accentKey = (deck === 1) ? "deck1Accent" : "deck2Accent";
    var timerKey = (deck === 1) ? "deck1AccentTimer" : "deck2AccentTimer";
    MiniLab3[accentKey] = true;
    if (MiniLab3[timerKey] !== null) {
        engine.stopTimer(MiniLab3[timerKey]);
    }
    MiniLab3[timerKey] = engine.beginTimer(MiniLab3.downbeatAccentMs, function() {
        MiniLab3[accentKey] = false;
        MiniLab3[timerKey] = null;
    }, true);
};

MiniLab3.flashDeckPads = function(deck) {
    var color = MiniLab3.getDeckColor(deck);
    var padIds = (deck === 1) ? MiniLab3.deck1PadIds : MiniLab3.deck2PadIds;
    MiniLab3.setPadsGroupColor(padIds, color[0], color[1], color[2]);

    var offTimerName = (deck === 1) ? "deck1BlinkOffTimer" : "deck2BlinkOffTimer";
    var fadeTimerName = (deck === 1) ? "deck1FadeTimer" : "deck2FadeTimer";
    if (MiniLab3[offTimerName] !== null) {
        engine.stopTimer(MiniLab3[offTimerName]);
    }
    if (MiniLab3[fadeTimerName] !== null) {
        engine.stopTimer(MiniLab3[fadeTimerName]);
    }
    MiniLab3[fadeTimerName] = engine.beginTimer(MiniLab3.bpmFlashMs, function() {
        MiniLab3.applyDeckDim(deck);
        MiniLab3[fadeTimerName] = null;
    }, true);
    MiniLab3[offTimerName] = null;
};

MiniLab3.setDeckBaseGlow = function() {
    MiniLab3.applyDeckDim(1);
    MiniLab3.applyDeckDim(2);
};

MiniLab3.applyDeckDim = function(deck) {
    var color = MiniLab3.getDeckColor(deck);
    var padIds = (deck === 1) ? MiniLab3.deck1PadIds : MiniLab3.deck2PadIds;
    var f = MiniLab3.deckPulseDimFactor;
    MiniLab3.setPadsGroupColor(
        padIds,
        Math.max(1, Math.floor(color[0] * f)),
        Math.max(1, Math.floor(color[1] * f)),
        Math.max(1, Math.floor(color[2] * f))
    );
};

MiniLab3.getDeckColor = function(deck) {
    if (deck === 1) {
        return MiniLab3.deck1LoopActive ? MiniLab3.deck1LoopColor : MiniLab3.deck1Color;
    }
    return MiniLab3.deck2LoopActive ? MiniLab3.deck2LoopColor : MiniLab3.deck2Color;
};

MiniLab3.renderLoopRunner = function(deck) {
    var padIds = (deck === 1) ? MiniLab3.deck1PadIds : MiniLab3.deck2PadIds;
    var step = (deck === 1) ? MiniLab3.deck1LoopStep : MiniLab3.deck2LoopStep;
    var color = MiniLab3.getDeckColor(deck);
    var f = MiniLab3.deckPulseDimFactor;
    var dim = [
        Math.max(1, Math.floor(color[0] * f)),
        Math.max(1, Math.floor(color[1] * f)),
        Math.max(1, Math.floor(color[2] * f))
    ];

    for (var i = 0; i < padIds.length; i++) {
        var c = (i === step) ? color : dim;
        MiniLab3.setPadsGroupColor([padIds[i]], c[0], c[1], c[2]);
    }
};

MiniLab3.renderVuFrame = function() {
    if (!MiniLab3.deck1LoopActive) {
        MiniLab3.renderDeckVu(1);
    }
    if (!MiniLab3.deck2LoopActive) {
        MiniLab3.renderDeckVu(2);
    }
};

MiniLab3.renderDeckVu = function(deck) {
    var group = (deck === 1) ? "[Channel1]" : "[Channel2]";
    var padIds = (deck === 1) ? MiniLab3.deck1PadIds : MiniLab3.deck2PadIds;
    if (!MiniLab3.isDeckActiveForLights(group)) {
        MiniLab3.setPadsGroupColor(padIds, 0x00, 0x00, 0x00);
        return;
    }
    if (engine.getValue(group, "play") <= 0) {
        MiniLab3.applyDeckDim(deck);
        return;
    }

    var level = engine.getValue(group, "VuMeter");
    if (isNaN(level)) level = 0;
    level = Math.max(0, Math.min(1, level));

    var color = MiniLab3.getDeckColor(deck);
    var dim = MiniLab3.scaleColor(color, MiniLab3.deckPulseDimFactor);
    var accent = (deck === 1) ? MiniLab3.deck1Accent : MiniLab3.deck2Accent;
    var activeFactor = accent ? 1.15 : 0.85;
    var active = MiniLab3.scaleColor(color, activeFactor);
    var activeCount = Math.max(1, Math.round(level * padIds.length));

    for (var i = 0; i < padIds.length; i++) {
        var c = (i < activeCount) ? active : dim;
        MiniLab3.setPadsGroupColor([padIds[i]], c[0], c[1], c[2]);
    }
};

MiniLab3.isDeckActiveForLights = function(group) {
    var loaded = engine.getValue(group, "track_loaded") > 0;
    if (!loaded) return false;
    var pos = engine.getValue(group, "playposition");
    return pos < 0.995;
};

MiniLab3.scaleColor = function(color, factor) {
    return [
        Math.max(1, Math.min(0x7F, Math.floor(color[0] * factor))),
        Math.max(1, Math.min(0x7F, Math.floor(color[1] * factor))),
        Math.max(1, Math.min(0x7F, Math.floor(color[2] * factor)))
    ];
};

MiniLab3.updateDisplay = function() {
    if (!MiniLab3.displayEnabled) return;
    if (Date.now() < MiniLab3.displayOverlayUntil) return;
    var d1 = MiniLab3.getDeckDisplayState("[Channel1]", "D1");
    var d2 = MiniLab3.getDeckDisplayState("[Channel2]", "D2");
    MiniLab3.showDisplayText(d1, d2);
};

MiniLab3.showDeckOverlayFromNormalized = function(deck, label, value, unit) {
    var percent = Math.max(0, Math.min(100, Math.round(value * 100)));
    MiniLab3.showDeckOverlay(deck, label, percent + unit);
};

MiniLab3.showDeckOverlayScaled = function(deck, label, value, maxPercent, unit) {
    var percent = Math.max(0, Math.min(maxPercent, Math.round(value * 100)));
    MiniLab3.showDeckOverlay(deck, label, percent + unit);
};

MiniLab3.showRateOverlay = function(deck, rateValue) {
    var group = (deck === 1) ? "[Channel1]" : "[Channel2]";
    var bpm = engine.getValue(group, "bpm");
    var bpmText = (bpm > 0) ? bpm.toFixed(1) : "--.-";
    var pctText = (rateValue >= 0 ? "+" : "") + (rateValue * 100).toFixed(1) + "%";
    MiniLab3.showDeckOverlay(deck, "RATE", bpmText + " " + pctText);
};

MiniLab3.showDeckOverlay = function(deck, label, valueText) {
    if (!MiniLab3.displayEnabled) return;
    var d1 = MiniLab3.getDeckDisplayState("[Channel1]", "D1");
    var d2 = MiniLab3.getDeckDisplayState("[Channel2]", "D2");
    var line = "D" + deck + " " + label + " " + valueText;
    if (deck === 1) {
        d1 = line;
    } else {
        d2 = line;
    }
    MiniLab3.showDisplayText(d1, d2);
    MiniLab3.displayOverlayUntil = Date.now() + 1300;
    if (MiniLab3.displayOverlayTimer !== null) {
        engine.stopTimer(MiniLab3.displayOverlayTimer);
    }
    MiniLab3.displayOverlayTimer = engine.beginTimer(1350, function() {
        MiniLab3.displayOverlayTimer = null;
    }, true);
};

MiniLab3.getDeckDisplayState = function(group, label) {
    var loaded = engine.getValue(group, "track_loaded") > 0;
    if (!loaded) {
        return label + " -- EMPTY --";
    }

    var playing = engine.getValue(group, "play") > 0;
    var bpm = engine.getValue(group, "bpm");
    var loopOn = engine.getValue(group, "loop_enabled") > 0;
    var pos = engine.getValue(group, "playposition");
    if (isNaN(pos)) pos = 0;
    var remainPct = Math.max(0, Math.min(100, Math.round((1 - pos) * 100)));
    var bpmText = (bpm > 0) ? bpm.toFixed(1) : "--.-";
    return label + " " + (playing ? ">" : "||") + " " + bpmText + " " + (loopOn ? "L" : "-") + " " + remainPct + "%";
};

MiniLab3.setPadsColor = function(velocity) {
    var v = (velocity > 0) ? 0x7F : 0x00;
    MiniLab3.setPadsColorRgb(0x00, v, 0x00);
};

MiniLab3.setPadsColorRgb = function(r, g, b) {
    MiniLab3.setPadsGroupColor(MiniLab3.padIds, r, g, b);
};

MiniLab3.setPadsGroupColor = function(padIds, r, g, b) {
    for (var i = 0; i < padIds.length; i++) {
        var msg = [
            0xF0, 0x00, 0x20, 0x6B, 0x7F, 0x42,
            0x02, MiniLab3.padLedMode, 0x16, // pad LED color command for selected mode
            padIds[i], r, g, b,
            0xF7
        ];
        midi.sendSysexMsg(msg, msg.length);
    }
};

MiniLab3.showDisplayText = function(line1, line2) {
    var l1 = MiniLab3.asciiBytes((line1 || "").slice(0, 16));
    var l2 = MiniLab3.asciiBytes((line2 || "").slice(0, 16));
    // Display init sequence (found necessary on some MiniLab 3 setups)
    var initMsg = [
        0xF0, 0x00, 0x20, 0x6B, 0x7F, 0x42,
        0x02, 0x02, 0x40, 0x6A, 0x21,
        0xF7
    ];
    midi.sendSysexMsg(initMsg, initMsg.length);

    var msgDaw = [
        0xF0, 0x00, 0x20, 0x6B, 0x7F, 0x42,
        0x04, 0x02, 0x60,
        0x01
    ].concat(l1).concat([
        0x00,
        0x02
    ]).concat(l2).concat([
        0x00,
        0xF7
    ]);
    midi.sendSysexMsg(msgDaw, msgDaw.length);

    // Fallback variants for mode-dependent firmwares
    var msgUser = msgDaw.slice();
    msgUser[6] = 0x00;
    midi.sendSysexMsg(msgUser, msgUser.length);

    var msgArturia = msgDaw.slice();
    msgArturia[6] = 0x01;
    midi.sendSysexMsg(msgArturia, msgArturia.length);
};

MiniLab3.asciiBytes = function(text) {
    var bytes = [];
    for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i);
        if (code < 0x20 || code > 0x7E) {
            code = 0x20;
        }
        bytes.push(code);
    }
    return bytes;
};

// 🔄 Энкодер: скролл по библиотеке
MiniLab3.libraryEncoder = function(channel, control, value, status, group) {
    // 64 = нейтраль/центр, игнорируем возврат
    if (value === 64) return;

    // [Library]MoveVertical ждёт относительные значения:
    //  > 64 → вниз (следующий трек/папка)
    //  < 64 → вверх (предыдущий трек/папка)
    var direction = (value > 64) ? 1 : -1;
    engine.setValue("[Library]", "MoveVertical", direction);
};

// 🔘 Кнопка энкодера: Одинарный / Двойной клик
MiniLab3.libraryEncoderPush = function(channel, control, value, status, group) {
    if (value > 0) { // Нажатие
        var now = Date.now();

        // Если таймер ещё жив → это двойной клик
        if (MiniLab3.btnState.clickTimer !== null) {
            engine.stopTimer(MiniLab3.btnState.clickTimer);
            MiniLab3.btnState.clickTimer = null;
            MiniLab3.btnState.lastPress = 0;

            print("[Encoder] ⚡ Double Click -> Switch Focus (Sidebar <-> Tracks)");
            engine.setValue("[Library]", "MoveFocusForward", 1); // Эмулирует Tab
        } else {
            // Первый клик: запускаем таймер ожидания
            MiniLab3.btnState.lastPress = now;
            MiniLab3.btnState.clickTimer = engine.beginTimer(MiniLab3.doubleClickDelay, function() {
                print("[Encoder] 👆 Single Click -> Select / Load");
                engine.setValue("[Library]", "GoToItem", 1); // Эмулирует Enter / Double-Click action
                MiniLab3.btnState.clickTimer = null;
            }, true); // oneShot = true
        }
    }
    // Отпускание (value == 0) обрабатывать не нужно, таймер сам сработает
};


// ===== LOOP MOVE: ДЕКА 1 =====
MiniLab3.loopMoveCh1 = function(channel, control, value, status, group) {
    if (value > 0) { // Note On
        // control: 0x30 (48) = назад, 0x34 (52) = вперёд
        var dir = (control === 0x30) ? -1 : 1;
        engine.setValue("[Channel1]", "loop_move", dir);
    }
};

// ===== LOOP MOVE: ДЕКА 2 =====
MiniLab3.loopMoveCh2 = function(channel, control, value, status, group) {
    if (value > 0) { // Note On
        // control: 0x3C (60) = назад, 0x40 (64) = вперёд
        var dir = (control === 0x3C) ? -1 : 1;
        engine.setValue("[Channel2]", "loop_move", dir);
    }
};
