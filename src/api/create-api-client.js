import { initializeApp, getApps } from 'firebase/app'
import { getDatabase, ref as dbRef } from 'firebase/database'

export function createAPI ({ config, version }) {
  const app = getApps().length ? getApps()[0] : initializeApp(config)
  const database = getDatabase(app)
  return dbRef(database, version)
}
