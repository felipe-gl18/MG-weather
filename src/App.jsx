import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { mgCities } from "./services/mg-cities";
import { tempoSiglas } from "./services/tempo";

import { fetchWeatherApi } from "openmeteo";
import { ChartTemperature } from "./components/Chart";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

function App() {
  const [citiesData, setCitiesData] = useState([]);
  const [citiesWithWeatherData, SetCitiesWithWeatherData] = useState([]);

  const [forecast, setForecast] = useState([]);
  const [data, setData] = useState([]);

  const params = {
    latitude: -19.9208,
    longitude: -43.9378,
    hourly: ["temperature_2m", "rain"],
    timezone: "auto",
  };
  const url = "https://api.open-meteo.com/v1/forecast";

  const handleWeatherAPI = async () => {
    let responses = await fetchWeatherApi(url, params);

    console.log(responses);
    const range = (start, stop, step) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();

    const hourly = response.hourly();

    // Note: The order of weather variables in the URL query and the indices below need to match!
    const weatherData = {
      hourly: {
        time: range(
          Number(hourly.time()),
          Number(hourly.timeEnd()),
          hourly.interval()
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        temperature2m: hourly.variables(0).valuesArray(),
        rain: hourly.variables(1).valuesArray(),
      },
    };
    let finalResult = [];

    // `weatherData` now contains a simple structure with arrays for datetime and weather data
    for (let i = 0; i < weatherData.hourly.time.length; i++) {
      finalResult.push({
        date: weatherData.hourly.time[i].toISOString(),
        temparature: weatherData.hourly.temperature2m[i].toFixed(1),
        rain: weatherData.hourly.rain[i],
      });
    }

    setData(finalResult);
  };

  useEffect(() => {
    const fetchData = async () => {
      const promises = mgCities.map(async (data) => {
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
              const xmlResponse = xhr.responseXML;
              const cities = xmlResponse.querySelectorAll("cidades");
              const cityFiltered = [];

              cities.forEach((data) => {
                const cityName = data.querySelectorAll("cidade");
                cityName.forEach((data) => {
                  if (data.querySelector("uf").textContent === "MG") {
                    const name = data.querySelector("nome").textContent;
                    const state = data.querySelector("uf").textContent;
                    const id = data.querySelector("id").textContent;
                    cityFiltered.push({ name, state, id });
                  }
                });
              });

              resolve(cityFiltered);
            }
          };

          xhr.open(
            "GET",
            `http://servicos.cptec.inpe.br/XML/listaCidades?city=${data}`
          );
          xhr.send();
        });
      });

      const result = await Promise.all(promises);
      setCitiesData(result);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchFinalData = async () => {
      const promises = citiesData.map(async (data) => {
        if (data.length != 0) {
          return new Promise((resolve) => {
            var xhr = new XMLHttpRequest();
            var finalResult = [];

            xhr.onreadystatechange = () => {
              if (xhr.readyState == 4 && xhr.status == 200) {
                let weather = [];
                var xmlResponse = xhr.responseXML;
                var previsoes = xmlResponse.querySelectorAll("previsao");

                previsoes.forEach((data) => {
                  let date = data.querySelector("dia").textContent;
                  let tempo =
                    tempoSiglas[data.querySelector("tempo").textContent];
                  let maxTemperature = data.querySelector("maxima").textContent;
                  let minTemperature = data.querySelector("minima").textContent;
                  let iuv = data.querySelector("iuv").textContent;

                  weather.push({
                    date,
                    tempo,
                    maxTemperature,
                    minTemperature,
                    iuv,
                  });
                });

                finalResult.push({ ...data[0], weather });
              }
            };

            resolve(finalResult);

            xhr.open(
              "GET",
              `http://servicos.cptec.inpe.br/XML/cidade/${data[0]?.id}/previsao.xml`
            );
            xhr.send();
          });
        }
      });

      const result = await Promise.all(promises);
      SetCitiesWithWeatherData(result);
    };

    fetchFinalData();
  }, [citiesData]);

  function handleDadosDaCidade() {
    console.log(citiesWithWeatherData.filter((data) => data !== undefined));
    setData(citiesWithWeatherData.filter((data) => data !== undefined));
  }

  useEffect(() => {
    // Verifica se o array tem algum item
    if (citiesWithWeatherData.length > 0) {
      // Aguarda 3 segundos antes de disparar a ação
      const timeoutId = setTimeout(() => {
        // Sua ação aqui
        console.log("Ação após 3 segundos");
      }, 3000);

      // Certifique-se de limpar o timeout se o componente for desmontado
      return () => clearTimeout(timeoutId);
    }
  }, [citiesWithWeatherData]);

  useEffect(() => {
    console.log(data);
    const offsetMinutos = new Date().getTimezoneOffset();

    // Cria a instância de Date com o fuso horário local
    const minhaData = new Date(Date.now() - offsetMinutos * 60 * 1000);

    minhaData.setMinutes(0, 0, 0);
    const forecastTemp = [];
    // Formata a data como uma string se necessário

    for (let i = 0; i < 7; i++) {
      const dataFormatada = minhaData.toISOString(); // Isso já retorna a data no formato "2023-12-23T23:42:02.000Z"

      let valueOfCurrentDate = data.filter(
        (data) => data.date == dataFormatada
      );
      forecastTemp.push(valueOfCurrentDate[0]);

      minhaData.setDate(minhaData.getDate() + 1);
    }

    setForecast(forecastTemp);
  }, [data]);

  useEffect(() => {
    forecast.map((data) => {
      console.log(new Date(data?.date).getDate());
    });
  }, [forecast]);

  useEffect(() => {
    handleWeatherAPI();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <MapContainer
        center={[-19.9208, -43.9378]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[-19.9208, -43.9378]}>
          <Popup>
            <div
              style={{
                color: "black",
                borderRadius: "10px",
              }}
            >
              <div style={{ display: "flex", gap: 20 }}>
                <p>Belo Horizonte - MG</p>
                <p>{forecast[0]?.temparature} °C</p>
                <p>chuva (mm): {forecast[0]?.rain}</p>
              </div>
              <p>Previsão de sete dias</p>
              <ChartTemperature forecast={forecast} />
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default App;
