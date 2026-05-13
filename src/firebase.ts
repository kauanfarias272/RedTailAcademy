import { initializeApp } from 'firebase/app'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  browserLocalPersistence,
  deleteUser,
  indexedDBLocalPersistence,
  initializeAuth,
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
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
})
export const db = getFirestore(app)

export function friendlyAuthError(error: unknown): string {
  const code = extractCode(error)
  const fallback = extractMessage(error)

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'E-mail ou senha incorretos.'
    case 'auth/user-not-found':
      return 'Conta nao encontrada. Cadastre-se primeiro.'
    case 'auth/email-already-in-use':
      return 'Este e-mail ja esta cadastrado. Faca login em vez de cadastrar.'
    case 'auth/weak-password':
      return 'Senha muito fraca. Use pelo menos 6 caracteres.'
    case 'auth/invalid-email':
      return 'E-mail invalido. Confira a digitacao.'
    case 'auth/missing-email':
      return 'Digite o e-mail.'
    case 'auth/missing-password':
      return 'Digite a senha.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas seguidas. Aguarde alguns minutos.'
    case 'auth/network-request-failed':
      return 'Sem conexao com a internet. Verifique sua rede.'
    case 'auth/operation-not-allowed':
      return 'Login por e-mail nao habilitado no Firebase. Avise o administrador.'
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Voce fechou a janela antes de concluir o login.'
    case 'auth/popup-blocked':
      return 'O navegador bloqueou o popup. Libere e tente de novo.'
    case 'auth/requires-recent-login':
      return 'Por seguranca, refaca o login antes de continuar.'
    case 'auth/account-exists-with-different-credential':
      return 'Ja existe conta com este e-mail usando outro metodo de login.'
    default:
      return fallback || 'Erro inesperado. Tente de novo.'
  }
}

function extractCode(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code
    if (typeof code === 'string') return code
  }
  return ''
}

function extractMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return ''
}

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
