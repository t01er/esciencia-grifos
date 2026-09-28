import { Progress } from "@heroui/react";

type ConnectivityPanelProps = {
    signalStrength: 0 | 1 | 2 | 3 | 4;
    batteryLevel: number;
    lastSync: string;
    isOnline: boolean;
};

function SignalBars({ strength }: { strength: number }) {
    return (
        <div className="flex items-end gap-0.5">
            {[1, 2, 3, 4].map((bar) => (
                <span
                    key={bar}
                    className={`w-1.5 rounded-sm ${
                        bar <= strength ? "bg-primary" : "bg-default-100"
                    }`}
                    style={{ height: `${bar * 4 + 4}px` }}
                />
            ))}
        </div>
    );
}

export default function ConnectivityPanel({
    signalStrength,
    batteryLevel,
    lastSync,
    isOnline,
}: ConnectivityPanelProps) {
    const batteryColor =
        batteryLevel < 20
            ? "danger"
            : batteryLevel < 40
                ? "warning"
                : "primary";

    return (
        <div className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-default-400">Estado</p>
                    <div className="mt-1 flex items-center gap-1.5">
                        <span
                            className={`h-2 w-2 rounded-full ${
                                isOnline ? "bg-primary" : "bg-default-300"
                            }`}
                        />
                        <span className="text-sm font-semibold text-foreground">
                            {isOnline ? "En línea" : "Sin conexión"}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-default-400">Señal</p>
                    <div className="mt-1.5">
                        <SignalBars strength={signalStrength} />
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-default-400">Batería</p>
                    <p className="text-xs font-semibold text-foreground">
                        {batteryLevel}%
                    </p>
                </div>

                <Progress
                    value={batteryLevel}
                    color={batteryColor}
                    size="sm"
                    className="mt-1.5"
                    aria-label="Nivel de batería"
                />
            </div>

            <p className="mt-auto text-[10px] text-default-400">
                Última sincronización: {lastSync}
            </p>
        </div>
    );
}