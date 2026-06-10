import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for Leaflet marker icons in React (must run once before any MapContainer renders)
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * EventsMapView — Leaflet map showing event locations
 *
 * PROPS:
 * - events: array — events with coordinates
 * - t: translation function
 */
const EventsMapView = ({ events, t }) => {
  return (
    <div className="h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 relative z-0">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {events
          .filter((e) => e.coordinates)
          .map((event) => (
            <Marker
              key={event._id}
              position={[event.coordinates.lat, event.coordinates.lng]}
            >
              <Popup>
                <div className="text-center min-w-[150px]">
                  <h3 className="font-bold text-violet-600">{event.title}</h3>
                  <p className="text-xs">{event.date.split("T")[0]}</p>
                  <p className="text-xs font-bold mt-1">
                    {event.participants.length} {t("attending")}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default EventsMapView;