<script lang="ts">
  import { books } from "@stores/books";
  import { recentFilters } from "@scripts/sortBooks";
</script>

<div class="filter">
  <span>Read:</span>
  <div class="dropdownFilter">
    <button class="dropdownFilter__selected">
      {recentFilters[$books.filters.recent].name}
    </button>
    <div class="dropdownFilter__dropdown">
      {#each Object.entries(recentFilters) as [i, f]}
        <button
          on:click={() => books.recentFilter(i)}
          class="dropdownFilter__opt"
          class:selected={i === $books.filters.recent}>{f.name}</button
        >
      {/each}
    </div>
  </div>
</div>
