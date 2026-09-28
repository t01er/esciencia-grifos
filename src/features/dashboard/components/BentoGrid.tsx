import Panel from "./Panel";
import ValveStatusPanel from "./Valvestatuspanel";
import FlowRatePanel from "./Flowratepanel";
import DeviceListPanel from "./Deviceinfopanel";
import ConnectivityPanel from "./Connectivitypanel";
import NeverasMapa from "./NeverasMapa";
const devices = [
  {
    id: "DEV-00125",
    location: "Planta 2 - Sector B",
    alertLevel: "critical" as const,
    alertMessage: "Pérdida de energía",
    status: "active" as const,
  },
  {
    id: "DEV-00482",
    location: "Planta 1 - Sector A",
    alertLevel: "critical" as const,
    alertMessage: "Temperatura crítica",
    status: "active" as const,
  },
  {
    id: "DEV-00821",
    location: "Planta 2 - Sector C",
    alertLevel: "warning" as const,
    alertMessage: "Batería baja",
    status: "active" as const,
  },
  {
    id: "DEV-00214",
    location: "Planta 3 - Sector A",
    alertLevel: "warning" as const,
    alertMessage: "Desconexión intermitente",
    status: "active" as const,
  },
  {
    id: "DEV-00631",
    location: "Planta 1 - Sector B",
    alertLevel: "none" as const,
    status: "active" as const,
  },
  {
    id: "DEV-00915",
    location: "Planta 3 - Sector C",
    alertLevel: "none" as const,
    status: "active" as const,
  },
  {
    id: "DEV-00372",
    location: "Planta 2 - Sector A",
    alertLevel: "critical" as const,
    alertMessage: "Puerta abierta",
    status: "inactive" as const,
  },
];

export default function BentoGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 py-2">
      <Panel        
        className="lg:col-span-2 min-h-[220px]"
      >
        <DeviceListPanel
          devices={devices}         
          onSelectDevice={(id) =>
            console.log("Ver dispositivo", id)
          }
        />
      </Panel>



      <Panel
        title="Ubicación del dispositivo"
        className="
          lg:col-start-3
          lg:row-start-1
          lg:row-span-2
          min-h-[460px]
          lg:h-full
        "
      >
        <NeverasMapa />
      </Panel>



      <div
        className="
          flex
          flex-col
          gap-6
          lg:col-span-2
          lg:flex-row
        "
      >

        <Panel
          title="Estado de la válvula"
          className="min-w-0 flex-1"
        >
          <ValveStatusPanel
            pressure={3.2}
            pressureRange={[2, 5]}
            initialOpen
            lastChanged="Hace 3 h"
          />
        </Panel>


        <Panel
          title="Conectividad"
          className="min-w-0 flex-1"
        >
          <ConnectivityPanel
            signalStrength={3}
            batteryLevel={72}
            lastSync="Hace 2 min"
            isOnline
          />
        </Panel>


        <Panel
          title="Caudal en tiempo real"
          className="min-w-0 flex-1"
        >
          <FlowRatePanel
            flow={12.4}
            normalRange={[8, 20]}
            history={[
              10,
              11,
              9,
              13,
              14,
              12,
              15,
              12.4,
            ]}
          />
        </Panel>

      </div>
    </div>
  );
}