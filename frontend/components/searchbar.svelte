<script lang="ts">
  import { books } from "@stores/books";
  import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";
  import X from "phosphor-svelte/lib/X";

  function search(e: KeyboardEvent) {
    if (["\n", "Enter"].includes(e.key)) {
      // currentSearch is bound
      books.search();
    }
  }
</script>

<div class="search">
  <span class="glass">
    <MagnifyingGlass size="1rem" />
  </span>
  <input type="text" bind:value={$books.filters.search} on:keydown={search} on:change={books.search} />
  {#if $books.filters.search.length}
    <div class="x" role="button" tabindex="0" on:click={books.clearSearch} on:keypress={books.clearSearch}>
      <X size="1rem" />
    </div>
  {/if}
</div>

<style lang="scss">
  @import "../style/variables";

  .search {
    position: relative;

    .glass,
    .x {
      position: absolute;
      top: 0.4rem;
    }

    .glass {
      left: 0.5rem;
    }

    .x {
      cursor: pointer;

      right: 0.5rem;
      color: $fgColorDark;

      &:hover {
        color: $fgColorMuted;
      }
    }

    input[type="text"] {
      border-radius: 1rem;
      padding-left: 1.75rem;
      padding-right: 1.75rem;
    }
  }
</style>
