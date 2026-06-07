<script>
  let { data, form } = $props();
</script>

<svelte:head>
  <title>Backoffice | Sender til Svalbard</title>
</svelte:head>

{#if form?.message}
  <div class="mb-6 rounded border border-rose/40 bg-rose/10 p-4 font-semibold text-rose">{form.message}</div>
{/if}

<section class="mb-10">
  <div class="mb-4 flex items-end justify-between gap-4">
    <h2 class="font-display text-2xl font-bold text-ice">Innkommende forslag</h2>
    <span class="rounded bg-ember/20 px-3 py-1 text-sm font-bold text-ember">{data.submissions.length} venter</span>
  </div>
  <div class="grid gap-4">
    {#if data.submissions.length === 0}
      <div class="aurora-panel rounded-lg p-6 text-ice/70">Ingen forslag venter på godkjenning.</div>
    {:else}
      {#each data.submissions as submission (submission.id)}
        <article class="aurora-panel rounded-lg p-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 class="font-display text-xl font-bold text-ice">{submission.company_name}</h3>
              <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-ember">
                {submission.submission_type === 'change_request' ? `Endring av ${submission.current_company_name ?? 'eksisterende firma'}` : 'Nytt firma'}
              </p>
              {#if submission.website}
                <a class="text-sm font-semibold text-aurora hover:text-ice" href={submission.website} target="_blank" rel="noreferrer">{submission.website}</a>
              {/if}
              <p class="mt-3 text-ice/72">{submission.notes || 'Ingen notater.'}</p>
              <p class="mt-2 text-sm text-ice/50">{submission.categories || 'Ingen kategori'} · {submission.shipping_methods || 'Ingen fraktinfo'}</p>
            </div>
            <div class="flex gap-2">
              <form method="POST" action="?/approve">
                <input name="id" type="hidden" value={submission.id} />
                <button class="rounded bg-aurora px-4 py-2 font-black text-polar hover:bg-ice">Godkjenn</button>
              </form>
              <form method="POST" action="?/reject">
                <input name="id" type="hidden" value={submission.id} />
                <button class="rounded border border-white/10 px-4 py-2 font-bold hover:border-rose hover:text-rose">Avslå</button>
              </form>
            </div>
          </div>
        </article>
      {/each}
    {/if}
  </div>
</section>

<section>
  <div class="mb-4 flex items-end justify-between gap-4">
    <h2 class="font-display text-2xl font-bold text-ice">Firma</h2>
    <span class="rounded bg-aurora/20 px-3 py-1 text-sm font-bold text-aurora">{data.companies.length} registrert</span>
  </div>
  <div class="overflow-hidden rounded-lg border border-white/10">
    <table class="w-full border-collapse bg-polar/70 text-left text-sm">
      <thead class="bg-white/10 text-ice">
        <tr>
          <th class="px-4 py-3">Navn</th>
          <th class="hidden px-4 py-3 md:table-cell">Status</th>
          <th class="hidden px-4 py-3 lg:table-cell">Kategori</th>
          <th class="px-4 py-3">Handling</th>
        </tr>
      </thead>
      <tbody>
        {#each data.companies as company (company.id)}
          <tr class="border-t border-white/10">
            <td class="px-4 py-3 font-semibold text-ice">{company.name}</td>
            <td class="hidden px-4 py-3 text-ice/70 md:table-cell">
              {company.ships_to_svalbard ? 'Sender' : 'Sender ikke'} / {company.vat_refund ? 'MVA' : 'MVA ukjent'}
            </td>
            <td class="hidden px-4 py-3 text-ice/70 lg:table-cell">{company.categories || '-'}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-2">
                <a class="rounded border border-white/10 px-3 py-2 font-bold hover:border-aurora hover:text-aurora" href={`/admin/companies/${company.id}`}>Rediger</a>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
