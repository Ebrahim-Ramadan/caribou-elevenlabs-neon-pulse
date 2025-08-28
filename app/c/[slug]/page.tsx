'use client'

import Message from '@/components/Message'
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
  const [messages, setMessages] = useState<any[]>([])
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)
  const loadConversation = () => {
    fetch(`/api/c?id=${slug}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.length > 0) {
          setMessages(
            res.map((i: any) => ({
              ...i,
              formatted: {
                text: i.content_transcript,
                transcript: i.content_transcript,
              },
            })),
          )
        }
      })
  }
  const conversation = useConversation({
    onError: (error: string) => { toast(error) },
    onConnect: () => { toast('Connected to ElevenLabs.') },
    onMessage: (props: { message: string; source: Role }) => {
      const { message, source } = props
      if (source === 'ai') setCurrentText(message)
      fetch('/api/c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: slug,
          item: {
            type: 'message',
            status: 'completed',
            object: 'realtime.item',
            id: 'item_' + Math.random(),
            role: source === 'ai' ? 'assistant' : 'user',
            content: [{ type: 'text', transcript: message }],
          },
        }),
      }).then(loadConversation)
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
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        <div className="flex flex-col items-center justify-center w-full h-full max-w-xl mx-auto px-4">
          <TextAnimation currentText={currentText} isAudioPlaying={conversation.isSpeaking} onStopListening={handleStopListening} onStartListening={handleStartListening} />
          {messages.length > 0 && (
            <button className="text-sm mt-4 underline bg-white/70 px-4 py-2 rounded shadow-lg hover:bg-white/90 transition" onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}>
              Show Transcript
            </button>
          )}
        </div>
        {isTranscriptOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-white/90 text-black p-6 rounded-2xl shadow-2xl max-w-[90vw] max-h-[90vh] overflow-y-auto backdrop-blur-xl border border-white/40">
              <div className="flex flex-row items-center justify-between mb-2">
                <span className="font-bold text-lg">Transcript</span>
                <button className="ml-4" onClick={() => setIsTranscriptOpen(false)}>
                  <X />
                </button>
              </div>
              <div className="border-t py-4 mt-2 flex flex-col gap-y-4">
                {messages.map((conversationItem) => (
                  <Message key={conversationItem.id} conversationItem={conversationItem} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
