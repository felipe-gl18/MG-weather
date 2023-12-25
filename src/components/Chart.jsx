import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  ArcElement,
} from "chart.js";
import { Bar, Chart, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
  BarController,
  ArcElement
);

export const ChartTemperature = ({ forecast }) => {
  const labels = forecast?.map((data) => new Date(data?.date).getDate());
  const temperature = forecast?.map((data) => data?.temparature);
  const rain = forecast?.map((data) => data?.rain);

  console.log(labels, temperature);

  const data = {
    labels,
    datasets: [
      {
        label: "Graus Celsius",
        maxBarThickness: 16,
        barPercentage: 0.4,
        data: temperature,
        backgroundColor: "#6CE5E8",
        type: "line",
        cubicInterpolationMode: "monotone", // Use interpolação cúbica para suavizar a curva
      },
      {
        label: "Chuva (mm)",
        maxBarThickness: 16,
        barPercentage: 0.4,
        data: rain,
        backgroundColor: "#6cc48b",
        type: "line",
        cubicInterpolationMode: "monotone", // Use interpolação cúbica para suavizar a curva
      },
    ],
  };

  const options = {
    animation: true,
    cornerRadius: 20,
    layout: { padding: 0 },
    maintainAspectRatio: false,
    responsive: true,

    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          min: 0,
        },
      },
    ],

    scales: {
      y: {
        grid: {
          display: false,
        },
        title: {
          display: false,
          text: "MWh",
          font: { size: 18, weight: "bold" },
        },
      },
      x: {
        grid: {
          display: true,
        },
        title: {
          display: true,
          text: "Dias",
          font: { size: 12, weight: "bold" },
        },
      },
    },
  };

  return (
    <div style={{ height: 240, width: 310 }}>
      <Chart
        type="bar"
        options={options}
        data={data}
        height={"100%"}
        width={"100%"}
      />
    </div>
  );
};
