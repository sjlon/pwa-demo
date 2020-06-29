const CACHE_NAME = 'cache-v2'
// 新的service worker别下载之后
self.addEventListener('install', event => {
	console.log('install', event)
	// event.waitUntil 传入promise，当promise执行完毕，install才会执行完毕，会推迟activate的执行
	// event.waitUntil(
	// 	new Promise(resolve => {
	// 		setTimeout(resolve, 5000)
	// 	})
	// )

	// self.skopWaiting()立即执行activate
	// event.waitUntil(self.skipWaiting())
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			// 写入缓存
			// 这个addAll方法可以接受一个地址数组作为参数，这些请求地址的响应数据将会被缓存在cache对象里。addAll返回的是一个Promise。
			cache.addAll(['/', './index.css'])
		})
	)
})
// 新的service worker被启用
self.addEventListener('activate', event => {
	console.log('activate')
	// event.waitUntil(self.clients.claim())
	// 清理cache, 清理之前的cache
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cacheName => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName)
					}
				})
			)
		})
	)
})
// 发生在捕获到资源请求时
self.addEventListener('fetch', event => {
	console.log('fetch', event.respondWith)
	event.respondWith(
		caches.open(CACHE_NAME).then(cache => {
			// 判断cache里面有没有要请求的资源
			return cache.match(event.request).then(response => {
				if (response) {
					return response
				} else {
					fetch(event.request).then(response => {
						// 增量缓存
						cache.put(event.request, response.clone())
						return response
					})
				}
			})
		})
	)
})
