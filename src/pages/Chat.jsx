import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiMessageCircle, FiPlus, FiSend, FiUsers } from "react-icons/fi";
import { mainApi } from "@/api/mainApi";
import useUserStore from "@/stores/userStore";
import { useLang } from "@/i18n";
import { startLocationTracking, stopLocationTracking } from "@/services/locationTracking";

const copy = {
  th: { title:"เพื่อนและแชท", intro:"คุยกับเพื่อน วางแผนเป็นกลุ่ม และแชร์พิกัดเมื่อคุณอนุญาต", friends:"เพื่อน", add:"เพิ่มเพื่อนด้วยอีเมล", pending:"คำขอเป็นเพื่อน", accept:"ยอมรับ", create:"เริ่มแชท / สร้างกลุ่ม", name:"ชื่อกลุ่ม (เว้นว่างสำหรับแชทส่วนตัว)", choose:"เลือกเพื่อน", start:"สร้างแชท", inbox:"ข้อความ", empty:"เลือกแชทหรือเริ่มคุยกับเพื่อน", write:"พิมพ์ข้อความ…", send:"ส่ง", request:"ขอพิกัด", share:"แชร์พิกัด", duration:"แชร์นานแค่ไหน", stop:"หยุดแชร์", active:"กำลังแชร์พิกัด", noFriends:"ยังไม่มีเพื่อนที่ตอบรับ", locationRequest:"ขอพิกัดแล้ว · แชร์ได้เมื่อคุณยินยอม", map:"เปิดแผนที่", addOk:"ส่งคำขอเป็นเพื่อนแล้ว", groupOk:"สร้างกลุ่มแล้ว", fail:"ทำรายการไม่สำเร็จ ลองอีกครั้ง", place:"ข้อความของคุณ", newFriend:"อีเมลบัญชีเพื่อน" },
  en: { title:"Friends & chat", intro:"Chat with friends, plan in groups, and share location only when you approve.", friends:"Friends", add:"Add a friend by email", pending:"Friend requests", accept:"Accept", create:"Start chat / create group", name:"Group name (blank for direct chat)", choose:"Choose friends", start:"Create chat", inbox:"Messages", empty:"Choose a chat or start a conversation", write:"Write a message…", send:"Send", request:"Request location", share:"Share location", duration:"Share for", stop:"Stop sharing", active:"Sharing location", noFriends:"No accepted friends yet", locationRequest:"Location requested · sharing is always your choice", map:"Open map", addOk:"Friend request sent", groupOk:"Conversation created", fail:"Could not complete that action. Try again.", place:"Your message", newFriend:"Friend’s account email" },
  zh: { title:"好友与聊天", intro:"与朋友聊天并规划行程；只有你同意后才会分享位置。", friends:"好友", add:"通过邮箱添加好友", pending:"好友请求", accept:"接受", create:"开始聊天 / 创建群组", name:"群组名称（留空则为私聊）", choose:"选择好友", start:"创建聊天", inbox:"消息", empty:"选择聊天或开始对话", write:"输入消息…", send:"发送", request:"请求位置", share:"分享位置", duration:"分享时长", stop:"停止分享", active:"正在分享位置", noFriends:"暂无已接受的好友", locationRequest:"已请求位置 · 是否分享由你决定", map:"打开地图", addOk:"好友请求已发送", groupOk:"聊天已创建", fail:"操作失败，请重试", place:"你的消息", newFriend:"好友账号邮箱" },
  ko: { title:"친구 및 채팅", intro:"친구와 대화하고 그룹으로 계획하세요. 위치는 동의한 경우에만 공유됩니다.", friends:"친구", add:"이메일로 친구 추가", pending:"친구 요청", accept:"수락", create:"채팅 시작 / 그룹 만들기", name:"그룹 이름 (비우면 1:1 채팅)", choose:"친구 선택", start:"채팅 만들기", inbox:"메시지", empty:"채팅을 선택하거나 대화를 시작하세요", write:"메시지 입력…", send:"보내기", request:"위치 요청", share:"위치 공유", duration:"공유 시간", stop:"공유 중지", active:"위치 공유 중", noFriends:"수락된 친구가 없습니다", locationRequest:"위치 요청 · 공유 여부는 본인이 선택합니다", map:"지도 열기", addOk:"친구 요청을 보냈습니다", groupOk:"채팅을 만들었습니다", fail:"작업에 실패했습니다. 다시 시도하세요", place:"메시지", newFriend:"친구 계정 이메일" },
};
const durations = [5,15,60,480,1440];
const durationLabel = (n,lang) => n<60 ? `${n} ${lang==="th"?"นาที":"min"}` : n<1440 ? `${n/60} ${lang==="th"?"ชม.":"hr"}` : `24 ${lang==="th"?"ชม.":"hr"}`;

