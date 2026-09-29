import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { mainApi } from "@/api/mainApi";
import { useLang } from "@/i18n";
import { stopLocationTracking } from "@/services/locationTracking";
const ConversationPanel=lazy(()=>import("@/pages/Chat").then((module)=>({default:module.ConversationPanel})));

const labels={th:{chat:"แชท",open:"เปิดแชท",full:"เปิดหน้าแชทเต็ม"},en:{chat:"Chat",open:"Open chat",full:"Full chat page"},zh:{chat:"聊天",open:"打开聊天",full:"打开完整聊天页"},ko:{chat:"채팅",open:"채팅 열기",full:"전체 채팅 페이지 열기"}};

export default function ChatDock(){
  const {pathname}=useLocation();const {lang}=useLang();const text=labels[lang]||labels.en;
  const [open,setOpen]=useState(false);const [threads,setThreads]=useState([]);const [selected,setSelected]=useState(null);
  const refresh=useCallback(async()=>{try{const {data}=await mainApi.get("/social/conversations");setThreads(data.data);setSelected((current)=>current??data.data[0]?.id??null)}catch{/* show dock when API is available */}},[]);
  useEffect(()=>{if(!open)return;const initial=setTimeout(refresh,0);const timer=setInterval(refresh,15000);return()=>{clearTimeout(initial);clearInterval(timer)}},[open,refresh]);
  useEffect(()=>()=>stopLocationTracking(true),[]);
  if(pathname==="/chat") return null;
  return <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
    {open&&<section className="flex h-[min(70dvh,560px)] w-[min(94vw,380px)] flex-col overflow-hidden rounded-2xl border border-base-content/15 bg-base-100 shadow-2xl" aria-label={text.chat}>
      <header className="flex items-center gap-2 border-b border-base-content/10 p-3"><strong className="flex-1">{text.chat}</strong><Link className="btn btn-ghost btn-xs" to="/chat">{text.full}</Link><button className="btn btn-ghost btn-circle btn-xs" onClick={()=>setOpen(false)} aria-label={text.open}><FiX/></button></header>
      <div className="flex gap-1 overflow-x-auto border-b border-base-content/10 p-2">{threads.map((thread)=><button key={thread.id} className={`btn btn-xs whitespace-nowrap ${thread.id===selected?"btn-primary":"btn-ghost"}`} onClick={()=>setSelected(thread.id)}>{thread.name||thread.participants?.map((p)=>p.username).join(", ")||text.chat}</button>)}</div>
      <Suspense fallback={<div className="grid flex-1 place-items-center"><span className="loading loading-spinner"/></div>}><ConversationPanel key={selected||"none"} conversationId={selected} compact/></Suspense>
      <button className="btn btn-sm m-2" onClick={refresh}>{text.open}</button>
    </section>}
    <button className="btn btn-circle btn-primary h-14 w-14 shadow-xl" onClick={()=>setOpen((v)=>!v)} aria-label={text.open} aria-expanded={open}><FiMessageCircle className="text-xl"/></button>
  </div>;
}
