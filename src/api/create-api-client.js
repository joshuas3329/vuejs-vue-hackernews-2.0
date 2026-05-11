import firebase from 'firebase/app'
import 'firebase/database'

export function createAPI ({ config, version }) {
  firebase.initializeApp(config)
  return firebase.database().ref(version)
}
