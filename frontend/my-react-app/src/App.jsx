import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import axios from 'axios';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const MapView = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const [waypoints, setWaypoints] = useState([]);
//   const [formData, setFormData] = useState({
//     name: "",
//     lat: "",
//     long: "",
//     alt: ""
//   });
//   const [message, setMessage] = useState("");


  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhbHZpMTExMSIsImEiOiJjbTBhaDA3cGMwMnhpMnJzN3d1eHRraTF0In0.CF-kkS6y1RUJl3piRUJYxg';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-79.4512, 43.6568],
      zoom: 8
    });

    const coordinatesGeocoder = (query) => {
      const matches = query.match(/^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i);
      if (!matches) return null;

      function coordinateFeature(lng, lat) {
        return {
          center: [lng, lat],
          geometry: { type: 'Point', coordinates: [lng, lat] },
          place_name: `Lat: ${lat} Lng: ${lng}`,
          place_type: ['coordinate'],
          properties: {},
          type: 'Feature'
        };
      }

      const coord1 = Number(matches[1]);
      const coord2 = Number(matches[2]);
      const geocodes = [];

      if (coord1 < -90 || coord1 > 90) geocodes.push(coordinateFeature(coord1, coord2));
      if (coord2 < -90 || coord2 > 90) geocodes.push(coordinateFeature(coord2, coord1));
      if (geocodes.length === 0) {
        geocodes.push(coordinateFeature(coord1, coord2));
        geocodes.push(coordinateFeature(coord2, coord1));
      }
      return geocodes;
    };

    mapRef.current.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        localGeocoder: coordinatesGeocoder,
        zoom: 4,
        placeholder: 'Try: -40, 170',
        mapboxgl: mapboxgl,
        reverseGeocode: true
      })
    );

    //  Fetching waypoints from backend and displaying on map
    axios.get("http://localhost:8000/mission")
      .then((res) => {
        if (res.data.success) {
          setWaypoints(res.data.message);
           console.log(res.data.message);
        //   res.data.message.forEach((wp) => {
        //     new mapboxgl.Marker({ color: "red" })
        //       .setLngLat([parseFloat(wp.long), parseFloat(wp.lat)])
        //       .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Name: ${wp.name}, Alt: ${wp.alt}`))
        //       .addTo(mapRef.current);
        //   } );
        res.data.message.forEach((wp) => {
            const lat = parseFloat(wp.lat);
            const lng = parseFloat(wp.long);
          
            if (
              isNaN(lat) || isNaN(lng) ||
              lat < -90 || lat > 90 ||
              lng < -180 || lng > 180
            ) {
              console.warn("Skipping invalid waypoint:", wp);
              return;
            }
          
            new mapboxgl.Marker({ color: "red" })
              .setLngLat([lng, lat])
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Name: ${wp.name}, Alt: ${wp.alt}`))
              .addTo(mapRef.current);
          });
          
        }
      })
      .catch((err) => console.log("Error fetching waypoints:", err));
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: '100vh',
        width: '100vw'
      }}
    />
  );
};

export default MapView;
