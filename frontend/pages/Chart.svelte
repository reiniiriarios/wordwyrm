<script lang="ts">
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";

  import { books } from "@stores/books";
  import { settings } from "@stores/settings";

  let startYear = $settings.chartStartYear ?? 2020;
  const startDate = new Date(startYear, 1, 1);
  const endDate = new Date();

  function initYears(): Record<number, number> {
    const ys: Record<string, number> = {};
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    for (let y = startYear; y <= endYear; y++) {
      ys[y] = 0;
    }
    return ys;
  }

  const mAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function initMonths(): Record<string, { display: string; count: number }> {
    const ms: Record<string, { display: string; count: number }> = {};
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    for (let y = startYear; y <= endYear; y++) {
      for (let m = 0; m < 12; m++) {
        const ym = `${y}-${m.toString().padStart(2, "0")}`;
        ms[ym] = {
          display: `${mAbbr[m]} ${y}`,
          count: 0,
        };
      }
    }
    return ms;
  }

  function initDays(): Record<string, number> {
    const ds: Record<string, number> = {};
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const ymd = `${currentDate.getFullYear()}-${currentDate.getMonth().toString().padStart(2, "0")}-${currentDate
        .getDate()
        .toString()
        .padStart(2, "0")}`;
      ds[ymd] = 0;
      const newDate = new Date(currentDate);
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
    $books.allBooks.forEach((b) => {
      if (b.dateRead) {
        const t = new Date(b.dateRead);
        const y = t.getFullYear();
        const m = `${y}-${t.getMonth().toString().padStart(2, "0")}`;
        const d = `${m}-${t.getDate().toString().padStart(2, "0")}`;
        if (typeof years[y] !== "undefined") {
          years[y]++;
        }
        if (months[m]) {
          months[m].count++;
        }
        if (typeof days[d] !== "undefined") {
          days[d]++;
        }
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
    years = initYears();
    months = initMonths();
    days = initDays();
    parseBooks();

    const barColor =
      getComputedStyle(document.getElementById("appContainer") as HTMLDivElement).getPropertyValue("--c-chart-bar") ??
      "#ff0088";
    const barColorBorder =
      getComputedStyle(document.getElementById("appContainer") as HTMLDivElement).getPropertyValue(
        "--c-chart-bar-border",
      ) ?? "#ff008888";

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
              borderColor: barColorBorder,
              backgroundColor: barColor,
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
<div class="pageWrapper chart">
  <canvas bind:this={chartCanvas} />
</div>

<style lang="scss">
  .chart {
    padding: 1rem;
  }

  .btn.selected {
    background-color: var(--c-button-active, var(--c-button-hover));
    border: 1px solid
      var(--c-button-active-border, var(--c-button-active, var(--c-button-hover-border, var(--c-button-hover))));
  }
</style>
