<script lang="ts">
  import { onMount } from "svelte";
  import Router from "svelte-spa-router";
  import { WyrmErrorDetails } from "types/global";
  import routes from "@core/routes";
  import { currentTheme, settings, version } from "@stores/settings";
  import Menu from "@components/Menu.svelte";
  import UpdateAvailable from "@components/UpdateAvailable.svelte";
  import Error from "@components/Error.svelte";

  let error: WyrmErrorDetails | null = null;

  onMount(() => {
    settings.fetch();

    const removeErrorListener = window.electronAPI.error((err: WyrmErrorDetails) => (error = err));

    return () => {
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
  {#if $version.updateAvailable}
    <UpdateAvailable latestVersion={$version.latestVersion} />
  {/if}
  <Error message={error?.message} details={error?.details} open={error !== null} />
</div>

<style lang="scss" global>
  @import "../style/main";
</style>
