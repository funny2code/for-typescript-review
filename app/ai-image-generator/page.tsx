"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@components/shadcn/ui/button";
import { Input } from "@components/shadcn/ui/input";
import { Label } from "@components/shadcn/ui/label";
import { Slider } from "@components/shadcn/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/shadcn/ui/select";
import { Paintbrush, Eraser, RotateCcw, Download, Image as ImageIcon } from "lucide-react";

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState("")
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState("brush")
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [filter, setFilter] = useState("none")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.lineCap = "round"
        ctx.strokeStyle = color
        ctx.lineWidth = brushSize
        ctxRef.current = ctx
      }
    }
  }, [color, brushSize])

  useEffect(() => {
    if (generatedImage) {
      const image = new Image()
      image.onload = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (ctx) {
          ctx.drawImage(image, 0, 0, 512, 512)
          applyFilter(filter)
        }
      }
      image.src = generatedImage
    }
  }, [generatedImage])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      ctxRef.current?.beginPath()
      ctxRef.current?.moveTo(e.clientX - rect.left, e.clientY - rect.top)
      setIsDrawing(true)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      if (tool === "brush") {
        ctxRef.current?.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctxRef.current?.stroke()
      } else if (tool === "eraser") {
        ctxRef.current?.clearRect(
          e.clientX - rect.left - brushSize / 2,
          e.clientY - rect.top - brushSize / 2,
          brushSize,
          brushSize
        )
      }
    }
  }

  const stopDrawing = () => {
    ctxRef.current?.closePath()
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
  }

  const generateImage = async () => {
    // This is a placeholder for the actual AI image generation
    // You would typically make an API call to an AI service here
    console.log("Generating image with prompt:", prompt)
    setGeneratedImage("/example.PNG?height=512&width=512")
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = "ai-generated-image.png"
      link.click()
    }
  }

  const applyFilter = (filterType: string) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        switch (filterType) {
          case "grayscale":
            const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b
            data[i] = data[i + 1] = data[i + 2] = gray
            break
          case "sepia":
            data[i] = r * 0.393 + g * 0.769 + b * 0.189
            data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168
            data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131
            break
          case "invert":
            data[i] = 255 - r
            data[i + 1] = 255 - g
            data[i + 2] = 255 - b
            break
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Image Generator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="prompt">Image Prompt</Label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a description for the image"
          />
          <Button onClick={generateImage} className="mt-2">
            Generate Image
          </Button>
        </div>
        <div>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border border-gray-300 w-full aspect-square"
          />
          <div className="flex space-x-2 mt-2">
            <Button
              variant={tool === "brush" ? "default" : "outline"}
              onClick={() => setTool("brush")}
            >
              <Paintbrush className="w-4 h-4 mr-2" />
              Brush
            </Button>
            <Button
              variant={tool === "eraser" ? "default" : "outline"}
              onClick={() => setTool("eraser")}
            >
              <Eraser className="w-4 h-4 mr-2" />
              Eraser
            </Button>
            <Button variant="outline" onClick={clearCanvas}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button variant="outline" onClick={downloadImage}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          <div className="mt-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="mt-2">
            <Label htmlFor="brushSize">Brush Size</Label>
            <Slider
              id="brushSize"
              min={1}
              max={50}
              step={1}
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
            />
          </div>
          <div className="mt-2">
            <Label htmlFor="filter">Filter</Label>
            <Select onValueChange={(value) => {
              setFilter(value)
              applyFilter(value)
            }}>
              <SelectTrigger id="filter">
                <SelectValue placeholder="Select a filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="grayscale">Grayscale</SelectItem>
                <SelectItem value="sepia">Sepia</SelectItem>
                <SelectItem value="invert">Invert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}