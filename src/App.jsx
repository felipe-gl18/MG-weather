import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { mgCities } from "./services/mg-cities";
import { tempoSiglas } from "./services/tempo";

function App() {
  const [buttonOpen, setButtonOpen] = useState(true);
  const [citiesData, setCitiesData] = useState([]);
  const [citiesWithWeatherData, SetCitiesWithWeatherData] = useState([]);

  const [data, setData] = useState([]);

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
        setButtonOpen(false);
      }, 3000);

      // Certifique-se de limpar o timeout se o componente for desmontado
      return () => clearTimeout(timeoutId);
    }
  }, [citiesWithWeatherData]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <button
          disabled={buttonOpen}
          onClick={() => {
            handleDadosDaCidade();
          }}
        >
          Carregar dados do clima{" "}
        </button>
      </div>
      <div
        style={{
          height: "50vh",
          overflowY: "scroll",
          marginTop: 100,
          width: "80vw",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0px 10px 0px 10px",
          }}
        >
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "lightgreen",
              alignItems: "center",
              width: 220,
            }}
          >
            Nome da Cidade
          </p>
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "lightgreen",
              alignItems: "center",
              width: 120,
            }}
          >
            Estado
          </p>
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "lightgreen",
              alignItems: "center",
              width: 120,
            }}
          >
            ID
          </p>
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "lightgreen",
              alignItems: "center",
              width: 120,
            }}
          >
            Previsão 1
          </p>
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "lightgreen",
              alignItems: "center",
              width: 120,
            }}
          >
            Previsão 2
          </p>
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "lightgreen",
              alignItems: "center",
              width: 120,
            }}
          >
            Previsão 3
          </p>
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "lightgreen",
              width: 120,
            }}
          >
            Previsão 4
          </p>
        </div>
        {data.length != 0
          ? data.map((data, index) => {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0px 10px 0px 10px",
                  }}
                  key={index}
                >
                  <p
                    style={{
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 220,
                    }}
                  >
                    {data[0]?.name}
                  </p>
                  <p
                    style={{
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 120,
                    }}
                  >
                    {data[0]?.state}
                  </p>
                  <p
                    style={{
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 120,
                    }}
                  >
                    {data[0]?.id}
                  </p>
                  <p
                    style={{
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 120,
                    }}
                  >
                    {`${data[0]?.weather[0].date}: ${data[0]?.weather[0].tempo}`}
                  </p>
                  <p
                    style={{
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 120,
                    }}
                  >
                    {`${data[0]?.weather[1].date}: ${data[0]?.weather[1].tempo}`}
                  </p>
                  <p
                    style={{
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 120,
                    }}
                  >
                    {`${data[0]?.weather[2].date}: ${data[0]?.weather[2].tempo}`}
                  </p>
                  <p
                    style={{
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 120,
                    }}
                  >
                    {`${data[0]?.weather[3].date}: ${data[0]?.weather[3].tempo}`}
                  </p>
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
}

export default App;
