import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Correção padrão para os ícones do Leaflet no React Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Coordenadas centrais de Porto Alegre (Ex: Centro Histórico / Região Central)
const portoAlegreCenter = [-30.0346, -51.2177];

// Dados demonstrativos baseados nos bairros do seu artigo (Macro 1 / Macro 2)
const regioesDemonstracao = [
    { id: 1, nome: 'Centro Histórico', lat: -30.0328, lng: -51.2300, nivel: 'Perigo', cor: 'red', desc: 'Alta concentração de relatos de furto e iluminação deficiente à noite.' },
    { id: 2, nome: 'Passo da Areia', lat: -30.0090, lng: -51.1710, nivel: 'Alerta', cor: 'orange', desc: 'Relatos moderados de importunação e circulação reduzida no período noturno.' },
    { id: 3, nome: 'Menino Deus', lat: -30.0500, lng: -51.2250, nivel: 'Atenção', cor: 'yellow', desc: 'Ocorrências pontuais registradas; boa movimentação comercial diurna.' }
];

export default function MapComponent({ onSelectRegion }) {
    return (
        <div style={{ height: '450px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
            <MapContainer
                center={portoAlegreCenter}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {regioesDemonstracao.map((regiao) => (
                    <Marker
                        key={regiao.id}
                        position={[regiao.lat, regiao.lng]}
                        eventHandlers={{
                            click: () => onSelectRegion(regiao),
                        }}
                    >
                        <Popup>
                            <strong>{regiao.nome}</strong><br />
                            Nível: <em>{regiao.nivel}</em><br />
                            <button
                                onClick={() => onSelectRegion(regiao)}
                                style={{ marginTop: '5px', padding: '4px 8px', background: '#1C5FEB', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Ver Detalhes
                            </button>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}