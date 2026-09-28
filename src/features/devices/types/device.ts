export type DeviceType = "MOBILE" | "FIXED" | "TRACKER" | "OTHER" | string;
export type DeviceStatus = "online" | "offline" | "unknown";
export type DeviceLifecycleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | string;

export interface DeviceSensor {
    additionalProp1?: any;
    additionalProp2?: any;
    additionalProp3?: any;
    [key: string]: any;
}

export interface SensorsDataItem {
    key: string;
    value: string;
    timestamp: string;
    lastStateChangeTimestamp: string;
    timeInCurrentState: number;
}

export interface DeviceAttachment {
    id: number;
    fileUrl: string;
    fileType: string;
    filename: string;
    description: string;
    created: string;
}

export interface DeviceTag {
    id: number;
    name: string;
    created: string;
}

export interface DeviceGroup {
    id: number;
    name: string;
    description: string;
    created: string;
}

export interface DeviceProperties {
    latitude?: number;
    longitude?: number;
    [key: string]: any;
}

export interface Device {
    id: number;
    imei: string;
    serialNumber: string;
    deviceType: DeviceType;
    password?: string;
    firmwareVersion?: string;
    iccid?: string;
    msisdn?: string;
    model?: string;
    imageUrl?: string;
    brand?: string;
    speedInKmh?: number;
    odometerInMeters?: number;
    lastConnection?: string;
    lastDisconnection?: string;
    lastDataReceived?: string;
    created?: string;
    updated?: string;
    deviceStatus: DeviceStatus;
    latitude?: number;
    longitude?: number;
    status: DeviceLifecycleStatus;
    sensor?: DeviceSensor;
    sensorRaw?: DeviceSensor;
    dataHistory?: DeviceSensor[];
    properties?: DeviceProperties;
    sensorsData?: SensorsDataItem[];
    attachments?: DeviceAttachment[];
    tags?: DeviceTag[];
    groups?: DeviceGroup[];
}

export interface CreateDeviceRequest {
    imei: string;
    iccid: string;
    serialNumber: string;
    deviceType: string;
    password: string;
    model: string;
    brand: string;
    firmwareVersion: string;
    imageUrl: string;
    attachments: string[];
    groupsIds: string[];
    tags: string[];
    userUuidsExclude: string[];
    latitude: number;
    longitude: number;
    odometer: number;
    properties: Record<string, any>;
}

export interface UpdateDeviceRequest {
    imei?: string;
    serialNumber?: string;
    deviceType?: DeviceType;
    password?: string;
    firmwareVersion?: string;
    model?: string;
    brand?: string;
    imageUrl?: string;
    properties?: DeviceProperties;
}

export interface DeviceFilters {
    page?: number;
    size?: number;
    status?: DeviceStatus[];
    imei?: string;
    serialNumber?: string;
    msisdn?: string;
    model?: string;
    brand?: string;
    tagsId?: number[];
    groupsId?: number[];
}

export interface DeviceResponse {
    content: Device[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface DeviceHistoryItem {
    id: number;
    traceUuid: string;
    protocol: string;
    serverTime: string;
    deviceTime: string;
    fixTime: string;
    outdated: boolean;
    valid: boolean;
    latitude: number;
    longitude: number;
    altitudeInMeters: number;
    speedInKm: number;
    course: number;
    address: string | null;
    accuracy: number;
    attributes: Record<string, any>;
}

export interface DeviceHistoryResponse {
    content: DeviceHistoryItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface DeviceHistoryParams {
    deviceId: number;
    startServerTime?: string;
    endServerTime?: string;
    page?: number;
    size?: number;
}