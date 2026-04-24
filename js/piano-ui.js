/**
 * 钢琴 UI 模块
 * 
 * 功能说明：
 *   负责钢琴键盘的 DOM 渲染、交互反馈和标注显示。
 *   生成 3 个八度的钢琴键盘（白键+黑键），支持标注模式切换和按键高亮。
 * 
 * 功能特性：
 *   - 动态生成钢琴键盘 DOM
 *   - 白键和黑键的正确布局（黑键覆盖在白键之间）
 *   - 按键按下/释放的视觉反馈（颜色变化 + 动画）
 *   - 三种标注模式切换（唱名/字母/无）
 *   - 音符颜色编码，帮助儿童识别不同音高
 *   - 响应式布局，适配不同屏幕宽度
 * 
 * 使用示例：
 *   PianoUI.init();
 *   PianoUI.highlightKey('C4', true);   // 高亮 C4 键
 *   PianoUI.highlightKey('C4', false);  // 取消高亮
 *   PianoUI.setLabelMode('letter');     // 切换为字母标注
 *   PianoUI.updateOctave(5);            // 更新八度显示
 */

const PianoUI = (() => {
    const pianoContainer = null;
    let keyElements = {};  // 存储琴键 DOM 元素，键名格式：'C_0', 'C#_1' 等

    /**
     * 初始化钢琴键盘 UI
     * 
     * 功能说明：
     *   根据当前基础八度，生成 3 个八度的钢琴键盘 DOM。
     *   每个八度包含 7 个白键和 5 个黑键，共 21 个白键和 15 个黑键。
     */
    function init() {
        const piano = document.getElementById('piano');
        if (!piano) return;

        piano.innerHTML = '';
        keyElements = {};

        // 生成 3 个八度的琴键
        for (let octaveOffset = 0; octaveOffset < 3; octaveOffset++) {
            createOctaveKeys(piano, octaveOffset);
        }

        // 更新标注显示
        updateLabels();
    }

    /**
     * 创建一个八度的琴键
     * 
     * @param {HTMLElement} container - 琴键容器
     * @param {number} octaveOffset - 八度偏移量（0=基础八度，1=高一个八度，2=高两个八度）
     */
    function createOctaveKeys(container, octaveOffset) {
        // 白键位置和对应的音符索引
        const whiteKeyNotes = [
            { noteIndex: 0, label: 'C' },
            { noteIndex: 2, label: 'D' },
            { noteIndex: 4, label: 'E' },
            { noteIndex: 5, label: 'F' },
            { noteIndex: 7, label: 'G' },
            { noteIndex: 9, label: 'A' },
            { noteIndex: 11, label: 'B' },
        ];

        // 黑键位置和对应的音符索引（相对于白键的位置）
        const blackKeyNotes = [
            { noteIndex: 1, label: 'C#', afterWhiteIndex: 0 },
            { noteIndex: 3, label: 'D#', afterWhiteIndex: 1 },
            { noteIndex: 6, label: 'F#', afterWhiteIndex: 3 },
            { noteIndex: 8, label: 'G#', afterWhiteIndex: 4 },
            { noteIndex: 10, label: 'A#', afterWhiteIndex: 5 },
        ];

        // 计算该八度白键的起始索引（用于定位黑键）
        const whiteKeyStartIndex = octaveOffset * 7;

        // 创建白键
        whiteKeyNotes.forEach(({ noteIndex, label }) => {
            const key = createKeyElement(label, octaveOffset, false);
            key.dataset.note = label;
            key.dataset.octaveOffset = octaveOffset;
            key.dataset.noteIndex = noteIndex;
            container.appendChild(key);
            keyElements[`${label}_${octaveOffset}`] = key;
        });

        // 创建黑键（绝对定位，覆盖在白键之间）
        blackKeyNotes.forEach(({ noteIndex, label, afterWhiteIndex }) => {
            const key = createKeyElement(label, octaveOffset, true);
            key.dataset.note = label;
            key.dataset.octaveOffset = octaveOffset;
            key.dataset.noteIndex = noteIndex;

            // 计算黑键的 left 位置
            // 黑键位于两个白键之间，偏移量为：白键宽度 * (afterWhiteIndex + 1) - 黑键宽度/2
            const whiteKeyWidth = 100 / 21; // 21 个白键均分
            const blackKeyWidth = whiteKeyWidth * 0.65;
            const leftPos = (whiteKeyStartIndex + afterWhiteIndex + 1) * whiteKeyWidth - blackKeyWidth / 2;
            key.style.left = `${leftPos}%`;
            key.style.width = `${blackKeyWidth}%`;

            container.appendChild(key);
            keyElements[`${label}_${octaveOffset}`] = key;
        });
    }

    /**
     * 创建单个琴键 DOM 元素
     * 
     * @param {string} noteName - 音符名称（如 'C', 'C#'）
     * @param {number} octaveOffset - 八度偏移量
     * @param {boolean} isBlack - 是否为黑键
     * @returns {HTMLElement} 琴键 DOM 元素
     */
    function createKeyElement(noteName, octaveOffset, isBlack) {
        const key = document.createElement('div');
        key.className = `piano-key ${isBlack ? 'black-key' : 'white-key'}`;

        // 添加音符颜色标识（底部彩色条纹）
        const colorBar = document.createElement('div');
        colorBar.className = 'key-color-bar';
        const color = isBlack
            ? (PIANO_COLORS.blackKeyColors[noteName] || '#666')
            : (PIANO_COLORS.noteColors[noteName] || '#CCC');
        colorBar.style.backgroundColor = color;
        key.appendChild(colorBar);

        // 添加标注文字
        const labelEl = document.createElement('span');
        labelEl.className = 'key-label';
        key.appendChild(labelEl);

        // 添加键盘快捷键提示
        const shortcut = NOTE_TO_KEY[`${noteName}_${octaveOffset}`];
        if (shortcut) {
            const shortcutEl = document.createElement('span');
            shortcutEl.className = 'key-shortcut';
            shortcutEl.textContent = shortcut.toUpperCase();
            key.appendChild(shortcutEl);
        }

        // 鼠标/触控事件（备用交互方式）
        key.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const toneNote = getToneNoteForElement(key);
            if (toneNote) {
                AudioEngine.playNote(toneNote);
                highlightKeyByElement(key, true);
            }
        });
        key.addEventListener('mouseup', () => {
            const toneNote = getToneNoteForElement(key);
            if (toneNote) {
                AudioEngine.stopNote(toneNote);
                highlightKeyByElement(key, false);
            }
        });
        key.addEventListener('mouseleave', () => {
            const toneNote = getToneNoteForElement(key);
            if (toneNote) {
                AudioEngine.stopNote(toneNote);
                highlightKeyByElement(key, false);
            }
        });

        return key;
    }

    /**
     * 根据琴键 DOM 元素获取 Tone.js 格式的音符名
     * 
     * @param {HTMLElement} element - 琴键 DOM 元素
     * @returns {string|null} Tone.js 格式音符名，如 'C4'
     */
    function getToneNoteForElement(element) {
        const noteName = element.dataset.note;
        const octaveOffset = parseInt(element.dataset.octaveOffset);
        const octave = baseOctave + octaveOffset;
        return toToneNote(noteName, octave);
    }

    /**
     * 高亮/取消高亮指定琴键（通过 DOM 元素）
     * 
     * @param {HTMLElement} element - 琴键 DOM 元素
     * @param {boolean} isActive - 是否高亮
     */
    function highlightKeyByElement(element, isActive) {
        if (isActive) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    }

    /**
     * 高亮/取消高亮指定音符的琴键
     * 
     * @param {string} toneNote - Tone.js 格式音符名，如 'C4'
     * @param {boolean} isActive - 是否高亮
     */
    function highlightKey(toneNote, isActive) {
        // 解析音符名和八度
        const match = toneNote.match(/^([A-G]#?)(\d)$/);
        if (!match) return;

        const noteName = match[1];
        const octave = parseInt(match[2]);
        const octaveOffset = octave - baseOctave;

        const key = keyElements[`${noteName}_${octaveOffset}`];
        if (key) {
            highlightKeyByElement(key, isActive);
        }
    }

    /**
     * 更新所有琴键的标注文字
     * 
     * 功能说明：
     *   根据当前标注模式（唱名/字母/无），更新所有琴键上显示的文字。
     */
    function updateLabels() {
        Object.entries(keyElements).forEach(([keyId, element]) => {
            const [noteName, octaveOffset] = keyId.split('_');
            const labelEl = element.querySelector('.key-label');

            if (!labelEl) return;

            switch (currentLabelMode) {
                case LABEL_MODES.SOLFEGGIO:
                    labelEl.textContent = SOLFEGE_MAP[noteName] || noteName;
                    labelEl.style.display = '';
                    break;
                case LABEL_MODES.LETTER:
                    labelEl.textContent = noteName;
                    labelEl.style.display = '';
                    break;
                case LABEL_MODES.NONE:
                    labelEl.style.display = 'none';
                    break;
            }
        });
    }

    /**
     * 设置标注模式
     * 
     * @param {string} mode - 标注模式：'solfeggio' | 'letter' | 'none'
     */
    function setLabelMode(mode) {
        currentLabelMode = mode;
        updateLabels();
    }

    /**
     * 获取当前标注模式
     * 
     * @returns {string} 当前标注模式
     */
    function getLabelMode() {
        return currentLabelMode;
    }

    /**
     * 切换到下一个标注模式
     * 
     * 功能说明：
     *   循环切换：唱名 → 字母 → 无标注 → 唱名
     * 
     * @returns {string} 切换后的标注模式
     */
    function cycleLabelMode() {
        const modes = [LABEL_MODES.SOLFEGGIO, LABEL_MODES.LETTER, LABEL_MODES.NONE];
        const currentIndex = modes.indexOf(currentLabelMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        setLabelMode(nextMode);
        return nextMode;
    }

    /**
     * 更新八度显示文本
     * 
     * @param {number} octave - 当前基础八度
     */
    function updateOctaveDisplay(octave) {
        const display = document.getElementById('octave-display');
        if (display) {
            display.textContent = `C${octave} - B${octave + 2}`;
        }
    }

    /**
     * 重新渲染键盘（八度切换时调用）
     * 
     * @param {number} newBaseOctave - 新的基础八度
     */
    function rebuild(newBaseOctave) {
        baseOctave = newBaseOctave;
        init();
        updateOctaveDisplay(newBaseOctave);
    }

    /**
     * 获取所有琴键元素
     * 
     * @returns {Object} 琴键元素映射
     */
    function getKeyElements() {
        return keyElements;
    }

    return {
        init,
        highlightKey,
        setLabelMode,
        getLabelMode,
        cycleLabelMode,
        updateOctaveDisplay,
        rebuild,
        getKeyElements,
    };
})();
