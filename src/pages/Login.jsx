import React, { useState } from "react";
import UserRegister from "@/components/UserRegister"; // 👈 เพิ่มบรรทัดนี้
import useUserStore from "@/stores/userStore";
import { loginSchema } from "@/validations/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLang } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { Link } from "react-router-dom";

function Login() {
  const { t, lang } = useLang();
  const [googleCredential, setGoogleCredential] = useState(null);
  const [linkPassword, setLinkPassword] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);
  const login = useUserStore((state) => state.login);
  const loginWithGoogle = useUserStore((state) => state.loginWithGoogle);
  const { formState, register, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();
  const { errors } = formState;

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success(t("auth.loginOk"));
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || t("auth.loginFail"));
    }
  };

  const handleGoogleCredential = async (credential, currentPassword) => {
    setGoogleBusy(true);
    try {
      await loginWithGoogle(credential, currentPassword);
      setGoogleCredential(null);
      setLinkPassword('');
      toast.success(t("auth.loginOk"));
      navigate("/dashboard");
    } catch (err) {
      if (err?.response?.data?.code === "GOOGLE_LINK_PASSWORD_REQUIRED") setGoogleCredential(credential);
      else toast.error(t("auth.googleLoginFail"));
    } finally { setGoogleBusy(false); }
  };

  const handleGoogleUnavailable = () => {
    toast.error(t("auth.googleNeedsConfig"));
  };

  return (
    <>
      <div className="min-h-screen px-4 pt-10 md:pt-20 pb-20 md:pb-28 flex items-center justify-center">
        <Link to="/" className="absolute top-4 left-4 text-sm font-semibold link">← AI LHOUNG</Link>
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="p-2 sm:p-5 mx-auto max-w-5xl min-h-135 flex flex-col md:flex-row justify-between items-center w-full gap-8">
          {/* ฝั่งซ้าย: ข้อความต้อนรับ */}
          <div className="flex flex-col gap-4 md:basis-3/5 text-center md:text-left">
            <div className="font-display text-6xl sm:text-7xl p-2 text-primary">AI LHOUNG</div>
            <div>
              <h2 className="text-xl sm:text-2xl leading-9 mt-3 text-base-content/80">
                {t("auth.heroSub")}
              </h2>

            </div>
          </div>

          {/* ฝั่งขวา: ฟอร์ม Login */}
          <div className="aura aura-dual w-full max-w-md shadow-xl">
            <div className="card bg-base-100">
              <div className="card-body p-4 sm:p-8">
                <span className="flex flex-wrap justify-center text-lg sm:text-xl mx-1 text-center">
                  {t("auth.readyFor")}
                  <span className="text-rotate">
                    <span>
                      <span className="bg-emerald-400 text-emerald-950 px-2 rounded-full mx-1">
                        Adventure?
                      </span>
                      <span className="bg-rose-400 text-rose-950 px-2 rounded-full mx-1">
                        Road Trip?
                      </span>
                      <span className="bg-amber-400 text-amber-950 px-2 rounded-full">
                        Vacation?
                      </span>
                    </span>
                  </span>
                </span>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="card-body flex justify-center w-full gap-4 p-4 sm:p-6">
                    <div className="w-full">
                      <input
                        type="email"
                        {...register("email")}
                        className="input input-bordered w-full text-base"
                        placeholder={t("auth.email")}
                      />
                      <p className="text-sm text-error mt-1">
                        {errors.email?.message}
                      </p>
                    </div>

                    <div className="w-full">
                      <input
                        type="password"
                        {...register("password")}
                        className="input input-bordered w-full text-base"
                        placeholder={t("auth.password")}
                      />
                      <p className="text-sm text-error mt-1">
                        {errors.password?.message}
                      </p>
                    </div>

                    <button className="btn btn-primary text-lg w-full">
                      {t("auth.login")}
                    </button>
                    <div className="flex justify-end -mt-3">
                      <Link className="btn btn-link btn-sm min-h-0 h-auto px-0 text-primary" to="/forgot-password">
                        {t("auth.forgotPassword")}
                      </Link>
                    </div>
                    <div className="divider my-0"></div>
                    <GoogleSignInButton disabled={googleBusy} onCredential={handleGoogleCredential} onUnavailable={handleGoogleUnavailable} locale={lang} label={t("auth.googleBtn")} />
                    <div className="divider my-0">{t("auth.or")}</div>

                    <button
                      className="btn btn-secondary text-base sm:text-lg text-white w-full"
                      type="button"
                      onClick={() =>
                        document.getElementById("createaccount")?.showModal()
                      }
                    >
                      {t("auth.createAccount")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {googleCredential && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="google-link-title">
          <form className="modal-box flex flex-col gap-4" onSubmit={event => { event.preventDefault(); handleGoogleCredential(googleCredential, linkPassword); }}>
            <h2 id="google-link-title" className="text-lg font-bold">{t("auth.googleLinkTitle")}</h2>
            <p>{t("auth.googleLinkHelp")}</p>
            <label className="flex flex-col gap-2">{t("auth.password")}
              <input type="password" className="input input-bordered w-full" autoComplete="current-password" required value={linkPassword} onChange={event => setLinkPassword(event.target.value)} />
            </label>
            <Link to="/forgot-password" onClick={() => { setGoogleCredential(null); setLinkPassword(''); }} className="link link-primary">{t("auth.forgotPassword")}</Link>
            <button type="submit" className="btn btn-primary" disabled={googleBusy}>{t("auth.googleLinkConfirm")}</button>
            <button type="button" className="btn btn-ghost" disabled={googleBusy} onClick={() => { setGoogleCredential(null); setLinkPassword(''); }}>{t("common.cancel")}</button>
          </form>
        </div>
      )}
      {/* Modal register */}
      <dialog id="createaccount" className="modal px-4">
        <div className="modal-box relative w-full max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <UserRegister />
        </div>
      </dialog>
    </>
  );
}

export default Login;
