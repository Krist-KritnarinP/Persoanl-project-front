import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";

function GoogleSignInButton({
  onCredential,
  onUnavailable,
  disabled = false,
  locale = "en",
  label = "Login with Google",
}) {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !mountRef.current) return undefined;
    let cancelled = false;
    const failed = () => {
      if (!cancelled) setReady(false);
    };
    const render = () => {
      if (cancelled || !mountRef.current || !window.google?.accounts?.id)
        return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) callbackRef.current(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_button: true,
      });
      window.google.accounts.id.renderButton(mountRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "signin_with",
        logo_alignment: "left",
        width: Math.min(360, mountRef.current.clientWidth || 320),
        locale,
      });
      setReady(true);
    };

    let script = document.querySelector(`script[src="${GOOGLE_SCRIPT}"]`);
    if (window.google?.accounts?.id) render();
    else if (script) script.addEventListener("load", render, { once: true });
    else {
      script = document.createElement("script");
      script.src = GOOGLE_SCRIPT;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render, { once: true });
      document.head.appendChild(script);
    }
    script?.addEventListener("error", failed);
    return () => {
      cancelled = true;
      script?.removeEventListener("load", render);
      script?.removeEventListener("error", failed);
    };
  }, [clientId, locale]);

  const fallback = (
    <button
      type="button"
      className="btn w-full border-[#e5e5e5] bg-white text-black hover:bg-slate-50"
      onClick={onUnavailable}
      disabled={disabled}
    >
      <svg
        aria-label="Google logo"
        width="16"
        height="16"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        role="img"
      >
        <path d="M0 0h512v512H0z" fill="#fff" />
        <path
          fill="#34a853"
          d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0 1 90 341"
        />
        <path
          fill="#4285f4"
          d="M386 400a140 175 0 0 0 53-179H260v74h102q-7 37-38 57"
        />
        <path
          fill="#fbbc02"
          d="M90 341a208 200 0 0 1 0-171l63 49q-12 37 0 73"
        />
        <path
          fill="#ea4335"
          d="M153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
        />
      </svg>
      {label}
    </button>
  );

  return (
    <>
      {!ready && fallback}
      {clientId && (
        <div
          inert={disabled ? true : undefined}
          className={`${ready ? "flex" : "hidden"} h-12 min-h-12 w-full items-center justify-center overflow-hidden rounded-lg border border-[#e5e5e5] bg-white ${disabled ? "pointer-events-none opacity-60" : ""}`}
          aria-label={label}
        >
          <div
            ref={mountRef}
            className="flex h-full w-full items-center justify-center"
          />
        </div>
      )}
    </>
  );
}

export default GoogleSignInButton;
