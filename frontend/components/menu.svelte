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
  @import "../style/variables";

  nav {
    width: $tabSize;
    background-color: $bgColorLight;
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
        width: $tabSize;
        height: $tabSize;
        color: $fgColorDark;
        text-decoration: none;

        &:hover {
          color: $accentColor;
        }
      }

      &.active a {
        color: $fgColor;
      }
    }
  }
</style>
