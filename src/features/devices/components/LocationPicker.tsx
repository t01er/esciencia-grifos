// components/LocationPicker.tsx
import { Button, Input } from "@heroui/react";
import { MapPoint, Gps } from "@solar-icons/react";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_API_KEY } from "../../../config/env";
import { useSyncMapTheme } from "../../../hooks/useSyncMapTheme";

interface Props {
    latitude: string;
    longitude: string;
    onChange: (lat: string, lng: string) => void;
    mapStyle?: string;
    defaultCenter?: [number, number];
    defaultZoom?: number;
}

const DEFAULT_CENTER: [number, number] = [-75, -8];
const DEFAULT_ZOOM = 5;
const FOCUSED_ZOOM = 15;

export default function LocationPicker({
    latitude,
    longitude,
    onChange,
    mapStyle: mapStyleProp,
    defaultCenter = DEFAULT_CENTER,
    defaultZoom = DEFAULT_ZOOM,
}: Props) {
    const { mapStyle: globalMapStyle } = useSyncMapTheme();

    const activeStyle = mapStyleProp ?? globalMapStyle;

    const [loadingGeo, setLoadingGeo] = useState(false);

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const styleRef = useRef<string>(activeStyle);

    const latNum = latitude !== "" ? Number(latitude) : NaN;
    const lngNum = longitude !== "" ? Number(longitude) : NaN;
    const hasCoords = !isNaN(latNum) && !isNaN(lngNum);

    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return;

        mapboxgl.accessToken = MAPBOX_API_KEY;

        const center: [number, number] = hasCoords
            ? [lngNum, latNum]
            : defaultCenter;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: activeStyle, 
            center,
            zoom: hasCoords ? FOCUSED_ZOOM : defaultZoom,
        });

        map.addControl(
            new mapboxgl.NavigationControl({ showCompass: false }),
            "top-right"
        );

        if (hasCoords) {
            markerRef.current = new mapboxgl.Marker({
                color: "#00A64F",
                draggable: true,
            })
                .setLngLat([lngNum, latNum])
                .addTo(map);

            markerRef.current.on("dragend", () => {
                const lngLat = markerRef.current!.getLngLat();
                onChange(lngLat.lat.toFixed(6), lngLat.lng.toFixed(6));
            });
        }

        map.on("click", (e) => {
            const { lng, lat } = e.lngLat;

            if (markerRef.current) {
                markerRef.current.setLngLat([lng, lat]);
            } else {
                markerRef.current = new mapboxgl.Marker({
                    color: "#00A64F",
                    draggable: true,
                })
                    .setLngLat([lng, lat])
                    .addTo(map);

                markerRef.current.on("dragend", () => {
                    const ll = markerRef.current!.getLngLat();
                    onChange(ll.lat.toFixed(6), ll.lng.toFixed(6));
                });
            }

            onChange(lat.toFixed(6), lng.toFixed(6));
        });

        mapRef.current = map;

        return () => {
            markerRef.current?.remove();
            markerRef.current = null;
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        if (styleRef.current === activeStyle) return;
        styleRef.current = activeStyle;

        const marker = markerRef.current;
        const lngLat = marker?.getLngLat();

        map.setStyle(activeStyle);

        map.once("style.load", () => {
            if (lngLat && !markerRef.current) {
                markerRef.current = new mapboxgl.Marker({
                    color: "#00A64F",
                    draggable: true,
                })
                    .setLngLat(lngLat)
                    .addTo(map);

                markerRef.current.on("dragend", () => {
                    const ll = markerRef.current!.getLngLat();
                    onChange(ll.lat.toFixed(6), ll.lng.toFixed(6));
                });
            }
        });
    }, [activeStyle]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (!hasCoords) {
            markerRef.current?.remove();
            markerRef.current = null;
            return;
        }

        if (!markerRef.current) {
            markerRef.current = new mapboxgl.Marker({
                color: "#00A64F",
                draggable: true,
            })
                .setLngLat([lngNum, latNum])
                .addTo(map);

            markerRef.current.on("dragend", () => {
                const ll = markerRef.current!.getLngLat();
                onChange(ll.lat.toFixed(6), ll.lng.toFixed(6));
            });
        } else {
            const current = markerRef.current.getLngLat();
            if (
                Math.abs(current.lat - latNum) > 1e-6 ||
                Math.abs(current.lng - lngNum) > 1e-6
            ) {
                markerRef.current.setLngLat([lngNum, latNum]);
            }
        }

        map.flyTo({
            center: [lngNum, latNum],
            zoom: Math.max(map.getZoom(), FOCUSED_ZOOM),
            duration: 600,
        });
    }, [latNum, lngNum, hasCoords]);

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) return;
        setLoadingGeo(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                onChange(
                    pos.coords.latitude.toFixed(6),
                    pos.coords.longitude.toFixed(6)
                );
                setLoadingGeo(false);
            },
            (err) => {
                console.error("Error geolocation:", err);
                setLoadingGeo(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Ubicación</span>
                    <span className="text-xs text-default-400">
                        (opcional · arrastra el pin o haz clic en el mapa)
                    </span>
                </div>

                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<Gps size={14} />}
                    onPress={handleUseMyLocation}
                    isLoading={loadingGeo}
                >
                    Usar mi ubicación
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Input
                    size="sm"
                    label="Latitud"
                    placeholder="Ej: -12.0464"
                    value={latitude}
                    onValueChange={(v) => onChange(v, longitude)}
                    startContent={
                        <MapPoint size={14} className="text-default-400" />
                    }
                    type="number"
                    step="any"
                />
                <Input
                    size="sm"
                    label="Longitud"
                    placeholder="Ej: -77.0428"
                    value={longitude}
                    onValueChange={(v) => onChange(latitude, v)}
                    startContent={
                        <MapPoint size={14} className="text-default-400" />
                    }
                    type="number"
                    step="any"
                />
            </div>

            <div
                ref={mapContainerRef}
                className="w-full h-[260px] rounded-lg overflow-hidden border border-divider"
            />
        </div>
    );
}