<div class="pageNav">
  <h2 class="pageNav__header">Help</h2>
</div>

<div class="help">
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
    </dd>
    <dt>API Keys</dt>
    <dd>
      <p>
        By default, search uses the <a href="https://openlibrary.org/" target="_blank">OpenLibrary</a> API. If you add
        an
        <a href="https://developers.google.com/books/docs/v1/using#APIKey" target="_blank">API key for Google Books</a>
        via
        <a href="https://cloud.google.com/" target="_blank">Google Cloud</a>, you can use both to search.
      </p>
      <p>
        You can also add a <a
          href="https://developers.google.com/custom-search/v1/introduction#create_programmable_search_engine"
          target="_blank">Google Programmable Search Engine ID</a
        > along with your API key in order to enable Google Image Search for book covers.
      </p>
      <p>
        As the Google Cloud APIs have a potential cost (albeit a small one), this functionality is not enabled by
        default in order to keep the app free.
      </p>
    </dd>
    <dt>More Info</dt>
    <dd>
      You can find more information on the <a href="https://github.com/reiniiriarios/wordwyrm#readme" target="_blank"
        >GitHub Repo</a
      > for this app.
    </dd>
    <dt>Reporting Bugs</dt>
    <dd>
      If you encounter a bug or need help, you can <a
        href="https://github.com/reiniiriarios/wordwyrm/issues"
        target="_blank">post an issue</a
      >.
    </dd>
  </dl>
</div>

<style lang="scss">
  .help {
    height: calc(100vh - var(--page-nav-height));
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--c-subtle) transparent;
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
</style>
