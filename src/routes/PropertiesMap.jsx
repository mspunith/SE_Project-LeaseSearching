import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import 'leaflet/dist/leaflet.css';

const MapView = ({ center }) => {
    const map = useMap();
    map.setView(center, map.getZoom());

    return null;
};

const PropertiesMap = () => {
    const [properties, setProperties] = useState([]);
    const [currentPosition, setCurrentPosition] = useState({ lat: 45.4, lng: -75.7 }); // Default center

    useEffect(() => {
        const fetchProperties = async () => {
            const snapshot = await getDocs(collection(db, "listings"));
            const propertiesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProperties(propertiesData);
        };

        fetchProperties();
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                console.log(position);
                setCurrentPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            function() {
                console.log('Geolocation permission denied');
            }
        );
    }, []);

    return (
        <div style={{ height: '80vh', width: '80%', margin: '0 auto' }}>
            <MapContainer center={currentPosition} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapView center={currentPosition} />
                {properties.map(property => (
                    <Marker key={property.id} position={[property.geolocation.lat, property.geolocation.lng]}>
                        <Popup>
                            <Link to={`/category/${property.type}/${property.id}`}>
                                {property.name}
                            </Link>
                            <br />
                            {property.address}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default PropertiesMap;
