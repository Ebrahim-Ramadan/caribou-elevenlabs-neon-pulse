import { Cpu, User } from "react-feather";
import menu from "../public/caribou_menu_items.json";

// Map Arabic number words → digits
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

// 🔹 Parser: Arabic words → float number
function parseArabicPrice(text: string): number | null {
  const match = text.match(/([\u0600-\u06FF\s]+)\s*دينار/);
  if (!match) return null;

  const words = match[1].split(/\s+/).filter(Boolean);
  let result = "";
  for (let w of words) {
    if (arabicNumberMap[w] !== undefined) {
      result += arabicNumberMap[w];
    } else if (/^\d+$/.test(w)) {
      result += w; // raw digit
    }
  }
  if (!result) return null;
  return parseFloat(result);
}

// 🔹 Decorator: replace in transcript with bolded normalized number
function arabicWordsToNumber(text: string): string {
  return text.replace(/([\u0600-\u06FF\s]+)\s*دينار كويتي/g, (match, numWords) => {
    const parsed = parseArabicPrice(match);
    if (parsed !== null && !isNaN(parsed)) {
      return `<b>${parsed.toFixed(3)}</b> دينار كويتي`;
    }
    return match;
  });
}

export default function ({
  conversationItem,
}: {
  conversationItem: { role: string; formatted: { transcript: string } };
}) {
  let transcript = conversationItem.formatted.transcript;

  // Lookup & bold menu items by Arabic name
  (menu as any[]).forEach((item) => {
    if (item.name_ar) {
      const arName = item.name_ar;
      const regex = new RegExp(
        `${arName}(?:[^\u0600-\u06FF\d]*[\u0600-\u06FF\d\s]*)?(دينار كويتي)?`,
        "g"
      );
      transcript = transcript.replace(
        regex,
        `${arName} <b>${item.price_kwd}</b> دينار كويتي`
      );
    }
  });

  // Bold {{total_price_kwd}} variable
  transcript = transcript.replace(
    /\{\{\s*total_price_kwd\s*\}\}/g,
    "<b>{{total_price_kwd}}</b>"
  );

  // Convert Arabic words → digits
  transcript = arabicWordsToNumber(transcript);

  // Bold digit-based prices too
  const priceDigitsRegex = /(\d+[.,]?\d*\s*دينار كويتي)/g;
  const formattedTranscript = transcript.replace(
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

  return (
    <div className="flex flex-row items-start gap-x-3 flex-wrap max-w-full ">
      <div className="rounded border p-2 max-w-max">
        {conversationItem.role === "user" ? <User /> : <Cpu />}
      </div>
      <div
        className="flex flex-col gap-y-2 "
        dangerouslySetInnerHTML={{ __html: formattedTranscript }}
      />
    </div>
  );
}
