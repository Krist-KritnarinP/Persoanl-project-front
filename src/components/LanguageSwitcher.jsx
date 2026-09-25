import React from "react";
import { LANGS, useLang } from "@/i18n";

export default function LanguageSwitcher({ size = "xs" }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`join rounded-full border border-white/30 bg-white/20 overflow-hidden ${size === "sm" ? "" : ""}`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          className={`join-item btn btn-${size} border-0 px-2 sm:px-3 ${
            lang === l.code ? "btn-primary text-white" : "btn-ghost"
          }`}
          title={l.label}
        >
          {l.code === "th" ? "ไทย" : l.label}
        </button>
      ))}
    </div>
  );
}
