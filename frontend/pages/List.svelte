<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import CaretUp from "phosphor-svelte/lib/CaretUp";
  import CaretDown from "phosphor-svelte/lib/CaretDown";

  import SearchBar from "@components/SearchBar.svelte";
  import FilterCats from "@components/FilterCats.svelte";
  import FilterRead from "@components/FilterRead.svelte";
  import GettingStarted from "@components/GettingStarted.svelte";
  import { settings } from "@stores/settings";
  import { books } from "@stores/books";
  import { formatDate } from "@scripts/formatDate";

  let filterTags: string[] = [];
  $: filterTags = $settings.filterTags?.split(",").map((t) => t.trim());

  onMount(() => {
    if (!$books.allBooks.length) {
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
      <SearchBar />
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
        <tr>
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
        </tr>
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
    height: calc(100vh - var(--page-nav-height) - 2rem);
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--c-subtle) transparent;
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
    background-color: var(--c-base);
    position: sticky;
    top: 0;
    cursor: pointer;
    color: var(--c-text-muted);
    vertical-align: bottom;
    white-space: nowrap;

    &:hover {
      color: var(--c-text);
    }

    &.selected {
      color: var(--c-text);
    }
  }

  tr {
    cursor: pointer;

    th:first-child,
    td:first-child {
      padding-left: 2rem;
    }

    th:last-child,
    td:last-child {
      padding-right: 2rem;
    }

    &:nth-child(odd) {
      background-color: var(--c-surface);
    }

    &:hover td {
      background-color: var(--c-table-hover);

      .tag {
        background-color: var(--c-table-hover);
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
