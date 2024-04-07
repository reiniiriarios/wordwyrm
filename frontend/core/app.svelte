<script lang="ts">
  import Router from "svelte-spa-router";
  import routes from "@core/routes";
  import Menu from "@components/menu.svelte";
  import UpdateAvailable from "@components/updateavailable.svelte";
  import { onMount } from "svelte";
  import { settings } from "@stores/settings";

  let updateAvailable: string = "";

  onMount(() => {
    settings.fetch();

    window.electronAPI.checkVersion();
    const removeUpdateListener = window.electronAPI.updateAvailable((latestVersion: string) => {
      updateAvailable = latestVersion;
    });

    return () => {
      removeUpdateListener();
      settings.destroy();
    };
  });
</script>

<div class="container">
  <Menu />
  <div class="main">
    <Router {routes} />
  </div>
  {#if updateAvailable}
    <UpdateAvailable latestVersion={updateAvailable} />
  {/if}
</div>

<style lang="scss" global>
  @import "../style/main.scss";
</style>
