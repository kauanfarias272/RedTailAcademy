import { initializeApp } from 'firebase/app'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  deleteUser,
  getAuth,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCofc89ipwr0ezS9zz0svAAeotEJDPr1AA",
  authDomain: "redtailacademy-883be.firebaseapp.com",
  projectId: "redtailacademy-883be",
  storageBucket: "redtailacademy-883be.firebasestorage.app",
  messagingSenderId: "179204091097",
  appId: "1:179204091097:web:fc70bed9b7041b1b5362c8"
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export type DeleteAccountReauth =
  | { kind: 'password'; password: string }
  | { kind: 'google' }

export async function deleteCurrentAccount(reauth?: DeleteAccountReauth): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('no-user')

  if (reauth) {
    if (reauth.kind === 'password' && user.email) {
      const credential = EmailAuthProvider.credential(user.email, reauth.password)
      await reauthenticateWithCredential(user, credential)
    } else if (reauth.kind === 'google') {
      await reauthenticateWithPopup(user, new GoogleAuthProvider())
    }
  }

  await deleteUser(user)
}
