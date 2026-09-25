import React, { useState } from "react";
import useTripStore from "@/stores/tripStore";
import { useLang } from "@/i18n";

function UserTrip({ onClose }) {
  const { createTrip, loading } = useTripStore();
  const { t } = useLang();

  const [formData, setFormData] = useState({
    tripName: "",
    destination: "",
    startDate: "",
    endDate: "",
    tripDescription: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.tripName.trim()) {
      setErrorMessage(t("tripForm.needName"));
      return;
    }
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setErrorMessage(t("tripForm.badDates"));
      return;
    }

    try {
      // 1. เรียกใช้งาน createTrip จาก Zustand Store
      const res = await createTrip({
        ...formData,
        tripName: formData.tripName.trim(),
        destination: formData.destination.trim() || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      });

      // 3. ตรวจสอบการสร้างสำเร็จ (รองรับทั้ง res.data, res.id, หรือ res.message)
      if (res) {
        // Reset Form
        setFormData({
          tripName: "",
          destination: "",
          startDate: "",
          endDate: "",
          tripDescription: "",
        });

        // ปิด Modal เมื่อสำเร็จ
        if (onClose) {
          onClose();
        }
      } else {
        setErrorMessage(t("tripForm.failCreate"));
      }
    } catch (err) {
      console.error("Submit Create Trip Error:", err);
      // แสดงข้อความ Error ที่มาจาก Backend (ถ้ามี)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("tripForm.failCreate");
      setErrorMessage(msg);
    }
  };

  return (
    <div className="w-full">
      <h3 className="font-bold text-xl mb-4 text-primary">{t("tripForm.title")}</h3>

      {errorMessage && (
        <div className="alert alert-error text-sm mb-4 p-3 rounded-lg text-white">
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm font-semibold">{t("tripForm.name")}</span>
          </label>
          <input
            type="text"
            name="tripName"
            value={formData.tripName}
            onChange={handleChange}
            placeholder={t("tripForm.namePh")}
            className="input input-bordered w-full rounded-xl text-base"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm font-semibold">{t("tripForm.dest")}</span>
          </label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder={t("tripForm.destPh")}
            className="input input-bordered w-full rounded-xl text-base"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm font-semibold">{t("tripForm.start")}</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="input input-bordered w-full rounded-xl text-base"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm font-semibold">{t("tripForm.end")}</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="input input-bordered w-full rounded-xl text-base"
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm font-semibold">{t("tripForm.desc")}</span>
          </label>
          <textarea
            name="tripDescription"
            value={formData.tripDescription}
            onChange={handleChange}
            placeholder={t("tripForm.descPh")}
            className="textarea textarea-bordered w-full rounded-xl h-20 resize-none text-base"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost rounded-full"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary rounded-full px-6"
          >
            {loading ? t("tripForm.saving") : t("tripForm.create")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserTrip;
