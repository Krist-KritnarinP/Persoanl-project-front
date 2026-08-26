import { mainApi } from '@/api/mainApi'
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
 logout: () => set({token : '', user: null})
}), {
 name: 'authState',
 storage: createJSONStorage( ()=> localStorage )
}))

export default useUserStore
