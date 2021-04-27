import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import CSVReader from 'react-csv-reader';
import { GoogleMap, Polygon, Marker } from '@react-google-maps/api';
import Geocode from 'react-geocode';
import './styles.css';

Geocode.setApiKey('AIzaSyCuprhlOtAFpOfhaYMs5fYdjdnnla57BLg');
Geocode.setLocationType('ROOFTOP');
// Geocode.enableDebug();

const google = window.google;

function App() {
  const mapContainerStyle = {
    height: '700px',
    width: '100%',
  };

  const [paths, setPaths] = useState([]);
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [details, setDetails] = useState([]);
  const [showPath, setShowPath] = useState(false);

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
              setData(formatted);
              setFileName(fileInfo.name.split('.')[0]);
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
                setPaths([...paths, data]);
                setCenter(data[0]);
                const detail = {};
                let test = data.map(
                  (e) => new google.maps.LatLng(e.lat, e.lng)
                );
                Geocode.fromLatLng(data[1].lat, data[1].lng).then(
                  (response) => {
                    const address = response.results[0];
                    detail.lgaType =
                      address.address_components.length > 4 ? 'LGA' : 'City';
                    detail.state =
                      address.address_components[
                        address.address_components.length - 2
                      ].long_name;
                    detail.lga =
                      address.address_components[
                        address.address_components.length - 3
                      ].long_name;
                    detail.size =
                      parseFloat(
                        (
                          google.maps.geometry.spherical.computeArea(test) /
                          10000
                        ).toFixed(4)
                      ) + ' Ha';
                    detail.fileName = fileName;
                    setDetails([...details, detail]);
                  },
                  (error) => {
                    console.error(error);
                  }
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
                  setDetails([]);
                  setCenter({ lat: 6.439744, lng: 3.456023 });
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
            {details.map((e, i) => (
              <div
                key={Math.random()}
                className='details'
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                  lineHeight: 2,
                }}
              >
                <span>
                  <strong>State:</strong> {e.state}
                </span>
                <span>
                  <strong>{e.lgaType === 'City' ? 'City' : 'LGA'}:</strong>{' '}
                  {e.lga}
                </span>
                <span>
                  <strong>Land Size:</strong> {e.size}
                </span>
                <small>{e.fileName}</small>
                <button
                  className='no-print'
                  onClick={() => setCenter(paths[i][0])}
                >
                  set as map center
                </button>
              </div>
            ))}
            {/* <table style={{ marginTop: "2rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }} colSpan="2">
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
            </table> */}
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
              {paths.map((e) => (
                <Polygon key={Math.random()} paths={e} options={options} />
              ))}

              {/* {showPath &&
                paths.map((e, i) => (
                  <Marker
                    key={Math.random()}
                    position={e}
                    label={(i + 1).toString()}
                  />
                ))} */}
            </GoogleMap>
          )}
        </div>
        {paths.length ? (
          <>
            {/* <button
              className="no-print"
              onClick={() => setShowPath(!showPath)}
              style={{ marginTop: "3rem" }}
            >
              {!showPath ? "Show Path" : "Hide Path"}
            </button> */}
            <button
              className='no-print'
              onClick={() => window.print()}
              style={{ marginTop: '3rem', marginLeft: '2rem' }}
            >
              Download
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
