"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { QRScanner } from "@/components/qr-scanner"
import { useWallet } from "@/components/wallet-provider"
import { Send, QrCode, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SendPage() {
  const { isConnected, balance, sendTransaction } = useWallet()
  const { toast } = useToast()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const handleSend = async () => {
    if (!recipient || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(amount) > Number.parseFloat(balance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough APT for this transaction",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const txHash = await sendTransaction(recipient, amount, note)

      toast({
        title: "Transaction Sent!",
        description: `Successfully sent ${amount} APT. Transaction hash: ${txHash.slice(0, 10)}...`,
      })

      // Reset form
      setRecipient("")
      setAmount("")
      setNote("")
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send transaction",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQRScan = (result: string) => {
    setRecipient(result)
    setShowScanner(false)
    toast({
      title: "Address Scanned",
      description: "Recipient address has been filled automatically",
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please connect your MetaMask wallet to send transactions.</AlertDescription>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Send APT</h1>
            <p className="text-gray-600">Transfer APT tokens on Primordial Testnet</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Send Transaction</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" onClick={() => setShowScanner(true)}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (APT) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-sm text-gray-500">Available balance: {balance} APT</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Add a note for this transaction..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleSend} disabled={isLoading || !recipient || !amount} className="w-full" size="lg">
                  {isLoading ? "Processing Transaction..." : "Send APT"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />}
        </div>
      </div>
    </div>
  )
}
