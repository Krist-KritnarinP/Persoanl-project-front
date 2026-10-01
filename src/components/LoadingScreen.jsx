import TravelingDog from "./TravelingDog";
import { useLang } from "@/i18n";
import "./LoadingScreen.css";

/** Shared page loader. Illustration is decorative; the text announces loading once. */
export default function LoadingScreen() {
  const { t } = useLang();
  return (
    <div className="journey-loading" role="status" aria-live="polite" aria-atomic="true">
      <div className="journey-loading__scene" aria-hidden="true">
        <TravelingDog />
        <span className="journey-loading__tag">AI LHOUNG · ON THE WAY</span>
      </div>
      <h2 className="mt-5 text-xl font-bold text-base-content sm:text-2xl">{t("loading.journeyTitle")}</h2>
      <p className="mt-2 max-w-sm px-4 text-sm leading-relaxed text-base-content/65">{t("loading.journeyHint")}</p>
      <div className="journey-loading__dots" aria-hidden="true"><i /><i /><i /></div>
    </div>
  );
}
