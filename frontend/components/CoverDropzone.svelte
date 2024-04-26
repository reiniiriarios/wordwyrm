<script lang="ts">
  import log from "electron-log/renderer";
  import { createEventDispatcher } from "svelte";
  import Dropzone from "svelte-file-dropzone";

  type DroppedFile = File & {
    path?: string;
    file?: unknown;
    errors?: {
      code: string;
      message: string;
    }[];
  };

  type DroppedFileEvent = CustomEvent<
    Event & {
      acceptedFiles: DroppedFile[];
      fileRejections: DroppedFile[];
    }
  >;

  export let imagePath = "";
  export let addlMsg: boolean = false;
  export let containerClasses: string = "";

  let dragHighlight: boolean = false;
  let invalidFile: boolean = false;

  const dispatch = createEventDispatcher();

  function dragon() {
    dragHighlight = true;
  }

  function dragoff() {
    dragHighlight = false;
  }

  function handleBookImage(e: DroppedFileEvent) {
    dragHighlight = false;
    const { acceptedFiles, fileRejections } = e.detail;
    if (fileRejections.length) {
      log.error("invalid cover image file", JSON.stringify(fileRejections.map((r) => r.errors)));
      if (!acceptedFiles.length) {
        invalidFile = true;
        setTimeout(() => (invalidFile = false), 1000);
      }
    }
    if (acceptedFiles.length) {
      imagePath = acceptedFiles[0].path.replace(/\\/g, "/").replace(/ /g, "%20");
      if (imagePath.length > 1 && imagePath.charAt(0) !== "/") {
        // Windows fix
        imagePath = `/${imagePath}`;
      }
    }
    dispatch("change", imagePath);
  }
</script>

<div class="coverDropzone" class:dragHighlight class:invalidFile>
  <Dropzone accept="image/*" on:drop={handleBookImage} on:dragenter={dragon} on:dragleave={dragoff} {containerClasses}>
    {#if imagePath}
      <img src={`localfile://${imagePath}`} alt="" />
      {#if addlMsg}
        <div class="dropzone__info">
          <div class="dropzone__msg dropzone__msg--dragging" aria-hidden={!dragHighlight}>Drop to replace image.</div>
          <div class="dropzone__msg dropzone__msg--default" aria-hidden={dragHighlight || invalidFile}>
            Drag or click here to replace image.
          </div>
          <div class="dropzone__msg dropzone__msg--error" aria-hidden={!invalidFile}>Invalid file.</div>
        </div>
      {/if}
    {:else}
      <div class="dropzone__info">
        <div class="dropzone__msg dropzone__msg--dragging" aria-hidden={!dragHighlight}>Drop to add image.</div>
        <div class="dropzone__msg dropzone__msg--default" aria-hidden={dragHighlight || invalidFile}>
          Drag or click here to add image.
        </div>
        <div class="dropzone__msg dropzone__msg--error" aria-hidden={!invalidFile}>Invalid file.</div>
      </div>
    {/if}
  </Dropzone>
</div>
