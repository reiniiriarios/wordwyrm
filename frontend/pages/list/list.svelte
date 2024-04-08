<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import CaretUp from "phosphor-svelte/lib/CaretUp";
  import CaretDown from "phosphor-svelte/lib/CaretDown";
  import Searchbar from "@components/searchbar.svelte";
  import FilterCats from "@components/FilterCats.svelte";
  import FilterRead from "@components/FilterRead.svelte";
  import GettingStarted from "@components/gettingstarted.svelte";
  import { catFilters, recentFilters } from "@scripts/sortBooks";
  import { formatDate } from "@scripts/formatDate";
  import { settings } from "@stores/settings";
  import { books } from "@stores/books";

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
    {#if $books.allBooks.length}
      <Searchbar />
    {/if}
  </div>
  <div class="pageNav__actions">
    {#if $books.allBooks.length}
      <FilterCats />
      <FilterRead />
    {/if}
  </div>
</div>

{#if $books.allBooks.length}
  <div class="list">
    <table>
      <thead>
        {#each ["title", "author", "series", "tags", "published", "read", "added"] as h}
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
            <td>{book.series ?? ""}{book.seriesNumber ? " #" + book.seriesNumber : ""}</td>
            <td>
              <div class="tags">
                {#each book.tags as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
            </td>
            <td class="date">{formatDate(book.datePublished)}</td>
            <td class="date">{formatDate(book.dateRead)}</td>
            <td class="date">{formatDate(book.timestampAdded)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <GettingStarted />
{/if}

<style lang="scss">
  .list {
    margin: 1rem 0;
    padding: 0 1rem;
    width: 100%;
    height: calc(100vh - var(--page-nav-height) - 2rem);
    scrollbar-width: thin;
    scrollbar-color: var(--bg-color-lightest) transparent;
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
    background-color: var(--bg-color);
    position: sticky;
    top: 0;
    cursor: pointer;
    color: var(--fg-color-muted);
    vertical-align: bottom;
    white-space: nowrap;

    &:hover {
      color: var(--fg-color);
    }

    &.selected {
      color: var(--fg-color);
    }
  }

  tr {
    cursor: pointer;

    &:nth-child(odd) {
      background-color: var(--bg-color-hint);
    }

    &:hover td {
      background-color: var(--accent-color-transparent);

      .tag {
        background-color: var(--accent-color-transparent);
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
