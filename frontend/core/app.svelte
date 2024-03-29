<script lang="ts">
  import Router from "svelte-spa-router";
  import routes from "@core/routes";
  import Menu from "@components/menu.svelte";
</script>

<div class="container">
  <Menu />
  <div class="main">
    <Router {routes} />
  </div>
</div>

<style lang="scss" global>
  @import "../style/main.scss";
</style>
