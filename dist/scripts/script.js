const PROXY_URL = "https://intense-mesa-62220.herokuapp.com/";
const COUNTRIES_API_URL = "https://restcountries.herokuapp.com/api/v1/region/";
const COVID_API_URL = "http://corona-api.com/countries/";

let graphCountries = [];
let graphConfirmedData = [];
let graphCriticalData = [];
let graphDeathsData = [];
let graphRecoveredData = [];

const [continentSelectEl, countrySelectEl, severitySelectEl] =
  document.querySelectorAll("select");
const continentGraphEl = document.querySelector("canvas");
const continentGraphData = {
  type: "bar",
  data: {
    labels: graphCountries,
    datasets: [
      {
        label: "confirmed",
        backgroundColor: ["#fe4"],
        borderColor: "rgb(255, 99, 132)",
        data: graphConfirmedData,
      },
      {
        label: "critical",
        backgroundColor: ["#fa3"],
        borderColor: "rgb(255, 99, 132)",
        data: graphCriticalData,
      },
      {
        label: "deaths",
        backgroundColor: ["#f33"],
        borderColor: "rgb(255, 99, 132)",
        data: graphDeathsData,
      },
      {
        label: "recovered",
        backgroundColor: ["#22d"],
        borderColor: "rgb(255, 99, 132)",
        data: graphRecoveredData,
      },
    ],
  },
  options: {
    indexAxis: "y",
  },
};
const continentGraph = new Chart(continentGraphEl, continentGraphData);

// Countries' relevant data cache
const continents = {
  Africa: [],
  Americas: [],
  Asia: [],
  Europe: [],
  Oceania: [],
};
const countries = {};

// Functions
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
        } catch (err) {
          console.log(err);
        } finally {
          resolve();
        }
      });
    })
  );
}

function updateCountrySelect(continent) {
  [...countrySelectEl.children].forEach((option) => option.remove());
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
  // TODO: Remove spinner loader here
  continentGraph.update();
}

async function continentPicked(e) {
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
