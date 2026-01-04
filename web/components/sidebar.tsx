"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Phone,
  Users,
  Activity,
  ClipboardList,
  Settings,
} from "lucide-react"
import Image from "next/image"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Enquiries",
    href: "/enquiries",
    icon: Phone,
  },
  {
    title: "Patients",
    href: "/patients",
    icon: Users,
  },
  {
    title: "Treatments",
    href: "/treatments",
    icon: Activity,
  },
  {
    title: "Consultations",
    href: "/consultations",
    icon: ClipboardList,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center justify-center border-b px-4">
          <Image 
            src="/cpc-sm-logo.png" 
            alt="Chennai Physio Care" 
            width={200} 
            height={60} 
            className="h-12 w-auto object-contain" 
            priority 
          />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
  )
}
