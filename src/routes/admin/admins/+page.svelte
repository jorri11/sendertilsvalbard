<script>
  let { data, form } = $props();
</script>

<svelte:head>
  <title>Admins | Sender til Svalbard</title>
</svelte:head>

<div class="mb-6">
  <a class="text-sm font-bold text-aurora hover:text-ice" href="/admin"
    >Tilbake</a
  >
  <h2 class="mt-2 font-display text-3xl font-bold text-ice">Admins</h2>
</div>

{#if form?.success}
  <div
    class="mb-6 rounded border border-aurora/40 bg-aurora/10 p-4 font-semibold text-aurora"
  >
    Adminbruker opprettet.
  </div>
{:else if form?.approved}
  <div
    class="mb-6 rounded border border-aurora/40 bg-aurora/10 p-4 font-semibold text-aurora"
  >
    Adminforespørselen er godkjent og bruker er opprettet.
  </div>
{:else if form?.denied}
  <div
    class="mb-6 rounded border border-rose/40 bg-rose/10 p-4 font-semibold text-rose"
  >
    Adminforespørselen er avslått.
  </div>
{:else if form?.message}
  <div
    class="mb-6 rounded border border-rose/40 bg-rose/10 p-4 font-semibold text-rose"
  >
    {form.message}
  </div>
{/if}

<section class="mb-6 aurora-panel rounded-lg p-6">
  <div class="mb-5 flex items-end justify-between gap-4">
    <h3 class="font-display text-2xl font-bold text-ice">
      Vil bidra som admin
    </h3>
    <span class="rounded bg-violet/20 px-3 py-1 text-sm font-bold text-violet"
      >{data.adminRequests.length} venter</span
    >
  </div>
  {#if data.adminRequests.length === 0}
    <p class="text-ice/70">Ingen nye adminforespørsler.</p>
  {:else}
    <div class="grid gap-3">
      {#each data.adminRequests as request (request.id)}
        <div class="rounded border border-white/10 bg-white/[0.04] p-4">
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <p class="font-bold text-ice">{request.email}</p>
              {#if request.message}
                <p class="mt-2 text-sm text-ice/70">{request.message}</p>
              {/if}
              <p class="mt-2 text-xs text-ice/50">
                {new Date(request.created_at).toLocaleDateString("no-NO")}
              </p>
            </div>
            <div class="grid gap-2 sm:min-w-64">
              <form class="grid gap-2" method="POST" action="?/approveRequest">
                <input name="id" type="hidden" value={request.id} />
                <input
                  class="rounded border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none focus:border-aurora"
                  name="password"
                  type="password"
                  minlength="12"
                  placeholder="Passord"
                  required
                />
                <button
                  class="rounded bg-aurora px-3 py-2 text-sm font-black text-polar hover:bg-ice"
                  >Godkjenn og opprett</button
                >
              </form>
              <form method="POST" action="?/denyRequest">
                <input name="id" type="hidden" value={request.id} />
                <button
                  class="w-full rounded border border-white/10 px-3 py-2 text-sm font-bold hover:border-rose hover:text-rose"
                  >Avslå</button
                >
              </form>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<div class="grid gap-6 lg:grid-cols-[1fr_1fr]">
  <form
    class="aurora-panel grid gap-5 rounded-lg p-6"
    method="POST"
    action="?/create"
  >
    <h3 class="font-display text-2xl font-bold text-ice">Ny admin</h3>
    <label class="grid gap-2">
      <span class="font-bold text-ice">E-post</span>
      <input
        class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora"
        name="email"
        type="email"
        value={form?.email ?? ""}
        required
      />
    </label>
    <label class="grid gap-2">
      <span class="font-bold text-ice">Passord</span>
      <input
        class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora"
        name="password"
        type="password"
        minlength="12"
        required
      />
    </label>
    <button
      class="rounded bg-aurora px-5 py-3 font-black text-polar hover:bg-ice"
      >Opprett admin</button
    >
  </form>

  <section class="aurora-panel rounded-lg p-6">
    <h3 class="font-display text-2xl font-bold text-ice">
      Eksisterende admins
    </h3>
    <div class="mt-5 grid gap-3">
      {#each data.users as user (user.id)}
        <div class="rounded border border-white/10 bg-white/[0.04] p-4">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-bold text-ice">{user.email}</p>
            {#if user.is_superuser}
              <span class="rounded bg-ember/20 px-2 py-0.5 text-xs font-black uppercase tracking-[0.12em] text-ember">Superbruker</span>
            {/if}
          </div>
          <p class="mt-1 text-sm text-ice/60">
            Opprettet {new Date(user.created_at).toLocaleDateString("no-NO")}
          </p>
        </div>
      {/each}
    </div>
  </section>
</div>
