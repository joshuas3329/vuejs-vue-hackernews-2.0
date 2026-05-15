// this is aliased in webpack config based on server/client build
import { createAPI } from 'create-api'
import { child, get, onValue, off } from 'firebase/database'

const logRequests = !!process.env.DEBUG_API

const api = createAPI({
  version: '/v0',
  config: {
    databaseURL: 'https://hacker-news.firebaseio.com'
  }
})

// warm the front page cache every 15 min
// make sure to do this only once across all requests
if (api.onServer) {
  warmCache()
}

function warmCache () {
  fetchItems((api.cachedIds.top || []).slice(0, 30))
  setTimeout(warmCache, 1000 * 60 * 15)
}

function fetch (path) {
  logRequests && console.log(`fetching ${path}...`)
  const cache = api.cachedItems
  if (cache && cache.has(path)) {
    logRequests && console.log(`cache hit for ${path}.`)
    return Promise.resolve(cache.get(path))
  } else {
    return get(child(api, path)).then(snapshot => {
      const val = snapshot.val()
      // mark the timestamp when this item is cached
      if (val) val.__lastUpdated = Date.now()
      cache && cache.set(path, val)
      logRequests && console.log(`fetched ${path}.`)
      return val
    })
  }
}

export function fetchIdsByType (type) {
  return api.cachedIds && api.cachedIds[type]
    ? Promise.resolve(api.cachedIds[type])
    : fetch(`${type}stories`)
}

export function fetchItem (id) {
  return fetch(`item/${id}`)
}

export function fetchItems (ids) {
  return Promise.all(ids.map(id => fetchItem(id)))
}

export function fetchUser (id) {
  return fetch(`user/${id}`)
}

export function watchList (type, cb) {
  let first = true
  const ref = child(api, `${type}stories`)
  const handler = snapshot => {
    if (first) {
      first = false
    } else {
      cb(snapshot.val())
    }
  }
  onValue(ref, handler)
  return () => {
    off(ref, 'value', handler)
  }
}
