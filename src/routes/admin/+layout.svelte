<script>
  let { children, data } = $props();
</script>

<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
  <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 class="mt-2 font-display text-4xl font-bold text-ice">Backoffice</h1>
      <p class="mt-1 text-sm text-ice/60">Innlogget som {data.user.email}</p>
    </div>
    <div class="flex gap-2">
      {#if data.user.is_superuser}
        <a
          class={`inline-flex items-center gap-2 rounded border px-4 py-3 font-bold transition hover:border-violet hover:text-violet ${data.pendingAdminRequests > 0 ? "border-ember/35 bg-ember/10 text-ice" : "border-white/10"}`}
          href="/admin/admins"
        >
          <span>Admins</span>
          {#if data.pendingAdminRequests > 0}
            <span
              class="rounded bg-ember px-2 py-0.5 text-xs font-black leading-5 text-polar"
            >
              {data.pendingAdminRequests}
            </span>
          {/if}
        </a>
      {/if}
      <a
        class="rounded border border-white/10 px-4 py-3 font-bold hover:border-aurora hover:text-aurora"
        href="/admin/companies/new">Nytt firma</a
      >
      <form method="POST" action="/login?/logout">
        <button
          class="rounded border border-white/10 px-4 py-3 font-bold hover:border-rose hover:text-rose"
          >Logg ut</button
        >
      </form>
    </div>
  </div>

  {@render children()}
</main>
