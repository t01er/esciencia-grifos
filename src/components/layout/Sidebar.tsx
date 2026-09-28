import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AltArrowDown,
  UserCircle,
  ChartSquare,
  SettingsMinimalistic,
  MinusCircle,
  HamburgerMenu,
  Bell,
  Programming,
  UsersGroupRounded,
  ShieldUser,
  LockKeyhole,
  Devices,
  Widget5,
  Buildings2,
  Fuel,
  Cloud,
  Document,
} from "@solar-icons/react";
import { Button } from "@heroui/react";
import { useSelector } from "react-redux";
import ThemeToggle from "../ux/ThemeToggle";

type SidebarItem = {
  codigo: number;
  name: string;
  path: string;
  icon: any;
  badge?: number;
  children?: SidebarItem[];
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};
const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "Operación",
    items: [
      { codigo: 1, name: "Inicio",       path: "/dashboard",     icon: Widget5 },
      { codigo: 2, name: "Tanques",      path: "/tanks",         icon: Fuel },
      { codigo: 3, name: "Ventas",       path: "/sales",         icon: ChartSquare },
      { codigo: 4, name: "Ambiental",    path: "/environmental", icon: Cloud },
      { codigo: 5, name: "Reportes",     path: "/reports",       icon: Document },
    ],
  },
  {
    title: "Herramientas",
    items: [
      { codigo: 9, name: "Comandos",     path: "/commands",      icon: Programming },
      { codigo: 10, name: "Alertas",     path: "/alerts",        icon: Bell, badge: 4 },
    ],
  },
  {
    title: "Administración",
    items: [
      { codigo: 11, name: "Dispositivos", path: "/devices",      icon: Devices },
      {
        codigo: 12,
        name: "Usuarios",
        path: "/users",
        icon: UsersGroupRounded,
        children: [
          { codigo: 121, name: "Listado",   path: "/users",        icon: UserCircle },
          { codigo: 122, name: "Roles",     path: "/roles",        icon: ShieldUser },
          { codigo: 123, name: "Permisos",  path: "/permissions",  icon: LockKeyhole },
        ],
      },
      { codigo: 13, name: "Empresa",       path: "/companies",   icon: Buildings2 },
      { codigo: 14, name: "Configuración", path: "/settings",    icon: SettingsMinimalistic },
    ],
  },
];
export default function Sidebar() {
  const user = useSelector((state: any) => state.auth.user);

  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const location = useLocation();

  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", JSON.stringify(isExpanded));
  }, [isExpanded]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
      return;
    }
    setIsExpanded((prev: any) => !prev);
  };

  const isItemActive = (item: SidebarItem) => {
    const currentPath = location.pathname;

    if (item.path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath.startsWith("/dashboard/location");
    }
    if (item.children?.length) {
      return item.children.some((c) => currentPath.startsWith(c.path));
    }
    const cleanPath = item.path.replace("/", "");
    const singularKeyword = cleanPath.endsWith("s") ? cleanPath.slice(0, -1) : cleanPath;
    return currentPath.includes(singularKeyword);
  };

  const isChildActive = (childPath: string) => location.pathname.startsWith(childPath);

  const expanded = isExpanded || isMobile;

  return (
    <>
      {isMobile && !isMobileOpen && (
        <Button
          isIconOnly
          color="primary"
          className="fixed left-4 top-4 z-[120] md:hidden"
          onPress={toggleSidebar}
        >
          <HamburgerMenu size={27} weight="Broken" />
        </Button>
      )}

      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-md md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {(!isMobile || isMobileOpen) && (
        <motion.aside
          initial={false}
          animate={
            isMobile
              ? { x: isMobileOpen ? 0 : -320, opacity: 1 }
              : { width: isExpanded ? 270 : 84 }
          }
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed left-0 top-0 z-[50] h-screen flex flex-col overflow-hidden md:relative md:h-screen
            ${isMobile ? "w-[85vw] max-w-[300px]" : ""}
          `}
        >
          <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border-r border-white/40 dark:border-white/10" />

          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <div className={`flex items-center h-20 shrink-0 ${expanded ? "px-5 justify-between" : "justify-center"}`}>
              <div className="flex items-center overflow-hidden" onClick={toggleSidebar}>
                <img src="/icologo.svg" alt="Logo" className={`${expanded ? "h-9" : "h-8"} shrink-0`} />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap"
                    >
                      <img src="/textlogo.svg" alt="Logo" className="h-14" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <nav className="flex-1 flex flex-col overflow-y-auto pb-2 px-2 [scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:rgba(0,0,0,0.15)_transparent]">
              {SIDEBAR_SECTIONS.map((section, sIdx) => (
                <div key={section.title} className={sIdx > 0 ? "mt-4" : ""}>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[10px] font-semibold uppercase tracking-[0.14em] text-default-400/80 mb-2 mt-2 px-4 truncate"
                      >
                        {section.title}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const hasChildren = !!item.children?.length;
                    const active = isItemActive(item);
                    const isOpen = !!openMenus[item.codigo];
                    const showPill = hasChildren ? active && isOpen : active;

                    return (
                      <div key={item.codigo} className="flex flex-col mb-1">
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (isMobile) setIsMobileOpen(false);
                              if (!isExpanded && !isMobile) {
                                setIsExpanded(true);
                                setTimeout(() => {
                                  setOpenMenus((prev) => ({ ...prev, [item.codigo]: true }));
                                }, 250);
                                return;
                              }
                              setOpenMenus((prev) => ({ ...prev, [item.codigo]: !prev[item.codigo] }));
                            }}
                            className={`group relative flex items-center h-11 transition-all duration-200
                              ${expanded ? "mx-2 px-3 rounded-xl" : "mx-auto w-11 justify-center rounded-xl"}
                              ${showPill
                                ? "text-white"
                                : active
                                  ? "text-foreground font-semibold"
                                  : "text-default-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                              }`}
                          >
                            {showPill && (
                              <motion.div
                                layoutId="sidebar-active-pill"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/30 z-0"
                              />
                            )}

                            <span className="relative z-10">
                              <Icon weight="BoldDuotone" size={20} />
                              {!expanded && item.badge ? (
                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white/60 dark:ring-zinc-900/60" />
                              ) : null}
                            </span>

                            {expanded && (
                              <>
                                <span className="relative z-10 ml-3 flex-1 text-left text-sm font-medium">
                                  {item.name}
                                </span>
                                <span className="relative z-10 opacity-80">
                                  {showPill ? (
                                    <MinusCircle size={18} />
                                  ) : (
                                    <motion.div
                                      animate={{ rotate: isOpen ? 180 : 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <AltArrowDown size={16} />
                                    </motion.div>
                                  )}
                                </span>
                              </>
                            )}
                          </button>
                        ) : (
                          <NavLink
                            to={item.path}
                            onClick={() => {
                              if (isMobile) setIsMobileOpen(false);
                            }}
                            className={`group relative flex items-center h-11 transition-all duration-200
                              ${expanded ? "mx-2 px-3 rounded-xl" : "mx-auto w-11 justify-center rounded-xl"}
                              ${active
                                ? "text-white"
                                : "text-default-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                              }`}
                          >
                            {active && (
                              <motion.div
                                layoutId="sidebar-active-pill"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/30 z-0"
                              />
                            )}

                            <span className="relative z-10">
                              <Icon weight="BoldDuotone" size={20} />
                              {!expanded && item.badge ? (
                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white/60 dark:ring-zinc-900/60" />
                              ) : null}
                            </span>

                            {expanded && (
                              <span className="relative z-10 ml-3 flex-1 text-sm font-medium">
                                {item.name}
                              </span>
                            )}

                            {expanded && item.badge ? (
                              <span
                                className={`relative z-10 ml-2 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full text-xs font-semibold backdrop-blur-md
                                  ${active
                                    ? "bg-white/25 text-white"
                                    : "bg-white/60 dark:bg-white/10 text-default-600"
                                  }`}
                              >
                                {item.badge}
                              </span>
                            ) : null}
                          </NavLink>
                        )}

                        <AnimatePresence>
                          {hasChildren && expanded && isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="relative ml-6 mt-1 mb-1 pl-4">
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-default-300/60 to-transparent" />

                                {item.children!.map((child) => {
                                  const ChildIcon = child.icon;
                                  const childActive = isChildActive(child.path);
                                  return (
                                    <NavLink
                                      key={child.path}
                                      to={child.path}
                                      onClick={() => {
                                        if (isMobile) setIsMobileOpen(false);
                                      }}
                                      className="relative mr-2 mb-1 h-9 flex items-center gap-3 rounded-lg px-3 text-sm transition-colors"
                                    >
                                      {childActive && (
                                        <motion.div
                                          layoutId="sidebar-active-child-pill"
                                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                          className="absolute inset-0 rounded-lg bg-primary/10 dark:bg-primary/15 z-0"
                                        />
                                      )}
                                      <span
                                        className={`relative z-10 flex items-center gap-3 ${childActive
                                          ? "text-primary font-medium"
                                          : "text-default-500 hover:text-foreground"
                                          }`}
                                      >
                                        <ChildIcon size={16} />
                                        {child.name}
                                      </span>
                                    </NavLink>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="relative z-10">
              <ThemeToggle user={user} expanded={expanded} />
            </div>
          </div>
        </motion.aside>
      )}
    </>
  );
}