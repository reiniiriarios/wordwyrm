<script lang="ts">
  import ImageSquare from "phosphor-svelte/lib/ImageSquare";
  import { settings } from "@stores/settings";

  export let book: Book = {} as Book;

  const links: Record<string, string> = {
    google: "https://www.google.com/search?tbm=isch&q=",
    duckduckgo: "https://duckduckgo.com/?t=h_&iax=images&ia=images&q=",
    bing: "https://www.bing.com/images/search?q=",
    ecosia: "https://www.ecosia.org/images?q=",
  };

  const link = links[$settings.imageSearchEngine] ?? links.google;
  const query = encodeURIComponent(`${book.title} by ${book.authors.map((a) => a.name).join(", ")} book cover`).replace(
    /%20/g,
    "+",
  );
</script>

<a class="btn btn--searchForImage" target="_blank" href={link + query}>
  Search for Image <span class="icon"><ImageSquare /></span>
</a>
