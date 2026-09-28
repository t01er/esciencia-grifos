import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { useTheme } from "../../hooks/useTheme";
import {
  MoonStars,
  Sun2,
  AltArrowDown,
  UserCircle,
  SettingsMinimalistic,
  Logout3,
  MapPoint,
} from "@solar-icons/react";
import { logout } from "../../features/auth/authSlice";

type ThemeToggleProps = {
  user?: {
    username?: string;
    tienda?: string;
    ubicacion?: string;
    avatarUrl?: string;
    rol?: string;
    [key: string]: any;
  };
  expanded: boolean;
};

const ThemeToggle = ({ user, expanded }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/");
  };


  const formatRoles = (roles?: string[] | string): string => {
    if (!roles) return "Sin rol";
    if (typeof roles === "string") return roles;

    const priority = ["SUPPER_ADMIN", "SUPER_ADMIN", "ADMIN_TENANT", "ADMIN", "SUPPORT"];

    const mainRole = priority.find((r) => roles.includes(r));

    if (mainRole) {
      if (mainRole === "SUPPER_ADMIN" || mainRole === "SUPER_ADMIN") {
        return "Super Admin";
      }
      return mainRole
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return roles[0] ?? "Sin rol";
  };

  const avatarSrc =
    user?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${user?.email || "U"}&background=0f1bca&color=fff&size=128&rounded=true&bold=true`;

  const displayName = user?.email ?? "Usuario";
  const secondaryInfo = formatRoles(user?.roles);

  return (
    <div className={`shrink-0 relative z-10 ${expanded ? "px-3" : "px-2"} pb-4`}>
      <Dropdown
        backdrop="transparent"
        placement={expanded ? "bottom-start" : "right-start"}
        classNames={{
          content: "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl rounded-2xl",
        }}
      >
        <DropdownTrigger>
          <Button
            size="lg"
            isIconOnly={!expanded}
            variant="light"
            className={`w-full flex items-center gap-3 rounded-2xl transition-all duration-200
              bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10
              border border-white/40 dark:border-white/5 hover:border-white/60
              ${expanded ? "px-2.5 py-2 h-auto justify-start" : "justify-center p-2 h-auto"}`}
          >
            <Avatar
              isBordered
              radius="full"
              size="sm"
              src={avatarSrc}
              className="shrink-0 ring-2 ring-white/70 dark:ring-white/10"
            />

            {expanded && (
              <>
                <div className="flex-1 text-left overflow-hidden min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-default-500 truncate leading-tight mt-0.5 flex items-center gap-1">
                    <MapPoint size={11} className="shrink-0 opacity-70" />
                    {secondaryInfo}
                  </p>
                </div>
                <AltArrowDown
                  size={14}
                  className="text-default-400 shrink-0 opacity-70"
                />
              </>
            )}
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Menú de usuario"
          itemClasses={{
            base: "rounded-xl data-[hover=true]:bg-primary/10 data-[hover=true]:text-primary gap-3",
            title: "text-sm font-medium",
          }}
        >
          <DropdownItem
            key="header"
            isReadOnly
            className="opacity-100 cursor-default data-[hover=true]:bg-transparent"
            startContent={
              <Avatar size="sm" radius="full" src={avatarSrc} />
            }
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {displayName}
              </span>
              <span className="text-[11px] text-default-400">
                {secondaryInfo}
              </span>
            </div>
          </DropdownItem>

          <DropdownItem
            key="profile"
            startContent={<UserCircle size={18} />}
          >
            Mi perfil
          </DropdownItem>

          <DropdownItem
            key="settings"
            startContent={<SettingsMinimalistic size={18} />}
            onPress={() => navigate("/settings")}
          >
            Configuración
          </DropdownItem>

          <DropdownItem
            key="logout"
            color="danger"
            className="text-danger data-[hover=true]:bg-danger/10"
            startContent={<Logout3 size={18} />}
            onPress={handleSignOut}
          >
            Cerrar sesión
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {expanded ? (
        <div className="mt-3 relative flex items-center rounded-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5 p-1 backdrop-blur-md">
          <button
            onClick={() => theme !== "light" && toggleTheme()}
            className="relative flex-1 h-8 rounded-xl text-xs font-medium transition-colors z-10"
          >
            {theme === "light" && (
              <motion.div
                layoutId="theme-pill"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-0 rounded-xl bg-white dark:bg-white/10 shadow-sm z-0"
              />
            )}
            <span
              className={`relative z-10 flex items-center justify-center gap-1.5 ${theme === "light" ? "text-foreground" : "text-default-400"
                }`}
            >
              <Sun2
                size={14}
                weight="BoldDuotone"
                className={theme === "light" ? "text-primary" : ""}
              />
              Claro
            </span>
          </button>

          <button
            onClick={() => theme !== "dark" && toggleTheme()}
            className="relative flex-1 h-8 rounded-xl text-xs font-medium transition-colors z-10"
          >
            {theme === "dark" && (
              <motion.div
                layoutId="theme-pill"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-0 rounded-xl bg-white/10 shadow-sm z-0"
              />
            )}
            <span
              className={`relative z-10 flex items-center justify-center gap-1.5 ${theme === "dark" ? "text-foreground" : "text-default-400"
                }`}
            >
              <MoonStars
                size={14}
                weight="BoldDuotone"
                className={theme === "dark" ? "text-secondary" : ""}
              />
              Oscuro
            </span>
          </button>
        </div>
      ) : (
        <button
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          className="mt-3 mx-auto flex h-10 w-10 items-center justify-center rounded-2xl
            bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10
            border border-white/40 dark:border-white/5 hover:border-white/60
            transition-all"
        >
          {theme === "dark" ? (
            <Sun2 size={16} className="text-secondary" weight="BoldDuotone" />
          ) : (
            <MoonStars size={16} className="text-primary" weight="BoldDuotone" />
          )}
        </button>
      )}
    </div>
  );
};

export default ThemeToggle;