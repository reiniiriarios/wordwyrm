<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import CaretUp from "phosphor-svelte/lib/CaretUp";
  import CaretDown from "phosphor-svelte/lib/CaretDown";
  import { catFilters, recentFilters } from "@scripts/sortBooks";
  import { settings } from "@stores/settings";
  import { books } from "@stores/books";
  import Searchbar from "@components/searchbar.svelte";

  let filterTags: string[] = [];
  $: filterTags = $settings.filterTags?.split(",").map((t) => t.trim());

  onMount(() => {
    console.log("mounted");
    if (!$books.allBooks.length) {
      console.log("sending for books");
      books.fetch();
    }
  });

  function sortFilter(s: string) {
    if (s === $books.filters.sort) {
      $books.filters.reverse = !$books.filters.reverse;
    } else {
      $books.filters.reverse = false;
    }
    books.sort(s);
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">List</h2>
  <div class="pageNav__search">
    <Searchbar />
  </div>
  <div class="pageNav__actions">
    <div class="filter">
      <span>Filter:</span>
      <div class="customFilter">
        <button class="customFilter__selected">
          {#if filterTags && $books.filters.tag}
            {$books.filters.tag}
          {:else}
            {catFilters[$books.filters.filter].name}
          {/if}
        </button>
        <div class="customFilter__dropdown">
          {#each Object.entries(catFilters) as [i, f]}
            <button
              on:click={() => books.catFilter(i)}
              class="customFilter__opt"
              class:selected={$books.filters.filter === i}>{f.name}</button
            >
          {/each}
          {#if filterTags}
            {#each filterTags as tag}
              <button
                on:click={() => books.tagFilter(tag)}
                class="customFilter__opt"
                class:selected={$books.filters.tag === tag}>{tag}</button
              >
            {/each}
          {/if}
        </div>
      </div>
    </div>
    <div class="filter">
      <span>Read:</span>
      <div class="recentFilter">
        <button class="recentFilter__selected">
          {recentFilters[$books.filters.recent].name}
        </button>
        <div class="recentFilter__dropdown">
          {#each Object.entries(recentFilters) as [i, f]}
            <button
              on:click={() => books.recentFilter(i)}
              class="recentFilter__opt"
              class:selected={i === $books.filters.recent}>{f.name}</button
            >
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<div class="list">
  <table>
    <thead>
      {#each ["title", "author", "series", "tags", "published", "read"] as h}
        <th on:click={() => sortFilter(h)} class:selected={$books.filters.sort === h}
          >{h.charAt(0).toUpperCase()}{h.slice(1)}
          {#if $books.filters.sort === h}
            {#if $books.filters.reverse}
              <CaretDown size={12} />
            {:else}
              <CaretUp size={12} />
            {/if}
          {/if}
        </th>
      {/each}
    </thead>
    <tbody>
      {#each $books.sortedBooks as book}
        <tr on:click={() => push(`#/book/${book.cache.filepath}`)}>
          <td>{book.title}</td>
          <td>{book.authors.map((a) => a.name).join(", ")}</td>
          <td>{book.series ?? ""}</td>
          <td>
            <div class="tags">
              {#each book.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          </td>
          <td class="date">
            {#if book.datePublished?.match(/^\-\d+$/)}
              {Math.abs(+book.datePublished)} BCE
            {:else}
              {book.datePublished ?? ""}
            {/if}
          </td>
          <td class="date">{book.dateRead ?? ""}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="scss">
  @import "../../style/variables";

  .list {
    margin: 1rem 0;
    padding: 0 1rem;
    width: 100%;
    height: calc(100vh - $pageNavHeight - 2rem);
    scrollbar-width: thin;
    scrollbar-color: $bgColorLightest transparent;
    overflow: auto;
  }

  table {
    width: 100%;
    border-spacing: 0;
  }

  th,
  td {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }

  th {
    text-align: left;
    background-color: $bgColor;
    position: sticky;
    top: 0;
    cursor: pointer;
    color: $fgColorMuted;
    vertical-align: bottom;
    white-space: nowrap;

    &:hover {
      color: $fgColor;
    }

    &.selected {
      color: $fgColor;
    }
  }

  tr {
    cursor: pointer;

    &:nth-child(odd) {
      background-color: lighten($bgColor, 2%);
    }

    &:hover td {
      background-color: rgba($accentColor, 10%);

      .tag {
        background-color: rgba($accentColor, 10%);
      }
    }
  }

  .date {
    white-space: nowrap;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    justify-content: left;
  }
</style>
