<script lang="ts">
  import { location } from "svelte-spa-router";
  import Books from "phosphor-svelte/lib/Books";
  import ListDashes from "phosphor-svelte/lib/ListDashes";
  import ChartLine from "phosphor-svelte/lib/ChartLine";
  import Gear from "phosphor-svelte/lib/Gear";
  import Info from "phosphor-svelte/lib/Info";
  import CaretRight from "phosphor-svelte/lib/CaretRight";
  import CaretLeft from "phosphor-svelte/lib/CaretLeft";
  import { onMount } from "svelte";

  let open: boolean = false;
  let sizeOpen: string = "7.5rem";
  let sizeClosed: string = "2.5rem";

  onMount(() => {
    sizeOpen = getComputedStyle(document.documentElement).getPropertyValue("--tab-width-open");
    sizeClosed = getComputedStyle(document.documentElement).getPropertyValue("--tab-width");
  });

  function toggleOpen() {
    open = !open;
    document.documentElement.style.setProperty("--tab-width", open ? sizeOpen : sizeClosed);
  }

  function keyToggleOpen(e: KeyboardEvent) {
    if (["\n", "Enter"].includes(e.key)) {
      toggleOpen();
    }
  }
</script>

<nav>
  <ul>
    <li class:active={$location === "/"}>
      <a href="#/">
        <Books size="2rem" />
        {#if open}<span>Books</span>{/if}
      </a>
    </li>
    <li class:active={$location === "/list"}>
      <a href="#/list">
        <ListDashes size="2rem" />
        {#if open}<span>Book List</span>{/if}
      </a>
    </li>
    <li class:active={$location === "/chart"}>
      <a href="#/chart">
        <ChartLine size="2rem" />
        {#if open}<span>Trend</span>{/if}
      </a>
    </li>
    <li class:active={$location === "/settings"}>
      <a href="#/settings">
        <Gear size="2rem" />
        {#if open}<span>Settings</span>{/if}
      </a>
    </li>
    <li class:active={$location === "/help"}>
      <a href="#/help">
        <Info size="2rem" />
        {#if open}<span>Help</span>{/if}
      </a>
    </li>
  </ul>
  <div class="toggle" role="button" on:click={toggleOpen} on:keydown={keyToggleOpen} tabindex="0">
    {#if open}
      <CaretLeft size="1.5rem" />
      <span>Close</span>
    {:else}
      <CaretRight size="1.5rem" />
    {/if}
  </div>
</nav>

<style lang="scss">
  nav {
    width: var(--tab-width);
    background-color: var(--c-menu);
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: start;
    box-shadow: -2rem 0 1rem 2rem rgba(0, 0, 0, 0.25);
    z-index: 10;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      a {
        display: flex;
        justify-content: left;
        padding: 0 0.25rem 0 0.235rem;
        align-items: center;
        width: var(--tab-width);
        height: var(--tab-height);
        color: var(--c-text-dark);
        text-decoration: none;
        white-space: nowrap;
        border-left: 0.15rem solid transparent;

        span {
          font-size: 0.9rem;
          padding: 0 0.5rem;
          white-space: nowrap;
        }

        &:hover {
          color: var(--c-menu-hover);
        }
      }

      &.active a {
        color: var(--c-text);
        border-color: var(--c-text-muted);
      }
    }
  }

  .toggle {
    margin-top: auto;
    width: var(--tab-width);
    height: var(--tab-height);
    display: flex;
    justify-content: left;
    align-items: center;
    cursor: pointer;
    color: var(--c-text-dark);
    padding: 0 0.5rem;

    span {
      font-size: 0.9rem;
      padding: 0 0.5rem;
      white-space: nowrap;
    }

    &:hover {
      color: var(--c-menu-hover);
    }
  }
</style>
