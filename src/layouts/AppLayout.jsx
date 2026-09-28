import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FiMap,
  FiBriefcase,
  FiCompass,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronsLeft,
  FiChevronsRight,
  FiSettings,
} from "react-icons/fi";
import { useLang } from "@/i18n";
import useUserStore from "@/stores/userStore";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function Modal({ children, title, onClose, drawer = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current.showModal();
    const media = matchMedia("(min-width: 1024px)");
    const resized = () => {
      if (drawer && media.matches) onClose();
    };
    media.addEventListener("change", resized);
    return () => {
      media.removeEventListener("change", resized);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawer, onClose]);
  const { t } = useLang();
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={onClose}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={
        drawer
          ? "m-0 h-dvh max-h-dvh w-72 max-w-[85vw] bg-base-100 text-base-content p-0 backdrop:bg-black/45"
          : "modal"
      }
    >
      <div
        className={drawer ? "h-full flex flex-col p-4" : "modal-box max-w-sm"}
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <strong>{title}</strong>
          <button
            className="btn btn-ghost btn-circle btn-sm"
            aria-label={t("common.close")}
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

function SidebarContent({ collapsed, close, settings, signingOut, signOut }) {
  const { t } = useLang();
  const user = useUserStore((s) => s.user);
  const { pathname } = useLocation();
  const links = [
    ["/travel-overview", FiMap, "side.overview"],
    ["/dashboard", FiBriefcase, "side.trips"],
    ["/trips/ai", FiCompass, "side.ai"],
  ];
  const row =
    "flex items-center gap-3 rounded-xl px-3 py-3 min-h-12 transition-colors";
  return (
    <>
      <nav
        aria-label={t("side.navigation")}
        className="space-y-2 flex-1 overflow-y-auto"
      >
        {links.map(([to, Icon, key]) => {
          const active =
            pathname === to ||
            (to === "/dashboard" &&
              /^\/trips(?:\/\d+(?:\/map)?)?$/.test(pathname));
          return (
            <NavLink
              key={to}
              to={to}
              onClick={close}
              title={t(key)}
              aria-label={t(key)}
              aria-current={active ? "page" : undefined}
              className={`${row} ${active ? "bg-primary text-primary-content font-semibold" : "hover:bg-base-content/10"} ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className="text-xl shrink-0" />
              {!collapsed && <span>{t(key)}</span>}
            </NavLink>
          );
        })}
      </nav>
      <footer className="pt-4 mt-4 border-t border-base-content/15 space-y-2 shrink-0">
        <button
          data-testid="sidebar-settings"
          onClick={settings}
          title={t("side.settings")}
          aria-label={t("side.settings")}
          className={`${row} w-full hover:bg-base-content/10 ${collapsed ? "justify-center" : ""}`}
        >
          <FiSettings className="text-xl shrink-0" />
          {!collapsed && t("side.settings")}
        </button>
        <NavLink
          to="/userprofile"
          onClick={close}
          title={t("profile.title")}
          aria-label={t("profile.title")}
          className={({ isActive }) =>
            `${row} ${isActive ? "bg-primary/15" : "hover:bg-base-content/10"} ${collapsed ? "justify-center" : ""}`
          }
        >
          <FiUser className="text-xl shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold truncate">
                {user?.username || t("profile.title")}
              </p>
              <p className="text-xs text-base-content/60 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </NavLink>
        <button
          onClick={signOut}
          disabled={signingOut}
          title={t("nav.logout")}
          aria-label={t("nav.logout")}
          className={`${row} w-full text-error hover:bg-error/10 ${collapsed ? "justify-center" : ""}`}
        >
          <FiLogOut className="text-xl shrink-0" />
          {!collapsed && t("nav.logout")}
        </button>
      </footer>
    </>
  );
}

export default function AppLayout() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const logout = useUserStore((s) => s.logout);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true",
  );
  const [modal, setModal] = useState(null);
  const [signingOut, setSigningOut] = useState(false);
  // Stable callbacks keep the modal and its focus trap mounted while state changes.
  const opener = useRef(null);
  const menuButton = useRef(null);
  const close = useCallback(() => {
    setModal(null);
    requestAnimationFrame(() => {
      const target = opener.current;
      if (target?.isConnected) target.focus();
      else menuButton.current?.focus();
    });
  }, []);
  useEffect(() => {
    close();
  }, [pathname, close]);
  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };
  const settings = (event) => {
    opener.current = event.currentTarget;
    setModal("settings");
  };
  const content = { close, settings, signOut, signingOut };
  const toggle = () =>
    setCollapsed((value) => {
      localStorage.setItem("sidebarCollapsed", String(!value));
      return !value;
    });
  return (
    <div className="min-h-dvh flex">
      <aside
        data-testid="desktop-sidebar"
        className={`hidden lg:flex sticky top-0 h-dvh shrink-0 flex-col p-3 bg-base-100/90 border-r border-base-content/10 ${collapsed ? "w-20" : "w-64"}`}
      >
        <div
          className={`flex items-center mb-6 ${collapsed ? "justify-center" : "justify-between px-2"}`}
        >
          {!collapsed && (
            <span className="font-bold text-lg tracking-wide">AI LHOUNG</span>
          )}
          <button
            className="btn btn-ghost btn-circle"
            aria-label={t(collapsed ? "side.expand" : "side.collapse")}
            title={t(collapsed ? "side.expand" : "side.collapse")}
            aria-expanded={!collapsed}
            onClick={toggle}
          >
            {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
          </button>
        </div>
        <SidebarContent collapsed={collapsed} {...content} />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-base-100/95 border-b border-base-content/10 px-4 py-2">
          <button
            ref={menuButton}
            data-testid="sidebar-open"
            className="btn btn-ghost btn-circle"
            aria-label={t("side.open")}
            aria-haspopup="dialog"
            aria-expanded={modal === "menu"}
            onClick={(event) => {
              opener.current = event.currentTarget;
              setModal("menu");
            }}
          >
            <FiMenu />
          </button>
          <span className="font-bold">AI LHOUNG</span>
        </header>
        <Suspense
          fallback={
            <div className="p-12 text-center" role="status">
              <span className="loading loading-spinner" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
      {modal === "menu" && (
        <Modal title={t("side.navigation")} onClose={close} drawer>
          <SidebarContent {...content} />
        </Modal>
      )}
      {modal === "settings" && (
        <Modal title={t("side.settings")} onClose={close}>
          <div className="flex justify-between items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </Modal>
      )}
    </div>
  );
}
