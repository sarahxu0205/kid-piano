/**
 * 键盘事件处理模块
 * 
 * 功能说明：
 *   监听电脑键盘的 keydown/keyup 事件，将按键映射为钢琴音符，
 *   并触发音频引擎播放和 UI 高亮。
 * 
 * 功能特性：
 *   - 支持多键同时按下（复音）
 *   - 防止按键重复触发（处理 e.repeat）
 *   - 跟踪当前活跃的按键集合
 *   - 八度切换快捷键（方向键左右）
 *   - 自动过滤非映射按键
 * 
 * 使用示例：
 *   KeyboardHandler.init();
 *   KeyboardHandler.setEnabled(false);  // 禁用键盘输入
 */

const KeyboardHandler = (() => {
    /** 当前处于按下状态的按键集合 */
    const activeKeys = new Set();

    /** 是否启用键盘输入 */
    let enabled = true;

    /** 按键按下回调（供外部模块监听），返回 true 表示由回调自行处理声音 */
    let onNoteOn = null;

    /** 按键释放回调（供外部模块监听），返回 true 表示由回调自行处理 */
    let onNoteOff = null;

    /**
     * 初始化键盘事件监听
     * 
     * 功能说明：
     *   绑定 keydown 和 keyup 事件监听器。
     *   应在应用启动时调用一次。
     */
    function init() {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }

    /**
     * 处理按键按下事件
     * 
     * @param {KeyboardEvent} e - 键盘事件对象
     */
    function handleKeyDown(e) {
        // 如果键盘输入被禁用，忽略
        if (!enabled) return;

        // 防止按住键时重复触发
        if (e.repeat) return;

        // 处理八度切换快捷键
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            changeOctave(-1);
            return;
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            changeOctave(1);
            return;
        }

        const key = e.key.toLowerCase();

        // 检查是否为映射的琴键
        if (!KEY_MAP[key]) return;
        if (activeKeys.has(key)) return;

        // 阻止浏览器默认行为（如按 '2' 不应触发地址栏搜索）
        e.preventDefault();

        // 标记为活跃按键
        activeKeys.add(key);

        // 计算实际音符
        const config = KEY_MAP[key];
        const noteName = NOTE_NAMES[config.noteIndex];
        const octave = baseOctave + config.octaveOffset;
        const toneNote = toToneNote(noteName, octave);

        // 触发外部回调（录制模块需要）
        // 如果回调返回 true，表示由回调自行处理声音（如轻松弹模式），不重复播放
        let handledByCallback = false;
        if (onNoteOn) {
            handledByCallback = onNoteOn(toneNote, Date.now());
        }

        // 确保 AudioContext 处于运行状态（浏览器可能在某些操作后暂停它）
        if (typeof Tone !== 'undefined' && Tone.context && Tone.context.state === 'suspended') {
            Tone.context.resume();
        }

        // 播放音符（如果回调没有自行处理）
        if (!handledByCallback) {
            AudioEngine.playNote(toneNote);
        }

        // 高亮琴键（如果回调没有自行处理）
        if (!handledByCallback) {
            PianoUI.highlightKey(toneNote, true);
        }
    }

    /**
     * 处理按键释放事件
     * 
     * @param {KeyboardEvent} e - 键盘事件对象
     */
    function handleKeyUp(e) {
        const key = e.key.toLowerCase();

        // 检查是否为活跃的映射琴键
        if (!activeKeys.has(key)) return;

        activeKeys.delete(key);

        // 计算实际音符
        const config = KEY_MAP[key];
        const noteName = NOTE_NAMES[config.noteIndex];
        const octave = baseOctave + config.octaveOffset;
        const toneNote = toToneNote(noteName, octave);

        // 触发外部回调
        let handledByCallback = false;
        if (onNoteOff) {
            handledByCallback = onNoteOff(toneNote, Date.now());
        }

        // 停止音符（如果回调没有自行处理）
        if (!handledByCallback) {
            AudioEngine.stopNote(toneNote);
            PianoUI.highlightKey(toneNote, false);
        }
    }

    /**
     * 切换八度
     * 
     * @param {number} delta - 变化量（-1=降低，+1=升高）
     */
    function changeOctave(delta) {
        const newOctave = baseOctave + delta;
        if (newOctave < MIN_OCTAVE || newOctave > MAX_OCTAVE) return;

        baseOctave = newOctave;
        PianoUI.rebuild(baseOctave);
    }

    /**
     * 设置键盘输入是否启用
     * 
     * @param {boolean} isEnabled - 是否启用
     */
    function setEnabled(isEnabled) {
        enabled = isEnabled;
    }

    /**
     * 设置音符按下回调
     * 
     * @param {Function} callback - 回调函数 (toneNote: string, timestamp: number) => void
     */
    function setOnNoteOn(callback) {
        onNoteOn = callback;
    }

    /**
     * 设置音符释放回调
     * 
     * @param {Function} callback - 回调函数 (toneNote: string, timestamp: number) => void
     */
    function setOnNoteOff(callback) {
        onNoteOff = callback;
    }

    /**
     * 释放所有活跃按键
     * 
     * 功能说明：
     *   停止所有正在播放的音符并取消高亮。
     *   适用于页面失焦或模式切换时。
     */
    function releaseAll() {
        activeKeys.forEach(key => {
            const config = KEY_MAP[key];
            if (config) {
                const noteName = NOTE_NAMES[config.noteIndex];
                const octave = baseOctave + config.octaveOffset;
                const toneNote = toToneNote(noteName, octave);
                AudioEngine.stopNote(toneNote);
                PianoUI.highlightKey(toneNote, false);
            }
        });
        activeKeys.clear();
    }

    return {
        init,
        setEnabled,
        setOnNoteOn,
        setOnNoteOff,
        releaseAll,
    };
})();
