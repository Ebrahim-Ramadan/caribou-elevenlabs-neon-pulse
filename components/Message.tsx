
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
  'و': '', // ignore conjunctions
};

function arabicWordsToNumber(text: string): string {
  // Match e.g. "واحد فاصلة اثنين وخمسين" or "واحد فاصلة خمسة" etc.
  const priceWordsRegex = /((?:[\u0600-\u06FF]+|\d+|فاصلة|و)+)\s*دينار كويتي/g;
  return text.replace(priceWordsRegex, (match, numWords) => {
    // Split by space
    let words = numWords.split(/\s+/).filter(Boolean);
    let result = '';
    let afterDecimal = false;
    for (let w of words) {
      if (w === 'فاصلة') {
        result += '.';
        afterDecimal = true;
        continue;
      }
      if (arabicNumberMap[w] !== undefined) {
        result += arabicNumberMap[w];
      } else if (/^\d+$/.test(w)) {
        result += w;
      }
    }
    // Remove trailing dot
    if (result.endsWith('.')) result = result.slice(0, -1);
    // If result is a valid number, return bolded
    if (result && !isNaN(Number(result))) {
      // Format to X.XXX
      let [intPart, decPart] = result.split('.');
      let formatted = intPart;
      if (decPart) formatted += '.' + decPart.padEnd(3, '0').slice(0, 3);
      else formatted += '.000';
      return `<b>${formatted}</b> دينار كويتي`;
    }
    // fallback: return original
    return match;
  });
}

export default function ({ conversationItem }: { conversationItem: { role: string; formatted: { transcript: string } } }) {
  let transcript = conversationItem.formatted.transcript;
  // First, convert Arabic number words to digits and bold them
  transcript = arabicWordsToNumber(transcript);
  // Then, bold any digit-based price as well, and format to X.XXX
  const priceDigitsRegex = /(\d+[.,]?\d*\s*دينار كويتي)/g;
  const formattedTranscript = transcript.replace(priceDigitsRegex, (match) => {
    // Extract number part
    const numMatch = match.match(/\d+[.,]?\d*/);
    if (numMatch) {
      let num = numMatch[0].replace(',', '.');
      let [intPart, decPart] = num.split('.');
      let formatted = intPart;
      if (decPart) formatted += '.' + decPart.padEnd(3, '0').slice(0, 3);
      else formatted += '.000';
      return `<b>${formatted}</b> دينار كويتي`;
    }
    return `<b>${match}</b>`;
  });
  return (
    <div className="flex flex-row items-start gap-x-3 flex-wrap max-w-full">
      <div className="rounded border p-2 max-w-max">{conversationItem.role === 'user' ? <User /> : <Cpu />}</div>
      <div className="flex flex-col gap-y-2" dangerouslySetInnerHTML={{ __html: formattedTranscript }} />
    </div>
  );
}
