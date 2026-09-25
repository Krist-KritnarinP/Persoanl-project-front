import React from "react";
import UserRegister from "@/components/UserRegister"; // 👈 เพิ่มบรรทัดนี้
import useUserStore from "@/stores/userStore";
import { loginSchema } from "@/validations/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
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
      toast.success("Login Success!!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login Fail!");
    }
  };

  return (
    <>
      <div className="min-h-screen pt-20 pb-28 flex items-center justify-center">
        <div className="p-5 mx-auto max-w-5xl min-h-135 flex justify-between items-center w-full">
          {/* ฝั่งซ้าย: ข้อความต้อนรับ */}
          <div className="flex flex-col gap-4 basis-3/5">
            <div className="text-6xl p-2 text-primary font-bold">AI LHOUNG</div>
            <div>
              <h2 className="text-[20px] leading-8 mt-3 w-129 text-base-content/80 max-md:hidden">
                นี่ไม่ใช่เครื่องมือกันหลงเธอ แต่ไว้กันหลงทาง
              </h2>
            
            </div>
          </div>

          {/* ฝั่งขวา: ฟอร์ม Login */}
          <div className="aura aura-dual w-full shadow-xl">
            <div className="card bg-base-100">
              <div className="card-body">
                <span className="flex justify-center text-xl mx-1">
                  Ready for your next
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
                  <div className="card-body flex justify-center w-full gap-4 p-6">
                    <div className="w-full">
                      <input
                        type="email"
                        {...register("email")}
                        className="input input-bordered w-full"
                        placeholder="E-mail"
                      />
                      <p className="text-sm text-error mt-1">
                        {errors.email?.message}
                      </p>
                    </div>

                    <div className="w-full">
                      <input
                        type="password"
                        {...register("password")}
                        className="input input-bordered w-full"
                        placeholder="Password"
                      />
                      <p className="text-sm text-error mt-1">
                        {errors.password?.message}
                      </p>
                    </div>

                    <button className="btn btn-primary text-xl w-full">
                      Login
                    </button>
                    <div className="divider my-0"></div>

                    <button
                      className="btn btn-secondary text-lg text-white w-full"
                      type="button"
                      onClick={() =>
                        document.getElementById("createaccount")?.showModal()
                      }
                    >
                      Create new account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal register */}
      <dialog id="createaccount" className="modal">
        <div className="modal-box relative">
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
