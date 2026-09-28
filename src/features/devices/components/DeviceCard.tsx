import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Tooltip,
    Divider,
    Accordion,
    AccordionItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@heroui/react";
import {
    Eye,
    Pen,
    TrashBinTrash,
    Cpu,
    Smartphone,
} from "@solar-icons/react";
import type { Device } from "../types/device";

interface Props {
    device: Device;
    onView?: (device: Device) => void;
    onEdit?: (device: Device) => void;
    onDelete?: (device: Device) => void;
}

const statusColorMap: Record<
    string,
    { color: "success" | "warning" | "danger" | "default"; label: string }
> = {
    online: { color: "success", label: "Online" },
    offline: { color: "danger", label: "Offline" },
    unknown: { color: "warning", label: "Desconocido" },
};

const lifecycleColorMap: Record<
    string,
    { color: "success" | "warning" | "danger" | "default"; label: string }
> = {
    ACTIVE: { color: "success", label: "Activo" },
    INACTIVE: { color: "warning", label: "Inactivo" },
    DELETED: { color: "danger", label: "Eliminado" },
};

// ── Helpers ─────────────────────────────────────────────
const formatDuration = (ms: number): string => {
    if (!ms || ms < 0) return "—";
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

const formatDate = (iso?: string): string =>
    iso
        ? new Date(iso).toLocaleString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "—";

// Convierte sensorsData + sensor en filas para la tabla
const buildSensorRows = (device: Device) => {
    // Preferimos sensorsData si existe
    if (device.sensorsData && device.sensorsData.length > 0) {
        return device.sensorsData
            // Excluye duplicados *_in_seconds
            .filter((s) => !s.key.endsWith("_in_seconds"))
            .map((s) => ({
                key: s.key,
                value: s.value,
                timestamp: s.timestamp,
                lastChange: s.lastStateChangeTimestamp,
                timeInState: s.timeInCurrentState,
            }));
    }

    // Fallback: usar el objeto sensor plano
    if (device.sensor && typeof device.sensor === "object") {
        return Object.entries(device.sensor)
            .filter(([k]) => !k.endsWith("_in_seconds"))
            .map(([key, value]) => ({
                key,
                value: String(value),
                timestamp: undefined,
                lastChange: undefined,
                timeInState: undefined,
            }));
    }

    return [];
};

// ── Componente ──────────────────────────────────────────
export default function DeviceCard({ device, onView, onEdit, onDelete }: Props) {
    const conn = statusColorMap[device.deviceStatus] ?? statusColorMap.unknown;
    const lifecycle = lifecycleColorMap[device.status] ?? lifecycleColorMap.ACTIVE;

    const sensorRows = buildSensorRows(device);
    const hasSensors = sensorRows.length > 0;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-3">
                    {device.imageUrl ? (
                        <img
                            src={device.imageUrl}
                            alt={device.serialNumber}
                            className="w-12 h-12 rounded-lg object-cover border border-default-200"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-default-100 flex items-center justify-center text-default-400">
                            <Smartphone size={22} />
                        </div>
                    )}

                    <div className="flex flex-col">
                        <h3 className="text-md font-semibold text-default-700">
                            {device.serialNumber || "—"}
                        </h3>
                        <span className="text-xs text-default-400 font-mono">
                            IMEI: {device.imei || "—"}
                        </span>
                    </div>
                </div>

                <Chip color={conn.color} size="sm" variant="flat">
                    {conn.label}
                </Chip>
            </CardHeader>

            <Divider />

            <CardBody className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col">
                        <span className="text-xs text-default-400">Modelo</span>
                        <span className="text-default-700">{device.model || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-default-400">Marca</span>
                        <span className="text-default-700">{device.brand || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-default-400">Tipo</span>
                        <Chip size="sm" variant="flat" className="w-fit">
                            {device.deviceType}
                        </Chip>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-default-400">Estado</span>
                        <Chip size="sm" variant="dot" color={lifecycle.color} className="w-fit">
                            {lifecycle.label}
                        </Chip>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-default-500 pt-1 border-t border-default-100">
                    <Cpu size={14} />
                    <span className="font-mono">
                        {device.firmwareVersion || "sin firmware"}
                    </span>
                </div>

                <div className="text-xs text-default-500">
                    Última conexión:{" "}
                    <span className="text-default-700">
                        {formatDate(device.lastConnection)}
                    </span>
                </div>

                {hasSensors && (
                    <Accordion
                        variant="light"
                        className="px-0"
                        itemClasses={{
                            base: "py-0",
                            title: "text-xs font-medium text-default-600",
                            trigger: "px-0 py-2",
                            content: "px-0 pb-0 pt-0",
                            indicator: "text-default-400",
                        }}
                    >
                        <AccordionItem
                            key="sensors"
                            aria-label="Sensores"
                            title={
                                <div className="flex items-center gap-2">
                                    <Cpu size={14} className="text-default-400" />
                                    <span>Sensores</span>
                                    <Chip size="sm" variant="flat" color="primary">
                                        {sensorRows.length}
                                    </Chip>
                                </div>
                            }
                        >
                            <div className="max-h-64 overflow-auto rounded-lg border border-default-100">
                                <Table
                                    aria-label="Sensores del dispositivo"
                                    removeWrapper
                                    classNames={{
                                        th: "bg-default-50 text-[10px] uppercase tracking-wide text-default-500",
                                        td: "text-xs py-1.5",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn key="key">SENSOR</TableColumn>
                                        <TableColumn key="value">VALOR</TableColumn>
                                        <TableColumn key="time">TIEMPO EN ESTADO</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {sensorRows.map((row) => (
                                            <TableRow key={row.key}>
                                                <TableCell>
                                                    <code className="text-[11px] bg-default-100 px-1.5 py-0.5 rounded">
                                                        {row.key}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-default-700">
                                                        {row.value}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-default-500">
                                                        {row.timeInState
                                                            ? formatDuration(row.timeInState)
                                                            : "—"}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </AccordionItem>
                    </Accordion>
                )}

                <div className="flex justify-end gap-1 pt-1 border-t border-default-100">
                    {onView && (
                        <Tooltip content="Ver" size="sm">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="primary"
                                onPress={() => onView(device)}
                            >
                                <Eye size={16} />
                            </Button>
                        </Tooltip>
                    )}
                    {onEdit && (
                        <Tooltip content="Editar" size="sm">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => onEdit(device)}
                            >
                                <Pen size={16} />
                            </Button>
                        </Tooltip>
                    )}
                    {onDelete && (
                        <Tooltip content="Eliminar" size="sm" color="danger">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => onDelete(device)}
                            >
                                <TrashBinTrash size={16} />
                            </Button>
                        </Tooltip>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}