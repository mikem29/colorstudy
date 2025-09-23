<script>
  let { savedSwatches, loadSavedSwatches } = $props();

  function groupSwatchesByDate(swatches) {
    const groups = {};
    swatches.forEach(swatch => {
      const date = new Date(swatch.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(swatch);
    });
    return groups;
  }

  function copyColorToClipboard(color) {
    navigator.clipboard.writeText(color);
    // You could add a toast notification here
  }

  async function deleteSwatch(id) {
    if (confirm('Are you sure you want to delete this swatch?')) {
      try {
        const response = await fetch(`/api/swatches/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await loadSavedSwatches();
        }
      } catch (error) {
        console.error('Error deleting swatch:', error);
      }
    }
  }

  $: groupedSwatches = groupSwatchesByDate(savedSwatches);
</script>

<div class="space-y-8">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-3xl font-bold text-gray-900">Saved Color Palettes</h2>
      <p class="text-gray-600 mt-2">Browse and manage your collected color swatches</p>
    </div>
    <button
      onclick={loadSavedSwatches}
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
    >
      <i class="fas fa-sync-alt"></i>
      <span>Refresh</span>
    </button>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div class="flex items-center">
        <div class="bg-blue-100 p-3 rounded-lg">
          <i class="fas fa-palette text-blue-600 text-xl"></i>
        </div>
        <div class="ml-4">
          <p class="text-2xl font-bold text-gray-900">{savedSwatches.length}</p>
          <p class="text-gray-600">Total Swatches</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div class="flex items-center">
        <div class="bg-purple-100 p-3 rounded-lg">
          <i class="fas fa-calendar text-purple-600 text-xl"></i>
        </div>
        <div class="ml-4">
          <p class="text-2xl font-bold text-gray-900">{Object.keys(groupedSwatches).length}</p>
          <p class="text-gray-600">Collection Days</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div class="flex items-center">
        <div class="bg-green-100 p-3 rounded-lg">
          <i class="fas fa-eye-dropper text-green-600 text-xl"></i>
        </div>
        <div class="ml-4">
          <p class="text-2xl font-bold text-gray-900">
            {savedSwatches.length > 0 ? Math.round(savedSwatches.length / Math.max(Object.keys(groupedSwatches).length, 1)) : 0}
          </p>
          <p class="text-gray-600">Avg per Day</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Swatches by Date -->
  {#if Object.keys(groupedSwatches).length === 0}
    <div class="text-center py-12">
      <div class="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-palette text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No swatches found</h3>
      <p class="text-gray-600">Start by using the color picker to create your first palette!</p>
    </div>
  {:else}
    {#each Object.entries(groupedSwatches).sort(([a], [b]) => new Date(b) - new Date(a)) as [date, swatches]}
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <i class="fas fa-calendar-day text-gray-400 mr-3"></i>
              {date}
            </h3>
            <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {swatches.length} colors
            </span>
          </div>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {#each swatches as swatch (swatch.id)}
              <div class="group bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
                <!-- Color Display -->
                <div
                  class="w-full h-20 rounded-lg mb-3 border border-gray-200 cursor-pointer relative overflow-hidden"
                  style="background-color: {swatch.hex_color}"
                  onclick={() => copyColorToClipboard(swatch.hex_color)}
                  title="Click to copy: {swatch.hex_color}"
                >
                  <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10"></div>
                  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div class="bg-black/50 text-white text-xs px-2 py-1 rounded">
                      <i class="fas fa-copy"></i>
                    </div>
                  </div>
                </div>

                <!-- Swatch Info -->
                <div class="space-y-2">
                  <h4 class="font-medium text-gray-900 text-sm leading-tight">{swatch.description}</h4>

                  <div class="space-y-1">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-gray-500">HEX</span>
                      <code class="bg-gray-200 px-2 py-1 rounded text-gray-800">{swatch.hex_color}</code>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-gray-500">RGB</span>
                      <code class="bg-gray-200 px-2 py-1 rounded text-gray-800">
                        {swatch.red}, {swatch.green}, {swatch.blue}
                      </code>
                    </div>
                    {#if swatch.cmyk}
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-500">CMYK</span>
                        <code class="bg-gray-200 px-2 py-1 rounded text-gray-800 text-[10px]">{swatch.cmyk}</code>
                      </div>
                    {/if}
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center justify-between pt-2 border-t border-gray-200">
                    <button
                      onclick={() => copyColorToClipboard(swatch.hex_color)}
                      class="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1"
                    >
                      <i class="fas fa-copy"></i>
                      <span>Copy</span>
                    </button>
                    <button
                      onclick={() => deleteSwatch(swatch.id)}
                      class="text-red-600 hover:text-red-700 text-xs font-medium flex items-center space-x-1"
                    >
                      <i class="fas fa-trash"></i>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  {/if}
</div>