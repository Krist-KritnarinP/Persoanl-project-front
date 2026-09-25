import React from "react";
import { useLang } from "@/i18n";

const FLAGS = { th: "🇹🇭", en: "🇬🇧", zh: "🇨🇳", ko: "🇰🇷" };
const NAMES = { th: "ไทย", en: "English", zh: "中文", ko: "한국어" };

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <label className="flex items-center gap-1 rounded-full border border-white/30 bg-white/20 pl-2 pr-1 py-1 text-sm shrink-0">
      <span className="text-base leading-none" aria-hidden>{FLAGS[lang]}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="bg-transparent font-semibold text-sm focus:outline-none cursor-pointer pr-1 max-w-24 [&>option]:text-slate-900"
        aria-label="Language"
      >
        {(["th", "en", "zh", "ko"]).map((code) => (
          <option key={code} value={code}>
            {FLAGS[code]} {NAMES[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
