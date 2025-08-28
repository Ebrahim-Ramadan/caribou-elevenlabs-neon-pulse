
import { Cpu, User } from 'react-feather'

// Helper to convert Arabic number words to digits (supports up to 2 decimal places)
const arabicNumberMap: Record<string, string> = {
  'صفر': '0',
  'واحد': '1',
  'إثنان': '2', 'اثنان': '2', 'اثنين': '2', 'إثنين': '2', 'اثنتان': '2', 'اثنتين': '2',
  'ثلاثة': '3',
  'أربعة': '4',
  'خمسة': '5',
  'ستة': '6',
  'سبعة': '7',
  'ثمانية': '8',
  'تسعة': '9',
  'عشرة': '10',
  'إحدى عشر': '11',
  'إثنا عشر': '12',
  'فاصلة': '.',
};

function arabicWordsToNumber(text: string): string {
  // Match e.g. "واحد فاصلة اثنين وخمسين" or "واحد فاصلة خمسة" etc.
  const priceWordsRegex = /((?:\w+\s*)+?)\s*دينار كويتي/g;
  return text.replace(priceWordsRegex, (match, numWords) => {
    // Split by space and "و" (and)
    let words = numWords.split(/\s+|و/).filter(Boolean);
    let result = '';
    for (let w of words) {
      if (arabicNumberMap[w]) {
        result += arabicNumberMap[w];
      } else if (/^\d+$/.test(w)) {
        result += w;
      }
    }
    // If result is a valid number, return bolded
    if (result && !isNaN(Number(result.replace(/\./g, '.')))) {
      return `<b>${result}</b> دينار كويتي`;
    }
    // fallback: return original
    return match;
  });
}

export default function ({ conversationItem }: { conversationItem: { role: string; formatted: { transcript: string } } }) {
  let transcript = conversationItem.formatted.transcript;
  // First, convert Arabic number words to digits and bold them
  transcript = arabicWordsToNumber(transcript);
  // Then, bold any digit-based price as well
  const priceDigitsRegex = /(\d+[.,]?\d*\s*دينار كويتي)/g;
  const formattedTranscript = transcript.replace(priceDigitsRegex, (match) => `<b>${match}</b>`);
  return (
    <div className="flex flex-row items-start gap-x-3 flex-wrap max-w-full">
      <div className="rounded border p-2 max-w-max">{conversationItem.role === 'user' ? <User /> : <Cpu />}</div>
      <div className="flex flex-col gap-y-2" dangerouslySetInnerHTML={{ __html: formattedTranscript }} />
    </div>
  );
}
