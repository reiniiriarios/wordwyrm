<script lang="ts">
  import Chart from "chart.js/auto";

  import { Book } from "@data/book";
  import { onMount } from "svelte";

  const startDate = new Date(2020, 1, 1);
  const endDate = new Date();

  let allBooks: Book[] = [];

  let years: Record<number, number> = ((): Record<number, number> => {
    let ys: Record<string, number> = {};
    let startYear = startDate.getFullYear();
    let endYear = endDate.getFullYear();
    for (let y = startYear; y <= endYear; y++) ys[y] = 0;
    return ys;
  })();

  const mAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let months: Record<string, { display: string; count: number }> = ((): Record<
    string,
    { display: string; count: number }
  > => {
    let ms: Record<string, { display: string; count: number }> = {};
    let startYear = startDate.getFullYear();
    let endYear = endDate.getFullYear();
    for (let y = startYear; y <= endYear; y++) {
      for (let m = 0; m < 12; m++) {
        ms[y + "-" + m.toString().padStart(2, "0")] = {
          display: mAbbr[m] + " " + y,
          count: 0,
        };
      }
    }
    return ms;
  })();

  let days: Record<string, number> = ((): Record<string, number> => {
    let ds: Record<string, number> = {};
    let currentDate = startDate;
    while (currentDate <= endDate) {
      ds[
        currentDate.getFullYear() +
          "-" +
          currentDate.getMonth().toString().padStart(2, "0") +
          "-" +
          currentDate.getDate().toString().padStart(2, "0")
      ] = 0;
      let newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      currentDate = newDate;
    }
    return ds;
  })();

  function readBooks() {
    window.electronAPI.readAllBooks();
  }

  onMount(() => {
    readBooks();
  });

  let chartCanvas: HTMLCanvasElement;
  let chart: Chart;

  window.electronAPI.receiveAllBooks((books: Book[]) => {
    allBooks = books;
    allBooks.forEach((b) => {
      if (b.dateRead) {
        let t = new Date(b.dateRead);
        let y = t.getFullYear();
        let m = y + "-" + t.getMonth().toString().padStart(2, "0");
        let d = m + "-" + t.getDate().toString().padStart(2, "0");
        years[y]++;
        months[m].count++;
        days[d]++;
      }
    });
    chart = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: Object.values(months).map((m) => m.display),
        datasets: [
          {
            label: "Books Read",
            data: Object.values(months).map((m) => m.count),
            borderWidth: 1,
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

  let view: "year" | "month" | "day" = "month";

  function setView(v: "year" | "month" | "day") {
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
