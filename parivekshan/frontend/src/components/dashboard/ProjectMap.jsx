import React, { useEffect, useRef, useCallback } from 'react'
import * as maplibregl from 'maplibre-gl/dist/maplibre-gl.mjs'
import 'maplibre-gl/dist/maplibre-gl.css'

/*
 * District → approximate centroid coordinates (lat, lng)
 * Used as fallback when the project row has no lat/lng columns.
 * Covers the states currently seeded in the database.
 */
const DISTRICT_COORDS = {
  // Delhi
  'North Delhi':   [28.7200, 77.2100],
  'New Delhi':     [28.6139, 77.2090],
  'South Delhi':   [28.5244, 77.2066],
  'East Delhi':    [28.6358, 77.2960],
  'West Delhi':    [28.6692, 77.1170],
  // Jammu & Kashmir
  'Srinagar':      [34.0837, 74.7973],
  'Anantnag':      [33.7308, 75.1544],
  'Baramulla':     [34.2113, 74.3587],
  'Jammu':         [32.7266, 74.8570],
  'Kathua':        [32.3700, 75.3200],
  'Udhampur':      [32.9240, 75.1410],
  // Meghalaya
  'West Garo Hills':    [25.5800, 90.2200],
  'Ri-Bhoi':            [25.8500, 91.8800],
  'East Khasi Hills':   [25.4670, 91.8830],
  'South West Khasi Hills': [25.3100, 91.3800],
  'Jaintia Hills':      [25.3500, 92.3500],
}

function riskColor(score) {
  const n = Number(score) || 0
  if (n >= 75) return '#c0392b'   // High – red
  if (n >= 50) return '#b4650a'   // Medium – amber
  return '#0e7c66'                 // Low – green
}

function riskCategory(score) {
  const n = Number(score) || 0
  if (n >= 75) return 'Critical'
  if (n >= 50) return 'High'
  if (n >= 30) return 'Medium'
  return 'Low'
}

function riskRadius(score) {
  const n = Number(score) || 0
  if (n >= 75) return 12
  if (n >= 50) return 9
  return 7
}

