import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

// Precache static assets injected by workbox-webpack-plugin
precacheAndRoute(self.__WB_MANIFEST)

// Cache navigation routes with NetworkFirst strategy
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst()
)
