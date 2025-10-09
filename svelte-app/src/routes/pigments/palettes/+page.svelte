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
      const response = await fetch('/api/palettes/color-palettes');
      const result = await response.json();
      if (result.status === 'success') {
        palettes = result.data;

        // Load pigments for each palette
        for (let palette of palettes) {
          await loadPalettePigments(palette);
        }
      }
    } catch (err) {
      console.error('Error loading palettes:', err);
    } finally {
      loading = false;
    }
  }

  async function loadPalettePigments(palette) {
    try {
      const response = await fetch('/api/pigments');
      const result = await response.json();
      if (result.status === 'success') {
        // Filter pigments for this palette
        palette.pigments = result.data.filter(p => p.palette_id === palette.id);
      }
    } catch (err) {
      console.error('Error loading pigments for palette:', err);
      palette.pigments = [];
    }
  }

  function openPalette(paletteId) {
    goto(`/pigments?palette=${paletteId}`);
  }
</script>

<div class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Color Palettes</h1>
      <p class="text-gray-600">Browse and explore available paint palettes</p>
    </div>

    {#if loading}
      <div class="flex items-center justify-center p-12">
        <i class="fas fa-spinner fa-spin text-4xl text-indigo-600"></i>
      </div>
    {:else if palettes.length === 0}
      <div class="text-center p-12">
        <i class="fas fa-palette text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-600">No palettes found</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each palettes as palette}
          <div
            class="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
            on:click={() => openPalette(palette.id)}
            on:keydown={(e) => e.key === 'Enter' && openPalette(palette.id)}
            role="button"
            tabindex="0"
          >
            <!-- Palette Header -->
            <div class="p-6 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-gray-900 mb-1">
                {palette.name}
              </h3>
              {#if palette.description}
                <p class="text-sm text-gray-600">{palette.description}</p>
              {/if}
              <div class="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>
                  <i class="fas fa-palette mr-1"></i>
                  {palette.pigment_count} pigments
                </span>
                <span>
                  <i class="fas fa-flask mr-1"></i>
                  {palette.mix_count.toLocaleString()} mixes
                </span>
                <span class="capitalize">
                  <i class="fas fa-tag mr-1"></i>
                  {palette.type}
                </span>
              </div>
            </div>

            <!-- Color Swatches Grid -->
            <div class="p-6">
              {#if palette.pigments && palette.pigments.length > 0}
                <div class="flex flex-wrap gap-2">
                  {#each palette.pigments as pigment}
                    <div
                      class="w-12 h-12 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110"
                      style="background-color: {pigment.color_hex};"
                      title={pigment.name}
                    ></div>
                  {/each}
                </div>
              {:else}
                <p class="text-sm text-gray-400 italic">No pigments yet</p>
              {/if}
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">
                  {#if palette.is_public}
                    <i class="fas fa-globe mr-1"></i> Public
                  {:else}
                    <i class="fas fa-lock mr-1"></i> Private
                  {/if}
                </span>
                <span class="text-indigo-600 font-medium">
                  Open Mixer <i class="fas fa-arrow-right ml-1"></i>
                </span>
              </div>
            </div>
          </div>
        {/each}
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
