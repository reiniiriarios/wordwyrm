<script lang="ts">
  import { onMount } from "svelte";
  import { UserSettings } from "types/global";

  let settings: UserSettings = {} as UserSettings;
  let saved: boolean = false;

  onMount(() => {
    settings = window.userSettings;
    if (!settings.chartStartYear) {
      settings.chartStartYear = 2020;
    }

    const removeSettingsListener = window.electronAPI.settingsLoaded((loadedSettings: UserSettings) => {
      settings = loadedSettings;
      window.userSettings = loadedSettings;
      saved = true;
      setTimeout(() => (saved = false), 1500);
    });

    const removeDirListener = window.electronAPI.dirSelected((path: string) => {
      settings.booksDir = path;
      window.userSettings.booksDir = path;
    });

    return () => {
      removeSettingsListener();
      removeDirListener();
    };
  });

  function selectDataDir(e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    window.electronAPI.selectDataDir();
  }

  function save(e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    window.electronAPI.saveSettings(settings);
  }
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
  <label class="field field--fullwidth">
    Chart Default Start Year
    <input type="text" bind:value={settings.chartStartYear} />
  </label>
  <label class="field field--fullwidth">
    Tags for Filtering (comma-separated)
    <input type="text" bind:value={settings.filterTags} maxlength="60" />
  </label>
  <label class="field field--fullwidth">
    Common Tags for Editing (comma-separated)
    <input type="text" bind:value={settings.commonTags} maxlength="255" />
  </label>
  <label class="field field--fullwidth">
    Google Cloud API Key
    <input type="text" bind:value={settings.googleApiKey} />
  </label>
  <label class="field field--fullwidth">
    Google Custom Search Engine ID
    <input type="text" bind:value={settings.googleSearchEngineId} />
  </label>
  <div class="actions">
    <button class="btn" on:click={save}>Save</button>
    {#if saved}
      <div>Saved!</div>
    {/if}
  </div>
</fieldset>

<style lang="scss">
  .settings {
    padding: 0.5rem 1rem;
  }

  .actions {
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 2rem;
    font-size: 1rem;
  }
</style>
