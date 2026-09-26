import LandingContent from "../landing/LandingContent";
import { useLang } from "../i18n";
import useUserStore from "../stores/userStore";
export default function Landing() {
  const { lang, setLang } = useLang();
  const user = useUserStore((state) => state.user);
  return (
    <LandingContent lang={lang} onLanguage={setLang} signedIn={Boolean(user)} />
  );
}
