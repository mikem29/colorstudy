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

  $: artboardId = $page.params.id;

  onMount(() => {
    loadArtboard();
  });

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
  <div class="h-screen overflow-hidden">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <a href="/" class="text-gray-600 hover:text-gray-900">
          <i class="fas fa-arrow-left"></i>
        </a>
        <h1 class="text-xl font-bold">{artboard.name}</h1>
        <span class="text-sm text-gray-500">
          {artboard.width_inches}" × {artboard.height_inches}"
        </span>
      </div>

      <!-- Controls -->
      <div class="flex items-center space-x-4">
        <!-- Sample Size Control -->
        <div class="flex items-center space-x-2">
          <i class="fas fa-crosshairs text-gray-500 text-sm" title="Sample Size - Controls the area used for color sampling"></i>
          <select class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="1">1x1 (Point)</option>
            <option value="3">3x3</option>
            <option value="5">5x5</option>
            <option value="11">11x11</option>
            <option value="31">31x31</option>
          </select>
        </div>

        <!-- Color Mode Control -->
        <div class="flex items-center space-x-2">
          <i class="fas fa-palette text-gray-500 text-sm" title="Color Mode - Choose between RGB and CMYK color formats"></i>
          <select class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="RGB">RGB</option>
            <option value="CMYK">CMYK</option>
          </select>
        </div>

        <!-- Logout -->
        {#if data?.user}
          <form action="/logout" method="POST" class="inline">
            <button
              type="submit"
              class="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded transition-colors"
              title="Logout"
            >
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </form>
        {/if}
      </div>
    </div>

    <!-- Main Content -->
    <ColorPicker
      {artboardId}
      artboardWidth={artboard.width_inches}
      artboardHeight={artboard.height_inches}
      existingImages={images}
      existingSwatches={swatches}
      enableMultipleImages={true}
      onSwatchCreated={handleSwatchCreated}
      onImageUpload={handleFileUpload}
    />
  </div>
{:else}
  <div class="flex items-center justify-center h-screen">
    <div class="text-center">
      <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
      <p class="text-xl">Artboard not found</p>
    </div>
  </div>
{/if}