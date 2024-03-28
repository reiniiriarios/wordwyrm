<script lang="ts">
  export let open: boolean = false;
  export let canCancel: boolean = true;
  export let canAccept: boolean = true;
  export let confirm: () => boolean;
  export let confirmWord: string = "Okay";
  export let heading: string;

  function confirmClose() {
    if (confirm()) {
      open = false;
    }
  }

  window.addEventListener("keydown", function (e: KeyboardEvent) {
    if (canCancel && ["Escape"].includes(e.key)) {
      open = false;
    } else if (["\n", "Enter"].includes(e.key) && canAccept) {
      confirmClose();
    }
  });
</script>

<!-- keyboard interaction handled above -->
<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="modal" class:open on:click|self={() => (open = false)}>
  <div class="modal__window" role="dialog">
    <div class="modal__header">{heading}</div>
    <div class="modal__body"><slot /></div>
    <div class="modal__actions">
      {#if canCancel}
        <button type="button" class="btn modal__button" on:click={() => (open = false)}>Cancel</button>
      {/if}
      <button type="button" class="btn modal__button" disabled={canAccept} on:click={confirmClose}>
        {confirmWord}
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  @import "../style/variables";

  .modal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0 0 0 / 25%);
    display: none;

    &.open {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__window {
      width: 75vw;
      height: 75vh;
      overflow-y: auto;
      background-color: $bgColorLight;
      text-align: left;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    &__header {
      font-size: 1.125rem;
      padding: 0.5rem;
      border-bottom: 1px solid $bgColorLighter;
    }

    &__body {
      font-size: 1rem;
      padding: 0.75rem 0.5rem;
      height: 100%;
    }

    &__actions {
      border-top: 1px solid $bgColorLighter;
      padding: 0.5rem;
      text-align: right;
    }
  }
</style>
