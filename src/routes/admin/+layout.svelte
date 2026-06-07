<script>
  let { children, data } = $props();
</script>

<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
  <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
    <div>
      <p class="text-sm font-bold uppercase tracking-[0.25em] text-aurora">Backoffice</p>
      <h1 class="mt-2 font-display text-4xl font-bold text-ice">Redaksjon</h1>
      <p class="mt-1 text-sm text-ice/60">Innlogget som {data.user.email}</p>
    </div>
    <div class="flex gap-2">
      <a class="rounded border border-white/10 px-4 py-3 font-bold hover:border-aurora hover:text-aurora" href="/admin/companies/new">Nytt firma</a>
      <form method="POST" action="/login?/logout">
        <button class="rounded border border-white/10 px-4 py-3 font-bold hover:border-rose hover:text-rose">Logg ut</button>
      </form>
    </div>
  </div>

  {@render children()}
</main>
