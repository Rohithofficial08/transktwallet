"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw } from "lucide-react"
import { useWallet } from "./wallet-provider"

interface Transaction {
  id: string
  type: "sent" | "received"
  amount: string
  from: string
  to: string
  note?: string
  timestamp: Date
  hash: string
  status: "confirmed" | "pending" | "failed"
  blockNumber?: number
}

export function TransactionHistory() {
  const { address, networkName } = useWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastCheckedBlock, setLastCheckedBlock] = useState<number>(0)

  // Load transactions from localStorage
  useEffect(() => {
    if (address) {
      const savedTxs = localStorage.getItem(`transactions_${address}`)
      if (savedTxs) {
        const parsed = JSON.parse(savedTxs).map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp),
        }))
        setTransactions(parsed)
      }
    }
  }, [address])

  // Save transactions to localStorage
  const saveTransactions = (txs: Transaction[]) => {
    if (address) {
      localStorage.setItem(`transactions_${address}`, JSON.stringify(txs))
      setTransactions(txs)
    }
  }

  // Add a new transaction
  const addTransaction = (tx: Omit<Transaction, "id" | "timestamp">) => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    const updatedTxs = [newTx, ...transactions].slice(0, 50) // Keep last 50 transactions
    saveTransactions(updatedTxs)
  }

  // Check for new received transactions
  const checkForReceivedTransactions = async () => {
    if (!address || !window.ethereum) return

    try {
      // Get current block number
      const currentBlockHex = await window.ethereum.request({
        method: "eth_blockNumber",
      })
      const currentBlock = Number.parseInt(currentBlockHex, 16)

      // If this is the first check, just set the block number
      if (lastCheckedBlock === 0) {
        setLastCheckedBlock(currentBlock)
        return
      }

      // Check recent blocks for transactions to our address
      const fromBlock = Math.max(lastCheckedBlock - 10, currentBlock - 100) // Check last 100 blocks max

      // This is a simplified check - in a real app you'd use a proper blockchain API
      // For now, we'll simulate receiving transactions occasionally
      const shouldSimulateReceived = Math.random() < 0.1 // 10% chance

      if (shouldSimulateReceived && transactions.length > 0) {
        // Simulate a received transaction
        const receivedTx: Transaction = {
          id: `received_${Date.now()}`,
          type: "received",
          amount: (Math.random() * 0.1 + 0.01).toFixed(4), // Random amount between 0.01-0.11
          from: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          to: address,
          note: "Incoming payment",
          timestamp: new Date(),
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: "confirmed",
          blockNumber: currentBlock,
        }

        // Check if we already have this transaction
        const exists = transactions.some((tx) => tx.hash === receivedTx.hash)
        if (!exists) {
          const updatedTxs = [receivedTx, ...transactions].slice(0, 50)
          saveTransactions(updatedTxs)
        }
      }

      setLastCheckedBlock(currentBlock)
    } catch (error) {
      console.warn("Failed to check for received transactions:", error)
    }
  }

  // Refresh transactions and check for new ones
  const refreshTransactions = async () => {
    setIsLoading(true)

    try {
      // Check for new received transactions
      await checkForReceivedTransactions()

      // Add some demo transactions if none exist
      if (transactions.length === 0 && address) {
        const demoTxs: Transaction[] = [
          {
            id: "demo_1",
            type: "received",
            amount: "0.1",
            from: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
            to: address,
            note: "Welcome bonus",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            hash: "0x1234567890abcdef1234567890abcdef12345678",
            status: "confirmed",
          },
          {
            id: "demo_2",
            type: "received",
            amount: "0.05",
            from: "0x8ba1f109551bD432803012645Hac136c22C177",
            to: address,
            note: "Test payment",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            hash: "0xabcdef1234567890abcdef1234567890abcdef12",
            status: "confirmed",
          },
        ]
        saveTransactions(demoTxs)
      }
    } catch (error) {
      console.error("Failed to refresh transactions:", error)
    }

    setIsLoading(false)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (address) {
      const interval = setInterval(checkForReceivedTransactions, 30000)
      return () => clearInterval(interval)
    }
  }, [address, lastCheckedBlock, transactions])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const openInExplorer = (hash: string) => {
    // Different explorers for different networks
    const explorers: { [key: string]: string } = {
      "Ethereum Mainnet": "https://etherscan.io/tx/",
      "Polygon Mainnet": "https://polygonscan.com/tx/",
      "BSC Mainnet": "https://bscscan.com/tx/",
      "Arbitrum One": "https://arbiscan.io/tx/",
      Optimism: "https://optimistic.etherscan.io/tx/",
    }

    const explorerUrl = explorers[networkName] || "https://etherscan.io/tx/"
    window.open(`${explorerUrl}${hash}`, "_blank")
  }

  // Expose addTransaction function globally so it can be called from wallet provider
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).addTransaction = addTransaction
    }
  }, [transactions, address])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <Button variant="outline" size="sm" onClick={refreshTransactions} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions yet</p>
          <p className="text-sm">Your transaction history will appear here</p>
          <Button onClick={refreshTransactions} variant="outline" className="mt-4 bg-transparent">
            Load Demo Transactions
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${tx.type === "received" ? "bg-green-100" : "bg-red-100"}`}>
                  {tx.type === "received" ? (
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{tx.type === "received" ? "Received from" : "Sent to"}</span>
                    <span className="text-gray-600 font-mono text-sm">
                      {formatAddress(tx.type === "received" ? tx.from : tx.to)}
                    </span>
                  </div>

                  {tx.note && <div className="text-sm text-gray-500 mt-1">Note: {tx.note}</div>}

                  <div className="text-sm text-gray-400">{tx.timestamp.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`font-semibold ${tx.type === "received" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "received" ? "+" : "-"}
                    {tx.amount} BDAG
                  </div>
                  <Badge
                    variant={
                      tx.status === "confirmed" ? "secondary" : tx.status === "pending" ? "default" : "destructive"
                    }
                    className="text-xs"
                  >
                    {tx.status}
                  </Badge>
                </div>

                <Button variant="outline" size="sm" onClick={() => openInExplorer(tx.hash)}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
