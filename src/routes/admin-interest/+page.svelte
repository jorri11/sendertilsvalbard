<script>
  let { form } = $props();
</script>

<svelte:head>
  <title>Jeg vil bidra som admin | Sender til Svalbard</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-10 sm:px-6">
  <div class="mb-8">
    <a class="text-sm font-bold text-aurora hover:text-ice" href="/">Tilbake</a>
    <p class="mt-4 text-sm font-bold uppercase tracking-[0.25em] text-aurora">Bli med</p>
    <h1 class="mt-3 font-display text-4xl font-bold text-ice">Jeg vil bidra som admin</h1>
  </div>

  {#if form?.success}
    <div class="mb-6 rounded border border-aurora/40 bg-aurora/10 p-4 font-semibold text-aurora">Takk! E-posten din er sendt til backoffice.</div>
  {:else if form?.message}
    <div class="mb-6 rounded border border-rose/40 bg-rose/10 p-4 font-semibold text-rose">{form.message}</div>
  {/if}

  <form class="aurora-panel grid gap-5 rounded-lg p-6" method="POST">
    <label class="grid gap-2">
      <span class="font-bold text-ice">E-post</span>
      <input class="rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="email" type="email" required />
    </label>
    <label class="grid gap-2">
      <span class="font-bold text-ice">Melding <span class="ml-2 text-xs font-semibold uppercase tracking-[0.12em] text-ice/50">valgfritt</span></span>
      <textarea class="min-h-28 rounded border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-aurora" name="message"></textarea>
    </label>
    <button class="rounded bg-aurora px-5 py-3 font-black text-polar hover:bg-ice">Send</button>
  </form>
</main>
