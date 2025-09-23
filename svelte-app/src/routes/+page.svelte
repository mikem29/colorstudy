<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let artboards = $state([]);
  let showCreateModal = $state(false);
  let creating = $state(false);
  let artboardWidth = $state(8.5);
  let artboardHeight = $state(11.0);
  let artboardName = $state('');
  let showDeleteModal = $state(false);
  let artboardToDelete = $state(null);

  async function loadArtboards() {
    try {
      const response = await fetch('/api/artboards');
      const data = await response.json();
      if (data.status === 'success') {
        artboards = data.data;
      }
    } catch (error) {
      console.error('Error loading artboards:', error);
    }
  }

  function openArtboard(artboardId) {
    goto(`/artboard/${artboardId}`);
  }

  function confirmDelete(artboard) {
    artboardToDelete = artboard;
    showDeleteModal = true;
  }

  function cancelDelete() {
    showDeleteModal = false;
    artboardToDelete = null;
  }

  async function deleteArtboard() {
    if (!artboardToDelete) return;

    try {
      const response = await fetch(`/api/artboards/${artboardToDelete.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Remove the artboard from the reactive state
        artboards = artboards.filter(a => a.id !== artboardToDelete.id);
        showDeleteModal = false;
        artboardToDelete = null;
      } else {
        alert('Failed to delete artboard: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting artboard:', error);
      alert('Failed to delete artboard');
    }
  }

  async function createArtboard() {
    creating = true;
    try {
      const response = await fetch('/api/artboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: artboardName || 'Untitled Artboard',
          width_inches: artboardWidth,
          height_inches: artboardHeight
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        showCreateModal = false;
        artboardName = '';
        await loadArtboards();
        goto(`/artboard/${data.artboard_id}`);
      } else {
        alert('Failed to create artboard: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating artboard:', error);
      alert('Failed to create artboard');
    } finally {
      creating = false;
    }
  }


  onMount(() => {
    loadArtboards();
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
            onclick={() => showCreateModal = true}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <i class="fas fa-plus"></i>
            <span>New Artboard</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

    <!-- Artboard Grid -->
    {#if artboards.length === 0}
      <div class="text-center py-12">
        <div class="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-artstation text-gray-400 text-3xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No artboards yet</h3>
        <p class="text-gray-600 mb-6">Create your first artboard to start organizing your color palettes!</p>
        <button
          onclick={() => showCreateModal = true}
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          <i class="fas fa-plus mr-2"></i>
          Create Your First Artboard
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {#each artboards as artboard (artboard.id)}
          <div
            class="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden relative"
          >
            <!-- Artboard Preview -->
            <div
              class="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden flex items-center justify-center"
              onclick={() => openArtboard(artboard.id)}
            >
              <div class="text-center">
                <i class="fas fa-artstation text-gray-400 text-4xl mb-2"></i>
                <p class="text-sm text-gray-600 font-medium">{artboard.width_inches}" × {artboard.height_inches}"</p>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

              <!-- Delete Button -->
              <button
                onclick={(e) => { e.stopPropagation(); confirmDelete(artboard); }}
                class="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                title="Delete artboard"
              >
                <i class="fas fa-trash text-sm"></i>
              </button>
            </div>

            <!-- Artboard Info -->
            <div class="p-4" onclick={() => openArtboard(artboard.id)}>
              <h3 class="font-medium text-gray-900 mb-2 truncate">{artboard.name}</h3>

              <!-- Metadata -->
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span class="flex items-center">
                  <i class="fas fa-images mr-1"></i>
                  {artboard.image_count || 0} images
                </span>
                <span class="flex items-center">
                  <i class="fas fa-palette mr-1"></i>
                  {artboard.swatch_count || 0} swatches
                </span>
              </div>

              <div class="mt-2 text-xs text-gray-400">
                <i class="fas fa-calendar mr-1"></i>
                {new Date(artboard.created_at).toLocaleDateString()}
              </div>
            </div>

          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>

<!-- Create Artboard Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">Create New Artboard</h3>
          <button
            onclick={() => { showCreateModal = false; artboardName = ''; }}
            class="text-gray-400 hover:text-gray-600 text-xl"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Artboard Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Artboard Name</label>
            <input
              type="text"
              bind:value={artboardName}
              placeholder="e.g., Logo Design, Brand Colors"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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

          <!-- Create Button -->
          <button
            onclick={createArtboard}
            disabled={creating}
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if creating}
              <i class="fas fa-spinner fa-spin mr-2"></i>
              Creating...
            {:else}
              <i class="fas fa-plus mr-2"></i>
              Create Artboard
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && artboardToDelete}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-red-100 p-2 rounded-full">
            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Delete Artboard</h3>
        </div>

        <!-- Content -->
        <div class="mb-6">
          <p class="text-gray-600 mb-4">
            Are you sure you want to delete this artboard?
          </p>
          <p class="text-sm text-red-600">
            <i class="fas fa-warning mr-1"></i>
            This action cannot be undone. All images and color swatches on this artboard will also be deleted.
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
            onclick={deleteArtboard}
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