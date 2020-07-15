
// workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest)

self.addEventListener('fetch', function (event) {
  console.log('fetch', event.request)

  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        // Cache hit - return response
        if (response) {
          return response
        }
        return fetch(event.request)
      }
      )
  )
})

const dataCacheConfig = {
  cacheName: 'data-data'
}

new workbox.routing.NavigationRoute(new workbox.strategies.CacheFirst())

workbox.routing.registerNavigationRoute(workbox.precaching.getCacheKeyForURL('/index.html'))
