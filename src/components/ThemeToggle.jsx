import { useLang } from "@/i18n";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "@/theme";

export default function ThemeToggle({ className = "" }) {
  const { t } = useLang();
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      title={t(isDark ? "ui.light" : "ui.dark")}
      aria-label={t(isDark ? "ui.light" : "ui.dark")}
      aria-pressed={isDark}
      className={`btn btn-ghost btn-circle shrink-0 ${className}`}
    >
      {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
    </button>
  );
}
