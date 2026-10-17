import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 1. CSS do Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
// 2. CSS do Mapa Leaflet
import 'leaflet/dist/leaflet.css'
// 3. Estilos customizados (sobrescrevem o Bootstrap)
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)