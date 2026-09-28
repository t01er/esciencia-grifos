import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiSlice } from "../app/apiSlice";

type AgregateType = "SUMMARY_DEVICE" | "CONNECTED_USER" | string;
type WSMessageType = "REFRESH" | "heartbeat" | string;

export type WSMessage = {
    agregateType?: AgregateType;
    type?: WSMessageType;
    payload?: string;
    properties?: Record<string, unknown>;
    [key: string]: unknown;
};

type Status = "connecting" | "connected" | "disconnected" | "error";

interface Options {
    url?: string;
    reconnectInterval?: number;
    maxRetries?: number;
    onMessage?: (msg: WSMessage) => void;
}

type StateWithAuth = { auth: { token: string | null } };

export function useDeviceWebSocket(options: Options = {}) {
    const {
        url = "wss://ws.yaw-iot.com/yaw-ws",
        reconnectInterval = 3000,
        maxRetries = Infinity,
        onMessage,
    } = options;

    const dispatch = useDispatch();
    const token = useSelector((s: StateWithAuth) => s.auth.token);

    const onMessageRef = useRef(onMessage);
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const socketRef = useRef<WebSocket | null>(null);
    const retriesRef = useRef(0);
    const reconnectTimerRef = useRef<number | null>(null);
    const connectRef = useRef<() => void>(() => {});

    const [status, setStatus] = useState<Status>("connecting");
    const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);

    const connect = useCallback(() => {
        if (!token) return;

        const prev = socketRef.current;
        if (prev) {
            prev.onopen = null;
            prev.onmessage = null;
            prev.onerror = null;
            prev.onclose = null;
            try { prev.close(); } catch {}
            socketRef.current = null;
        }

        setStatus("connecting");
        console.log("🔌 WS: conectando a", url);

        const ws = new WebSocket(`${url}?token=${token}`);
        socketRef.current = ws;

        ws.onopen = () => {
            if (socketRef.current !== ws) return;
            retriesRef.current = 0;
            setStatus("connected");
            console.log("WebSocket conectado");
        };

        ws.onmessage = (event) => {
            if (socketRef.current !== ws) return;

            let msg: WSMessage | null = null;
            try {
                msg = JSON.parse(event.data) as WSMessage;
            } catch {
                console.warn("Mensaje WS no es JSON:", event.data);
                return;
            }
            if (!msg || typeof msg !== "object") return;

            setLastMessage(msg);
            if (msg.type === "heartbeat") return;

            const isDeviceSummary =
                msg.agregateType === "SUMMARY_DEVICE" &&
                msg.type === "REFRESH";

            if (isDeviceSummary) {
                dispatch(apiSlice.util.invalidateTags(["Devices"]));
            }

            onMessageRef.current?.(msg);
        };

        ws.onerror = (e) => {
            if (socketRef.current !== ws) return;
            console.warn("WS error:", e);
            setStatus("error");
            try { ws.close(); } catch {}
        };

        ws.onclose = (e) => {
            if (socketRef.current !== ws) return;

            console.log("WS cerrado", e.code, e.reason);
            setStatus("disconnected");
            socketRef.current = null;

            if (retriesRef.current >= maxRetries) return;

            retriesRef.current += 1;
            reconnectTimerRef.current = window.setTimeout(() => {
                connectRef.current();
            }, reconnectInterval);
        };
    }, [url, reconnectInterval, maxRetries, dispatch, token]);

    useEffect(() => {
        connectRef.current = connect;
    }, [connect]);

    useEffect(() => {
        if (!token) {
            if (reconnectTimerRef.current) {
                window.clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
            const ws = socketRef.current;
            if (ws) {
                ws.onopen = null;
                ws.onmessage = null;
                ws.onerror = null;
                ws.onclose = null;
                try { ws.close(); } catch {}
                socketRef.current = null;
            }
            setStatus("disconnected");
            return;
        }

        retriesRef.current = 0;
        connectRef.current();

        return () => {
            if (reconnectTimerRef.current) {
                window.clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
            const ws = socketRef.current;
            if (ws) {
                ws.onopen = null;
                ws.onmessage = null;
                ws.onerror = null;
                ws.onclose = null;
                try { ws.close(); } catch {}
                socketRef.current = null;
            }
        };
    }, [token]);

    const send = useCallback((data: unknown) => {
        const ws = socketRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(typeof data === "string" ? data : JSON.stringify(data));
            return true;
        }
        return false;
    }, []);

    const reconnect = useCallback(() => {
        retriesRef.current = 0;
        connectRef.current();
    }, []);

    return { status, lastMessage, send, reconnect };
}