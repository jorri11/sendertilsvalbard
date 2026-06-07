<script>
  import CategoryPicker from '$lib/CategoryPicker.svelte';

  let { form } = $props();
</script>

<svelte:head>
  <title>Meld inn firma | Sender til Svalbard</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
  <div class="mb-8">
    <p class="text-sm font-bold uppercase tracking-[0.25em] text-aurora">Community input</p>
    <h1 class="mt-3 font-display text-4xl font-bold text-ice">Meld inn et firma</h1>
  </div>

  {#if form?.success}
    <div class="mb-6 rounded border border-aurora/40 bg-aurora/10 p-4 font-semibold text-aurora">Takk! Forslaget ligger klart til godkjenning.</div>
  {:else if form?.message}
    <div class="mb-6 rounded border border-rose/40 bg-rose/10 p-4 font-semibold text-rose">{form.message}</div>
  {/if}

  <form class="aurora-panel grid gap-5 rounded-lg p-6" method="POST">
    <label class="grid gap-2">
      <span class="font-bold text-ice">Firmanavn</span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="company_name" required />
    </label>
    <label class="grid gap-2">
      <span class="font-bold text-ice">Nettside</span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="website" inputmode="url" placeholder="www.eksempel.no" />
    </label>
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="flex items-center gap-3 rounded border border-white/10 bg-white/[0.04] p-4 font-semibold">
        <input class="h-5 w-5 accent-aurora" name="ships_to_svalbard" type="checkbox" />
        Sender til Svalbard
      </label>
      <label class="flex items-center gap-3 rounded border border-white/10 bg-white/[0.04] p-4 font-semibold">
        <input class="h-5 w-5 accent-violet" name="vat_refund" type="checkbox" />
        Refunderer MVA
      </label>
    </div>
    <label class="grid gap-2">
      <span class="font-bold text-ice">Fraktmetoder</span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="shipping_methods" placeholder="Posten, Bring, DHL..." />
    </label>
    <CategoryPicker />
    <label class="grid gap-2">
      <span class="font-bold text-ice">Kilde</span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="source_url" inputmode="url" placeholder="www.eksempel.no/fraktinfo" />
    </label>
    <label class="grid gap-2">
      <span class="font-bold text-ice">Notater</span>
      <textarea class="min-h-32 rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="notes"></textarea>
    </label>
    <label class="grid gap-2">
      <span class="font-bold text-ice">E-post for oppfølging</span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="contact_email" type="email" />
    </label>
    <button class="rounded bg-aurora px-5 py-3 font-black text-polar hover:bg-ice">Send forslag</button>
  </form>
</main>
