import { initializeApp, getApps } from 'firebase/app'
import { getDatabase, ref as dbRef, onValue, off } from 'firebase/database'
import { LRUCache } from 'lru-cache'

export function createAPI ({ config, version }) {
  let api
  // this piece of code may run multiple times in development mode,
  // so we attach the instantiated API to `process` to avoid duplications
  if (process.__API__) {
    api = process.__API__
  } else {
    const app = getApps().length ? getApps()[0] : initializeApp(config)
    const database = getDatabase(app)
    api = process.__API__ = dbRef(database, version)

    api.onServer = true

    // fetched item cache
    api.cachedItems = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 15 // 15 min cache
    })

    // cache the latest story ids
    api.cachedIds = {}
    ;['top', 'new', 'show', 'ask', 'job'].forEach(type => {
      const typeRef = dbRef(database, `${version}/${type}stories`)
      onValue(typeRef, snapshot => {
        api.cachedIds[type] = snapshot.val()
      })
    })
  }
  return api
}
