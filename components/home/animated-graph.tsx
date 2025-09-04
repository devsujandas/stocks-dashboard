"use client"

import { useEffect, useRef } from "react"

export default function AnimatedGraph({
  width = 900,
  height = 140,
  lineColor = "#0284c7",
  fillColor = "rgba(2,132,199,0.10)",
}: {
  width?: number
  height?: number
  lineColor?: string
  fillColor?: string
}) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)

    let t = 0
    const points = new Array(240).fill(0).map((_, i) => ({
      x: (i / 239) * (width - 16) + 8,
      y: height / 2,
    }))

    const noise = (n: number) => Math.sin(n * 0.035) * 16 + Math.sin(n * 0.018) * 9 + Math.sin(n * 0.007) * 6

    const draw = () => {
      t += 1
      for (let i = 0; i < points.length; i++) {
        points[i].y = height / 2 + noise(t + i * 3)
      }
      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = 2
      ctx.strokeStyle = lineColor
      ctx.fillStyle = fillColor

      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1]
        const p1 = points[i]
        const cx = (p0.x + p1.x) / 2
        const cy = (p0.y + p1.y) / 2
        ctx.quadraticCurveTo(p0.x, p0.y, cx, cy)
      }
      ctx.stroke()

      ctx.lineTo(points[points.length - 1].x, height - 4)
      ctx.lineTo(points[0].x, height - 4)
      ctx.closePath()
      ctx.fill()

      requestAnimationFrame(draw)
    }
    const id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [width, height, lineColor, fillColor])

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border/50 bg-background">
      <canvas ref={ref} />
    </div>
  )
}
