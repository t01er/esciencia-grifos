
export const formatDate = (
    date?: string | Date | null,
    showTime = true
) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",  
        ...(showTime && {
            hour: "2-digit",
            minute: "2-digit",
        }),
    }).format(new Date(date));
};
export const formatTime = (date?: string | Date | null): string => {
    if (!date) return "--:--";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "--:--";
    return d.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatDateOnly = (date?: string | Date | null): string => {
    return formatDate(date, false);
};

export const toInstant = (date: Date): string => {
    return date.toISOString();
};

export const startOfDayISO = (date: Date): string => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
};

export const endOfDayISO = (date: Date): string => {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d.toISOString();
};

export const formatDateRange = (
    range?: { start?: Date | null; end?: Date | null } | null
): string => {
    if (!range?.start || !range?.end) return "Seleccionar fechas";
    return `${formatDateOnly(range.start)} - ${formatDateOnly(range.end)}`;
};

export const nowISO = (): string => new Date().toISOString();


export const toInstantISO = (date: Date): string => {
    return date.toISOString().replace(/\.\d{3}Z$/, "Z");
};

export const startOfDayInstant = (date: Date): string => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString().replace(/\.\d{3}Z$/, "Z");
};

export const endOfDayInstant = (date: Date): string => {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 0);
    return d.toISOString().replace(/\.\d{3}Z$/, "Z");
};