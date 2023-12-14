// script1.js
let myChart1;
let myChart2; // Declare myChart outside the function to keep track of the instance

document.getElementById("myForm").addEventListener("submit", function (event) {
  // Prevent the default form submission
  event.preventDefault();

  // Get the input value when the form is submitted
  const nameInput = document.getElementById("nameInput").value;
  console.log(nameInput);

  // Call functions that use the nameInput value
  getGender(nameInput);
  getNationality(nameInput);
});

async function getAge() {
  const response = await fetch("https://api.agify.io/?name=" + nameInput);
  const ageData = await response.json();
  // Handle age data
}
// ...

async function getGender(nameInput) {
  const response = await fetch("https://api.genderize.io/?name=" + nameInput);
  const genderData = await response.json();

  let data;

  if (genderData.gender === "male") {
    data = {
      datasets: [
        {
          data: [
            genderData.probability * 100,
            (1 - genderData.probability) * 100,
          ],
        },
      ],
      labels: ["male", "female"],
    };
  } else if (genderData.gender === "female") {
    data = {
      datasets: [
        {
          data: [
            (1 - genderData.probability) * 100,
            100 * genderData.probability,
          ],
        },
      ],
      labels: ["male", "female"],
    };
  }

  // Get the canvas element
  const ctx = document.getElementById("pieChart1");

  // Check if myChart is defined and destroy it before creating a new one
  if (myChart1) {
    myChart1.destroy();
  }

  // Create a new Chart.js instance
  myChart1 = new Chart(ctx, {
    type: "pie",
    data: data,
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              label += context.parsed.toFixed(2) + "%";
              return label;
            },
          },
        },
      },
    },
  });
}

async function getNationality(nameInput) {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const response = await fetch("https://api.nationalize.io/?name=" + nameInput);
  const nationalityData = await response.json();

  var sum = nationalityData.country.reduce(
    (total, country) => total + country.probability,
    0
  );
  const data = {
    datasets: [
      {
        data: nationalityData.country.map(
          (country) => (country.probability / sum) * 100
        ),
      },
    ],
    labels: nationalityData.country.map((country) =>
      regionNames.of(country.country_id)
    ),
  };

  // Get the canvas element
  const ctx = document.getElementById("pieChart2");

  // Check if myChart is defined and destroy it before creating a new one
  if (myChart2) {
    myChart2.destroy();
  }

  // Create a new Chart.js instance
  myChart2 = new Chart(ctx, {
    type: "pie",
    data: data,
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              label += context.parsed.toFixed(2) + "%";
              return label;
            },
          },
        },
      },
    },
  });
}
