<script lang="ts">
  import { onMount } from "svelte";
  import Router from "svelte-spa-router";
  import { WyrmErrorDetails } from "types/global";
  import routes from "@core/routes";
  import { currentTheme, platform, settings } from "@stores/settings";
  import Menu from "@components/Menu.svelte";
  import UpdateAvailable from "@components/UpdateAvailable.svelte";
  import Error from "@components/Error.svelte";

  let updateAvailable: string = "";
  let error: WyrmErrorDetails | null = null;

  onMount(() => {
    settings.fetch();
    platform.fetch();

    window.electronAPI.checkVersion();
    const removeUpdateListener = window.electronAPI.updateAvailable((latestVersion: string) => {
      updateAvailable = latestVersion;
    });

    const removeErrorListener = window.electronAPI.error((err: WyrmErrorDetails) => (error = err));

    return () => {
      removeUpdateListener();
      removeErrorListener();
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
  <Error message={error?.message} details={error?.details} open={error !== null} />
</div>

<style lang="scss" global>
  @import "../style/main.scss";
</style>
