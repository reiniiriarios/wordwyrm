<script lang="ts">
  import Router from "svelte-spa-router";
  import routes from "@core/routes";
  import Menu from "@components/menu.svelte";
  import UpdateAvailable from "@components/updateavailable.svelte";
  import { onMount } from "svelte";
  import { AppState, UserSettings } from "types/global";

  let updateAvailable: string = "";

  onMount(() => {
    window.userSettings = {} as UserSettings;
    window.electronAPI.loadSettings();
    window.appState = {
      books: {},
    } as AppState;

    const removeSettingsListener = window.electronAPI.settingsLoaded((loadedSettings: UserSettings) => {
      window.userSettings = loadedSettings;
    });

    const removeUpdateListener = window.electronAPI.updateAvailable((latestVersion: string) => {
      updateAvailable = latestVersion;
    });

    return () => {
      removeSettingsListener();
      removeUpdateListener();
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
