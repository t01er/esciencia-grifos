import { apiSlice } from "../../../app/apiSlice";
import { API } from "../../../config/env";
import type {
    Device,
    DeviceFilters,
    DeviceResponse,
    CreateDeviceRequest,
    UpdateDeviceRequest,
    DeviceHistoryResponse,
    DeviceHistoryParams,
} from "../types/device";

export const devicesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDevices: builder.query<DeviceResponse, DeviceFilters>({
            query: (filters) => {
                const params = new URLSearchParams();

                if (filters.page !== undefined) params.append("page", String(filters.page));
                if (filters.size !== undefined) params.append("size", String(filters.size));

                if (filters.status?.length) {
                    filters.status.forEach((s) => params.append("status", s));
                }

                if (filters.imei) params.append("imei", filters.imei);
                if (filters.serialNumber) params.append("serialNumber", filters.serialNumber);
                if (filters.msisdn) params.append("msisdn", filters.msisdn);

                const qs = params.toString();
                return {
                    url: `${API}/mds/api/v1/devices${qs ? `?${qs}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: ["Devices"],
        }),
        getDeviceById: builder.query<Device, number>({
            query: (id) => ({
                url: `${API}/mds/api/v1/devices/${id}`,
                method: "GET",
            }),
            providesTags: (_r, _e, id) => [{ type: "Device", id }],
        }),

        createDevice: builder.mutation<Device, CreateDeviceRequest>({
            query: (data) => ({
                url: `${API}/mds/api/v1/devices`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Devices"],
        }),

        updateDevice: builder.mutation<Device, { id: number; data: UpdateDeviceRequest }>({
            query: ({ id, data }) => ({
                url: `${API}/mds/api/v1/devices/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_r, _e, { id }) => ["Devices", { type: "Device", id }],
        }),

        deleteDevice: builder.mutation<void, number>({
            query: (id) => ({
                url: `${API}/mds/api/v1/devices/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Devices"],
        }),

        getDeviceHistory: builder.query<DeviceHistoryResponse, DeviceHistoryParams>({
            query: ({ deviceId, startServerTime, endServerTime, page = 0, size = 10 }) => {
                const params = new URLSearchParams();
                if (startServerTime) params.append("startServerTime", startServerTime);
                if (endServerTime) params.append("endServerTime", endServerTime);
                params.append("page", String(page));
                params.append("size", String(size));

                return {
                    url: `${API}/mds/api/v1/devices/${deviceId}/historical-locations?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (_r, _e, { deviceId }) => [{ type: "Device", id: deviceId }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetDevicesQuery,
    useGetDeviceByIdQuery,
    useLazyGetDevicesQuery,
    useLazyGetDeviceByIdQuery,
    useCreateDeviceMutation,
    useUpdateDeviceMutation,
    useDeleteDeviceMutation,
    useGetDeviceHistoryQuery,
    useLazyGetDeviceHistoryQuery,
} = devicesApi;