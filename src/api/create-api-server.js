import firebase from 'firebase/app'
import 'firebase/database'
import LRU from 'lru-cache'

export function createAPI ({ config, version }) {
  let api
  // this piece of code may run multiple times in development mode,
  // so we attach the instantiated API to `process` to avoid duplications
  if (process.__API__) {
    api = process.__API__
  } else {
    firebase.initializeApp(config)
    api = process.__API__ = firebase.database().ref(version)

    api.onServer = true

    // fetched item cache
    // lru-cache v7: constructor takes an options object (max, ttl in ms)
    api.cachedItems = new LRU({
      max: 1000,
      ttl: 1000 * 60 * 15 // 15 min cache
    })

    // cache the latest story ids
    api.cachedIds = {}
    ;['top', 'new', 'show', 'ask', 'job'].forEach(type => {
      api.child(`${type}stories`).on('value', snapshot => {
        api.cachedIds[type] = snapshot.val()
      })
    })
  }
  return api
}
