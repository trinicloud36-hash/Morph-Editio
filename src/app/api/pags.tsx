'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calculator as CalculatorIcon, History, RotateCcw, Trash2, Box, Grid3x3, Layers, Hexagon } from 'lucide-react'

type DimensionType = '2d' | '3d' | '4d' | '5d' | '6d'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [history, setHistory] = useState<Array<{ expr: string; result: string; value: number }>>([])
  const [isNewInput, setIsNewInput] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [dimension, setDimension] = useState<DimensionType>('3d')
  const [lastResult, setLastResult] = useState<number>(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = rect.height
    }

    // Draw visualization
    drawVisualization(ctx, canvas.width, canvas.height)
  }, [display, dimension, lastResult])

  const drawVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.fillStyle = '#020204'
    ctx.fillRect(0, 0, width, height)

    const value = parseFloat(display) || 0
    const cx = width / 2
    const cy = height / 2
    const maxRadius = Math.min(width, height) * 0.35

    // Draw grid
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = -5; i <= 5; i++) {
      const x = cx + i * (maxRadius / 5)
      const y = cy + i * (maxRadius / 5)
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()

    // Draw based on dimension
    switch (dimension) {
      case '2d':
        draw2D(ctx, cx, cy, maxRadius, value)
        break
      case '3d':
        draw3D(ctx, cx, cy, maxRadius, value)
        break
      case '4d':
        draw4D(ctx, cx, cy, maxRadius, value)
        break
      case '5d':
        draw5D(ctx, cx, cy, maxRadius, value)
        break
      case '6d':
        draw6D(ctx, cx, cy, maxRadius, value, height)
        break
    }

    // Draw equation overlay
    drawEquationOverlay(ctx, width, height)
  }

  const draw2D = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, value: number) => {
    // Draw 2D vector representation
    const normalizedValue = Math.max(-1, Math.min(1, value / 100))
    const vectorLength = radius * Math.abs(normalizedValue)
    const angle = (Date.now() * 0.001) % (Math.PI * 2)

    // Axes
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx - radius, cy)
    ctx.lineTo(cx + radius, cy)
    ctx.moveTo(cx, cy - radius)
    ctx.lineTo(cx, cy + radius)
    ctx.stroke()

    // Draw unit circle
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2)
    ctx.stroke()

    // Draw vector from origin
    const vx = cx + Math.cos(angle) * vectorLength
    const vy = cy + Math.sin(angle) * vectorLength

    ctx.strokeStyle = '#06b6d4'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(vx, vy)
    ctx.stroke()

    // Draw point
    ctx.fillStyle = '#06b6d4'
    ctx.beginPath()
    ctx.arc(vx, vy, 6, 0, Math.PI * 2)
    ctx.fill()

    // Glow effect
    ctx.shadowColor = '#06b6d4'
    ctx.shadowBlur = 20
    ctx.beginPath()
    ctx.arc(vx, vy, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }

  const draw3D = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, value: number) => {
    const normalizedValue = Math.max(-1, Math.min(1, value / 100))
    const scale = radius * Math.abs(normalizedValue)

    // Draw 3D cube representation
    const rotation = Date.now() * 0.0005

    // Cube vertices
    const size = scale * 0.8
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ].map(([x, y, z]) => {
      // Rotate around Y axis
      const cosR = Math.cos(rotation)
      const sinR = Math.sin(rotation)
      const x1 = x * cosR - z * sinR
      const z1 = x * sinR + z * cosR

      // Rotate around X axis
      const cosX = Math.cos(rotation * 0.7)
      const sinX = Math.sin(rotation * 0.7)
      const y1 = y * cosX - z1 * sinX
      const z2 = y * sinX + z1 * cosX

      // Project to 2D
      const perspective = 3
      const proj = 1 / (perspective + z2 / size)
      return {
        x: cx + x1 * size * proj,
        y: cy + y1 * size * proj,
        z: z2
      }
    })

    // Draw edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back face
      [4, 5], [5, 6], [6, 7], [7, 4], // Front face
      [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
    ]

    edges.forEach(([i, j]) => {
      const v1 = vertices[i]
      const v2 = vertices[j]
      const depth = (v1.z + v2.z) / 2
      const alpha = 0.3 + (depth + 1) / 2 * 0.7

      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(v1.x, v1.y)
      ctx.lineTo(v2.x, v2.y)
      ctx.stroke()
    })

    // Draw vertices
    vertices.forEach(v => {
      const alpha = 0.3 + (v.z + 1) / 2 * 0.7
      ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`
      ctx.beginPath()
      ctx.arc(v.x, v.y, 4, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const draw4D = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, value: number) => {
    const normalizedValue = Math.max(-1, Math.min(1, value / 100))
    const scale = radius * Math.abs(normalizedValue)
    const time = Date.now() * 0.001

    // 4D tesseract projection - show two nested cubes with color representing 4th dimension
    const drawCube = (offset: number, color: string, wOffset: number) => {
      const rotation = time + wOffset
      const size = scale * 0.6 * (1 + offset * 0.3)

      const vertices: Array<{x: number, y: number, z: number, w: number}> = []
      for (let x = -1; x <= 1; x += 2) {
        for (let y = -1; y <= 1; y += 2) {
          for (let z = -1; z <= 1; z += 2) {
            for (let w = -1; w <= 1; w += 2) {
              const cosR = Math.cos(rotation)
              const sinR = Math.sin(rotation)

              // 4D rotation (XW plane)
              let x1 = x * cosR - w * sinR
              let w1 = x * sinR + w * cosR

              // 3D projection
              const proj3d = 1 / (3 + w1 / 2)
              const x2 = x1 * proj3d
              const y2 = y * proj3d
              const z2 = z * proj3d

              // 2D rotation and projection
              const cosR2 = Math.cos(time * 0.5)
              const sinR2 = Math.sin(time * 0.5)
              const x3 = x2 * cosR2 - z2 * sinR2
              const z3 = x2 * sinR2 + z2 * cosR2

              const proj2d = 1 / (3 + z3 / size)
              vertices.push({
                x: cx + x3 * size * proj2d,
                y: cy + y2 * size * proj2d,
                z: z3,
                w: w1
              })
            }
          }
        }
      }

      // Draw edges
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          const v1 = vertices[i]
          const v2 = vertices[j]
          const dist = Math.sqrt(
            Math.pow(v1.x - v2.x, 2) +
            Math.pow(v1.y - v2.y, 2)
          )
          if (dist < size * 1.5) {
            const alpha = 0.1 + (1 - Math.abs(v1.w) / 2) * 0.4
            ctx.strokeStyle = color.replace('1)', `${alpha})`)
            ctx.beginPath()
            ctx.moveTo(v1.x, v1.y)
            ctx.lineTo(v2.x, v2.y)
            ctx.stroke()
          }
        }
      }
    }

    // Draw two tesseract projections
    drawCube(0, 'rgba(234, 179, 8, 0.6)', 0)
    drawCube(0.5, 'rgba(16, 185, 129, 0.6)', Math.PI / 4)
  }

  const draw5D = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, value: number) => {
    const normalizedValue = Math.max(-1, Math.min(1, value / 100))
    const scale = radius * Math.abs(normalizedValue)
    const time = Date.now() * 0.0008

    // 5D representation - 5 interlinked pentagonal structures
    const colors = [
      'rgba(6, 182, 212, 0.7)',  // Cyan
      'rgba(168, 85, 247, 0.7)',  // Purple
      'rgba(234, 179, 8, 0.7)',   // Gold
      'rgba(16, 185, 129, 0.7)',  // Green
      'rgba(239, 68, 68, 0.7)'    // Red
    ]

    for (let dim = 0; dim < 5; dim++) {
      const rotation = time + (dim * Math.PI * 2 / 5)
      const size = scale * (0.3 + dim * 0.1)

      ctx.strokeStyle = colors[dim]
      ctx.lineWidth = 2

      // Draw pentagon
      ctx.beginPath()
      for (let i = 0; i <= 5; i++) {
        const angle = (i * Math.PI * 2 / 5) + rotation
        const x = cx + Math.cos(angle) * size
        const y = cy + Math.sin(angle) * size
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Draw internal connections (5th dimension represented)
      for (let i = 0; i < 5; i++) {
        const angle1 = (i * Math.PI * 2 / 5) + rotation
        const angle2 = (((i + 2) % 5) * Math.PI * 2 / 5) + rotation

        const x1 = cx + Math.cos(angle1) * size * 0.5
        const y1 = cy + Math.sin(angle1) * size * 0.5
        const x2 = cx + Math.cos(angle2) * size * 0.5
        const y2 = cy + Math.sin(angle2) * size * 0.5

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // Draw vertices
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2 / 5) + rotation
        const x = cx + Math.cos(angle) * size
        const y = cy + Math.sin(angle) * size

        ctx.fillStyle = colors[dim]
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()

        // Glow
        ctx.shadowColor = colors[dim]
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // Draw central core representing 5D singularity
    const coreSize = scale * 0.2
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize)
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)')
    gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)')
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(cx, cy, coreSize, 0, Math.PI * 2)
    ctx.fill()
  }

  const draw6D = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, value: number, height: number) => {
    const normalizedValue = Math.max(-1, Math.min(1, value / 100))
    const scale = radius * Math.abs(normalizedValue)
    const time = Date.now() * 0.001

    // 6D representation - Hexagonal fractal structure
    const colors = [
      'rgba(6, 182, 212, 0.8)',  // Cyan
      'rgba(168, 85, 247, 0.8)',  // Purple
      'rgba(234, 179, 8, 0.8)',   // Gold
      'rgba(16, 185, 129, 0.8)',  // Green
      'rgba(239, 68, 68, 0.8)',   // Red
      'rgba(249, 115, 22, 0.8)'   // Orange
    ]

    // Draw 6 concentric hexagonal layers
    for (let layer = 0; layer < 6; layer++) {
      const layerRotation = time * (layer % 2 === 0 ? 1 : -1) + layer * 0.5
      const layerSize = scale * (0.8 - layer * 0.12)

      ctx.strokeStyle = colors[layer]
      ctx.lineWidth = 1.5

      // Draw hexagon
      ctx.beginPath()
      for (let i = 0; i <= 6; i++) {
        const angle = (i * Math.PI * 2 / 6) + layerRotation
        const x = cx + Math.cos(angle) * layerSize
        const y = cy + Math.sin(angle) * layerSize
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Draw interdimensional connections
      if (layer > 0) {
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2 / 6) + layerRotation
          const prevLayerRotation = time * ((layer - 1) % 2 === 0 ? 1 : -1) + (layer - 1) * 0.5
          const prevAngle = (i * Math.PI * 2 / 6) + prevLayerRotation

          const x = cx + Math.cos(angle) * layerSize
          const y = cy + Math.sin(angle) * layerSize
          const prevX = cx + Math.cos(prevAngle) * scale * (0.8 - (layer - 1) * 0.12)
          const prevY = cy + Math.sin(prevAngle) * scale * (0.8 - (layer - 1) * 0.12)

          ctx.strokeStyle = `rgba(168, 85, 247, ${0.3})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(prevX, prevY)
          ctx.lineTo(x, y)
          ctx.stroke()
        }
      }

      // Draw vertices with dimension indicators
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2 / 6) + layerRotation
        const x = cx + Math.cos(angle) * layerSize
        const y = cy + Math.sin(angle) * layerSize

        ctx.fillStyle = colors[layer]
        ctx.beginPath()
        ctx.arc(x, y, 3 + (5 - layer), 0, Math.PI * 2)
        ctx.fill()

        // Dimension indicator lines
        if (layer === 5) {
          const indicatorLength = 15
          ctx.strokeStyle = colors[i]
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + Math.cos(angle + Math.PI / 6) * indicatorLength, y + Math.sin(angle + Math.PI / 6) * indicatorLength)
          ctx.stroke()
        }
      }
    }

    // Draw 6D core - pulsing energy
    const pulseSize = scale * 0.15 + Math.sin(time * 3) * scale * 0.03
    const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseSize)
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
    coreGradient.addColorStop(0.3, 'rgba(168, 85, 247, 0.6)')
    coreGradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.3)')
    coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.fillStyle = coreGradient
    ctx.beginPath()
    ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2)
    ctx.fill()

    // Dimension labels
    ctx.fillStyle = '#6b7280'
    ctx.font = '10px monospace'
    ctx.fillText(`D1-D6: [${colors.map((_, i) => (Math.sin(time + i) * 0.5 + 0.5).toFixed(2)).join(', ')}]`, 10, height * 0.9)
  }

  const drawEquationOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw mathematical representation
    ctx.fillStyle = 'rgba(11, 15, 25, 0.85)'
    ctx.fillRect(10, 10, 200, 80)

    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1
    ctx.strokeRect(10, 10, 200, 80)

    ctx.fillStyle = '#f3f4f6'
    ctx.font = 'bold 12px monospace'
    ctx.fillText(`Dimension: ${dimension.toUpperCase()}`, 20, 30)

    ctx.fillStyle = '#a855f7'
    ctx.font = '10px monospace'
    ctx.fillText(`Value: ${display}`, 20, 50)

    ctx.fillStyle = '#06b6d4'
    ctx.font = '10px monospace'
    ctx.fillText(`Expression: ${expression || 'N/A'}`, 20, 70)

    ctx.fillStyle = '#eab308'
    ctx.font = '10px monospace'
    ctx.fillText(`Coord: [${(Math.sin(Date.now() * 0.001) * 100).toFixed(0)}, ${(Math.cos(Date.now() * 0.001) * 100).toFixed(0)}]`, 20, 90)
  }

  const handleNumber = (num: string) => {
    if (isNewInput) {
      setDisplay(num)
      setIsNewInput(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const handleOperator = (op: string) => {
    setIsNewInput(false)
    const lastChar = expression.slice(-1)

    if (['+', '-', '×', '÷'].includes(lastChar)) {
      setExpression(expression.slice(0, -1) + op)
    } else {
      setExpression(expression + display + op)
    }
  }

  const handleDecimal = () => {
    if (isNewInput) {
      setDisplay('0.')
      setIsNewInput(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setExpression('')
    setLastResult(0)
    setIsNewInput(true)
  }

  const handleBackspace = () => {
    if (display.length === 1 || (display.length === 2 && display[0] === '-')) {
      setDisplay('0')
      setIsNewInput(true)
    } else {
      setDisplay(display.slice(0, -1))
    }
  }

  const handlePercent = () => {
    const num = parseFloat(display)
    setDisplay((num / 100).toString())
  }

  const handleSign = () => {
    if (display !== '0') {
      setDisplay(display[0] === '-' ? display.slice(1) : '-' + display)
    }
  }

  const handleEquals = () => {
    try {
      const fullExpr = expression + display
      const evalExpr = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/100')

      const result = eval(evalExpr)

      if (!isFinite(result) || isNaN(result)) {
        setDisplay('Error')
        setIsNewInput(true)
        return
      }

      const formattedResult = Number.isInteger(result)
        ? result.toString()
        : parseFloat(result.toFixed(10)).toString()

      const numericResult = parseFloat(formattedResult)
      setLastResult(numericResult)

      // Add to history
      setHistory(prev => [
        { expr: fullExpr, result: formattedResult, value: numericResult },
        ...prev.slice(0, 19)
      ])

      setDisplay(formattedResult)
      setExpression('')
      setIsNewInput(true)
    } catch (error) {
      setDisplay('Error')
      setIsNewInput(true)
    }
  }

  const handleHistoryClick = (expr: string, result: string, value: number) => {
    setDisplay(result)
    setExpression(expr + ' = ')
    setLastResult(value)
    setIsNewInput(true)
    setShowHistory(false)
  }

  const clearHistory = () => {
    setHistory([])
  }

  const buttonStyles = (color: string) => {
    const styles = {
      cyan: 'hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/50',
      purple: 'hover:bg-purple-500/20 hover:text-purple-400 hover:border-purple-500/50',
      gold: 'hover:bg-yellow-500/20 hover:text-yellow-400 hover:border-yellow-500/50',
      red: 'hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50',
      default: 'hover:bg-slate-700 hover:border-slate-600'
    }
    return styles[color as keyof typeof styles] || styles.default
  }

  const dimensionButtons = [
    { dim: '2d' as DimensionType, icon: Grid3x3, label: '2D' },
    { dim: '3d' as DimensionType, icon: Box, label: '3D' },
    { dim: '4d' as DimensionType, icon: Box, label: '4D' },
    { dim: '5d' as DimensionType, icon: Hexagon, label: '5D' },
    { dim: '6d' as DimensionType, icon: Layers, label: '6D' }
  ]

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Header */}
      <header className="h-16 bg-[#0b0f19] border-b border-[#1f2937] flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex flex-col gap-0.5">
          <div className="text-base font-extrabold tracking-wider text-[#f3f4f6]">
            VECTOR CORE
          </div>
          <div className="text-[0.65rem] tracking-[0.15rem] text-cyan-500 font-normal">
            {'// MULTI-DIMENSIONAL CALCULATOR'}
          </div>
        </div>
        <Badge className="font-mono text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase">
          System Ready
        </Badge>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Calculator */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-md mx-auto">
              {/* Calculator Card */}
              <Card className="bg-[#0b0f19] border-[#1f2937] p-4 mb-4">
                {/* Display */}
                <div className="mb-3 space-y-2">
                  {/* Expression Display */}
                  <div className="h-6 flex items-center justify-end">
                    <span className="text-[#6b7280] text-xs font-mono truncate">
                      {expression}
                    </span>
                  </div>

                  {/* Main Display */}
                  <div className="bg-[#020204] rounded-lg p-3 min-h-[80px] flex items-end justify-end border border-[#1f2937]">
                    <input
                      ref={inputRef}
                      type="text"
                      value={display}
                      onChange={(e) => setDisplay(e.target.value)}
                      className="w-full bg-transparent text-right text-3xl md:text-4xl font-mono font-bold text-[#f3f4f6] outline-none caret-cyan-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <Separator className="bg-[#1f2937] mb-3" />

                {/* Calculator Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {/* Row 1 */}
                  <Button
                    onClick={() => setShowHistory(!showHistory)}
                    variant="outline"
                    className={`h-12 text-sm font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    <History className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className={`h-12 text-sm font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('red')} transition-all`}
                  >
                    AC
                  </Button>
                  <Button
                    onClick={handleBackspace}
                    variant="outline"
                    className={`h-12 text-sm font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('red')} transition-all`}
                  >
                    ⌫
                  </Button>
                  <Button
                    onClick={() => handleOperator('÷')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('purple')} transition-all`}
                  >
                    ÷
                  </Button>

                  {/* Row 2 */}
                  <Button
                    onClick={() => handleNumber('7')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    7
                  </Button>
                  <Button
                    onClick={() => handleNumber('8')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    8
                  </Button>
                  <Button
                    onClick={() => handleNumber('9')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    9
                  </Button>
                  <Button
                    onClick={() => handleOperator('×')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('purple')} transition-all`}
                  >
                    ×
                  </Button>

                  {/* Row 3 */}
                  <Button
                    onClick={() => handleNumber('4')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    4
                  </Button>
                  <Button
                    onClick={() => handleNumber('5')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    5
                  </Button>
                  <Button
                    onClick={() => handleNumber('6')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    6
                  </Button>
                  <Button
                    onClick={() => handleOperator('-')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('purple')} transition-all`}
                  >
                    −
                  </Button>

                  {/* Row 4 */}
                  <Button
                    onClick={() => handleNumber('1')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    1
                  </Button>
                  <Button
                    onClick={() => handleNumber('2')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    2
                  </Button>
                  <Button
                    onClick={() => handleNumber('3')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    3
                  </Button>
                  <Button
                    onClick={() => handleOperator('+')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('purple')} transition-all`}
                  >
                    +
                  </Button>

                  {/* Row 5 */}
                  <Button
                    onClick={handleSign}
                    variant="outline"
                    className={`h-12 text-sm font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    ±
                  </Button>
                  <Button
                    onClick={() => handleNumber('0')}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    0
                  </Button>
                  <Button
                    onClick={handleDecimal}
                    variant="outline"
                    className={`h-12 text-lg font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`}
                  >
                    .
                  </Button>
                  <Button
                    onClick={handleEquals}
                    className={`h-12 text-lg font-mono bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 hover:border-cyan-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]`}
                  >
                    =
                  </Button>
                </div>

                {/* Bottom Actions */}
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={handlePercent}
                    variant="outline"
                    className={`flex-1 h-9 font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('gold')} transition-all`}
                  >
                    %
                  </Button>
                  <Button
                    onClick={() => {
                      setDisplay('0')
                      setExpression('')
                      setLastResult(0)
                      setIsNewInput(true)
                      clearHistory()
                    }}
                    variant="outline"
                    className={`flex-1 h-9 font-mono bg-slate-900/50 border-[#1f2937] ${buttonStyles('red')} transition-all`}
                  >
                    <RotateCcw className="w-3 h-3 mr-2" />
                    Reset
                  </Button>
                </div>
              </Card>

              {/* History Panel */}
              {showHistory && (
                <Card className="bg-[#0b0f19] border-[#1f2937] p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-[#6b7280]" />
                      <span className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold">
                        History
                      </span>
                    </div>
                    {history.length > 0 && (
                      <Button
                        onClick={clearHistory}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#6b7280] hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                    {history.length === 0 ? (
                      <div className="text-center py-6 text-[#6b7280] text-xs font-mono">
                        No calculations yet
                      </div>
                    ) : (
                      history.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleHistoryClick(item.expr, item.result, item.value)}
                          className="w-full p-2 text-left bg-slate-900/50 hover:bg-slate-800/50 border border-[#1f2937] hover:border-cyan-500/30 rounded-md transition-all group"
                        >
                          <div className="text-xs text-[#6b7280] font-mono mb-1 truncate">
                            {item.expr} =
                          </div>
                          <div className="text-sm font-mono text-[#f3f4f6] group-hover:text-cyan-400 transition-colors">
                            {item.result}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Visualization */}
        <div className="lg:w-1/2 xl:w-3/5 flex flex-col bg-[#020204] border-l border-[#1f2937]">
          {/* Dimension Selector */}
          <div className="p-4 border-b border-[#1f2937]">
            <div className="flex items-center gap-2 mb-3">
              <Box className="w-4 h-4 text-[#6b7280]" />
              <span className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold">
                Visualization Dimension
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {dimensionButtons.map(({ dim, icon: Icon, label }) => (
                <Button
                  key={dim}
                  onClick={() => setDimension(dim)}
                  variant="outline"
                  className={`h-10 ${dimension === dim
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                    : `bg-slate-900/50 border-[#1f2937] ${buttonStyles('default')} transition-all`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs ml-1 font-mono">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
            />

            {/* HUD Overlay - Top Right */}
            <div className="absolute top-4 right-4 space-y-2">
              <div className="bg-[#0b0f19] backdrop-blur-sm border-l-3 border-[#eab308] p-3 min-w-[180px] shadow-lg">
                <div className="text-[10px] text-[#6b7280] uppercase tracking-wider font-semibold mb-1">
                  Scalar Value
                </div>
                <div className="text-xl font-mono font-bold text-[#eab308]" id="val-r0">
                  {parseFloat(display) || 0}
                </div>
                <div className="text-[10px] text-[#6b7280] opacity-70 mt-1">
                  Current Input
                </div>
              </div>

              <div className="bg-[#0b0f19] backdrop-blur-sm border-l-3 border-[#a855f7] p-3 min-w-[180px] shadow-lg">
                <div className="text-[10px] text-[#6b7280] uppercase tracking-wider font-semibold mb-1">
                  Vector Magnitude
                </div>
                <div className="text-xl font-mono font-bold text-[#a855f7]" id="val-r2">
                  {Math.abs(parseFloat(display) || 0).toFixed(2)}
                </div>
                <div className="text-[10px] text-[#6b7280] opacity-70 mt-1">
                  {dimension.toUpperCase()} Space
                </div>
              </div>

              <div className="bg-[#0b0f19] backdrop-blur-sm border-l-3 border-[#06b6d4] p-3 min-w-[180px] shadow-lg">
                <div className="text-[10px] text-[#6b7280] uppercase tracking-wider font-semibold mb-1">
                  Dimensional Depth
                </div>
                <div className="text-xl font-mono font-bold text-[#06b6d4]" id="val-r3">
                  {dimension.replace('d', '')}D
                </div>
                <div className="text-[10px] text-[#6b7280] opacity-70 mt-1">
                  Projection Space
                </div>
              </div>
            </div>

            {/* Lie Algebra Monitor - Bottom Left */}
            <div className="absolute bottom-4 left-4 bg-[#0b0f19] backdrop-blur-sm border border-[#1f2937] p-3 max-w-[280px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-semibold">
                  Live Math Monitor
                </span>
                <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  LIVE
                </Badge>
              </div>
              <div className="text-[10px] font-mono text-[#6b7280] leading-relaxed">
                <div className="mb-1">
                  <span className="text-[#f3f4f6] font-bold">Value</span> ={' '}
                  <span className="text-[#eab308]">{display}</span>
                </div>
                <div className="mb-1">
                  <span className="text-[#f3f4f6] font-bold">Expr</span> ={' '}
                  <span className="text-[#a855f7]">{expression || 'Empty'}</span>
                </div>
                <div className="border-t border-[#1f2937] pt-1 mt-1">
                  <span className="text-[#f97316]">|</span>v<span className="text-[#f97316]">|</span> ={' '}
                  <span className="text-[#06b6d4]">{Math.abs(parseFloat(display) || 0).toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 bg-[#0b0f19] border-t border-[#1f2937] flex items-center justify-center flex-shrink-0 mt-auto">
        <p className="text-[10px] text-[#6b7280] font-mono">
          VECTOR CORE <span className="text-cyan-500">&sbquo;&sbquo;</span> MULTI-DIMENSIONAL VISUALIZATION <span className="text-cyan-500">&sbquo;&sbquo;</span> READY
        </p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(31, 41, 55, 0.7);
        }
      `}</style>
    </div>
  )
}
