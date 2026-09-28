import {
    Cpu,
    Smartphone,
    InfoCircle,
    Key,
    Widget,
    SimCard,        
    Gallery,        
    Tag,            
    Folder,         
    UserBlock,      
} from "@solar-icons/react";
import type { FormField, FormGroup } from "../../../components/ux/ModalComponent";

export interface DeviceFormValues {
    imei: string;
    iccid: string;              
    serialNumber: string;
    deviceType: string;
    password: string;
    firmwareVersion: string;
    model: string;
    brand: string;
    imageUrl: string;
    attachments: string[];      
    groupsIds: string[];        
    tags: string[];             
    userUuidsExclude: string[]; 
}

export const getDeviceFormFields = (): FormField[] => [
    {
        name: "imei",
        label: "IMEI",
        type: "text",
        placeholder: "Ej: 123456789012345",
        required: true,
        colSpan: 1,
        startContent: <Smartphone size={16} className="text-default-400" />,
        group: "Identificación",
        validation: { required: "El IMEI es requerido" },
    },
    {
        name: "iccid",
        label: "ICCID",
        type: "text",
        placeholder: "Ej: 8951001234567890123",
        required: true,                                   
        colSpan: 1,
        startContent: <SimCard size={16} className="text-default-400" />,
        group: "Identificación",
        validation: { required: "El ICCID es requerido" },
    },
    {
        name: "serialNumber",
        label: "Número de serie",
        type: "text",
        placeholder: "Ej: SN-XXXX-YYYY",
        required: true,
        colSpan: 1,
        startContent: <Cpu size={16} className="text-default-400" />,
        group: "Identificación",
        validation: { required: "El serial es requerido" },
    },
    {
        name: "deviceType",
        label: "Tipo de dispositivo",
        type: "select",
        placeholder: "Selecciona el tipo",
        required: true,
        colSpan: 1,
        group: "Identificación",
        options: [
            { value: "MOBILE", label: "Móvil" },
            { value: "FIXED", label: "Fijo" },
            { value: "TRACKER", label: "Rastreador" },
        ],
        validation: { required: "El tipo es requerido" },
    },
    {
        name: "password",
        label: "Contraseña",
        type: "password",
        placeholder: "Contraseña del dispositivo",
        required: true,                                    // cambiado a requerido
        colSpan: 1,
        startContent: <Key size={16} className="text-default-400" />,
        group: "Identificación",
        validation: { required: "La contraseña es requerida" },
    },

    // ===== Hardware =====
    {
        name: "model",
        label: "Modelo",
        type: "text",
        placeholder: "Ej: GT06N",
        required: true,                                    // cambiado
        colSpan: 1,
        group: "Hardware",
        startContent: <Widget size={16} className="text-default-400" />,
        validation: { required: "El modelo es requerido" },
    },
    {
        name: "brand",
        label: "Marca",
        type: "text",
        placeholder: "Ej: Teltonika",
        required: true,                                    // cambiado
        colSpan: 1,
        group: "Hardware",
        validation: { required: "La marca es requerida" },
    },
    {
        name: "firmwareVersion",
        label: "Versión de firmware",
        type: "text",
        placeholder: "Ej: 1.2.3",
        required: true,                                    // cambiado
        colSpan: 1,
        group: "Hardware",
        validation: { required: "La versión es requerida" },
    },
    {
        name: "imageUrl",
        label: "URL de imagen",
        type: "text",
        placeholder: "https://...",
        required: true,                                    // cambiado
        colSpan: 1,
        group: "Hardware",
        startContent: <Gallery size={16} className="text-default-400" />,
        validation: { required: "La URL de imagen es requerida" },
    },

    // ===== Organización (nuevos) =====
    {
        name: "attachments",
        label: "Adjuntos",
        type: "text",                                       // o "tags" según tu ModalComponent
        placeholder: "URLs separadas por coma",
        required: true,
        colSpan: 2,
        group: "Organización",
        startContent: <Gallery size={16} className="text-default-400" />,
        description: "Al menos un adjunto es requerido",
        validation: { required: "Los adjuntos son requeridos" },
    },
    {
        name: "groupsIds",
        label: "Grupos",
        type: "text",
        placeholder: "IDs separados por coma",
        required: true,
        colSpan: 1,
        group: "Organización",
        startContent: <Folder size={16} className="text-default-400" />,
        validation: { required: "Debe asignar al menos un grupo" },
    },
    {
        name: "tags",
        label: "Tags",
        type: "text",
        placeholder: "tags separados por coma",
        required: true,
        colSpan: 1,
        group: "Organización",
        startContent: <Tag size={16} className="text-default-400" />,
        validation: { required: "Debe asignar al menos un tag" },
    },
    {
        name: "userUuidsExclude",
        label: "Usuarios excluidos",
        type: "text",
        placeholder: "UUIDs separados por coma",
        required: true,
        colSpan: 2,
        group: "Organización",
        startContent: <UserBlock size={16} className="text-default-400" />,
        description: "Puede ir vacío pero debe enviarse el arreglo",
        validation: { required: "El campo es requerido (puede ir vacío)" },
    },
];

export const getDeviceFormGroups = (): FormGroup[] => [
    {
        title: "Identificación",
        icon: <InfoCircle size={18} weight="Bold" />,
        description: "Datos únicos del dispositivo",
        fields: ["imei", "iccid", "serialNumber", "deviceType", "password"],
    },
    {
        title: "Hardware",
        icon: <Cpu size={18} weight="Bold" />,
        description: "Modelo, marca y firmware",
        fields: ["model", "brand", "firmwareVersion", "imageUrl"],
    },
    {
        title: "Organización",
        icon: <Folder size={18} weight="Bold" />,
        description: "Grupos, tags y adjuntos",
        fields: ["attachments", "groupsIds", "tags", "userUuidsExclude"],
    },
];

export const getDeviceInitialValues = (): DeviceFormValues => ({
    imei: "",
    iccid: "",
    serialNumber: "",
    deviceType: "MOBILE",
    password: "",
    firmwareVersion: "",
    model: "",
    brand: "",
    imageUrl: "",
    attachments: [],
    groupsIds: [],
    tags: [],
    userUuidsExclude: [],
});

export const mapDeviceToFormValues = (device: any): DeviceFormValues => ({
    imei: device?.imei || "",
    iccid: device?.iccid || "",
    serialNumber: device?.serialNumber || "",
    deviceType: device?.deviceType || "MOBILE",
    password: "",
    firmwareVersion: device?.firmwareVersion || "",
    model: device?.model || "",
    brand: device?.brand || "",
    imageUrl: device?.imageUrl || "",
    attachments: device?.attachments || [],
    groupsIds: device?.groupsIds || [],
    tags: device?.tags || [],
    userUuidsExclude: device?.userUuidsExclude || [],
});