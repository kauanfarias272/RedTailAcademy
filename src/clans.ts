import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

export const CLAN_MAX_MEMBERS = 3
export const CLAN_BONUS = 0.25 // +25% xp/coin contribution to clan total

export type ClanMember = {
  uid: string
  displayName: string
  email: string
  xp: number
}

export type ClanDoc = {
  id: string
  name: string
  emoji: string
  code: string
  ownerUid: string
  memberUids: string[]
  totalXp: number
  mascotName: string
  createdAt: number
}

const CLANS = 'clans'
const USERS = 'users'

function makeCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function syncUserDoc(member: ClanMember & { clanId?: string | null }): Promise<void> {
  await setDoc(
    doc(db, USERS, member.uid),
    {
      uid: member.uid,
      displayName: member.displayName,
      email: member.email,
      xp: member.xp,
      clanId: member.clanId ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function fetchClan(clanId: string): Promise<ClanDoc | null> {
  const snap = await getDoc(doc(db, CLANS, clanId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id: snap.id,
    name: String(data.name ?? ''),
    emoji: String(data.emoji ?? '🐉'),
    code: String(data.code ?? ''),
    ownerUid: String(data.ownerUid ?? ''),
    memberUids: Array.isArray(data.memberUids) ? data.memberUids : [],
    totalXp: Number(data.totalXp ?? 0),
    mascotName: String(data.mascotName ?? ''),
    createdAt: Number(data.createdAt ?? 0),
  }
}

export async function fetchMembers(memberUids: string[]): Promise<ClanMember[]> {
  if (memberUids.length === 0) return []
  const results = await Promise.all(
    memberUids.map(async (uid) => {
      const snap = await getDoc(doc(db, USERS, uid))
      if (!snap.exists()) return { uid, displayName: 'Aprendiz', email: '', xp: 0 }
      const data = snap.data()
      return {
        uid,
        displayName: String(data.displayName ?? data.email ?? 'Aprendiz'),
        email: String(data.email ?? ''),
        xp: Number(data.xp ?? 0),
      }
    }),
  )
  return results
}

export async function createClan(member: ClanMember, name: string, emoji: string): Promise<ClanDoc> {
  const id = `clan-${member.uid}-${Date.now()}`
  const code = makeCode()
  const newClan: ClanDoc = {
    id,
    name: name.trim().slice(0, 24) || 'Clan sem nome',
    emoji: emoji.trim().slice(0, 4) || '🐉',
    code,
    ownerUid: member.uid,
    memberUids: [member.uid],
    totalXp: member.xp,
    mascotName: 'Dragao do Cla',
    createdAt: Date.now(),
  }
  await setDoc(doc(db, CLANS, id), newClan)
  await syncUserDoc({ ...member, clanId: id })
  return newClan
}

export async function joinClanByCode(member: ClanMember, code: string): Promise<ClanDoc> {
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) throw new Error('Codigo vazio')
  const q = query(collection(db, CLANS), where('code', '==', cleanCode), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('Codigo nao encontrado')
  const clanRef = snap.docs[0].ref

  const updated = await runTransaction(db, async (tx) => {
    const fresh = await tx.get(clanRef)
    if (!fresh.exists()) throw new Error('Cla sumiu')
    const data = fresh.data() as ClanDoc
    const members: string[] = Array.isArray(data.memberUids) ? data.memberUids : []
    if (members.includes(member.uid)) return { ...data, id: clanRef.id }
    if (members.length >= CLAN_MAX_MEMBERS) throw new Error('Cla cheio (max 3)')
    const next = [...members, member.uid]
    tx.update(clanRef, { memberUids: next })
    return { ...data, id: clanRef.id, memberUids: next }
  })

  await syncUserDoc({ ...member, clanId: clanRef.id })
  return updated as ClanDoc
}

export async function leaveClan(uid: string, clanId: string): Promise<void> {
  const ref = doc(db, CLANS, clanId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data() as ClanDoc
  const remaining = (data.memberUids || []).filter((x) => x !== uid)
  if (remaining.length === 0) {
    // Last member leaving — delete the clan record
    await updateDoc(ref, { memberUids: [], totalXp: 0 })
  } else {
    const update: Record<string, unknown> = { memberUids: arrayRemove(uid) }
    if (data.ownerUid === uid) update.ownerUid = remaining[0]
    await updateDoc(ref, update)
  }
  await setDoc(doc(db, USERS, uid), { clanId: null, updatedAt: serverTimestamp() }, { merge: true })
}

export async function recomputeClanTotal(clanId: string, memberUids: string[]): Promise<void> {
  const members = await fetchMembers(memberUids)
  const totalXp = members.reduce((sum, member) => sum + Math.round(member.xp * (1 + CLAN_BONUS)), 0)
  await updateDoc(doc(db, CLANS, clanId), { totalXp })
}

export function subscribeClan(clanId: string, onChange: (clan: ClanDoc | null) => void) {
  return onSnapshot(doc(db, CLANS, clanId), (snap) => {
    if (!snap.exists()) {
      onChange(null)
      return
    }
    const data = snap.data()
    onChange({
      id: snap.id,
      name: String(data.name ?? ''),
      emoji: String(data.emoji ?? '🐉'),
      code: String(data.code ?? ''),
      ownerUid: String(data.ownerUid ?? ''),
      memberUids: Array.isArray(data.memberUids) ? data.memberUids : [],
      totalXp: Number(data.totalXp ?? 0),
      mascotName: String(data.mascotName ?? ''),
      createdAt: Number(data.createdAt ?? 0),
    })
  })
}

export function subscribeTopClans(onChange: (clans: ClanDoc[]) => void) {
  const q = query(collection(db, CLANS), orderBy('totalXp', 'desc'), limit(5))
  return onSnapshot(q, (snap) => {
    const list: ClanDoc[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        name: String(data.name ?? ''),
        emoji: String(data.emoji ?? '🐉'),
        code: String(data.code ?? ''),
        ownerUid: String(data.ownerUid ?? ''),
        memberUids: Array.isArray(data.memberUids) ? data.memberUids : [],
        totalXp: Number(data.totalXp ?? 0),
        mascotName: String(data.mascotName ?? ''),
        createdAt: Number(data.createdAt ?? 0),
      }
    })
    onChange(list)
  })
}

export function clanXpBonus(baseXp: number): number {
  return Math.round(baseXp * CLAN_BONUS)
}

// Re-export to avoid unused import warning when consumer needs arrayUnion explicitly.
export { arrayUnion }
