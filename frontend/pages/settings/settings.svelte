<script lang="ts">
  import { onMount } from "svelte";

  let settings: Record<string, any> = {};

  onMount(() => {
    window.electronAPI.loadSettings();
  });

  window.electronAPI.settingsLoaded((loadedSettings: Record<string, any>) => {
    settings = loadedSettings;
  });

  function selectDataDir(e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    window.electronAPI.selectDataDir();
  }

  window.electronAPI.dirSelected((path: string) => {
    settings.booksDir = path;
  });
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Settings</h2>
  <div class="pageNav__actions"></div>
</div>
<fieldset class="settings">
  <label class="field field--fullwidth">
    Book Data Directory
    <div class="fileSelect">
      <input type="text" readonly on:click={selectDataDir} bind:value={settings.booksDir} />
      <button class="btn btn--light" on:click={selectDataDir}>Select</button>
    </div>
  </label>
</fieldset>

<style lang="scss">
  .settings {
    padding: 0.5rem 1rem;
  }
</style>
