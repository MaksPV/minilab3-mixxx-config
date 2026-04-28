# Arturia MiniLab 3 Mixxx Mapping (EN/RU)

This folder contains a custom 2-deck Mixxx mapping for **Arturia MiniLab 3**.
This mapping is intended to be used with MiniLab 3 in **DAW mode**.

Files:
- `MINILAB3techno.midi.xml` - main MIDI mapping preset
- `MiniLab3-scripts.js` - script logic (library encoder, loop move, pad LED behavior)

---

## English

### Features
- 2-deck control layout (Deck 1 + Deck 2)
- Hotcues 1-4 for each deck
- Loop controls (halve, toggle, double, move left/right)
- Beatjump controls (size halve/double, jump backward/forward)
- Transport controls (Play, Cue, Sync)
- Mixer/EQ controls (volume, pregain, pitch/rate, EQ bands)
- Library encoder with:
  - single click: `GoToItem` (select/load action)
  - double click: `MoveFocusForward` (focus switch between sidebar and track list)
- Pad LED logic via **SysEx (MiniLab 3 DAW mode)**:
  - Pads `1-4` represent Deck 1, pads `5-8` represent Deck 2
  - Pastel color themes per deck
  - VU meter animation per deck
  - Downbeat accent (bar start pulse)
  - Loop runner animation when loop is active on a deck
  - Auto-off for a deck group when no track is loaded or track is near end
- OLED display output:
  - live deck status (`play/pause`, `BPM`, `loop`, remaining `%`)
  - temporary overlay messages when controls are changed (`VOL`, `GAIN`, `EQ`, `RATE`, `PLAY`, `CUE`, `SYNC`, `LOOP`)

### Install
1. Copy `MINILAB3techno.midi.xml` and `MiniLab3-scripts.js` to your Mixxx controllers directory.
2. In Mixxx, open `Preferences -> Controllers`.
3. Put MiniLab 3 into **DAW mode**.
4. Select your **Arturia MiniLab 3** input/output ports.
5. Load `MINILAB3techno.midi.xml` as the mapping preset.
6. Make sure scripting is enabled for this preset.

