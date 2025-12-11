import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix Leaflet's default icon paths in many bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng)
    }
  })
  return null
}

export default function MapPicker({ initialStart, initialEnd, onSave, onClose }) {
  const [start, setStart] = useState(initialStart || null)
  const [end, setEnd] = useState(initialEnd || null)

  useEffect(() => {
    setStart(initialStart || null)
    setEnd(initialEnd || null)
  }, [initialStart, initialEnd])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[90%] max-w-4xl bg-white rounded shadow-lg overflow-hidden">
        <div className="p-3 flex items-center justify-between border-b">
          <div className="font-semibold">Pick Start & End</div>
          <div>
            <button className="px-3 py-1 mr-2 bg-gray-100 rounded" onClick={() => { setStart(null); setEnd(null) }}>Clear</button>
            <button className="px-3 py-1 bg-emerald-500 text-white rounded" onClick={() => onSave({ start, end })}>Save</button>
          </div>
        </div>

        <div className="flex gap-3 p-3">
          <div className="w-1/4 space-y-2">
            <div>
              <div className="text-xs text-slate-600">Start</div>
              <div className="text-sm">{start ? `${start.lat.toFixed(6)}, ${start.lng.toFixed(6)}` : 'Click map to set'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600">End</div>
              <div className="text-sm">{end ? `${end.lat.toFixed(6)}, ${end.lng.toFixed(6)}` : 'Click map to set'}</div>
            </div>
            <div className="mt-4 text-xs text-slate-600">Tip: Click the map to add markers. Click a marker to switch which is set (start/end).</div>
          </div>

          <div className="flex-1 h-96">
            <MapContainer center={[20.5937,78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ClickHandler onClick={(latlng) => {
                // If start is empty, set start, else if end empty set end, else replace end
                if (!start) setStart(latlng)
                else if (!end) setEnd(latlng)
                else setEnd(latlng)
              }} />

              {start && <Marker position={[start.lat, start.lng]} eventHandlers={{ click: () => { /* allow future interaction */ } }} />}
              {end && <Marker position={[end.lat, end.lng]} />}
            </MapContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
