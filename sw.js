/**
 * Service Worker — 离线缓存
 * 
 * 功能说明：
 *   拦截网络请求，实现缓存优先策略。
 *   首次加载时缓存所有静态资源（HTML/CSS/JS，包括本地的 Tone.js）。
 *   后续访问直接从缓存读取，实现完全离线使用。
 * 
 * 缓存策略：
 *   - 静态资源（HTML/CSS/JS/JSON）：缓存优先，网络回退
 *   - 其他请求：网络优先，缓存回退
 */

const CACHE_NAME = 'kid-piano-v10';

/** 需要预缓存的资源列表 */
const PRECACHE_URLS = [
    './',
    './index.html',
    './css/style.css',
    './js/constants.js',
    './js/audio-engine.js',
    './js/piano-ui.js',
    './js/keyboard-handler.js',
    './js/demo-songs.js',
    './js/guide-mode.js',
    './js/app.js',
    './manifest.json',
    // Tone.js（本地文件）
    './js/lib/Tone.js',
];

/**
 * 安装事件：预缓存所有静态资源
 */
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] 安装中...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] 预缓存资源');
            return cache.addAll(PRECACHE_URLS).catch((err) => {
                console.warn('[ServiceWorker] 部分资源缓存失败:', err);
                // 即使部分资源失败也继续安装
                return Promise.resolve();
            });
        })
    );
    // 立即激活，不等待旧 Service Worker 关闭
    self.skipWaiting();
});

/**
 * 激活事件：清理旧版本缓存
 */
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] 激活中...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[ServiceWorker] 删除旧缓存:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    // 立即控制所有页面
    self.clients.claim();
});

/**
 * 请求拦截：缓存优先策略
 */
self.addEventListener('fetch', (event) => {
    // 只处理 GET 请求
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            // 缓存未命中，走网络请求
            return fetch(event.request).then((response) => {
                // 只缓存成功的同源响应
                if (response.ok && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            }).catch(() => {
                // 网络请求也失败了，返回离线提示（仅对 HTML 请求）
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
