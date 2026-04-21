import homemap2 from "../assets/homemap2.png"
import delivery from "../assets/delivery.png"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet"

const deliveryBoyIcon = new L.Icon({
    iconUrl:delivery,
    iconSize:[40,40],
    iconAnchor:[20,20]
  })

  const customerIcon = new L.Icon({
    iconUrl:homemap2,
    iconSize:[40,40],
    iconAnchor:[20,20]
  })


const DeliveryBoyTracking = ({data}) => {

const deliveryBoyLat = data?.deliveryBoyLocation?.lat
const deliveryBoyLon = data?.deliveryBoyLocation?.lon

const customerLat = data?.customerLocation?.lat
const customerLon = data?.customerLocation?.lon


const path = [
    [deliveryBoyLat, deliveryBoyLon],
    [customerLat, customerLon]
]

const center = [deliveryBoyLat, deliveryBoyLon]

  
  return (
    <div className="w-full h-100 mt-3 rounded-xl overflow-hidden shadow-md">
      <MapContainer
      className='w-full h-full'
      center={center}
      zoom={16}
      >

        <TileLayer
         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
         />
        
        <Marker position={[deliveryBoyLat, deliveryBoyLon]} icon={deliveryBoyIcon}>
         <Popup>Delivery Boy</Popup>
        </Marker>

        <Marker position={[customerLat, customerLon]} icon={customerIcon}>
         <Popup>Delivery Boy</Popup>
        </Marker>

        <Polyline positions={path} color="blue" weight={4}/>

      </MapContainer>
    </div>
    
  )

}
export default DeliveryBoyTracking

