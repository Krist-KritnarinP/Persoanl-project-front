import React, { useEffect, useState } from "react";
import { FiCheck, FiClock } from "react-icons/fi";
import { useLang } from "@/i18n";

function parseValue(value) {
  const m = typeof value === "string" && value.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return { h, m: min };
}

function to24(displayH12, min, ampm) {
  const h12 = displayH12 % 12;
  return { h: h12 + (ampm === "PM" ? 12 : 0), m: min };
}

function fmt(n) {
  return String(n).padStart(2, "0");
}

function readFormat() {
  try {
    return localStorage.getItem("timeFormat") === "12" ? "12" : "24";
  } catch {
    return "24";
  }
}

const C = 120;
const R12 = 88;
const R_OUT = 94;
const R_IN = 56;

function pos(i, r) {
  const a = (i * 30 * Math.PI) / 180;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
}

/**
 * Clock-face time picker (24h value "HH:MM").
 * Switchable 12H / 24H face (choice is remembered).
 * Tap an hour -> minute face opens -> tap a minute to confirm.
 */
export default function ClockTimePicker({ value, onChange, disabled }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("hour");
  const [format, setFormatState] = useState(readFormat);
  const [h24, setH24] = useState(9);
  const [min, setMin] = useState(0);

  const parsed = parseValue(value);

  const setFormat = (f) => {
    setFormatState(f);
    try {
      localStorage.setItem("timeFormat", f);
    } catch {
      // ignore
    }
  };

  const openPicker = () => {
    if (disabled) return;
    const now = new Date();
    const base = parsed || { h: now.getHours(), m: now.getMinutes() };
    setH24(base.h);
    setMin(base.m);
    setMode("hour");
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  const commit = (h, m) => {
    onChange?.(`${fmt(h)}:${fmt(m)}`);
    setOpen(false);
  };

  const use24 = format === "24";
  const draftAmpm = h24 < 12 ? "AM" : "PM";
  const draftH12 = h24 % 12 || 12;

  const pickHour12 = (h12) => {
    const { h } = to24(h12, min, draftAmpm);
    setH24(h);
    setMode("minute");
  };

  const pickHour24 = (h) => {
    setH24(h);
    setMode("minute");
  };

  const pickMinute = (m) => {
    setMin(m);
    commit(h24, m);
  };

  const setAmpm = (ap) => {
    setH24((h) => (h % 12) + (ap === "PM" ? 12 : 0));
  };

  // Face items: { label, value, ring, index }
  let items = [];
  if (mode === "minute") {
    items = Array.from({ length: 12 }, (_, i) => ({
      key: `m${i}`,
      label: fmt(i * 5),
      onPick: () => pickMinute(i * 5),
      ring: R12,
      index: i,
      size: "w-10 h-10 -ml-5 -mt-5 text-sm",
      active: Math.round(min / 5) % 12 === i,
    }));
  } else if (use24) {
    const outer = Array.from({ length: 12 }, (_, i) => {
      const v = i === 0 ? 0 : 12 + i;
      return {
        key: `o${v}`,
        label: fmt(v),
        onPick: () => pickHour24(v),
        ring: R_OUT,
        index: i,
        size: "w-9 h-9 -ml-[18px] -mt-[18px] text-sm",
        active: h24 === v,
      };
    });
    const inner = Array.from({ length: 12 }, (_, i) => {
      const v = i === 0 ? 12 : i;
      return {
        key: `i${v}`,
        label: String(v),
        onPick: () => pickHour24(v),
        ring: R_IN,
        index: i,
        size: "w-7 h-7 -ml-[14px] -mt-[14px] text-xs",
        active: h24 === v,
      };
    });
    items = [...outer, ...inner];
  } else {
    items = Array.from({ length: 12 }, (_, i) => {
      const v = i === 0 ? 12 : i;
      return {
        key: `h${v}`,
        label: String(v),
        onPick: () => pickHour12(v),
        ring: R12,
        index: i,
        size: "w-10 h-10 -ml-5 -mt-5 text-sm",
        active: draftH12 % 12 === i,
      };
    });
  }

  const activeItem = items.find((it) => it.active);
  const hand = activeItem
    ? pos(activeItem.index, activeItem.ring)
    : pos(0, R12);

  const readoutH = use24 ? fmt(h24) : fmt(draftH12);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="input input-bordered rounded-xl w-full text-base flex items-center gap-2.5 justify-between font-semibold tabular-nums"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <FiClock className="text-primary shrink-0" />
          {parsed ? (
            <span className="truncate">
              {fmt(parsed.h)}:{fmt(parsed.m)}
              {!use24 && (
                <span className="ml-1.5 text-xs font-bold text-base-content/50">
                  {parsed.h < 12 ? "AM" : "PM"}
                </span>
              )}
            </span>
          ) : (
            <span className="text-base-content/40 font-normal">{t("act.time")}</span>
          )}
        </span>
        {parsed && (
          <span className="badge badge-sm badge-ghost shrink-0">
            {use24
              ? `${fmt(parsed.h)}:${fmt(parsed.m)}`
              : `${parsed.h % 12 || 12}:${fmt(parsed.m)}`}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 grid place-items-center px-4">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label={t("act.time")}
            className="relative w-[288px] rounded-3xl bg-base-100 border border-base-content/10 shadow-2xl p-4 space-y-3"
          >
            {/* readout + format / AM-PM */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-3xl font-black tabular-nums">
                <button
                  type="button"
                  onClick={() => setMode("hour")}
                  className={`px-2 py-0.5 rounded-xl ${mode === "hour" ? "bg-primary text-white" : "text-base-content/50 hover:bg-base-content/10"}`}
                >
                  {readoutH}
                </button>
                <span className="text-base-content/40">:</span>
                <button
                  type="button"
                  onClick={() => setMode("minute")}
                  className={`px-2 py-0.5 rounded-xl ${mode === "minute" ? "bg-primary text-white" : "text-base-content/50 hover:bg-base-content/10"}`}
                >
                  {fmt(min)}
                </button>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div
                  role="group"
                  aria-label="12H / 24H"
                  className="flex rounded-full border border-base-content/15 p-0.5 text-[11px] font-extrabold"
                >
                  {["12H", "24H"].map((f) => {
                    const val = f === "12H" ? "12" : "24";
                    const on = format === val;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          setFormat(val);
                          setMode("hour");
                        }}
                        aria-pressed={on}
                        className={`px-2.5 py-1 rounded-full ${on ? "bg-primary text-white" : "text-base-content/55 hover:bg-base-content/10"}`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
                {!use24 && (
                  <div className="flex rounded-full border border-base-content/15 p-0.5 text-xs font-extrabold">
                    {["AM", "PM"].map((ap) => (
                      <button
                        key={ap}
                        type="button"
                        onClick={() => setAmpm(ap)}
                        aria-pressed={draftAmpm === ap}
                        className={`px-3 py-1 rounded-full ${draftAmpm === ap ? "bg-primary text-white" : "text-base-content/55 hover:bg-base-content/10"}`}
                      >
                        {ap}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* face */}
            <div className="relative mx-auto" style={{ width: 240, height: 240 }}>
              <svg viewBox="0 0 240 240" className="absolute inset-0 w-full h-full text-base-content/25">
                <circle cx={C} cy={C} r={112} fill="none" stroke="currentColor" strokeWidth="1.5" />
                {use24 && mode === "hour" && (
                  <circle cx={C} cy={C} r={34} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
                )}
                <circle cx={C} cy={C} r={4} fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line
                  x1={C}
                  y1={C}
                  x2={hand.x}
                  y2={hand.y}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="text-primary"
                />
                <circle cx={hand.x} cy={hand.y} r={17} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
              </svg>
              {items.map((it) => {
                const p = pos(it.index, it.ring);
                return (
                  <button
                    key={it.key}
                    type="button"
                    onClick={it.onPick}
                    aria-label={String(it.label)}
                    className={`absolute rounded-full font-bold tabular-nums transition-colors ${it.size} ${
                      it.active
                        ? "bg-primary text-white shadow-md"
                        : "text-base-content/70 hover:bg-primary/15 hover:text-primary"
                    }`}
                    style={{ left: p.x, top: p.y }}
                  >
                    {it.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-ghost rounded-full flex-1"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={() => commit(h24, min)}
                className="btn btn-primary rounded-full flex-1 gap-1.5"
              >
                <FiCheck /> {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
