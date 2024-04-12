<script lang="ts">
  import Router from "svelte-spa-router";
  import routes from "@core/routes";
  import Menu from "@components/Menu.svelte";
  import UpdateAvailable from "@components/UpdateAvailable.svelte";
  import { onMount } from "svelte";
  import { currentTheme, platform, settings } from "@stores/settings";

  let updateAvailable: string = "";

  onMount(() => {
    settings.fetch();
    platform.fetch();

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

<div id="appContainer" data-theme={$currentTheme}>
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
