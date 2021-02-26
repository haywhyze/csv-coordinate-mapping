import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import CSVReader from 'react-csv-reader';
import { GoogleMap, Polygon } from '@react-google-maps/api';
import Geocode from 'react-geocode';
import './styles.css';

Geocode.setApiKey('AIzaSyCuprhlOtAFpOfhaYMs5fYdjdnnla57BLg');
Geocode.setLocationType('ROOFTOP');
// Geocode.enableDebug();

const google = window.google;

function App() {
  const mapContainerStyle = {
    height: '500px',
    width: '100%',
  };

  const [paths, setPaths] = useState([]);
  const [data, setData] = useState([]);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [size, setSize] = useState(null);

  useEffect(() => {
    setCenter({ lat: 6.439744, lng: 3.456023 });
  }, []);

  const options = {
    fillColor: 'lemongreen',
    fillOpacity: 0.1,
    strokeColor: 'black',
    strokeOpacity: 1,
    strokeWeight: 2,
    clickable: false,
    zIndex: 1,
  };

  return (
    <div className='App'>
      <div className='data-view'>
        <div
          className='no-print'
          style={{
            display: 'flex',
            // padding: '2rem 1rem',
            flexDirection: 'column',
          }}
        >
          <CSVReader
            parserOptions={{ header: true }}
            onFileLoaded={(data, fileInfo) => {
              const formatted = data
                .map((e) => ({
                  lat: Number(e.latitude || e.Latitude),
                  lng: Number(e.longitude || e.Longitude),
                }))
                .filter((e) => e.lng && e.lat);
              // console.dir(formatted);
              setData(formatted);
            }}
          />
          <div
            style={{
              paddingTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <button
              onClick={() => {
                if (!data[0]) return;
                setPaths(data);
                setCenter(data[0]);
                Geocode.fromLatLng(data[0].lat, data[0].lng).then(
                  (response) => {
                    const address = response.results[0];
                    setState(address.address_components[3].long_name);
                    setLga(address.address_components[2].long_name);
                  },
                  (error) => {
                    console.error(error);
                  }
                );
                const test = data.map(
                  (e) => new google.maps.LatLng(e.lat, e.lng)
                );
                setSize(
                  parseFloat(
                    (
                      google.maps.geometry.spherical.computeArea(test) / 10000
                    ).toFixed(4)
                  ) + ' Ha'
                );
              }}
            >
              Upload
            </button>
            {document.querySelector('#react-csv-reader-input') &&
            document.querySelector('#react-csv-reader-input').value ? (
              <button
                onClick={() => {
                  setPaths([]);
                  setData([]);
                  setCenter({ lat: 9.0765, lng: 7.3986 });
                  document.querySelector(
                    '#react-csv-reader-input'
                  ).value = null;
                }}
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
        {paths.length ? (
          <>
            <div
              className='details'
              style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                lineHeight: 2,
              }}
            >
              <span>
                <strong>State:</strong> {state}
              </span>
              <span>
                <strong>LGA:</strong> {lga}
              </span>

              <span>
                <strong>Land Size:</strong> {size}
              </span>
            </div>
            <table style={{ marginTop: '2rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }} colSpan='2'>
                    Coordinates
                  </th>
                </tr>
                <tr>
                  <th>Latitude</th>
                  <th>Longitude</th>
                </tr>
              </thead>
              <tbody>
                {paths.map((e) => (
                  <tr key={Math.random()}>
                    <td>{e.lat}</td>
                    <td>{e.lng}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
      </div>
      <div className='data'>
        <div className='App-map'>
          {paths && (
            <GoogleMap
              id='marker-example'
              mapContainerStyle={mapContainerStyle}
              zoom={16}
              center={center}
            >
              <Polygon paths={paths} options={options} />
              {/* {popup} */}
            </GoogleMap>
          )}
        </div>
        {paths.length ? (
          <button
            className='no-print'
            onClick={() => window.print()}
            style={{ marginTop: '3rem' }}
          >
            Download
          </button>
        ) : null}
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
