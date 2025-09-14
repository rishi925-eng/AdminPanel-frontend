import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, Icon, DivIcon, MarkerCluster } from 'leaflet';
import { ServiceRequest } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Status-based marker icons
const getMarkerIcon = (status: string): Icon => {
  const getColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return '#f59e0b';
      case 'triaged': return '#3b82f6';
      case 'assigned': return '#6b7280';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#22c55e';
      case 'closed': return '#6b7280';
      case 'duplicate': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return new DivIcon({
    className: 'custom-marker',
    html: `<div style=\"background-color: ${getColor(status)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);\"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

interface LeafletMapProps {
  tickets: ServiceRequest[];
  center?: LatLngExpression;
  zoom?: number;
  onTicketClick?: (ticket: ServiceRequest) => void;
  height?: string;
  showClustering?: boolean;
}

export default function LeafletMap({ 
  tickets, 
  center = [26.7606, 83.3732], // Default to Gorakhpur coordinates
  zoom = 13, 
  onTicketClick,
  height = '400px',
  showClustering = false
}: LeafletMapProps) {
  const validTickets = tickets.filter(ticket => 
    ticket.lat && 
    ticket.lng && 
    !isNaN(ticket.lat) && 
    !isNaN(ticket.lng) &&
    Math.abs(ticket.lat) <= 90 &&
    Math.abs(ticket.lng) <= 180
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{ height }} className=\"rounded-lg overflow-hidden border border-secondary-200\">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url=\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\"
          attribution='&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'
        />
        
        {validTickets.map((ticket) => (
          <Marker
            key={ticket.id}
            position={[ticket.lat, ticket.lng]}
            icon={getMarkerIcon(ticket.status)}
          >
            <Popup className=\"custom-popup\" maxWidth={300}>
              <div className=\"p-2\">
                <div className=\"flex items-start justify-between mb-2\">
                  <div className=\"flex-1\">
                    <h3 className=\"font-semibold text-secondary-900 mb-1\">
                      {ticket.category}
                    </h3>
                    <StatusBadge status={ticket.status} size=\"sm\" />
                  </div>
                  <span className=\"text-xs text-secondary-500 ml-2\">
                    #{ticket.id}
                  </span>
                </div>
                
                {ticket.photo_url && (
                  <div className=\"mb-3\">
                    <img
                      src={ticket.photo_url}
                      alt=\"Issue photo\"
                      className=\"w-full h-32 object-cover rounded\"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <p className=\"text-sm text-secondary-700 mb-3\">
                  {ticket.description?.substring(0, 150)}
                  {ticket.description && ticket.description.length > 150 ? '...' : ''}
                </p>
                
                <div className=\"space-y-1 text-xs text-secondary-500\">
                  <div>
                    <span className=\"font-medium\">Reported:</span> {formatDate(ticket.created_at)}
                  </div>
                  {ticket.assigned_dept && (
                    <div>
                      <span className=\"font-medium\">Department:</span> {ticket.assigned_dept}
                    </div>
                  )}
                  {ticket.assigned_worker?.name && (
                    <div>
                      <span className=\"font-medium\">Assigned to:</span> {ticket.assigned_worker.name}
                    </div>
                  )}
                  {ticket.sla_due && (
                    <div>
                      <span className=\"font-medium\">Due:</span> {formatDate(ticket.sla_due)}
                    </div>
                  )}
                </div>
                
                {onTicketClick && (
                  <button
                    onClick={() => onTicketClick(ticket)}
                    className=\"mt-3 btn-primary w-full text-sm py-1\"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}