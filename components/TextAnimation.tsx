'use client'

import { useTypingEffect } from '@/components/useTypingEffect'
import menu from '../public/caribou_menu_items.json'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

type AIState = 'idle' | 'listening' | 'speaking'

interface Props {
  onStartListening?: () => void
  onStopListening?: () => void
  isAudioPlaying?: boolean
  currentText: string
}

// --- Price normalization logic ---
const arabicNumberMap: Record<string, string> = {
  "صفر": "0",
  "واحد": "1",
  "إثنان": "2", "اثنان": "2", "اثنين": "2", "إثنين": "2", "اثنتان": "2", "اثنتين": "2",
  "ثلاثة": "3", "ثلاثه": "3",
  "أربعة": "4", "اربعة": "4", "اربعه": "4",
  "خمسة": "5", "خمس": "5",
  "ستة": "6", "ست": "6",
  "سبعة": "7", "سبع": "7",
  "ثمانية": "8", "ثمانيه": "8", "ثمان": "8",
  "تسعة": "9", "تسع": "9",
  "عشرة": "10", "عشره": "10",
  "إحدى عشر": "11", "احدى عشر": "11",
  "إثنا عشر": "12", "اثنا عشر": "12",
  "فاصلة": ".", "فصله": ".",
  "و": "",
}

function parseArabicPrice(text: string): number | null {
  const match = text.match(/([\u0600-\u06FF\s]+)\s*دينار/)
  if (!match) return null
  const words = match[1].split(/\s+/).filter(Boolean)
  let result = ""
  for (let w of words) {
    if (arabicNumberMap[w] !== undefined) {
      result += arabicNumberMap[w]
    } else if (/^\d+$/.test(w)) {
      result += w
    }
  }
  if (!result) return null
  return parseFloat(result)
}

function arabicWordsToNumber(text: string): string {
  return text.replace(/([\u0600-\u06FF\s]+)\s*دينار كويتي/g, (match) => {
    const parsed = parseArabicPrice(match)
    if (parsed !== null && !isNaN(parsed)) {
      return `<b>${parsed.toFixed(3)}</b> دينار كويتي`
    }
    return match
  })
}

export default function TextAnimation({
  onStartListening,
  onStopListening,
  isAudioPlaying,
  currentText,
}: Props) {
  const [aiState, setAiState] = useState<AIState>('idle')
  const [detectedItems, setDetectedItems] = useState<
    { name: string; price: string; imageUrl: string }[]
  >([])
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)

  // Demo items for preview
  const demoItems = [
    {
      name: 'لاتيه شاي ماتشا',
      price: '2.000',
      imageUrl: '/default-image.png',
    },
    // {
    //   name: 'بودينو كراميل مملح',
    //   price: '1.900',
    //   imageUrl: '/default-image.png',
    // },
  ]

  // Start summary after 5s when conversation starts
  useEffect(() => {
    console.log(aiState, conversationStarted);

   setConversationStarted(true)
      const timer = setTimeout(() => {
        setDetectedItems(demoItems)
        setShowOrderSummary(true)
        
      }, 10000)
      return () => clearTimeout(timer)
  }, [aiState, conversationStarted])

  // Handle state transitions
  useEffect(() => {
    if (isAudioPlaying) setAiState('speaking')
    else if (aiState === 'speaking' && currentText) setAiState('listening')
  }, [isAudioPlaying])

  // Price logic
  let orderItems: { name: string; price: string }[] = []
  let totalPrice = 0

  if (showOrderSummary) {
    orderItems = demoItems
    totalPrice = orderItems.reduce(
      (sum, item) => sum + parseFloat(item.price),
      0,
    )
  }

  const totalPriceDisplay = showOrderSummary
    ? `المجموع: <b>${totalPrice.toFixed(3)}</b> دينار كويتي`
    : ''

  const animatedImportant = useTypingEffect(totalPriceDisplay, 20)
  const nonImportantText = currentText || ''
  const displayedText = useTypingEffect(
    'Click the circle to start the conversation',
    20,
  )

  // Circle click
  const handleCircleClick = () => {
    if (aiState === 'listening' || aiState === 'speaking') {
      onStopListening?.()
      setAiState('idle')
      setConversationStarted(false)
      setShowOrderSummary(false)
      setDetectedItems([])
    } else if (!isAudioPlaying) {
      onStartListening?.()
      setAiState('listening')
    }
  }

  // Animation for items
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative w-full">
      {/* Order summary */}
      {/* {showOrderSummary && ( */}
        <div className="w-full max-w-md mb-6">
          <div className="flex flex-wrap justify-center gap-4">
            {detectedItems.map((item, index) => (
              <motion.div
                key={`${item.name}-${index}`}
                className="bg-white p-2 rounded-lg shadow-md"
                initial="hidden"
                animate="visible"
                variants={itemVariants}
              >
                <div className="relative w-24 h-24 mb-2">
                  <Image
                    src={item.imageUrl || '/default-image.png'}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover rounded"
                  />
                </div>
                <div className="text-center text-xs font-medium">
                  <p className="truncate">{item.name}</p>
                  <p className="text-blue-600">{item.price} د.ك</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      {/* )} */}

      {/* Price display */}
      {/* {animatedImportant && (
        <div
          className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mb-6 text-center text-xl font-bold"
          style={{ minHeight: 80 }}
        >
          <span dangerouslySetInnerHTML={{ __html: animatedImportant }} />
        </div>
      )} */}

      {/* Circle */}
      <div
        className="relative mb-8 cursor-pointer"
        onClick={handleCircleClick}
        role="button"
        aria-label={
          aiState === 'listening' ? 'Stop listening' : 'Start listening'
        }
      >
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
          animate={{
            background:
              aiState === 'speaking'
                ? [
                    'conic-gradient(from 0deg, #8A63E3, #B054BC, #DE6B88, #FF9F69, #FFCD5C, #8A63E3)',
                    'conic-gradient(from 180deg, #8A63E3, #B054BC, #DE6B88, #FF9F69, #FFCD5C, #8A63E3)',
                  ]
                : 'radial-gradient(circle at center, #2370f4ff 0%, #1e8bffff 100%)',
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: 'linear',
          }}
        >
          {aiState === 'idle' && (
            <Image
              src="/voice.svg"
              alt="Voice"
              width={26}
              height={26}
              className="opacity-80"
            />
          )}
        </motion.div>

        {aiState === 'listening' && (
          <svg
            className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2"
            viewBox="0 0 100 100"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              strokeWidth="4"
              stroke="#8B5CF6"
              transition={{
                duration: 10,
                ease: 'linear',
                repeat: Infinity,
              }}
              strokeLinecap="round"
              initial={{ pathLength: 0, rotate: -90 }}
              animate={{ pathLength: 1, rotate: 270 }}
            />
          </svg>
        )}
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-4 left-0 w-full flex justify-center pointer-events-none select-none">
        <div className="text-xs text-gray-600 font-medium max-w-xs text-center">
          {nonImportantText || displayedText}
        </div>
      </div>
    </div>
  )
}
