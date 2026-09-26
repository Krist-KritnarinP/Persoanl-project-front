import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { mainApi } from '@/api/mainApi';
import { useLang } from '@/i18n';

function ForgotPassword() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    try {
      await mainApi.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || t('auth.resetUnavailable'));
    } finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 py-10">
      <section className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title justify-center">{t('auth.forgotTitle')}</h1>
          <p className="text-center text-base-content/70">{t('auth.forgotHelp')}</p>
          {sent ? (
            <div className="alert alert-info mt-4" role="status">{t('auth.resetSent')}</div>
          ) : (
            <form className="mt-4 flex flex-col gap-4" onSubmit={submit}>
              <label className="form-control w-full">
                <span className="label-text mb-2">{t('auth.email')}</span>
                <input className="input input-bordered w-full" type="email" autoComplete="email" required maxLength={100} value={email} onChange={event => setEmail(event.target.value)} />
              </label>
              <button className="btn btn-primary w-full" type="submit" disabled={busy}>
                {busy ? <span className="loading loading-spinner" aria-label={t('common.loading')} /> : t('auth.sendReset')}
              </button>
            </form>
          )}
          <Link className="link link-primary mt-3 text-center" to="/login">{t('auth.backLogin')}</Link>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
