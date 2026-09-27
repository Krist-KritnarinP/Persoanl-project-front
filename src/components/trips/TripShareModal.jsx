import React from "react";
import { FiShare2, FiLink, FiCopy, FiTrash2 } from "react-icons/fi";

/** Presentational share dialog; token creation, clipboard and revocation stay in the page. */
export default function TripShareModal({
  shareLoading,
  shareToken,
  copied,
  copyShareLink,
  handleRevokeShare,
  onClose,
  t,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-3xl border border-white/30 p-5 md:p-6 w-full max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-xl flex items-center gap-2">
          <FiShare2 className="text-primary" /> {t("share.title")}
        </h3>
        <p className="text-sm sm:text-base text-base-content/70 leading-relaxed">
          {t("share.desc")}
        </p>
        {shareLoading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        ) : shareToken ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-2xl bg-base-100/60 border border-base-content/10 px-3 py-2.5 text-sm break-all">
              <FiLink className="shrink-0 text-primary" />
              <span className="truncate">{`${window.location.origin}/share/${shareToken}`}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={copyShareLink}
                className="btn btn-primary rounded-full gap-2 flex-1"
              >
                <FiCopy /> {copied ? t("share.copied") : t("share.copy")}
              </button>
              <button
                onClick={handleRevokeShare}
                className="btn btn-ghost glass rounded-full text-error"
              >
                <FiTrash2 /> {t("share.revoke")}
              </button>
            </div>
          </div>
        ) : null}
        <button onClick={onClose} className="btn btn-ghost w-full rounded-full">
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}
