<script lang="ts">
  import { onMount } from "svelte";
  import ArrowUp from "phosphor-svelte/lib/ArrowFatLineUp";

  export let arrows: boolean = false;
  let show: boolean = false;

  onMount(() => {
    // Create an artificial delay to wait for settings and/or books to load.
    const timer = setTimeout(() => (show = true), 125);
    return () => clearTimeout(timer);
  });
</script>

{#if arrows}
  <div class="arrows" class:show>
    <ArrowUp size="9rem" />
    <ArrowUp size="9rem" />
  </div>
{/if}
<div class="gettingstarted" class:show>
  <h2>Get Started</h2>
  <p>You can add books manually or by search.</p>
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
    As the Google Cloud APIs have a potential cost (albeit a small one), this functionality is not enabled by default in
    order to keep the app free.
  </p>
  <h3>More Info</h3>
  <p>
    You can find more information on the <a href="https://github.com/reiniiriarios/wordwyrm#readme" target="_blank"
      >GitHub Repo</a
    > for this app.
  </p>
</div>

<style lang="scss">
  .arrows {
    z-index: 0;
    text-align: right;
    position: absolute;
    top: 3rem;
    right: 1rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease;

    &.show {
      opacity: 0.25;
    }
  }

  .gettingstarted {
    position: relative;
    z-index: 1;
    font-size: 1rem;
    padding: 2rem;
    max-width: 45rem;
    margin: 0 auto;
    opacity: 0;
    transition: opacity 0.5s ease;

    h2 {
      font-size: 1.5rem;
    }

    h3 {
      font-size: 1.25rem;
      margin-top: 1.5rem;
    }

    &.show {
      opacity: 1;
    }
  }
</style>
