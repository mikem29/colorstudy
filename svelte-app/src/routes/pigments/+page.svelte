<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let palettes = [];
  let loading = true;

  onMount(async () => {
    await loadPalettes();
  });

  async function loadPalettes() {
    try {
      console.log('Fetching palettes...');
      const response = await fetch('/api/palettes/color-palettes');
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Result:', result);
      if (result.status === 'success') {
        palettes = result.data;
        console.log('Palettes loaded:', palettes);
      } else {
        console.error('Failed to load palettes:', result);
      }
    } catch (err) {
      console.error('Error loading palettes:', err);
    } finally {
      loading = false;
    }
  }

  function openPalette(paletteId) {
    goto(`/pigments/mixer?palette=${paletteId}`);
  }

  async function deletePalette(paletteId, paletteName) {
    if (!confirm(`Are you sure you want to delete "${paletteName}"? This will also delete all pigments and mixes in this palette.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/palettes/color-palettes/${paletteId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Reload palettes
        await loadPalettes();
      } else {
        alert(`Failed to delete palette: ${result.message}`);
      }
    } catch (err) {
      console.error('Error deleting palette:', err);
      alert('An error occurred while deleting the palette');
    }
  }
</script>

<div class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto p-8">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Color Palettes</h1>
        <p class="text-gray-600">Browse and explore available paint palettes</p>
      </div>
      <a
        href="/pigments/palettes/add"
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
      >
        <i class="fas fa-plus mr-2"></i>
        New Palette
      </a>
    </div>

    {#if loading}
      <div class="flex items-center justify-center p-12">
        <i class="fas fa-spinner fa-spin text-4xl text-indigo-600"></i>
        <p class="ml-4 text-gray-600">Loading palettes...</p>
      </div>
    {:else if palettes.length === 0}
      <div class="text-center p-12 bg-white rounded-lg border border-gray-200">
        <i class="fas fa-palette text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-600 mb-2">No palettes found</p>
        <p class="text-sm text-gray-500">Check browser console for debug info</p>
      </div>
    {:else}
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <p class="text-sm text-gray-500 mb-4">Found {palettes.length} palette(s)</p>
        <div class="space-y-4">
          {#each palettes as palette}
            <div class="border-b border-gray-200 pb-4 last:border-0">
              <h3 class="text-lg font-semibold text-gray-900">
                {palette.name}
              </h3>
              <p class="text-sm text-gray-600 mt-1">
                ID: {palette.id} | Type: {palette.type} | Public: {palette.is_public}
              </p>
              {#if palette.description}
                <p class="text-sm text-gray-600 mt-1">{palette.description}</p>
              {/if}
              <p class="text-xs text-gray-500 mt-2">
                Pigments: {(palette.pigment_count || 0).toLocaleString()} | Mixes: {(palette.mix_count || 0).toLocaleString()}
              </p>
              <div class="flex gap-2 mt-3">
                <button
                  on:click={() => openPalette(palette.id)}
                  class="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <i class="fas fa-palette mr-1"></i>
                  Open Mixer →
                </button>
                <button
                  on:click={(e) => {
                    e.stopPropagation();
                    deletePalette(palette.id, palette.name);
                  }}
                  class="text-sm text-red-600 hover:text-red-800"
                >
                  <i class="fas fa-trash mr-1"></i>
                  Delete
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  [role="button"]:focus {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }
</style>
