import { useState } from 'react';
import { mainApi } from '@/api/mainApi';
import useUserStore from '@/stores/userStore';
import { useLang } from '@/i18n';
import { toast } from 'react-toastify';

const copy = {
  th: { title: 'ข้อมูลและบัญชีของฉัน', password: 'รหัสผ่านปัจจุบัน', export: 'ดาวน์โหลดข้อมูล JSON', remove: 'ลบบัญชีถาวร', confirm: 'ยืนยันลบบัญชีและทริปทั้งหมด', cancel: 'ยกเลิก', warning: 'บัญชี ทริป กิจกรรม ประวัติ AI และลิงก์แชร์จะถูกลบและกู้คืนผ่านเว็บไม่ได้ ดาวน์โหลดข้อมูลก่อนหากต้องการเก็บไว้ ข้อมูลใน backup อาจยังคงอยู่จนสิ้นสุดระยะเก็บรักษาของผู้ให้บริการ', fail: 'ดำเนินการไม่สำเร็จ กรุณาตรวจรหัสผ่านแล้วลองใหม่' },
  en: { title: 'My data and account', password: 'Current password', export: 'Download JSON data', remove: 'Delete account permanently', confirm: 'Confirm deletion of account and all trips', cancel: 'Cancel', warning: 'Your account, trips, activities, AI history and share links will be deleted and cannot be restored through this app. Download your data first if needed. Backup copies may remain until the operator’s retention period ends.', fail: 'Request failed. Check your password and try again.' },
  zh: { title: '我的数据和账户', password: '当前密码', export: '下载 JSON 数据', remove: '永久删除账户', confirm: '确认删除账户及所有行程', cancel: '取消', warning: '账户、行程、活动、AI 历史和分享链接将被删除，无法通过本应用恢复。如需保留，请先下载数据。备份可能保留至运营方的保留期限结束。', fail: '操作失败，请检查密码后重试。' },
  ko: { title: '내 데이터 및 계정', password: '현재 비밀번호', export: 'JSON 데이터 다운로드', remove: '계정 영구 삭제', confirm: '계정과 모든 여행 삭제 확인', cancel: '취소', warning: '계정, 여행, 활동, AI 기록 및 공유 링크가 삭제되며 앱에서 복구할 수 없습니다. 필요한 데이터는 먼저 다운로드하세요. 백업은 운영자의 보존 기간까지 남을 수 있습니다.', fail: '요청에 실패했습니다. 비밀번호를 확인하고 다시 시도하세요.' },
};
export default function AccountDataControls() {
  const { lang } = useLang();
  const t = copy[lang] || copy.en;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const run = async action => {
    setBusy(true);
    try {
      if (action === 'export') {
        const response = await mainApi.post('/users/me/export', { currentPassword: password });
        const url = URL.createObjectURL(new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' }));
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = 'ailhoung-account.json'; anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setPassword('');
      } else {
        await mainApi.delete('/users/me', { data: { currentPassword: password } });
        useUserStore.getState().clearSession();
        // Reload discards pending account requests and any in-memory data.
        window.location.replace('/');
      }
    } catch { toast.error(t.fail); }
    finally { setBusy(false); }
  };
  return <section className="glass glass-card p-5 rounded-3xl space-y-4">
    <h2 className="text-xl font-bold">{t.title}</h2>
    <label className="block" htmlFor="account-confirm-password">{t.password}</label>
    <input id="account-confirm-password" type="password" autoComplete="current-password" value={password}
      onChange={e => setPassword(e.target.value)} className="input input-bordered w-full" disabled={busy} />
    <div className="flex flex-wrap gap-3">
      <button className="btn btn-primary" disabled={busy || !password} onClick={() => run('export')}>{t.export}</button>
      <button className="btn btn-error" disabled={busy} onClick={() => setConfirm(true)}>{t.remove}</button>
    </div>
    {confirm && <div className="border border-error rounded-xl p-4 space-y-3" role="group" aria-label={t.confirm}>
      <p>{t.warning}</p>
      <button className="btn btn-error" disabled={busy || !password} onClick={() => run('delete')}>{t.confirm}</button>
      <button className="btn btn-ghost" disabled={busy} onClick={() => setConfirm(false)}>{t.cancel}</button>
    </div>}
  </section>;
}
