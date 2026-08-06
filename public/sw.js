const CACHE_NAME = 'branzag-images-v1'

const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|webp|svg|gif|ico|avif)(\?.*)?$/i

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Cache images from local static folder or Supabase storage or any image format
  const isImage = IMAGE_EXTENSIONS.test(url.pathname) || 
                  url.pathname.includes('/storage/v1/object/public/') ||
                  url.pathname.startsWith('/images/')

  if (request.method === 'GET' && isImage) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request)
        
        // Stale-While-Revalidate: Return cached immediately if available, fetch update in background
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          })
          .catch(() => cachedResponse)

        return cachedResponse || fetchPromise
      })
    )
  }
})
