<script lang="ts">
  import Modal from "@components/Modal.svelte";

  export let open: boolean = false;
  export let message: string = "";
  export let details: string = "";

  function close() {
    open = false;
  }
</script>

<Modal bind:open heading="Error" canCancel={false} on:confirm={close} height={details ? "20rem" : "13rem"} small>
  <div class="error">
    <div class="error__message">{message}</div>
    {#if details}
      <div class="error__details">{details}</div>
    {/if}
  </div>
</Modal>

<style lang="scss">
  .error {
    padding: 1rem;

    &__message {
      font-size: 1rem;
    }

    &__details {
      margin-top: 1rem;
      padding: 0.5rem;
      font-size: 0.8rem;
      height: 8rem;
      white-space: pre-wrap;
      font-family: monospace;
      background-color: var(--c-surface);
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--c-subtle) transparent;
    }
  }
</style>
