import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "@/theme";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to light" : "Switch to dark"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className={`btn btn-ghost btn-circle shrink-0 ${className}`}
    >
      {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
    </button>
  );
}
