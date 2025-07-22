"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "./wallet-provider"
import { TrendingUp, RefreshCw, Wallet } from "lucide-react"
import { useState } from "react"

export function BalanceCard() {
  const { balance, networkName, refreshBalance } = useWallet()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshBalance()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Wallet Balance</span>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold text-gray-900">{balance} BDAG</div>
            <div className="text-sm text-gray-500">{networkName}</div>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-green-600">Connected to MetaMask</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
