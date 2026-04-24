/**
 * 常量定义模块
 * 
 * 功能说明：定义项目中使用的所有常量，包括音符定义、键盘映射、唱名映射等
 * 维护说明：修改键盘映射或音符配置时只需修改此文件
 */

/**
 * 音符名称定义
 * 12 个半音的名称序列
 */
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * 唱名映射（柯达伊唱名法）
 * 将音符名称映射为中文唱名，用于琴键标注
 */
const SOLFEGE_MAP = {
    'C': 'do', 'C#': 'do#',
    'D': 're', 'D#': 're#',
    'E': 'mi',
    'F': 'fa', 'F#': 'fa#',
    'G': 'sol', 'G#': 'sol#',
    'A': 'la', 'A#': 'la#',
    'B': 'si'
};

/**
 * 白键音符集合
 * 用于区分白键和黑键
 */
const WHITE_NOTES = new Set(['C', 'D', 'E', 'F', 'G', 'A', 'B']);

/**
 * 黑键音符集合
 */
const BLACK_NOTES = new Set(['C#', 'D#', 'F#', 'G#', 'A#']);

/**
 * 键盘到音符的映射配置
 * 
 * 结构说明：
 * - key: 电脑键盘按键（小写）
 * - noteIndex: 在 NOTE_NAMES 中的索引（0-11）
 * - octaveOffset: 相对于基础八度的偏移量（0=低八度，1=高八度）
 * 
 * 使用示例：
 *   按下 'z' 键 → 基础八度的 C 音
 *   按下 'q' 键 → 基础八度+1 的 C 音
 */
const KEY_MAP = {
    // 低八度白键：Z X C V B N M
    'z': { noteIndex: 0, octaveOffset: 0 },   // C
    'x': { noteIndex: 2, octaveOffset: 0 },   // D
    'c': { noteIndex: 4, octaveOffset: 0 },   // E
    'v': { noteIndex: 5, octaveOffset: 0 },   // F
    'b': { noteIndex: 7, octaveOffset: 0 },   // G
    'n': { noteIndex: 9, octaveOffset: 0 },   // A
    'm': { noteIndex: 11, octaveOffset: 0 },  // B
    // 低八度黑键：S D G H J
    's': { noteIndex: 1, octaveOffset: 0 },   // C#
    'd': { noteIndex: 3, octaveOffset: 0 },   // D#
    'g': { noteIndex: 6, octaveOffset: 0 },   // F#
    'h': { noteIndex: 8, octaveOffset: 0 },   // G#
    'j': { noteIndex: 10, octaveOffset: 0 },  // A#
    // 高八度白键：Q W E R T Y U
    'q': { noteIndex: 0, octaveOffset: 1 },   // C
    'w': { noteIndex: 2, octaveOffset: 1 },   // D
    'e': { noteIndex: 4, octaveOffset: 1 },   // E
    'r': { noteIndex: 5, octaveOffset: 1 },   // F
    't': { noteIndex: 7, octaveOffset: 1 },   // G
    'y': { noteIndex: 9, octaveOffset: 1 },   // A
    'u': { noteIndex: 11, octaveOffset: 1 },  // B
    // 高八度黑键：2 3 5 6 7
    '2': { noteIndex: 1, octaveOffset: 1 },   // C#
    '3': { noteIndex: 3, octaveOffset: 1 },   // D#
    '5': { noteIndex: 6, octaveOffset: 1 },   // F#
    '6': { noteIndex: 8, octaveOffset: 1 },   // G#
    '7': { noteIndex: 10, octaveOffset: 1 },  // A#
    // 扩展高音区白键：I O P
    'i': { noteIndex: 0, octaveOffset: 2 },   // C (高八度+1)
    'o': { noteIndex: 2, octaveOffset: 2 },   // D
    'p': { noteIndex: 4, octaveOffset: 2 },   // E
    // 扩展高音区黑键：9 0
    '9': { noteIndex: 1, octaveOffset: 2 },   // C#
    '0': { noteIndex: 3, octaveOffset: 2 },   // D#
};

/**
 * 反向映射：音符 → 键盘按键
 * 用于在琴键上显示对应的键盘按键提示
 * 格式：'C4' → 'z'
 */
const NOTE_TO_KEY = {};
Object.entries(KEY_MAP).forEach(([key, config]) => {
    const noteName = NOTE_NAMES[config.noteIndex];
    const octave = config.octaveOffset;
    NOTE_TO_KEY[`${noteName}_${octave}`] = key;
});

/**
 * 音符到 MIDI 编号的转换
 * @param {string} noteName - 音符名称，如 'C', 'C#'
 * @param {number} octave - 八度数，如 4
 * @returns {number} MIDI 音符编号
 */
function noteToMidi(noteName, octave) {
    const noteIndex = NOTE_NAMES.indexOf(noteName);
    return (octave + 1) * 12 + noteIndex;
}

/**
 * MIDI 编号转音符名称
 * @param {number} midi - MIDI 音符编号
 * @returns {{ noteName: string, octave: number }} 音符名称和八度
 */
function midiToNote(midi) {
    const noteIndex = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    return { noteName: NOTE_NAMES[noteIndex], octave };
}

/**
 * 生成 Tone.js 格式的音符字符串
 * @param {string} noteName - 音符名称，如 'C', 'C#'
 * @param {number} octave - 八度数
 * @returns {string} Tone.js 格式，如 'C4', 'C#4'
 */
function toToneNote(noteName, octave) {
    return `${noteName}${octave}`;
}

/**
 * 基础八度（可通过八度切换按钮调整）
 * 默认从 C4 开始
 */
let baseOctave = 4;

/**
 * 八度范围限制
 */
const MIN_OCTAVE = 2;
const MAX_OCTAVE = 6;

/**
 * 标注模式枚举
 * - 'solfeggio': 唱名模式（do-re-mi）
 * - 'letter': 字母模式（C-D-E）
 * - 'none': 无标注
 */
const LABEL_MODES = {
    SOLFEGGIO: 'solfeggio',
    LETTER: 'letter',
    NONE: 'none'
};

/**
 * 当前标注模式
 */
let currentLabelMode = LABEL_MODES.SOLFEGGIO;

/**
 * 钢琴配色方案（儿童友好）
 * 使用明亮、温暖的色彩
 */
const PIANO_COLORS = {
    // 白键颜色
    whiteKey: '#FFFFFF',
    whiteKeyHover: '#F0F7FF',
    whiteKeyActive: '#D1ECFA',
    whiteKeyBorder: '#E0E0E0',
    // 黑键颜色
    blackKey: '#2D2D2D',
    blackKeyHover: '#4A4A4A',
    blackKeyActive: '#4A90D9',
    // 音符颜色（彩虹色带，帮助儿童识别不同音高）
    noteColors: {
        'C': '#FF6B6B',   // 红
        'D': '#FF9F43',   // 橙
        'E': '#FECA57',   // 黄
        'F': '#55E6C1',   // 绿
        'G': '#48DBFB',   // 蓝
        'A': '#A29BFE',   // 靛
        'B': '#FD79A8',   // 粉
    },
    // 黑键使用相邻白键颜色的混合
    blackKeyColors: {
        'C#': '#FF8A5C',
        'D#': '#FFBE76',
        'F#': '#27C4E0',
        'G#': '#5B8DEF',
        'A#': '#C39BFF',
    }
};
