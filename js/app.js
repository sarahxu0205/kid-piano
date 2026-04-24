/**
 * 应用主控模块
 * 
 * 功能说明：
 *   应用的入口模块，负责初始化所有子模块、绑定 UI 事件、协调模块间通信。
 *   处理启动引导页、工具栏交互、曲目面板等全局 UI 逻辑。
 * 
 * 功能特性：
 *   - 启动引导页（点击后初始化音频上下文）
 *   - 工具栏按钮事件绑定
 *   - 示范曲目面板的显示/隐藏和曲目选择
 *   - 标注模式切换
 *   - 八度切换
 *   - 轻松弹模式协调
 */

const App = (() => {
    /** 当前是否处于轻松弹模式 */
    let isGuideMode = false;

    /**
     * 初始化应用
     * 
     * 功能说明：
     *   绑定启动按钮、初始化所有子模块、设置事件监听。
     */
    async function init() {
        // 绑定启动按钮
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', handleStart);
        }

        // 绑定工具栏按钮
        bindToolbarEvents();

        // 初始化键盘事件处理
        KeyboardHandler.init();

        // 设置键盘事件回调（用于轻松弹模式）
        KeyboardHandler.setOnNoteOn((note, timestamp) => {
            // 轻松弹模式：检查按键是否匹配当前步骤
            if (isGuideMode) {
                return GuideMode.checkInput(note);
            }
            return false;
        });

        KeyboardHandler.setOnNoteOff((note, timestamp) => {
            return false;
        });
    }

    /**
     * 处理启动按钮点击
     * 
     * 功能说明：
     *   隐藏启动引导页，初始化音频引擎，显示主界面。
     */
    async function handleStart() {
        const splash = document.getElementById('splash-screen');
        const app = document.getElementById('app');
        const loading = document.getElementById('loading-overlay');

        // 显示加载提示
        splash.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            // 初始化音频引擎
            await AudioEngine.init();

            // 初始化钢琴 UI
            PianoUI.init();
            PianoUI.updateOctaveDisplay(baseOctave);

            // 初始化曲目列表
            renderSongList();
            initCarousel();

            // 隐藏加载提示，显示主界面
            loading.classList.add('hidden');
            app.classList.remove('hidden');

            console.log('🎵 小小钢琴启动完成！');
        } catch (error) {
            console.error('初始化失败:', error);
            document.getElementById('loading-text').textContent = '加载失败，请刷新页面重试';
        }
    }

    /**
     * 绑定工具栏按钮事件
     */
    function bindToolbarEvents() {
        // 八度切换
        document.getElementById('octave-down')?.addEventListener('click', () => {
            if (baseOctave > MIN_OCTAVE) {
                baseOctave--;
                PianoUI.rebuild(baseOctave);
            }
        });

        document.getElementById('octave-up')?.addEventListener('click', () => {
            if (baseOctave < MAX_OCTAVE) {
                baseOctave++;
                PianoUI.rebuild(baseOctave);
            }
        });

        // 标注模式切换
        document.getElementById('label-toggle')?.addEventListener('click', () => {
            const newMode = PianoUI.cycleLabelMode();
            const labelBtn = document.getElementById('label-text');
            const modeNames = {
                'solfeggio': '唱名',
                'letter': '字母',
                'none': '隐藏',
            };
            if (labelBtn) {
                labelBtn.textContent = modeNames[newMode] || '唱名';
            }
        });

        // 示范曲目控制按钮
        document.getElementById('demo-play-btn')?.addEventListener('click', handleDemoPlay);
        document.getElementById('demo-follow-btn')?.addEventListener('click', handleGuideMode);
        document.getElementById('demo-stop-btn')?.addEventListener('click', handleDemoStop);
    }

    /**
     * 初始化曲目轮播滚动
     *
     * 功能说明：
     *   点击左右箭头按钮，曲目列表横向滚动一个卡片的宽度。
     *
     * 参数说明：
     *   无
     *
     * 使用示例：
     *   initCarousel();  // 页面初始化时调用
     */
    function initCarousel() {
        const songList = document.getElementById('song-list');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        if (!songList || !prevBtn || !nextBtn) return;

        const scrollAmount = 140; // 每次滚动约一个卡片宽度

        prevBtn.addEventListener('click', () => {
            songList.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            songList.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    /**
     * 渲染曲目列表
     */
    function renderSongList() {
        const songList = document.getElementById('song-list');
        if (!songList) return;

        const songs = DemoSongs.getList();
        songList.innerHTML = '';

        songs.forEach(song => {
            const item = document.createElement('div');
            item.className = 'song-item';
            item.dataset.songId = song.id;

            const difficultyLabels = ['', '简单', '中等', '较难'];

            item.innerHTML = `
                <span class="song-emoji">${song.emoji}</span>
                <div class="song-info">
                    <span class="song-name">${song.name}</span>
                    <span class="song-meta">${difficultyLabels[song.difficulty]}难度 / ${song.noteCount} 个音符</span>
                </div>
            `;

            item.addEventListener('click', () => selectSong(song.id));
            songList.appendChild(item);
        });

        // 默认选中第一首
        if (songs.length > 0) {
            selectSong(songs[0].id);
        }
    }

    /**
     * 选择曲目
     * 
     * @param {string} songId - 曲目 ID
     */
    function selectSong(songId) {
        DemoSongs.selectSong(songId);

        // 更新选中状态
        document.querySelectorAll('.song-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.songId === songId);
        });

        // 启用播放和轻松弹按钮
        document.getElementById('demo-play-btn') && (document.getElementById('demo-play-btn').disabled = false);
        document.getElementById('demo-follow-btn') && (document.getElementById('demo-follow-btn').disabled = false);

        // 如果正在播放或轻松弹，保持停止按钮可用
        const isActivelyPlaying = DemoSongs.getIsPlaying() || isGuideMode;
        document.getElementById('demo-stop-btn') && (document.getElementById('demo-stop-btn').disabled = !isActivelyPlaying);
    }

    /**
     * 处理示范播放
     */
    function handleDemoPlay() {
        const songId = DemoSongs.getSelectedSongId();
        if (!songId) return;

        // 先停止当前播放
        DemoSongs.stop();

        // 禁用播放和轻松弹按钮，防止播放中重复操作
        document.getElementById('demo-play-btn') && (document.getElementById('demo-play-btn').disabled = true);
        document.getElementById('demo-follow-btn') && (document.getElementById('demo-follow-btn').disabled = true);

        // 用 rAF 确保停止操作完全生效后再开始新播放
        requestAnimationFrame(() => {
            DemoSongs.play(songId);
            document.getElementById('demo-stop-btn') && (document.getElementById('demo-stop-btn').disabled = false);
        });
    }

    /**
     * 处理轻松弹模式
     *
     * 功能说明：
     *   点击后进入轻松弹模式，钢琴键上会高亮闪烁提示下一个该按的键。
     *   小朋友按对后自动跳到下一个音符，没有时间压力。
     */
    function handleGuideMode() {
        const songId = DemoSongs.getSelectedSongId();
        if (!songId) return;

        if (isGuideMode) {
            // 退出轻松弹模式
            isGuideMode = false;
            GuideMode.stop();
            document.getElementById('demo-follow-btn').textContent = '🎵 轻松弹';
            document.getElementById('demo-stop-btn') && (document.getElementById('demo-stop-btn').disabled = true);
            document.getElementById('demo-play-btn') && (document.getElementById('demo-play-btn').disabled = false);
            return;
        }

        // 进入轻松弹模式
        isGuideMode = true;
        document.getElementById('demo-follow-btn').textContent = '⏹ 退出轻松弹';
        document.getElementById('demo-stop-btn') && (document.getElementById('demo-stop-btn').disabled = false);
        document.getElementById('demo-play-btn') && (document.getElementById('demo-play-btn').disabled = true);

        // 注册状态回调，弹完后自动恢复按钮
        GuideMode.setOnStateChange((state) => {
            if (state === 'finished') {
                isGuideMode = false;
                document.getElementById('demo-follow-btn').textContent = '🎵 轻松弹';
                document.getElementById('demo-stop-btn') && (document.getElementById('demo-stop-btn').disabled = true);
                document.getElementById('demo-play-btn') && (document.getElementById('demo-play-btn').disabled = false);
            }
        });

        // 开始轻松弹
        GuideMode.start(songId);
    }

    /**
     * 处理停止示范/轻松弹
     */
    function handleDemoStop() {
        DemoSongs.stop();

        if (isGuideMode) {
            isGuideMode = false;
            GuideMode.stop();
            document.getElementById('demo-follow-btn').textContent = '🎵 轻松弹';
        }

        document.getElementById('demo-stop-btn') && (document.getElementById('demo-stop-btn').disabled = true);
        document.getElementById('demo-play-btn') && (document.getElementById('demo-play-btn').disabled = false);
        document.getElementById('demo-follow-btn') && (document.getElementById('demo-follow-btn').disabled = false);
    }

    return {
        init,
    };
})();

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
