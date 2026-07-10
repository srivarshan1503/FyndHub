import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState } from 'react'

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng)
        }
    })
    return position ? <Marker position={position} /> : null
}

const MapPicker = ({ onLocationSelect }) => {
    const [position, setPosition] = useState(null)

    const handleSetPosition = (latlng) => {
        setPosition(latlng)
        onLocationSelect(latlng)
    }

    return (
        <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height: '300px' }}>
            <MapContainer
                center={[13.0112, 80.2354]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={handleSetPosition} />
            </MapContainer>
        </div>
    )
}

export default MapPicker

