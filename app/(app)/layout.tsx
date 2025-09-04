import type { ReactNode } from "react"
import Sidebar from "@/components/navigation/sidebar"
import MobileNav from "@/components/navigation/mobile-nav"
import ClientThemeApplier from "@/components/common/client-theme-applier"
import Link from "next/link"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ClientThemeApplier />
      <div className="min-h-dvh md:flex bg-white dark:bg-black">
        <Sidebar />
        <main className="flex-1 md:min-w-0">
          <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur border-slate-200 dark:border-white/10 dark:bg-black/80">
            <div className="mx-auto max-w-6xl px-4 py-3">
              <h1 className="text-pretty text-base md:text-lg font-semibold text-slate-900 dark:text-white">
                <Link href="/" className="hover:opacity-90 transition" aria-label="Go to Home">
                  StockPro Analytics
                </Link>
              </h1>
            </div>
          </header>
          <div className="mx-auto max-w-6xl px-4 py-4 pb-safe-nav md:pb-8 safe-bottom">
            {children}
            <div
              aria-hidden
              className="md:hidden h-[calc(var(--mobile-nav-height,56px)+env(safe-area-inset-bottom,0px))]"
            />
          </div>
        </main>
      </div>
      <MobileNav />
    </>
  )
}
