'use client'

import TextAnimation from '@/components/TextAnimation'
import AnimatedBackground from '@/components/AnimatedBackground'
import { type Role, useConversation } from '@11labs/react'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { GitHub, X } from 'react-feather'
import { toast } from 'sonner'

export default function () {
  const { slug } = useParams()
  const [currentText, setCurrentText] = useState('')
  // Remove messages and transcript logic
  const conversation = useConversation({
    onError: (error: string) => { toast(error) },
    onConnect: () => { toast('Connected to ElevenLabs.') },
    onMessage: (props: { message: string; source: Role }) => {
      const { message, source } = props
      if (source === 'ai') setCurrentText(message)
    },
  })
  const connectConversation = useCallback(async () => {
    toast('Setting up ElevenLabs...')
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      const response = await fetch('/api/i', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.error) return toast(data.error)
      await conversation.startSession({ signedUrl: data.apiKey })
    } catch (error) {
      toast('Failed to set up ElevenLabs client :/')
    }
  }, [conversation])
  const disconnectConversation = useCallback(async () => {
    await conversation.endSession()
  }, [conversation])
  const handleStartListening = () => {
    if (conversation.status !== 'connected') connectConversation()
  }
  const handleStopListening = () => {
    if (conversation.status === 'connected') disconnectConversation()
  }
  useEffect(() => {
    return () => {
      disconnectConversation()
    }
  }, [slug])
  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center select-none">
      <AnimatedBackground />
      <div className="relative z-10 bg-blue-500/20 backdrop-blur-md flex flex-col items-center justify-center w-full h-full">
        <div className="flex flex-col  items-center justify-center w-full h-full max-w-xl mx-auto px-4">
          <TextAnimation currentText={currentText} isAudioPlaying={conversation.isSpeaking} onStopListening={handleStopListening} onStartListening={handleStartListening} />
        </div>
      </div>
    </div>
  )
}
