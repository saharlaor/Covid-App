const PROXY_URL = "https://intense-mesa-62220.herokuapp.com/";
const COUNTRIES_API_URL = "https://restcountries.herokuapp.com/api/v1/region/";
const COVID_API_URL = "http://corona-api.com/countries/";

const [continentSelectEl, countrySelectEl, severitySelectEl] =
  document.querySelectorAll("select");
const continentGraphEl = document.querySelector("canvas");
const continentGraphData = {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "confirmed",
        backgroundColor: ["#fe4"],
        borderColor: "rgb(255, 99, 132)",
        data: [],
      },
      {
        label: "critical",
        backgroundColor: ["#fa3"],
        borderColor: "rgb(255, 99, 132)",
        data: [],
      },
      {
        label: "deaths",
        backgroundColor: ["#f33"],
        borderColor: "rgb(255, 99, 132)",
        data: [],
      },
      {
        label: "recovered",
        backgroundColor: ["#22d"],
        borderColor: "rgb(255, 99, 132)",
        data: [],
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

async function getContinentCountries(continent) {
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
}

async function getCountriesCovidData(continent) {
  await continents[continent].forEach(async (country) => {
    const countriesData = await request(
      `${PROXY_URL}${COVID_API_URL}${country.code}`
    );
    countries[country.name] = countriesData.data.latest_data;
  });
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

function updateGraph(continent) {}

async function continentPicked(e) {
  const continent = e.target.value;
  if (!continents[continent].length) {
    await getContinentCountries(continent);
    await getCountriesCovidData(continent);
  }
  updateCountrySelect(continent);
  updateGraph(continent);
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
