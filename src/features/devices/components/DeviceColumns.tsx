import { Button, Chip, Tooltip } from "@heroui/react";
import { Eye, Pen, TrashBinTrash } from "@solar-icons/react";
import type { CustomColumnDef } from "../../../components/ux/TableComponent";
import type { Device } from "../types/device";
import { formatDate } from "../../../utils/date";

interface DeviceColumnsProps {
    onView?: (device: Device) => void;
    onEdit?: (device: Device) => void;
    onDelete?: (device: Device) => void;
}

const statusColorMap: Record<
    string,
    {
        color: "success" | "warning" | "danger" | "default";
        label: string;
    }
> = {
    online: {
        color: "success",
        label: "Online",
    },
    offline: {
        color: "danger",
        label: "Offline",
    },
    unknown: {
        color: "warning",
        label: "Desconocido",
    },
};

const lifecycleColorMap: Record<
    string,
    {
        color: "success" | "warning" | "danger" | "default";
        label: string;
    }
> = {
    ACTIVE: {
        color: "success",
        label: "Activo",
    },
    INACTIVE: {
        color: "warning",
        label: "Inactivo",
    },
    DELETED: {
        color: "danger",
        label: "Eliminado",
    },
};

export const getDeviceColumns = ({
    onView,
    onEdit,
    onDelete,
}: DeviceColumnsProps): CustomColumnDef<Device>[] => [
    {
        key: "id",
        label: "ID",
        width: 70,
        sortable: true,
        render: (d) => (
            <span className="font-mono text-sm">
                #{d.id}
            </span>
        ),
    },

    {
        key: "serialNumber",
        label: "SERIAL / IMEI",
        width: 220,
        sortable: true,
        render: (d) => (
            <div className="flex flex-col">
                <span className="font-medium text-default-700">
                    {d.serialNumber || "—"}
                </span>

                <span className="text-xs text-default-400 font-mono">
                    {d.imei || "—"}
                </span>
            </div>
        ),
    },

    {
        key: "panelVersion",
        label: "PANEL",
        width: 140,
        sortable: false,
        render: () => (
            <span className="text-xs font-mono text-default-500">
                PV-1.0.0
            </span>
        ),
    },

    {
        key: "dcBatteryVersion",
        label: "DC BATERÍA",
        width: 150,
        sortable: false,
        render: () => (
            <span className="text-xs font-mono text-default-500">
                DC-2.1.0
            </span>
        ),
    },

    {
        key: "victronVersion",
        label: "V. VICTRON",
        width: 150,
        sortable: false,
        render: () => (
            <span className="text-xs font-mono text-default-500">
                V-3.2.1
            </span>
        ),
    },

    {
        key: "victronControllerVersion",
        label: "CONTROLADOR",
        width: 160,
        sortable: false,
        render: () => (
            <span className="text-xs font-mono text-default-500">
                CTRL-1.5.2
            </span>
        ),
    },

    {
        key: "model",
        label: "MODELO / MARCA",
        width: 160,
        sortable: true,
        render: (d) => (
            <div className="flex flex-col">
                <span className="text-sm font-medium">
                    {d.model || "—"}
                </span>

                <span className="text-xs text-default-400">
                    {d.brand || "—"}
                </span>
            </div>
        ),
    },

    {
        key: "deviceType",
        label: "TIPO",
        width: 110,
        sortable: true,
        render: (d) => (
            <Chip
                size="sm"
                variant="flat"
            >
                {d.deviceType || "—"}
            </Chip>
        ),
    },

    {
        key: "deviceStatus",
        label: "CONEXIÓN",
        width: 120,
        sortable: true,
        render: (d) => {
            const st =
                statusColorMap[d.deviceStatus] ??
                statusColorMap.unknown;

            return (
                <Chip
                    color={st.color}
                    size="sm"
                    variant="flat"
                >
                    {st.label}
                </Chip>
            );
        },
    },

    {
        key: "status",
        label: "CICLO",
        width: 110,
        sortable: true,
        render: (d) => {
            const st =
                lifecycleColorMap[d.status] ??
                lifecycleColorMap.ACTIVE;

            return (
                <Chip
                    color={st.color}
                    size="sm"
                    variant="dot"
                >
                    {st.label}
                </Chip>
            );
        },
    },
    {
        key: "firmwareVersion",
        label: "FIRMWARE",
        width: 130,
        sortable: false,
        render: (d) => (
            <span className="text-xs font-mono text-default-500">
                {d.firmwareVersion || "—"}
            </span>
        ),
    },

    {
        key: "iccid",
        label: "ICCID",
        width: 150,
        sortable: true,
        render: (d) => (
            <span className="text-xs font-mono text-default-500">
                {d.iccid || "—"}
            </span>
        ),
    },

    {
        key: "msisdn",
        label: "MSISDN",
        width: 140,
        sortable: true,
        render: (d) => (
            <span className="text-sm text-default-600">
                {d.msisdn || "—"}
            </span>
        ),
    },

    {
        key: "speedInKmh",
        label: "VELOCIDAD",
        width: 120,
        sortable: true,
        render: (d) => (
            <span className="text-sm text-default-600">
                {d.speedInKmh ?? 0} km/h
            </span>
        ),
    },

    {
        key: "odometerInMeters",
        label: "ODÓMETRO",
        width: 130,
        sortable: true,
        render: (d) => (
            <span className="text-sm text-default-600">
                {d.odometerInMeters ?? 0} m
            </span>
        ),
    },

    {
        key: "lastConnection",
        label: "ÚLTIMA CONEXIÓN",
        width: 180,
        sortable: true,
        render: (d) => (
            <span className="text-default-600 text-sm">
                {d.lastConnection
                    ? new Date(
                          d.lastConnection
                      ).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                      })
                    : "—"}
            </span>
        ),
    },

    {
        key: "lastDisconnection",
        label: "ÚLTIMA DESCONEXIÓN",
        width: 180,
        sortable: true,
        render: (d) => (
            <span className="text-default-600 text-sm">
                {formatDate(d.lastDisconnection)}
            </span>
        ),
    },

    {
        key: "lastDataReceived",
        label: "ÚLTIMO DATO",
        width: 180,
        sortable: true,
        render: (d) => (
            <span className="text-default-600 text-sm">
                {formatDate(d.lastDataReceived)}                   
            </span>
        ),
    },

    {
        key: "latitude",
        label: "UBICACIÓN",
        width: 180,
        sortable: true,
        render: (d) => (
            <div className="flex flex-col">
                <span className="text-xs font-mono text-default-600">
                    Lat: {d.latitude ?? "—"}
                </span>

                <span className="text-xs font-mono text-default-400">
                    Lon: {d.longitude ?? "—"}
                </span>
            </div>
        ),
    },

    {
        key: "acciones",
        label: "ACCIONES",
        width: 140,
        sortable: false,
        align: "center",
        render: (d) => (
            <div className="flex items-center justify-center gap-1">
                {onView && (
                    <Tooltip
                        content="Ver"
                        size="sm"
                    >
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => onView(d)}
                        >
                            <Eye size={16} />
                        </Button>
                    </Tooltip>
                )}

                {onEdit && (
                    <Tooltip
                        content="Editar"
                        size="sm"
                    >
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => onEdit(d)}
                        >
                            <Pen size={16} />
                        </Button>
                    </Tooltip>
                )}

                {onDelete && (
                    <Tooltip
                        content="Eliminar"
                        size="sm"
                        color="danger"
                    >
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => onDelete(d)}
                        >
                            <TrashBinTrash size={16} />
                        </Button>
                    </Tooltip>
                )}
            </div>
        ),
    },
];
