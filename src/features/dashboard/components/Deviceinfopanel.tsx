import { Chip } from "@heroui/react";
import { AltArrowRight } from "@solar-icons/react";

type AlertLevel = "critical" | "warning" | "none";

type Device = {
    id: string;
    location: string;
    alertLevel: AlertLevel;
    alertMessage?: string;
    status: "active" | "inactive";
};

type DeviceListPanelProps = {
    devices: Device[];
    onSelectDevice?: (deviceId: string) => void;
    height?: string;
    minCardWidth?: string;
};

function getLevelConfig(level: AlertLevel) {
    switch (level) {
        case "critical":
            return {
                dot: "bg-danger-500",
                chipColor: "danger" as const,
                label: "Crítica",
                borderColor: "border-danger-200/30 dark:border-danger-500/20",
            };
        case "warning":
            return {
                dot: "bg-warning-500",
                chipColor: "warning" as const,
                label: "Advertencia",
                borderColor: "border-warning-200/30 dark:border-warning-500/20",
            };
        default:
            return {
                dot: "bg-default-300 dark:bg-default-600",
                chipColor: "default" as const,
                label: "Normal",
                borderColor: "border-divider border-zinc-200 dark:border-primary/20",
            };
    }
}

export default function DeviceListPanel({
    devices,
    onSelectDevice,
    height = "180px",
    minCardWidth = "180px",
}: DeviceListPanelProps) {
    const alertCount = devices.filter(
        (d) => d.alertLevel !== "none"
    ).length;

    return (
        <div className="flex flex-col gap-3 ">
            <div className="flex items-stretch justify-between">
                <div>
                    <h2 className="text-base font-semibold text-foreground">Dispositivos</h2>
                    <span className="text-xs text-default-400 mt-0.5">Con alertas activas</span>
                </div>
                {alertCount > 0 && (
                    <p className="text-xs font-medium text-default-400">
                        {alertCount} dispositivo{alertCount > 1 ? "s" : ""} con alertas
                    </p>
                )}
            </div>

            <div
                className="flex gap-3 overflow-x-auto overflow-y-hidden pb-3"
                style={{ height }}
            >
                {devices.map((device) => {
                    const config = getLevelConfig(device.alertLevel);

                    return (
                        <button
                            key={device.id}
                            type="button"
                            onClick={() => onSelectDevice?.(device.id)}
                            className={`
                                group
                                relative
                                flex
                                shrink-0
                                flex-col
                                rounded-xl
                                border
                                ${config.borderColor}
                                bg-content1/40
                                p-4
                                text-left
                                transition-all
                                duration-200
                                hover:border-primary/30
                                hover:bg-content2/30
                                hover:shadow-sm
                                active:scale-[0.98]
                            `}
                            style={{ minWidth: minCardWidth }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span
                                        className={`h-2 w-2 min-w-2 rounded-full ${config.dot}`}
                                    />
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {device.id}
                                    </span>
                                </div>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    color={config.chipColor}
                                    classNames={{
                                        base: "h-5 shrink-0",
                                        content: "px-1.5 text-[9px] font-medium",
                                    }}
                                >
                                    {config.label}
                                </Chip>
                            </div>

                            <p className="mt-2 text-xs text-default-500 line-clamp-2 flex-1">
                                {device.alertLevel !== "none" && device.alertMessage
                                    ? device.alertMessage
                                    : device.location}
                            </p>
                            <div className={`mt-3 flex items-center justify-between pt-2 border-t border-divider/40 border-dashed ${config.borderColor}`}>
                                <span className="text-[10px] text-default-400">
                                    {device.status === "active" ? "Activo" : "Inactivo"}
                                </span>

                                <AltArrowRight
                                    size={14}
                                    className="
                                        text-default-300
                                        transition-all
                                        duration-200
                                        group-hover:translate-x-0.5
                                        group-hover:text-primary group-hover:dark:text-secondary 
                                        group-hover:opacity-100
                                    "
                                />
                            </div>
                        </button>
                    );
                })}

                {devices.length > 0 && (
                    <button
                        type="button"
                        className="
                            group
                            flex
                            shrink-0
                            flex-col
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-dashed
                            border-divider
                            bg-transparent
                            p-4
                            transition-all
                            duration-200
                            hover:border-primary/30
                            hover:bg-content2/20
                        "
                        style={{ minWidth: minCardWidth }}
                        onClick={() => onSelectDevice?.("all")}
                    >
                        <span className="text-2xl font-light text-default-400 group-hover:text-primary">
                            +
                        </span>
                        <span className="mt-1 text-xs text-default-400 group-hover:text-primary">
                            Ver todos
                        </span>
                    </button>
                )}
            </div>


        </div>
    );
}