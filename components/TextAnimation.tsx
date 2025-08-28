'use client'

import { useTypingEffect } from '@/components/useTypingEffect'
import menu from '../public/caribou_menu_items.json'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type AIState = 'idle' | 'listening' | 'speaking'

interface Props {
  onStartListening?: () => void
  onStopListening?: () => void
  isAudioPlaying?: boolean
  currentText: string
}

// --- Price normalization logic (from Message.tsx) ---
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
  "فاصلة": ".", "فصله": ".", // common mis-transcriptions
  "و": "", // ignore conjunction
};

function parseArabicPrice(text: string): number | null {
  const match = text.match(/([\u0600-\u06FF\s]+)\s*دينار/);
  if (!match) return null;
  const words = match[1].split(/\s+/).filter(Boolean);
  let result = "";
  for (let w of words) {
    if (arabicNumberMap[w] !== undefined) {
      result += arabicNumberMap[w];
    } else if (/^\d+$/.test(w)) {
      result += w;
    }
  }
  if (!result) return null;
  return parseFloat(result);
}

function arabicWordsToNumber(text: string): string {
  return text.replace(/([\u0600-\u06FF\s]+)\s*دينار كويتي/g, (match, numWords) => {
    const parsed = parseArabicPrice(match);
    if (parsed !== null && !isNaN(parsed)) {
      return `<b>${parsed.toFixed(3)}</b> دينار كويتي`;
    }
    return match;
  });
}

