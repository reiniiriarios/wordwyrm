<script lang="ts">
  import Modal from "@components/modal.svelte";
  import { push } from "svelte-spa-router";
  import Crop from "phosphor-svelte/lib/Crop";
  import { onMount } from "svelte";
  import Croppie from "croppie";

  export let book: Book = {} as Book;

  let isOpen: boolean = false;
  let canSave: boolean = false;
  let croppieDiv: HTMLDivElement;
  let croppieInstance: Croppie | null;

  function openDialog() {
    isOpen = true;
    canSave = true;
    loadCroppie();
  }

  function loadCroppie() {
    if (book.images.hasImage && !croppieInstance) {
      new Promise((resolve) => {
        if (croppieDiv) {
          return resolve(true);
        }
        const observer = new MutationObserver((_mutations) => {
          if (croppieDiv) {
            observer.disconnect();
            resolve(true);
          }
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }).then(() => {
        croppieInstance = new Croppie(croppieDiv, {
          viewport: {
            width: croppieDiv.clientHeight * 0.625,
            height: croppieDiv.clientHeight,
          },
          enableZoom: true,
          showZoomer: true,
          enforceBoundary: true,
          enableResize: true,
        });
        croppieInstance.bind({
          url: `bookimage://${book.cache.urlpath}.jpg`,
          zoom: 0,
        });
      });
    }
  }

  onMount(() => {
    const removeSaveListener = window.electronAPI.bookImageBase64Added(() => {
      console.log("image crop saved");
      book.images.imageUpdated = new Date().getTime();
      setTimeout(() => push(`#/book/${book.cache.filepath}`), 50);
      isOpen = false;
    });
    return () => {
      croppieInstance?.destroy();
      removeSaveListener();
    };
  });

  function saveImage() {
    canSave = false;
    console.log("cropping");
    croppieInstance?.result({ type: "base64", size: "original", format: "jpeg" })?.then((res) => {
      console.log("saving");
      window.electronAPI.addBookImageBase64(book, res.slice("data:image/jpeg;base64,".length));
    });
  }
</script>

<button type="button" class="btn" on:click={openDialog}>Crop Image <Crop /></button>
<Modal bind:open={isOpen} heading="Crop Image" confirmWord="Save" on:confirm={saveImage} bind:canConfirm={canSave}>
  <div class="croppie" bind:this={croppieDiv}></div>
</Modal>

<style lang="scss">
  .croppie {
    width: 100%;
    height: 90%;
  }
</style>
