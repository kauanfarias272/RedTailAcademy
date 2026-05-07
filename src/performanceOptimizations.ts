/**
 * Performance Optimizations for RedTail Academy
 * 
 * - Lazy loading
 * - Memory management
 * - Bundle optimization
 * - Rendering optimization
 */

import { useMemo, useCallback, useRef, useEffect } from 'react'

/**
 * Hook for lazy loading components
 */
export function useLazyComponent(componentPath: string) {
  return useMemo(
    () =>
      import(`../${componentPath}`).catch((err) => {
        console.error(`Failed to load component ${componentPath}:`, err)
        return { default: () => <div>Component not found</div> }
      }),
    [componentPath]
  )
}

/**
 * Debounce hook for search/input
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle hook for scroll/resize events
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= interval) {
          setThrottledValue(value)
          lastRan.current = Date.now()
        }
      },
      interval - (Date.now() - lastRan.current)
    )

    return () => clearTimeout(handler)
  }, [value, interval])

  return throttledValue
}

/**
 * Virtualization hook for long lists
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 3
) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (e: any) => setScrollTop(e.currentTarget.scrollTop),
  }
}

/**
 * Memoized callback that only updates if dependencies change
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps) as T
}

/**
 * Cache hook for API calls
 */
export function useCachedFetch<T>(
  url: string,
  options?: RequestInit,
  cacheTime: number = 5 * 60 * 1000 // 5 minutes
): { data: T | null; loading: boolean; error: Error | null } {
  const [state, setState] = React.useState<{ data: T | null; loading: boolean; error: Error | null }>({
    data: null,
    loading: true,
    error: null,
  })
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null)

  useEffect(() => {
    // Check cache
    if (cacheRef.current && Date.now() - cacheRef.current.timestamp < cacheTime) {
      setState({ data: cacheRef.current.data, loading: false, error: null })
      return
    }

    const fetchData = async () => {
      try {
        const response = await fetch(url, options)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        cacheRef.current = { data, timestamp: Date.now() }
        setState({ data, loading: false, error: null })
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error })
      }
    }

    fetchData()
  }, [url, options, cacheTime])

  return state
}

/**
 * Batched state updates
 */
export function useBatchedState<T>(initialState: T) {
  const [state, setState] = React.useState(initialState)
  const updates = useRef<Partial<T>>({})
  const timeoutRef = useRef<NodeJS.Timeout>()

  const setBatched = useCallback((update: Partial<T>) => {
    updates.current = { ...updates.current, ...update }

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setState((prevState) => ({ ...prevState, ...updates.current }))
      updates.current = {}
    }, 16) // Next frame
  }, [])

  return [state, setBatched] as const
}

/**
 * Preload critical resources
 */
export function preloadResources(urls: string[]) {
  urls.forEach((url) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  })
}

/**
 * Monitor performance metrics
 */
export function reportWebVitals() {
  if ('web-vital' in window) {
    return
  }

  try {
    // Check if PerformanceObserver is available
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log to analytics
          console.log({
            name: entry.name,
            value: entry.duration,
            timestamp: new Date(entry.startTime).toISOString(),
          })
        }
      })

      observer.observe({ entryTypes: ['measure', 'navigation'] })
    }
  } catch (e) {
    console.log('Performance monitoring not available')
  }
}

import React from 'react'
