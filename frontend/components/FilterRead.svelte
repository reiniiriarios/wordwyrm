<script lang="ts">
  import { books } from "@stores/books";
  import { recentFilters } from "@scripts/sortBooks";

  function filter(e: MouseEvent | KeyboardEvent) {
    const opt = e.target as HTMLButtonElement;
    const val = opt.dataset.val ?? "";
    books.recentFilter(val);
    opt.blur();
  }
</script>

<div class="filter filter--read">
  <span>Read:</span>
  <div class="dropdownFilter">
    <button class="filter__btn dropdownFilter__selected">
      {recentFilters[$books.filters.recent].name}
    </button>
    <div class="dropdownFilter__dropdown">
      {#each Object.entries(recentFilters) as [i, f]}
        <button
          on:click={filter}
          data-val={i}
          class="filter__btn dropdownFilter__opt"
          class:selected={i === $books.filters.recent}>{f.name}</button
        >
      {/each}
    </div>
  </div>
</div>
