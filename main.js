import { stats } from "./three-door-problem.js";
import { Chart, registerables } from "chart.js";
import * as dat from "dat.gui";

const guiContainer = document.getElementById("gui-container");
const gui = new dat.GUI({ autoPlace: false, width: "500px" });
guiContainer.appendChild(gui.domElement);

const obj = {
  samples: 100,
  numGames: 20,
  numDoors: 3,
  numTrials: 2,

  displayOutline: false,

  restart: function () {
    start();
  },
};

gui
  .add(obj, "samples")
  .name("Dumb Samples")
  .min(10)
  .max(200)
  .step(1)
  .onChange(start);
gui
  .add(obj, "numGames")
  .name("Simulated Games By Sample")
  .min(1)
  .max(5000)
  .step(1)
  .onChange(start);
gui
  .add(obj, "numDoors")
  .name("Number of Doors")
  .min(3)
  .max(10)
  .step(1)
  .onChange(start);
gui
  .add(obj, "numTrials")
  .name("Number of Trials By Game")
  .min(2)
  .max(10)
  .step(1)
  .onChange(() => {
    if (obj.numTrials > obj.numDoors) {
      obj.numTrials = obj.numDoors;
    }
    start();
  });

gui.add(obj, "restart").name("Restart");

Chart.register(...registerables);

const labels = Array.from({ length: obj.samples }, (_, i) => i + 1);
const data = Array.from(obj.samples).fill(0);

const ctx = document.getElementById("myChart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels, // X-axis labels
    datasets: [
      {
        label: "Win Percentage",
        data: data, // Y-axis data
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 1,
        fill: true,
      },
    ],
  },
  options: {
    scales: {
      x: {
        title: {
          display: true,
          text: "Ratio of Times First Choice Wasn't Changed",
        },
      },
      y: {
        title: {
          display: true,
          text: "Win Percentage",
        },
        ticks: {
          beginAtZero: true,
          callback: (value) => value + "%",
        },
      },
    },
    animation: false, // Disable animation for updates
  },
});

let subscription$ = undefined;
function start() {
  const samples = obj.samples;
  const numGames = obj.numGames;
  const numDoors = obj.numDoors;
  const numTrials = obj.numTrials;
  let counter = 0;

  // unsubscribe from previous observable if exists
  if (subscription$) {
    subscription$.unsubscribe();

    // Clear chart data
    const delta = 100 / obj.samples;
    const labels = Array.from({ length: samples }, (_, i) =>
      Math.floor(i * delta)
    );
    const data = Array.from(samples).fill(0);

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    //chart.update();

    counter = 0;
  }

  // Subscribe to the observable
  const observable$ = stats(samples, numGames, numDoors, numTrials);

  console.log(obj.samples);

  subscription$ = observable$.subscribe({
    next: (data) => {
      // Update chart data
      chart.data.labels[counter] = data.cognitiveDissonance;
      chart.data.datasets[0].data[counter] = data.winPercentage;
      counter++;

      chart.update();
    },
    error: (err) => console.error("Error:", err),
    complete: () => console.log("Data streaming completed"),
  });
}

start();
