<script>
  import PageviewTracker from "$lib/PageviewTracker.svelte";
  import "../app.css";

  let { children, data } = $props();
</script>

<PageviewTracker />

<div class="min-h-screen">
  <header class="border-b border-white/10 bg-polar/70 backdrop-blur">
    <nav
      class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"
    >
      <a href="/" class="font-display text-xl font-bold text-ice"
        >Sender til Svalbard</a
      >
      <div class="flex items-center gap-2 text-sm font-semibold text-ice/80">
        <a
          class="rounded border border-white/10 px-3 py-2 hover:border-aurora/60 hover:text-aurora"
          href="/request">Foreslå et firma</a
        >
        {#if data.user}
          <a
            class="rounded border border-white/10 px-3 py-2 hover:border-aurora/60 hover:text-aurora"
            href="/admin">Backoffice</a
          >
        {/if}
      </div>
    </nav>
  </header>

  {@render children()}
</div>
