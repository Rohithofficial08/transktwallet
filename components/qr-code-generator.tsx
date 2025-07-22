"use client"

import { useEffect, useRef } from "react"

interface QRCodeGeneratorProps {
  value: string
  amount?: string
  note?: string
  size?: number
}

export function QRCodeGenerator({ value, amount, note, size = 200 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    // Create a simple QR code representation
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)

    // Create a simple pattern to represent QR code
    const cellSize = size / 25
    ctx.fillStyle = "#000000"

    // Generate a pseudo-random pattern based on the address
    const hash = value.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        const shouldFill = (hash + i * j) % 3 === 0
        if (shouldFill) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
        }
      }
    }

    // Add corner squares (typical QR code feature)
    const cornerSize = cellSize * 7
    ctx.fillStyle = "#000000"

    // Top-left corner
    ctx.fillRect(0, 0, cornerSize, cornerSize)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(cellSize, cellSize, cornerSize - 2 * cellSize, cornerSize - 2 * cellSize)
    ctx.fillStyle = "#000000"
    ctx.fillRect(2 * cellSize, 2 * cellSize, cornerSize - 4 * cellSize, cornerSize - 4 * cellSize)

    // Top-right corner
    ctx.fillStyle = "#000000"
    ctx.fillRect(size - cornerSize, 0, cornerSize, cornerSize)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(size - cornerSize + cellSize, cellSize, cornerSize - 2 * cellSize, cornerSize - 2 * cellSize)
    ctx.fillStyle = "#000000"
    ctx.fillRect(size - cornerSize + 2 * cellSize, 2 * cellSize, cornerSize - 4 * cellSize, cornerSize - 4 * cellSize)

    // Bottom-left corner
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, size - cornerSize, cornerSize, cornerSize)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(cellSize, size - cornerSize + cellSize, cornerSize - 2 * cellSize, cornerSize - 2 * cellSize)
    ctx.fillStyle = "#000000"
    ctx.fillRect(2 * cellSize, size - cornerSize + 2 * cellSize, cornerSize - 4 * cellSize, cornerSize - 4 * cellSize)
  }, [value, amount, note, size])

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <div className="text-xs text-gray-500 text-center max-w-[200px] break-all">{value}</div>
    </div>
  )
}
