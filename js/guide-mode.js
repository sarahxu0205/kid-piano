/**
 * 轻松弹模块
 *
 * 功能说明：
 *   逐步提示小朋友弹奏一首完整的歌曲。
 *   钢琴上直接高亮闪烁下一个该按的键，按对了才往下走，没有时间压力。
 *
 * 功能特性：
 *   - 琴键闪烁高亮提示下一个该按的键
 *   - 琴键上方显示"按 Z"按键提示
 *   - 按对键后自动播放声音并跳到下一个
 *   - 按错键无反应，让小朋友自由尝试
 *   - 弹完一首歌后显示评分（星星数）
 *   - 支持随时退出轻松弹模式
 *
 * 使用示例：
 *   GuideMode.start('twinkle_star');  // 开始轻松弹《小星星》
 *   GuideMode.checkInput('C4');       // 检查用户按键是否匹配
 *   GuideMode.stop();                  // 退出轻松弹模式
 */

const GuideMode = (() => {
    /** 当前曲目音符序列 */
    let notes = [];

    /** 当前步骤索引（下一个要弹的音符） */
    let currentStep = 0;

    /** 是否激活 */
    let isActive = false;

    /** 当前高亮的琴键 DOM 元素 */
    let highlightedKey = null;

    /** 当前显示的提示气泡 DOM 元素 */
    let hintBubble = null;

    /** 轻松弹模式状态变更回调 */
    let onStateChange = null;

    /**
     * 开始轻松弹
     * 
     * @param {string} songId - 曲目 ID
     */
    function start(songId) {
        const song = DemoSongs.getSong(songId);
        if (!song) return;

        notes = song.notes.filter(n => !n.isRest);
        currentStep = 0;
        isActive = true;

        // 高亮第一个键
        highlightCurrentKey();

        // 通知状态变更
        if (onStateChange) onStateChange('started');

        console.log(`🎵 轻松弹开始：${song.name}，共 ${notes.length} 个音符`);
    }

    /**
     * 检查用户按键是否匹配当前步骤
     * 
     * @param {string} toneNote - 用户按下的音符，如 'C4'
     * @returns {boolean} 是否匹配（匹配时由本模块控制声音播放，调用方应停止播放）
     */
    function checkInput(toneNote) {
        if (!isActive || currentStep >= notes.length) return false;

        const targetNote = notes[currentStep].note;

        if (toneNote === targetNote) {
            // 按对了！
            // 播放声音
            AudioEngine.playNote(toneNote);
            PianoUI.highlightKey(toneNote, true);

            // 清除当前高亮
            clearHighlight();

            // 延迟后停止声音并跳到下一步
            const duration = notes[currentStep].duration;
            const beatDuration = 60 / DemoSongs.getSong(DemoSongs.getSelectedSongId()).bpm;
            const holdTime = duration * beatDuration * 1000;

            setTimeout(() => {
                AudioEngine.stopNote(toneNote);
                PianoUI.highlightKey(toneNote, false);

                // 跳到下一步
                currentStep++;

                if (currentStep >= notes.length) {
                    // 弹完了！
                    finish();
                } else {
                    // 高亮下一个键
                    highlightCurrentKey();
                }
            }, Math.min(holdTime, 500)); // 最多保持 500ms

            return true; // 告诉调用方不要重复播放
        }

        return false; // 按错了，不处理
    }

    /**
     * 高亮当前步骤对应的琴键
     */
    function highlightCurrentKey() {
        if (!isActive || currentStep >= notes.length) return;

        const noteData = notes[currentStep];
        const toneNote = noteData.note;

        // 获取琴键 DOM
        const keyElements = PianoUI.getKeyElements();
        const match = toneNote.match(/^([A-G]#?)(\d)$/);
        if (!match) return;

        const noteName = match[1];
        const octave = parseInt(match[2]);
        const octaveOffset = octave - baseOctave;
        const keyId = `${noteName}_${octaveOffset}`;
        const keyEl = keyElements[keyId];

        if (!keyEl) return;

        // 添加高亮类
        keyEl.classList.add('guide-highlight');
        highlightedKey = keyEl;

        // 创建提示气泡
        showHintBubble(keyEl, toneNote);
    }

    /**
     * 显示按键提示气泡
     * 
     * @param {HTMLElement} keyEl - 琴键 DOM 元素
     * @param {string} toneNote - 音符名
     */
    function showHintBubble(keyEl, toneNote) {
        // 移除旧气泡
        removeHintBubble();

        // 获取对应的键盘按键名
        const match = toneNote.match(/^([A-G]#?)(\d)$/);
        if (!match) return;
        const noteName = match[1];
        const octave = parseInt(match[2]);
        const octaveOffset = octave - baseOctave;
        const keyId = `${noteName}_${octaveOffset}`;
        const keyLabel = NOTE_TO_KEY[keyId];

        if (!keyLabel) return;

        // 创建气泡
        const bubble = document.createElement('div');
        bubble.className = 'guide-hint';
        bubble.textContent = `按 ${keyLabel.toUpperCase()}`;

        // 定位到琴键上方
        keyEl.appendChild(bubble);
        hintBubble = bubble;
    }

    /**
     * 移除提示气泡
     */
    function removeHintBubble() {
        if (hintBubble && hintBubble.parentElement) {
            hintBubble.parentElement.removeChild(hintBubble);
        }
        hintBubble = null;
    }

    /**
     * 清除当前高亮和提示
     */
    function clearHighlight() {
        if (highlightedKey) {
            highlightedKey.classList.remove('guide-highlight');
            highlightedKey = null;
        }
        removeHintBubble();
    }

    /**
     * 弹奏完成
     */
    function finish() {
        isActive = false;
        clearHighlight();

        // 计算评分（轻松弹模式下，小朋友是按对了才往下走的，所以默认满分）
        // 但可以记录按错次数来调整评分
        const totalNotes = notes.length;

        // 显示评分提示
        showScoreMessage();

        if (onStateChange) onStateChange('finished');
    }

    /**
     * 显示评分消息
     */
    function showScoreMessage() {
        // 在钢琴区域上方显示评分
        const pianoWrapper = document.querySelector('.piano-wrapper');
        if (!pianoWrapper) return;

        // 移除旧评分
        const oldMsg = document.querySelector('.guide-score');
        if (oldMsg) oldMsg.remove();

        const msg = document.createElement('div');
        msg.className = 'guide-score';
        msg.innerHTML = `
            <div class="guide-score-stars">⭐⭐⭐</div>
            <div class="guide-score-text">太棒了！你弹完了整首歌！🎶</div>
            <div class="guide-score-sub">点击「退出引导」可以选其他歌曲</div>
        `;

        pianoWrapper.insertBefore(msg, pianoWrapper.firstChild);

        // 5 秒后自动消失
        setTimeout(() => {
            if (msg.parentElement) {
                msg.style.opacity = '0';
                setTimeout(() => msg.remove(), 500);
            }
        }, 5000);
    }

    /**
     * 停止引导模式
     */
    function stop() {
        isActive = false;
        currentStep = 0;
        clearHighlight();

        // 移除评分消息
        const scoreMsg = document.querySelector('.guide-score');
        if (scoreMsg) scoreMsg.remove();

        if (onStateChange) onStateChange('stopped');
    }

    /**
     * 检查是否激活
     * @returns {boolean}
     */
    function getIsActive() {
        return isActive;
    }

    /**
     * 获取当前进度
     * @returns {{ current: number, total: number }}
     */
    function getProgress() {
        return {
            current: currentStep,
            total: notes.length,
        };
    }

    /**
     * 设置状态变更回调
     * @param {Function} callback - (state: 'started'|'finished'|'stopped') => void
     */
    function setOnStateChange(callback) {
        onStateChange = callback;
    }

    return {
        start,
        checkInput,
        stop,
        getIsActive,
        getProgress,
        setOnStateChange,
    };
})();
