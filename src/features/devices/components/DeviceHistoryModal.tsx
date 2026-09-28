import { useEffect, useMemo, useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
    Button,
    Pagination,
} from "@heroui/react";
import type { RangeValue, DateValue } from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import SearchableMultiSelect from "./SearchableMultiSelect";
import CustomDateRangePicker from "../../../components/ux/CustomDateRangePicker";
import { useDeviceHistory } from "../hooks/useDeviceHistory";
import type { Device } from "../types/device";

interface Props {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    device: Device | null;
}

const PRIORIDAD_ATRIBUTOS = [
    "piso", "npisos", "piso_prev", "entradas", "salidas",
    "cambios", "evt", "evtp", "evtc", "evtf", "evts",
];
const ULTIMA_PRIORIDAD = ["g4", "fwesp", "fw4g", "iccid", "topic", "time"];

const buildTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return {
        startServerTime: start.toISOString(),
        endServerTime: end.toISOString(),
    };
};

const formatFechaHoraPeru = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("es-PE", {
        timeZone: "America/Lima",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

export default function DeviceHistoryModal({ isOpen, onOpenChange, device }: Props) {
    const { data, isLoading, fetchHistory } = useDeviceHistory();

    const [sensoresVisibles, setSensoresVisibles] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>({
        start: today(getLocalTimeZone()),
        end: today(getLocalTimeZone()),
    });

    const loadHistory = (pageTarget = currentPage, sizeTarget = pageSize) => {
        if (!device?.id) return;

        let { startServerTime, endServerTime } = buildTodayRange();

        if (dateRange && dateRange.start && dateRange.end) {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const localStart = dateRange.start.toDate(tz);
            const localEnd = dateRange.end.toDate(tz);
            localStart.setHours(0, 0, 0, 0);
            localEnd.setHours(23, 59, 59, 999);
            startServerTime = localStart.toISOString();
            endServerTime = localEnd.toISOString();
        }

        fetchHistory({
            deviceId: device.id,
            startServerTime,
            endServerTime,
            page: pageTarget - 1,
            size: sizeTarget,
        });
    };

    useEffect(() => {
        if (isOpen && device?.id) {
            setCurrentPage(1);
            setSensoresVisibles([]);
            const t = today(getLocalTimeZone());
            setDateRange({ start: t, end: t });
            const { startServerTime, endServerTime } = buildTodayRange();
            fetchHistory({
                deviceId: device.id,
                startServerTime,
                endServerTime,
                page: 0,
                size: pageSize,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, device?.id]);

    const handleFilter = () => {
        setCurrentPage(1);
        loadHistory(1, pageSize);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        loadHistory(page, pageSize);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const n = Number(e.target.value);
        setPageSize(n);
        setCurrentPage(1);
        loadHistory(1, n);
    };

    const sensoresDisponibles = useMemo(() => {
        if (!data?.content) return [];
        const set = new Set<string>();
        data.content.forEach((item) => {
            if (item.attributes) {
                Object.keys(item.attributes).forEach((k) => {
                    if (k !== "messageError") set.add(k);
                });
            }
        });
        return Array.from(set).sort();
    }, [data]);

    const renderAttributesFiltrados = (attributes: Record<string, any> = {}) => {
        let entries = Object.entries(attributes).filter(([key]) => {
            if (key === "messageError") return false;
            return sensoresVisibles.length === 0 || sensoresVisibles.includes(key);
        });

        entries.sort(([keyA], [keyB]) => {
            const iA = PRIORIDAD_ATRIBUTOS.indexOf(keyA);
            const iB = PRIORIDAD_ATRIBUTOS.indexOf(keyB);
            const lA = ULTIMA_PRIORIDAD.indexOf(keyA);
            const lB = ULTIMA_PRIORIDAD.indexOf(keyB);

            if (iA !== -1 && iB !== -1) return iA - iB;
            if (iA !== -1) return -1;
            if (iB !== -1) return 1;
            if (lA !== -1 && lB !== -1) return lA - lB;
            if (lA !== -1) return 1;
            if (lB !== -1) return -1;
            return keyA.localeCompare(keyB);
        });

        return entries.map(([key, value]) => ({ key, value }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="full"
            scrollBehavior="inside"
            backdrop="blur"
        >
            <ModalContent className="max-h-[92vh] bg-background">
                <ModalHeader className="py-2 px-4 text-xs font-medium tracking-wide uppercase border-b border-divider bg-content1 text-default-600">
                    Historial del Dispositivo
                    {device && (
                        <span className="ml-2 font-mono text-[10px] normal-case dark:text-secondary text-primary flex items-center">
                            · {device.serialNumber || device.imei || `#${device.id}`}
                        </span>
                    )}
                </ModalHeader>

                <ModalBody className="p-2 flex flex-col gap-2 overflow-hidden bg-content2/40">
                    <div className="flex items-center gap-2 flex-wrap border-b border-divider bg-content1 px-2 py-2 rounded-lg shadow-sm">
                        <CustomDateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            placeholder=""
                            className="w-64"
                        />

                        <SearchableMultiSelect
                            options={sensoresDisponibles}
                            selected={sensoresVisibles}
                            onChange={setSensoresVisibles}
                        />

                        <div className="flex items-center gap-1.5 ml-auto">
                            <Button
                                color="primary"
                                size="sm"
                                onPress={handleFilter}
                                isLoading={isLoading}
                                className="h-7 min-w-[60px] rounded text-[11px] font-normal"
                            >
                                Filtrar
                            </Button>
                            <Button
                                variant="flat"
                                size="sm"
                                onPress={() => loadHistory(currentPage, pageSize)}
                                isLoading={isLoading}
                                className="h-7 min-w-[70px] rounded text-[11px] font-normal text-default-500"
                            >
                                ↻ Refrescar
                            </Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 flex-1">
                            <Spinner size="sm" color="primary" label="Leyendo tramas..." />
                        </div>
                    ) : data?.content?.length ? (
                        <div className="flex-1 overflow-auto rounded-lg border border-divider bg-content1 font-mono text-[11px] select-text divide-y divide-divider/60">
                            {data.content.map((item) => {
                                const attrs = renderAttributesFiltrados(item.attributes);
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-baseline gap-2 py-[3px] px-2.5 transition-colors whitespace-nowrap w-max min-w-full text-default-600 hover:bg-primary/5"
                                    >
                                        <span className="min-w-[130px] shrink-0 tabular-nums tracking-tight text-primary">
                                            {formatFechaHoraPeru(item.deviceTime)}
                                        </span>

                                        <span className="text-default-500">
                                            <span className="text-default-300">Lat</span>
                                            <span className="mx-0.5">{item.latitude}</span>
                                            <span className="text-default-200 mx-1">|</span>
                                            <span className="text-default-300">Lng</span>
                                            <span className="mx-0.5">{item.longitude}</span>
                                            <span className="text-default-200 mx-1">|</span>
                                            <span className="text-default-300">prot</span>
                                            <span className="text-default-400 mx-0.5">
                                                {item.protocol}
                                            </span>
                                        </span>

                                        {attrs.length > 0 && (
                                            <>
                                                <span className="text-default-200">·</span>
                                                <span className="flex gap-2">
                                                    {attrs.map(({ key, value }) => (
                                                        <span key={key}>
                                                            <span className="text-default-400">
                                                                {key}
                                                            </span>
                                                            <span className="text-default-300">:</span>
                                                            <span className="text-default-600 ml-0.5">
                                                                {String(value)}
                                                            </span>
                                                        </span>
                                                    ))}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-divider rounded-lg bg-content1 flex-1">
                            <span className="text-[10px] font-mono text-default-300 mb-1">
                                — sin datos —
                            </span>
                            <p className="text-xs text-default-400">
                                No se recuperaron tramas en este intervalo.
                            </p>
                        </div>
                    )}
                </ModalBody>

                <ModalFooter className="py-1 px-4 border-t border-divider flex items-center justify-between bg-content1">
                    <div className="flex items-center gap-4 text-[11px] font-mono text-default-400">
                        <span>
                            Total:{" "}
                            <span className="tabular-nums text-default-600">
                                {data?.totalElements ?? 0}
                            </span>
                        </span>
                        <div className="flex items-center gap-1">
                            <span>Ver</span>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="bg-content2 border border-divider text-default-600 rounded px-1 py-0.5 focus:outline-none focus:border-primary cursor-pointer"
                            >
                                {[10, 20, 50, 100, 1000].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                            <span>por página</span>
                        </div>
                    </div>

                    {(data?.totalPages ?? 0) > 1 && (
                        <Pagination
                            total={data!.totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            size="sm"
                            radius="sm"
                            classNames={{
                                wrapper: "gap-1 max-h-7",
                                item: "w-6 h-6 min-w-6 text-[11px] shadow-none bg-transparent text-default-600",
                                cursor: "w-6 h-6 min-w-6 text-[11px] font-normal bg-primary text-primary-foreground",
                            }}
                        />
                    )}

                    <Button
                        variant="light"
                        size="sm"
                        className="h-7 text-[11px] font-normal text-default-400"
                        onPress={() => onOpenChange(false)}
                    >
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}