<script lang="ts">
  import Menu from "@components/menu.svelte";

  export let params = { wild: "" };
</script>

<Menu />

<div id="container">
  <section class="hero is-medium is-primary is-bold">
    <div class="hero-body">
      <div class="container">
        <h1 class="title">Wild title</h1>
      </div>
    </div>
  </section>
  <div class="content has-text-centered">
    <p>Message</p>

    <p>something: {params.wild}</p>
  </div>
</div>
