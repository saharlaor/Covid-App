const PROXY_URL = "https://intense-mesa-62220.herokuapp.com/";
const COUNTRIES_API_URL = "https://restcountries.herokuapp.com/api/v1/region/";
const COVID_API_URL = "http://corona-api.com/countries/";

const [continentSelectEl, countrySelectEl, severitySelectEl] =
  document.querySelectorAll("select");
const continentGraphEl = document.querySelector("canvas");
const continentGraphData = {
  type: "bar",
  data: {
    labels: ["Nowhere"],
    datasets: [
      {
        label: "confirmed",
        backgroundColor: ["#fe4"],
        borderColor: "rgb(255, 99, 132)",
        data: [45],
      },
      {
        label: "critical",
        backgroundColor: ["#fa3"],
        borderColor: "rgb(255, 99, 132)",
        data: [45],
      },
      {
        label: "deaths",
        backgroundColor: ["#f33"],
        borderColor: "rgb(255, 99, 132)",
        data: [45],
      },
      {
        label: "recovered",
        backgroundColor: ["#22d"],
        borderColor: "rgb(255, 99, 132)",
        data: [45],
      },
    ],
  },
  options: {},
};
const continentGraph = new Chart(continentGraphEl, continentGraphData);

// Countries' relevant data cache
const continents = {
  Africa: [],
  America: [],
  Asia: [],
  Australia: [],
  Europe: [],
  Oceania: [],
};
const countries = {};

// Functions
async function request(url) {
  const req = await axios.get(url);
  return req.data;
}

async function continentPicked(e) {
  const continent = e.target.value;
}

function countryPicked(e) {
  console.log(e.target);
}

function severityPicked(e) {
  console.log(e.target);
}

function main() {
  continentSelectEl.addEventListener("change", continentPicked);
  countrySelectEl.addEventListener("change", countryPicked);
  severitySelectEl.addEventListener("change", severityPicked);
}

main();
