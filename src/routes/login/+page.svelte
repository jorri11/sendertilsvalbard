<script>
  let { data, form } = $props();
</script>

<svelte:head>
  <title>Logg inn | Sender til Svalbard</title>
</svelte:head>

<main class="mx-auto grid min-h-[calc(100vh-73px)] max-w-md place-items-center px-4 py-10">
  <form class="aurora-panel grid w-full gap-5 rounded-lg p-6" method="POST" action="?/login">
    <input type="hidden" name="redirectTo" value={data.redirectTo} />
    <div>
      <p class="text-sm font-bold uppercase tracking-[0.25em] text-aurora">Backoffice</p>
      <h1 class="mt-3 font-display text-3xl font-bold text-ice">Logg inn</h1>
    </div>
    {#if form?.message}
      <div class="rounded border border-rose/40 bg-rose/10 p-3 font-semibold text-rose">{form.message}</div>
    {/if}
    <label class="grid gap-2">
      <span class="font-bold text-ice">E-post</span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="email" type="email" value={form?.email ?? ''} required />
    </label>
    <label class="grid gap-2">
      <span class="font-bold text-ice">Passord</span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="password" type="password" required />
    </label>
    <button class="rounded bg-aurora px-5 py-3 font-black text-polar hover:bg-ice">Logg inn</button>
  </form>
</main>
