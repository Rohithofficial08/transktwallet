import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"
import type { User } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, walletAddress } = await request.json()

    // Validate input
    if (!username || !email || !password || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate wallet address format
    if (!walletAddress.startsWith("0x") || walletAddress.length !== 42) {
      return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("cryptoproject")
    const users = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await users.findOne({
      $or: [{ email }, { username }, { walletAddress }],
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email, username, or wallet address already exists" },
        { status: 409 },
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const newUser: User = {
      username,
      email,
      walletAddress,
      passwordHash,
      createdAt: new Date(),
    }

    const result = await users.insertOne(newUser)
    const userId = result.insertedId.toString()

    // Generate JWT token
    const token = generateToken(userId)

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        username,
        email,
        walletAddress,
        createdAt: newUser.createdAt,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
