import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FiPrinter, FiX, FiFileText, FiList, FiInfo } from "react-icons/fi";
import { useLang } from "@/i18n";
import TripPdfDocument from "./TripPdfDocument";

export default function TripPdfExportModal({
  isOpen,
  onClose,
  trip,
  formatDate,
  formatZonedTime,
}) {
  const { t, locale } = useLang();
  const [mode, setMode] = useState("full"); // "full" | "compact"
  const [options, setOptions] = useState({
    includeQr: true,
    includeCost: true,
    includeNotes: true,
  });

  if (!isOpen || !trip) return null;

  const handlePrint = () => {
    // Trigger native browser print dialog (which offers "Save as PDF")
    window.print();
  };

  const toggleOption = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* ========================================================
          INTERACTIVE SCREEN MODAL (Hidden in print)
          ======================================================== */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto print:hidden">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-pdf-modal-title"
          className="relative w-full max-w-4xl bg-base-100 rounded-3xl shadow-2xl border border-base-content/15 flex flex-col max-h-[92vh] overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-base-content/10 bg-base-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-xl shrink-0">
                <FiPrinter />
              </div>
              <div>
                <h2
                  id="export-pdf-modal-title"
                  className="text-lg sm:text-xl font-extrabold text-base-content"
                >
                  {t("export.title")}
                </h2>
                <p className="text-xs sm:text-sm text-base-content/70">
                  {t("export.subtitle")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:bg-base-content/10"
              aria-label="Close"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Modal Body: Controls & Live Preview */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            {/* Format Selector: Full vs Compact */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-base-content/80 tracking-wide uppercase">
                รูปแบบเอกสาร (Document Format)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Full Detail */}
                <button
                  type="button"
                  onClick={() => setMode("full")}
                  className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                    mode === "full"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-base-content/15 bg-base-100 hover:border-base-content/30"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      mode === "full"
                        ? "bg-primary text-white"
                        : "bg-base-200 text-base-content/70"
                    }`}
                  >
                    <FiFileText className="text-xl" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm sm:text-base text-base-content">
                        {t("export.modeFull")}
                      </span>
                      {mode === "full" && (
                        <span className="badge badge-primary badge-xs">
                          เลือกอยู่
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-base-content/70 leading-relaxed">
                      {t("export.modeFullDesc")}
                    </p>
                  </div>
                </button>

                {/* Option 2: Compact Summary */}
                <button
                  type="button"
                  onClick={() => setMode("compact")}
                  className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                    mode === "compact"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-base-content/15 bg-base-100 hover:border-base-content/30"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      mode === "compact"
                        ? "bg-primary text-white"
                        : "bg-base-200 text-base-content/70"
                    }`}
                  >
                    <FiList className="text-xl" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm sm:text-base text-base-content">
                        {t("export.modeCompact")}
                      </span>
                      {mode === "compact" && (
                        <span className="badge badge-primary badge-xs">
                          เลือกอยู่
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-base-content/70 leading-relaxed">
                      {t("export.modeCompactDesc")}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-base-content/80 tracking-wide uppercase">
                ตัวเลือกการแสดงผล
              </label>
              <div className="flex flex-wrap items-center gap-3 bg-base-200/50 p-3.5 rounded-2xl border border-base-content/10">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm rounded-md"
                    checked={options.includeQr}
                    onChange={() => toggleOption("includeQr")}
                  />
                  <span>{t("export.includeQr")}</span>
                </label>

                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm rounded-md"
                    checked={options.includeCost}
                    onChange={() => toggleOption("includeCost")}
                  />
                  <span>{t("export.includeCost")}</span>
                </label>

                {mode === "full" && (
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm rounded-md"
                      checked={options.includeNotes}
                      onChange={() => toggleOption("includeNotes")}
                    />
                    <span>{t("export.includeNotes")}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Live Document Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-base-content/80 tracking-wide uppercase flex items-center gap-1.5">
                  <span>{t("export.previewTitle")}</span>
                  <span className="badge badge-sm badge-ghost text-[10px]">
                    {mode === "full" ? "แบบเต็ม" : "แบบย่อ"}
                  </span>
                </label>
                <span className="text-xs text-base-content/60">
                  เลื่อนลงเพื่อดูตัวอย่างทั้งหมด
                </span>
              </div>
              <div className="bg-slate-200/80 p-3 sm:p-5 rounded-2xl max-h-[380px] overflow-y-auto border border-base-content/10 shadow-inner custom-scrollbar">
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden">
                  <TripPdfDocument
                    trip={trip}
                    mode={mode}
                    options={options}
                    formatDate={formatDate}
                    formatZonedTime={formatZonedTime}
                    t={t}
                    locale={locale}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="px-5 sm:px-6 py-4 border-t border-base-content/10 bg-base-200/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-base-content/70">
              <FiInfo className="text-primary shrink-0 text-sm" />
              <span>{t("export.printTip")}</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm sm:btn-md rounded-full px-5"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-primary btn-sm sm:btn-md rounded-full px-6 gap-2 shadow-md"
              >
                <FiPrinter className="text-base" />
                <span>{t("export.printAction")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          PRINT PORTAL: Rendered directly to document.body
          Visible ONLY during browser print (@media print)
          ======================================================== */}
      {createPortal(
        <div id="trip-pdf-print-root">
          <TripPdfDocument
            trip={trip}
            mode={mode}
            options={options}
            formatDate={formatDate}
            formatZonedTime={formatZonedTime}
            t={t}
            locale={locale}
          />
        </div>,
        document.body
      )}
    </>
  );
}
