import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../auth/services/authApi";
import { clearAuthError, setAuthError } from "../authSlice";
import { Input, Button } from "@heroui/react";
import { DownloadSquare, Eye, EyeClosed, Letter, Lock, UserRounded } from "@solar-icons/react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { LiquidBackground } from "./LiquidBackground";
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import { ThinkingOrb } from "thinking-orbs";

const REMEMBER_ME_KEY = "login-remember-me";
const REMEMBERED_EMAIL_KEY = "login-email";
const REMEMBERED_PASSWORD_KEY = "login-password";

export default function LoginForm() {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authError = useSelector((state: any) => state.auth?.error);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedRememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
    const savedPassword = localStorage.getItem(REMEMBERED_PASSWORD_KEY) ?? "";

    setRememberMe(savedRememberMe);

    if (savedRememberMe) {
      setEmail(savedEmail);
      setPassword(savedPassword);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({
        email: email,
        password: password,
      }).unwrap();

      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, "true");
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        localStorage.setItem(REMEMBERED_PASSWORD_KEY, password);
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        (err as { data?: { message?: string; error?: string }; error?: string; message?: string })?.data?.message ||
        (err as { data?: { message?: string; error?: string }; error?: string; message?: string })?.data?.error ||
        (err as { error?: string; message?: string })?.error ||
        (err as { error?: string; message?: string })?.message ||
        "No se pudo iniciar sesión.";

      dispatch(setAuthError(message));
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate("/dashboard", { replace: true });
      } else {
        dispatch(setAuthError(data.message || "Error al iniciar sesión con Google"));
      }
    } catch (error) {
      dispatch(setAuthError("Error al iniciar sesión con Google"));
    }
  };

  const handleGoogleLoginError = () => {
    dispatch(setAuthError("Error al iniciar sesión con Google. Intenta de nuevo."));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.08 },
    },
  };

  const leftPanelVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const rightPanelVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };



  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleBlur = () => setIsHovered(true);
    window.addEventListener("blur", handleBlur);

    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    setIsHovered(true);
  }

  return (
    <motion.div
      className="w-screen h-screen min-h-screen flex flex-col md:flex-row overflow-hidden font-sans justify-center items-center md:items-stretch  relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="group relative hidden md:flex w-full text-white p-8 lg:p-12 flex-col justify-between overflow-hidden shadow-2xl z-10 select-none"
        variants={leftPanelVariants}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(true)}
      >
        <div className="absolute inset-0 bg-[#0a0a12] z-0" />

        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none" style={{ backgroundImage: "url('/bg-grifo.jpg')" }} />

        <LiquidBackground mouseX={mouseX} mouseY={mouseY} isHovered={isHovered} />


        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-secondary/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-[#00E5B3]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-[#2A3CFF]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-[#2A3CFF]/10 rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[2]"
          style={{
            background: useMotionTemplate`
        radial-gradient(
          650px circle at ${mouseX}px ${mouseY}px,
          rgba(42, 60, 255, 0.18),
          rgba(0, 229, 179, 0.10) 40%,
          transparent 80%
        )
      `,
          }}
        />

        <svg
          className="absolute inset-0 z-[1] opacity-[0.15] pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="fade" cx="50%" cy="55%" r="60%">
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="roadMask">
              <rect width="100" height="100" fill="url(#fade)" />
            </mask>
          </defs>
        </svg>

        <div className="flex items-center justify-between z-20">
          <img src="/logoEscienzaWhite.png" alt="Escienza" className="h-10 opacity-80" />
        </div>

        <div className="my-auto py-6 z-20 max-w-xl">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-secondary/90 mb-3 escienza-font">
            Sistema de Control Volumétrico
          </span>

          <h1 className="text-2xl lg:text-5xl font-black tracking-tight leading-[1.15] uppercase mb-4 text-white drop-shadow-md">
            Gestión de flujo que genera certeza:{" "}
            <span className="text-secondary">cero mermas, control absoluto.</span>
          </h1>

          <p className="text-sm text-white/70 font- leading-relaxed max-w-md">
            Accede al panel para monitorear telemetría, grifos e inventario de volumen en tiempo real.
          </p>
        </div>

        <div className="z-20 flex items-center justify-between border-t border-white/10 pt-4">
          <p className="text-[11px] text-white/50 font-medium">
            © Creado y desarrollado por{" "}
            <span className="text-secondary/80 hover:underline cursor-pointer">
              Labotec
            </span>{" "}
            — Proyecto Grifo
          </p>
          <span className="text-[10px] uppercase tracking-widest text-white/30">
            v1.0
          </span>
        </div>
      </motion.div>

      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8FAFC] dark:bg-[#0a0a12] relative z-10"
        variants={rightPanelVariants}
      >
        <div className="w-full max-w-md sm:max-w-sm lg:max-w-md">
          <motion.div className="mb-8" variants={itemVariants}>
            <img src="/logoEscienza.svg" alt="Escienza" className="h-13 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
              Ingrese sus Credenciales
            </h2>
            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
              Bienvenido de nuevo, por favor ingrese sus datos.
            </p>
          </motion.div>

          <motion.form onSubmit={handleSubmit} className="space-y-4" variants={itemVariants}>
            <motion.div variants={itemVariants}>
              <Input
                startContent={
                  <Letter weight="BoldDuotone" className="text-lg text-slate-400 pointer-events-none shrink-0" />
                }
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (authError) dispatch(clearAuthError());
                }}
                label="Email"
                placeholder="user@gmail.com"
                required
                variant="flat"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative">
                <Input
                  startContent={
                    <Lock weight="BoldDuotone" className="text-lg text-slate-400 pointer-events-none shrink-0" />
                  }
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) dispatch(clearAuthError());
                  }}
                  label="Contraseña"
                  placeholder="Ingrese su contraseña"
                  required
                  variant="flat"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? (
                    <Eye weight="BoldDuotone" className="text-lg pointer-events-none shrink-0" />
                  ) : (
                    <EyeClosed weight="BoldDuotone" className="text-lg pointer-events-none shrink-0" />
                  )}
                </button>
              </div>
            </motion.div>

            {authError && <p className="text-xs text-red-500 font-medium pt-1">{authError}</p>}

            <motion.div className="flex items-center justify-between py-1" variants={itemVariants}>
              <span className="text-sm text-slate-600 font-medium dark:text-slate-400">Recordar contraseña</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </motion.div>

            <Button
              type="submit"
              disabled={isLoading}
              color="primary"
              className="w-full h-11 rounded-full flex items-center justify-center gap-2.5 text-sm font-medium transition-colors"
            >
              {isLoading ? (                
                <ThinkingOrb state="solving" size={20} />
              ) : (
                <>
                  <DownloadSquare weight="BoldDuotone" className="text-xl text-white pointer-events-none shrink-0" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </Button>

            <div className="relative flex items-center justify-center my-5">
              <div className="before:absolute before:top-0 before:left-0 before:w-full before:h-px before:bg-gradient-to-r before:from-transparent before:via-zinc-300 before:to-transparent"></div>
              <span className="bg-gray-50 px-3 text-[11px] text-slate-400 uppercase tracking-wider absolute dark:bg-[#0a0a12] dark:text-slate-400">
                o
              </span>
            </div>

            <motion.div variants={itemVariants} className="w-full">
              <div className="relative w-full border border-slate-200 text-slate-700 font-medium rounded-full h-11 flex items-center justify-center gap-2.5 text-sm hover:bg-slate-50 transition-colors overflow-hidden cursor-pointer">

                <div className="absolute inset-0 flex items-center justify-center gap-2.5 pointer-events-none z-10 bg-white hover:bg-slate-50">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continuar con Google</span>
                </div>

                <div className="absolute opacity-0 inset-0 [&>div]:w-full [&>div]:h-full [&_iframe]:w-full [&_iframe]:h-full cursor-pointer z-20">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    width="400px"
                    ux_mode="popup"
                  />
                </div>

              </div>
            </motion.div>


            <div className="text-center pt-3">
              <p className="text-xs text-slate-400 dark:text-slate-400">
                ¿Olvidó la contraseña?{" "}
                <a href="#" className="text-slate-900 hover:underline font-semibold transition-colors dark:text-slate-400">
                  Recuperar
                </a>
              </p>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
}