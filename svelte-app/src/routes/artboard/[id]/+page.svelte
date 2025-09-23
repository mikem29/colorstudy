<script>
  import { onMount } from 'svelte';
  import ColorPicker from '$lib/ColorPicker.svelte';
  import { page } from '$app/stores';

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