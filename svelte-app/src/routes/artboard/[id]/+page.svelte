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
  let selectedSwatch = null;
  let selectedSwatchIndex = -1;
  let swatchLabelInput = '';
  let saveTimeout = null;

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

  function handleSwatchClick(swatchData, index) {
    selectedSwatch = swatchData;
    selectedSwatchIndex = index;
    swatchLabelInput = swatchData?.description || '';
  }

  function handleLabelInput() {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Debounce: wait 500ms after user stops typing
    saveTimeout = setTimeout(() => {
      updateSwatchLabel();
    }, 500);
  }

  async function updateSwatchLabel() {
    if (!selectedSwatch || !selectedSwatch.id) return;

    // Optimistic update: update local state immediately
    selectedSwatch.description = swatchLabelInput;

    // Update the swatches array
    swatches = swatches.map(s =>
      s.id === selectedSwatch.id ? { ...s, description: swatchLabelInput } : s
    );

    try {
      const response = await fetch(`/api/swatches/${selectedSwatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: swatchLabelInput
        })
      });

      const result = await response.json();
      if (result.status !== 'success') {
        // If failed, reload to get correct state
        await loadArtboard();
      }
    } catch (error) {
      console.error('Error updating swatch label:', error);
      // Reload on error to restore correct state
      await loadArtboard();
    }
  }
</script>

{#if loading}
  <div class="flex items-center justify-center h-screen">
    <i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
  </div>
{:else if artboard}
  <div class="h-screen flex relative">
    <!-- Floating Back Arrow -->
    <a href="/dashboard" class="absolute top-4 left-4 z-50 bg-white rounded-full p-3 shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all">
      <i class="fas fa-arrow-left"></i>
    </a>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-auto">
      <ColorPicker
        {artboardId}
        artboardName={artboard.name}
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
        onSwatchClick={handleSwatchClick}
      />
    </div>

    <!-- Fixed Right Sidebar -->
    <div class="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-screen z-50 relative shrink-0">
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
              onchange={updatePreferences}
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span class="text-sm text-gray-700">Show connection lines</span>
          </label>
          <label class="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={showColorFormatOnSwatch}
              onchange={updatePreferences}
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span class="text-sm text-gray-700">Show color values on swatches</span>
          </label>
          <p class="text-xs text-gray-500">Display color format values directly on the swatches</p>
        </div>

        <!-- Selected Swatch Editor -->
        {#if selectedSwatch}
          <div class="space-y-3 border-t border-gray-200 pt-6">
            <label class="block text-xs font-medium text-gray-700 uppercase tracking-wide">
              <i class="fas fa-edit mr-2"></i>
              Selected Swatch
            </label>

            <!-- Color Preview -->
            <div class="flex items-center space-x-3">
              <div
                class="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                style="background-color: {selectedSwatch.hexColor};"
              ></div>
              <div class="flex-1">
                <p class="text-xs font-mono text-gray-600">
                  {colorFormat === 'RGB'
                    ? `RGB(${selectedSwatch.red}, ${selectedSwatch.green}, ${selectedSwatch.blue})`
                    : selectedSwatch.cmyk
                  }
                </p>
                <p class="text-xs text-gray-500">{selectedSwatch.hexColor}</p>
              </div>
            </div>

            <!-- Label Input -->
            <div>
              <label for="swatchLabel" class="block text-xs font-medium text-gray-600 mb-1">
                Label
              </label>
              <input
                id="swatchLabel"
                type="text"
                bind:value={swatchLabelInput}
                oninput={handleLabelInput}
                placeholder="Enter swatch label..."
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        {/if}
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