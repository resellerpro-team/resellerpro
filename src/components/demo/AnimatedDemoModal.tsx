'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  X, Copy, CheckCircle2, Package, Play, Pause, ArrowRight, MessageSquare,
  ClipboardCopy, Users, Phone, MapPin, ShoppingCart, Truck, TrendingUp,
  DollarSign, BarChart3, Award, Sparkles, Send, Clock, Download, FileSpreadsheet, FileText, AlertCircle, Plus,
  Volume2, VolumeX, SkipBack, SkipForward, RotateCcw, Video, Loader2
} from 'lucide-react'

interface DemoModalProps {
  open: boolean
  onClose: () => void
}

// Complete A-to-Z Feature Demo - 15 Scenes
const VIDEO_SCENES = [
  { id: 1, name: 'WhatsApp Order', duration: 3500 },
  { id: 2, name: 'Send Format', duration: 3000 },
  { id: 3, name: 'Customer Response', duration: 3000 },
  { id: 4, name: 'Smart Paste Manual', duration: 4500 },
  { id: 5, name: 'Smart Paste Magic', duration: 4000 },
  { id: 6, name: 'Create Order + Export', duration: 5000 },
  { id: 7, name: 'Dashboard Overview', duration: 4500 },
  { id: 8, name: 'Update Order Status', duration: 4500 },
  { id: 9, name: 'Ship with Tracking', duration: 3500 },
  { id: 10, name: 'WhatsApp Update', duration: 3000 },
  { id: 11, name: 'Analytics Charts', duration: 5000 },
  { id: 12, name: 'Export Everything', duration: 4000 },
  { id: 13, name: 'Revenue Insights', duration: 3500 },
  { id: 14, name: 'All Modules', duration: 4000 },
  { id: 15, name: 'Final CTA', duration: 4000 },
]

const ADDRESS_FORMAT = `***********************
Name              :-

Full Address   :-

House name       :-

Landmark        :- 

City                 :- 

District             :-  

State                :- 

Pin code           :- 

Phone no         :-
***********************`

