<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>Sender til Svalbard</title>
  <meta name="description" content="Finn butikker og leverandorer som sender varer til Svalbard og refunderer MVA." />
</svelte:head>

<main>
  <section class="scanline border-b border-white/10">
    <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
      <div class="space-y-6">
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-aurora">Open database</p>
        <h1 class="font-display text-4xl font-bold leading-tight text-ice sm:text-6xl">Hvem sender varer til Svalbard?</h1>
        <p class="max-w-2xl text-lg leading-8 text-ice/72">
          En praktisk oversikt over nettbutikker og leverandorer, med frakt, MVA-refusjon og erfaringer samlet pa ett sted.
        </p>
        <div class="flex flex-wrap gap-3">
          <a class="rounded bg-aurora px-5 py-3 font-bold text-polar shadow-glow hover:bg-ice" href="/request">Foresla et firma</a>
          <a class="rounded border border-white/15 px-5 py-3 font-bold text-ice hover:border-violet hover:text-violet" href="#liste">Se listen</a>
        </div>
      </div>
      <div class="aurora-panel rounded-lg p-5">
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded border border-aurora/30 bg-aurora/10 p-4">
            <p class="text-3xl font-black text-aurora">{data.companies.filter((company) => company.ships_to_svalbard).length}</p>
            <p class="text-sm text-ice/70">sender til Svalbard</p>
          </div>
          <div class="rounded border border-violet/30 bg-violet/10 p-4">
            <p class="text-3xl font-black text-violet">{data.companies.filter((company) => company.vat_refund).length}</p>
            <p class="text-sm text-ice/70">refunderer MVA</p>
          </div>
          <div class="col-span-2 rounded border border-white/10 bg-white/[0.04] p-4">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-ember">Svalbard note</p>
            <p class="mt-2 text-ice/76">Butikker handterer frakt og MVA ulikt. Bruk kilde og notater for a dobbeltsjekke for du bestiller.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="liste" class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <form class="mb-6 grid gap-3 md:grid-cols-[1fr_220px_auto]" method="GET">
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 text-ice placeholder:text-ice/45 outline-none focus:border-aurora" name="q" placeholder="Sok etter firma, kategori eller notat" value={data.filters.q} />
      <select class="rounded border border-white/10 bg-polar px-4 py-3 text-ice outline-none focus:border-aurora" name="category">
        <option value="">Alle kategorier</option>
        {#each data.categories as category}
          <option value={category} selected={data.filters.category === category}>{category}</option>
        {/each}
      </select>
      <button class="rounded bg-ice px-5 py-3 font-bold text-polar hover:bg-aurora">Filtrer</button>
    </form>

    {#if data.companies.length === 0}
      <div class="aurora-panel rounded-lg p-8 text-center text-ice/70">Ingen firma funnet enna. Foresla gjerne det forste.</div>
    {:else}
      <div class="grid gap-4">
        {#each data.companies as company}
          <article class="aurora-panel rounded-lg p-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 class="font-display text-2xl font-bold text-ice">{company.name}</h2>
                {#if company.website}
                  <a class="mt-1 inline-block text-sm font-semibold text-aurora hover:text-ice" href={company.website} rel="noreferrer" target="_blank">{company.website}</a>
                {/if}
              </div>
              <div class="flex flex-wrap gap-2">
                <span class={`rounded px-3 py-1 text-sm font-bold ${company.ships_to_svalbard ? 'bg-aurora text-polar' : 'bg-rose/20 text-rose'}`}>
                  {company.ships_to_svalbard ? 'Sender hit' : 'Uklart / sender ikke'}
                </span>
                <span class={`rounded px-3 py-1 text-sm font-bold ${company.vat_refund ? 'bg-violet text-white' : 'bg-white/10 text-ice/70'}`}>
                  {company.vat_refund ? 'MVA-refusjon' : 'Ingen MVA-info'}
                </span>
              </div>
            </div>
            <dl class="mt-5 grid gap-4 text-sm md:grid-cols-3">
              <div>
                <dt class="font-bold text-ice">Frakt</dt>
                <dd class="mt-1 text-ice/70">{company.shipping_methods || 'Ikke registrert'}</dd>
              </div>
              <div>
                <dt class="font-bold text-ice">Kategori</dt>
                <dd class="mt-1 text-ice/70">{company.categories || 'Ikke registrert'}</dd>
              </div>
              <div>
                <dt class="font-bold text-ice">Sist oppdatert</dt>
                <dd class="mt-1 text-ice/70">{new Date(company.updated_at).toLocaleDateString('no-NO')}</dd>
              </div>
            </dl>
            {#if company.notes}
              <p class="mt-4 border-t border-white/10 pt-4 text-ice/78">{company.notes}</p>
            {/if}
          </article>
        {/each}
      </div>
    {/if}
  </section>
</main>
