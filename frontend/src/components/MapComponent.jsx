import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

const POA_DEFAULT_CENTER = [-30.0385, -51.2245];
const POA_DEFAULT_ZOOM = 14;

function MapInstanceBinder({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map, mapRef]);
  return null;
}

function createAuraPinIcon(region, isSelected) {
  return L.divIcon({
    className: 'aura-leaflet-marker',
    iconSize: [76, 76],
    iconAnchor: [38, 38],
    html: `
      <div class="aura-pin-wrapper ${isSelected ? 'selected' : ''}" role="presentation">
        <span class="aura-pin-halo-outer" style="background: ${region.color};"></span>
        <span class="aura-pin-halo-inner" style="background: ${region.color};"></span>
        <span class="aura-pin-core" style="background: ${region.color};">
          <span class="aura-pin-dot"></span>
        </span>
        <span class="aura-pin-tag">${region.name}</span>
      </div>
    `
  });
}

export default function MapComponent({ regionsData, selectedRegionId, onSelectRegion }) {
  const mapRef = useRef(null);
  const regionsList = Object.values(regionsData);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleReset = () => {
    onSelectRegion('centro');
    if (mapRef.current) {
      mapRef.current.flyTo(POA_DEFAULT_CENTER, POA_DEFAULT_ZOOM, { duration: 0.6 });
    }
  };

  const handleMarkerSelect = (region) => {
    onSelectRegion(region.id);
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.flyTo([region.lat, region.lng], Math.max(currentZoom, 14), { duration: 0.5 });
    }
  };

  return (
    <div className="map" role="region" aria-label="Mapa interativo em tempo real de Porto Alegre">
      <MapContainer
        center={POA_DEFAULT_CENTER}
        zoom={POA_DEFAULT_ZOOM}
        minZoom={11}
        maxZoom={18}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        touchZoom={true}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <MapInstanceBinder mapRef={mapRef} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {regionsList.map((reg) => {
          const isSelected = selectedRegionId === reg.id;
          return (
            <Marker
              key={reg.id}
              position={[reg.lat, reg.lng]}
              icon={createAuraPinIcon(reg, isSelected)}
              alt={`${reg.name} — Nível ${reg.level}`}
              title={`${reg.name} (${reg.level})`}
              keyboard={true}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{
                click: () => handleMarkerSelect(reg),
                keydown: (e) => {
                  if (e.originalEvent.key === 'Enter' || e.originalEvent.key === ' ') {
                    e.originalEvent.preventDefault();
                    handleMarkerSelect(reg);
                  }
                }
              }}
            />
          );
        })}
      </MapContainer>

      <div className="maplabel" id="mapLabel" aria-live="polite">
        {regionsData[selectedRegionId]?.name} · Porto Alegre
      </div>

      <div className="mapcontrols" role="group" aria-label="Controles de visualização do mapa">
        <button type="button" onClick={handleZoomIn} title="Aproximar mapa" aria-label="Aproximar mapa">＋</button>
        <button type="button" onClick={handleZoomOut} title="Afastar mapa" aria-label="Afastar mapa">−</button>
        <button type="button" onClick={handleReset} title="Restaurar visualização inicial" aria-label="Restaurar visualização inicial">↺</button>
      </div>

      <div className="maplegend" aria-label="Legenda de níveis informativos">
        <strong>Níveis informativos</strong>
        <div className="legendrow"><i className="swatch attention" aria-hidden="true"></i>Atenção</div>
        <div className="legendrow"><i className="swatch alert" aria-hidden="true"></i>Alerta</div>
        <div className="legendrow"><i className="swatch danger" aria-hidden="true"></i>Perigo</div>
      </div>

      <div className="map-note">
        Mapa interativo em tempo real. Arraste para explorar Porto Alegre e clique para avaliar a região.
      </div>
    </div>
  );
}
