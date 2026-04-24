/**
 * 示范曲目模块
 * 
 * 功能说明：
 *   内置经典儿歌和民谣的曲目数据，支持自动播放演示和轻松弹。
 *   曲目数据使用简化的音符序列格式，包含音符名称、时值和拍速。
 *
 * 功能特性：
 *   - 内置多首中国经典儿歌
 *   - 支持自动播放（示范演示）
 *   - 支持轻松弹模式
 *   - 可调节播放速度
 *   - 播放时同步高亮琴键
 *
 * 使用示例：
 *   DemoSongs.getList();                          // 获取曲目列表
 *   DemoSongs.play('twinkle_star');               // 播放《小星星》
 *   DemoSongs.stop();                             // 停止播放
 */

const DemoSongs = (() => {
    /** 是否正在播放 */
    let isPlaying = false;

    /** 当前播放的定时器列表 */
    let playTimers = [];

    /** 当前播放速度倍率 */
    let speedMultiplier = 1;

    /** 播放回调（轻松弹模式使用） */
    let onFollowNote = null;

    /**
     * 曲目数据库
     * 
     * 每首曲目包含：
     *   - id: 唯一标识
     *   - name: 曲目名称
     *   - difficulty: 难度等级（1-3 星）
     *   - bpm: 拍速（每分钟拍数）
     *   - notes: 音符序列数组
     *     - note: 音符名（如 'C4'）
     *     - duration: 时值（拍数，1=一拍，0.5=半拍）
     *     - isRest: 是否为休止符
     */
    const SONGS = {
        twinkle_star: {
            id: 'twinkle_star',
            name: '小星星',
            nameEn: 'Twinkle Twinkle Little Star',
            difficulty: 1,
            bpm: 100,
            emoji: '⭐',
            notes: [
                // 第一句：一闪一闪亮晶晶
                { note: 'C4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 2 },
                // 第二句：满天都是小星星
                { note: 'F4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'C4', duration: 2 },
                // 第三句：挂在天空放光明
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 2 },
                // 第四句：好像许多小眼睛
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 2 },
                // 第五句：一闪一闪亮晶晶
                { note: 'C4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 2 },
                // 第六句：满天都是小星星
                { note: 'F4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'C4', duration: 2 },
            ],
        },
        two_tigers: {
            id: 'two_tigers',
            name: '两只老虎',
            nameEn: 'Two Tigers',
            difficulty: 1,
            bpm: 120,
            emoji: '🐯',
            notes: [
                // 两只老虎，两只老虎
                { note: 'C4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'C4', duration: 1 },
                // 跑得快，跑得快
                { note: 'E4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'G4', duration: 2 },
                { note: 'E4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'G4', duration: 2 },
                // 一只没有耳朵，一只没有尾巴
                { note: 'G4', duration: 0.5 },
                { note: 'A4', duration: 0.5 },
                { note: 'G4', duration: 0.5 },
                { note: 'F4', duration: 0.5 },
                { note: 'E4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'G4', duration: 0.5 },
                { note: 'A4', duration: 0.5 },
                { note: 'G4', duration: 0.5 },
                { note: 'F4', duration: 0.5 },
                { note: 'E4', duration: 1 },
                { note: 'C4', duration: 1 },
                // 真奇怪，真奇怪
                { note: 'D4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'C4', duration: 2 },
                { note: 'D4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'C4', duration: 2 },
            ],
        },
        happy_birthday: {
            id: 'happy_birthday',
            name: '生日快乐',
            nameEn: 'Happy Birthday',
            difficulty: 2,
            bpm: 100,
            emoji: '🎂',
            notes: [
                // 祝你生日快乐
                { note: 'G4', duration: 0.75 },
                { note: 'G4', duration: 0.25 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'B4', duration: 2 },
                // 祝你生日快乐
                { note: 'G4', duration: 0.75 },
                { note: 'G4', duration: 0.25 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'D5', duration: 1 },
                { note: 'C5', duration: 2 },
                // 祝你生日快乐
                { note: 'G4', duration: 0.75 },
                { note: 'G4', duration: 0.25 },
                { note: 'G5', duration: 1 },
                { note: 'E5', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'B4', duration: 1 },
                { note: 'A4', duration: 1 },
                // 祝你生日快乐
                { note: 'F5', duration: 0.75 },
                { note: 'F5', duration: 0.25 },
                { note: 'E5', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'D5', duration: 1 },
                { note: 'C5', duration: 2 },
            ],
        },
        ode_to_joy: {
            id: 'ode_to_joy',
            name: '欢乐颂',
            nameEn: 'Ode to Joy',
            difficulty: 2,
            bpm: 108,
            emoji: '🎶',
            notes: [
                // 欢乐女神圣洁美丽
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                // 灿烂光芒照大地
                { note: 'C4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1.5 },
                { note: 'D4', duration: 0.5 },
                { note: 'D4', duration: 2 },
                // 我们心中充满热情
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                // 来到你的圣殿里
                { note: 'C4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1.5 },
                { note: 'C4', duration: 0.5 },
                { note: 'C4', duration: 2 },
            ],
        },
        painter: {
            id: 'painter',
            name: '粉刷匠',
            nameEn: 'Little Painter',
            difficulty: 1,
            bpm: 80,
            emoji: '🖌️',
            notes: [
                // 我是一个粉刷匠（5 3 5 3 | 5 3 1 -）
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'C4', duration: 2 },
                // 粉刷本领强（2 4 3 2 | 5 - - -）
                { note: 'D4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'G4', duration: 3 },
                // 我要把那新房子（5 3 5 3 | 5 3 1 -）
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'C4', duration: 2 },
                // 刷得更漂亮（2 4 3 2 | 1 - - -）
                { note: 'D4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'C4', duration: 3 },
                // 刷了房顶又刷墙（2 2 4 4 | 3 1 5 -）
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'G4', duration: 2 },
                // 刷子飞舞忙（2 4 3 2 | 5 - - -）
                { note: 'D4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'G4', duration: 3 },
                // 哎呀我的小鼻子（5 3 5 3 | 5 3 1 -）
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'C4', duration: 2 },
                // 变呀变了样（2 4 3 2 | 1 - - -）
                { note: 'D4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'C4', duration: 3 },
            ],
        },
        mary_lamb: {
            id: 'mary_lamb',
            name: '玛丽有只小羊羔',
            nameEn: 'Mary Had a Little Lamb',
            difficulty: 1,
            bpm: 100,
            emoji: '🐑',
            notes: [
                // Mary had a little lamb（3 2 1 2 | 3 3 3 -）
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 2 },
                // little lamb（2 2 2 - | 3 5 5 -）
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 2 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 2 },
                // Mary had a little lamb（3 2 1 2 | 3 3 3 3）
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                // whose fleece was white as snow（2 2 3 2 | 1 - - -）
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'C4', duration: 3 },
            ],
        },
        little_donkey: {
            id: 'little_donkey',
            name: '小毛驴',
            nameEn: 'Little Donkey',
            difficulty: 1,
            bpm: 120,
            emoji: '🫏',
            notes: [
                // 我有一只小毛驴 我从来也不骑（1 1 1 3 | 5 5 5 5 | 6 6 6 1̇ | 5 -）
                { note: 'C4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'G4', duration: 2 },
                // 有一天我心血来潮骑着去赶集（4 4 4 6 | 3 3 3 3 | 2 2 2 2 | 5. 5）
                { note: 'F4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'G4', duration: 1.5 },
                { note: 'G4', duration: 0.5 },
                // 我手里拿着小皮鞭 我心里正得意（1 1 1 3 | 5 5 5 5 | 6 6 6 1̇ | 5 -）
                { note: 'C4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'G4', duration: 2 },
                // 不知怎么哗啦啦啦我摔了一身泥（4 4 4 6 | 3 3 3 3 | 2 2 2 3 | 1 -）
                { note: 'F4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'C4', duration: 2 },
            ],
        },
        lullaby: {
            id: 'lullaby',
            name: '摇篮曲',
            nameEn: 'Brahms Lullaby',
            difficulty: 1,
            bpm: 80,
            emoji: '🌙',
            notes: [
                // 睡吧睡吧亲爱的宝贝（3 3 5 | 3 - 5 | 1̇ 7 6 | 5 - -）
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 2 },
                { note: 'G4', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'B4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 3 },
                // 温柔的双手抚摸你（3 3 5 | 3 - 5 | 1̇ 7 6 | 5 - -）
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 2 },
                { note: 'G4', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'B4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 3 },
                // 安睡在摇篮里（3 5 6 | 5 - 3 | 2 2 3 | 1 - -）
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 2 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'C4', duration: 3 },
                // 安睡在摇篮里（3 5 6 | 5 - 3 | 2 2 3 | 1 - -）
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 2 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'C4', duration: 3 },
            ],
        },
        farewell: {
            id: 'farewell',
            name: '送别',
            nameEn: 'Farewell',
            difficulty: 2,
            bpm: 80,
            emoji: '🎓',
            notes: [
                // 长亭外古道边芳草碧连天（5 3 5 1̇ - | 7 6 5 - | 5 1̇ 7 6 | 1̇ 5 - -）
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'C5', duration: 2 },
                { note: 'B4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 2 },
                { note: 'G4', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'B4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'G4', duration: 3 },
                // 晚风拂柳笛声残（6 1̇ 6 5 | 3 5 6 5）
                { note: 'A4', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 1 },
                // 夕阳山外山（2 3 4 - | 6 6 5 3 | 2 - - -）
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'F4', duration: 2 },
                { note: 'A4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 3 },
                // 天之涯地之角知交半零落（5 3 5 1̇ - | 7 6 5 - | 5 1̇ 7 6 | 1̇ 5 - -）
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'C5', duration: 2 },
                { note: 'B4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 2 },
                { note: 'G4', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'B4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'G4', duration: 3 },
                // 一壶浊酒尽余欢（6 1̇ 6 5 | 3 5 6 5）
                { note: 'A4', duration: 1 },
                { note: 'C5', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 1 },
                // 今宵别梦寒（2 3 4 - | 6 6 5 3 | 2 - - -）
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'F4', duration: 2 },
                { note: 'A4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 3 },
            ],
        },
        long_long_ago: {
            id: 'long_long_ago',
            name: '多年以前',
            nameEn: 'Long Long Ago',
            difficulty: 1,
            bpm: 90,
            emoji: '🕰️',
            notes: [
                // 请告诉我多年以前（1 1 2 3 3 | 5 6 5 3 -）
                { note: 'C4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 2 },
                // 多年以前多年以前（1 1 2 3 3 | 5 6 5 3 -）
                { note: 'C4', duration: 1 },
                { note: 'C4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'A4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'E4', duration: 2 },
                // 你可曾记得我们相爱的故事（5 4 3 2 | 7 5 4 5 | 7 5 4 5）
                { note: 'G4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'B4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'B4', duration: 1 },
                { note: 'G4', duration: 1 },
                { note: 'F4', duration: 1 },
                { note: 'G4', duration: 1 },
                // 多年以前（4 3 2 1）
                { note: 'F4', duration: 1 },
                { note: 'E4', duration: 1 },
                { note: 'D4', duration: 1 },
                { note: 'C4', duration: 2 },
            ],
        },
    };

    /** 当前选中的曲目 ID */
    let selectedSongId = null;

    /**
     * 获取所有曲目列表
     * 
     * @returns {Array} 曲目信息数组（不含音符数据）
     */
    function getList() {
        return Object.values(SONGS).map(song => ({
            id: song.id,
            name: song.name,
            nameEn: song.nameEn,
            difficulty: song.difficulty,
            bpm: song.bpm,
            emoji: song.emoji,
            noteCount: song.notes.filter(n => !n.isRest).length,
        }));
    }

    /**
     * 获取指定曲目的完整数据
     * 
     * @param {string} songId - 曲目 ID
     * @returns {Object|null} 曲目数据
     */
    function getSong(songId) {
        return SONGS[songId] || null;
    }

    /**
     * 选中指定曲目
     * 
     * @param {string} songId - 曲目 ID
     */
    function selectSong(songId) {
        selectedSongId = songId;
    }

    /**
     * 获取当前选中的曲目 ID
     * 
     * @returns {string|null}
     */
    function getSelectedSongId() {
        return selectedSongId;
    }

    /**
     * 播放指定曲目
     * 
     * 功能说明：
     *   按照曲目的 BPM 和音符序列，依次播放每个音符。
     *   播放时同步高亮对应琴键。
     * 
     * @param {string} songId - 曲目 ID
     * @param {Object} [options] - 播放选项
     * @param {boolean} [options.follow=false] - 是否为轻松弹模式
     * @param {number} [options.speed=1] - 播放速度倍率
     */
    function play(songId, options = {}) {
        const song = SONGS[songId];
        if (!song) return;

        stop(); // 先停止之前的播放

        isPlaying = true;
        speedMultiplier = options.speed || 1;
        const beatDuration = (60 / song.bpm) * 1000 / speedMultiplier; // 每拍毫秒数

        let currentTime = 0;

        song.notes.forEach((noteData, index) => {
            const duration = noteData.duration * beatDuration;

            if (!noteData.isRest) {
                // 调度音符播放
                const noteOnTimer = setTimeout(() => {
                    if (!isPlaying) return;
                    AudioEngine.playNote(noteData.note);
                    PianoUI.highlightKey(noteData.note, true);

                    // 轻松弹模式回调
                    if (options.follow && onFollowNote) {
                        onFollowNote(noteData.note, currentTime, duration);
                    }
                }, currentTime);
                playTimers.push(noteOnTimer);

                // 调度音符停止
                const noteOffTimer = setTimeout(() => {
                    if (!isPlaying) return;
                    AudioEngine.stopNote(noteData.note);
                    PianoUI.highlightKey(noteData.note, false);
                }, currentTime + duration * 0.9);
                playTimers.push(noteOffTimer);
            }

            currentTime += duration;
        });

        // 播放结束
        const endTimer = setTimeout(() => {
            isPlaying = false;
            playTimers = [];
        }, currentTime + 500);
        playTimers.push(endTimer);
    }

    /**
     * 停止播放
     */
    function stop() {
        isPlaying = false;
        playTimers.forEach(timer => clearTimeout(timer));
        playTimers = [];
        AudioEngine.stopAll();

        // 取消所有琴键高亮
        const keyElements = PianoUI.getKeyElements();
        Object.values(keyElements).forEach(el => {
            el.classList.remove('active');
        });
    }

    /**
     * 检查是否正在播放
     * 
     * @returns {boolean}
     */
    function getIsPlaying() {
        return isPlaying;
    }

    /**
     * 设置轻松弹模式回调
     * 
     * @param {Function} callback - 回调函数 (note, time, duration) => void
     */
    function setOnFollowNote(callback) {
        onFollowNote = callback;
    }

    /**
     * 获取曲目的音符时间线数据（供瀑布流使用）
     * 
     * @param {string} songId - 曲目 ID
     * @returns {Array} 音符时间线数据
     */
    function getTimeline(songId) {
        const song = SONGS[songId];
        if (!song) return [];

        const beatDuration = 60 / song.bpm; // 每拍秒数
        let currentTime = 0;
        const timeline = [];

        song.notes.forEach(noteData => {
            const duration = noteData.duration * beatDuration;
            if (!noteData.isRest) {
                timeline.push({
                    note: noteData.note,
                    time: currentTime,
                    duration: duration,
                });
            }
            currentTime += duration;
        });

        return timeline;
    }

    return {
        getList,
        getSong,
        selectSong,
        getSelectedSongId,
        play,
        stop,
        getIsPlaying,
        setOnFollowNote,
        getTimeline,
    };
})();
