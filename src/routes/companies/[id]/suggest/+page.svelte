<script>
  import CategoryPicker from '$lib/CategoryPicker.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Foreslå endring for {data.company.name} | Sender til Svalbard</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
  <div class="mb-8">
    <a class="text-sm font-bold text-aurora hover:text-ice" href="/">Tilbake</a>
    <p class="mt-4 text-sm font-bold uppercase tracking-[0.25em] text-aurora">Endringsforslag</p>
    <h1 class="mt-3 font-display text-4xl font-bold text-ice">{data.company.name}</h1>
  </div>

  {#if form?.success}
    <div class="mb-6 rounded border border-aurora/40 bg-aurora/10 p-4 font-semibold text-aurora">Takk! Endringsforslaget ligger klart til godkjenning.</div>
  {:else if form?.message}
    <div class="mb-6 rounded border border-rose/40 bg-rose/10 p-4 font-semibold text-rose">{form.message}</div>
  {/if}

  <form class="aurora-panel grid gap-5 rounded-lg p-6" method="POST">
    <label class="grid gap-2">
      <span class="font-bold text-ice">Firmanavn</span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="company_name" value={data.company.name} required />
    </label>
    <label class="grid gap-2">
      <span class="font-bold text-ice">Nettside <span class="ml-2 text-xs font-semibold uppercase tracking-[0.12em] text-ice/50">valgfritt</span></span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="website" inputmode="url" placeholder="www.eksempel.no" value={data.company.website ?? ''} />
    </label>
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="flex items-center gap-3 rounded border border-white/10 bg-white/[0.04] p-4 font-semibold">
        <input class="h-5 w-5 accent-aurora" name="ships_to_svalbard" type="checkbox" checked={Boolean(data.company.ships_to_svalbard)} />
        <span>Sender til Svalbard <span class="ml-2 text-xs font-semibold uppercase tracking-[0.12em] text-ice/50">valgfritt</span></span>
      </label>
      <label class="flex items-center gap-3 rounded border border-white/10 bg-white/[0.04] p-4 font-semibold">
        <input class="h-5 w-5 accent-violet" name="vat_refund" type="checkbox" checked={Boolean(data.company.vat_refund)} />
        <span>Refunderer MVA <span class="ml-2 text-xs font-semibold uppercase tracking-[0.12em] text-ice/50">valgfritt</span></span>
      </label>
    </div>
    <label class="grid gap-2">
      <span class="font-bold text-ice">Fraktmetoder <span class="ml-2 text-xs font-semibold uppercase tracking-[0.12em] text-ice/50">valgfritt</span></span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="shipping_methods" value={data.company.shipping_methods ?? ''} />
    </label>
    <CategoryPicker value={data.company.categories ?? ''} />
    <label class="grid gap-2">
      <span class="font-bold text-ice">Kilde <span class="ml-2 text-xs font-semibold uppercase tracking-[0.12em] text-ice/50">valgfritt</span></span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="source_url" inputmode="url" placeholder="www.eksempel.no/frakt" value={data.company.source_url ?? ''} />
    </label>
    <label class="grid gap-2">
      <span class="font-bold text-ice">Hva bør endres? <span class="ml-2 text-xs font-semibold uppercase tracking-[0.12em] text-ice/50">valgfritt</span></span>
      <textarea class="min-h-36 rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="notes">{data.company.notes ?? ''}</textarea>
    </label>
    <button class="rounded bg-aurora px-5 py-3 font-black text-polar hover:bg-ice">Send endringsforslag</button>
  </form>
</main>
