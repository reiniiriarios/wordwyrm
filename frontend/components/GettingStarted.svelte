<script lang="ts">
  import { onMount } from "svelte";
  import Gear from "phosphor-svelte/lib/Gear";
  import { settings } from "@stores/settings";

  let canShow: boolean = false;

  onMount(() => {
    // Create an artificial delay to wait for settings and/or books to load.
    const timer = setTimeout(() => (canShow = true), 125);
    return () => clearTimeout(timer);
  });
</script>

{#if canShow}
  <div class="gettingstarted">
    <h2>Welcome!</h2>
    {#if $settings.booksDir}
      <p>To get started, you can add books manually or by search.</p>
    {:else}
      <p>
        To get started, you should first choose a directory to save your data in <a href="#/settings">Settings</a>.
        After that, you can add books manually or by search.
      </p>
    {/if}
    <h3>API Keys</h3>
    <p>
      By default, search uses the <a href="https://openlibrary.org/" target="_blank">OpenLibrary</a> API. If you add an
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
      As the Google Cloud APIs have a potential cost (albeit a small one), this functionality is not enabled by default
      in order to keep the app free.
    </p>
    <h3>More Info</h3>
    <p>
      You can find more information on the <a
        href="https://github.com/reiniiriarios/book-tracker#readme"
        target="_blank">GitHub Repo</a
      > for this app.
    </p>
  </div>
{/if}

<style lang="scss">
  .gettingstarted {
    font-size: 1rem;
    padding: 2rem;
    max-width: 45rem;
    margin: 0 auto;

    h2 {
      font-size: 1.5rem;
    }

    h3 {
      font-size: 1.25rem;
      margin-top: 1.5rem;
    }
  }
</style>
