<script lang="ts">
  import { Book } from "@data/book";
  import { onMount } from "svelte";

  let allBooks: Book[] = [];
  let years: Record<number, number> = {};
  let months: Record<number, Record<number, number>> = {};
  let days: Record<number, Record<number, Record<number, number>>> = {};

  function readBooks() {
    window.electronAPI.readAllBooks();
  }

  onMount(() => {
    readBooks();
  });

  window.electronAPI.receiveAllBooks((books: Book[]) => {
    allBooks = books;
    allBooks.forEach((b) => {
      if (b.dateRead) {
        let r = new Date(b.dateRead);
        let y = r.getFullYear();
        let m = r.getMonth();
        let d = r.getDate();
        if (!years[y]) years[y] = 0;
        years[y]++;
        if (!months[y]) months[y] = {};
        if (!months[y][m]) months[y][m] = 0;
        months[y][m]++;
        if (!days[y]) days[y] = {};
        if (!days[y][m]) days[y][m] = {};
        if (!days[y][m][d]) days[y][m][d] = 0;
        days[y][m][d]++;
      }
    });
  });
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Trend</h2>
</div>
<div class="chart"></div>
