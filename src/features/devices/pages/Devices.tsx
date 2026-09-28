import { useEffect, useMemo, useState } from "react";
import { Button, addToast } from "@heroui/react";
import { AddCircle, FileDownload } from "@solar-icons/react";
import PageContainer from "../../../layouts/PageContainer";
import { useDevices } from "../hooks/useDevices";
import ModalDevice from "../components/ModalDevice";
import DeviceCard from "../components/DeviceCard";
import { getDeviceColumns } from "../components/DeviceColumns";
import { getDeviceFilters } from "../config/deviceFilters";
import TableComponent, { type ViewMode } from "../../../components/ux/TableComponent";
import DeviceHistoryModal from "../components/DeviceHistoryModal";
import StatsRow from "../../dashboard/components/StatsRow";
import type {
    Device,
    CreateDeviceRequest,
    UpdateDeviceRequest,
    DeviceStatus,
} from "../types/device";

export default function Devices() {
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});
    const [sortDescriptor, setSortDescriptor] = useState<{
        column: string;
        direction: "ascending" | "descending";
    }>({ column: "lastConnection", direction: "descending" });

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [viewMode, setViewMode] = useState<ViewMode>("table");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);

    const [historyDevice, setHistoryDevice] = useState<Device | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const {
        devices,
        pagination,
        isLoading,
        error,
        create,
        update,
        remove,
        refetch,
        setFilters,
    } = useDevices();

    const sortedDevices = useMemo(() => {
        let rows = [...devices];
        if (rows.length === 0) return rows;

        const columnMap: Record<string, keyof Device> = {
            id: "id",
            serialNumber: "serialNumber",
            model: "model",
            deviceType: "deviceType",
            deviceStatus: "deviceStatus",
            status: "status",
            lastConnection: "lastConnection",
        };

        const column = columnMap[sortDescriptor.column];

        if (column) {
            rows.sort((a, b) => {
                const av = String(a[column] ?? "");
                const bv = String(b[column] ?? "");
                const cmp = av.localeCompare(bv);
                return sortDescriptor.direction === "ascending" ? cmp : -cmp;
            });
        }

        return rows;
    }, [devices, sortDescriptor]);

    useEffect(() => {
        setPage(1);

        const validStatuses: DeviceStatus[] = ["online", "offline", "unknown"];

        const statusFilter =
            filterValues.status &&
                validStatuses.includes(filterValues.status as DeviceStatus)
                ? [filterValues.status as DeviceStatus]
                : undefined;

        setFilters({
            page: 0,
            size: pageSize,
            imei: filterValues.imei || undefined,
            serialNumber: filterValues.serialNumber || undefined,
            msisdn: filterValues.msisdn || undefined,
            status: statusFilter,
        });
    }, [filterValues]);

    useEffect(() => {
        setPage(1);
        setFilters({ page: 0, size: pageSize });
    }, [pageSize]);

    const handleFilterChange = (key: string, value: string) => {
        setFilterValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilterValues({});
        setPage(1);
        setFilters({
            page: 0,
            size: pageSize,
            imei: undefined,
            serialNumber: undefined,
            msisdn: undefined,
            status: undefined,
        });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setFilters({ page: newPage - 1, size: pageSize });
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
        setFilters({ page: 0, size });
    };

    const handleCreate = () => {
        setEditingDevice(null);
        setIsModalOpen(true);
    };

    const handleEdit = (device: Device) => {
        setEditingDevice(device);
        setIsModalOpen(true);
    };

    const handleView = (device: Device) => {
        setHistoryDevice(device);
        setIsHistoryOpen(true);
    };

    const handleDelete = async (device: Device) => {
        if (!confirm(`¿Eliminar el dispositivo "${device.serialNumber}"?`)) return;
        const result = await remove(device.id);
        if (result.success) await refetch();
    };

    const handleModalSubmit = async (
        data: CreateDeviceRequest | UpdateDeviceRequest
    ) => {
        setIsSubmitting(true);
        try {
            if (editingDevice) {
                await update(editingDevice.id, data);
            } else {
                await create(data as CreateDeviceRequest);
            }
            setIsModalOpen(false);
            setEditingDevice(null);
            await refetch();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExportExcel = () => {
        addToast({
            title: "Exportar",
            description: "Funcionalidad en desarrollo",
            color: "default",
        });
        console.log("Exportar a Excel", sortedDevices);
    };

    const errorMessage = useMemo(() => {
        if (!error) return null;
        if (typeof error === "string") return error;

        const e = error as any;
        return (
            e?.data?.message ||
            e?.data?.mensaje ||
            e?.message ||
            e?.statusText ||
            `Error ${e?.status ?? ""}` ||
            "Error al cargar los dispositivos"
        );
    }, [error]);

    return (
        <PageContainer>
            <StatsRow />
            <div className="flex flex-col gap-4">
                <TableComponent<Device>
                    data={sortedDevices}
                    columns={getDeviceColumns({
                        onView: handleView,
                        onEdit: handleEdit,
                        onDelete: handleDelete,
                    })}
                    idField="id"
                    filters={getDeviceFilters()}
                    filterValues={filterValues}
                    isLoading={isLoading}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    headerActions={
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                color="primary"
                                startContent={<AddCircle size={16} />}
                                onPress={handleCreate}
                            >
                                Nuevo dispositivo
                            </Button>
                            <Button
                                size="sm"
                                variant="flat"
                                startContent={<FileDownload size={16} />}
                                onPress={handleExportExcel}
                            >
                                Exportar Excel
                            </Button>
                        </div>
                    }
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                    page={page}
                    pageSize={pageSize}
                    totalRegistros={pagination.totalElements}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    availableViews={["table", "cards"]}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    error={errorMessage}
                    onRetry={refetch}
                    cardView={(device) => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                />
            </div>

            <ModalDevice
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                device={editingDevice}
                mode={editingDevice ? "edit" : "create"}
                onSubmit={handleModalSubmit}
                isLoading={isSubmitting}
            />

            <DeviceHistoryModal
                isOpen={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
                device={historyDevice}
            />
        </PageContainer>
    );
}