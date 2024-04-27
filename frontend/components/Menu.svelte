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

<nav class="nav">
  <ul class="nav__list">
    <li class="nav__item">
      <a class="nav__link nav__link--books" href="#/" class:active={$location === "/"}>
        <Books size="2rem" />
        {#if open}<span class="nav__label">Books</span>{/if}
      </a>
    </li>
    <li class="nav__item">
      <a class="nav__link nav__link--list" href="#/list" class:active={$location === "/list"}>
        <ListDashes size="2rem" />
        {#if open}<span class="nav__label">Book List</span>{/if}
      </a>
    </li>
    <li class="nav__item">
      <a class="nav__link nav__link--trend" href="#/chart" class:active={$location === "/chart"}>
        <ChartLine size="2rem" />
        {#if open}<span class="nav__label">Trend</span>{/if}
      </a>
    </li>
    <li class="nav__item">
      <a class="nav__link nav__link--settings" href="#/settings" class:active={$location === "/settings"}>
        <Gear size="2rem" />
        {#if open}<span class="nav__label">Settings</span>{/if}
      </a>
    </li>
    <li class="nav__item">
      <a class="nav__link nav__link--help" href="#/help" class:active={$location === "/help"}>
        <Info size="2rem" />
        {#if open}<span class="nav__label">Help</span>{/if}
      </a>
    </li>
  </ul>
  <div class="nav__toggle" role="button" on:click={toggleOpen} on:keydown={keyToggleOpen} tabindex="0">
    {#if open}
      <CaretLeft size="1.5rem" />
      <span class="nav__label">Close</span>
    {:else}
      <CaretRight size="1.5rem" />
    {/if}
  </div>
</nav>

<style lang="scss">
  .nav {
    width: var(--tab-width);
    background-color: var(--c-menu);
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: start;
    box-shadow: -2rem 0 1rem 2rem var(--shadow-1);
    z-index: 10;

    &__list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    &__link {
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

      &:hover {
        color: var(--c-menu-hover);
      }

      &.active {
        color: var(--c-menu-active);
        border-color: var(--c-menu-active);
      }
    }

    &__label {
      font-size: 0.9rem;
      padding: 0 0.5rem;
      white-space: nowrap;
    }

    &__toggle {
      margin-top: auto;
      width: var(--tab-width);
      height: var(--tab-height);
      display: flex;
      justify-content: left;
      align-items: center;
      cursor: pointer;
      color: var(--c-text-dark);
      padding: 0 0.5rem;

      &:hover {
        color: var(--c-menu-hover);
      }
    }
  }
</style>
