import * as React from "react";

type Listener = () => void;
type VariantMap = Record<string, string>;

let selectedVariants: VariantMap = {};
const listeners = new Set<Listener>();

const LS_KEY = "codeBlockSelectedVariants";
if (typeof window !== "undefined") {
  const stored = window.localStorage.getItem(LS_KEY);
  if (stored) selectedVariants = JSON.parse(stored);
}

function save() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LS_KEY, JSON.stringify(selectedVariants));
  }
}

export function setSelectedVariant(group: string, variant: string) {
  selectedVariants = { ...selectedVariants, [group]: variant };
  save();
  listeners.forEach((l) => l());
}

export function getSelectedVariant(group: string) {
  return selectedVariants[group] || "";
}

export function useSelectedVariant(group: string) {
  return React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => getSelectedVariant(group),
    () => getSelectedVariant(group)
  );
}
