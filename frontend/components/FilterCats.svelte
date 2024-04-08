<script lang="ts">
  import { books } from "@stores/books";
  import { settings } from "@stores/settings";
  import { catFilters } from "@scripts/sortBooks";

  let filterTags: string[] = [];
  $: filterTags = $settings.filterTags?.split(",").map((t) => t.trim());
</script>

<div class="filter">
  <span>Filter:</span>
  <div class="dropdownFilter">
    <button class="dropdownFilter__selected">
      {#if filterTags && $books.filters.tag}
        {$books.filters.tag}
      {:else}
        {catFilters[$books.filters.filter].name}
      {/if}
    </button>
    <div class="dropdownFilter__dropdown">
      {#each Object.entries(catFilters) as [i, f]}
        <button
          on:click={() => books.catFilter(i)}
          class="dropdownFilter__opt"
          class:selected={$books.filters.filter === i}>{f.name}</button
        >
      {/each}
      {#if filterTags}
        {#each filterTags as tag}
          <button
            on:click={() => books.tagFilter(tag)}
            class="dropdownFilter__opt"
            class:selected={$books.filters.tag === tag}>{tag}</button
          >
        {/each}
      {/if}
    </div>
  </div>
</div>
