<script lang="ts">
  import { onMount } from "svelte";
  import { UserSettings } from "types/global";
  import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOut";

  import Select from "@components/Select.svelte";
  import HoverInfo from "@components/HoverInfo.svelte";
  import { settings } from "@stores/settings";
  import { books } from "@stores/books";
  import { formatDate } from "@scripts/formatDate";

  let editSettings: UserSettings = {} as UserSettings;
  let saved: boolean = false;
  let seOpenLibrary: boolean;
  let seGoogleBooks: boolean;
  let updateAvailable: string = "";
  $: seOpenLibrary = $settings.searchEngines?.includes("openLibrary");
  $: seGoogleBooks = $settings.searchEngines?.includes("googleBooks");

  onMount(() => {
    editSettings = structuredClone($settings);

    window.electronAPI.checkVersion();
    const removeUpdateListener = window.electronAPI.updateAvailable((latestVersion: string) => {
      updateAvailable = latestVersion;
    });

    const removeSettingsListener = window.electronAPI.settingsLoaded((loadedSettings: UserSettings) => {
      editSettings = loadedSettings;
      if (!loadedSettings.searchEngines.length) {
        editSettings.searchEngines = ["openLibrary"];
      }
      seOpenLibrary = loadedSettings.searchEngines.includes("openLibrary");
      seGoogleBooks = loadedSettings.searchEngines.includes("googleBooks");
    });

    const removeDirListener = window.electronAPI.dirSelected((path: string) => {
      editSettings.booksDir = path;
    });

    return () => {
      removeSettingsListener();
      removeDirListener();
      removeUpdateListener();
    };
  });

  function toggleSearchEngine(engine: string) {
    if (engine === "googleBooks") {
      if (!editSettings.googleApiKey?.length) {
        return;
      }
      seGoogleBooks = !seGoogleBooks;
    } else if (engine === "openLibrary") {
      seOpenLibrary = !seOpenLibrary;
    }
    if (editSettings.searchEngines.includes(engine)) {
      editSettings.searchEngines = editSettings.searchEngines.filter((e) => e !== engine);
      // Ensure at least one is selected.
      if (!editSettings.searchEngines.length) {
        if (engine === "googleBooks") {
          editSettings.searchEngines.push("openLibrary");
          seOpenLibrary = true;
        } else {
          editSettings.searchEngines.push("googleBooks");
          seGoogleBooks = true;
        }
      }
    } else {
      editSettings.searchEngines.push(engine);
    }
  }

  function selectDataDir(e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    window.electronAPI.selectDataDir();
  }

  function save(e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    if (editSettings.booksDir !== $settings.booksDir) setTimeout(books.fetch, 500);
    settings.save(editSettings);
    saved = true;
    setTimeout(() => (saved = false), 1500);
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Settings</h2>
  <div class="pageNav__actions"></div>
</div>
<fieldset class="settings">
  <label class="field field--fullwidth">
    Book Data Directory <HoverInfo details="Select a directory in a cloud drive to share your data between devices." />
    <div class="fileSelect">
      <input type="text" readonly on:click={selectDataDir} bind:value={editSettings.booksDir} />
      <button class="btn btn--light" on:click={selectDataDir}>Select</button>
    </div>
  </label>

  <div class="field">
    Date Format <HoverInfo details="Based on device locale settings." />
    <div class="selectField">
      <Select
        width="14rem"
        bind:value={editSettings.dateFormat}
        options={{
          "local-long": formatDate(new Date(), "local-long"),
          "local-medium": formatDate(new Date(), "local-medium"),
          "local-short": formatDate(new Date(), "local-short"),
          "yyyy-mm-dd": formatDate(new Date(), "yyyy-mm-dd"),
        }}
      />
    </div>
  </div>

  <label class="field">
    Chart Default Start Year <HoverInfo details="Sets the default start year for the chart page." />
    <input type="text" bind:value={editSettings.chartStartYear} />
  </label>

  <label class="field field--fullwidth">
    Tags for Filtering <HoverInfo details="Tags should be comma-separated." />
    <input type="text" bind:value={editSettings.filterTags} maxlength="255" />
  </label>
  <label class="field field--fullwidth">
    Common Tags for Editing <HoverInfo details="Tags should be comma-separated." />
    <input type="text" bind:value={editSettings.commonTags} maxlength="1024" />
  </label>

  <div class="field field--fullwidth">
    Search Engine <HoverInfo
      details="Engine used to search for book data. Add Google Cloud API Key to use Google Books for data. Google Books data will be supplemented with OpenLibrary data."
    />
    <div class="btnOptions">
      <button class="btn btn--option" class:selected={seOpenLibrary} on:click={() => toggleSearchEngine("openLibrary")}
        >OpenLibrary</button
      >
      <button
        class="btn btn--option"
        class:selected={seGoogleBooks}
        disabled={!editSettings.googleApiKey?.length}
        on:click={() => toggleSearchEngine("googleBooks")}>Google Books</button
      >
    </div>
  </div>

  <label class="field field--fullwidth">
    Google Cloud API Key <HoverInfo details="Optional. Enables searching for book data via Google Books." />
    <input type="text" bind:value={editSettings.googleApiKey} />
  </label>
  <label class="field field--fullwidth">
    Google Custom Search Engine ID <HoverInfo
      details="Optional. Along with API Key, enables searching for cover images via Google Image Search."
    />
    <input type="text" bind:value={editSettings.googleSearchEngineId} />
  </label>
  <div class="actions">
    <button class="btn" on:click={save}>Save</button>
    {#if saved}
      <div>Saved!</div>
    {/if}
  </div>
</fieldset>

<div class="footer">
  {#if $settings.appVersion}
    <div>Version: {$settings.appVersion}</div>
  {/if}
  <div>
    <a class="hideme" href="https://github.com/reiniiriarios/book-tracker" target="_blank">GitHub <ArrowSquareOut /></a>
  </div>
  {#if updateAvailable}
    <div>
      Update Available: <a href="https://github.com/reiniiriarios/book-tracker/releases/latest" target="_blank">
        Download v{updateAvailable}
      </a>
    </div>
  {/if}
</div>

<style lang="scss">
  .settings {
    padding: 0.5rem 1rem;
  }

  .selectField {
    margin-top: 0.2rem;
  }

  .actions {
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 2rem;
    font-size: 1rem;
  }

  .footer {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 1rem;
    font-size: 0.9rem;
    color: var(--c-text-muted);
    display: flex;
    align-items: baseline;
    gap: 0.75rem;

    > div:not(:first-child) {
      &::before {
        content: "·";
        position: relative;
        left: -0.375rem;
        opacity: 0.3;
      }
    }

    a.hideme {
      color: var(--c-text-muted);
    }
  }
</style>
