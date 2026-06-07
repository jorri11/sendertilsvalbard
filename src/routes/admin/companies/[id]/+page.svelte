<script>
  import CompanyForm from '$lib/CompanyForm.svelte';

  let { data, form } = $props();
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

<CompanyForm company={data.company} submitLabel="Lagre endringer" />
