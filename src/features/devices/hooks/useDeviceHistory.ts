import { useCallback } from "react";
import {
    useLazyGetDeviceHistoryQuery,
} from "../services/devicesApi";
import type { DeviceHistoryResponse } from "../types/device";

interface UseDeviceHistoryReturn {
    data: DeviceHistoryResponse | undefined;
    isLoading: boolean;
    error: any;
    fetchHistory: (params: {
        deviceId: number;
        startServerTime?: string;
        endServerTime?: string;
        page?: number;
        size?: number;
    }) => Promise<DeviceHistoryResponse | undefined>;
}

export function useDeviceHistory(): UseDeviceHistoryReturn {
    const [trigger, { data, isLoading, error }] = useLazyGetDeviceHistoryQuery();

    const fetchHistory = useCallback(
        async (params: {
            deviceId: number;
            startServerTime?: string;
            endServerTime?: string;
            page?: number;
            size?: number;
        }) => {
            try {
                return await trigger(params).unwrap();
            } catch (e) {
                console.error("Error al obtener historial:", e);
                return undefined;
            }
        },
        [trigger]
    );

    return { data, isLoading, error, fetchHistory };
}