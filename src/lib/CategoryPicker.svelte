<script>
  import { companyCategories, selectedCategories } from '$lib/categories';

  let { value = '', legend = 'Kategorier (valgfritt)' } = $props();
  let selected = $derived(new Set(selectedCategories(value)));
</script>

<fieldset class="grid gap-3">
  <legend class="font-bold text-ice">{legend}</legend>
  <div class="grid gap-2 sm:grid-cols-2">
    {#each companyCategories as category (category)}
      <label class="flex min-h-12 items-center gap-3 rounded border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-ice/86">
        <input class="h-4 w-4 shrink-0 accent-aurora" name="categories" type="checkbox" value={category} checked={selected.has(category)} />
        <span>{category}</span>
      </label>
    {/each}
  </div>
</fieldset>