export function ConversationPanel({ conversationId, compact=false }) {
  const { lang } = useLang();
  const c = copy[lang] || copy.en;
  const userId = useUserStore((s)=>s.user?.id);
  const [messages,setMessages] = useState([]);
  const [locations,setLocations] = useState([]);
  const [draft,setDraft] = useState("");
  const [duration,setDuration] = useState(60);
  const [sharing,setSharing] = useState(false);
  const [shareExpiresAt,setShareExpiresAt] = useState(null);
  const [notice,setNotice] = useState("");
  const lastMessageId=useRef("0");
  const load = useCallback(async()=>{
    if(!conversationId) return;
    try {
      const after = lastMessageId.current;
      const [m,l] = await Promise.all([
        mainApi.get(`/social/conversations/${conversationId}/messages`,{params:{after}}),
        mainApi.get(`/social/conversations/${conversationId}/locations`),
      ]);
      if(m.data.data.length){lastMessageId.current=m.data.data.at(-1).id;setMessages((old)=>after==="0"?m.data.data:[...old,...m.data.data]);mainApi.patch(`/social/notifications/conversations/${conversationId}/read`).catch(()=>{});}
      setLocations(l.data.data);
    } catch { /* a transient poll failure should not clear a conversation */ }
  },[conversationId]);
  useEffect(()=>{ lastMessageId.current="0";if(conversationId)load(); },[conversationId,load]);
  useEffect(()=>{ if(!conversationId) return; const timer=setInterval(load,4000); return ()=>clearInterval(timer); },[conversationId,load]);
  useEffect(()=>{if(!shareExpiresAt)return;const timer=setTimeout(()=>{setSharing(false);setShareExpiresAt(null);setNotice("")},Math.max(0,new Date(shareExpiresAt).getTime()-Date.now()));return()=>clearTimeout(timer)},[shareExpiresAt]);
  useEffect(()=>{
    if(!conversationId)return;
    const initial=setTimeout(()=>mainApi.get(`/social/conversations/${conversationId}/location-shares`).then(({data})=>{
      const expires=data.data?.expiresAt;
      if(expires&&new Date(expires).getTime()>Date.now()&&startLocationTracking(conversationId,expires)){
        setShareExpiresAt(expires);setSharing(true);
      }
    }).catch(()=>{}),0);
    return()=>clearTimeout(initial);
  },[conversationId]);
  const send=async(e)=>{e.preventDefault(); if(!draft.trim()) return; const body=draft.trim(); setDraft(""); try { await mainApi.post(`/social/conversations/${conversationId}/messages`,{body}); await load(); } catch { setDraft(body); setNotice(c.fail); } };
  const request=async()=>{try{await mainApi.post(`/social/conversations/${conversationId}/location-requests`);await load();}catch{setNotice(c.fail)}};
  const startShare=()=>{
    if(!navigator.geolocation){setNotice(c.fail);return;}
    navigator.geolocation.getCurrentPosition(async({coords})=>{
      try { const {data}=await mainApi.post(`/social/conversations/${conversationId}/location-shares`,{minutes:duration}); await mainApi.put(`/social/conversations/${conversationId}/location`,{latitude:coords.latitude,longitude:coords.longitude,accuracy:coords.accuracy}); startLocationTracking(conversationId,data.data.expiresAt);setShareExpiresAt(data.data.expiresAt);setSharing(true); setNotice(c.active); await load(); }
      catch {setNotice(c.fail)}
    },()=>setNotice(c.fail),{enableHighAccuracy:true,timeout:15000});
  };
  const stop=async()=>{try{await mainApi.delete(`/social/conversations/${conversationId}/location-shares`);stopLocationTracking(false);setSharing(false);setShareExpiresAt(null);setNotice("");await load()}catch{setNotice(c.fail)}};
  if(!conversationId) return <div className="grid h-full place-items-center p-6 text-center opacity-60"><FiMessageCircle className="text-3xl"/><p>{c.empty}</p></div>;
  return <div className={`flex min-h-0 flex-1 flex-col ${compact?"h-full":""}`}>
    <div className="flex flex-wrap items-center gap-2 border-b border-base-content/10 p-3">
      <button className="btn btn-outline btn-sm" onClick={request}><FiMapPin/> {c.request}</button>
      {sharing ? <button className="btn btn-error btn-sm" onClick={stop}>{c.stop}</button> : <><select className="select select-bordered select-sm" value={duration} onChange={(e)=>setDuration(Number(e.target.value))} aria-label={c.duration}>{durations.map(n=><option key={n} value={n}>{durationLabel(n,lang)}</option>)}</select><button className="btn btn-primary btn-sm" onClick={startShare}><FiMapPin/> {c.share}</button></>}
      {notice&&<span className="text-xs" role="status">{notice}</span>}
    </div>
    {!!locations.length&&<section className="grid gap-2 border-b border-base-content/10 p-3 sm:grid-cols-2" aria-label={c.map}>{locations.map((loc)=>{
      const lat=Number(loc.latitude);const lng=Number(loc.longitude);const pad=0.008;
      const mapSrc=`https://www.openstreetmap.org/export/embed.html?bbox=${lng-pad}%2C${lat-pad}%2C${lng+pad}%2C${lat+pad}&layer=mapnik&marker=${lat}%2C${lng}`;
      const googleUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
      return <article key={loc.userId} className="overflow-hidden rounded-xl border border-base-content/10 bg-base-100">
        <iframe title={`${loc.username} · ${c.map}`} src={mapSrc} loading="lazy" referrerPolicy="no-referrer" className="block h-36 w-full border-0" />
        <div className="flex items-center justify-between gap-2 p-2"><div className="min-w-0"><p className="truncate text-sm font-semibold">{loc.username}</p><p className="text-xs opacity-60">{new Date(loc.updatedAt).toLocaleTimeString()}</p></div><a className="btn btn-primary btn-xs shrink-0 gap-1" href={googleUrl} target="_blank" rel="noreferrer"><FiMapPin/>{c.map}</a></div>
      </article>;
    })}</section>}
    <div className="flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">{messages.map((m)=><div key={m.id} className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.senderId===userId?"ml-auto bg-primary text-primary-content":"bg-base-200"}`}>
      {m.kind==="location_request"?<><p className="text-sm">{m.senderId===userId?c.locationRequest:`${m.senderName||"Friend"} ${c.locationRequest}`}</p>{m.senderId!==userId&&<div className="mt-2 flex flex-wrap gap-2"><select className="select select-bordered select-xs text-base-content" value={duration} onChange={(e)=>setDuration(Number(e.target.value))}>{durations.map(n=><option key={n} value={n}>{durationLabel(n,lang)}</option>)}</select><button className="btn btn-xs btn-success" onClick={startShare}>{c.share}</button></div>}</>:<><p className="whitespace-pre-wrap break-words">{m.body}</p><p className="mt-1 text-[10px] opacity-60">{m.senderName||c.place} · {new Date(m.createdAt).toLocaleTimeString()}</p></>}
    </div>)}</div>
    <form className="flex gap-2 border-t border-base-content/10 p-3" onSubmit={send}><input className="input input-bordered min-w-0 flex-1" value={draft} maxLength={2000} onChange={(e)=>setDraft(e.target.value)} placeholder={c.write} aria-label={c.write}/><button className="btn btn-primary" disabled={!draft.trim()} aria-label={c.send}><FiSend/></button></form>
  </div>;
}

export default function Chat(){
  const [searchParams] = useSearchParams();
  const requestedConversation = searchParams.get("conversationId");
  const {lang}=useLang(); const c=copy[lang]||copy.en; const userId=useUserStore((s)=>s.user?.id);
  const [friends,setFriends]=useState([]);const [threads,setThreads]=useState([]);const [selected,setSelected]=useState(null);const [email,setEmail]=useState("");const [groupName,setGroupName]=useState("");const [picked,setPicked]=useState([]);const [notice,setNotice]=useState("");const [busy,setBusy]=useState(false);
  const refresh=useCallback(async()=>{try{const [f,t]=await Promise.all([mainApi.get("/social/friends"),mainApi.get("/social/conversations")]);setFriends(f.data.data);setThreads(t.data.data);setSelected((cur)=>{const requested=t.data.data.find((thread)=>String(thread.id)===requestedConversation);return requested?.id??(cur&&t.data.data.some((thread)=>thread.id===cur)?cur:t.data.data[0]?.id??null)})}catch{setNotice(c.fail)}},[c.fail,requestedConversation]);
  useEffect(()=>{const initial=setTimeout(refresh,0);const timer=setInterval(refresh,12000);return()=>{clearTimeout(initial);clearInterval(timer)}},[refresh]);
  const accepted=friends.filter((f)=>f.status==="accepted");const incoming=friends.filter((f)=>f.status==="pending"&&f.requestedBy!==userId);
  const active=useMemo(()=>threads.find((t)=>t.id===selected),[threads,selected]);
  const add=async(e)=>{e.preventDefault();setBusy(true);try{await mainApi.post("/social/friends",{email});setEmail("");setNotice(c.addOk);await refresh()}catch{setNotice(c.fail)}finally{setBusy(false)}};
  const accept=async(id)=>{try{await mainApi.post(`/social/friends/${id}/accept`);await refresh()}catch{setNotice(c.fail)}};
  const create=async(e)=>{e.preventDefault();setBusy(true);try{const {data}=await mainApi.post("/social/conversations",{name:groupName,memberIds:picked});await refresh();setSelected(data.data.id);setGroupName("");setPicked([]);setNotice(c.groupOk)}catch{setNotice(c.fail)}finally{setBusy(false)}};
  const direct=async(id)=>{setBusy(true);try{const {data}=await mainApi.post("/social/conversations",{memberIds:[id]});await refresh();setSelected(data.data.id)}catch{setNotice(c.fail)}finally{setBusy(false)}};
  return <main className="min-h-dvh p-4 md:p-7 space-y-5">
    <header className="flex items-start gap-3"><Link to="/dashboard" className="btn btn-ghost btn-circle" aria-label="Back"><FiArrowLeft/></Link><div><h1 className="text-3xl font-bold">{c.title}</h1><p className="opacity-70">{c.intro}</p></div></header>
    {notice&&<p className="alert py-2" role="status">{notice}</p>}
    <div className="grid min-h-[70vh] gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="card border border-base-content/10 bg-base-100 shadow-sm"><div className="card-body p-4"><h2 className="font-bold flex items-center gap-2"><FiUsers/>{c.friends}</h2><form className="flex gap-2" onSubmit={add}><input className="input input-bordered input-sm min-w-0 flex-1" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder={c.newFriend} aria-label={c.add} required/><button className="btn btn-primary btn-sm" disabled={busy}><FiPlus/></button></form>
        {incoming.length>0&&<div><p className="text-xs font-semibold opacity-70">{c.pending}</p>{incoming.map(f=><div key={f.id} className="flex items-center justify-between py-1"><span>{f.username}</span><button className="btn btn-xs btn-success" onClick={()=>accept(f.id)}>{c.accept}</button></div>)}</div>}
        <div className="max-h-48 space-y-1 overflow-auto">{accepted.length?accepted.map(f=><button key={f.id} className="btn btn-ghost btn-sm w-full justify-start" onClick={()=>direct(f.id)}><FiMessageCircle/>{f.username}</button>):<p className="text-sm opacity-60">{c.noFriends}</p>}</div></div></section>
        <section className="card border border-base-content/10 bg-base-100 shadow-sm"><div className="card-body p-4"><h2 className="font-bold">{c.create}</h2><form className="space-y-2" onSubmit={create}><input className="input input-bordered input-sm w-full" maxLength={100} value={groupName} onChange={(e)=>setGroupName(e.target.value)} placeholder={c.name}/><p className="text-xs opacity-60">{c.choose}</p><div className="max-h-36 space-y-1 overflow-auto">{accepted.map(f=><label key={f.id} className="flex items-center gap-2"><input type="checkbox" className="checkbox checkbox-sm" checked={picked.includes(f.id)} onChange={(e)=>setPicked(e.target.checked?[...picked,f.id]:picked.filter((x)=>x!==f.id))}/><span>{f.username}</span></label>)}</div><button className="btn btn-primary btn-sm w-full" disabled={busy||!picked.length}>{c.start}</button></form></div></section>
      </aside>
      <section className="flex min-h-[60vh] flex-col overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 shadow-sm"><div className="flex gap-2 overflow-x-auto border-b border-base-content/10 p-2">{threads.map(t=><button key={t.id} onClick={()=>setSelected(t.id)} className={`btn btn-sm whitespace-nowrap ${selected===t.id?"btn-primary":"btn-ghost"}`}>{t.name||t.participants?.map(p=>p.username).join(", ")||"Chat"}</button>)}</div><div className="flex min-h-0 flex-1 flex-col"><div className="border-b border-base-content/10 px-4 py-3 font-semibold">{active?.name||active?.participants?.map(p=>p.username).join(", ")||c.inbox}</div>{active?<ConversationPanel key={active.id} conversationId={active.id}/>:<div className="grid flex-1 place-items-center opacity-60">{c.empty}</div>}</div></section>
    </div>
  </main>;
}
