import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QRCodeGeneratorProps {
  value: string
  size?: number
  title?: string
  downloadFileName?: string
}

export function QRCodeGenerator({ 
  value, 
  size = 256, 
  title,
  downloadFileName = 'qrcode.png' 
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }, (error) => {
        if (error) console.error('QR Code generation failed:', error)
      })
    }
  }, [value, size])

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast({
        title: "Copied to clipboard",
        description: "The registration URL has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = downloadFileName
      link.href = canvasRef.current.toDataURL()
      link.click()
      
      toast({
        title: "QR Code downloaded",
        description: "The QR code has been saved to your downloads.",
      })
    }
  }

  if (!value) {
    return (
      <Card className="w-fit mx-auto">
        <CardContent className="p-6">
          <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">No data to display</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-fit mx-auto"
    >
      <Card>
        <CardContent className="p-6">
          {title && (
            <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
          )}
          
          <div className="flex flex-col items-center space-y-4">
            <canvas 
              ref={canvasRef} 
              className="border rounded-lg shadow-sm"
            />
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy URL</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 text-center max-w-xs">
              <p>Scan this QR code to register</p>
              <p className="mt-1 break-all font-mono bg-gray-50 p-2 rounded">
                {value}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}