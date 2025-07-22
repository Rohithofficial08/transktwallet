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
import { Wallet, User, Mail, Lock, Trash2 } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const { connect, isConnected, address, clearCache } = useWallet()
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleClearCache = () => {
    clearCache()
    toast({
      title: "Cache Cleared",
      description: "All cached wallet data has been cleared",
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate user registration
      const userData = {
        username: formData.username,
        email: formData.email,
        walletAddress: address,
        createdAt: new Date().toISOString(),
      }

      // Store user data in localStorage (in real app, this would be sent to backend)
      localStorage.setItem("user_data", JSON.stringify(userData))
      localStorage.setItem("user_registered", "true")

      toast({
        title: "Registration Successful!",
        description: "Your account has been created successfully",
      })

      // Redirect to dashboard
      router.push("/")
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
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
            <span>Create Account</span>
          </CardTitle>
          <p className="text-gray-600">Join the APT Wallet on Primordial Testnet</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={handleClearCache} variant="outline" size="sm" className="w-full mb-4 bg-transparent">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cached Data
            </Button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
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
                  Connect Your MetaMask Wallet
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-green-600 text-center">
                    ✓ Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
