import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface User {
  _id?: string
  username: string
  email: string
  walletAddress: string
  passwordHash: string
  createdAt: Date
  lastLogin?: Date
}

export interface Transaction {
  _id?: string
  userId: string
  walletAddress: string
  type: "sent" | "received"
  amount: string
  from: string
  to: string
  note?: string
  hash: string
  status: "pending" | "confirmed" | "failed"
  timestamp: Date
  blockNumber?: number
  networkName: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}
