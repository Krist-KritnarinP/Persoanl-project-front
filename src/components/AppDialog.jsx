import { useCallback, useEffect, useRef, useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiHelpCircle, FiInfo } from "react-icons/fi";
import { useLang } from "@/i18n";
import { DialogContext } from "@/components/AppDialogContext";

export function AppDialogProvider({ children }) {
  const { t } = useLang();
  const [dialog, setDialog] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const resolver = useRef(null);
  const nextId = useRef(0);

  const open = useCallback((type, options) => new Promise((resolve) => {
    resolver.current?.(false);
    resolver.current = resolve;
    setInputValue(options.defaultValue || "");
    setDialog({ ...options, type, id: ++nextId.current });
  }), []);
  const confirm = useCallback((message, options = {}) => open("confirm", { ...options, message }), [open]);
  const alert = useCallback((message, options = {}) => open("alert", { ...options, message }), [open]);
  const prompt = useCallback((message, options = {}) => open("prompt", { ...options, message }), [open]);

  const finish = useCallback((result) => {
    const resolve = resolver.current;
    resolver.current = null;
    setDialog(null);
    resolve?.(result);
  }, []);

  useEffect(() => {
    const element = dialogRef.current;
    if (dialog && element && !element.open) element.showModal();
    if (!dialog && element?.open) element.close();
    if (dialog?.type === "prompt") requestAnimationFrame(() => inputRef.current?.focus());
  }, [dialog]);

  const Icon = dialog?.type === "confirm"
    ? (dialog.variant === "danger" ? FiAlertTriangle : FiHelpCircle)
    : dialog?.type === "alert" ? FiInfo : FiCheckCircle;

  return (
    <DialogContext.Provider value={{ confirm, alert, prompt }}>
      {children}
      <dialog
        ref={dialogRef}
        className="modal px-4"
        aria-labelledby="app-dialog-title"
        aria-describedby="app-dialog-message"
        aria-modal="true"
        role={dialog?.type === "prompt" ? "dialog" : "alertdialog"}
        onCancel={(event) => { event.preventDefault(); finish(dialog?.type === "prompt" ? null : false); }}
        onClose={() => { if (resolver.current) finish(dialog?.type === "prompt" ? null : false); }}
        onClick={(event) => { if (event.target === event.currentTarget) finish(dialog?.type === "prompt" ? null : false); }}
      >
        {dialog && (
          <div className="modal-box w-full max-w-md rounded-3xl border border-base-content/10 bg-base-100 p-5 text-base-content shadow-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${dialog.variant === "danger" ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}>
                <Icon className="text-xl" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="app-dialog-title" className="text-lg font-bold">{dialog.title || t("common.dialogTitle")}</h2>
                <p id="app-dialog-message" className="mt-2 whitespace-pre-line text-sm leading-relaxed text-base-content/75">{dialog.message}</p>
              </div>
            </div>
            {dialog.type === "prompt" && (
              <input
                ref={inputRef}
                className="input input-bordered mt-5 w-full"
                value={inputValue}
                maxLength={dialog.maxLength || 100}
                placeholder={dialog.placeholder || ""}
                aria-label={dialog.inputLabel || dialog.title || t("common.dialogTitle")}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); finish(inputValue); } }}
              />
            )}
            <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              {dialog.type !== "alert" && (
                <button className="btn btn-ghost" onClick={() => finish(dialog.type === "prompt" ? null : false)}>
                  {dialog.cancelLabel || t("common.cancel")}
                </button>
              )}
              <button
                autoFocus={dialog.type !== "prompt"}
                className={`btn ${dialog.type === "confirm" && dialog.variant === "danger" ? "btn-error" : "btn-primary"}`}
                onClick={() => finish(dialog.type === "prompt" ? inputValue : dialog.type === "confirm")}
              >
                {dialog.confirmLabel || (dialog.type === "alert" ? t("common.ok") : dialog.type === "prompt" ? t("common.save") : t("common.confirm"))}
              </button>
            </div>
          </div>
        )}
        <form method="dialog" className="modal-backdrop"><button aria-label={t("common.close")} onClick={(event) => { event.preventDefault(); finish(dialog?.type === "prompt" ? null : false); }}>close</button></form>
      </dialog>
    </DialogContext.Provider>
  );
}
