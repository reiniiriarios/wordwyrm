<script lang="ts">
  import Router from "svelte-spa-router";
  import routes from "@core/routes";
  import Menu from "@components/menu.svelte";
  import UpdateAvailable from "@components/updateavailable.svelte";
  import { onMount } from "svelte";
  import { UserSettings } from "types/global";

  let updateAvailable: string = "";

  onMount(() => {
    window.userSettings = {} as UserSettings;
    window.electronAPI.loadSettings();
  });

  window.electronAPI.settingsLoaded((loadedSettings: UserSettings) => {
    window.userSettings = loadedSettings;
  });

  window.electronAPI.updateAvailable((latestVersion: string) => {
    updateAvailable = latestVersion;
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
