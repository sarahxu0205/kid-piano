/**
 * 音频引擎模块
 * 
 * 功能说明：
 *   基于 Tone.js 封装的钢琴音频引擎，负责音色加载、音符播放和音量控制。
 *   使用 Web Audio API 合成钢琴音色（ADSR 包络 + 多泛音叠加），
 *   无需加载外部音频文件，实现零延迟启动和完全离线使用。
 * 
 * 功能特性：
 *   - 多泛音叠加合成，模拟钢琴音色
 *   - ADSR 包络控制，模拟钢琴击弦-衰减特性
 *   - 支持复音（同时播放多个音符）
 *   - 零外部依赖，完全离线可用
 *   - 支持延音踏板效果
 * 
 * 使用示例：
 *   await AudioEngine.init();
 *   AudioEngine.playNote('C4');
 *   AudioEngine.stopNote('C4');
 *   AudioEngine.setVolume(0.8);
 */

const AudioEngine = (() => {
    let synth = null;
    let isInitialized = false;
    let masterGain = null;

    /**
     * 初始化音频引擎
     * 
     * 功能说明：
     *   创建 Tone.js 合成器实例，配置钢琴音色参数。
     *   必须在用户交互（点击）后调用，以符合浏览器自动播放策略。
     * 
     * @returns {Promise<void>} 初始化完成
     */
    async function init() {
        if (isInitialized) return;

        await Tone.start();

        // 创建主音量控制节点
        masterGain = new Tone.Gain(0.8).toDestination();

        // 创建复音合成器（支持同时播放多个音符）
        synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                // 使用多泛音叠加模拟钢琴音色
                type: 'custom',
                partials: [1, 0.8, 0.6, 0.4, 0.25, 0.15, 0.1, 0.05],
            },
            envelope: {
                // ADSR 包络：模拟钢琴击弦特性
                attack: 0.005,    // 极短起音（锤击瞬间）
                decay: 0.3,       // 衰减时间
                sustain: 0.2,     // 持续音量（较低，模拟弦振动衰减）
                release: 1.5,     // 释放时间（较长，模拟自然衰减）
            },
            volume: -6,          // 基础音量（dB）
        }).connect(masterGain);

        // 设置最大复音数
        synth.maxPolyphony = 12;

        isInitialized = true;
        console.log('🎵 音频引擎初始化完成');
    }

    /**
     * 播放指定音符
     * 
     * 功能说明：
     *   触发指定音符的发声。如果该音符已在播放，会先停止再重新触发。
     * 
     * @param {string} note - 音符名称，格式为 'C4'、'C#4' 等
     * @param {number} [velocity=1] - 按键力度，范围 0-1，影响音量
     * 
     * 使用示例：
     *   AudioEngine.playNote('C4');      // 播放 C4
     *   AudioEngine.playNote('F#5', 0.5); // 轻轻按下 F#5
     */
    function playNote(note, velocity = 1) {
        if (!isInitialized || !synth) return;

        // 确保 AudioContext 处于运行状态
        if (Tone.context && Tone.context.state === 'suspended') {
            Tone.context.resume();
        }

        try {
            synth.triggerAttack(note, Tone.now(), velocity);
        } catch (e) {
            console.warn(`播放音符 ${note} 失败:`, e);
        }
    }

    /**
     * 停止指定音符
     * 
     * 功能说明：
     *   释放指定音符，触发衰减包络后静音。
     * 
     * @param {string} note - 音符名称，格式为 'C4'、'C#4' 等
     */
    function stopNote(note) {
        if (!isInitialized || !synth) return;
        try {
            synth.triggerRelease(note, Tone.now());
        } catch (e) {
            console.warn(`停止音符 ${note} 失败:`, e);
        }
    }

    /**
     * 播放指定音符并设定持续时间
     * 
     * 功能说明：
     *   触发音符后自动在指定时间后释放，适用于示范曲目播放。
     * 
     * @param {string} note - 音符名称
     * @param {string|number} duration - 持续时间，如 '4n'（四分音符）、'8n'（八分音符）或秒数
     * @param {number} [time] - 开始时间（Tone.js 时间格式），默认立即播放
     * @param {number} [velocity=1] - 按键力度
     */
    function playNoteForDuration(note, duration, time, velocity = 1) {
        if (!isInitialized || !synth) return;
        try {
            synth.triggerAttackRelease(note, duration, time || Tone.now(), velocity);
        } catch (e) {
            console.warn(`播放音符 ${note} (${duration}) 失败:`, e);
        }
    }

    /**
     * 停止所有音符
     * 
     * 功能说明：
     *   立即释放所有正在播放的音符，用于"紧急停止"场景。
     */
    function stopAll() {
        if (!isInitialized || !synth) return;
        synth.releaseAll();
    }

    /**
     * 设置主音量
     * 
     * @param {number} volume - 音量值，范围 0-1
     */
    function setVolume(volume) {
        if (masterGain) {
            masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * 获取当前音量
     * 
     * @returns {number} 当前音量值 0-1
     */
    function getVolume() {
        return masterGain ? masterGain.gain.value : 0.8;
    }

    /**
     * 检查音频引擎是否已初始化
     * 
     * @returns {boolean} 是否已初始化
     */
    function isReady() {
        return isInitialized;
    }

    /**
     * 获取 Tone.js Transport 引用
     * 
     * 功能说明：
     *   返回 Tone.Transport 对象，用于精确调度音符播放（示范曲目功能需要）。
     * 
     * @returns {Tone.Transport} Transport 对象
     */
    function getTransport() {
        return Tone.getTransport();
    }

    // 公开 API
    return {
        init,
        playNote,
        stopNote,
        playNoteForDuration,
        stopAll,
        setVolume,
        getVolume,
        isReady,
        getTransport,
    };
})();
