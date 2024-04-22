<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import CaretUp from "phosphor-svelte/lib/CaretUp";
  import CaretDown from "phosphor-svelte/lib/CaretDown";

  import SearchBar from "@components/SearchBar.svelte";
  import FilterCats from "@components/FilterCats.svelte";
  import FilterRead from "@components/FilterRead.svelte";
  import GettingStarted from "@components/GettingStarted.svelte";
  import { books } from "@stores/books";
  import { formatDate } from "@scripts/formatDate";
  import ScrollTable from "@components/ScrollTable.svelte";

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
  <div class="listContainer">
    <ScrollTable>
      <svelte:fragment slot="thead">
        {#each ["title", "author", "series", "tags", "published", "read", "added"] as h}
          <th on:click={() => sortFilter(h)} class:selected={$books.filters.sort === h} class={`col--${h}`}
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
      </svelte:fragment>
      <svelte:fragment slot="tbody">
        {#each $books.sortedBooks as book}
          <tr on:click={() => push(`#/book/${book.cache.filepath}`)}>
            <td class="col--title">{book.title}</td>
            <td class="col--author">{book.authors.map((a) => a.name).join(", ")}</td>
            <td class="col--series">{book.series ?? ""}{book.seriesNumber ? ` #${book.seriesNumber}` : ""}</td>
            <td class="col--tags">
              <div class="tags">
                {#each book.tags as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
            </td>
            <td class="col--published date">{formatDate(book.datePublished)}</td>
            <td class="col--read date">{formatDate(book.dateRead)}</td>
            <td class="col--added date">{formatDate(book.timestampAdded)}</td>
          </tr>
        {/each}
      </svelte:fragment>
    </ScrollTable>
  </div>
{:else}
  <GettingStarted />
{/if}

<style lang="scss">
  .listContainer {
    height: calc(100vh - var(--page-nav-height));
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

  @media (width <= 1400px) {
    .col--tags {
      display: none;
    }
  }
</style>
