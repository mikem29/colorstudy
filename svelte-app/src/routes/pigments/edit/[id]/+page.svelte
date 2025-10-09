<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let pigmentId = null;
  let formData = {
    name: '',
    color_hex: '#FFFFFF',
    r: 255,
    g: 255,
    b: 255,
    type: 'Base',
    description: '',
    palette_id: null
  };

  let successMessage = '';
  let errorMessage = '';
  let loading = true;

  onMount(async () => {
    // Get pigment ID from URL
    const pathParts = window.location.pathname.split('/');
    pigmentId = parseInt(pathParts[pathParts.length - 1]);

    // Get palette_id from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const paletteParam = urlParams.get('palette');

    // Load pigment data
    await loadPigment();

    // Override palette if provided in URL
    if (paletteParam) {
      formData.palette_id = parseInt(paletteParam);
    }

    loading = false;
  });

  async function loadPigment() {
    try {
      const response = await fetch(`/api/pigments/${pigmentId}`);
      const result = await response.json();

      if (result.status === 'success') {
        const pigment = result.data;
        formData = {
          name: pigment.name,
          color_hex: pigment.color_hex,
          r: pigment.r,
          g: pigment.g,
          b: pigment.b,
          type: pigment.type,
          description: pigment.description || '',
          palette_id: pigment.palette_id
        };
      } else {
        errorMessage = 'Failed to load pigment';
      }
    } catch (err) {
      errorMessage = 'An error occurred while loading the pigment';
      console.error(err);
    }
  }

  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  function handleHexChange() {
    if (formData.color_hex.length === 7) {
      const rgb = hexToRgb(formData.color_hex);
      formData.r = rgb.r;
      formData.g = rgb.g;
      formData.b = rgb.b;
    }
  }

  function handleRgbChange() {
    if (formData.r !== undefined && formData.g !== undefined && formData.b !== undefined) {
      const r = Math.max(0, Math.min(255, parseInt(formData.r.toString()) || 0));
      const g = Math.max(0, Math.min(255, parseInt(formData.g.toString()) || 0));
      const b = Math.max(0, Math.min(255, parseInt(formData.b.toString()) || 0));
      formData.r = r;
      formData.g = g;
      formData.b = b;
      formData.color_hex = rgbToHex(r, g, b);
    }
  }

  async function handleSubmit() {
    successMessage = '';
    errorMessage = '';

    try {
      const response = await fetch(`/api/pigments/${pigmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.status === 'success') {
        successMessage = 'Pigment updated successfully!';
        // Redirect to mixer after 1.5 seconds
        setTimeout(() => {
          goto(`/pigments/mixer?palette=${formData.palette_id}`);
        }, 1500);
      } else {
        errorMessage = result.message || 'Failed to update pigment';
      }
    } catch (err) {
      errorMessage = 'An error occurred while updating the pigment';
      console.error(err);
    }
  }
</script>

<div class="max-w-2xl mx-auto p-8">
  <h1 class="text-3xl font-bold text-gray-900 mb-6 text-center">Edit Pigment</h1>

  {#if loading}
    <div class="flex items-center justify-center p-12">
      <i class="fas fa-spinner fa-spin text-4xl text-indigo-600"></i>
    </div>
  {:else}
    {#if successMessage}
      <div class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        <i class="fas fa-check-circle mr-2"></i>
        {successMessage}
      </div>
    {/if}

    {#if errorMessage}
      <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <i class="fas fa-exclamation-circle mr-2"></i>
        {errorMessage}
      </div>
    {/if}

    <div class="mb-6 flex justify-center">
      <div
        class="w-24 h-24 border-2 border-gray-300 rounded-lg shadow-md"
        style="background-color: {formData.color_hex};"
      ></div>
    </div>

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <!-- Hidden palette field -->
      <input type="hidden" bind:value={formData.palette_id} />

      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Pigment Name <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          bind:value={formData.name}
          required
          placeholder="e.g., Cadmium Yellow"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label for="color_hex" class="block text-sm font-medium text-gray-700 mb-1">
          Color Hex <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="color_hex"
          bind:value={formData.color_hex}
          on:input={handleHexChange}
          required
          placeholder="#RRGGBB"
          pattern="^#[0-9A-Fa-f]{6}$"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <label for="r" class="block text-sm font-medium text-gray-700 mb-1">
            Red <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            id="r"
            bind:value={formData.r}
            on:input={handleRgbChange}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="g" class="block text-sm font-medium text-gray-700 mb-1">
            Green <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            id="g"
            bind:value={formData.g}
            on:input={handleRgbChange}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="b" class="block text-sm font-medium text-gray-700 mb-1">
            Blue <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            id="b"
            bind:value={formData.b}
            on:input={handleRgbChange}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          id="type"
          bind:value={formData.type}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Base">Base</option>
          <option value="White">White</option>
          <option value="Black">Black</option>
          <option value="Tint">Tint</option>
        </select>
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          bind:value={formData.description}
          rows="3"
          placeholder="Optional notes about this pigment..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          class="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        >
          <i class="fas fa-save mr-2"></i>
          Update Pigment
        </button>
        <button
          type="button"
          on:click={() => goto(`/pigments/mixer?palette=${formData.palette_id}`)}
          class="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
      </div>
    </form>
  {/if}
</div>
