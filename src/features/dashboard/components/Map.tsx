import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import NeveraLayer from "./NeveraLayer";
import { MAPBOX_API_KEY } from "../../../config/env";

interface Nevera {
  cod_nevera: string;
  distribuidor: string;
  latitud: string;
  longitud: string;
  estado_alarma: number;
}

interface Taller {
  codigo: number;
  nombre: string;
  direccion: string;
  latitud: string;
  longitud: string;
  supervisor: string;
  coordinador: string;
  tipo: number;
  razon_social: string;
}

interface MapProps {
  neveras: Nevera[];
  talleres: Taller[];
  mapStyle: string;
  onFilterFromChart?: (estadoLabel: string) => void;
  onClearFilters?: () => void;
}

export default function Map({ 
  neveras, 
  talleres, 
  mapStyle, 
  onFilterFromChart,
  onClearFilters
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null!);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const isFirstStyleEffect = useRef(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      accessToken: MAPBOX_API_KEY,
      container: mapContainerRef.current,
      style: mapStyle,
      center: [-75, -8],
      zoom: 5,
    });

    mapRef.current.on("load", () => setReady(true));

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (isFirstStyleEffect.current) {
      isFirstStyleEffect.current = false;
      return;
    }

    setReady(false);

    mapRef.current.setStyle(mapStyle);

    mapRef.current.once("style.load", () => {
      setReady(true);
    });
  }, [mapStyle]);

  return (
    <div className="relative w-full h-full ">
      {/* <div className="absolute top-19 left-2 z-10 h-[88vh] overflow-auto">
        <GraphicsCountNeveras 
          layout="sidebar" 
          onFilterByEstado={onFilterFromChart}
          onClearFilters={onClearFilters}
        />
      </div> */}
      
      <div ref={mapContainerRef} className="w-full h-full" />

      {ready && mapRef.current && (
        <>
          <NeveraLayer
            map={mapRef.current}
            neveras={neveras}
          />         
        </>
      )}
    </div>
  );
}