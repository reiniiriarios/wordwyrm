<script lang="ts">
  import { location } from "svelte-spa-router";
</script>

<nav>
  <ul>
    <li class:active={$location === "/"}>
      <a href="#/">H</a>
    </li>
    <li class:active={$location === "/current"}>
      <a href="#/current">C</a>
    </li>
    <li class:active={$location === "/list"}>
      <a href="#/list">L</a>
    </li>
    <li class:active={$location === "/settings"}>
      <a href="#/settings">S</a>
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
