let myChart1;
let myChart2;
let peopleCount = 0;

document.getElementById("myForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const nameInput = document.getElementById("nameInput").value;
  getNationality(nameInput);
});

async function getNationality(nameInput) {
  // Country data are in form of country codes, so we need to convert them to full country names.
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const response = await fetch("https://api.nationalize.io/?name=" + nameInput);
  const nationalityData = await response.json();

  if (nationalityData.count == 0) {
    window.alert("No nationalities information available for this name.");
    document.querySelector(".region-chart").classList.add("hidden");
    document.querySelector(".gender-chart").classList.add("hidden");
    document.querySelector(".number-of-people-box").classList.add("hidden");
    document.querySelector(".age").classList.add("hidden");
    document.querySelector(".showing-area").classList.add("hidden");
    return;
  }

  document.querySelector(".age").classList.add("hidden");
  document.querySelector(".gender-chart").classList.add("hidden");
  document.getElementById("regionChart").style.width = "calc(100% - 40px)";
  document.querySelector(".region-chart").classList.remove("hidden");
  document.querySelector(".number-of-people-box").classList.remove("hidden");
  document.querySelector(".showing-area").classList.remove("hidden");

  //Sometimes the probabilities are not added up to one , so this will make sure that all the probabilities combined will get 100%.
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

  const ctx = document.getElementById("pieChart2");

  if (myChart2) {
    myChart2.destroy();
  }

  myChart2 = new Chart(ctx, {
    type: "pie",
    data: data,
    options: {
      plugins: {
        tooltip: {
          // to add % on the label on pie chart
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
        if (elements.length > 0) {
          const clickedCountry =
            nationalityData.country[elements[0].index].country_id;

          // To make sure it working asynchronously
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
        }
      },
    },
  });

  peopleCount = 0;
  peopleCount += nationalityData.count;

  document.getElementById("numberOfPeople").textContent =
    Math.round(peopleCount);
}

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
    resolve(ageData);
  });
}

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

    document.getElementById("regionChart").style.width = "calc(50% - 40px)";
    peopleCount += genderData.count;
    let data;
    // making sure that in the chart male will be labelled as blue color and female as pink color
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

    const ctx = document.getElementById("pieChart1");

    if (myChart1) {
      myChart1.destroy();
    }

    myChart1 = new Chart(ctx, {
      type: "pie",
      data: data,
      options: {
        plugins: {
          tooltip: {
            // to add % on the label on pie chart
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

    resolve(genderData);
  });
}
