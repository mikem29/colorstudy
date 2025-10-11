<script>
  import { onMount } from 'svelte';
  import ColorPicker from '$lib/ColorPicker.svelte';
  import { page } from '$app/stores';
  import html2canvas from 'html2canvas';

  let artboard = null;
  let images = [];
  let swatches = [];
  let loading = true;
  let uploadingImage = false;
  let showConnectionLines = true;
  let showColorFormatOnSwatch = true;
  let samplingSize = 1;
  let colorFormat = 'RGB';
  let colorPalettes = [];
  let selectedPaletteId = null;
  let selectedSwatch = null;
  let hasMixes = false;
  let selectedSwatchIndex = -1;
  let swatchLabelInput = '';
  let saveTimeout = null;
  let generatingPDF = false;
  let artboardId = '';
  let showColorMixes = false;
  let mixingQueue = [];
  let mixingPollInterval = null;
  let mixingNotification = { show: false, message: '', type: 'info' };

  onMount(() => {
    artboardId = $page.params.id;
    loadArtboard();
    loadPreferences();
    loadColorPalettes();
    checkMixesAvailable();
    loadMixingQueue();

    // Poll for mixing queue updates every 5 seconds
    mixingPollInterval = setInterval(async () => {
      await loadMixingQueue();
      // If any queue entry is processing, keep polling. Otherwise stop.
      const hasProcessing = mixingQueue.some(q => q.status === 'processing' || q.status === 'pending');
      if (!hasProcessing && mixingPollInterval) {
        clearInterval(mixingPollInterval);
        mixingPollInterval = null;
      }
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (mixingPollInterval) {
        clearInterval(mixingPollInterval);
      }
    };
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

  async function loadColorPalettes() {
    try {
      const response = await fetch('/api/palettes/color-palettes');
      const result = await response.json();
      if (result.status === 'success') {
        colorPalettes = result.data;
        // Set first palette as default if available
        if (colorPalettes.length > 0) {
          selectedPaletteId = colorPalettes[0].id;
        }
      }
    } catch (error) {
      console.error('Error loading color palettes:', error);
    }
  }

  async function checkMixesAvailable() {
    try {
      const response = await fetch(`/api/artboards/${artboardId}/calculate-mixes`);
      const result = await response.json();
      if (result.status === 'success') {
        hasMixes = result.calculated > 0;
      }
    } catch (error) {
      console.error('Error checking mixes:', error);
      hasMixes = false;
    }
  }

  async function loadMixingQueue() {
    try {
      const response = await fetch(`/api/artboards/${artboardId}/queue-palette-mixing`);
      const result = await response.json();
      if (result.status === 'success') {
        mixingQueue = result.data;
      }
    } catch (error) {
      console.error('Error loading mixing queue:', error);
    }
  }

  function showMixingNotification(message, type = 'info') {
    mixingNotification = { show: true, message, type };
    setTimeout(() => {
      mixingNotification = { show: false, message: '', type: 'info' };
    }, 5000);
  }

  async function queuePaletteMixing(paletteId) {
    try {
      const response = await fetch(`/api/artboards/${artboardId}/queue-palette-mixing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palette_id: paletteId })
      });

      const result = await response.json();

      // Handle both success and error responses
      if (!response.ok || result.status === 'error') {
        showMixingNotification(result.message || 'Failed to queue palette for mixing', 'error');
        return;
      }

      if (result.status === 'success') {
        // Reload the queue to show updated status
        await loadMixingQueue();

        // Start polling if not already running
        if (!mixingPollInterval) {
          mixingPollInterval = setInterval(async () => {
            await loadMixingQueue();
            const hasProcessing = mixingQueue.some(q => q.status === 'processing' || q.status === 'pending');
            if (!hasProcessing && mixingPollInterval) {
              clearInterval(mixingPollInterval);
              mixingPollInterval = null;
            }
          }, 5000);
        }

        showMixingNotification('Palette queued for mixing! Progress will update automatically.', 'success');
      }
    } catch (error) {
      console.error('Error queuing palette mixing:', error);
      showMixingNotification('Network error. Please try again.', 'error');
    }
  }

  function getPaletteQueueStatus(paletteId) {
    const queueEntry = mixingQueue.find(q => q.palette_id === paletteId);
    return queueEntry || null;
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

  async function generatePDF() {
    if (generatingPDF) return;

    generatingPDF = true;
    try {
      // Find the artboard canvas element (the white rectangle with exact dimensions)
      const artboardElement = document.querySelector('.artboard');

      if (!artboardElement) {
        console.error('Artboard canvas not found');
        alert('Unable to find artboard for PDF generation.');
        return;
      }

      // Wait for fonts to fully load before capturing
      await document.fonts.ready;

      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the artboard canvas as image
      const canvas = await html2canvas(artboardElement, {
        scale: 2, // Higher quality (2x resolution)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Convert canvas to base64 image data
      const imageData = canvas.toDataURL('image/png');

      // Send to server for PDF generation and download
      const response = await fetch(`/api/artboards/${artboardId}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          width: artboard.width_inches,
          height: artboard.height_inches
        })
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      // Get the PDF blob from response
      const blob = await response.blob();

      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${artboard.name || 'artboard'}_${artboardId}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      generatingPDF = false;
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
        {selectedPaletteId}
        {colorPalettes}
        onSwatchCreated={handleSwatchCreated}
        onImageUpload={handleFileUpload}
        onSwatchClick={handleSwatchClick}
      />
    </div>

    <!-- Fixed Right Sidebar -->
    <div class="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-screen z-50 relative shrink-0">
      <!-- Print Button (positioned in top right corner) -->
      <button
        onclick={generatePDF}
        disabled={generatingPDF}
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
        title="Print Artboard to PDF"
      >
        {#if generatingPDF}
          <i class="fas fa-spinner fa-spin text-lg"></i>
        {:else}
          <i class="fas fa-print text-lg"></i>
        {/if}
      </button>

      <!-- Sidebar Content -->
      <div class="flex-1 overflow-y-auto p-4 pt-10 space-y-6">
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

        <!-- Color Control -->
        <div class="space-y-3">
          <label class="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            <i class="fas fa-palette mr-2"></i>
            Color
          </label>
          <select bind:value={colorFormat} class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="RGB">RGB</option>
            <option value="CMYK">CMYK</option>
            {#if hasMixes}
              {#each colorPalettes as palette}
                <option value="PALETTE_{palette.id}">{palette.name}</option>
              {/each}
            {/if}
          </select>
          <p class="text-xs text-gray-500">Choose color format{hasMixes ? ' or paint palette' : ''}</p>
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
                    : colorFormat === 'OIL'
                    ? (selectedSwatch.oilPaintFormula || 'Generating mix database...')
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

        <!-- Color Mixes Section -->
        <div class="space-y-3 border-t border-gray-200 pt-6">
          <button
            onclick={() => showColorMixes = !showColorMixes}
            class="w-full flex items-center justify-between text-xs font-medium text-gray-700 uppercase tracking-wide hover:text-gray-900 transition-colors"
          >
            <span>
              <i class="fas fa-flask mr-2"></i>
              Color Mixes
            </span>
            <i class="fas fa-chevron-{showColorMixes ? 'up' : 'down'} text-xs"></i>
          </button>

          {#if showColorMixes}
            <!-- Inline Notification -->
            {#if mixingNotification.show}
              <div class="rounded-lg p-3 text-sm {
                mixingNotification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                mixingNotification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
              }">
                <div class="flex items-start">
                  <i class="fas {
                    mixingNotification.type === 'success' ? 'fa-check-circle' :
                    mixingNotification.type === 'error' ? 'fa-exclamation-circle' :
                    'fa-info-circle'
                  } mt-0.5 mr-2"></i>
                  <span>{mixingNotification.message}</span>
                </div>
              </div>
            {/if}
            <div class="space-y-2 pt-2">
              <p class="text-xs text-gray-500 mb-3">
                Calculate paint mixing formulas for your swatches. This process analyzes millions of color combinations to find the closest match.
              </p>

              {#if colorPalettes.length === 0}
                <p class="text-xs text-gray-500 italic">No color palettes available</p>
              {:else}
                {#each colorPalettes as palette}
                  {@const queueStatus = getPaletteQueueStatus(palette.id)}
                  <div class="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="text-sm font-medium text-gray-900">{palette.name}</h4>
                        <p class="text-xs text-gray-500 capitalize">{palette.type}</p>
                      </div>
                      {#if queueStatus}
                        {#if queueStatus.status === 'completed'}
                          <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                            <i class="fas fa-check mr-1"></i>Ready
                          </span>
                        {:else if queueStatus.status === 'processing'}
                          <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                            <i class="fas fa-spinner fa-spin mr-1"></i>Mixing
                          </span>
                        {:else if queueStatus.status === 'pending'}
                          <span class="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-medium">
                            <i class="fas fa-clock mr-1"></i>Queued
                          </span>
                        {:else if queueStatus.status === 'failed'}
                          <span class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-medium">
                            <i class="fas fa-exclamation-triangle mr-1"></i>Failed
                          </span>
                        {/if}
                      {/if}
                    </div>

                    {#if queueStatus && (queueStatus.status === 'processing' || queueStatus.status === 'completed')}
                      <div class="space-y-1">
                        <div class="flex justify-between text-xs text-gray-600">
                          <span>Progress</span>
                          <span>{queueStatus.swatches_processed} / {queueStatus.swatches_total}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                          <div
                            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style="width: {queueStatus.swatches_total > 0 ? (queueStatus.swatches_processed / queueStatus.swatches_total) * 100 : 0}%"
                          ></div>
                        </div>
                      </div>
                    {/if}

                    {#if !queueStatus || queueStatus.status === 'failed'}
                      <button
                        onclick={() => queuePaletteMixing(palette.id)}
                        class="w-full text-xs px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                      >
                        <i class="fas fa-play mr-1"></i>
                        Mix {palette.name}
                      </button>
                    {:else if queueStatus.status === 'completed'}
                      <button
                        onclick={() => queuePaletteMixing(palette.id)}
                        class="w-full text-xs px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-medium"
                      >
                        <i class="fas fa-redo mr-1"></i>
                        Recalculate
                      </button>
                    {/if}
                  </div>
                {/each}
              {/if}
            </div>
          {/if}
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