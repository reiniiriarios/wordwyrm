<script lang="ts">
  import Hash from "phosphor-svelte/lib/Hash";
  import Calendar from "phosphor-svelte/lib/Calendar";

  export let value: string = "";
  let useDate: boolean = true;
  $: useDate = !value || !!value.match(/^\d+\-\d+\-\d+$/);

  function validate() {
    value = value?.replace(/[^\-0-9]/g, "").replace(/\-{2,}/g, "-") ?? "";
  }

  function switchFormat() {
    useDate = !useDate;
  }
</script>

<div class="flexibleDate">
  {#if useDate}
    <input type="date" bind:value />
  {:else}
    <input type="text" on:keyup={validate} on:change={validate} bind:value />
  {/if}
  <div class="flexibleDate__btn" role="button" tabindex="0" on:click={switchFormat} on:keypress={switchFormat}>
    {#if useDate}
      <Hash size="1.25rem" />
    {:else}
      <Calendar size="1.25rem" />
    {/if}
  </div>
</div>

<style lang="scss">
  .flexibleDate {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__btn {
      margin: 0.2rem 0 0 0.5rem;
      cursor: pointer;
    }
  }
</style>
