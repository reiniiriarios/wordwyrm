<script lang="ts">
  import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOut";
  import { platform, version } from "@stores/settings";
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Help</h2>
</div>

<div class="pageWrapper help">
  <dl>
    <dt>Managing Data</dt>
    <dd>
      <p>
        Data is stored in YAML files and JPGs, sorted into author directories. You can change where your data is stored
        in Settings. <a href="https://en.wikipedia.org/wiki/YAML" target="_blank">YAML</a> files are easily editable in any
        plain text editor.
      </p>
      <p>
        To share your data across devices, you can choose a directory in a cloud drive, such as OneDrive, Google Drive,
        or Dropbox.
      </p>
      <p>
        <button class="btn" on:click={window.electronAPI.openBooksDir}>
          Open Data in {$platform.fileBrowser}
        </button>
        &nbsp;
        <button class="btn" on:click={window.electronAPI.openSettingsDir}>
          Open Settings in {$platform.fileBrowser}
        </button>
      </p>
    </dd>
    <dt>API Keys</dt>
    <dd>
      <p>
        You can add a <a href="https://cloud.google.com/" target="_blank">Google Cloud</a> API Key and
        <a
          href="https://developers.google.com/custom-search/v1/introduction#create_programmable_search_engine"
          target="_blank">Google Programmable Search Engine ID</a
        > to enable Google Image Search for book covers.
      </p>
      <p>
        As Google Cloud has a cost (albeit a small one per user), this functionality is not enabled by default in order
        to keep the app free.
      </p>
    </dd>
    <dt>Reporting Bugs</dt>
    <dd>
      <p>
        If you encounter a bug or need help, you can <a
          href="https://github.com/reiniiriarios/wordwyrm/issues"
          target="_blank">post an issue</a
        >.
      </p>
      <p>
        <button class="btn" on:click={window.electronAPI.openLogsDir}>Open Logs in {$platform.fileBrowser}</button>
      </p>
    </dd>
  </dl>
</div>

<div class="footer">
  {#if $version.current}
    <div>Version: {$version.current}</div>
  {/if}
  <div>
    <a class="hideme" href="https://github.com/reiniiriarios/wordwyrm" target="_blank">GitHub <ArrowSquareOut /></a>
  </div>
</div>

<style lang="scss">
  .help {
    --footer-height: 3rem;
  }

  dl {
    padding: 1rem 3rem;
    max-width: 55rem;
    margin: 0 auto;
  }

  dt {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 2rem 0 1rem 0;
  }

  dd {
    font-size: 1rem;
    margin: 1rem 0;

    p {
      margin: 0.75rem 0;
    }
  }

  .footer {
    height: 3rem;
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
