import type { FilterFieldDef } from "../../../components/ux/TableComponent";

export const getDeviceFilters = (): FilterFieldDef[] => [
    {
        key: "imei",
        type: "text",
        placeholder: "IMEI",
    },
    {
        key: "serialNumber",
        type: "text",
        placeholder: "Serial Number",
    },
    {
        key: "msisdn",
        type: "text",
        placeholder: "MSISDN",
    },
    {
        key: "status",
        type: "select",
        placeholder: "Todos",
        options: [
            { value: "", label: "Todos" },
            { value: "online", label: "Online" },
            { value: "offline", label: "Offline" },
            { value: "unknown", label: "Desconocido" },
        ],
    },
];