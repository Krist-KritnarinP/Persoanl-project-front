import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { mainApi } from "@/api/mainApi";
import { useLang } from "@/i18n";
import { stopLocationTracking } from "@/services/locationTracking";

const ConversationPanel = lazy(() => import("@/pages/Chat").then((module) => ({ default: module.ConversationPanel })));
const labels = {
  th: { chat: "แชท", open: "เปิดแชท", full: "เปิดหน้าแชทเต็ม", drag: "กดค้างแล้วลากปุ่มแชทไปตำแหน่งที่ต้องการ" },
  en: { chat: "Chat", open: "Open chat", full: "Full chat page", drag: "Drag and drop this button anywhere along the screen edges" },
  zh: { chat: "聊天", open: "打开聊天", full: "打开完整聊天页", drag: "按住并拖动聊天按钮到屏幕边缘的任意位置" },
  ko: { chat: "채팅", open: "채팅 열기", full: "전체 채팅 페이지 열기", drag: "채팅 버튼을 누른 채 화면 가장자리의 원하는 위치로 드래그하세요" },
};
const BUTTON_SIZE = 56;
const EDGE_GAP = 8;

function clampPosition(x, y) {
  return {
    x: Math.max(EDGE_GAP, Math.min(x, window.innerWidth - BUTTON_SIZE - EDGE_GAP)),
    y: Math.max(EDGE_GAP, Math.min(y, window.innerHeight - BUTTON_SIZE - EDGE_GAP)),
  };
}

function initialPosition() {
  try {
    const saved = JSON.parse(localStorage.getItem("chat-dock-position") || "null");
    if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) return clampPosition(saved.x, saved.y);
    const corner = localStorage.getItem("chat-dock-corner") || "bottom-right";
    return clampPosition(
      corner.endsWith("left") ? EDGE_GAP : window.innerWidth - BUTTON_SIZE - EDGE_GAP,
      corner.startsWith("top") ? EDGE_GAP : window.innerHeight - BUTTON_SIZE - EDGE_GAP,
    );
  } catch {
    return clampPosition(window.innerWidth - BUTTON_SIZE - EDGE_GAP, window.innerHeight - BUTTON_SIZE - EDGE_GAP);
  }
}

export default function ChatDock() {
  const { pathname } = useLocation();
  const { lang } = useLang();
  const text = labels[lang] || labels.en;
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [position, setPosition] = useState(initialPosition);
  const dragged = useRef(false);
  const origin = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const { data } = await mainApi.get("/social/conversations");
      setThreads(data.data);
      setSelected((current) => current ?? data.data[0]?.id ?? null);
    } catch { /* show dock when API is available */ }
  }, []);
  useEffect(() => {
    if (!open) return undefined;
    const initial = setTimeout(refresh, 0);
    const timer = setInterval(refresh, 15000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, [open, refresh]);
  useEffect(() => () => stopLocationTracking(true), []);
  useEffect(() => {
    const resize = () => setPosition((current) => clampPosition(current.x, current.y));
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const persistPosition = (next) => {
    const corner = `${next.y < window.innerHeight / 2 ? "top" : "bottom"}-${next.x < window.innerWidth / 2 ? "left" : "right"}`;
    setPosition(next);
    try {
      localStorage.setItem("chat-dock-position", JSON.stringify(next));
      localStorage.setItem("chat-dock-corner", corner);
    } catch { /* storage can be unavailable */ }
  };
  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragged.current = false;
    origin.current = {
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (!origin.current) return;
    const moved = Math.abs(event.clientX - origin.current.startX) > 4 || Math.abs(event.clientY - origin.current.startY) > 4;
    if (!moved) return;
    dragged.current = true;
    setPosition(clampPosition(event.clientX - origin.current.offsetX, event.clientY - origin.current.offsetY));
  };
  const onPointerUp = (event) => {
    if (!origin.current) return;
    if (dragged.current) {
      persistPosition(clampPosition(event.clientX - origin.current.offsetX, event.clientY - origin.current.offsetY));
    }
    origin.current = null;
  };

  if (pathname === "/chat") return null;
  const panelOnRight = position.x + BUTTON_SIZE / 2 >= window.innerWidth / 2;
  const panelBelow = position.y + BUTTON_SIZE / 2 < window.innerHeight / 2;
  const panelWidth = Math.min(window.innerWidth * 0.94, 380);
  const panelHeight = Math.min(window.innerHeight * 0.7, 560);
  const panelLeft = Math.max(EDGE_GAP, Math.min(
    panelOnRight ? position.x + BUTTON_SIZE - panelWidth : position.x,
    window.innerWidth - panelWidth - EDGE_GAP,
  ));
  const panelTop = Math.max(EDGE_GAP, Math.min(
    panelBelow ? position.y + BUTTON_SIZE + EDGE_GAP : position.y - panelHeight - EDGE_GAP,
    window.innerHeight - panelHeight - EDGE_GAP,
  ));

  return (
    <div className="fixed z-50" style={{ left: position.x, top: position.y }} data-testid="chat-dock-position">
      {open && (
        <section
          className="social-ui social-surface fixed flex h-[min(70dvh,560px)] w-[min(94vw,380px)] flex-col overflow-hidden rounded-2xl border border-base-content/15 bg-base-100 shadow-2xl"
          style={{ left: panelLeft, top: panelTop }}
          aria-label={text.chat}
        >
          <header className="flex shrink-0 items-center gap-2 border-b border-base-content/10 bg-primary/5 p-3">
            <FiMessageCircle className="text-primary text-xl"/><strong className="flex-1">{text.chat}</strong>
            <Link className="btn btn-ghost btn-xs" to="/chat">{text.full}</Link>
            <button className="btn btn-ghost btn-circle btn-xs" onClick={() => setOpen(false)} aria-label={text.open}><FiX /></button>
          </header>
          <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-base-content/10 p-2">
            {threads.map((thread) => <button key={thread.id} aria-pressed={thread.id === selected} className={`btn btn-xs whitespace-nowrap ${thread.id === selected ? "btn-primary" : "btn-ghost"}`} onClick={() => setSelected(thread.id)}>{thread.name || thread.participants?.map((p) => p.username).join(", ") || text.chat}</button>)}
          </div>
          <Suspense fallback={<div className="grid flex-1 place-items-center"><span className="loading loading-spinner" /></div>}>
            <ConversationPanel key={selected || "none"} conversationId={selected} compact />
          </Suspense>
          <button className="btn btn-ghost btn-sm m-2 shrink-0" onClick={refresh}>{text.open}</button>
        </section>
      )}
      <button
        data-testid="chat-dock-button"
        className="btn btn-circle btn-primary h-14 w-14 touch-none cursor-grab select-none shadow-xl active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => { if (dragged.current) { dragged.current = false; return; } setOpen((value) => !value); }}
        aria-label={text.open}
        aria-expanded={open}
        title={text.drag}
      ><FiMessageCircle className="text-xl" /></button>
    </div>
  );
}
