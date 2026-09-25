import React from "react";
import { FiGlobe } from "react-icons/fi";
import { LANGS, useLang } from "@/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <label className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 pl-2.5 pr-1 py-1 text-sm shrink-0">
      <FiGlobe className="text-base-content/60 shrink-0" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="bg-transparent font-semibold text-sm focus:outline-none cursor-pointer pr-1 [&>option]:text-slate-900"
        aria-label="Language"
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.code === "th" ? "ไทย" : l.code === "en" ? "English" : l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
