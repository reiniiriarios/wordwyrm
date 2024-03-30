<script lang="ts">
  export let params: { wild: string } = { wild: "" };
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Book</h2>
  <div class="pageNav__actions">{params.wild}</div>
</div>
