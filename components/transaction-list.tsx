"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react"

interface Transaction {
  id: string
  type: "sent" | "received"
  amount: string
  from: string
  to: string
  note?: string
  timestamp: Date
  hash: string
}

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const openInExplorer = (hash: string) => {
    window.open(`https://primordial.bdagscan.com/tx/${hash}`, "_blank")
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                <span className="text-gray-600">{formatAddress(tx.type === "received" ? tx.from : tx.to)}</span>
              </div>

              {tx.note && <div className="text-sm text-gray-500 mt-1">Note: {tx.note}</div>}

              <div className="text-sm text-gray-400">{tx.timestamp.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`font-semibold ${tx.type === "received" ? "text-green-600" : "text-red-600"}`}>
                {tx.type === "received" ? "+" : "-"}
                {tx.amount} APT
              </div>
              <Badge variant="secondary" className="text-xs">
                Confirmed
              </Badge>
            </div>

            <Button variant="outline" size="sm" onClick={() => openInExplorer(tx.hash)}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
