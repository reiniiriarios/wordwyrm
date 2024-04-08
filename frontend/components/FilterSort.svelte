<script lang="ts">
  import SortAscending from "phosphor-svelte/lib/SortAscending";
  import SortDescending from "phosphor-svelte/lib/SortDescending";
  import { books } from "@stores/books";
  import { settings } from "@stores/settings";
  import { sortFilters } from "@scripts/sortBooks";
</script>

<div class="filter">
  <span>Sort:</span>
  {#each Object.entries(sortFilters) as [i, s]}
    {#if !s.hidden}
      <button on:click={() => books.sort(i)} class:selected={$books.filters.sort === i}>{s.name}</button>
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
