import { createContext, useContext } from "react";

export const DialogContext = createContext(null);

export function useAppDialog() {
  const value = useContext(DialogContext);
  if (!value) throw new Error("useAppDialog must be used inside AppDialogProvider");
  return value;
}
