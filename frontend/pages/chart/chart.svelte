<script lang="ts">
  import { settings } from "@stores/settings";
  import Chart from "chart.js/auto";
  import { onMount } from "svelte";

  let startYear = $settings.chartStartYear ?? 2020;
  const startDate = new Date(startYear, 1, 1);
  const endDate = new Date();
  let allBooks: Book[] = [];

  function initYears(): Record<number, number> {
    let ys: Record<string, number> = {};
    let startYear = startDate.getFullYear();
    let endYear = endDate.getFullYear();
    for (let y = startYear; y <= endYear; y++) {
      ys[y] = 0;
    }
    return ys;
  }

  const mAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function initMonths(): Record<string, { display: string; count: number }> {
    let ms: Record<string, { display: string; count: number }> = {};
    let startYear = startDate.getFullYear();
    let endYear = endDate.getFullYear();
    for (let y = startYear; y <= endYear; y++) {
      for (let m = 0; m < 12; m++) {
        let ym = y + "-" + m.toString().padStart(2, "0");
        ms[ym] = {
          display: mAbbr[m] + " " + y,
          count: 0,
        };
      }
    }
    return ms;
  }

  function initDays(): Record<string, number> {
    let ds: Record<string, number> = {};
    let currentDate = startDate;
    while (currentDate <= endDate) {
      let ymd =
        currentDate.getFullYear() +
        "-" +
        currentDate.getMonth().toString().padStart(2, "0") +
        "-" +
        currentDate.getDate().toString().padStart(2, "0");
      ds[ymd] = 0;
      let newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      currentDate = newDate;
    }
    return ds;
  }

  let years: Record<number, number> = initYears();
  let months: Record<string, { display: string; count: number }> = initMonths();
  let days: Record<string, number> = initDays();

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart;

  function parseBooks() {
    allBooks.forEach((b) => {
      if (b.dateRead) {
        let t = new Date(b.dateRead);
        let y = t.getFullYear();
        let m = y + "-" + t.getMonth().toString().padStart(2, "0");
        let d = m + "-" + t.getDate().toString().padStart(2, "0");
        if (typeof years[y] !== "undefined") years[y]++;
        if (months[m]) months[m].count++;
        if (typeof days[d] !== "undefined") days[d]++;
      }
    });
  }

  function setStartYear() {
    startDate.setFullYear(startYear);
    years = initYears();
    months = initMonths();
    days = initDays();
    parseBooks();
    setView();
  }

  onMount(() => {
    window.electronAPI.readAllBooks();
    years = initYears();
    months = initMonths();
    days = initDays();

    const removeReceiveListener = window.electronAPI.receiveAllBooks((books: Book[]) => {
      allBooks = books;
      parseBooks();

      // Wait for the canvas element to appear, THEN run chart code.
      new Promise((resolve) => {
        if (chartCanvas) {
          return resolve(true);
        }
        const observer = new MutationObserver((_mutations) => {
          if (chartCanvas) {
            observer.disconnect();
            resolve(true);
          }
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }).then(() => {
        chart = new Chart(chartCanvas, {
          type: "bar",
          data: {
            labels: Object.values(months).map((m) => m.display),
            datasets: [
              {
                label: "Books Read",
                data: Object.values(months).map((m) => m.count),
                borderWidth: 1,
                borderColor: "#ff0088",
                backgroundColor: "#ff008888",
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      });
    });

    return () => {
      removeReceiveListener();
    };
  });

  let view: "year" | "month" | "day" = "month";

  function setView(v: "year" | "month" | "day" = view) {
    view = v;
    switch (v) {
      case "day":
        chart.data.labels = Object.keys(days);
        chart.data.datasets[0].data = Object.values(days);
        break;
      case "month":
        chart.data.labels = Object.values(months).map((m) => m.display);
        chart.data.datasets[0].data = Object.values(months).map((m) => m.count);
        break;
      default:
      case "year":
        chart.data.labels = Object.keys(years);
        chart.data.datasets[0].data = Object.values(years);
    }
    chart.update();
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Trend</h2>
  <div class="pageNav__actions">
    <div>Start:</div>
    <input type="number" bind:value={startYear} on:change={setStartYear} min="1900" max={new Date().getFullYear()} />
    <button class="btn btn--round" class:selected={view === "day"} on:click={() => setView("day")}>Days</button>
    <button class="btn btn--round" class:selected={view === "month"} on:click={() => setView("month")}>Months</button>
    <button class="btn btn--round" class:selected={view === "year"} on:click={() => setView("year")}>Years</button>
  </div>
</div>
<div class="chart">
  <canvas bind:this={chartCanvas} />
</div>

<style lang="scss">
  @import "../../style/variables";

  .chart {
    padding: 1rem;
  }
  .btn.selected {
    background-color: $bgColorLighter;
  }
</style>
