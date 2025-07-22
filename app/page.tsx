"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { BalanceCard } from "@/components/balance-card"
import { useWallet } from "@/components/wallet-provider"
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { TransactionHistory } from "@/components/transaction-history"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const { isConnected, address, balance, connect, simulateReceiveTransaction } = useWallet()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Only show notifications when connected, don't redirect
    if (isConnected) {
      const timer = setTimeout(() => {
        toast({
          title: "Wallet Connected!",
          description: `Welcome to your Web3 wallet dashboard`,
          duration: 5000,
        })
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isConnected, toast])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <div className="mb-8">
              <Wallet className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Transkt Wallet DApp</h1>
              <p className="text-xl text-gray-600 mb-4">Web3 Crypto Wallet</p>
              <p className="text-gray-500 mb-8">Connect your MetaMask wallet to get started</p>

              {/* Add Connect Button */}
              <Button onClick={connect} size="lg" className="px-8 py-3 text-lg">
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </Button>

              <p className="text-sm text-gray-400 mt-4">Your private keys never leave your wallet</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your Transkt wallet dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <BalanceCard />
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Received Today</span>
                  </div>
                  <span className="font-semibold">0.15 BDAG</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-600">Sent Today</span>
                  </div>
                  <span className="font-semibold">0.05 BDAG</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-gray-600">Net Change</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    +0.10 BDAG
                  </Badge>
                </div>
                <Separator />
                <Button
                  onClick={simulateReceiveTransaction}
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  💰 Simulate Receive Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionHistory />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
