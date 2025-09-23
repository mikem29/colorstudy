<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let palettes = $state([]);
  let showUploadModal = $state(false);
  let uploadedFile = $state(null);
  let uploading = $state(false);
  let artboardWidth = $state(8.5);
  let artboardHeight = $state(11.0);
  let showDeleteModal = $state(false);
  let paletteToDelete = $state(null);

  async function loadPalettes() {
    try {
      const response = await fetch('/api/palettes');
      const data = await response.json();
      if (data.status === 'success') {
        palettes = data.data;
      }
    } catch (error) {
      console.error('Error loading palettes:', error);
    }
  }

  function openPalette(imageId) {
    goto(`/palette/${imageId}`);
  }

  function confirmDelete(palette) {
    paletteToDelete = palette;
    showDeleteModal = true;
  }

  function cancelDelete() {
    showDeleteModal = false;
    paletteToDelete = null;
  }

  async function deletePalette() {
    if (!paletteToDelete) return;

    try {
      const response = await fetch(`/api/palettes/${paletteToDelete.image_id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Remove the palette from the reactive state
        palettes = palettes.filter(p => p.image_id !== paletteToDelete.image_id);
        showDeleteModal = false;
        paletteToDelete = null;
      } else {
        alert('Failed to delete palette: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting palette:', error);
      alert('Failed to delete palette');
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadedFile = file;
    }
  }

  async function uploadImage() {
    if (!uploadedFile) return;

    uploading = true;
    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Create new palette entry
        const paletteResponse = await fetch('/api/palettes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: data.filename,
            artboard_width_inches: artboardWidth,
            artboard_height_inches: artboardHeight
          })
        });

        const paletteData = await paletteResponse.json();

        if (paletteData.status === 'success') {
          showUploadModal = false;
          uploadedFile = null;
          await loadPalettes();
          goto(`/palette/${paletteData.image_id}`);
        }
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      uploading = false;
    }
  }

  function getPreviewColors(colorsString) {
    if (!colorsString) return [];
    return colorsString.split(',').slice(0, 4);
  }

  onMount(() => {
    loadPalettes();
  });
</script>

<svelte:head>
  <title>ColorStudy - Color Palette Manager</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-4">
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <i class="fas fa-palette text-white text-xl"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ColorStudy
            </h1>
          </div>
        </div>

        <!-- Logo/Brand (top right) -->
        <div class="flex items-center space-x-4">
          <button
            onclick={() => showUploadModal = true}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <i class="fas fa-plus"></i>
            <span>New Palette</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

    <!-- Palette Grid -->
    {#if palettes.length === 0}
      <div class="text-center py-12">
        <div class="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-images text-gray-400 text-3xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No palettes yet</h3>
        <p class="text-gray-600 mb-6">Upload your first image to start creating color palettes!</p>
        <button
          onclick={() => showUploadModal = true}
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          <i class="fas fa-plus mr-2"></i>
          Create Your First Palette
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {#each palettes as palette (palette.image_id)}
          <div
            class="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden relative"
          >
            <!-- Image Thumbnail -->
            <div
              class="aspect-video bg-gray-100 relative overflow-hidden"
              onclick={() => openPalette(palette.image_id)}
            >
              <img
                src="/uploads/{palette.filename}"
                alt={palette.original_name}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

              <!-- Delete Button -->
              <button
                onclick={(e) => { e.stopPropagation(); confirmDelete(palette); }}
                class="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                title="Delete palette"
              >
                <i class="fas fa-trash text-sm"></i>
              </button>
            </div>

            <!-- Palette Info -->
            <div class="p-4" onclick={() => openPalette(palette.image_id)}>

              <!-- Color Preview -->
              {#if palette.preview_colors}
                <div class="flex space-x-1 mb-3">
                  {#each getPreviewColors(palette.preview_colors) as color}
                    <div
                      class="w-8 h-8 rounded border border-gray-200"
                      style="background-color: {color}"
                    ></div>
                  {/each}
                  {#if getPreviewColors(palette.preview_colors).length < 4}
                    {#each Array(4 - getPreviewColors(palette.preview_colors).length) as _}
                      <div class="w-8 h-8 rounded border border-gray-200 bg-gray-100"></div>
                    {/each}
                  {/if}
                </div>
              {:else}
                <div class="flex space-x-1 mb-3">
                  {#each Array(4) as _}
                    <div class="w-8 h-8 rounded border border-gray-200 bg-gray-100"></div>
                  {/each}
                </div>
              {/if}

              <!-- Metadata -->
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span class="flex items-center">
                  <i class="fas fa-palette mr-1"></i>
                  {palette.swatch_count || 0} colors
                </span>
                <span class="flex items-center">
                  <i class="fas fa-calendar mr-1"></i>
                  {new Date(palette.upload_date).toLocaleDateString()}
                </span>
              </div>
            </div>

          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>

<!-- Upload Modal -->
{#if showUploadModal}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">Upload New Image</h3>
          <button
            onclick={() => { showUploadModal = false; uploadedFile = null; }}
            class="text-gray-400 hover:text-gray-600 text-xl"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- File Upload Area -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
            <input
              type="file"
              accept="image/*"
              onchange={handleFileSelect}
              class="hidden"
              id="file-upload"
            />
            <label for="file-upload" class="cursor-pointer">
              <div class="space-y-3">
                <div class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <i class="fas fa-cloud-upload-alt text-blue-600 text-xl"></i>
                </div>
                <div>
                  <p class="text-lg font-medium text-gray-900">Choose image file</p>
                  <p class="text-sm text-gray-600">PNG, JPG, GIF up to 15MB</p>
                </div>
              </div>
            </label>
          </div>

          {#if uploadedFile}
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center space-x-3">
                <div class="bg-green-100 p-2 rounded">
                  <i class="fas fa-file-image text-green-600"></i>
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p class="text-sm text-gray-600">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            </div>
          {/if}

          <!-- Artboard Size Selection -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900">Artboard Size (inches)</h4>

            <!-- Preset sizes -->
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                onclick={() => { artboardWidth = 8.5; artboardHeight = 11.0; }}
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 {artboardWidth === 8.5 && artboardHeight === 11.0 ? 'bg-blue-50 border-blue-300' : ''}"
              >
                Letter (8.5" × 11")
              </button>
              <button
                type="button"
                onclick={() => { artboardWidth = 11.0; artboardHeight = 8.5; }}
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 {artboardWidth === 11.0 && artboardHeight === 8.5 ? 'bg-blue-50 border-blue-300' : ''}"
              >
                Letter Landscape
              </button>
              <button
                type="button"
                onclick={() => { artboardWidth = 8.5; artboardHeight = 14.0; }}
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 {artboardWidth === 8.5 && artboardHeight === 14.0 ? 'bg-blue-50 border-blue-300' : ''}"
              >
                Legal (8.5" × 14")
              </button>
              <button
                type="button"
                onclick={() => { artboardWidth = 11.0; artboardHeight = 17.0; }}
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 {artboardWidth === 11.0 && artboardHeight === 17.0 ? 'bg-blue-50 border-blue-300' : ''}"
              >
                Tabloid (11" × 17")
              </button>
            </div>

            <!-- Custom size inputs -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <input
                  type="number"
                  bind:value={artboardWidth}
                  min="1"
                  max="100"
                  step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <input
                  type="number"
                  bind:value={artboardHeight}
                  min="1"
                  max="100"
                  step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Upload Button -->
          <button
            onclick={uploadImage}
            disabled={!uploadedFile || uploading}
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if uploading}
              <i class="fas fa-spinner fa-spin mr-2"></i>
              Uploading...
            {:else}
              <i class="fas fa-upload mr-2"></i>
              Create Palette
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && paletteToDelete}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-red-100 p-2 rounded-full">
            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Delete Palette</h3>
        </div>

        <!-- Content -->
        <div class="mb-6">
          <p class="text-gray-600 mb-4">
            Are you sure you want to delete this palette?
          </p>
          <p class="text-sm text-red-600">
            <i class="fas fa-warning mr-1"></i>
            This action cannot be undone. All color swatches associated with this palette will also be deleted.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3">
          <button
            onclick={cancelDelete}
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onclick={deletePalette}
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            <i class="fas fa-trash mr-2"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}