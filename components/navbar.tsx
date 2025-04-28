"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  // For presentation mode - set to true to hide dashboard link
  const isPresentationMode = true

  return (
    <header className="bg-background border-b">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">NHL Free Agent Evaluation</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/" ? "text-foreground" : "text-foreground/60",
            )}
          >
            Home
          </Link>
          {!isPresentationMode && (
            <Link
              href="/dashboard"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/dashboard" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/compare"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/compare" ? "text-foreground" : "text-foreground/60",
            )}
          >
            Compare
          </Link>
          <Link
            href="/methodology"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/methodology" ? "text-foreground" : "text-foreground/60",
            )}
          >
            Methodology
          </Link>
        </nav>
      </div>
    </header>
  )
}
