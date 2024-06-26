<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import CaretDown from "phosphor-svelte/lib/CaretDown";
  import CaretUp from "phosphor-svelte/lib/CaretUp";

  export let value: string | number | null | undefined = undefined;
  export let options: { [value: string | number]: string | number } = {};
  export let onSelect: (value: string | number) => void = (_) => {};
  export let width: string | number = "7rem";
  export let small: boolean = false;

  const dispatch = createEventDispatcher();

  function select(e: MouseEvent | KeyboardEvent) {
    const btn = e.target as HTMLButtonElement;
    value = btn.dataset.val as string | number;
    onSelect(value);
    btn.blur();
    dispatch("change", value);
  }

  const NO_SELECTION = "— Select —";
</script>

<div class="select" class:select--small={small}>
  <div class="select__arrow select__arrow--down"><CaretDown size="0.8rem" /></div>
  <div class="select__arrow select__arrow--up"><CaretUp size="0.8rem" /></div>
  <button class="select__selected" style:width>
    {value ? options[value] ?? NO_SELECTION : NO_SELECTION}
  </button>
  <div class="select__dropdown" style:width>
    {#each Object.entries(options) as [val, name]}
      <button data-val={val} on:click={select} class="select__opt" class:selected={value === val}>{name}</button>
    {/each}
  </div>
</div>

<style lang="scss">
  .select {
    position: relative;
    display: inline-block;

    &__arrow {
      position: absolute;
      top: 0.67rem;
      right: 0.5rem;
      color: var(--c-text-muted);

      &--up {
        display: none;
      }
    }

    &__dropdown {
      display: none;
      position: absolute;
      box-shadow: 0 0.5rem 1rem 0 var(--shadow-3);
      background-color: var(--c-dropdown, var(--c-button));
      border-bottom-left-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
      z-index: 1;
    }

    &__selected,
    &__opt {
      padding: 0.5rem 1.75rem 0.5rem 0.75rem;
      background-color: var(--c-dropdown);
      color: var(--c-text);
      border: 0;
      border-radius: 0.25rem;
      font-size: 1rem;
      cursor: pointer;
    }

    &__selected {
      border: 1px solid var(--c-button-border, var(--c-button));

      &:hover {
        background-color: var(--c-button-hover);
        border-color: var(--c-button-hover-border, var(--c-button-hover));
        border-bottom-color: var(--c-button-hover);
      }
    }

    &__opt {
      display: block;
      width: 100%;
      border-radius: 0;
      border-top: 1px solid var(--c-dropdown-border, var(--c-base));

      &:last-child {
        border-bottom-left-radius: 0.25rem;
        border-bottom-right-radius: 0.25rem;
      }

      &.selected {
        background-color: var(--c-dropdown-active, var(--c-dropdown-hover, var(--c-button-hover)));
        border-color: var(--c-dropdown-active-border, var(--c-dropdown-border, var(--c-base)));
      }

      &:hover {
        background-color: var(--c-dropdown-hover, var(--c-button-hover));
        border-color: var(--c-dropdown-hover-border, var(--c-dropdown-border, var(--c-base)));
      }
    }

    &--small {
      .select__selected,
      .select__opt {
        padding: 0.25rem 1.5rem 0.25rem 0.5rem;
        font-size: 0.9rem;
      }

      .select__arrow {
        top: 0.33rem;
      }
    }

    &:hover,
    &:focus-visible,
    &:focus-within {
      .select__arrow {
        &--down {
          display: none;
        }

        &--up {
          display: block;
        }
      }

      .select__selected {
        background-color: var(--c-button-hover);
        border-color: var(--c-button-hover-border, var(--c-button-hover));
        border-bottom-color: var(--c-button-hover);
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
      }

      .select__dropdown {
        display: block;
      }
    }
  }
</style>
