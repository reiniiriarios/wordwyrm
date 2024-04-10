<script lang="ts">
  import { location } from "svelte-spa-router";
  import Books from "phosphor-svelte/lib/Books";
  import ListDashes from "phosphor-svelte/lib/ListDashes";
  import Gear from "phosphor-svelte/lib/Gear";
  import ChartLine from "phosphor-svelte/lib/ChartLine";
</script>

<nav>
  <ul>
    <li class:active={$location === "/"}>
      <a href="#/"><Books size={32} /></a>
    </li>
    <!--
    <li class:active={$location.startsWith("/book")}>
      <a href="#/book"><BookOpen size={32} /></a>
    </li>
    -->
    <li class:active={$location === "/list"}>
      <a href="#/list"><ListDashes size={32} /></a>
    </li>
    <li class:active={$location === "/chart"}>
      <a href="#/chart"><ChartLine size={32} /></a>
    </li>
    <li class:active={$location === "/settings"}>
      <a href="#/settings"><Gear size={32} /></a>
    </li>
  </ul>
</nav>

<style lang="scss">
  nav {
    width: var(--tab-size);
    background-color: var(--c-menu);
    height: 100vh;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      a {
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--tab-size);
        height: var(--tab-size);
        color: var(--c-text-dark);
        text-decoration: none;

        &:hover {
          color: var(--c-menu-hover);
        }
      }

      &.active a {
        color: var(--c-text);
      }
    }
  }
</style>