export function TextAnimation ({ onStartListening, onStopListening, isAudioPlaying, currentText }: Props) {
  const [aiState, setAiState] = useState<AIState>('idle')

  // Log all menu items with Arabic name and price on mount
  useEffect(() => {
    console.log('Menu items (Arabic name and price):');
    (menu as any[]).forEach(item => {
      if (item.name_ar && item.price_kwd) {
        console.log(`${item.name_ar}: ${item.price_kwd} KWD`);
      }
    });
    
    // Calculate the total for the items mentioned by the user
    const specificItems = [
      "لاتيه شاي ماتشا",         // Matcha Tea Latte
      "بودينو كراميل مملح"        // Salted Caramel Budino
    ];
    
    let specificTotal = 0;
    const foundItems: {name: string, price: string}[] = [];
    
    specificItems.forEach(itemName => {
      const menuItem = (menu as any[]).find(item => item.name_ar === itemName);
      if (menuItem) {
        foundItems.push({
          name: menuItem.name_ar,
          price: menuItem.price_kwd
        });
        specificTotal += parseFloat(menuItem.price_kwd);
      }
    });
    
    console.log('Specifically ordered items:', foundItems);
    console.log('Specific order total:', specificTotal.toFixed(3), 'KWD');
  }, []);

  // --- Price normalization logic ---
  let normalizedText = currentText;
  let orderItems: {name: string, price: string}[] = [];
  let totalPrice = 0;
  
  // First pass: Identify ordered items and calculate total price
  (menu as any[]).forEach((item) => {
    if (item.name_ar && normalizedText.includes(item.name_ar)) {
      // Add to ordered items
      orderItems.push({
        name: item.name_ar,
        price: item.price_kwd
      });
      
      // Add to total price (convert string to float)
      totalPrice += parseFloat(item.price_kwd);
    }
  });
  
  // Log identified items and total for debugging
  if (orderItems.length > 0) {
    console.log('Identified ordered items:', orderItems);
    console.log('Total price calculated:', totalPrice.toFixed(3), 'KWD');
  }
  
  // Second pass: Replace item mentions with correct prices - REMOVE INDIVIDUAL PRICES
  // Instead of showing individual prices, we'll just keep the item names
  (menu as any[]).forEach((item) => {
    if (item.name_ar) {
      const arName = item.name_ar;
      const regex = new RegExp(
        `${arName}(?:[^\u0600-\u06FF\d]*[\u0600-\u06FF\d\s]*)?(دينار كويتي)?`,
        "g"
      );
      normalizedText = normalizedText.replace(
        regex,
        `${arName}`  // Only keep the item name without individual price
      );
    }
  });
  
  // Add total price at the end if items were found
  if (orderItems.length > 0) {
    // Replace total_price_kwd placeholder with actual calculated total
    normalizedText = normalizedText.replace(
      /\{\{\s*total_price_kwd\s*\}\}/g,
      `<b>${totalPrice.toFixed(3)}</b>`
    );
    
    // If there's no placeholder but we have items, add the total price at the end
    if (!normalizedText.includes('{{total_price_kwd}}') && !normalizedText.includes('المجموع')) {
      normalizedText += ` المجموع: <b>${totalPrice.toFixed(3)}</b> دينار كويتي`;
    }
  } else {
    normalizedText = normalizedText.replace(
      /\{\{\s*total_price_kwd\s*\}\}/g,
      "<b>{{total_price_kwd}}</b>"
    );
  }
  
  normalizedText = arabicWordsToNumber(normalizedText);
  const priceDigitsRegex = /(\d+[.,]?\d*\s*دينار كويتي)/g;
  normalizedText = normalizedText.replace(
    priceDigitsRegex,
    (match) => {
      const numMatch = match.match(/\d+[.,]?\d*/);
      if (numMatch) {
        let num = numMatch[0].replace(",", ".");
        let [intPart, decPart] = num.split(".");
        let formatted = intPart;
        if (decPart)
          formatted += "." + decPart.padEnd(3, "0").slice(0, 3);
        else formatted += ".000";
        return `<b>${formatted}</b> دينار كويتي`;
      }
      return `<b>${match}</b>`;
    }
  );
  // --- End price normalization logic ---

  // --- Message importance logic ---
  // Define what is important: contains price, order, confirmation, or menu items
  const isImportant =
    /دينار كويتي|المجموع|السعر|total|order|طلب|تاكيد|confirm|\{\{\s*total_price_kwd\s*\}\}/i.test(normalizedText) ||
    (menu as any[]).some(item => item.name_ar && normalizedText.includes(item.name_ar));

  // Animate only important messages above the circle
  const animatedImportant = useTypingEffect(isImportant ? normalizedText : '', 20);
  // Show non-important as small text at the bottom
  const nonImportantText = !isImportant && normalizedText ? normalizedText : '';
  const displayedText = useTypingEffect('Click the circle to start the conversation', 20)

  const handleCircleClick = () => {
    if (aiState === 'listening' || aiState === 'speaking') {
      onStopListening?.()
      setAiState('idle')
    } else if (!isAudioPlaying) {
      onStartListening?.()
      setAiState('listening')
    }
  }

  useEffect(() => {
    if (isAudioPlaying) setAiState('speaking')
    else if (aiState === 'speaking' && currentText) setAiState('listening')
  }, [isAudioPlaying])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative w-full">
      {/* Important message above the circle */}
      {animatedImportant && (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mb-6 text-center text-xl font-bold" style={{minHeight: 80}}>
          <span dangerouslySetInnerHTML={{ __html: animatedImportant }} />
        </div>
      )}
      {/* Blue circle */}
      <div className="relative mb-8 cursor-pointer" onClick={handleCircleClick} role="button" aria-label={aiState === 'listening' ? 'Stop listening' : 'Start listening'}>
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-[#6FE5F1] to-[#9DEEF6] rounded-full flex items-center justify-center"
          animate={aiState === 'idle' ? { scale: [1, 1.1, 1] } : aiState === 'speaking' ? { scale: [1, 1.2, 0.8, 1.2, 1] } : {}}
          transition={{
            repeat: Infinity,
            ease: 'easeInOut',
            duration: aiState === 'speaking' ? 0.8 : 1.5,
          }}
        />
        {aiState === 'listening' && (
          <svg className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2" viewBox="0 0 100 100">
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
      {/* Non-important message at the bottom */}
      <div className="absolute bottom-4 left-0 w-full flex justify-center pointer-events-none select-none">
        <div className="text-xs text-gray-600 font-medium max-w-xs text-center">
          {nonImportantText || displayedText}
        </div>
      </div>
    </div>
  )
}

export default TextAnimation;