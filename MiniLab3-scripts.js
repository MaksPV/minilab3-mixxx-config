var MiniLab3 = {};

// ⏱ Настройки задержки двойного клика (мс)
MiniLab3.doubleClickDelay = 300;

// 📦 Состояние кнопки
MiniLab3.btnState = {
    lastPress: 0,
    clickTimer: null
};

MiniLab3.init = function() {
    print("MiniLab3 Techno script initialized");
};

MiniLab3.shutdown = function() {
    if (MiniLab3.btnState.clickTimer) {
        engine.stopTimer(MiniLab3.btnState.clickTimer);
    }
    print("MiniLab3 Techno script shutdown");
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
