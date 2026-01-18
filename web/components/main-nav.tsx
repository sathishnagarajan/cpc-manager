"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import { TextSizeToggle } from "@/components/text-size-toggle"
import Image from "next/image"
import { getStoredUser, clearAuthData } from "@/lib/auth"
import { apiService } from "@/lib/api"
import { User as UserType } from "@/types"

export function MainNav() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  const handleLogout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthData()
      router.push('/login')
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <Image 
          src="/cpc-sm-logo.png" 
          alt="Chennai Physio Care" 
          width={100} 
          height={40} 
          className="h-10 w-auto object-contain" 
          priority 
        />
      </div>
      <div className="flex-1">
        <form className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full max-w-sm pl-8 md:w-[300px] lg:w-[400px]"
            />
          </div>
        </form>
      </div>
      <TextSizeToggle />
      <ModeToggle />
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user?.username)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.username || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
