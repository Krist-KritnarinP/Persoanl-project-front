import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/validations/schema";

import { toast } from "react-toastify";
import { mainApi } from "@/api/mainApi";

function UserRegister() {
  const { formState, register, handleSubmit, reset } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    }
  })
  const{errors} =formState
  
  const onSubmit = async (data) => {

       try {
     const resp = await mainApi.post('/auth/register',data);
     toast(resp.data.message)
   } catch (err) {
     console.log(err, err.response?.data?.error);
     toast(err.response?.data?.error)
   }

  }
  return (
    <>
      <div className="text-3xl text-center opacity-70">
        Create a new account
      </div>
      <div className="divider opacity-60"></div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 p-4 pt-3"
      >
        <div className="w-full">
        <input
          type="text"
          {...register('username')}
          placeholder="Username"
          className="input input-bordered w-full"  
        />
        <p className="text-sm text-error">{errors.username?.message}</p>
        </div>

        <div className="w-full">
        <input
          type="email"
          placeholder="Email "
          {...register('email')}
          className="input input-bordered w-full"
        />
        <p className="text-sm text-error">{errors.email?.message}</p>

        </div>

        <div className="w-full">
        
        <input
          type="password"
          {...register('password')}
          placeholder="password"
          className="input input-bordered w-full"
        />
        <p className="text-sm text-error">{errors.password?.message}</p>
        </div>

        <div className="w-full">
        <input
          type="password"
          {...register('confirmPassword')}
          placeholder="Confirm password"
          className="input input-bordered w-full"
        />
        <p className="text-sm text-error">{errors.confirmPassword?.message}</p>

        </div>

        <button className="btn btn-secondary text-xl text-white">
          Sign up</button>
        <button className="btn btn-warning text-xl text-white"
        type="button" onClick={()=>reset()}>
          Reset</button>
      </form>
      {/* <div className="border">
				<pre className="text-error text-xs">
					{JSON.stringify(errors, (k, v) => k === 'ref' ? undefined : v, 2)}</pre>
			</div> */}
    </>
  )
}

export default UserRegister;
