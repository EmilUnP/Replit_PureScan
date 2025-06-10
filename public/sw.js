// Service Worker for PureScan2
// Provides offline caching and background sync

const CACHE_NAME = 'purescan2-v1'
const OFFLINE_CACHE = 'purescan2-offline-v1'
const DYNAMIC_CACHE = 'purescan2-dynamic-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.svg',
  '/_next/static/css/',
  '/_next/static/js/',
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/auth/,
  /\/api\/scans/,
  /\/api\/profile/,
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Install event')
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS.filter(url => !url.includes('_next')))
      }),
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.add('/offline')
      })
    ])
  )
  
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activate event')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== OFFLINE_CACHE && 
              cacheName !== DYNAMIC_CACHE) {
            console.log('SW: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Take control of all pages
  self.clients.claim()
})

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle different types of requests
  if (request.url.includes('/_next/static/')) {
    // Static assets - cache first
    event.respondWith(cacheFirst(request))
  } else if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirstWithCache(request))
  } else if (request.url.includes('/api/')) {
    // Other API requests - network only
    event.respondWith(networkOnly(request))
  } else {
    // HTML pages - stale while revalidate
    event.respondWith(staleWhileRevalidate(request))
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync:', event.tag)
  
  if (event.tag === 'sync-scan-data') {
    event.waitUntil(syncScanData())
  } else if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData())
  }
})

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'View Scan',
          icon: '/icons/view.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/close.png'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Caching strategies
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('SW: Cache first failed:', error)
    return new Response('Offline - content not available', { status: 503 })
  }
}

async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('SW: Network failed, trying cache:', request.url)
    
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API calls
    return new Response(JSON.stringify({
      error: 'Offline - please try again when connected',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function networkOnly(request) {
  try {
    return await fetch(request)
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Network unavailable',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Network failed, return cached version or offline page
    return cachedResponse || caches.match('/offline')
  })
  
  // Return cached version immediately if available
  return cachedResponse || networkPromise
}

// Background sync functions
async function syncScanData() {
  try {
    console.log('SW: Syncing scan data...')
    
    // Get pending scan uploads from IndexedDB
    const pendingScans = await getPendingScans()
    
    for (const scan of pendingScans) {
      try {
        const response = await fetch('/api/scans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scan)
        })
        
        if (response.ok) {
          await removePendingScan(scan.id)
          console.log('SW: Synced scan:', scan.id)
        }
      } catch (error) {
        console.error('SW: Failed to sync scan:', error)
      }
    }
  } catch (error) {
    console.error('SW: Sync scan data failed:', error)
  }
}

async function syncUserData() {
  try {
    console.log('SW: Syncing user data...')
    
    // Prefetch critical user data
    const userDataUrls = [
      '/api/profile',
      '/api/scans?limit=10',
      '/api/achievements'
    ]
    
    const cache = await caches.open(DYNAMIC_CACHE)
    
    for (const url of userDataUrls) {
      try {
        const response = await fetch(url)
        if (response.ok) {
          cache.put(url, response.clone())
        }
      } catch (error) {
        console.error('SW: Failed to prefetch:', url, error)
      }
    }
  } catch (error) {
    console.error('SW: Sync user data failed:', error)
  }
}

// IndexedDB helpers for offline data
async function getPendingScans() {
  // Placeholder - implement IndexedDB logic
  return []
}

async function removePendingScan(scanId) {
  // Placeholder - implement IndexedDB logic
  console.log('Removing pending scan:', scanId)
}

// Cleanup old cache entries
async function cleanupOldEntries() {
  const cache = await caches.open(DYNAMIC_CACHE)
  const keys = await cache.keys()
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
  
  for (const request of keys) {
    const response = await cache.match(request)
    if (response) {
      const dateHeader = response.headers.get('date')
      if (dateHeader && new Date(dateHeader).getTime() < oneWeekAgo) {
        await cache.delete(request)
      }
    }
  }
}

// Run cleanup weekly
setInterval(cleanupOldEntries, 7 * 24 * 60 * 60 * 1000) 