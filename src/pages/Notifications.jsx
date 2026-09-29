import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiMessageCircle, FiUserPlus } from "react-icons/fi";
import TripInvitations from "@/components/TripInvitations";
import { mainApi } from "@/api/mainApi";
import { useLang } from "@/i18n";

const words = {
  th: { title:"การแจ้งเตือน", intro:"คำเชิญร่วมทริป คำขอเป็นเพื่อน และข้อความใหม่", empty:"ยังไม่มีการแจ้งเตือน", friend:"{name} ส่งคำขอเป็นเพื่อน", message:"{name} ส่งข้อความมา", accept:"ยอมรับเพื่อน", accepted:"เป็นเพื่อนแล้ว", open:"เปิดแชท", all:"อ่านทั้งหมด", failed:"โหลดการแจ้งเตือนไม่สำเร็จ" },
  en: { title:"Notifications", intro:"Trip invitations, friend requests and new messages", empty:"You're all caught up", friend:"{name} sent you a friend request", message:"{name} sent a message", accept:"Accept friend", accepted:"Friends", open:"Open chat", all:"Mark all read", failed:"Could not load notifications" },
  zh: { title:"通知", intro:"行程邀请、好友请求和新消息", empty:"暂无通知", friend:"{name}向你发送了好友请求", message:"{name}发来一条消息", accept:"接受好友请求", accepted:"已成为好友", open:"打开聊天", all:"全部标为已读", failed:"无法加载通知" },
  ko: { title:"알림", intro:"여행 초대, 친구 요청 및 새 메시지", empty:"새 알림이 없습니다", friend:"{name}님이 친구 요청을 보냈습니다", message:"{name}님이 메시지를 보냈습니다", accept:"친구 수락", accepted:"친구가 되었습니다", open:"채팅 열기", all:"모두 읽음", failed:"알림을 불러오지 못했습니다" },
};

export default function Notifications() {
  const { lang, t } = useLang();
  const c = words[lang] || words.en;
  const navigate = useNavigate();
  const [invitationCount, setInvitationCount] = useState(null);
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    try {
      const { data } = await mainApi.get("/social/notifications");
      setItems(data.data.items);
    } catch {
      setNotice(c.failed);
    }
  }, [c.failed]);

  useEffect(() => {
    const initial = setTimeout(refresh, 0);
    const timer = setInterval(refresh, 15000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, [refresh]);

  const markRead = async (id) => mainApi.patch(`/social/notifications/${id}/read`);
  const openMessage = async (item) => {
    setBusyId(item.id);
    try {
      const conversationId = item.payload?.conversationId;
      if (conversationId) {
        await mainApi.patch(`/social/notifications/conversations/${conversationId}/read`);
        navigate(`/chat?conversationId=${encodeURIComponent(conversationId)}`);
      } else {
        await markRead(item.id);
      }
      await refresh();
    } catch {
      setNotice(c.failed);
    } finally {
      setBusyId(null);
    }
  };

  const acceptFriend = async (item) => {
    setBusyId(item.id);
    try {
      await mainApi.post(`/social/friends/${item.actorId}/accept`);
      await markRead(item.id);
      await refresh();
    } catch {
      setNotice(c.failed);
    } finally {
      setBusyId(null);
    }
  };

  const markAll = async () => {
    try {
      await mainApi.patch("/social/notifications/read-all");
      await refresh();
    } catch {
      setNotice(c.failed);
    }
  };

  return (
    <main className="social-ui min-h-dvh w-full space-y-5 p-4 md:p-7">
      <header className="social-hero flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><FiBell className="text-2xl" /></span>
          <div><h1 className="text-2xl font-bold md:text-3xl">{c.title}</h1><p className="mt-2 text-sm leading-relaxed text-base-content/70">{c.intro}</p></div>
        </div>
        {items.some((item) => !item.readAt) && <button className="btn btn-ghost btn-sm gap-2" onClick={markAll}><FiCheck />{c.all}</button>}
      </header>
      {notice && <p className="alert py-2" role="status">{notice}</p>}
      <TripInvitations t={t} onCountChange={setInvitationCount} onAccepted={(tripId) => navigate(`/trips/${tripId}`)} />
      <section className="space-y-3" aria-label={c.title}>
        {items.length === 0 ? invitationCount === 0 ? (
          <div className="social-surface grid min-h-56 place-items-center p-8 text-center text-base-content/55"><div><FiBell className="mx-auto mb-3 text-3xl" /><p>{c.empty}</p></div></div>
        ) : null : items.map((item) => {
          const friendRequest = item.type === "friend_request";
          const title = (friendRequest ? c.friend : c.message).replace("{name}", item.actorName || "Friend");
          return (
            <article key={item.id} className={`social-surface notification-row items-center gap-3 p-4 sm:p-5 ${item.readAt ? "" : "ring-1 ring-primary/25"}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${friendRequest ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>{friendRequest ? <FiUserPlus /> : <FiMessageCircle />}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-relaxed [overflow-wrap:anywhere]">{!item.readAt && <span aria-hidden="true" className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />}{title}</p>
                {!friendRequest && item.payload?.excerpt && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-base-content/70 [overflow-wrap:anywhere]">{item.payload.excerpt}</p>}
                <time className="mt-2 block text-xs text-base-content/60" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
              </div>
              {friendRequest ? item.payload?.accepted ? (
                <span className="badge badge-success badge-outline">{c.accepted}</span>
              ) : (
                <button className="btn btn-primary btn-sm" disabled={busyId === item.id} onClick={() => acceptFriend(item)}>{c.accept}</button>
              ) : (
                <button className="btn btn-primary btn-sm" disabled={busyId === item.id} onClick={() => openMessage(item)}>{c.open}</button>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