export default function ProjectMap({ project, className = '' }) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const popupRef = useRef(null)

  const getCoords = useCallback(() => {
    if (project.latitude && project.longitude) {
      return [Number(project.longitude), Number(project.latitude)]
    }
    const fallback = DISTRICT_COORDS[project.block]
    if (fallback) return [fallback[1], fallback[0]]
    return [78.9629, 22.5937]
  }, [project])

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return

    const coords = getCoords()
    const score = Number(project.risk_score) || 0
    const color = riskColor(score)

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          },
        },
        layers: [
          {
            id: 'esri-satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: coords,
      zoom: 12,
      maxZoom: 18,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 200, unit: 'metric' }), 'bottom-left')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('load', () => {
      const r = riskRadius(score)
      const dotSize = r + 2
      const ringSize = r * 3 + 6

      const el = document.createElement('div')
      el.className = 'project-map-marker'
      el.style.cssText = `
        width: ${dotSize}px;
        height: ${dotSize}px;
        cursor: pointer;
        overflow: visible;
        position: relative;
      `

      const dot = document.createElement('div')
      dot.style.cssText = `
        width: ${dotSize}px;
        height: ${dotSize}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 2px ${color}40;
        position: absolute;
        top: 0; left: 0;
        transform-origin: center center;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        z-index: 2;
      `
      el.appendChild(dot)

      const ring = document.createElement('div')
      ring.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${ringSize}px;
        height: ${ringSize}px;
        margin-top: -${ringSize / 2}px;
        margin-left: -${ringSize / 2}px;
        border: 2px solid ${color};
        border-radius: 50%;
        animation: pulse-ring 2s ease-out infinite;
        pointer-events: none;
        z-index: 1;
      `
      el.appendChild(ring)

      el.addEventListener('mouseenter', () => {
        dot.style.transform = 'scale(1.3)'
        dot.style.boxShadow = `0 4px 16px rgba(0,0,0,0.5), 0 0 0 4px ${color}60`
        map.getCanvas().style.cursor = 'pointer'
      })
      el.addEventListener('mouseleave', () => {
        dot.style.transform = 'scale(1)'
        dot.style.boxShadow = `0 2px 8px rgba(0,0,0,0.4), 0 0 0 2px ${color}40`
        map.getCanvas().style.cursor = ''
      })

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(coords)
        .addTo(map)

      markerRef.current = marker

      const popupContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-width: 240px; padding: 2px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; flex-shrink: 0;"></span>
            <strong style="font-size: 14px; color: #1a1a2e;">${project.name || 'Untitled Project'}</strong>
          </div>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="color: #64748b; padding: 3px 8px 3px 0;">Code</td><td style="font-weight: 600; color: #334155; padding: 3px 0;">${project.code || '—'}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 8px 3px 0;">Block</td><td style="font-weight: 600; color: #334155; padding: 3px 0;">${project.block || '—'}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 8px 3px 0;">District</td><td style="font-weight: 600; color: #334155; padding: 3px 0;">${project.district || '—'}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 8px 3px 0;">Sector</td><td style="font-weight: 600; color: #334155; padding: 3px 0;">${project.project_type || '—'}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 8px 3px 0;">Status</td><td style="font-weight: 600; color: #334155; padding: 3px 0; text-transform: capitalize;">${(project.status || 'unknown').replace(/_/g, ' ')}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 8px 3px 0;">Risk</td>
                <td style="font-weight: 700; color: ${color}; padding: 3px 0;">${riskCategory(score)} (${score.toFixed(0)}/100)</td></tr>
            <tr><td style="color: #64748b; padding: 3px 8px 3px 0;">Mouzas</td><td style="font-weight: 600; color: #334155; padding: 3px 0;">${Number(project.mouzas_affected || 0).toLocaleString()}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 8px 3px 0;">Delay</td><td style="font-weight: 600; color: #c0392b; padding: 3px 0;">${project.delay_days || 0} days</td></tr>
          </table>
        </div>
      `

      const popup = new maplibregl.Popup({
        offset: 18,
        closeButton: true,
        maxWidth: '320px',
        className: 'project-map-popup',
      })
        .setLngLat(coords)
        .setHTML(popupContent)
        .addTo(map)

      popupRef.current = popup

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        if (popup.isOpen()) {
          popup.remove()
        } else {
          popup.setLngLat(coords).addTo(map)
        }
      })

      map.flyTo({
        center: coords,
        zoom: 13,
        duration: 1500,
        essential: true,
      })
    })

    mapRef.current = map

    return () => {
      if (popupRef.current) popupRef.current.remove()
      if (markerRef.current) markerRef.current.remove()
      map.remove()
      mapRef.current = null
    }
  }, [project, getCoords])

  return (
    <div className={`relative ${className}`}>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .project-map-marker {
          transform-origin: center center;
        }
        .project-map-popup .maplibregl-popup-content {
          border-radius: 12px !important;
          padding: 12px 14px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
          border: 1px solid #e2e8f0 !important;
        }
        .project-map-popup .maplibregl-popup-close-button {
          font-size: 18px !important;
          color: #94a3b8 !important;
          right: 8px !important;
          top: 4px !important;
          width: 24px !important;
          height: 24px !important;
          line-height: 24px !important;
          text-align: center !important;
        }
        .project-map-popup .maplibregl-popup-close-button:hover {
          color: #1e293b !important;
        }
        .project-map-popup .maplibregl-popup-tip {
          border-top-color: white !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08) !important;
        }
      `}</style>
      <div
        ref={mapContainer}
        className="w-full h-full min-h-[320px] rounded-xl overflow-hidden border border-border-crisp"
        style={{ minHeight: 320 }}
      />
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg border border-border-crisp px-3 py-2 shadow-sm z-10">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Risk Level</p>
        <div className="flex flex-col gap-1">
          {[
            { label: 'Critical (≥75)', color: '#c0392b' },
            { label: 'High (50–74)', color: '#b4650a' },
            { label: 'Low (<50)', color: '#0e7c66' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-[10px] text-text-secondary font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      {project.latitude && project.longitude && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg border border-border-crisp px-2.5 py-1.5 shadow-sm z-10">
          <p className="text-[10px] font-mono text-text-muted">
            {Number(project.latitude).toFixed(4)}°N, {Number(project.longitude).toFixed(4)}°E
          </p>
        </div>
      )}
    </div>
  )
}
