"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, Cpu, HardDrive } from "lucide-react"

interface PerformanceMetrics {
  webglSupported: boolean
  memoryUsage: number
  storageUsed: number
  storageQuota: number
  processingMode: "WebGL" | "CPU"
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    webglSupported: false,
    memoryUsage: 0,
    storageUsed: 0,
    storageQuota: 0,
    processingMode: "CPU",
  })

  useEffect(() => {
    const checkPerformance = async () => {
      // Check WebGL support
      const canvas = document.createElement("canvas")
      const webglSupported = !!canvas.getContext("webgl")

      // Check storage usage
      let storageUsed = 0
      let storageQuota = 0

      if ("storage" in navigator && "estimate" in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate()
          storageUsed = estimate.usage || 0
          storageQuota = estimate.quota || 0
        } catch (error) {
          console.warn("Storage estimation not available")
        }
      }

      // Estimate memory usage (rough approximation)
      const memoryUsage = performance.memory ? (performance.memory as any).usedJSHeapSize / 1024 / 1024 : 0

      setMetrics({
        webglSupported,
        memoryUsage: Math.round(memoryUsage),
        storageUsed: Math.round(storageUsed / 1024 / 1024),
        storageQuota: Math.round(storageQuota / 1024 / 1024),
        processingMode: webglSupported ? "WebGL" : "CPU",
      })
    }

    checkPerformance()
    const interval = setInterval(checkPerformance, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-2">
            <Cpu className="w-3 h-3" />
            Processing Mode
          </span>
          <Badge variant={metrics.webglSupported ? "default" : "secondary"}>{metrics.processingMode}</Badge>
        </div>

        {metrics.memoryUsage > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Memory Usage</span>
            <span className="text-sm font-mono">{metrics.memoryUsage} MB</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-2">
            <HardDrive className="w-3 h-3" />
            Storage Used
          </span>
          <span className="text-sm font-mono">
            {metrics.storageUsed} / {metrics.storageQuota} MB
          </span>
        </div>

        {metrics.storageQuota > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${Math.min((metrics.storageUsed / metrics.storageQuota) * 100, 100)}%`,
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
