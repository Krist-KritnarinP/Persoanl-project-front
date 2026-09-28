import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/validations/schema";
import { useLang } from "@/i18n";

import { toast } from "react-toastify";
import { mainApi } from "@/api/mainApi";

function UserRegister() {
  const { t } = useLang();
  const { formState, register, handleSubmit, reset } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  const { errors } = formState;

  const onSubmit = async (data) => {
    try {
      const { confirmPassword: _omit, ...payload } = data;
      await mainApi.post("/auth/register", payload);
      toast.success(t("auth.registerOk"));
      reset();
      document.getElementById("createaccount")?.close();
    } catch {
      toast.error(t("auth.registerFail"));
    }
  };
  return (
    <>
      <div className="text-2xl sm:text-3xl text-center opacity-70">
        {t("auth.signupTitle")}
      </div>
      <div className="divider opacity-60"></div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:gap-5 p-2 sm:p-4 pt-3"
      >
        <div className="w-full">
          <input
            type="text"
            {...register("username")}
            placeholder={t("auth.username")}
            className="input input-bordered w-full text-base"
          />
          <p className="text-sm text-error">
            {errors.username && t(errors.username.message)}
          </p>
        </div>

        <div className="w-full">
          <input
            type="email"
            placeholder={t("auth.email")}
            {...register("email")}
            className="input input-bordered w-full text-base"
          />
          <p className="text-sm text-error">
            {errors.email && t(errors.email.message)}
          </p>
        </div>

        <div className="w-full">
          <input
            type="password"
            {...register("password")}
            placeholder={t("auth.password")}
            className="input input-bordered w-full text-base"
          />
          <p className="text-sm text-error">
            {errors.password && t(errors.password.message)}
          </p>
        </div>

        <div className="w-full">
          <input
            type="password"
            {...register("confirmPassword")}
            placeholder={t("auth.confirmPassword")}
            className="input input-bordered w-full text-base"
          />
          <p className="text-sm text-error">
            {errors.confirmPassword && t(errors.confirmPassword.message)}
          </p>
        </div>

        <button className="btn btn-secondary text-lg text-white">
          {t("auth.signup")}
        </button>
        <button
          className="btn btn-warning text-lg text-white"
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
