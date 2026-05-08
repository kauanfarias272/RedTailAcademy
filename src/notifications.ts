import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const STUDY_REMINDER_IDS = [9201, 9202]
const NOTIFICATION_CHANNEL_ID = 'study-reminders'

export async function ensureStudyReminders(mascotName = 'Koi') {
  if (Capacitor.isNativePlatform()) {
    try {
      const permission = await LocalNotifications.checkPermissions()
      const display = permission.display === 'prompt'
        ? (await LocalNotifications.requestPermissions()).display
        : permission.display

      if (display !== 'granted') return

      await ensureNotificationChannel()

      await LocalNotifications.cancel({
        notifications: STUDY_REMINDER_IDS.map((id) => ({ id })),
      })

      await LocalNotifications.schedule({
        notifications: [
          {
            id: STUDY_REMINDER_IDS[0],
            title: 'RedTail Academy',
            body: `${mascotName} esta te esperando. Uma revisao Anki de 2 minutos ja conta.`,
            channelId: NOTIFICATION_CHANNEL_ID,
            schedule: { on: { hour: 10, minute: 0 }, repeats: true },
          },
          {
            id: STUDY_REMINDER_IDS[1],
            title: 'Hora de alimentar seu Koi',
            body: 'Abra uma licao curta para manter streak, XP e evolucao do mascote.',
            channelId: NOTIFICATION_CHANNEL_ID,
            schedule: { on: { hour: 19, minute: 30 }, repeats: true },
          },
        ],
      })
      return
    } catch {
      return
    }
  }

  scheduleBrowserReminder(mascotName)
}

export async function sendLessonCompleteNotification(message: string) {
  if (!Capacitor.isNativePlatform()) {
    showBrowserNotification('Licao concluida', message)
    return
  }

  try {
    const permission = await LocalNotifications.checkPermissions()
    if (permission.display !== 'granted') return
    await ensureNotificationChannel()
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 9299,
          title: 'Licao concluida',
          body: message,
          channelId: NOTIFICATION_CHANNEL_ID,
          schedule: { at: new Date(Date.now() + 900) },
        },
      ],
    })
  } catch {
    // Notification feedback is optional; lesson completion must never fail.
  }
}

async function ensureNotificationChannel() {
  if (Capacitor.getPlatform() !== 'android') return

  await LocalNotifications.createChannel({
    id: NOTIFICATION_CHANNEL_ID,
    name: 'Lembretes de estudo',
    description: 'Avisos para manter a sequencia no RedTail Academy.',
    importance: 4,
    visibility: 1,
  })
}

function scheduleBrowserReminder(mascotName: string) {
  if (!('Notification' in window)) return

  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => undefined)
  }

  const now = new Date()
  const next = new Date()
  next.setHours(19, 30, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  const delay = Math.min(next.getTime() - now.getTime(), 2_147_000_000)

  window.setTimeout(() => {
    showBrowserNotification('RedTail Academy', `${mascotName} esta te esperando para uma revisao curta.`)
  }, delay)
}

function showBrowserNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification(title, { body })
  } catch {
    // Browser notification support is best effort.
  }
}
