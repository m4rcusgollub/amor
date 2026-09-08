import { useCallback, useEffect, useState } from 'react'

/** Atualiza um valor periodicamente (posição da estrela). */
export function useInterval(callback: () => void, delayMs: number | null) {
  const cb = useCallback(callback, [callback])

  useEffect(() => {
    if (delayMs === null) return
    const id = setInterval(cb, delayMs)
    return () => clearInterval(id)
  }, [cb, delayMs])
}

/** Atualiza a cada X ms, expondo também um tick manual. */
export function useTick(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return { now, refresh: () => setNow(new Date()) }
}
