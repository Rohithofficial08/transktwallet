"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useWallet } from "./wallet-provider"
import { Home, Send, Download, Wallet, LogOut, User, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function Navigation() {
  const pathname = usePathname()
  const { isConnected, address, networkName, disconnect } = useWallet()
  const [username, setUsername] = useState<string>("")

  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    if (userData) {
      const user = JSON.parse(userData)
      setUsername(user.username)
    }
  }, [])

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/send", label: "Send", icon: Send },
    { href: "/receive", label: "Receive", icon: Download },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-primary" />
              <div>
                <span className="text-xl font-bold text-gray-900">Translate</span>
                <div className="text-xs text-gray-500">Web3 DApp</div>
              </div>
            </Link>

            {isConnected && (
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={pathname === item.href ? "default" : "ghost"}
                      className={cn("flex items-center space-x-2", pathname === item.href && "bg-primary text-white")}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {isConnected && (
            <div className="flex items-center space-x-4">
              {username && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{username}</span>
                </div>
              )}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span>{networkName}</span>
              </div>
              <div className="hidden md:block text-sm text-gray-600 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <Button variant="outline" size="sm" onClick={disconnect}>
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
