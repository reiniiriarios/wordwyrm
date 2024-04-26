<script lang="ts">
  import { books } from "@stores/books";
  import { settings } from "@stores/settings";
  import { catFilters } from "@scripts/sortBooks";

  let filterTags: string[] = [];
  $: filterTags = $settings.filterTags?.split(",").map((t) => t.trim());

  let currentFilter: string = "";
  let filtered: boolean = false;
  $: currentFilter =
    filterTags && $books.filters.tag ? $books.filters.tag : catFilters?.[$books.filters.filter]?.name ?? "";
  $: filtered = currentFilter !== catFilters[Object.keys(catFilters)[0]]?.name;

  function filter(e: MouseEvent | KeyboardEvent) {
    const opt = e.target as HTMLButtonElement;
    const val = opt.dataset.val ?? "";
    const type = opt.dataset.type ?? "";
    if (type === "cat") {
      books.catFilter(val);
    } else {
      books.tagFilter(val);
    }
    opt.blur();
  }
</script>

<div class="filter filter--cats">
  <span>Filter:</span>
  <div class="dropdownFilter">
    <button class="dropdownFilter__selected" class:filtered>
      {currentFilter}
    </button>
    <div class="dropdownFilter__dropdown">
      {#each Object.entries(catFilters) as [i, f]}
        <button
          on:click={filter}
          data-val={i}
          data-type="cat"
          class="dropdownFilter__opt"
          class:selected={$books.filters.filter === i}>{f.name}</button
        >
      {/each}
      {#if filterTags}
        {#each filterTags as tag}
          <button
            on:click={filter}
            data-val={tag}
            data-type="tag"
            class="dropdownFilter__opt"
            class:selected={$books.filters.tag === tag}>{tag}</button
          >
        {/each}
      {/if}
    </div>
  </div>
</div>
