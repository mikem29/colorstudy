<script>
  import { onMount } from 'svelte';
  import ColorPicker from '$lib/ColorPicker.svelte';
  import { page } from '$app/stores';

  export let data;

  let artboard = null;
  let images = [];
  let swatches = [];
  let loading = true;
  let uploadingImage = false;
  let showConnectionLines = true;
  let showColorFormatOnSwatch = true;
  let samplingSize = 1;
  let colorFormat = 'RGB';

  $: artboardId = $page.params.id;

  onMount(() => {
    loadArtboard();
    loadPreferences();
  });

  async function loadPreferences() {
    try {
      const response = await fetch(`/api/artboards/${artboardId}/preferences`);
      const result = await response.json();
      if (result.status === 'success') {
        showConnectionLines = result.data.show_connection_lines;
        showColorFormatOnSwatch = result.data.show_color_format_on_swatch;
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  async function updatePreferences() {
    try {
      await fetch(`/api/artboards/${artboardId}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          show_connection_lines: showConnectionLines,
          show_color_format_on_swatch: showColorFormatOnSwatch
        })
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }

  async function loadArtboard() {
    try {
      const response = await fetch(`/api/artboards/${artboardId}`);
      const result = await response.json();

      if (result.status === 'success') {
        artboard = result.data.artboard;
        images = result.data.images;
        swatches = result.data.swatches;
      }
    } catch (error) {
      console.error('Error loading artboard:', error);
    } finally {
      loading = false;
    }
  }

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    uploadingImage = true;
    try {
      // Upload the image file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.status === 'success') {
        // Add image to artboard
        const response = await fetch(`/api/artboards/${artboardId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: uploadResult.filename,
            image_width: 400, // Default size
            image_height: 300
          })
        });

        const result = await response.json();
        if (result.status === 'success') {
          await loadArtboard(); // Reload to get updated data
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      uploadingImage = false;
    }
  }

  function handleSwatchCreated() {
    loadArtboard(); // Reload to get updated swatches
  }
</script>

{#if loading}
  <div class="flex items-center justify-center h-screen">
    <i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
  </div>
{:else if artboard}
  <div class="h-screen overflow-hidden flex relative">
    <!-- Floating Back Arrow -->
    <a href="/dashboard" class="absolute top-4 left-4 z-50 bg-white rounded-full p-3 shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all">
      <i class="fas fa-arrow-left"></i>
    </a>

    <!-- Main Content Area -->
    <div class="flex-1">
      <ColorPicker
        {artboardId}
        artboardWidth={artboard.width_inches}
        artboardHeight={artboard.height_inches}
        existingImages={images}
        existingSwatches={swatches}
        enableMultipleImages={true}
        {showConnectionLines}
        {showColorFormatOnSwatch}
        {samplingSize}
        {colorFormat}
        onSwatchCreated={handleSwatchCreated}
        onImageUpload={handleFileUpload}
      />
    </div>

    <!-- Fixed Right Sidebar -->
    <div class="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-screen">
      <!-- Sidebar Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <!-- Sample Size Control -->
        <div class="space-y-3">
          <label class="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            <i class="fas fa-crosshairs mr-2"></i>
            Sample Size
          </label>
          <select bind:value={samplingSize} class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value={1}>Point Sample</option>
            <option value={3}>3 by 3 Average</option>
            <option value={5}>5 by 5 Average</option>
            <option value={11}>11 by 11 Average</option>
            <option value={31}>31 by 31 Average</option>
            <option value={51}>51 by 51 Average</option>
            <option value={101}>101 by 101 Average</option>
          </select>
          <p class="text-xs text-gray-500">Controls the area used for color sampling</p>
        </div>

        <!-- Color Format Control -->
        <div class="space-y-3">
          <label class="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            <i class="fas fa-palette mr-2"></i>
            Color Format
          </label>
          <select bind:value={colorFormat} class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="RGB">RGB</option>
            <option value="CMYK">CMYK</option>
          </select>
          <p class="text-xs text-gray-500">Choose between RGB and CMYK color formats</p>
        </div>

        <!-- Show Connection Lines -->
        <div class="space-y-3">
          <label class="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            <i class="fas fa-link mr-2"></i>
            Display Options
          </label>
          <label class="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={showConnectionLines}
              on:change={updatePreferences}
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span class="text-sm text-gray-700">Show connection lines</span>
          </label>
          <label class="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={showColorFormatOnSwatch}
              on:change={updatePreferences}
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span class="text-sm text-gray-700">Show color values on swatches</span>
          </label>
          <p class="text-xs text-gray-500">Display color format values directly on the swatches</p>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center h-screen">
    <div class="text-center">
      <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
      <p class="text-xl">Artboard not found</p>
    </div>
  </div>
{/if}