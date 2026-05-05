import { useEffect } from 'react'

// Reference-counted body class so multiple focused children
// (lesson + chunk gap + writing canvas + speech mic) compose cleanly.
let activeCount = 0

function syncBodyClass() {
  if (typeof document === 'undefined') return
  if (activeCount > 0) document.body.classList.add('focus-mode')
  else document.body.classList.remove('focus-mode')
}

export function useFocusMode(active: boolean) {
  useEffect(() => {
    if (!active) return
    activeCount += 1
    syncBodyClass()
    return () => {
      activeCount = Math.max(0, activeCount - 1)
      syncBodyClass()
    }
  }, [active])
}
