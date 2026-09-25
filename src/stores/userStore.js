import { mainApi, apiRegister } from '@/api/mainApi'
import {create} from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'


const useUserStore = create( persist((set,get) => ({
 user: null,
 token : '',
 login : async (data)=>{
   const resp = await mainApi.post('/auth/login',data )
   set({token : resp.data.token, user: resp.data.user})
   return resp
 },
 register: async (data)=>{
   const resp = await apiRegister(data)
   return resp
 },
 logout: () => set({token : '', user: null})
}), {
 name: 'authState',
 storage: createJSONStorage( ()=> localStorage ),
 partialize: (state) => ({ user: state.user, token: state.token }),
}))

export default useUserStore
