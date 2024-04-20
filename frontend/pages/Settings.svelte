<script lang="ts">
  import { onMount } from "svelte";
  import { UserSettings } from "types/global";
  import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOut";

  import Select from "@components/Select.svelte";
  import HoverInfo from "@components/HoverInfo.svelte";
  import Modal from "@components/Modal.svelte";
  import { currentTheme, platform, settings } from "@stores/settings";
  import { books } from "@stores/books";
  import { formatDate } from "@scripts/formatDate";

  let editSettings: UserSettings = {} as UserSettings;
  let saved: boolean = false;
  let saving: boolean = false;
  let seOpenLibrary: boolean;
  let seGoogleBooks: boolean;
  let updateAvailable: string = "";
  $: seOpenLibrary = $settings.searchEngines?.includes("openLibrary");
  $: seGoogleBooks = $settings.searchEngines?.includes("googleBooks");

  let googleApiFieldsDisabled: boolean = false;
  $: googleApiFieldsDisabled = $settings.imageSearchEngine !== "google";

  let booksDir = {
    changing: false,
    showModal: false,
    oldDir: "",
    newDir: "",
  };

  onMount(() => {
    editSettings = structuredClone($settings);

    // when loading, load the actual current theme
    $currentTheme = editSettings.theme;

    window.electronAPI.checkVersion();
    const removeUpdateListener = window.electronAPI.updateAvailable((latestVersion: string) => {
      updateAvailable = latestVersion;
    });

    const removeSettingsListener = window.electronAPI.settingsLoaded((loadedSettings: UserSettings) => {
      editSettings = loadedSettings;
      if (!loadedSettings.searchEngines?.length) {
        editSettings.searchEngines = ["openLibrary"];
      }
      seOpenLibrary = loadedSettings.searchEngines.includes("openLibrary");
      seGoogleBooks = loadedSettings.searchEngines.includes("googleBooks");
      booksDir.showModal = false;
      setTimeout(() => {
        saving = false;
        saved = true;
      }, 150);
      setTimeout(() => (saved = false), 1500);
    });

    const removeDirListener = window.electronAPI.dirSelected((path: string) => {
      if (path !== editSettings.booksDir) {
        booksDir.changing = true;
      }
      editSettings.booksDir = path;
    });

    return () => {
      removeSettingsListener();
      removeDirListener();
      removeUpdateListener();
      // when unloading, set the theme to the currently saved theme
      $currentTheme = $settings.theme;
    };
  });

  function previewTheme() {
    $currentTheme = editSettings.theme;
  }

  function toggleSearchEngine(engine: string) {
    if (engine === "googleBooks") {
      seGoogleBooks = !seGoogleBooks;
    } else if (engine === "openLibrary") {
      seOpenLibrary = !seOpenLibrary;
    }
    if (editSettings.searchEngines.includes(engine)) {
      editSettings.searchEngines = editSettings.searchEngines.filter((e) => e !== engine);
      // Ensure at least one is selected.
      if (!editSettings.searchEngines?.length) {
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

  function imageSearchEngineChanged() {
    googleApiFieldsDisabled = editSettings.imageSearchEngine !== "google";
  }

  function selectDataDir(e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    window.electronAPI.selectDataDir();
  }

  function moveBooksDir() {
    save(undefined, true);
  }

  function newBooksDir() {
    save();
  }

  function openBooksDir() {
    window.electronAPI.openBooksDir();
  }

  function save(e?: MouseEvent | KeyboardEvent, moveData: boolean = false) {
    // If the books dir has changed, show the modal, turn the flag off, and don't save yet.
    if (booksDir.changing) {
      booksDir.showModal = true;
      booksDir.changing = false;
      return;
    }

    e?.preventDefault();
    if (editSettings.booksDir !== $settings.booksDir) setTimeout(books.fetch, 500);
    settings.save(editSettings, moveData);
    saving = true;
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Settings</h2>
  <div class="pageNav__actions"></div>
</div>
<div class="pageWrapper settingsPage">
  <fieldset class="settings">
    <label class="field field--fullwidth">
      <div class="dataDir">
        <div class="dataDir__input">
          Book Data Directory <HoverInfo
            details="Select a directory in a cloud drive to share your data between devices."
          />
          <div class="fileSelect">
            <input type="text" readonly on:click={selectDataDir} bind:value={editSettings.booksDir} />
            <button class="btn btn--light" on:click={selectDataDir}>Select</button>
          </div>
        </div>
        <div class="dataDir__open">
          <button class="btn" on:click={openBooksDir}>Open in {$platform.fileBrowser}</button>
        </div>
      </div>
    </label>

    <div class="field">
      App Theme
      <div class="selectField">
        <Select
          width="14rem"
          bind:value={editSettings.theme}
          options={{
            default: "Default",
            harrow: "Harrow",
            gideon: "Gideon",
            nona: "Nona",
            slate: "Slate",
            rosepine: "Rosé Pine",
            rosepineDawn: "Rosé Pine Dawn",
            nord: "Nord",
            nordLight: "Nord Bright",
          }}
          on:change={previewTheme}
        />
      </div>
    </div>

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

    <label class="field field--fullwidth">
      Tags for Filtering <HoverInfo details="Tags should be comma-separated." />
      <input type="text" bind:value={editSettings.filterTags} maxlength="255" />
    </label>
    <label class="field field--fullwidth">
      Common Tags for Editing <HoverInfo details="Tags should be comma-separated." />
      <input type="text" bind:value={editSettings.commonTags} maxlength="1024" />
    </label>

    <label class="field">
      Chart Default Start Year <HoverInfo details="Sets the default start year for the chart page." />
      <input type="text" bind:value={editSettings.chartStartYear} />
    </label>

    <div class="field"></div>

    <div class="field">
      Book Search Engines <HoverInfo
        details="If both are selected, Google Books data will be supplemented with OpenLibrary data."
      />
      <div class="btnOptions">
        <button
          class="btn btn--option"
          class:selected={seOpenLibrary}
          on:click={() => toggleSearchEngine("openLibrary")}>OpenLibrary</button
        >
        <button
          class="btn btn--option"
          class:selected={seGoogleBooks}
          on:click={() => toggleSearchEngine("googleBooks")}>Google Books</button
        >
      </div>
    </div>

    <div class="field">
      Image Search Engine
      <div class="selectField">
        <Select
          width="14rem"
          bind:value={editSettings.imageSearchEngine}
          on:change={imageSearchEngineChanged}
          options={{
            google: "Google",
            duckduckgo: "DuckDuckGo",
            bing: "Bing",
            ecosia: "Ecosia",
          }}
        />
      </div>
    </div>

    <label class="field" class:disabled={googleApiFieldsDisabled}>
      Google Cloud API Key <HoverInfo
        details="Optional. Along with Engine ID, enables Google Image Search in-app."
        position="top"
      />
      <input type="text" bind:value={editSettings.googleApiKey} disabled={googleApiFieldsDisabled} />
    </label>
    <label class="field field">
      Google Custom Search Engine ID <HoverInfo
        details="Optional. Along with API Key, enables Google Image Search in-app."
        position="top"
      />
      <input type="text" bind:value={editSettings.googleSearchEngineId} disabled={googleApiFieldsDisabled} />
    </label>
    <div class="actions">
      <button class="btn" on:click={save}>Save</button>
      {#if saving}
        <div>Saving...</div>
      {:else if saved}
        <div>Saved!</div>
      {/if}
    </div>
  </fieldset>

  <div class="footer">
    {#if $settings.appVersion}
      <div>Version: {$settings.appVersion}</div>
    {/if}
    <div>
      <a class="hideme" href="https://github.com/reiniiriarios/wordwyrm" target="_blank">GitHub <ArrowSquareOut /></a>
    </div>
    {#if updateAvailable}
      <div>
        Update Available: <a href="https://github.com/reiniiriarios/wordwyrm/releases/latest" target="_blank">
          Download v{updateAvailable}
        </a>
      </div>
    {/if}
  </div>
</div>

<Modal
  heading="Move Data"
  bind:open={booksDir.showModal}
  loading={saving}
  on:confirm={moveBooksDir}
  on:cancel={newBooksDir}
  confirmWord="Migrate Data"
  cancelWord="No"
  height="16rem"
>
  <div class="dirMsg">
    Would you like to migrate your existing data from
    <div class="dirMsg__dir"><strong>{$settings.booksDir}</strong> to</div>
    <div class="dirMsg__dir"><strong>{editSettings.booksDir}</strong> ?</div>
  </div>
</Modal>

<style lang="scss">
  .settingsPage {
    --footer-height: 3rem;

    .selectField {
      margin-top: 0.2rem;
    }

    .dataDir {
      display: flex;
      gap: 1rem;
      align-items: end;

      &__input {
        width: 100%;
      }

      &__open {
        margin-left: auto;
        white-space: nowrap;
        flex-basis: min-content;
      }
    }

    .actions {
      display: flex;
      justify-content: left;
      align-items: center;
      gap: 2rem;
      font-size: 1rem;
    }

    .footer {
      height: var(--footer-height);
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
  }

  .dirMsg {
    &__dir {
      padding: 1rem 1rem 0;
    }
  }
</style>
