<script lang="ts">
  import SortAscending from "phosphor-svelte/lib/SortAscending";
  import SortDescending from "phosphor-svelte/lib/SortDescending";
  import { books } from "@stores/books";
  import { sortFilters } from "@scripts/sortBooks";

  function filter(e: MouseEvent | KeyboardEvent) {
    let opt = e.target as HTMLButtonElement;
    let val = opt.dataset.val ?? "";
    books.sort(val);
    // enable following if switching to dropdown
    // opt.blur();
  }
</script>

<div class="filter">
  <span>Sort:</span>
  {#each Object.entries(sortFilters) as [i, s]}
    {#if !s.hidden}
      <button on:click={filter} data-val={i} class:selected={$books.filters.sort === i}>{s.name}</button>
    {/if}
  {/each}
  <button class="sortDirection" on:click={books.sortReverse}>
    {#if $books.filters.reverse}
      <SortDescending size={22} />
    {:else}
      <SortAscending size={22} />
    {/if}
  </button>
</div>
