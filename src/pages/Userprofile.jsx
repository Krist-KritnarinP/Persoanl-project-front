import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiSave } from "react-icons/fi";
import { mainApi } from "@/api/mainApi";
import useUserStore from "@/stores/userStore";
import { useLang } from "@/i18n";
import { toast } from "react-toastify";

function Userprofile() {
  const navigate = useNavigate();
  const { t } = useLang();
  const user = useUserStore((s) => s.user);
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resp = await mainApi.get("/users/me");
        setForm({ username: resp.data?.username || "", password: "" });
      } catch {
        toast.error(t("profile.fetchFail"));
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.username.trim().length < 4) {
      toast.error(t("profile.needUser"));
      return;
    }
    if (form.password && form.password.length < 4) {
      toast.error(t("profile.needPass"));
      return;
    }
    setLoading(true);
    try {
      const payload = { username: form.username.trim() };
      if (form.password) payload.password = form.password;
      const resp = await mainApi.put("/users/me", payload);
      toast.success(resp.data?.message || t("profile.ok"));
      setForm((f) => ({ ...f, password: "" }));
    } catch (err) {
      toast.error(err?.response?.data?.message || t("profile.fail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-4 space-y-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn btn-ghost gap-2">
        <FiArrowLeft /> {t("common.back")}
      </button>

      <div className="glass glass-card p-5 md:p-6 rounded-3xl space-y-4">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <FiUser className="text-primary" /> {t("profile.title")}
        </h1>
        <p className="text-sm sm:text-base text-base-content/60 break-all">{user?.email || ""}</p>

        {fetching ? (
          <span className="loading loading-spinner text-primary" />
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-sm font-semibold">{t("profile.username")}</span></label>
              <input
                className="input input-bordered w-full text-base"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                minLength={4}
                required
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-sm font-semibold">{t("profile.newPass")}</span></label>
              <input
                type="password"
                className="input input-bordered w-full text-base"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary rounded-full gap-2">
              <FiSave /> {loading ? t("profile.saving") : t("profile.saveBtn")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Userprofile;
