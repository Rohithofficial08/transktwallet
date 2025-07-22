"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "./wallet-provider"
import { Wallet } from "lucide-react"

export function WalletConnection() {
  const { connect } = useWallet()

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Connect Wallet</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={connect} className="w-full" size="lg">
          Connect with MetaMask
        </Button>
        <Button onClick={connect} variant="outline" className="w-full bg-transparent" size="lg">
          Connect with WalletConnect
        </Button>
        <p className="text-sm text-gray-500 text-center">
          Connect your wallet to start using the DApp. Your private keys never leave your wallet.
        </p>
      </CardContent>
    </Card>
  )
}
