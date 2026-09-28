import { createContext, useContext, type ReactNode } from "react";
import { useDeviceWebSocket } from "../hooks/useDeviceWebSocket";

type WSContextType = ReturnType<typeof useDeviceWebSocket>;

const WSContext = createContext<WSContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
    const ws = useDeviceWebSocket();
    return <WSContext.Provider value={ws}>{children}</WSContext.Provider>;
}

export function useWS() {
    const ctx = useContext(WSContext);
    if (!ctx) throw new Error("useWS debe usarse dentro de <WebSocketProvider>");
    return ctx;
}