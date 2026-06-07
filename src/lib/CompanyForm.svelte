<script>
  import CategoryPicker from '$lib/CategoryPicker.svelte';

  let { company = {}, submitLabel = 'Lagre' } = $props();
</script>

<form class="aurora-panel grid gap-5 rounded-lg p-6" method="POST">
  <label class="grid gap-2">
    <span class="font-bold text-ice">Firmanavn</span>
    <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="name" value={company.name ?? ''} required />
  </label>
  <label class="grid gap-2">
    <span class="font-bold text-ice">Nettside</span>
    <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="website" inputmode="url" placeholder="www.eksempel.no" value={company.website ?? ''} />
  </label>
  <div class="grid gap-3 sm:grid-cols-2">
    <label class="flex items-center gap-3 rounded border border-white/10 bg-white/[0.04] p-4 font-semibold">
      <input class="h-5 w-5 accent-aurora" name="ships_to_svalbard" type="checkbox" checked={Boolean(company.ships_to_svalbard)} />
      Sender til Svalbard
    </label>
    <label class="flex items-center gap-3 rounded border border-white/10 bg-white/[0.04] p-4 font-semibold">
      <input class="h-5 w-5 accent-violet" name="vat_refund" type="checkbox" checked={Boolean(company.vat_refund)} />
      Refunderer MVA
    </label>
  </div>
  <label class="grid gap-2">
    <span class="font-bold text-ice">Fraktmetoder</span>
    <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="shipping_methods" value={company.shipping_methods ?? ''} />
  </label>
  <CategoryPicker value={company.categories ?? ''} />
  <label class="grid gap-2">
    <span class="font-bold text-ice">Kilde</span>
    <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="source_url" inputmode="url" placeholder="www.eksempel.no/fraktinfo" value={company.source_url ?? ''} />
  </label>
  <label class="grid gap-2">
    <span class="font-bold text-ice">Notater</span>
    <textarea class="min-h-36 rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="notes">{company.notes ?? ''}</textarea>
  </label>
  <button class="rounded bg-aurora px-5 py-3 font-black text-polar hover:bg-ice">{submitLabel}</button>
</form>
