import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Transaction } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("cryptoproject")
    const transactions = db.collection<Transaction>("transactions")

    // Get transactions for this user
    const userTransactions = await transactions
      .find({ userId: decoded.userId })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({
      success: true,
      transactions: userTransactions,
    })
  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const transactionData = await request.json()

    const client = await clientPromise
    const db = client.db("cryptoproject")
    const transactions = db.collection<Transaction>("transactions")

    // Create new transaction
    const newTransaction: Transaction = {
      userId: decoded.userId,
      walletAddress: transactionData.walletAddress,
      type: transactionData.type,
      amount: transactionData.amount,
      from: transactionData.from,
      to: transactionData.to,
      note: transactionData.note,
      hash: transactionData.hash,
      status: transactionData.status || "pending",
      timestamp: new Date(),
      blockNumber: transactionData.blockNumber,
      networkName: transactionData.networkName,
    }

    const result = await transactions.insertOne(newTransaction)

    return NextResponse.json({
      success: true,
      transaction: {
        ...newTransaction,
        _id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("Create transaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
