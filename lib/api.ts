const API_BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000/api" : "/api"

export class ApiClient {
  private token: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "API request failed")
    }

    return response.json()
  }

  // Auth endpoints
  async register(userData: {
    username: string
    email: string
    password: string
    walletAddress: string
  }) {
    const result = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (result.token) {
      this.setToken(result.token)
    }

    return result
  }

  async login(credentials: {
    email: string
    password: string
    walletAddress: string
  }) {
    const result = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (result.token) {
      this.setToken(result.token)
    }

    return result
  }

  // User endpoints
  async getProfile() {
    return this.request("/user/profile")
  }

  // Transaction endpoints
  async getTransactions() {
    return this.request("/transactions")
  }

  async createTransaction(transactionData: {
    walletAddress: string
    type: "sent" | "received"
    amount: string
    from: string
    to: string
    note?: string
    hash: string
    status?: "pending" | "confirmed" | "failed"
    blockNumber?: number
    networkName: string
  }) {
    return this.request("/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    })
  }

  // Balance endpoint
  async getBalance(address: string, network = "ethereum") {
    return this.request(`/balance?address=${address}&network=${network}`)
  }
}

export const apiClient = new ApiClient()
