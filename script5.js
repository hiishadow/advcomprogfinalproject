let myChart1;
let myChart2; // Declare myChart outside the function to keep track of the instance
let peopleCount = 0;

document.getElementById("myForm").addEventListener("submit", function (event) {
  // Prevent the default form submission
  event.preventDefault();

  // Get the input value when the form is submitted
  const nameInput = document.getElementById("nameInput").value;
  console.log(nameInput);
  // Call functions that use the nameInput value
  // peopleCount = 0;
  // document.getElementById("numberOfPeople").textContent = 0;
  // async function processData(nameInput) {
  //   // Use Promise.all to execute the functions concurrently
  //   const [genderData, nationalityData, ageData] = await Promise.all([
  //     getGender(nameInput),
  //     getNationality(nameInput),
  //     getAge(nameInput),
  //   ]);

  //   // After all the functions are completed, you can use the results
  //   console.log(genderData);
  //   console.log(nationalityData);
  //   console.log(ageData);

  //   // Continue with the remaining code
  //   console.log(peopleCount);
  //   document.getElementById("numberOfPeople").textContent = Math.round(
  //     peopleCount / 3
  //   );
  //   console.log(peopleCount / 3);
  // }

  // Call the processData function with the nameInput
  // processData(nameInput);
  getNationality(nameInput);
});

async function getAge(nameInput, clickedCountry) {
  return new Promise(async (resolve) => {
    const response = await fetch(
      "https://api.agify.io/?name=" +
        nameInput +
        "&country_id=" +
        clickedCountry
    );
    const ageData = await response.json();

    document.querySelector(".age").classList.remove("hidden");

    if (ageData.count == 0) {
      const confirm = window.confirm(
        "No age information available for this name."
      );
      if (confirm) {
        console.log("love");
        document.querySelector(".age").classList.add("hidden");

        document.getElementById("ageData").textContent =
          "Data is not available";
        resolve(0);
        return;
      }
    } else {
      document.getElementById("regionChart").style.width = "calc(50% - 40px)";
      
      document.getElementById("ageData").textContent = ageData.age;
    }

    peopleCount += ageData.count;

    // Resolve the promise with the ageData
    resolve(ageData);
  });
}
// ...
async function getGender(nameInput, clickedCountry) {
  return new Promise(async (resolve) => {
    const response = await fetch(
      "https://api.genderize.io/?name=" +
        nameInput +
        "&country_id=" +
        clickedCountry
    );
    const genderData = await response.json();
    document.querySelector(".gender-chart").classList.remove("hidden");

    if (genderData.count == 0) {
      const confirm = window.confirm(
        "No gender information available for this name"
      );
      if (confirm) {
        document.querySelector(".gender-chart").classList.add("hidden");
        resolve(0);
        return;
      }
    }
    console.log("iMhere");
    document.getElementById("regionChart").style.width = "calc(50% - 40px)";
    peopleCount += genderData.count;

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

    // Resolve the promise with the genderData
    resolve(genderData);
  });
}

async function getNationality(nameInput) {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const response = await fetch("https://api.nationalize.io/?name=" + nameInput);
  const nationalityData = await response.json();

  if (nationalityData.count == 0) {
    window.alert("No nationalities information available for this name.");
    console.log("No national");
    document.querySelector(".region-chart").classList.add("hidden");
    document.querySelector(".gender-chart").classList.add("hidden");
    document.querySelector(".number-of-people-box").classList.add("hidden");
    document.querySelector(".age").classList.add("hidden");
    document.querySelector(".showing-area").classList.add("hidden");
    return;
  }

  document.querySelector(".region-chart").classList.remove("hidden");
  document.querySelector(".number-of-people-box").classList.remove("hidden");
  document.querySelector(".showing-area").classList.remove("hidden");

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
      onClick: async function (event, elements) {
        console.log(elements[0].index);
        if (elements.length > 0) {
          const clickedCountry =
            nationalityData.country[elements[0].index].country_id;
          console.log(`Clicked on country: ${clickedCountry}`);

          // Call getAge and wait for the promise to resolve
          const [genderData, ageData] = await Promise.all([
            getGender(nameInput, clickedCountry),

            getAge(nameInput, clickedCountry),
          ]);
          if (genderData + ageData == 0) {
            document.getElementById("regionChart").style.width =
              "calc(100% - 30px)";
            document.getElementById("numberOfPeople").textContent =
              nationalityData.count;
          } else {
            document.getElementById("numberOfPeople").textContent = Math.round(
              peopleCount / 3
            );
          }
          console.log(ageData);
          console.log(genderData);
        }
      },
    },
  });
  peopleCount = 0;  
  peopleCount += nationalityData.count;

  document.getElementById("numberOfPeople").textContent =
    Math.round(peopleCount);
}