Typical controllers path:
- Linux: `~/.mixxx/controllers/`
- Windows: `%LOCALAPPDATA%\Mixxx\controllers\`
- macOS: `~/Library/Containers/org.mixxx.mixxx/Data/Library/Application Support/Mixxx/controllers/`

### Main MIDI Mapping (summary)

Deck 1 (notes):
- `36-39`: Hotcue 1-4
- `48 / 52`: Loop move -1 / +1 (script)
- `49`: Loop halve
- `50`: Loop toggle
- `51`: Loop double
- `53`: Beatjump backward
- `54`: Beatjump size halve
- `55`: Sync
- `56`: Play
- `57`: Cue
- `58`: Beatjump size double
- `59`: Beatjump forward

Deck 2 (notes):
- `40-43`: Hotcue 1-4
- `60 / 64`: Loop move -1 / +1 (script)
- `61`: Loop halve
- `62`: Loop toggle
- `63`: Loop double
- `65`: Beatjump backward
- `66`: Beatjump size halve
- `67`: Sync
- `68`: Play
- `69`: Cue
- `70`: Beatjump size double
- `71`: Beatjump forward

Library:
- `CC 0x1C`: encoder rotate (scroll up/down)
- `CC 0x76`: encoder push (single/double click logic)

Mixer/EQ (selected CC):
- Deck 1: `rate (0x55)`, `pregain (0x47)`, `volume (0x52)`, `EQ hi/mid/low (0x12/0x5D/0x4A)`
- Deck 2: `rate (0x11)`, `pregain (0x4C)`, `volume (0x53)`, `EQ hi/mid/low (0x13/0x10/0x4D)`

### Notes
- Loop move and library encoder behavior are implemented in `MiniLab3-scripts.js`.
- Double-click timeout for the encoder push is set to `300 ms` (`MiniLab3.doubleClickDelay`).
- This mapping expects MiniLab 3 in **DAW mode**.
- OLED display output is used for status and temporary control overlays.

### Tuning (LED)
You can quickly tune pad behavior in `MiniLab3-scripts.js`:
- `MiniLab3.deck1Color` / `MiniLab3.deck2Color` - base pastel colors for Deck 1/2
- `MiniLab3.deck1LoopColor` / `MiniLab3.deck2LoopColor` - colors while loop is active
- `MiniLab3.deckPulseDimFactor` - base dim level (`0.25..0.50` typical)
- `MiniLab3.downbeatAccentMs` - duration of downbeat accent pulse
- `MiniLab3.bpmFlashMs` - duration of bright phase (used by pulse helpers)
- `MiniLab3.bpmBlinkEveryBeats` - beat grouping helper (`4` recommended)

---

## Русский

### Что умеет маппинг
- Раскладка на 2 деки (Deck 1 + Deck 2)
- Hotcue 1-4 для каждой деки
- Управление лупами (уменьшить, вкл/выкл, увеличить, сдвиг влево/вправо)
- Beatjump (размер в 2 раза меньше/больше, прыжок назад/вперед)
- Транспорт (Play, Cue, Sync)
- Микшер и эквалайзер (volume, pregain, pitch/rate, полосы EQ)
- Энкодер библиотеки:
  - один клик: `GoToItem` (выбор/загрузка)
  - двойной клик: `MoveFocusForward` (переключение фокуса: sidebar <-> список треков)
- Логика подсветки пэдов через **SysEx (DAW mode MiniLab 3)**:
  - Пэды `1-4` относятся к Deck 1, пэды `5-8` к Deck 2
  - Пастельные цвета для каждой деки
  - Анимация VU-метра по декам
  - Акцент на первой доле такта
  - Бегунок при активном лупе на деке
  - Авто-гашение группы деки, если трек не загружен или почти закончился
- Вывод на OLED-экран:
  - live-статус дек (`play/pause`, `BPM`, `loop`, остаток `%`)
  - временные overlay-сообщения при изменении контролов (`VOL`, `GAIN`, `EQ`, `RATE`, `PLAY`, `CUE`, `SYNC`, `LOOP`)

### Установка
1. Скопируйте `MINILAB3techno.midi.xml` и `MiniLab3-scripts.js` в папку контроллеров Mixxx.
2. В Mixxx откройте `Preferences -> Controllers`.
3. Переведите MiniLab 3 в режим **DAW**.
4. Выберите вход/выход для **Arturia MiniLab 3**.
5. Загрузите пресет `MINILAB3techno.midi.xml`.
6. Убедитесь, что для пресета включены скрипты.

Типичный путь:
- Linux: `~/.mixxx/controllers/`
- Windows: `%LOCALAPPDATA%\Mixxx\controllers\`
- macOS: `~/Library/Containers/org.mixxx.mixxx/Data/Library/Application Support/Mixxx/controllers/`

### Основные назначения MIDI (кратко)

Deck 1 (ноты):
- `36-39`: Hotcue 1-4
- `48 / 52`: Сдвиг лупа -1 / +1 (скрипт)
- `49`: Loop halve
- `50`: Loop toggle
- `51`: Loop double
- `53`: Beatjump backward
- `54`: Размер beatjump в 2 раза меньше
- `55`: Sync
- `56`: Play
- `57`: Cue
- `58`: Размер beatjump в 2 раза больше
- `59`: Beatjump forward

Deck 2 (ноты):
- `40-43`: Hotcue 1-4
- `60 / 64`: Сдвиг лупа -1 / +1 (скрипт)
- `61`: Loop halve
- `62`: Loop toggle
- `63`: Loop double
- `65`: Beatjump backward
- `66`: Размер beatjump в 2 раза меньше
- `67`: Sync
- `68`: Play
- `69`: Cue
- `70`: Размер beatjump в 2 раза больше
- `71`: Beatjump forward

Библиотека:
- `CC 0x1C`: вращение энкодера (скролл вверх/вниз)
- `CC 0x76`: нажатие энкодера (логика одинарного/двойного клика)

Микшер/EQ (часть CC):
- Deck 1: `rate (0x55)`, `pregain (0x47)`, `volume (0x52)`, `EQ hi/mid/low (0x12/0x5D/0x4A)`
- Deck 2: `rate (0x11)`, `pregain (0x4C)`, `volume (0x53)`, `EQ hi/mid/low (0x13/0x10/0x4D)`

### Примечания
- Логика сдвига лупа и энкодера библиотеки реализована в `MiniLab3-scripts.js`.
- Таймаут двойного клика энкодера: `300 мс` (`MiniLab3.doubleClickDelay`).
- Этот маппинг рассчитан на работу MiniLab 3 в режиме **DAW**.
- OLED-экран используется для статуса и временных сообщений о действиях с контролами.

### Тюнинг (LED)
Основные параметры для быстрой подстройки в `MiniLab3-scripts.js`:
- `MiniLab3.deck1Color` / `MiniLab3.deck2Color` - базовые пастельные цвета Deck 1/2
- `MiniLab3.deck1LoopColor` / `MiniLab3.deck2LoopColor` - цвета при активном лупе
- `MiniLab3.deckPulseDimFactor` - базовая приглушенная яркость (обычно `0.25..0.50`)
- `MiniLab3.downbeatAccentMs` - длительность акцента на первой доле
- `MiniLab3.bpmFlashMs` - длительность яркой фазы (используется в pulse-логике)
- `MiniLab3.bpmBlinkEveryBeats` - вспомогательная группировка по битам (рекомендуется `4`)
