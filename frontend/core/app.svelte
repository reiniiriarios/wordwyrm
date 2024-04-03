<script lang="ts">
  import Router from "svelte-spa-router";
  import routes from "@core/routes";
  import Menu from "@components/menu.svelte";
  import { onMount } from "svelte";
  import { UserSettings } from "types/global";

  onMount(() => {
    window.userSettings = {} as UserSettings;
    window.electronAPI.loadSettings();
  });

  window.electronAPI.settingsLoaded((loadedSettings: UserSettings) => {
    window.userSettings = loadedSettings;
  });
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
