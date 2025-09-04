"use client"
import { useState, useMemo, useEffect } from "react"
import { SYMBOLS, type SymbolItem } from "@/lib/symbols"
import { cn } from "@/lib/utils"

export function SymbolAutocomplete({
  onSelect,
  placeholder = "Search symbol (e.g., TSLA)",
  className,
}: {
  onSelect: (item: SymbolItem) => void
  placeholder?: string
  className?: string
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = "symbol-autocomplete-list"
  const results = useMemo(() => {
    const q = query.trim().toUpperCase()
    if (!q) return SYMBOLS.slice(0, 8)
    return SYMBOLS.filter((s) => s.symbol.startsWith(q) || s.name.toUpperCase().includes(q)).slice(0, 8)
  }, [query])

  useEffect(() => setActive(0), [query])

  function commitSelect(index: number) {
    const item = results[index]
    if (item) {
      onSelect(item)
      setQuery("")
      setOpen(false)
    }
  }

  return (
    <div className={cn("relative w-full", className)}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
            setOpen(true)
            return
          }
          if (!open) return
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setActive((p) => Math.min(p + 1, results.length - 1))
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActive((p) => Math.max(p - 1, 0))
          } else if (e.key === "Enter") {
            e.preventDefault()
            commitSelect(active)
          } else if (e.key === "Escape") {
            setOpen(false)
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-sky-600"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        role="combobox"
      />
      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-background shadow-lg"
        >
          {results.map((item, i) => (
            <li
              key={item.symbol}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                commitSelect(i)
              }}
              className={cn(
                "flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-muted/50",
                i === active && "bg-muted/60",
              )}
            >
              <span className="font-medium">{item.symbol}</span>
              <span className="truncate pl-2 text-xs text-muted-foreground">{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
