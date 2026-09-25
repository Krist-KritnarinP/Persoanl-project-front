import React from "react";
import UserRegister from "@/components/UserRegister"; // 👈 เพิ่มบรรทัดนี้
import useUserStore from "@/stores/userStore";
import { loginSchema } from "@/validations/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLang } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function Login() {
  const { t } = useLang();
  const login = useUserStore((state) => state.login);
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

  return (
    <>
      <div className="min-h-screen px-4 pt-10 md:pt-20 pb-20 md:pb-28 flex items-center justify-center">
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
                    <div className="divider my-0"></div>

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
