"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { useWallet } from "@/components/wallet-provider"
import { Copy, Download, Share2, AlertCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ReceivePage() {
  const { isConnected, address } = useWallet()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Address Copied",
        description: "Wallet address has been copied to clipboard",
      })
    }
  }

  const shareAddress = async () => {
    if (navigator.share && address) {
      try {
        await navigator.share({
          title: "My Wallet Address",
          text: `Send tokens to my wallet: ${address}`,
        })

        toast({
          title: "Share Sheet Opened",
          description: "Choose an app to share your address.",
        })
      } catch (err) {
        // User may cancel or the browser can deny permission.
        console.warn("Share failed or was cancelled, falling back to copy:", err)
        copyAddress()
      }
    } else {
      copyAddress()
    }
  }

  const downloadQR = () => {
    toast({
      title: "QR Code Downloaded",
      description: "QR code has been saved to your downloads",
    })
  }

  const openFaucet = () => {
    window.open("https://primordial.bdagscan.com/faucet?chain=EVM", "_blank")
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please connect your MetaMask wallet to view your receive address.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Receive APT</h1>
            <p className="text-gray-600">Share your wallet address to receive APT tokens</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Wallet Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <div className="flex space-x-2">
                    <Input value={address || ""} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={copyAddress}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Optional)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.001"
                    placeholder="0.0 APT"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Input
                    id="note"
                    placeholder="Payment for..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={shareAddress} className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={downloadQR} className="flex-1 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download QR
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <QRCodeGenerator value={address || ""} amount={amount} note={note} />
                <p className="text-sm text-gray-500 text-center">Scan this QR code to send APT to your wallet</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-800">Get Test APT Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 mb-4">
                Need APT tokens for testing? Use the Primordial Testnet faucet to get free test tokens.
              </p>
              <Button onClick={openFaucet} className="w-full bg-orange-600 hover:bg-orange-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Primordial Faucet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
