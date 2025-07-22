import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyPassword, generateToken } from "@/lib/auth"
import type { User } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, walletAddress } = await request.json()

    if (!email || !password || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptoproject")
    const users = db.collection<User>("users")

    // Find user by email and wallet address
    const user = await users.findOne({
      email,
      walletAddress,
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials or wallet address mismatch" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    await users.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    // Generate JWT token
    const token = generateToken(user._id!.toString())

    return NextResponse.json({
      success: true,
      user: {
        id: user._id!.toString(),
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        lastLogin: new Date(),
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
