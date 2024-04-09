<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import Spinner from "@components/Spinner.svelte";
  const dispatch = createEventDispatcher();

  export let open: boolean = false;
  export let canCancel: boolean = true;
  export let canConfirm: boolean = true;
  export let confirmWord: string = "Okay";
  export let heading: string;
  export let height: string = "";
  export let warning: boolean = false;
  export let loading: boolean = false;

  function confirm() {
    if (open) {
      window.removeEventListener("keydown", modalKey);
      dispatch("confirm");
    }
  }

  function close() {
    if (open) {
      window.removeEventListener("keydown", modalKey);
      open = false;
      dispatch("cancel");
    }
  }

  function modalKey(e: KeyboardEvent) {
    if (open) {
      if (canCancel && ["Escape"].includes(e.key)) {
        console.log("cancel modal");
        close();
      } else if (["\n", "Enter"].includes(e.key) && canConfirm) {
        console.log("confirm modal");
        confirm();
      }
    }
  }

  onMount(() => {
    window.addEventListener("keydown", modalKey);
    return () => window.removeEventListener("keydown", modalKey);
  });
</script>

<!-- keyboard interaction handled above -->
<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="modal" class:open on:click|self={close}>
  <div class="modal__window" role="dialog" style:height>
    <div class="modal__header">{heading}</div>
    <div class="modal__body"><slot /></div>
    <div class="modal__actions">
      {#if canCancel}
        <button type="button" class="btn modal__button" on:click={close}>Cancel</button>
      {/if}
      <button
        type="button"
        class="btn modal__button modal__button--confirm"
        class:btn--delete={warning}
        disabled={!canConfirm}
        on:click={confirm}
      >
        {#if loading}
          <Spinner />
        {:else}
          {confirmWord}
        {/if}
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  .modal {
    --header-height: 2.5rem;
    --footer-height: 3.25rem;

    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0 0 0 / 25%);
    display: none;
    z-index: 100;

    &.open {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__window {
      width: 75vw;
      height: 75vh;
      overflow-y: auto;
      background-color: var(--bg-color-light);
      text-align: left;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 110;
      box-shadow: rgba(0, 0, 0, 0.2) 0.1rem 0.1rem 0.4rem 0.2rem;
    }

    &__header {
      height: var(--header-height);
      font-size: 1.125rem;
      padding: 0.5rem;
      border-bottom: 1px solid var(--bg-color-lighter);
    }

    &__body {
      height: calc(100% - var(--header-height) - var(--footer-height));
      font-size: 1rem;
      padding: 0.75rem 0.5rem;
    }

    &__actions {
      height: var(--footer-height);
      border-top: 1px solid var(--bg-color-lighter);
      padding: 0.5rem;
      display: flex;
      justify-content: right;
      align-items: center;
    }

    &__button {
      &--confirm {
        min-width: 5rem;
        justify-content: center;
      }
    }
  }
</style>
