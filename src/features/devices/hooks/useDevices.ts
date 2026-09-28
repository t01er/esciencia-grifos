import { useState, useCallback } from "react";
import {
    useGetDevicesQuery,
    useCreateDeviceMutation,
    useUpdateDeviceMutation,
    useDeleteDeviceMutation,
    useLazyGetDeviceByIdQuery,
} from "../services/devicesApi";
import type {
    Device,
    DeviceFilters,
    CreateDeviceRequest,
    UpdateDeviceRequest,
} from "../types/device";

interface UseDevicesReturn {
    devices: Device[];
    pagination: {
        totalPages: number;
        totalElements: number;
        page: number;
        size: number;
    };
    isLoading: boolean;
    error: any;
    filters: DeviceFilters;
    setFilters: (filters: DeviceFilters) => void;
    create: (data: CreateDeviceRequest) => Promise<{ success: boolean; data?: Device }>;
    update: (id: number, data: UpdateDeviceRequest) => Promise<{ success: boolean; data?: Device }>;
    remove: (id: number) => Promise<{ success: boolean }>;
    refetch: () => void;
    getDeviceById: (id: number) => Promise<Device | null>;
}

export function useDevices(): UseDevicesReturn {
    const [filters, setFiltersState] = useState<DeviceFilters>({
        page: 0,
        size: 15,
    });

    const { data, isLoading, error, refetch } = useGetDevicesQuery(filters);
    const [createDevice] = useCreateDeviceMutation();
    const [updateDevice] = useUpdateDeviceMutation();
    const [deleteDevice] = useDeleteDeviceMutation();
    const [getDeviceByIdQuery] = useLazyGetDeviceByIdQuery();

    const setFilters = useCallback((newFilters: DeviceFilters) => {
        setFiltersState((prev) => ({ ...prev, ...newFilters }));
    }, []);

    const getDevicesData = (): Device[] => {
        if (!data) return [];
        if (Array.isArray(data.content)) return data.content;
        if (Array.isArray(data)) return data as unknown as Device[];
        return [];
    };

    const getPaginationData = () => {
        if (!data) {
            return {
                totalPages: 0,
                totalElements: 0,
                page: filters.page || 0,
                size: filters.size || 15,
            };
        }
        if ("totalPages" in data && "totalElements" in data) {
            return {
                totalPages: data.totalPages || 0,
                totalElements: data.totalElements || 0,
                page: data.page ?? filters.page ?? 0,
                size: data.size ?? filters.size ?? 15,
            };
        }
        const arr = Array.isArray(data) ? data : [];
        return {
            totalPages: 1,
            totalElements: arr.length,
            page: 0,
            size: arr.length || 15,
        };
    };

    const allDevices = getDevicesData();
    const pagination = getPaginationData();

    const create = useCallback(
        async (data: CreateDeviceRequest) => {
            const result = await createDevice(data).unwrap();
            await refetch();
            return { success: true, data: result };
        },
        [createDevice, refetch]
    );

    const update = useCallback(
        async (id: number, data: UpdateDeviceRequest) => {
            const result = await updateDevice({ id, data }).unwrap();
            await refetch();
            return { success: true, data: result };
        },
        [updateDevice, refetch]
    );

    const remove = useCallback(
        async (id: number) => {
            try {
                await deleteDevice(id).unwrap();
                await refetch();
                return { success: true };
            } catch {
                return { success: false };
            }
        },
        [deleteDevice, refetch]
    );

    const getDeviceById = useCallback(
        async (id: number) => {
            try {
                return await getDeviceByIdQuery(id).unwrap();
            } catch {
                return null;
            }
        },
        [getDeviceByIdQuery]
    );

    return {
        devices: allDevices,
        pagination,
        isLoading,
        error,
        filters,
        setFilters,
        create,
        update,
        remove,
        refetch,
        getDeviceById,
    };
}