export function AnimatedDemoModal({ open, onClose }: DemoModalProps) {
  const totalScenes = VIDEO_SCENES.length
  const [currentScene, setCurrentScene] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const contentRef = useRef<HTMLDivElement>(null)
  const currentSceneDuration = VIDEO_SCENES[currentScene]?.duration || 4000

  // Initialize audio
  useEffect(() => {
    const audio = new Audio('/resellerpro-demo-audio.mp3')
    audio.loop = true
    audio.volume = 0.3
    setAudioElement(audio)

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Handle audio playback based on isPlaying state
  useEffect(() => {
    if (audioElement) {
      if (isPlaying && open) {
        audioElement.play().catch(() => {
          // Auto-play might be blocked by browser, user will need to interact
        })
      } else {
        audioElement.pause()
      }
    }
  }, [isPlaying, open, audioElement])

  // Video auto-play
  useEffect(() => {
    if (!open || !isPlaying) {
      setProgress(0)
      return
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (currentSceneDuration / 50))
        
        if (newProgress >= 100) {
          if (currentScene < totalScenes - 1) {
            setCurrentScene(currentScene + 1)
            return 0
          } else {
            setIsPlaying(false)
            return 100
          }
        }
        return newProgress
      })
    }, 50)

    return () => clearInterval(progressInterval)
  }, [open, isPlaying, currentScene, currentSceneDuration, totalScenes])

  useEffect(() => {
    if (open) {
      setCurrentScene(0)
      setProgress(0)
      setIsPlaying(true)
    }
  }, [open])

  const restart = () => {
    setCurrentScene(0)
    setProgress(0)
    setIsPlaying(true)
  }

  const goToPreviousScene = () => {
    if (currentScene > 0) {
      setCurrentScene(currentScene - 1)
      setProgress(0)
    }
  }

  const goToNextScene = () => {
    if (currentScene < totalScenes - 1) {
      setCurrentScene(currentScene + 1)
      setProgress(0)
    }
  }

  const toggleMute = () => {
    if (audioElement) {
      audioElement.muted = !audioElement.muted
      setIsMuted(!isMuted)
    }
  }

  const seekToScene = (sceneIndex: number) => {
    setCurrentScene(sceneIndex)
    setProgress(0)
  }

  // Format time display
  const formatTime = (sceneIdx: number, prog: number) => {
    const elapsedScenes = sceneIdx
    const currentSceneTime = (prog / 100) * (VIDEO_SCENES[sceneIdx]?.duration || 4000) / 1000
    const totalElapsed = VIDEO_SCENES.slice(0, sceneIdx).reduce((acc, s) => acc + s.duration, 0) / 1000 + currentSceneTime
    const totalDuration = VIDEO_SCENES.reduce((acc, s) => acc + s.duration, 0) / 1000
    
    const formatSecs = (secs: number) => {
      const m = Math.floor(secs / 60)
      const s = Math.floor(secs % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    }
    
    return `${formatSecs(totalElapsed)} / ${formatSecs(totalDuration)}`
  }

  // Start recording the demo
  const startRecording = useCallback(async () => {
    try {
      setRecordingStatus('recording')
      recordedChunksRef.current = []

      // Request screen capture with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      })

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
      
      const mediaRecorder = new MediaRecorder(displayStream, {
        mimeType,
        videoBitsPerSecond: 5000000
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        setRecordingStatus('processing')
        
        // Create blob and download
        const blob = new Blob(recordedChunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ResellerPro-Demo-${new Date().toISOString().split('T')[0]}.webm`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        // Stop all tracks
        displayStream.getTracks().forEach(track => track.stop())
        
        setRecordingStatus('idle')
        setIsRecording(false)
      }

      // Handle stream end (user stops sharing)
      displayStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop()
        }
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)

      // Auto-start playing the demo from beginning
      setCurrentScene(0)
      setProgress(0)
      setIsPlaying(true)

    } catch (error) {
      console.error('Recording failed:', error)
      setRecordingStatus('idle')
      setIsRecording(false)
      alert('Recording failed. Please make sure you select the correct browser tab when prompted.')
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  // Auto-stop recording when demo ends
  useEffect(() => {
    if (isRecording && currentScene === totalScenes - 1 && progress >= 99) {
      setTimeout(() => {
        stopRecording()
      }, 1000)
    }
  }, [isRecording, currentScene, progress, totalScenes, stopRecording])

  const overallProgress = ((currentScene + (progress / 100)) / totalScenes) * 100

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-full sm:max-w-7xl h-[96vh] sm:h-[92vh] p-0 overflow-hidden bg-black/95 border-none shadow-2xl">
        <div className="relative h-full flex flex-col">
          
          {/* Close Button - Highly Visible */}
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 p-2 sm:p-2.5 rounded-full bg-white hover:bg-gray-100 transition-all shadow-lg"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
          </button>

          {/* Video Content */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center p-2 sm:p-6 md:p-10"
              >
                {currentScene === 0 && <Scene1WhatsAppOrder />}
                {currentScene === 1 && <Scene2SendFormat />}
                {currentScene === 2 && <Scene3CustomerResponse />}
                {currentScene === 3 && <Scene4SmartPasteManual />}
                {currentScene === 4 && <Scene5SmartPaste />}
                {currentScene === 5 && <Scene6CreateOrderWithExport />}
                {currentScene === 6 && <Scene7DashboardOverview />}
                {currentScene === 7 && <Scene8UpdateOrderStatus />}
                {currentScene === 8 && <Scene9ShipWithTracking />}
                {currentScene === 9 && <Scene10WhatsAppUpdate />}
                {currentScene === 10 && <Scene11AnalyticsCharts />}
                {currentScene === 11 && <Scene12ExportEverything />}
                {currentScene === 12 && <Scene13RevenueInsights />}
                {currentScene === 13 && <Scene14AllModules />}
                {currentScene === 14 && <Scene15FinalCTA onClose={onClose} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Professional Video Player Controls */}
          <motion.div 
            initial={{ opacity: 0.3 }}
            whileHover={{ opacity: 1 }}
            className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-10 pb-3 px-3 sm:px-6"
          >
            {/* Progress Bar - Seekable */}
            <div className="mb-2 sm:mb-3 group">
              <div className="relative">
                {/* Scene markers */}
                <div className="absolute inset-0 flex">
                  {VIDEO_SCENES.map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 border-r border-white/20 last:border-r-0 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => seekToScene(i)}
                    />
                  ))}
                </div>
                {/* Progress track */}
                <div className="h-1.5 sm:h-2 bg-white/30 rounded-full overflow-hidden cursor-pointer group-hover:h-2 sm:group-hover:h-3 transition-all">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-blue-400 relative" 
                    animate={{ width: `${overallProgress}%` }} 
                    transition={{ duration: 0.1 }}
                  >
                    {/* Scrubber handle */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>
              </div>
            </div>
            
            {/* Controls Row */}
            <div className="flex items-center justify-between text-white">
              {/* Left: Playback Controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Previous */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={goToPreviousScene}
                  disabled={currentScene === 0}
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>

                {/* Play/Pause */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className="h-9 w-9 sm:h-12 sm:w-12 p-0 text-white hover:bg-white/20 rounded-full bg-white/10"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
                  )}
                </Button>

                {/* Next */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={goToNextScene}
                  disabled={currentScene === totalScenes - 1}
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>

                {/* Volume */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={toggleMute}
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>

                {/* Time Display */}
                <span className="text-[10px] sm:text-xs font-mono ml-1 sm:ml-2 opacity-80">
                  {formatTime(currentScene, progress)}
                </span>
              </div>

              {/* Center: Scene Info */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs bg-white/20 px-2 py-1 rounded">
                  {currentScene + 1} / {totalScenes}
                </span>
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {VIDEO_SCENES[currentScene]?.name}
                </span>
              </div>

              {/* Right: Extra Controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Download/Record Button */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={recordingStatus === 'processing'}
                  className={`h-8 sm:h-10 px-2 sm:px-3 text-white hover:bg-white/20 gap-1.5 ${
                    isRecording ? 'bg-red-500/80 hover:bg-red-500' : ''
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Record & Download Video'}
                >
                  {recordingStatus === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline text-xs">Processing...</span>
                    </>
                  ) : isRecording ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="hidden sm:inline text-xs">Stop</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span className="hidden sm:inline text-xs">Record</span>
                    </>
                  )}
                </Button>

                {/* Restart */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={restart}
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-white hover:bg-white/20"
                  title="Restart"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Scene Name */}
            <div className="sm:hidden text-center mt-2">
              <span className="text-[10px] text-white/70">
                Step {currentScene + 1}: {VIDEO_SCENES[currentScene]?.name}
              </span>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// SCENE 1: Initial WhatsApp Order
function Scene1WhatsAppOrder() {
  return (
    <div className="w-full max-w-5xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 sm:mb-3 bg-primary text-primary-foreground text-[9px] sm:text-sm px-1.5 py-0">Step 1</Badge>
        <h2 className="text-sm sm:text-2xl md:text-4xl font-bold text-foreground mb-0.5 sm:mb-2">
          <span className="sm:hidden">📱 WhatsApp Inquiry</span>
          <span className="hidden sm:inline">📱 Customer Sends Product Inquiry</span>
        </h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">
          <span className="sm:hidden">Real conversation</span>
          <span className="hidden sm:inline">Real WhatsApp conversation</span>
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[#075E54] rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-[#075E54] p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">RK</div>
            <div>
              <div className="text-white font-semibold text-sm">Rajesh Kumar</div>
              <div className="text-xs text-green-200">online</div>
            </div>
          </div>
          <div className="bg-[#E5DDD5] p-4 min-h-[300px]">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="bg-white rounded-xl rounded-tl-sm p-3 shadow-lg max-w-[90%]">
              <p className="text-sm mb-2">Hi! I want to order this product 📱</p>
              <div className="bg-slate-100 rounded p-2 mb-2">
                <div className="text-xs font-semibold">Wireless Headphones - Black</div>
                <div className="text-xs text-slate-600">Qty: 2 pcs</div>
              </div>
              <div className="text-xs text-slate-400 text-right">10:23 AM</div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-col justify-center">
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />The Problem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-destructive text-lg">😰</span>
                <div>
                  <div className="font-semibold">Old Way</div>
                  <div className="text-muted-foreground text-xs">Ask details one by one → Wait forever → Forget info!</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary text-lg">⚡</span>
                <div>
                  <div className="font-semibold text-primary">ResellerPro Way</div>
                  <div className="text-muted-foreground text-xs">Send format → Get details → Smart paste → Done!</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// SCENE 2: Send Address Format
function Scene2SendFormat() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setCopied(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full max-w-5xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 sm:mb-3 bg-primary text-primary-foreground text-[9px] sm:text-sm py-0">Step 2</Badge>
        <h2 className="text-sm sm:text-2xl md:text-4xl font-bold text-foreground mb-0.5 sm:mb-2">📋 Send Professional Format</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">
          <span className="sm:hidden">One-click copy & send</span>
          <span className="hidden sm:inline">One-click copy & send to customer</span>
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-2 sm:gap-6">
        <Card className="border-none sm:border shadow-none sm:shadow-sm">
          <CardHeader className="p-2 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-lg">Address Format</CardTitle>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
                <Button size="sm" variant={copied ? "default" : "outline"} className="h-6 text-[10px] sm:h-9 sm:text-sm gap-1">
                  {copied ? <><CheckCircle2 className="w-2.5 h-2.5" /> Copied!</> : <><Copy className="w-2.5 h-2.5" /> Copy</>}
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
            <div className="bg-secondary rounded p-2 font-mono text-[9px] sm:text-xs whitespace-pre-wrap leading-tight sm:leading-relaxed">
              <span className="sm:hidden">{ADDRESS_FORMAT.substring(0, 150)}...</span>
              <span className="hidden sm:block">{ADDRESS_FORMAT}</span>
            </div>
          </CardContent>
        </Card>

        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-[#075E54] rounded-lg overflow-hidden shadow-xl sm:rounded-xl">
          <div className="bg-[#075E54] p-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-[10px]">RK</div>
            <div className="text-white font-semibold text-[11px] sm:text-sm">Rajesh Kumar</div>
          </div>
          <div className="bg-[#E5DDD5] p-2 min-h-[120px] sm:min-h-[300px]">
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="bg-[#DCF8C6] rounded-lg rounded-tr-sm p-2 shadow shadow-black/10 ml-auto max-w-[85%]">
              <p className="text-[10px] sm:text-xs mb-1">Please send your address in this format:</p>
              <div className="bg-white/50 rounded p-1 font-mono text-[8px] overflow-hidden leading-tight">
                {ADDRESS_FORMAT.substring(0, 80)}...
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// SCENE 3: Customer Responds with Filled Format
function Scene3CustomerResponse() {
  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 bg-primary text-primary-foreground text-[9px] sm:text-sm py-0">Step 3</Badge>
        <h2 className="text-sm sm:text-2xl md:text-4xl font-bold text-foreground mb-0.5 sm:mb-2">✍️ Customer Fills & Sends</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">Perfect formatted response!</p>
      </motion.div>

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-[#075E54] rounded-lg overflow-hidden shadow-xl max-w-2xl mx-auto sm:rounded-xl">
        <div className="bg-[#075E54] p-2 flex items-center gap-2 sm:p-3 sm:gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-[9px] sm:w-10 sm:h-10 sm:text-sm">RK</div>
          <div>
            <div className="text-white font-semibold text-[11px] sm:text-sm">Rajesh Kumar</div>
            <div className="text-[10px] text-green-200 sm:text-xs">typing...</div>
          </div>
        </div>
        <div className="bg-[#E5DDD5] p-2 min-h-[200px] sm:min-h-[400px] sm:p-4">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="bg-white rounded-lg rounded-tl-sm p-2 shadow-sm max-w-[95%] sm:p-4">
            <div className="sm:hidden">
              <pre className="font-mono text-[8px] whitespace-pre-wrap leading-tight">{`Name: Rajesh Kumar
Address: Flat 301, Ocean View 
Landmark: Station Road
City: Mumbai
PIN: 400063
Phone: 9876543210`}</pre>
            </div>
            <div className="hidden sm:block">
              <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">{`***********************
Name              :- Rajesh Kumar

Full Address   :- Flat 301, Ocean View 
                   Apartments, Link Road

House name       :- Ocean View Apartments

Landmark        :- Near Goregaon Station

City                 :- Mumbai

District             :- Mumbai  

State                :- Maharashtra

Pin code           :- 400063

Phone no         :- 9876543210
***********************`}</pre>
            </div>
            <div className="text-[8px] text-slate-400 mt-1 text-right sm:text-xs sm:mt-3">10:28 AM</div>
          </motion.div>

          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: "spring" }} className="mt-2 flex justify-center sm:mt-3">
            <div className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full flex items-center gap-1.5 sm:px-4 sm:py-2">
              <ClipboardCopy className="w-3 h-3 text-green-600 sm:w-4 sm:h-4" />
              <span className="text-[10px] font-semibold text-green-700 sm:text-xs">Ready to paste!</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// SCENE 4: Smart Paste Manual - Visual Copy-Paste Demo
function Scene4SmartPasteManual() {
  return (
    <div className="w-full max-w-5xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 sm:mb-3 bg-primary text-primary-foreground text-[9px] sm:text-sm py-0">Step 4</Badge>
        <h2 className="text-sm sm:text-2xl md:text-4xl font-bold text-foreground mb-0.5 sm:mb-2">📋 How Smart Paste Works</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">See it in action - copy → paste → auto-fill</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-2 sm:gap-6">
        {/* Left: WhatsApp mock */}
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="relative bg-[#075E54] rounded-lg overflow-hidden shadow-lg sm:rounded-xl">
            <div className="bg-[#075E54] p-2 flex items-center gap-2 sm:p-3 sm:gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-[9px] sm:w-10 sm:h-10 sm:text-sm">RK</div>
              <div className="text-white font-semibold text-[11px] sm:text-sm">Rajesh Kumar</div>
            </div>
            <div className="bg-[#E5DDD5] p-2 min-h-[140px] sm:min-h-[300px] relative sm:p-4">
              <div className="bg-white rounded-lg rounded-tl-sm p-2 shadow-sm max-w-[85%] sm:p-3">
                <div className="sm:hidden">
                  <pre className="font-mono text-[8px] whitespace-pre-wrap leading-tight">{`Name: Rajesh Kumar
PIN: 400063
Address: Flat 301, 
Mumbai`}</pre>
                </div>
                <div className="hidden sm:block">
                  <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">{`Name: Rajesh Kumar
Phone: 9876543210
Address: Flat 301
City: Mumbai
PIN: 400063`}</pre>
                </div>
                <div className="text-[8px] text-slate-400 mt-1 text-right sm:text-xs sm:mt-2">10:28 AM</div>
              </div>

              {/* Animated "Copying" overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }}
                transition={{ delay: 1.5, duration: 2, times: [0, 0.2, 0.8, 1] }}
                className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center"
              >
                <div className="bg-primary text-white px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-lg sm:px-6 sm:py-3 sm:rounded-xl sm:text-base sm:gap-2">
                  <Copy className="w-3 h-3 sm:w-5 sm:h-5" />
                  Copying...
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Right: Smart Paste Dialog */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card className="overflow-hidden border-none sm:border shadow-none sm:shadow-lg sm:border-2 sm:border-primary/20">
            <CardHeader className="bg-muted/30 p-2 sm:p-4 sm:border-b">
              <div className="flex items-center gap-1.5 mb-0.5 sm:mb-2">
                <Sparkles className="w-3.5 h-3.5 text-primary sm:w-5 sm:h-5" />
                <CardTitle className="text-xs sm:text-lg">Smart Paste from WhatsApp</CardTitle>
              </div>
              <p className="text-[9px] sm:text-xs text-muted-foreground leading-tight">Copy a customer message and paste here to auto-fill the form.</p>
            </CardHeader>

            <CardContent className="p-2 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-semibold sm:text-sm">Customer Message</Label>
                <Button variant="ghost" size="sm" className="text-primary gap-0.5 text-[9px] h-6 px-1 sm:text-xs sm:h-7 sm:gap-1">
                  <ClipboardCopy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Auto-Paste
                </Button>
              </div>

              {/* Textarea with paste animation */}
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  className="min-h-[80px] sm:min-h-[150px] w-full rounded-md border border-primary/50 bg-primary/5 p-2 text-[9px] sm:text-xs font-mono sm:border-2 sm:border-primary sm:p-3"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 }}
                  >
                    <span className="sm:hidden">{`Name: Rajesh Kumar
Phone: 9876543210
Address: Mumbai`}</span>
                    <span className="hidden sm:inline">{`Name: Rajesh Kumar
Phone: 9876543210
Address: Flat 301
City: Mumbai
PIN: 400063`}</span>
                  </motion.div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
                  transition={{ delay: 2.5, duration: 0.5 }}
                  className="absolute top-1 right-1 bg-green-500 text-white px-1.5 py-0.5 rounded text-[8px] font-bold shadow-md sm:top-2 sm:right-2 sm:px-3 sm:py-1 sm:text-xs shadow-lg"
                >
                  Pasted!
                </motion.div>
              </div>

              <Button className="w-full h-8 text-[11px] font-semibold gap-1.5 sm:h-10 sm:text-sm sm:gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                Extract Data
              </Button>

              {/* Step indicators */}
              <div className="grid grid-cols-3 gap-1 pt-2 border-t sm:gap-2 sm:pt-3">
                {[
                  { num: '1', label: 'Copy', delay: 1.5 },
                  { num: '2', label: 'Paste', delay: 2.5 },
                  { num: '3', label: 'Extract', delay: 3.5 },
                ].map((step) => (
                  <motion.div
                    key={step.num}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: step.delay }}
                    className="p-1 bg-primary/5 rounded text-center sm:p-2 sm:rounded-lg"
                  >
                    <div className="text-xs font-bold text-primary sm:text-lg">{step.num}</div>
                    <div className="text-[8px] text-muted-foreground sm:text-xs">{step.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// SCENE 5: Smart Paste - Field by Field Animation
function Scene5SmartPaste() {
  const fields = [
    { icon: Users, label: 'Full Name', value: 'Rajesh Kumar' },
    { icon: Phone, label: 'Phone Number', value: '9876543210' },
    { icon: MapPin, label: 'Full Address', value: 'Flat 301, Ocean View Apartments, Link Road' },
    { icon: MapPin, label: 'House/Building', value: 'Ocean View Apartments' },
    { icon: MapPin, label: 'Landmark', value: 'Near Goregaon Station' },
    { icon: MapPin, label: 'City', value: 'Mumbai' },
    { icon: MapPin, label: 'State', value: 'Maharashtra' },
    { icon: MapPin, label: 'PIN Code', value: '400063' },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-1 sm:mb-6">
        <Badge className="mb-1 sm:mb-3 bg-primary text-primary-foreground gap-1 text-[9px] sm:text-sm px-1.5 py-0 sm:py-1">
          <Sparkles className="w-2 h-2 sm:w-4 sm:h-4" /> Step 5
        </Badge>
        <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-foreground mb-0 sm:mb-2">✨ Smart Paste in Action!</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">Watch all fields fill automatically in seconds</p>
      </motion.div>

      <Card className="border-none sm:border-2 shadow-none sm:shadow-xl">
        <CardHeader className="bg-primary/5 py-1 px-2 sm:px-6 sm:py-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs sm:text-lg">Add New Customer</CardTitle>
            <Badge className="bg-primary text-primary-foreground gap-0.5 text-[9px] sm:text-xs px-1 py-0 sm:px-2 sm:py-1">
              <Copy className="w-2 h-2 sm:w-4 sm:h-4" /> Smart Paste Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-1 sm:p-6 space-y-1 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4">
            {fields.map((field, i) => {
              const Icon = field.icon
              return (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.05, type: "spring" }}
                >
                  <Label className="text-[9px] sm:text-xs flex items-center gap-1 mb-0 sm:mb-1.5">
                    <Icon className="w-2 h-2 sm:w-3 sm:h-3 text-muted-foreground" />
                    {field.label}
                  </Label>
                  <div className="relative">
                    <Input value={field.value} readOnly className="bg-green-50 dark:bg-green-950 border border-green-500 h-6 sm:h-10 text-[10px] sm:text-sm px-1.5 sm:px-3" />
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }} className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-2 h-2 sm:w-4 sm:h-4 text-green-600" />
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="grid grid-cols-3 gap-1 mt-1 pt-1 border-t sm:gap-6 sm:mt-4 sm:pt-6">
            <div className="text-center p-1 bg-primary/10 rounded sm:p-4 sm:rounded-xl">
              <div className="text-sm font-bold text-primary sm:text-2xl">8</div>
              <div className="text-[8px] text-muted-foreground uppercase sm:text-xs mt-0.5">Fields Filled</div>
            </div>
            <div className="text-center p-1 bg-green-500/10 rounded sm:p-4 sm:rounded-xl">
              <div className="text-sm font-bold text-green-600 sm:text-2xl">2s</div>
              <div className="text-[8px] text-muted-foreground uppercase sm:text-xs mt-0.5">Time Taken</div>
            </div>
            <div className="text-center p-1 bg-destructive/10 rounded sm:p-4 sm:rounded-xl">
              <div className="text-sm font-bold text-destructive line-through sm:text-2xl">2m</div>
              <div className="text-[8px] text-muted-foreground uppercase sm:text-xs mt-0.5">Manual Way</div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}

// SCENE 6: Create Order WITH Export Dropdown
function Scene6CreateOrderWithExport() {
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowExport(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 bg-primary text-primary-foreground text-[9px] sm:text-sm py-0">Step 6</Badge>
        <h2 className="text-sm sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 sm:mb-2">🛒 Create Order + Export</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">PDF & CSV exports</p>
      </motion.div>

      <div className="grid md:grid-cols-12 gap-2 sm:gap-4">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="md:col-span-8">
          <Card className="border-none sm:border shadow-none sm:shadow-sm">
            <CardHeader className="p-2 sm:p-6 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs sm:text-base">Order #ORD-048</CardTitle>
                <p className="text-[9px] text-muted-foreground mt-0.5 sm:text-xs">Rajesh Kumar</p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: showExport ? 1 : 0, scale: showExport ? 1 : 0 }}
                transition={{ delay: 3, type: "spring" }}
              >
                {/* Mobile version simple button */}
                <div className="sm:hidden">
                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5">
                    <Download className="w-3 h-3" /> Export
                  </Button>
                </div>
                {/* Desktop version full dropdown */}
                <div className="hidden sm:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[280px]">
                      <DropdownMenuItem className="flex-col items-start gap-1 py-3 cursor-pointer">
                        <div className="flex items-center gap-2 w-full">
                          <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Detailed CSV Export</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">
                          Full data: customer info, items, P&L, shipping
                        </p>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              <div className="p-2 bg-secondary border border-primary/20 rounded-lg sm:p-4 sm:border-2">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center sm:w-12 sm:h-12">
                    <Package className="w-4 h-4 text-primary sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[11px] sm:text-sm">Wireless Headphones - Black</h4>
                    <p className="text-[9px] text-muted-foreground sm:text-xs">Qty: 2 × ₹1,499</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary sm:text-xl">₹2,998</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="md:col-span-4">
          <Card className="border border-primary/30 shadow-none sm:border-2">
            <div className="hidden sm:block">
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
            </div>
            <CardContent className="p-2 sm:p-6 space-y-1.5 sm:space-y-3">
              <div className="flex justify-between text-[10px] sm:text-sm">
                <span>Subtotal</span>
                <span className="font-medium">₹2,998</span>
              </div>
              <div className="hidden sm:flex justify-between text-sm">
                <span>Shipping</span>
                <span className="font-medium">₹50</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-1.5 sm:text-lg sm:pt-3">
                <span>Total</span>
                <span className="text-primary">₹3,048</span>
              </div>
              <div className="p-1.5 bg-green-500/10 border border-green-500 rounded sm:p-3 sm:border-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-semibold text-green-700 sm:text-xs">Your Profit</span>
                  <span className="text-sm font-bold text-green-600 sm:text-2xl">₹1,048</span>
                </div>
                <div className="hidden sm:block text-center text-xs text-green-600 mt-1">52% margin!</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// SCENE 7: Dashboard Overview
function Scene7DashboardOverview() {
  return (
    <div className="w-full max-w-6xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 bg-primary text-primary-foreground text-[9px] sm:text-sm py-0">Step 7</Badge>
        <h2 className="text-sm sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 sm:mb-2">📊 Dashboard Overview</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground line-clamp-1">See pending orders, alerts, and quick actions</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-2 sm:gap-4">
        {/* Stats Cards */}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }}>
          <Card className="border border-blue-500/20 shadow-none sm:border-2 sm:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between p-2 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-[10px] font-medium text-muted-foreground sm:text-xs">Today's Revenue</CardTitle>
              <div className="p-1 rounded bg-blue-500/10 sm:p-2">
                <DollarSign className="h-3 w-3 text-blue-600 sm:h-4 sm:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
              <div className="text-lg font-bold sm:text-3xl">₹15,240</div>
              <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                <TrendingUp className="h-2 w-2 text-green-500 sm:h-3 sm:w-3" />
                <span className="text-[9px] text-green-500 font-medium sm:text-xs">+12%</span>
                <span className="text-[9px] text-muted-foreground sm:text-xs">from yesterday</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts Card */}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }}>
          <Card className="border-none sm:border-2 shadow-none sm:shadow-md">
            <CardContent className="p-2 sm:p-6 space-y-1.5 sm:space-y-3">
              <div className="flex items-start gap-2 p-1.5 rounded border bg-yellow-500/5 border-yellow-500/20 sm:p-3 sm:gap-3">
                <AlertCircle className="h-3.5 w-3.5 text-yellow-500 sm:h-5 sm:w-5" />
                <div className="flex-1">
                  <p className="text-[10px] font-medium sm:text-sm">3 orders pending</p>
                  <div className="hidden sm:block">
                    <Button variant="link" size="sm" className="h-auto p-0 text-yellow-600">View Orders →</Button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-1.5 rounded border bg-blue-500/5 border-blue-500/20 sm:p-3 sm:gap-3">
                <AlertCircle className="h-3.5 w-3.5 text-blue-500 sm:h-5 sm:w-5" />
                <div className="flex-1">
                  <p className="text-[10px] font-medium sm:text-sm">Stock low!</p>
                  <div className="hidden sm:block">
                    <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">Manage Stock →</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="mt-2 sm:mt-4">
        {/* Mobile View */}
        <div className="sm:hidden grid grid-cols-2 gap-1.5">
          {['New Order', 'New Product'].map((action) => (
            <Button key={action} variant="outline" className="h-7 text-[10px] px-2 gap-1">
              <Plus className="w-3 h-3" /> {action}
            </Button>
          ))}
        </div>
        {/* Desktop View */}
        <div className="hidden sm:block">
          <Card>
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-3">
                {['New Enquiry', 'New Order', 'New Product', 'New Customer'].map((action) => (
                  <Button key={action} variant="outline" className="justify-start gap-2 h-auto py-3">
                    <Plus className="w-4 h-4" />
                    <span className="text-xs">{action}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

// SCENE 8: Update Order Status
function Scene8UpdateOrderStatus() {
  const [status, setStatus] = useState('pending')

  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus('processing'), 1500),
      setTimeout(() => setStatus('shipped'), 3000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-500', done: true },
    { value: 'processing', label: 'Processing', color: 'bg-blue-500', done: status !== 'pending' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-500', done: status === 'shipped' || status === 'delivered' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-500', done: status === 'delivered' },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 bg-primary text-primary-foreground text-[9px] sm:text-sm py-0">Step 8</Badge>
        <h2 className="text-sm sm:text-2xl md:text-4xl font-bold text-foreground mb-0.5 sm:mb-2">📦 Update Order Status</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">Click & update - that simple!</p>
      </motion.div>

      <Card className="border-none sm:border shadow-none sm:shadow-sm">
        <CardHeader className="bg-primary/5 p-2 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs sm:text-lg">Order #ORD-048</CardTitle>
              <p className="text-[9px] text-muted-foreground sm:text-sm mt-0.5">Rajesh Kumar • ₹3,048</p>
            </div>
            
            {/* Mobile simplified status */}
            <div className="sm:hidden bg-white border rounded px-1.5 py-0.5 text-[10px] font-medium">
              {status}
            </div>

            {/* Desktop dropdown select */}
            <div className="hidden sm:block">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-2 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {statuses.map((s, i) => (
              <motion.div
                key={s.value}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ 
                  scale: s.done ? 1 : 0.9, 
                  opacity: s.done ? 1 : 0.5,
                  borderColor: s.done ? 'hsl(var(--primary))' : 'transparent'
                }}
                transition={{ delay: i * 0.2 }}
                className={`p-2 rounded-lg text-center border ${s.done ? 'bg-primary/5 border-primary shadow-sm' : 'bg-secondary border-border'} sm:p-4 sm:rounded-xl sm:border-2`}
              >
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${s.color} sm:w-3 sm:h-3 sm:mb-2`} />
                <div className={`font-bold text-[9px] sm:text-sm ${s.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.label}
                </div>
                <div className="hidden sm:block">
                  {s.done && <CheckCircle2 className="w-4 h-4 mx-auto mt-2 text-green-600" />}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

//  SCENE 9: Ship with Tracking
function Scene9ShipWithTracking() {
  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 bg-primary text-primary-foreground text-[9px] sm:text-sm py-0">Step 9</Badge>
        <h2 className="text-sm sm:text-2xl md:text-4xl font-bold text-foreground mb-0.5 sm:mb-2">🚚 Mark as Shipped</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">Add tracking details auto-magically!</p>
      </motion.div>

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }}>
        <Card className="border border-purple-500/30 shadow-none sm:border-2 sm:shadow-lg">
          <CardHeader className="bg-purple-50 dark:bg-purple-950/20 p-2 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Truck className="w-4 h-4 text-purple-600 sm:w-8 sm:h-8" />
              <div>
                <CardTitle className="text-sm sm:text-xl text-purple-900 dark:text-purple-100">Shipping Details</CardTitle>
                <div className="hidden sm:block">
                  <p className="text-xs text-purple-700 dark:text-purple-300">Out for delivery</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 space-y-2 sm:space-y-6">
            <div className="grid grid-cols-2 gap-2 sm:gap-6">
              <div className="p-1.5 bg-secondary rounded sm:p-4 sm:rounded-xl">
                <Label className="text-[8px] text-muted-foreground sm:text-xs">Courier Partner</Label>
                <div className="font-bold text-xs sm:text-xl mt-0.5 sm:mt-1">Delhivery</div>
              </div>
              <div className="p-1.5 bg-secondary rounded sm:p-4 sm:rounded-xl">
                <Label className="text-[8px] text-muted-foreground sm:text-xs">Tracking ID</Label>
                <div className="font-bold font-mono text-[10px] sm:text-xl mt-0.5 sm:mt-1">DELH-9928</div>
              </div>
            </div>

            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded sm:p-4 sm:rounded-xl sm:border-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold sm:text-lg">Jan 28, 2026</span>
                <Badge className="bg-purple-500 text-[8px] px-1 sm:text-sm">Estimated Delivery</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// SCENE 10: WhatsApp Update
function Scene10WhatsAppUpdate() {
  return (
    <div className="w-full max-w-5xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 bg-primary text-primary-foreground text-[9px] sm:text-sm py-0">Step 10</Badge>
        <h2 className="text-sm sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 sm:mb-2">💬 Auto WhatsApp Updates</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">Customers get instant automated updates</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-2 sm:gap-8">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="border-none sm:border shadow-none sm:shadow-lg">
            <div className="hidden sm:block">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Message Templates</CardTitle>
              </CardHeader>
            </div>
            <CardContent className="p-1 sm:p-6 space-y-1 sm:space-y-3">
              {['Order Confirmed', 'Payment Pending', 'Shipped (Tracking)', 'Order Delivered'].map((t, i) => (
                <div key={t} className={`p-1.5 rounded flex items-center gap-1.5 border sm:border-2 sm:p-4 sm:gap-3 ${i === 2 ? 'bg-primary/5 border-primary sm:shadow-md' : 'bg-secondary border-border'}`}>
                  <Send className={`w-3 h-3 sm:w-5 sm:h-5 ${i === 2 ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-[10px] sm:text-sm ${i === 2 ? 'font-bold' : ''}`}>{t}</span>
                  {i === 2 && <Badge className="ml-auto hidden sm:flex">Selected</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-[#075E54] rounded-lg overflow-hidden shadow-xl sm:rounded-2xl sm:shadow-2xl">
          <div className="bg-[#075E54] p-2 flex items-center gap-2 sm:p-4 sm:gap-4">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-[9px] sm:w-11 sm:h-11 sm:text-base">RK</div>
            <div className="text-white font-semibold text-[11px] sm:text-base">Rajesh Kumar</div>
          </div>
          <div className="bg-[#E5DDD5] p-2 min-h-[140px] sm:min-h-[350px] sm:p-6">
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="bg-[#DCF8C6] rounded-lg rounded-tr-sm p-2 shadow-sm ml-auto max-w-[85%] sm:p-4 sm:rounded-xl sm:shadow-lg">
              <div className="sm:hidden">
                <p className="text-[9px] leading-tight">
                  <strong>Shipped!</strong> #ORD-048 🚚<br />
                  Tracking: DELH-9928<br />
                </p>
              </div>
              <div className="hidden sm:block text-xs leading-relaxed">
                Hi Rajesh!👋<br /><br />
                Your order <strong>#ORD-048</strong> is SHIPPED! 🚚<br /><br />
                <strong>Tracking:</strong> DELH-9928<br />
                <strong>Courier:</strong> Delhivery<br />
                <strong>Expected:</strong> Jan 28
              </div>
              <div className="text-[8px] text-slate-600 mt-1 text-right flex items-center justify-end gap-1 sm:text-xs sm:mt-3">
                3:45 PM <CheckCircle2 className="w-3 h-3 text-blue-500 sm:w-4 sm:h-4" /><CheckCircle2 className="w-3 h-3 text-blue-500 -ml-1 sm:w-4 sm:h-4 sm:-ml-2" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// SCENE 11: Analytics Charts with Real Data - Line Chart
function Scene11AnalyticsCharts() {
  // Realistic 30-day data matching the screenshot pattern
  const chartData = [
    { date: 'Dec 30', sales: 0, profit: 0 },
    { date: 'Jan 01', sales: 0, profit: 0 },
    { date: 'Jan 03', sales: 0, profit: 0 },
    { date: 'Jan 05', sales: 800, profit: 200 },
    { date: 'Jan 07', sales: 4200, profit: 800 },
    { date: 'Jan 09', sales: 1200, profit: 300 },
    { date: 'Jan 11', sales: 9200, profit: 2800 },
    { date: 'Jan 13', sales: 2400, profit: 600 },
    { date: 'Jan 15', sales: 1800, profit: 400 },
    { date: 'Jan 17', sales: 0, profit: 0 },
    { date: 'Jan 19', sales: 0, profit: 0 },
    { date: 'Jan 21', sales: 0, profit: 0 },
    { date: 'Jan 23', sales: 1200, profit: 300 },
    { date: 'Jan 26', sales: 0, profit: 0 },
  ]

  const maxValue = 10000

  // Create SVG path for the line chart
  const getLinePath = (dataKey: 'sales' | 'profit') => {
    const width = 100
    const height = 100
    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * width
      const y = height - (d[dataKey] / maxValue) * height
      return `${x},${y}`
    })
    return `M ${points.join(' L ')}`
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 bg-primary text-primary-foreground text-[9px] sm:text-sm py-0">Step 11</Badge>
        <h2 className="text-sm sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 sm:mb-2">📊 Analytics Dashboard</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">Track sales & profit with beautiful charts</p>
      </motion.div>

      <Card className="border-none sm:border-2 shadow-none sm:shadow-lg bg-white dark:bg-card">
        <CardHeader className="p-2 sm:p-6 pb-1">
          <CardTitle className="text-xs sm:text-lg font-bold">Sales & Profit Trend</CardTitle>
          <p className="text-[9px] sm:text-sm text-muted-foreground">Performance over last 30 days</p>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 pt-2">
          <div className="h-[160px] sm:h-[280px] w-full relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[7px] sm:text-xs text-muted-foreground pr-1 sm:pr-2">
              <span>₹10,000</span>
              <span>₹7,500</span>
              <span>₹5,000</span>
              <span>₹2,500</span>
              <span>₹0</span>
            </div>

            {/* Chart Area */}
            <div className="ml-8 sm:ml-14 h-full border-l border-b border-dashed border-border/50 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-dashed border-border/30 w-full" />
                ))}
              </div>

              {/* SVG Line Chart */}
              <svg 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none" 
                className="absolute inset-0 w-full h-full"
              >
                {/* Sales Line (Blue) */}
                <motion.path
                  d={getLinePath('sales')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                />
                {/* Sales Points */}
                {chartData.map((d, i) => (
                  <motion.circle
                    key={`sales-${i}`}
                    cx={(i / (chartData.length - 1)) * 100}
                    cy={100 - (d.sales / maxValue) * 100}
                    r="1.5"
                    fill="#3b82f6"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                  />
                ))}

                {/* Profit Line (Green) */}
                <motion.path
                  d={getLinePath('profit')}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                />
                {/* Profit Points */}
                {chartData.map((d, i) => (
                  <motion.circle
                    key={`profit-${i}`}
                    cx={(i / (chartData.length - 1)) * 100}
                    cy={100 - (d.profit / maxValue) * 100}
                    r="1.5"
                    fill="#22c55e"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + (i * 0.1) }}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="ml-8 sm:ml-14 flex justify-between text-[6px] sm:text-[10px] text-muted-foreground mt-1 sm:mt-2">
            <span>Dec 30</span>
            <span className="hidden sm:inline">Jan 05</span>
            <span>Jan 11</span>
            <span className="hidden sm:inline">Jan 17</span>
            <span>Jan 26</span>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-dashed">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500" />
              <span className="text-[9px] sm:text-sm font-medium">Sales</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
              <span className="text-[9px] sm:text-sm font-medium">Profit</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// SCENE 12: Export Everything
function Scene12ExportEverything() {
  const modules = [
    { name: 'Orders', icon: ShoppingCart, exports: ['CSV', 'PDF'] },
    { name: 'Customers', icon: Users, exports: ['CSV'] },
    { name: 'Products', icon: Package, exports: ['CSV'] },
    { name: 'Analytics', icon: BarChart3, exports: ['PDF', 'CSV'] },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 bg-primary text-primary-foreground text-[9px] sm:text-sm py-0">Step 12</Badge>
        <h2 className="text-sm sm:text-2xl md:text-4xl font-bold text-foreground mb-0.5 sm:mb-2">💾 Export Everything</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">PDF & CSV exports for all modules</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4">
        {modules.map((module, i) => {
          const Icon = module.icon
          return (
            <motion.div
              key={module.name}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + (i * 0.1), type: "spring" }}
            >
              <Card className="border border-primary/20 shadow-none sm:border-2 sm:hover:border-primary/50 transition-colors">
                <CardHeader className="p-2 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 rounded bg-primary/10 sm:p-2">
                        <Icon className="w-3 h-3 text-primary sm:w-5 sm:h-5" />
                      </div>
                      <CardTitle className="text-[10px] sm:text-lg">{module.name}</CardTitle>
                    </div>
                    {/* Desktop Dropdown */}
                    <div className="hidden sm:block">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {module.exports.includes('CSV') && (
                            <DropdownMenuItem>
                              <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                              Export CSV
                            </DropdownMenuItem>
                          )}
                          {module.exports.includes('PDF') && (
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2 text-red-600" />
                              Export PDF
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                {/* Desktop Content */}
                <div className="hidden sm:block">
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      {module.exports.map((exp) => (
                        <Badge key={exp} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// SCENE 13: Revenue Insights
function Scene13RevenueInsights() {
  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 bg-primary text-primary-foreground text-[9px] sm:text-sm py-0">Step 13</Badge>
        <h2 className="text-sm sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 sm:mb-2">💰 Revenue Insights</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">Milestones & smart alerts</p>
      </motion.div>

      <div className="space-y-2 sm:space-y-6">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 sm:border-2">
            <CardContent className="p-3 flex items-center gap-3 sm:p-8 sm:gap-6">
              <CheckCircle2 className="w-8 h-8 text-green-600 sm:w-16 sm:h-16" />
              <div>
                <h3 className="font-bold text-sm sm:text-xl text-green-900 dark:text-green-100">Congratulations!</h3>
                <p className="text-[10px] sm:text-base text-green-700 dark:text-green-200">You crossed the ₹50,000 milestone this month!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
          <Card className="border-none sm:border-2 shadow-none sm:shadow-lg">
            <div className="hidden sm:block">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Monthly Performance</CardTitle>
              </CardHeader>
            </div>
            <CardContent className="p-3 sm:p-8 space-y-2 sm:space-y-4">
              <div className="flex justify-between text-[10px] sm:text-sm">
                <span className="sm:text-muted-foreground">Current Revenue</span>
                <span className="font-bold sm:text-lg">₹52,840</span>
              </div>
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden sm:h-4">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: '70%' }} 
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-green-500" 
                />
              </div>
              <p className="text-[9px] text-muted-foreground text-center sm:text-sm">70% of monthly target achieved</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// SCENE 14: All Modules Showcase
function Scene14AllModules() {
  const modules = [
    { name: 'Dashboard', desc: 'Overview & alerts', icon: '📊', color: 'bg-blue-500/10 border-blue-500/20' },
    { name: 'Orders', desc: 'Manage & track', icon: '🛒', color: 'bg-purple-500/10 border-purple-500/20' },
    { name: 'Customers', desc: 'Smart Paste', icon: '👥', color: 'bg-green-500/10 border-green-500/20' },
    { name: 'Products', desc: 'Inventory control', icon: '📦', color: 'bg-orange-500/10 border-orange-500/20' },
    { name: 'Analytics', desc: 'Charts & insights', icon: '📈', color: 'bg-pink-500/10 border-pink-500/20' },
    { name: 'Enquiries', desc: 'Lead management', icon: '📝', color: 'bg-indigo-500/10 border-indigo-500/20' },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto px-1 sm:px-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-2 sm:mb-6">
        <Badge className="mb-1 sm:mb-3 bg-primary text-primary-foreground text-[9px] sm:text-sm px-1.5 py-0">Step 14</Badge>
        <h2 className="text-sm sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 sm:mb-2">🎯 All-in-One Solution</h2>
        <p className="text-[10px] sm:text-base text-muted-foreground">Complete business management dashboard</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-6">
        {modules.map((module, i) => (
          <motion.div
            key={module.name}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + (i * 0.05), type: "spring" }}
          >
            <Card className={`border sm:border-2 ${module.color} hover:scale-105 transition-transform cursor-pointer shadow-sm`}>
              <CardContent className="p-2 sm:p-6 text-center">
                <div className="text-xl sm:text-4xl mb-1 sm:mb-3">{module.icon}</div>
                <h3 className="font-bold text-[10px] sm:text-lg mb-0.5 sm:mb-1">{module.name}</h3>
                <p className="text-[8px] sm:text-xs text-muted-foreground">{module.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }} className="mt-4 sm:mt-8 text-center px-4">
        <p className="text-[9px] sm:text-sm text-muted-foreground">+ PDF/CSV exports, WhatsApp automation, profit tracking & deep analytics!</p>
      </motion.div>
    </div>
  )
}

// SCENE 15: Final CTA
function Scene15FinalCTA({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full max-w-4xl mx-auto text-center px-4">
      <motion.div 
        initial={{ scale: 0, rotate: -45 }} 
        animate={{ scale: 1, rotate: 0 }} 
        transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.3 }}
        className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 mt-2 sm:mt-6"
      >
        <Image 
          src="/resellerpro-logo-removebg-preview.png" 
          alt="ResellerPro Logo" 
          width={96} 
          height={96} 
          className="w-full h-full object-contain"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div className="hidden sm:block">
          <Badge className="mb-3 bg-primary text-primary-foreground px-6 py-2 text-base">Complete Business Solution</Badge>
        </div>
        <h1 className="text-xl sm:text-5xl md:text-6xl font-black text-foreground mb-1 sm:mb-3 tracking-tight">
          <span className="sm:hidden">Grow Your Business 3x!</span>
          <span className="hidden sm:block">Grow Your Reselling<br />Business 3x Faster! 🚀</span>
        </h1>
        <p className="text-[11px] sm:text-xl md:text-2xl text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto">
          Join 1,000+ resellers managed by <span className="text-primary font-bold">ResellerPro</span>
        </p>
      </motion.div>

      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }} className="space-y-4 sm:space-y-8">
        {/* Mobile simplified benefits */}
        <div className="sm:hidden grid grid-cols-2 gap-2">
          {[
            { label: '10x Faster', desc: 'Processing' },
            { label: '100% Correct', desc: 'Automation' }
          ].map((benefit) => (
            <Card key={benefit.label} className="border border-primary/10 shadow-none">
              <CardContent className="p-2 text-center">
                <div className="font-bold text-[10px]">{benefit.label}</div>
                <div className="text-[8px] text-muted-foreground">{benefit.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop full benefits */}
        <div className="hidden sm:grid grid-cols-4 gap-3">
          {[
            { icon: Clock, label: '10x Faster', desc: 'Order processing' },
            { icon: CheckCircle2, label: '100% Accurate', desc: 'Smart Paste' },
            { icon: TrendingUp, label: '2-3x Growth', desc: 'Avg increase' },
            { icon: Award, label: 'Professional', desc: 'Built for scale' }
          ].map((benefit, i) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.label}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.3 + (i * 0.1), type: "spring" }}
              >
                <Card className="border-2 border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 text-center">
                    <Icon className="w-10 h-10 mx-auto mb-2 text-primary" />
                    <div className="font-bold text-sm mb-1">{benefit.label}</div>
                    <div className="text-xs text-muted-foreground">{benefit.desc}</div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 }}>
          <Link href="/signup">
            <Button className="text-sm px-6 py-4 sm:text-2xl sm:px-12 sm:py-8 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all font-black rounded-lg sm:rounded-2xl group h-auto">
              Start Free Trial Now 
              <motion.div 
                animate={{ x: [0, 5, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="inline-block ml-1.5 sm:ml-3"
              >
                <ArrowRight className="w-4 h-4 sm:w-8 sm:h-8" />
              </motion.div>
            </Button>
          </Link>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:gap-6 sm:text-xs">
          <div className="flex items-center gap-1 sm:gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-500 sm:w-4 sm:h-4" /> No Credit Card
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-500 sm:w-4 sm:h-4" /> 10 Free Orders
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <CheckCircle2 className="w-3 h-3 text-green-500 sm:w-4 sm:h-4" /> Cancel Anytime
          </div>
        </div>

        <div className="hidden sm:block">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-sm text-muted-foreground pt-4 border-t">
            Trusted by resellers across India. Start your free trial today! 🇮🇳
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
