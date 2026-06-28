<script lang="ts">
  let { data, form } = $props();

  const changeFields = [
    { key: 'company_name', label: 'Firmanavn', kind: 'text' },
    { key: 'website', label: 'Nettside', kind: 'text' },
    { key: 'ships_to_svalbard', label: 'Sender til Svalbard', kind: 'boolean' },
    { key: 'vat_refund', label: 'Refunderer MVA', kind: 'boolean' },
    { key: 'shipping_methods', label: 'Fraktmetoder', kind: 'text' },
    { key: 'categories', label: 'Kategorier', kind: 'text' },
    { key: 'notes', label: 'Notater', kind: 'text' },
    { key: 'source_url', label: 'Kilde', kind: 'text' }
  ] as const;

  type ChangeField = (typeof changeFields)[number];

  const numberFormatter = new Intl.NumberFormat('no-NO');

  type ChangeRequestSubmission = {
    submission_type: string;
    company_id: number | null;
    company_name: string;
    website: string | null;
    ships_to_svalbard: number;
    vat_refund: number;
    shipping_methods: string | null;
    categories: string | null;
    notes: string | null;
    source_url: string | null;
    current_company_name: string | null;
    current_company_website: string | null;
    current_company_ships_to_svalbard: number | null;
    current_company_vat_refund: number | null;
    current_company_shipping_methods: string | null;
    current_company_categories: string | null;
    current_company_notes: string | null;
    current_company_source_url: string | null;
    possible_duplicate_company_id: number | null;
    possible_duplicate_company_name: string | null;
    possible_duplicate_company_website: string | null;
  };

  function formatFieldValue(field: ChangeField, value: unknown): string {
    if (field.kind === 'boolean') {
      return value ? 'Ja' : 'Nei';
    }

    const normalized = String(value ?? '').trim();
    return normalized || 'Ikke satt';
  }

  function formatNumber(value: number): string {
    return numberFormatter.format(value);
  }

  function formatShortDate(value: string): string {
    return new Date(`${value}T00:00:00`).toLocaleDateString('no-NO', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  function dailyBarWidth(views: number): string {
    const maxViews = Math.max(...data.analytics.dailyTotals.map((day) => day.views), 1);
    return `${Math.max(Math.round((views / maxViews) * 100), views > 0 ? 8 : 0)}%`;
  }

  function getChangeRows(submission: ChangeRequestSubmission) {
    if (submission.submission_type !== 'change_request' || !submission.company_id) {
      return [];
    }

    const currentValues: Record<ChangeField['key'], unknown> = {
      company_name: submission.current_company_name,
      website: submission.current_company_website,
      ships_to_svalbard: submission.current_company_ships_to_svalbard,
      vat_refund: submission.current_company_vat_refund,
      shipping_methods: submission.current_company_shipping_methods,
      categories: submission.current_company_categories,
      notes: submission.current_company_notes,
      source_url: submission.current_company_source_url
    };

    const requestedValues = {
      company_name: submission.company_name,
      website: submission.website,
      ships_to_svalbard: submission.ships_to_svalbard,
      vat_refund: submission.vat_refund,
      shipping_methods: submission.shipping_methods,
      categories: submission.categories,
      notes: submission.notes,
      source_url: submission.source_url
    };

    return changeFields
      .map((field) => ({
        ...field,
        currentValue: currentValues[field.key],
        requestedValue: requestedValues[field.key]
      }))
      .filter((field) => field.currentValue !== field.requestedValue)
      .map((field) => ({
        label: field.label,
        currentValue: formatFieldValue(field, field.currentValue),
        requestedValue: formatFieldValue(field, field.requestedValue)
      }));
  }
</script>

<svelte:head>
  <title>Backoffice | Sender til Svalbard</title>
</svelte:head>

{#if form?.message}
  <div class="mb-6 rounded border border-rose/40 bg-rose/10 p-4 font-semibold text-rose">{form.message}</div>
{/if}

<section class="mb-10">
  <div class="mb-4 flex items-end justify-between gap-4">
    <h2 class="font-display text-2xl font-bold text-ice">Sidevisninger</h2>
    <span class="rounded bg-aurora/20 px-3 py-1 text-sm font-bold text-aurora">siste 30 dager</span>
  </div>

  <div class="aurora-panel rounded-lg p-5">
    <div class="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div class="rounded border border-white/10 bg-white/[0.03] p-4">
          <p class="text-sm font-bold text-ice/62">Totalt</p>
          <p class="mt-2 font-display text-4xl font-black text-aurora">{formatNumber(data.analytics.totalLast30Days)}</p>
        </div>
        <div class="rounded border border-white/10 bg-white/[0.03] p-4">
          <p class="text-sm font-bold text-ice/62">I dag</p>
          <p class="mt-2 font-display text-4xl font-black text-violet">{formatNumber(data.analytics.viewsToday)}</p>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <div class="rounded border border-white/10 bg-polar/40 p-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <p class="font-bold text-ice">Mest viste sider</p>
          </div>
          {#if data.analytics.topPages.length === 0}
            <p class="text-sm text-ice/60">Ingen sidevisninger registrert ennå.</p>
          {:else}
            <div class="grid gap-2">
              {#each data.analytics.topPages as page (page.path)}
                <div class="flex items-center justify-between gap-4 rounded border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span class="min-w-0 truncate font-semibold text-ice">{page.path}</span>
                  <span class="shrink-0 text-sm font-bold text-aurora">{formatNumber(page.views)}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <div class="rounded border border-white/10 bg-polar/40 p-4">
          <p class="mb-3 font-bold text-ice">Siste 14 dager</p>
          <div class="grid gap-2">
            {#each data.analytics.dailyTotals as day (day.date)}
              <div class="grid grid-cols-[52px_1fr_48px] items-center gap-3 text-sm">
                <span class="font-semibold text-ice/60">{formatShortDate(day.date)}</span>
                <div class="h-2 overflow-hidden rounded bg-white/10">
                  <div class="h-full rounded bg-aurora" style={`width: ${dailyBarWidth(day.views)}`}></div>
                </div>
                <span class="text-right font-bold text-ice">{formatNumber(day.views)}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

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
              {#if submission.submission_type === 'change_request'}
                {@const changeRows = getChangeRows(submission)}
                <div class="mt-4 rounded border border-white/10 bg-white/[0.03] p-4">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <p class="text-sm font-bold text-ice">Endringer</p>
                    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ice/45">Fra → til</p>
                  </div>
                  {#if changeRows.length === 0}
                    <p class="mt-3 text-sm text-ice/60">Ingen forskjeller mot nåværende firma.</p>
                  {:else}
                    <div class="mt-3 grid gap-2">
                      {#each changeRows as change (change.label)}
                        <div class="rounded border border-white/10 bg-polar/40 p-3">
                          <div class="flex flex-wrap items-center justify-between gap-2">
                            <p class="font-semibold text-ice">{change.label}</p>
                            <span class="rounded bg-aurora/15 px-2 py-0.5 text-xs font-bold text-aurora">Endret</span>
                          </div>
                          <div class="mt-2 grid gap-2 sm:grid-cols-2">
                            <div class="rounded border border-white/10 bg-white/[0.04] p-3">
                              <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-ice/45">Fra</p>
                              <p class="mt-1 text-sm text-ice">{change.currentValue}</p>
                            </div>
                            <div class="rounded border border-aurora/30 bg-aurora/10 p-3">
                              <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-aurora/80">Til</p>
                              <p class="mt-1 text-sm font-semibold text-ice">{change.requestedValue}</p>
                            </div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}
              {#if submission.possible_duplicate_company_id}
                <div class="mt-4 rounded border border-ember/40 bg-ember/10 p-4">
                  <p class="text-sm font-black uppercase tracking-[0.16em] text-ember">Mulig duplikat</p>
                  <p class="mt-2 text-sm text-ice/80">
                    Dette forslaget ligner på
                    <a class="font-bold text-ice underline decoration-ember/60 underline-offset-4 hover:text-ember" href={`/admin/companies/${submission.possible_duplicate_company_id}`}>
                      {submission.possible_duplicate_company_name}
                    </a>.
                  </p>
                  {#if submission.possible_duplicate_company_website}
                    <a
                      class="mt-2 inline-block text-sm font-semibold text-ember hover:text-ice"
                      href={submission.possible_duplicate_company_website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {submission.possible_duplicate_company_website}
                    </a>
                  {/if}
                </div>
              {/if}
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
