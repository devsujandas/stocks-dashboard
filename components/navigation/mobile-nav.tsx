"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutGrid, Star, Briefcase, GitCompare, Newspaper, SettingsIcon } from "lucide-react"

type Props = { className?: string }

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const

export default function MobileNav({ className }: Props) {
  const pathname = usePathname()
  return (
    <nav
      style={{ ["--mobile-nav-height" as any]: "56px", height: "var(--mobile-nav-height, 56px)" }}
      className={cn(
        "md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur supports-[backdrop-filter]:bg-white/75 mobile-nav",
        "border-slate-200 dark:border-white/10",
        "bg-white/95 dark:bg-black/95 dark:supports-[backdrop-filter]:bg-black/75",
        className,
      )}
      role="navigation"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-6">
        {items.map((it) => {
          const active = pathname === it.href
          const Icon = it.icon
          return (
            <li key={it.href} className="text-center">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-[var(--mobile-nav-height,56px)] flex-col items-center justify-center gap-1 transition-colors",
                  active
                    ? "text-sky-600 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "opacity-100" : "opacity-80")} aria-hidden="true" />
                <span className={cn("text-[11px] leading-4", active ? "font-medium" : "font-normal")}>{it.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
