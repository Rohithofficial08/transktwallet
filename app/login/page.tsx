"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/components/wallet-provider"
import { useRouter } from "next/navigation"
import { Wallet, Mail, Lock } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const { connect, isConnected, address } = useWallet()
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if user is registered
      const userData = localStorage.getItem("user_data")
      if (!userData) {
        toast({
          title: "Account Not Found",
          description: "Please register first",
          variant: "destructive",
        })
        router.push("/register")
        return
      }

      const user = JSON.parse(userData)

      // Verify wallet address matches
      if (user.walletAddress !== address) {
        toast({
          title: "Wallet Mismatch",
          description: "Please connect the wallet used during registration",
          variant: "destructive",
        })
        return
      }

      // Simulate login verification
      localStorage.setItem("user_logged_in", "true")

      toast({
        title: "Login Successful!",
        description: `Welcome back, ${user.username}!`,
      })

      router.push("/")
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
            <Wallet className="h-6 w-6 text-primary" />
            <span>Sign In</span>
          </CardTitle>
          <p className="text-gray-600">Access your APT Wallet</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {!isConnected ? (
                <Button type="button" onClick={connect} className="w-full" size="lg">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect MetaMask Wallet
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-green-600 text-center">
                    ✓ Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </div>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
