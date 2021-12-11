const PROXY_URL = "https://intense-mesa-62220.herokuapp.com/";
const COUNTRIES_API_URL = "https://restcountries.herokuapp.com/api/v1/region/";
const COVID_API_URL = "http://corona-api.com/countries/";

let graphCountries = [];
let graphConfirmedData = [];
let graphCriticalData = [];
let graphDeathsData = [];
let graphRecoveredData = [];

const graphDatasets = {
  confirmed: {
    label: "confirmed",
    backgroundColor: ["#fe4"],
    borderColor: "rgb(255, 99, 132)",
    data: graphConfirmedData,
  },
  critical: {
    label: "critical",
    backgroundColor: ["#fa3"],
    borderColor: "rgb(255, 99, 132)",
    data: graphCriticalData,
  },
  deaths: {
    label: "deaths",
    backgroundColor: ["#f33"],
    borderColor: "rgb(255, 99, 132)",
    data: graphDeathsData,
  },
  recovered: {
    label: "recovered",
    backgroundColor: ["#22d"],
    borderColor: "rgb(255, 99, 132)",
    data: graphRecoveredData,
  },
};

const bufferingEl = document.querySelector("#buffering");
const [continentSelectEl, countrySelectEl, severitySelectEl] =
  document.querySelectorAll("select");
const continentGraphEl = document.querySelector("canvas");
const continentGraphData = {
  type: "bar",
  data: {
    labels: graphCountries,
    datasets: Object.values(graphDatasets),
  },
  options: {
    indexAxis: "y",
    scales: {
      y: {
        ticks: {
          font: {
            size: 8,
          },
        },
      },
    },
  },
};
const continentGraph = new Chart(continentGraphEl, continentGraphData);
const countryStatisticsEl = document.querySelector(".country-statistics");
const [
  countryTotalCasesEl,
  countryNewCasesEl,
  countryTotalDeathsEl,
  countryNewDeathsEl,
  countryTotalRecoveredEl,
  countryCriticalEl,
] = countryStatisticsEl.querySelectorAll("div");

// Countries' relevant data cache
const continents = {
  Africa: getContinentCache("Africa"),
  Americas: getContinentCache("Americas"),
  Asia: getContinentCache("Asia"),
  Europe: getContinentCache("Europe"),
  Oceania: getContinentCache("Oceania"),
};
const countries = window.localStorage.countries
  ? JSON.parse(window.localStorage.getItem("countries"))
  : {};

// Functions
function getContinentCache(continent) {
  const continentCache = window.localStorage.getItem(continent);
  return continentCache ? JSON.parse(continentCache) : [];
}

async function request(url) {
  try {
    const req = await axios.get(url);
    return req.data;
  } catch (e) {
    return e;
  }
}

function clearArray(arr) {
  while (arr.length) {
    arr.pop();
  }
}

async function getContinentCountries(continent) {
  try {
    const countriesData = await request(
      `${PROXY_URL}${COUNTRIES_API_URL}${continent}`
    );
    console.log(countriesData);
    countriesData.forEach((country) => {
      continents[continent].push({
        name: country.name.common,
        code: country.cca2,
      });
    });
  } catch (e) {
    console.log(e);
  } finally {
    window.localStorage.setItem(
      continent,
      JSON.stringify(continents[continent])
    );
  }
}

async function getCountriesCovidData(continent) {
  return Promise.all(
    continents[continent].map((country) => {
      return new Promise(async (resolve, _reject) => {
        try {
          const countriesData = await request(
            `${PROXY_URL}${COVID_API_URL}${country.code}`
          );
          console.log(countriesData.data.latest_data);
          countries[country.name] = countriesData.data.latest_data;
          countries[country.name].timeline = countriesData.data.timeline.slice(
            0,
            14
          );
        } catch (err) {
          console.log(err);
        } finally {
          window.localStorage.setItem("countries", JSON.stringify(countries));
          resolve();
        }
      });
    })
  );
}

function updateCountrySelect(continent) {
  [...countrySelectEl.children].forEach((option) => option.remove());
  const disabledOptionEl = document.createElement("option");
  disabledOptionEl.setAttribute("disabled", "true");
  disabledOptionEl.setAttribute("selected", "true");
  disabledOptionEl.textContent = "Choose Country";
  countrySelectEl.append(disabledOptionEl);
  continents[continent].forEach((country) => {
    const countryOptionEl = document.createElement("option");
    countryOptionEl.value = country.code;
    countryOptionEl.textContent = country.name;
    countrySelectEl.append(countryOptionEl);
  });
}

function updateGraph(continent) {
  clearArray(graphCountries);
  clearArray(graphConfirmedData);
  clearArray(graphCriticalData);
  clearArray(graphDeathsData);
  clearArray(graphRecoveredData);
  continents[continent].forEach((country) => {
    if (!countries[country.name]) {
      return;
    }
    graphCountries.push(country.name);
    graphConfirmedData.push(countries[country.name].confirmed);
    graphCriticalData.push(countries[country.name].critical);
    graphDeathsData.push(countries[country.name].deaths);
    graphRecoveredData.push(countries[country.name].recovered);
  });
  bufferingEl.classList.add("hidden");
  continentGraph.update();
}

async function continentPicked(e) {
  bufferingEl.classList.remove("hidden");
  const continent = e.target.value;
  if (!continents[continent].length) {
    try {
      await getContinentCountries(continent);
      await getCountriesCovidData(continent);
    } catch (err) {
      console.log(err);
    } finally {
      updateCountrySelect(continent);
      updateGraph(continent);
    }
  } else {
    updateCountrySelect(continent);
    updateGraph(continent);
  }
}

function countryPicked(e) {
  const country = countrySelectEl.querySelector(
    `[value='${e.target.value}']`
  ).textContent;
  document.querySelector(".country-statistics__country").textContent = country;
  const countryStatistics = [
    countries[country].confirmed,
    countries[country].timeline[0].new_confirmed,
    countries[country].deaths,
    countries[country].timeline[0].new_deaths,
    countries[country].recovered,
    countries[country].critical,
  ];
  [
    countryTotalCasesEl,
    countryNewCasesEl,
    countryTotalDeathsEl,
    countryNewDeathsEl,
    countryTotalRecoveredEl,
    countryCriticalEl,
  ].forEach((element, index) => {
    const spanEl = element.querySelector("span");
    spanEl.textContent = countryStatistics[index];
  });
}

function severityPicked(e) {
  const severity = e.target.value;
  continentGraphData.data.datasets =
    severity === "overview"
      ? Object.values(graphDatasets)
      : [graphDatasets[severity]];
  continentGraph.update();
}

function main() {
  continentSelectEl.addEventListener("change", continentPicked);
  countrySelectEl.addEventListener("change", countryPicked);
  severitySelectEl.addEventListener("change", severityPicked);
}

main();
