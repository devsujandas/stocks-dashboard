"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutGrid, Star, Briefcase, GitCompare, Newspaper, SettingsIcon } from "lucide-react"

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-black">
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800">
       <span className="font-bold text-sky-600 dark:text-sky-400">AnlystoX</span>

      </div>
      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-1">
          {items.map((it) => {
            const active = pathname === it.href
            const Icon = it.icon
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sky-600 text-white dark:bg-white/10 dark:text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    className={cn("h-4 w-4", active ? "opacity-100" : "opacity-80 group-hover:opacity-100")}
                    aria-hidden="true"
                  />
                  <span>{it.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
