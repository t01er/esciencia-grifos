import { useState, useEffect } from "react";
import ModalComponent from "../../../components/ux/ModalComponent";
import LocationPicker from "./LocationPicker";
import {
    getDeviceFormFields,
    getDeviceFormGroups,
    getDeviceInitialValues,
    mapDeviceToFormValues,
} from "./DeviceFormFields";
import type {
    Device,
    CreateDeviceRequest,
    UpdateDeviceRequest,
} from "../types/device";

interface ModalDeviceProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    device?: Device | null;
    mode?: "create" | "edit";
    onSubmit: (data: CreateDeviceRequest | UpdateDeviceRequest) => Promise<void>;
    isLoading?: boolean;
}

export default function ModalDevice({
    isOpen,
    onOpenChange,
    device = null,
    mode = "create",
    onSubmit,
    isLoading = false,
}: ModalDeviceProps) {
    const [initialValues, setInitialValues] = useState(getDeviceInitialValues());
    const [latitude, setLatitude] = useState<string>("");
    const [longitude, setLongitude] = useState<string>("");

    useEffect(() => {
        if (device && mode === "edit") {
            setInitialValues(mapDeviceToFormValues(device));
            setLatitude(
                device.properties?.latitude != null
                    ? String(device.properties.latitude)
                    : ""
            );
            setLongitude(
                device.properties?.longitude != null
                    ? String(device.properties.longitude)
                    : ""
            );
        } else {
            setInitialValues(getDeviceInitialValues());
            setLatitude("");
            setLongitude("");
        }
    }, [device, mode, isOpen]);

    const title = mode === "create" ? "Nuevo Dispositivo" : "Editar Dispositivo";
    const submitLabel = mode === "create" ? "Crear" : "Actualizar";

   const handleSubmit = async (formData: Record<string, any>) => {
    const toArray = (value: any): string[] => {
        if (Array.isArray(value)) return value;
        if (typeof value === "string") {
            return value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
        }
        return [];
    };

    const properties: Record<string, any> = {
        ...(device?.properties ?? {}),
        latitude: -12.0464,
        longitude: -77.0428,
    };

    const payload: CreateDeviceRequest = {
        imei: formData.imei?.trim() ?? "",
        iccid: formData.iccid?.trim() ?? "",
        serialNumber: formData.serialNumber?.trim() ?? "",
        deviceType: formData.deviceType ?? "MOBILE",
        password: formData.password ?? "",             

        model: formData.model?.trim() ?? "",
        brand: formData.brand?.trim() ?? "",
        firmwareVersion: formData.firmwareVersion?.trim() ?? "",
        imageUrl: formData.imageUrl?.trim() ?? "",

        attachments: toArray(formData.attachments),
        groupsIds: toArray(formData.groupsIds),
        tags: toArray(formData.tags),
        userUuidsExclude: toArray(formData.userUuidsExclude),

        latitude: 0,
        longitude: 0,
        odometer: 0,
        properties,
    };

    await onSubmit(payload);
};
    return (
        <ModalComponent
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={title}
            fields={getDeviceFormFields()}
            groups={getDeviceFormGroups()}
            size="2xl"
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel={submitLabel}
            cancelLabel="Cancelar"
            isLoading={isLoading}
        >
            <div className="mt-4 border-t border-divider pt-4">
                <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onChange={(lat, lng) => {
                        setLatitude(lat);
                        setLongitude(lng);
                    }}
                />
            </div>
        </ModalComponent>
    );
}