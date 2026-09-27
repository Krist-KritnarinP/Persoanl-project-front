/**
 * Shared activity-type metadata (icon + badge color + label).
 * Single source of truth so every page renders the 4 types identically.
 * NOTE: ActivityModal keeps its own array version because a dropdown needs
 * an ordered list — same data, different shape (see its TYPE_OPTIONS).
 */
import { FiHome, FiTruck, FiCoffee, FiNavigation } from "react-icons/fi";

/**
 * Build the { [type]: { label, icon, color } } map.
 * Pass the current translator from useLang() so labels follow the selected language.
 *
 * @param {(key: string) => string} t - translator from useLang()
 * @returns {{ ACCOMMODATION: object, TRANSPORT: object, RESTAURANT: object, ATTRACTION: object }}
 */
export function getActivityTypeMeta(t) {
  return {
    ACCOMMODATION: {
      label: t("act.accom"),
      icon: FiHome,
      color: "badge-primary",
    },
    TRANSPORT: { label: t("act.transp"), icon: FiTruck, color: "badge-info" },
    RESTAURANT: {
      label: t("act.rest"),
      icon: FiCoffee,
      color: "badge-warning",
    },
    ATTRACTION: {
      label: t("act.attr"),
      icon: FiNavigation,
      color: "badge-accent",
    },
  };
}
