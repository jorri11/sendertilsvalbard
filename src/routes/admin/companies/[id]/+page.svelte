<script lang="ts">
  import CompanyForm from '$lib/CompanyForm.svelte';

  let { data, form } = $props();

  function confirmDelete(event: SubmitEvent) {
    if (!confirm(`Slette ${data.company.name}?`)) {
      event.preventDefault();
    }
  }
</script>

<svelte:head>
  <title>Rediger {data.company.name} | Sender til Svalbard</title>
</svelte:head>

{#if form?.message}
  <div class="mb-6 rounded border border-rose/40 bg-rose/10 p-4 font-semibold text-rose">{form.message}</div>
{/if}

<div class="mb-6">
  <a class="text-sm font-bold text-aurora hover:text-ice" href="/admin">Tilbake</a>
  <h2 class="mt-2 font-display text-3xl font-bold text-ice">Rediger {data.company.name}</h2>
</div>

<CompanyForm company={data.company} submitLabel="Lagre endringer" action="?/save" />

<section class="mt-8 rounded-lg border border-rose/40 bg-rose/10 p-6">
  <h3 class="font-display text-xl font-bold text-ice">Slett firma</h3>
  <p class="mt-2 max-w-2xl text-sm text-ice/70">
    Firmaet fjernes fra listene, men historikken beholdes i databasen.
  </p>
  <form class="mt-4" method="POST" action="?/delete" onsubmit={confirmDelete}>
    <button class="rounded border border-rose/60 px-4 py-2 font-bold text-rose hover:bg-rose hover:text-polar">
      Slett firma
    </button>
  </form>
</section>
