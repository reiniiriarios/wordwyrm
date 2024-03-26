<script lang="ts">
  export let open: boolean = false;
  export let canCancel: boolean = true;
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
    } else if (["\n", "Enter"].includes(e.key)) {
      confirmClose();
    }
  });
</script>

<!-- keyboard interaction handled above -->
<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="modal" class:open on:click={() => (open = false)}>
  <div class="modal__window" role="dialog">
    <div class="modal__header">{heading}</div>
    <div class="modal__body"><slot /></div>
    <div class="modal__actions">
      {#if canCancel}
        <button type="button" class="btn modal__button" on:click={() => (open = false)}>Cancel</button>
      {/if}
      <button type="button" class="btn modal__button" on:click={confirmClose}>
        {confirmWord}
      </button>
    </div>
  </div>
</div>
