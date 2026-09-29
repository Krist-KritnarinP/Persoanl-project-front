import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { mainApi } from "@/api/mainApi";
import { useLang } from "@/i18n";
import { stopLocationTracking } from "@/services/locationTracking";
const ConversationPanel=lazy(()=>import("@/pages/Chat").then((module)=>({default:module.ConversationPanel})));

const labels={th:{chat:"แชท",open:"เปิดแชท",full:"เปิดหน้าแชทเต็ม"},en:{chat:"Chat",open:"Open chat",full:"Full chat page"},zh:{chat:"聊天",open:"打开聊天",full:"打开完整聊天页"},ko:{chat:"채팅",open:"채팅 열기",full:"전체 채팅 페이지 열기"}};
const corners = ["bottom-right", "bottom-left", "top-right", "top-left"];

export default function ChatDock(){
  const {pathname}=useLocation();const {lang}=useLang();const text=labels[lang]||labels.en;
  const [open,setOpen]=useState(false);const [threads,setThreads]=useState([]);const [selected,setSelected]=useState(null);
  const [corner,setCorner]=useState(()=>{
    try { const saved=localStorage.getItem("chat-dock-corner"); return corners.includes(saved)?saved:"bottom-right"; }
    catch { return "bottom-right"; }
  });
  const dragged=useRef(false);
  const origin=useRef(null);
  const refresh=useCallback(async()=>{try{const {data}=await mainApi.get("/social/conversations");setThreads(data.data);setSelected((current)=>current??data.data[0]?.id??null)}catch{/* show dock when API is available */}},[]);
  useEffect(()=>{if(!open)return;const initial=setTimeout(refresh,0);const timer=setInterval(refresh,15000);return()=>{clearTimeout(initial);clearInterval(timer)}},[open,refresh]);
  useEffect(()=>()=>stopLocationTracking(true),[]);
  const persistCorner=(next)=>{
    setCorner(next);
    try { localStorage.setItem("chat-dock-corner",next); } catch { /* storage can be unavailable */ }
  };
  const onPointerDown=(event)=>{
    if(event.button!==0) return;
    dragged.current=false;
    origin.current={x:event.clientX,y:event.clientY};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove=(event)=>{
    if(!origin.current) return;
    if(Math.abs(event.clientX-origin.current.x)>8||Math.abs(event.clientY-origin.current.y)>8) dragged.current=true;
  };
  const onPointerUp=(event)=>{
    if(!origin.current) return;
    if(dragged.current){
      const horizontal=event.clientX<window.innerWidth/2?"left":"right";
      const vertical=event.clientY<window.innerHeight/2?"top":"bottom";
      persistCorner(`${vertical}-${horizontal}`);
    }
    origin.current=null;
  };
  if(pathname==="/chat") return null;
  const left=corner.endsWith("left");
  const top=corner.startsWith("top");
  return <div className={`fixed z-50 flex ${left?"left-4 items-start":"right-4 items-end"} ${top?"top-4 flex-col-reverse":"bottom-4 flex-col"} gap-2`}>
    {open&&<section className="flex h-[min(70dvh,560px)] w-[min(94vw,380px)] flex-col overflow-hidden rounded-2xl border border-base-content/15 bg-base-100 shadow-2xl" aria-label={text.chat}>
      <header className="flex items-center gap-2 border-b border-base-content/10 p-3"><strong className="flex-1">{text.chat}</strong><Link className="btn btn-ghost btn-xs" to="/chat">{text.full}</Link><button className="btn btn-ghost btn-circle btn-xs" onClick={()=>setOpen(false)} aria-label={text.open}><FiX/></button></header>
      <div className="flex gap-1 overflow-x-auto border-b border-base-content/10 p-2">{threads.map((thread)=><button key={thread.id} className={`btn btn-xs whitespace-nowrap ${thread.id===selected?"btn-primary":"btn-ghost"}`} onClick={()=>setSelected(thread.id)}>{thread.name||thread.participants?.map((p)=>p.username).join(", ")||text.chat}</button>)}</div>
      <Suspense fallback={<div className="grid flex-1 place-items-center"><span className="loading loading-spinner"/></div>}><ConversationPanel key={selected||"none"} conversationId={selected} compact/></Suspense>
      <button className="btn btn-sm m-2" onClick={refresh}>{text.open}</button>
    </section>}
    <button className="btn btn-circle btn-primary h-14 w-14 touch-none cursor-grab shadow-xl active:cursor-grabbing" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={()=>{origin.current=null}} onClick={()=>{if(dragged.current){dragged.current=false;return}setOpen((v)=>!v)}} aria-label={text.open} aria-expanded={open} title={lang==="th"?"ลากเพื่อย้ายมุมแชท":"Drag to move chat to another corner"}><FiMessageCircle className="text-xl"/></button>
  </div>;
}
