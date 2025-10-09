<script>
  import { onMount } from 'svelte';

  let pigments = [];
  let colorPalettes = [];
  let selectedPaletteId = null;
  let selectedPigments = {};
  let loading = true;
  let virtualMixColor = '#ffffff';
  let analogMixColor = '#ffffff';
  let targetMixColor = '#ffffff';
  let finalRgbInput = '';
  let showLimitModal = false;
  let isGenerating = false;
  let generationProgress = 0;
  let generationStats = { generated: 0, total: 0 };

  onMount(async () => {
    await loadPalettes();
    await loadPigments();

    // Check for palette query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const paletteParam = urlParams.get('palette');
    if (paletteParam) {
      selectedPaletteId = parseInt(paletteParam);
    }
  });

  async function loadPalettes() {
    try {
      const response = await fetch('/api/palettes/color-palettes');
      const result = await response.json();
      if (result.status === 'success') {
        colorPalettes = result.data;
        // Select first palette by default
        if (colorPalettes.length > 0) {
          selectedPaletteId = colorPalettes[0].id;
        }
      }
    } catch (err) {
      console.error('Error loading palettes:', err);
    }
  }

  async function loadPigments() {
    try {
      const response = await fetch('/api/pigments');
      const result = await response.json();
      if (result.status === 'success') {
        pigments = result.data;
      }
    } catch (err) {
      console.error('Error loading pigments:', err);
    } finally {
      loading = false;
    }
  }

  // Filter pigments by selected palette
  $: filteredPigments = selectedPaletteId
    ? pigments.filter(p => p.palette_id === selectedPaletteId)
    : pigments;

  function handleSliderChange(pigmentId, value, pigment) {
    if (value > 0) {
      selectedPigments[pigmentId] = {
        id: pigmentId,
        name: pigment.name,
        value: value,
        rgb: [pigment.r, pigment.g, pigment.b],
        hex: pigment.color_hex
      };
    } else {
      delete selectedPigments[pigmentId];
    }

    // Check limit
    const selectedCount = Object.keys(selectedPigments).length;
    if (selectedCount > 5) {
      showLimitModal = true;
      delete selectedPigments[pigmentId];
      // Reset the slider
      const slider = document.getElementById(`slider-${pigmentId}`);
      if (slider) slider.value = 0;
      return;
    }

    updateVirtualMix();

    // Auto-save if more than one pigment selected
    if (selectedCount > 1) {
      saveCurrentMix('virtual');
    }
  }

  function updateVirtualMix() {
    const selectedArray = Object.values(selectedPigments);

    if (selectedArray.length === 0) {
      virtualMixColor = '#ffffff';
      return;
    }

    // Calculate using mixbox.js if available
    if (typeof mixbox !== 'undefined') {
      const latents = [];
      const weights = [];
      const totalParts = selectedArray.reduce((acc, p) => acc + p.value, 0);

      selectedArray.forEach(pigment => {
        const weight = pigment.value / totalParts;
        const latent = mixbox.rgbToLatent(pigment.rgb);
        latents.push(latent);
        weights.push(weight);
      });

      // Initialize mixed latent
      const mixedLatent = new Array(mixbox.LATENT_SIZE).fill(0);

      // Mix the latents
      for (let i = 0; i < mixbox.LATENT_SIZE; i++) {
        for (let j = 0; j < latents.length; j++) {
          mixedLatent[i] += weights[j] * latents[j][i];
        }
      }

      // Convert back to RGB
      const mixedRgb = mixbox.latentToRgb(mixedLatent);
      virtualMixColor = `rgb(${mixedRgb[0]}, ${mixedRgb[1]}, ${mixedRgb[2]})`;
    } else {
      // Fallback to simple averaging
      const totalParts = selectedArray.reduce((acc, p) => acc + p.value, 0);
      let r = 0, g = 0, b = 0;

      selectedArray.forEach(pigment => {
        const weight = pigment.value / totalParts;
        r += pigment.rgb[0] * weight;
        g += pigment.rgb[1] * weight;
        b += pigment.rgb[2] * weight;
      });

      virtualMixColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
  }

  async function saveCurrentMix(type = 'virtual') {
    const selectedArray = Object.values(selectedPigments);
    if (selectedArray.length < 2) return;

    const totalParts = selectedArray.reduce((acc, p) => acc + p.value, 0);
    const pigmentData = selectedArray.map(p => ({
      pigment_id: p.id,
      parts: p.value,
      percentage: ((p.value / totalParts) * 100).toFixed(2)
    }));

    let finalRgb;
    if (type === 'virtual') {
      // Extract RGB from virtualMixColor
      const match = virtualMixColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        finalRgb = `${match[1]},${match[2]},${match[3]}`;
      } else {
        finalRgb = '255,255,255';
      }
    } else {
      finalRgb = finalRgbInput.trim();
    }

    try {
      await fetch('/api/pigments/mixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          finalRgb,
          pigments: pigmentData
        })
      });
    } catch (err) {
      console.error('Error saving mix:', err);
    }
  }

  function resetSwatches() {
    selectedPigments = {};
    virtualMixColor = '#ffffff';
    analogMixColor = '#ffffff';
    finalRgbInput = '';

    // Reset all sliders
    document.querySelectorAll('input[type="range"]').forEach(slider => {
      slider.value = 0;
    });
  }

  function handleAnalogSave() {
    if (finalRgbInput.match(/^\d{1,3},\d{1,3},\d{1,3}$/)) {
      saveCurrentMix('analog');
      const [r, g, b] = finalRgbInput.split(',').map(v => parseInt(v.trim()));
      analogMixColor = `rgb(${r}, ${g}, ${b})`;
    } else {
      alert('Please enter a valid RGB value in the format R,G,B (e.g., 255,165,0)');
    }
  }

  function handleAnalogInputChange() {
    if (finalRgbInput.match(/^\d{1,3},\d{1,3},\d{1,3}$/)) {
      const [r, g, b] = finalRgbInput.split(',').map(v => parseInt(v.trim()));
      analogMixColor = `rgb(${r}, ${g}, ${b})`;
    } else {
      analogMixColor = '#ffffff';
    }
  }

  $: totalParts = Object.values(selectedPigments).reduce((acc, p) => acc + p.value, 0);
  $: selectedArray = Object.values(selectedPigments);

  async function generateAllMixes() {
    if (!confirm('This will generate ~1.35 million color mixes. This may take several minutes. Continue?')) {
      return;
    }

    isGenerating = true;
    generationProgress = 0;
    generationStats = { generated: 0, total: 0 };

    try {
      let batch = 0;
      let isComplete = false;

      while (!isComplete) {
        const response = await fetch('/api/pigments/generate-all-mixes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maxPigments: 3, batch, batchSize: 1000 })
        });

        const result = await response.json();

        if (result.status === 'success') {
          generationProgress = parseFloat(result.progress);
          generationStats = {
            generated: result.currentIndex,
            total: result.totalCombinations
          };
          isComplete = result.isComplete;
          batch = result.nextBatch || 0;
        } else {
          throw new Error(result.message || 'Failed to generate mixes');
        }
      }

      alert(`Successfully generated ${generationStats.generated.toLocaleString()} color mixes!`);
    } catch (err) {
      console.error('Error generating mixes:', err);
      alert('Error generating mixes. Check console for details.');
    } finally {
      isGenerating = false;
    }
  }
