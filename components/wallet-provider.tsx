"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: string
  networkName: string
  connect: () => Promise<void>
  disconnect: () => void
  sendTransaction: (to: string, amount: string, note?: string) => Promise<string>
  refreshBalance: () => Promise<void>
  clearCache: () => void
  simulateReceiveTransaction: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState("0.0")
  const [networkName, setNetworkName] = useState("Unknown")
  const { toast } = useToast()

  // Clear all cached data
  const clearCache = () => {
    localStorage.removeItem("wallet_connected")
    localStorage.removeItem("wallet_address")
    localStorage.removeItem("user_logged_in")
    localStorage.removeItem("user_registered")
    localStorage.removeItem("user_data")
    setIsConnected(false)
    setAddress(null)
    setBalance("0.0")
    setNetworkName("Unknown")
    console.log("All cached wallet data cleared")
  }

  // Get network name from chain ID
  const getNetworkName = (chainId: string): string => {
    const networks: { [key: string]: string } = {
      "0x1": "Ethereum Mainnet",
      "0x3": "Ropsten Testnet",
      "0x4": "Rinkeby Testnet",
      "0x5": "Goerli Testnet",
      "0xaa36a7": "Sepolia Testnet",
      "0x89": "Polygon Mainnet",
      "0x13881": "Polygon Mumbai",
      "0xa": "Optimism",
      "0xa4b1": "Arbitrum One",
      "0x38": "BSC Mainnet",
      "0x61": "BSC Testnet",
    }
    return networks[chainId] || `Network ${chainId}`
  }

  const fetchBalance = async (walletAddress: string): Promise<string> => {
    try {
      if (window.ethereum) {
        const balanceHex = await window.ethereum.request({
          method: "eth_getBalance",
          params: [walletAddress, "latest"],
        })
        const balanceInWei = Number.parseInt(balanceHex, 16)
        const balanceInEth = (balanceInWei / 10 ** 18).toFixed(4)
        console.log("Balance fetched:", balanceInEth, "ETH")
        return balanceInEth
      }
    } catch (err) {
      console.warn("Balance fetch failed:", err)
    }
    return "0.0"
  }

  const refreshBalance = async () => {
    if (address) {
      const newBalance = await fetchBalance(address)
      setBalance(newBalance)
    }
  }

  // Simulate receiving a transaction (for testing)
  const simulateReceiveTransaction = () => {
    if (address && typeof window !== "undefined" && (window as any).addTransaction) {
      const receivedTx = {
        type: "received" as const,
        amount: (Math.random() * 0.1 + 0.01).toFixed(4),
        from: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        to: address,
        note: "Test received payment",
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: "confirmed" as const,
      }
      ;(window as any).addTransaction(receivedTx)

      toast({
        title: "💰 Payment Received!",
        description: `You received ${receivedTx.amount} ETH`,
      })
    }
  }

  const connect = async () => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask extension to continue",
          variant: "destructive",
        })
        window.open("https://metamask.io/download/", "_blank")
        return
      }

      console.log("Connecting to MetaMask...")

      // Clear any existing cached data
      clearCache()

      // Request account access from MetaMask
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      console.log("MetaMask accounts:", accounts)

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found in MetaMask")
      }

      const walletAddress = accounts[0]
      console.log("Connected wallet address:", walletAddress)

      // Validate address
      if (!walletAddress || !walletAddress.startsWith("0x") || walletAddress.length !== 42) {
        throw new Error("Invalid wallet address format")
      }

      // Get current network info
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      })

      const currentNetworkName = getNetworkName(chainId)
      console.log("Current network:", currentNetworkName, "Chain ID:", chainId)

      // Set wallet state
      setAddress(walletAddress)
      setIsConnected(true)
      setNetworkName(currentNetworkName)

      // Get balance
      const currentBalance = await fetchBalance(walletAddress)
      setBalance(currentBalance)

      // Save to localStorage
      localStorage.setItem("wallet_connected", "true")
      localStorage.setItem("wallet_address", walletAddress)

      toast({
        title: "✅ Wallet Connected!",
        description: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} connected to Transkt`,
      })

      // Simulate a welcome received transaction after 3 seconds
      setTimeout(() => {
        simulateReceiveTransaction()
      }, 3000)

      console.log("Connection successful:", {
        address: walletAddress,
        network: currentNetworkName,
        balance: currentBalance,
      })
    } catch (error: any) {
      console.error("Connection failed:", error)

      let errorMessage = "Failed to connect to MetaMask"

      if (error.code === 4001) {
        errorMessage = "You rejected the connection request"
      } else if (error.code === -32002) {
        errorMessage = "MetaMask is already processing a request"
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "❌ Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })

      clearCache()
    }
  }

  const disconnect = () => {
    clearCache()
    toast({
      title: "🔌 Wallet Disconnected",
      description: "Successfully disconnected from Transkt",
    })
  }

  const sendTransaction = async (to: string, amount: string, note?: string): Promise<string> => {
    try {
      if (!window.ethereum || !address) {
        throw new Error("Wallet not connected")
      }

      // Verify account is still connected
      const currentAccounts = await window.ethereum.request({
        method: "eth_accounts",
      })

      if (!currentAccounts.includes(address)) {
        throw new Error("Account no longer connected. Please reconnect.")
      }

      // Convert amount (ETH) → wei
      const amountWeiHex = `0x${BigInt(Math.round(Number.parseFloat(amount) * 1e18)).toString(16)}`

      // Build base tx params
      const baseParams: Record<string, string> = {
        from: address,
        to,
        value: amountWeiHex,
      }

      if (note && note.trim().length > 0) {
        baseParams.data = `0x${Buffer.from(note.trim(), "utf8").toString("hex")}`
      }

      // Fetch or set gas limit
      let txParams: Record<string, string> = { ...baseParams }

      try {
        // Ask the node for an estimation
        const estimatedGas: string = await window.ethereum.request({
          method: "eth_estimateGas",
          params: [baseParams],
        })
        txParams = { ...baseParams, gas: estimatedGas }
      } catch (err) {
        console.warn("eth_estimateGas failed, falling back to 21000 gas", err)
        // 0x5208 = 21000
        txParams = { ...baseParams, gas: "0x5208" }
      }

      // Finally send the tx
      const txHash: string = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      })

      console.log("Transaction hash:", txHash)

      // Persist to history (sent → pending)
      if (typeof window !== "undefined" && (window as any).addTransaction) {
        ;(window as any).addTransaction({
          type: "sent",
          amount,
          from: address,
          to,
          note,
          hash: txHash,
          status: "pending",
        })
      }

      // Refresh balance soon after
      setTimeout(refreshBalance, 5000)

      return txHash
    } catch (error: any) {
      console.error("Transaction failed:", error)
      throw new Error(
        error?.message?.includes("gas") || error?.message?.includes("gasLimit")
          ? "Gas estimation failed. Try again with a smaller amount or check network fees."
          : error?.message || "Transaction failed",
      )
    }
  }

  useEffect(() => {
    // Listen for MetaMask events
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("Accounts changed:", accounts)

        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== address) {
          setAddress(accounts[0])
          localStorage.setItem("wallet_address", accounts[0])
          fetchBalance(accounts[0]).then(setBalance)
          toast({
            title: "🔄 Account Changed",
            description: `Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          })
        }
      }

      const handleChainChanged = (chainId: string) => {
        console.log("Network changed:", chainId)
        const newNetworkName = getNetworkName(chainId)
        setNetworkName(newNetworkName)

        if (address) {
          fetchBalance(address).then(setBalance)
        }

        toast({
          title: "🌐 Network Changed",
          description: `Switched to ${newNetworkName}`,
        })
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [address, toast])

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance,
        networkName,
        connect,
        disconnect,
        sendTransaction,
        refreshBalance,
        clearCache,
        simulateReceiveTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

declare global {
  interface Window {
    ethereum?: any
  }
}
