import { getPasswordStrength } from "@/utils/passwordStrength";
import { useLang } from "@/i18n";

const levels = ["auth.strengthIncomplete", "auth.strengthBasic", "auth.strengthModerate", "auth.strengthStrong"];
const colors = ["bg-base-300", "bg-error", "bg-warning", "bg-success"];

export default function PasswordStrength({ password }) {
  const { t } = useLang();
  const level = getPasswordStrength(password);
  return (
    <div id="password-strength" className="mt-2 rounded-xl border border-base-content/10 bg-base-200/60 p-3 text-sm">
      <p className="font-semibold" role="status" aria-live="polite">{t("auth.strengthTitle")}: {t(levels[level])}</p>
      <div className="mt-2 flex gap-1" role="meter" aria-label={t("auth.strengthTitle")} aria-valuemin="0" aria-valuemax="3" aria-valuenow={level} aria-valuetext={t(levels[level])}>
        {[1, 2, 3].map((step) => <span key={step} className={`h-2 flex-1 rounded-full ${step <= level ? colors[level] : colors[0]}`} />)}
      </div>
      <ul className="mt-3 space-y-1 text-xs text-base-content/75">
        <li>{t("auth.strengthCriteriaBasic")}</li>
        <li>{t("auth.strengthCriteriaModerate")}</li>
        <li>{t("auth.strengthCriteriaStrong")}</li>
      </ul>
      <p className="mt-2 text-xs text-base-content/60">{t("auth.strengthCaution")}</p>
    </div>
  );
}
