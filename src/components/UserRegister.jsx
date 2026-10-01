import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/validations/schema";
import { useLang } from "@/i18n";
import PasswordStrength from "@/components/PasswordStrength";

import { toast } from "react-toastify";
import { mainApi } from "@/api/mainApi";

function UserRegister() {
  const { t } = useLang();
  const { control, formState, register, handleSubmit, reset, setError, setFocus } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const { errors, isSubmitting } = formState;
  const password = useWatch({ control, name: "password" }) || "";

  const onSubmit = async (data) => {
    try {
      const { confirmPassword: _omit, ...payload } = data;
      await mainApi.post("/auth/register", payload);
      toast.success(t("auth.registerOk"));
      reset();
      document.getElementById("createaccount")?.close();
    } catch (error) {
      if (error?.response?.data?.code === "EMAIL_ALREADY_REGISTERED") {
        setError("email", { type: "server", message: "auth.emailTaken" });
        setFocus("email");
      } else {
        toast.error(t("auth.registerFail"));
      }
    }
  };
  return (
    <>
      <div className="text-2xl sm:text-3xl text-center opacity-70">
        {t("auth.signupTitle")}
      </div>
      <div className="divider opacity-60"></div>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit, (invalid) => {
          const first = ["username", "email", "password", "confirmPassword"].find((field) => invalid[field]);
          if (first) setFocus(first);
        })}
        className="flex flex-col gap-4 sm:gap-5 p-2 sm:p-4 pt-3"
      >
        <div className="w-full">
          <input
            type="text"
            {...register("username")}
            aria-label={t("auth.username")}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? "signup-username-error" : undefined}
            autoComplete="username"
            placeholder={t("auth.username")}
            className="input input-bordered w-full text-base"
          />
          <p id="signup-username-error" className="text-sm text-error" role={errors.username ? "alert" : undefined}>
            {errors.username && t(errors.username.message)}
          </p>
        </div>

        <div className="w-full">
          <input
            type="email"
            placeholder={t("auth.email")}
            {...register("email")}
            aria-label={t("auth.email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            autoComplete="email"
            className="input input-bordered w-full text-base"
          />
          <p id="signup-email-error" className="text-sm text-error" role={errors.email ? "alert" : undefined}>
            {errors.email && t(errors.email.message)}
          </p>
        </div>

        <div className="w-full">
          <input
            type="password"
            {...register("password")}
            aria-label={t("auth.password")}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={`password-strength${errors.password ? " signup-password-error" : ""}`}
            autoComplete="new-password"
            placeholder={t("auth.password")}
            className="input input-bordered w-full text-base"
          />
          <p id="signup-password-error" className="text-sm text-error" role={errors.password ? "alert" : undefined}>
            {errors.password && t(errors.password.message)}
          </p>
          <PasswordStrength password={password} />
        </div>

        <div className="w-full">
          <input
            type="password"
            {...register("confirmPassword")}
            aria-label={t("auth.confirmPassword")}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "signup-confirm-error" : undefined}
            autoComplete="new-password"
            placeholder={t("auth.confirmPassword")}
            className="input input-bordered w-full text-base"
          />
          <p id="signup-confirm-error" className="text-sm text-error" role={errors.confirmPassword ? "alert" : undefined}>
            {errors.confirmPassword && t(errors.confirmPassword.message)}
          </p>
        </div>

        <button className="btn btn-primary text-lg" disabled={isSubmitting}>
          {t("auth.signup")}
        </button>
        <button
          className="btn btn-ghost text-lg"
          type="button"
          onClick={() => reset()}
        >
          {t("auth.reset")}
        </button>
      </form>
      {/* <div className="border">
				<pre className="text-error text-xs">
					{JSON.stringify(errors, (k, v) => k === 'ref' ? undefined : v, 2)}</pre>
			</div> */}
    </>
  );
}

export default UserRegister;
