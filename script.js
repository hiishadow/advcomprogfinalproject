let myChart = null;

async function generateChart() {
  const response = await fetch("https://api.nationalize.io?name=" + "pluem");
  console.log(response);
  const countryData = await response.json();
  console.log(countryData);
  const numberOfCountries = document.getElementById("numberOfCountries").value;

  const data = {
    labels: countryData
      .slice(0, numberOfCountries)
      .map((country) => country.name.common),
    datasets: [
      {
        label: "Total population",
        data: countryData
          .slice(0, numberOfCountries)
          .map((country) => country.population),
        borderWidth: 1,
        backgroundColor: "rgba(220, 242, 242)",
      },
    ],
  };

  if (myChart) {
    myChart.destroy();
  }

  const ctx = document.getElementById("barChart");
  myChart = new Chart(ctx, {
    type: "bar",
    data: data,
    options: {
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}
