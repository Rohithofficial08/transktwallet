"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Camera } from "lucide-react"

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
      }
    } catch (err) {
      setError("Camera access denied or not available")
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    setIsScanning(false)
  }

  const simulateScan = () => {
    // Simulate scanning a QR code with a Primordial testnet address
    const mockAddress = "0x8ba1f109551bD432803012645Hac136c22C177"
    onScan(mockAddress)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Scan QR Code</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {error ? (
              <div className="flex items-center justify-center h-full text-center p-4">
                <div>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={simulateScan}>Use Demo Address</Button>
                </div>
              </div>
            ) : (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}

            {/* Scanning overlay */}
            <div className="absolute inset-0 border-2 border-primary rounded-lg">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Position the QR code within the frame to scan</p>
            <Button onClick={simulateScan} variant="outline" className="w-full bg-transparent">
              Use Demo Address (for testing)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
