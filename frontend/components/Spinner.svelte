<script lang="ts">
  import CircleNotch from "phosphor-svelte/lib/CircleNotch";

  export let size: number | string = "1rem";
</script>

<span class="spinner" style:width={size} style:height={size}><CircleNotch {size} /></span>

<style lang="scss">
  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .spinner {
    animation: rotating 2s linear infinite;
    display: inline-block;
    pointer-events: none;
  }
</style>
