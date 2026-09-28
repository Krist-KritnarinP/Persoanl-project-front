import { Component } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLang } from "@/i18n";

// Isolate unexpected encoder failures from the trip/map page. Changing the URL
// remounts this boundary so selecting a shorter route can display its QR again.
class QrBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function NavigationQr({ value, size }) {
  const { t } = useLang();
  const fallback = (
    <p role="status" className="text-xs text-black max-w-36 leading-relaxed">
      {t("map.qrTooLong")}
    </p>
  );
  // Percent-encoded Thai place names grow substantially. Stay below the
  // encoder's byte capacity; never truncate a URL or silently remove stops.
  if (!value || new TextEncoder().encode(value).length > 2000) return fallback;
  return (
    <QrBoundary key={value} fallback={fallback}>
      <QRCodeSVG
        value={value}
        size={size}
        level="L"
        role="img"
        aria-label={t("ui.qr")}
      />
    </QrBoundary>
  );
}
