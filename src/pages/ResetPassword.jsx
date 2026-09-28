import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { mainApi } from "@/api/mainApi";
import { useLang } from "@/i18n";
import useUserStore from "@/stores/userStore";
import { passwordSchema } from "@/validations/schema";
import ThemeToggle from "@/components/ThemeToggle";

function ResetPassword() {
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const [token] = useState(
    () =>
      new URLSearchParams(location.hash.slice(1)).get("token") ||
      new URLSearchParams(location.search).get("token") ||
      "",
  );
  useEffect(() => {
    if (location.hash || location.search)
      navigate("/reset-password", { replace: true });
  }, [location.hash, location.search, navigate]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const validation = passwordSchema.safeParse(password);
    if (!validation.success)
      return toast.error(t(validation.error.issues[0].message));
    if (password !== confirmPassword)
      return toast.error(t("auth.passwordMismatch"));
    setBusy(true);
    try {
      await mainApi.post("/auth/reset-password", { token, password });
      useUserStore.getState().clearSession();
      setPassword("");
      setConfirmPassword("");
      setDone(true);
    } catch {
      toast.error(t("auth.resetInvalid"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 py-10">
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
      <section className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title justify-center">
            {t("auth.newPasswordTitle")}
          </h1>
          {done ? (
            <div className="alert alert-success mt-4" role="status">
              {t("auth.passwordResetDone")}
            </div>
          ) : !token ? (
            <div className="alert alert-error mt-4" role="alert">
              {t("auth.resetInvalid")}
            </div>
          ) : (
            <form className="mt-4 flex flex-col gap-4" onSubmit={submit}>
              <label className="form-control w-full">
                <span className="label-text mb-2">{t("auth.newPassword")}</span>
                <input
                  className="input input-bordered w-full"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text mb-2">
                  {t("auth.confirmPassword")}
                </span>
                <input
                  className="input input-bordered w-full"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>
              <p className="text-sm text-base-content/60">
                {t("auth.passwordRule")}
              </p>
              <button
                className="btn btn-primary w-full"
                type="submit"
                disabled={busy}
              >
                {busy ? (
                  <span
                    className="loading loading-spinner"
                    aria-label={t("common.loading")}
                  />
                ) : (
                  t("auth.savePassword")
                )}
              </button>
            </form>
          )}
          <Link className="link link-primary mt-3 text-center" to="/login">
            {done ? t("auth.backLogin") : t("common.cancel")}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ResetPassword;
