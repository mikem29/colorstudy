<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import ColorPicker from '../../../lib/ColorPicker.svelte';

  let imageId = $derived($page.params.id);
  let paletteData = $state(null);
  let loading = $state(true);
  let colorPickerRef;

  async function loadPaletteData() {
    try {
      const response = await fetch(`/api/palettes/${imageId}`);
      const data = await response.json();
      if (data.status === 'success') {
        paletteData = data.data;
      } else {
        goto('/');
      }
    } catch (error) {
      console.error('Error loading palette:', error);
      goto('/');
    } finally {
      loading = false;
    }
  }

  function goBack() {
    goto('/');
  }

  onMount(() => {
    loadPaletteData();
  });
</script>

<svelte:head>
  <title>Palette Editor - {paletteData?.original_name || 'ColorStudy'}</title>
</svelte:head>

{#if loading}
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
    <div class="text-center">
      <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>
      </div>
      <p class="text-gray-600">Loading palette...</p>
    </div>
  </div>
{:else if paletteData}
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <button
              onclick={goBack}
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-arrow-left text-xl"></i>
            </button>
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <i class="fas fa-palette text-white text-xl"></i>
            </div>
          </div>

          <div class="flex items-center space-x-6">
            <!-- Sampling Size Control -->
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">
                <i class="fas fa-crosshairs mr-1"></i>
                Sampling:
              </label>
              <select id="sampling-size" class="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value={1}>Point</option>
                <option value={3}>3×3</option>
                <option value={5} selected>5×5</option>
                <option value={11}>11×11</option>
                <option value={31}>31×31</option>
                <option value={51}>51×51</option>
                <option value={101}>101×101</option>
              </select>
            </div>

            <!-- Color Format Control -->
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">
                <i class="fas fa-palette mr-1"></i>
                Format:
              </label>
              <select id="color-format" class="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="RGB" selected>RGB</option>
                <option value="CMYK">CMYK</option>
              </select>
            </div>

          </div>
        </div>
      </div>
    </header>

    <!-- Drafting Table -->
    <main class="w-full h-full">
      <ColorPicker
        imageSrc="/uploads/{paletteData.filename}"
        {imageId}
        loadSavedSwatches={() => {}}
      />
    </main>
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
    <div class="text-center">
      <div class="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Palette not found</h3>
      <p class="text-gray-600 mb-6">The requested palette could not be loaded.</p>
      <button
        onclick={goBack}
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
      >
        <i class="fas fa-arrow-left mr-2"></i>
        Back to Palettes
      </button>
    </div>
  </div>
{/if}