<script lang="ts">
  import SortAscending from "phosphor-svelte/lib/SortAscending";
  import SortDescending from "phosphor-svelte/lib/SortDescending";
  import { books } from "@stores/books";
  import { sortFilters } from "@scripts/sortBooks";

  function filter(e: MouseEvent | KeyboardEvent) {
    const opt = e.target as HTMLButtonElement;
    const val = opt.dataset.val ?? "";
    books.sort(val);
    // enable following if switching to dropdown
    // opt.blur();
  }
</script>

<div class="filter filter--sort">
  <span class="filter__label">Sort:</span>
  {#each Object.entries(sortFilters) as [i, s]}
    {#if !s.hidden}
      <button class="filter__btn" on:click={filter} data-val={i} class:selected={$books.filters.sort === i}
        >{s.name}</button
      >
    {/if}
  {/each}
  <button class="filter__direction" on:click={books.sortReverse}>
    {#if $books.filters.reverse}
      <SortDescending size={22} />
    {:else}
      <SortAscending size={22} />
    {/if}
  </button>
</div>
