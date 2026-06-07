<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>Sender til Svalbard</title>
  <meta
    name="description"
    content="Finn butikker og leverandører som sender varer til Svalbard og refunderer MVA."
  />
</svelte:head>

<main>
  <section class="scanline border-b border-white/10">
    <div
      class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16"
    >
      <div class="space-y-6">
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-aurora">
          100% facebook fri
        </p>
        <h1
          class="font-display text-4xl font-bold leading-tight text-ice sm:text-6xl"
        >
          Hvem sender varer til Svalbard?
        </h1>
        <p class="max-w-2xl text-lg leading-8 text-ice/72">
          Denne siden er vedlikeholdt av oss svalbardianere, vi trenger dine
          bidrag for å få en komplett liste.
        </p>
        <div class="flex flex-wrap gap-3">
          <a
            class="rounded bg-aurora px-5 py-3 font-bold text-polar shadow-glow hover:bg-ice"
            href="/request">Foreslå et firma</a
          >
          <a
            class="rounded border border-white/15 px-5 py-3 font-bold text-ice hover:border-violet hover:text-violet"
            href="/admin-interest">Jeg vil bidra som admin</a
          >
        </div>
      </div>
      <div class="aurora-panel self-start overflow-hidden rounded-lg">
        <div class="grid divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div class="p-6">
            <p class="font-display text-5xl font-black leading-none text-aurora">
              {data.companies.filter((company) => company.ships_to_svalbard)
                .length}
            </p>
            <p class="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-ice/62">
              sender til Svalbard
            </p>
          </div>
          <div class="p-6">
            <p class="font-display text-5xl font-black leading-none text-violet">
              {data.companies.filter((company) => company.vat_refund).length}
            </p>
            <p class="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-ice/62">
              refunderer MVA
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="liste" class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <form class="mb-6 grid gap-3 md:grid-cols-[1fr_220px_auto]" method="GET">
      <input
        class="rounded border border-white/10 bg-white/10 px-4 py-3 text-ice placeholder:text-ice/45 outline-none focus:border-aurora"
        name="q"
        placeholder="Søk etter firma, kategori eller notat"
        value={data.filters.q}
      />
      <select
        class="rounded border border-white/10 bg-polar px-4 py-3 text-ice outline-none focus:border-aurora"
        name="category"
      >
        <option value="">Alle kategorier</option>
        {#each data.categories as category (category)}
          <option value={category} selected={data.filters.category === category}
            >{category}</option
          >
        {/each}
      </select>
      <button
        class="rounded bg-ice px-5 py-3 font-bold text-polar hover:bg-aurora"
        >Filtrer</button
      >
    </form>

    {#if data.companies.length === 0}
      <div class="aurora-panel rounded-lg p-8 text-center text-ice/70">
        Ingen firma funnet ennå. Foreslå gjerne det første.
      </div>
    {:else}
      <div class="grid gap-4">
        {#each data.companies as company (company.id)}
          <article class="aurora-panel rounded-lg p-5">
            <div
              class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
            >
              <div>
                <h2 class="font-display text-2xl font-bold text-ice">
                  {company.name}
                </h2>
                {#if company.website}
                  <a
                    class="mt-1 inline-block text-sm font-semibold text-aurora hover:text-ice"
                    href={company.website}
                    rel="noreferrer"
                    target="_blank">{company.website}</a
                  >
                {/if}
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  class={`rounded px-3 py-1 text-sm font-bold ${company.ships_to_svalbard ? "bg-aurora text-polar" : "bg-rose/20 text-rose"}`}
                >
                  {company.ships_to_svalbard ? "Sender" : "Sender ikke"}
                </span>
                {#if company.ships_to_svalbard}
                  <span
                    class={`rounded px-3 py-1 text-sm font-bold ${company.vat_refund ? "bg-violet text-white" : "bg-white/10 text-ice/70"}`}
                  >
                    {company.vat_refund
                      ? "Refunderer MVA"
                      : "Refunderer ikke MVA"}
                  </span>
                {/if}
              </div>
            </div>
            <dl class="mt-5 grid gap-4 text-sm md:grid-cols-3">
              <div>
                <dt class="font-bold text-ice">Frakt</dt>
                <dd class="mt-1 text-ice/70">
                  {company.shipping_methods || "Ikke registrert"}
                </dd>
              </div>
              <div>
                <dt class="font-bold text-ice">Kategori</dt>
                <dd class="mt-1 text-ice/70">
                  {company.categories || "Ikke registrert"}
                </dd>
              </div>
              <div>
                <dt class="font-bold text-ice">Sist oppdatert</dt>
                <dd class="mt-1 text-ice/70">
                  {new Date(company.updated_at).toLocaleDateString("no-NO")}
                </dd>
              </div>
            </dl>
            {#if company.notes}
              <p class="mt-4 border-t border-white/10 pt-4 text-ice/78">
                {company.notes}
              </p>
            {/if}
            <div class="mt-4 border-t border-white/10 pt-4">
              <a class="text-sm font-bold text-aurora hover:text-ice" href={`/companies/${company.id}/suggest`}>
                Foreslå endring
              </a>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </section>
</main>