</script>

<div class="flex h-[calc(100vh-4rem)]">
  <!-- Left Sidebar -->
  <div class="w-80 bg-white border-r shadow-sm flex flex-col">
    <div class="p-4 space-y-4">
      <!-- Swatches -->
      <div class="flex justify-around items-center">
        <div class="text-center">
          <div class="w-16 h-16 rounded border-2 border-gray-300 shadow-md" style="background-color: {targetMixColor};"></div>
          <div class="text-xs text-gray-600 mt-1">Target Mix</div>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 rounded border-2 border-gray-300 shadow-md" style="background-color: {virtualMixColor};"></div>
          <div class="text-xs text-gray-600 mt-1">Virtual Mix</div>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 rounded border-2 border-gray-300 shadow-md" style="background-color: {analogMixColor};"></div>
          <div class="text-xs text-gray-600 mt-1">Analog Mix</div>
        </div>
      </div>

      <!-- Reset Button -->
      <div class="text-center">
        <button on:click={resetSwatches} class="text-gray-600 hover:text-gray-900">
          <i class="fas fa-sync-alt mr-1"></i>
          <span class="text-sm">Reset</span>
        </button>
      </div>

      <!-- Selected Pigments List -->
      <div class="border rounded-lg p-3">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Selected Pigments</h3>
        {#if selectedArray.length === 0}
          <p class="text-xs text-gray-500 italic">No pigments selected.</p>
        {:else}
          <ul class="space-y-1 text-xs">
            {#each selectedArray as pigment}
              {@const percentage = Math.round((pigment.value / totalParts) * 100)}
              <li class="text-gray-700">
                {pigment.value} {pigment.value === 1 ? 'Part' : 'Parts'} {pigment.name} ({percentage}%)
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <!-- Analog Mix Input -->
      <div class="space-y-2">
        <label for="final-rgb" class="block text-sm font-medium text-gray-700">
          Analog RGB Value
        </label>
        <input
          id="final-rgb"
          type="text"
          bind:value={finalRgbInput}
          on:input={handleAnalogInputChange}
          placeholder="e.g., 255,165,0"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          on:click={handleAnalogSave}
          class="w-full bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <i class="fas fa-save mr-1"></i>
          Save Analog Mix
        </button>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex-1 overflow-auto p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-2xl font-bold text-gray-900">Pigment Mixer</h1>
          <button
            on:click={generateAllMixes}
            disabled={isGenerating}
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {#if isGenerating}
              <i class="fas fa-spinner fa-spin"></i>
              Generating... {generationProgress.toFixed(1)}%
            {:else}
              <i class="fas fa-magic"></i>
              Generate All Mixes
            {/if}
          </button>
        </div>

        <!-- Palette Selector -->
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">Color Palette:</label>
          <select
            bind:value={selectedPaletteId}
            on:change={() => selectedPigments = {}}
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {#each colorPalettes as palette}
              <option value={palette.id}>
                {palette.name} ({palette.pigment_count} pigments, {palette.mix_count} mixes)
              </option>
            {/each}
          </select>
        </div>
      </div>

      {#if isGenerating}
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-blue-900">Generating color database...</span>
            <span class="text-sm text-blue-700">{generationStats.generated.toLocaleString()} / {generationStats.total.toLocaleString()}</span>
          </div>
          <div class="w-full bg-blue-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: {generationProgress}%"></div>
          </div>
        </div>
      {/if}

      {#if loading}
        <div class="flex items-center justify-center p-12">
          <i class="fas fa-spinner fa-spin text-4xl text-indigo-600"></i>
        </div>
      {:else if filteredPigments.length === 0}
        <div class="text-center p-12">
          <i class="fas fa-palette text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-600 mb-4">No pigments in this palette yet.</p>
          <a href="/pigments/add" class="text-indigo-600 hover:text-indigo-700">
            <i class="fas fa-plus mr-1"></i>
            Add pigments to this palette
          </a>
        </div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {#each filteredPigments as pigment}
            <div class="border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col items-center">
              <!-- Color Swatch -->
              <div class="w-full h-16 rounded mb-3" style="background-color: {pigment.color_hex};"></div>

              <!-- Pigment Name -->
              <div class="text-center text-sm font-medium text-gray-900 mb-3">
                {pigment.name}
              </div>

              <!-- Slider -->
              <div class="w-full">
                <input
                  id="slider-{pigment.pigment_id}"
                  type="range"
                  min="0"
                  max="10"
                  value="0"
                  on:input={(e) => handleSliderChange(pigment.pigment_id, parseInt(e.target.value), pigment)}
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style="accent-color: {pigment.color_hex};"
                />
                <div class="text-center text-xs text-gray-500 mt-1">
                  {selectedPigments[pigment.pigment_id]?.value || 0} parts
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Limit Modal -->
{#if showLimitModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-md">
      <div class="flex items-center mb-4">
        <i class="fas fa-palette text-2xl text-indigo-600 mr-3"></i>
        <h2 class="text-xl font-bold text-gray-900">Mixing Limit</h2>
      </div>
      <div class="mb-6">
        <p class="text-gray-700 mb-2">
          <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
          For a balanced and professional mix, please limit your selection.
        </p>
        <p class="text-gray-600 text-sm">
          Think like a professional oil painter: simplicity is key!
        </p>
      </div>
      <button
        on:click={() => showLimitModal = false}
        class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Got it!
      </button>
    </div>
  </div>
{/if}

<style>
  /* Custom slider styles */
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: currentColor;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 0 2px rgba(0,0,0,0.3);
  }

  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: currentColor;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 0 2px rgba(0,0,0,0.3);
  }
</style>
