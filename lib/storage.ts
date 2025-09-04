export function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function lsSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(value) }))
  } catch {}
}

export function lsRemove(key: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(key)
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: null as any }))
  } catch {}
}

export function lsClearAll() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.clear()
    window.dispatchEvent(new StorageEvent("storage", { key: "*", newValue: null as any }))
  } catch {}
}
