<script>
  import { onMount } from 'svelte';

  let { loadSavedSwatches, imageSrc = '/dunes.png', imageId = null } = $props();

  const version = 'Version 3.3 - Svelte 5';

  const swatchWidth = 200;
  const swatchHeight = 120;
  const swatchMargin = 10;

  let pendingClickData = $state(null);
  let imageWidth = $state(0);
  let imageHeight = $state(0);
  let swatchPlaceholders = $state([]);
  let swatchIndex = $state(0);

  // Artboard system
  let artboardWidthInches = $state(8.5);
  let artboardHeightInches = $state(11.0);
  let artboardWidthPx = $state(0);
  let artboardHeightPx = $state(0);
  let imageX = $state(0);
  let imageY = $state(0);
  let imageDisplayWidth = $state(0);
  let imageDisplayHeight = $state(0);

  // DPI for proper scaling - 96 DPI is standard screen resolution
  const SCREEN_DPI = 96; // Actual screen DPI for 1:1 scaling

  // Tool system
  let currentTool = $state('select'); // 'select', 'eyedropper', 'hand', 'zoom'
  let zoomLevel = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let isPanning = $state(false);
  let isZooming = $state(false);
  let showZoomDropdown = $state(false);
  let isAltPressed = $state(false);
  let isSpacePressed = $state(false);
  let originalTool = $state('');
  let zoomMode = $state('in'); // 'in' or 'out'

  // Image selection state
  let isImageSelected = $state(false);

  // Image manipulation state
  let isDraggingImage = $state(false);
  let isResizingImage = $state(false);
  let imageDragStart = $state({ x: 0, y: 0 });
  let resizeStart = $state({ x: 0, y: 0, width: 0, height: 0 });
  let resizeHandle = $state(''); // 'nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w'

  let samplingSize = $state(1);
  let colorFormat = $state('RGB');
  let showModal = $state(false);
  let description = $state('');
  let selectedColor = $state('#000000');

  // Eyedropper floating UI state
  let showEyedropper = $state(false);
  let eyedropperX = $state(0);
  let eyedropperY = $state(0);
  let previewColor = $state('#000000');
  let previewRed = $state(0);
  let previewGreen = $state(0);
  let previewBlue = $state(0);

  // Drag and drop functionality
  let isDragging = $state(false);
  let draggedSwatchIndex = $state(-1);
  let dragStartPos = $state({ x: 0, y: 0 });
  let dragOffset = $state({ x: 0, y: 0 });

  let canvas;
  let overlayCanvas;
  let ctx;
  let overlayCtx;
  let colorPreview;

  onMount(() => {
    console.log('Loading image from:', imageSrc);

    // Load artboard data and saved swatches for this image
    loadArtboardData();
    loadSavedSwatchesFromDB();

    // Add global mouse event listeners for smooth dragging
    const handleGlobalMouseMove = (event) => handleMouseMove(event);
    const handleGlobalMouseUp = () => handleMouseUp();

    // Add keyboard event listeners for alt key and spacebar detection
    const handleKeyDown = (event) => {
      if (event.altKey) {
        isAltPressed = true;
      }

      // Handle spacebar for temporary hand tool activation
      if (event.code === 'Space' && !isSpacePressed) {
        event.preventDefault(); // Prevent page scrolling
        isSpacePressed = true;

        // Save current tool and switch to hand tool
        if (currentTool !== 'hand') {
          originalTool = currentTool;
          currentTool = 'hand';
        }
      }

      // Handle tool keyboard shortcuts
      if (!isSpacePressed) { // Don't switch tools while spacebar is held
        switch (event.code) {
          case 'KeyV':
            event.preventDefault();
            currentTool = 'select';
            break;
          case 'KeyI':
            event.preventDefault();
            currentTool = 'eyedropper';
            break;
          case 'KeyH':
            event.preventDefault();
            currentTool = 'hand';
            break;
          case 'KeyZ':
            event.preventDefault();
            if (currentTool === 'zoom') {
              // Toggle zoom mode if already on zoom tool
              zoomMode = zoomMode === 'in' ? 'out' : 'in';
            } else {
              // Switch to zoom tool and default to zoom in
              currentTool = 'zoom';
              zoomMode = 'in';
            }
            break;
        }
      }
    };

    const handleKeyUp = (event) => {
      if (!event.altKey) {
        isAltPressed = false;
      }

      // Handle spacebar release to restore original tool
      if (event.code === 'Space' && isSpacePressed) {
        isSpacePressed = false;

        // Restore original tool if we switched to hand tool
        if (originalTool && currentTool === 'hand') {
          currentTool = originalTool;
          originalTool = '';
        }
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onerror = function() {
      console.error('Failed to load image:', imageSrc);
      // Try without crossOrigin
      const img2 = new Image();
      img2.src = imageSrc;

      img2.onload = function() {
        loadImageToCanvas(img2);
      };

      img2.onerror = function() {
        console.error('Failed to load image even without CORS:', imageSrc);
        // Initialize canvas with fallback size
        initializeEmptyCanvas();
      };
    };

    img.onload = function() {
      console.log('Image loaded successfully');
      loadImageToCanvas(img);
    };

    img.src = imageSrc;

    // Return cleanup function
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  });

  function loadImageToCanvas(img) {
    // Get container width (assuming max width of container)
    const containerWidth = canvas.parentElement.offsetWidth || 800;
    const maxWidth = Math.min(containerWidth, 1200); // Max width of 1200px

    // Calculate scaled dimensions maintaining aspect ratio
    const aspectRatio = img.height / img.width;
    const scaledWidth = Math.min(img.width, maxWidth);
    const scaledHeight = scaledWidth * aspectRatio;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    overlayCanvas.width = scaledWidth;
    overlayCanvas.height = scaledHeight;

    // Set CSS size to match canvas size
    canvas.style.width = scaledWidth + 'px';
    canvas.style.height = scaledHeight + 'px';
    overlayCanvas.style.width = scaledWidth + 'px';
    overlayCanvas.style.height = scaledHeight + 'px';

    imageWidth = scaledWidth;
    imageHeight = scaledHeight;

    // Initialize display dimensions to match canvas if not already set
    if (!imageDisplayWidth) imageDisplayWidth = scaledWidth;
    if (!imageDisplayHeight) imageDisplayHeight = scaledHeight;

    ctx = canvas.getContext('2d');
    overlayCtx = overlayCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

    createPlaceholders();
  }

  function initializeEmptyCanvas() {
    const containerWidth = canvas.parentElement.offsetWidth || 800;
    const canvasWidth = Math.min(containerWidth, 800);
    const canvasHeight = 400;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    overlayCanvas.width = canvasWidth;
    overlayCanvas.height = canvasHeight;

    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    overlayCanvas.style.width = canvasWidth + 'px';
    overlayCanvas.style.height = canvasHeight + 'px';

    imageWidth = canvasWidth;
    imageHeight = canvasHeight;

    ctx = canvas.getContext('2d');
    overlayCtx = overlayCanvas.getContext('2d');

    // Fill with a light gray background and show error message
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Image failed to load', canvasWidth / 2, canvasHeight / 2 - 10);
    ctx.fillText(`Path: ${imageSrc}`, canvasWidth / 2, canvasHeight / 2 + 10);

    createPlaceholders();
  }

  function getSwatchPosition(index) {
    const swatchDims = getSwatchDimensions();
    const swatchWidth = swatchDims.width;
    const swatchHeight = swatchDims.height;
    const margin = Math.round(artboardWidthPx * 0.02); // 2% of artboard width as margin

    // Available artboard space
    const availableWidth = artboardWidthPx - (2 * margin);
    const availableHeight = artboardHeightPx - (2 * margin);

    // Define exclusion zone around the image (if positioned on artboard)
    const imageLeft = Math.max(0, imageX);
    const imageTop = Math.max(0, imageY);
    const imageRight = Math.min(artboardWidthPx, imageX + (imageDisplayWidth || imageWidth));
    const imageBottom = Math.min(artboardHeightPx, imageY + (imageDisplayHeight || imageHeight));
    const imagePadding = Math.round(artboardWidthPx * 0.03); // 3% padding around image

    const exclusionLeft = Math.max(0, imageLeft - imagePadding);
    const exclusionRight = Math.min(artboardWidthPx, imageRight + imagePadding);
    const exclusionTop = Math.max(0, imageTop - imagePadding);
    const exclusionBottom = Math.min(artboardHeightPx, imageBottom + imagePadding);

    // Create grid positions within artboard
    const positions = [];

    // Calculate how many swatches fit horizontally and vertically
    const swatchesPerRow = Math.floor(availableWidth / (swatchWidth + margin));
    const swatchesPerCol = Math.floor(availableHeight / (swatchHeight + margin));

    // Generate grid positions, avoiding image area
    for (let row = 0; row < swatchesPerCol; row++) {
      for (let col = 0; col < swatchesPerRow; col++) {
        const x = margin + col * (swatchWidth + margin);
        const y = margin + row * (swatchHeight + margin);

        // Check if this position overlaps with image exclusion zone
        const swatchRight = x + swatchWidth;
        const swatchBottom = y + swatchHeight;

        const overlapsImage = !(x >= exclusionRight || swatchRight <= exclusionLeft ||
                              y >= exclusionBottom || swatchBottom <= exclusionTop);

        if (!overlapsImage) {
          // Prioritize positions: top-left first, then fill around image
          const distanceFromTopLeft = Math.sqrt(x * x + y * y);
          positions.push({ x, y, priority: distanceFromTopLeft });
        }
      }
    }

    // Sort by priority (distance from top-left)
    positions.sort((a, b) => a.priority - b.priority);

    if (positions[index]) {
      return {
        x: positions[index].x,
        y: positions[index].y
      };
    }

    // Fallback: stack vertically on the right edge if no space
    const fallbackX = Math.max(0, artboardWidthPx - swatchWidth - margin);
    const fallbackY = margin + (index * (swatchHeight + margin)) % (availableHeight - swatchHeight);

    return {
      x: fallbackX,
      y: fallbackY
    };
  }

  function onCanvasClick(event) {
    // Don't trigger actions if we're dragging a swatch or manipulating image
    if (isDragging || isDraggingImage || isResizingImage) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    // Handle different tool modes
    switch (currentTool) {
      case 'eyedropper':
        handleEyedropperClick(x, y);
        break;
      case 'zoom':
        handleZoomClick(event, x, y);
        break;
      case 'hand':
        // Hand tool handled in mouse events
        break;
      case 'select':
        // Select the image when clicked
        isImageSelected = true;
        break;
      default:
        // Default to eyedropper behavior for backward compatibility
        handleEyedropperClick(x, y);
    }
  }

  function handleEyedropperClick(x, y) {
    // Use the same scaling logic as mouse move
    const cssWidth = imageDisplayWidth || imageWidth;
    const cssHeight = imageDisplayHeight || imageHeight;

    const scaleX = canvas.width / cssWidth;
    const scaleY = canvas.height / cssHeight;

    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    const { red, green, blue } = getAverageColor(ctx, canvasX, canvasY, samplingSize);
    const hexColor = rgbToHex(red, green, blue);

    // Calculate default position for new swatch (artboard-relative)
    const swatchPos = getSwatchPosition(swatchIndex);

    pendingClickData = {
      hexColor,
      red,
      green,
      blue,
      sampleX: canvasX,
      sampleY: canvasY,
      posX: swatchPos.x, // Already artboard-relative
      posY: swatchPos.y  // Already artboard-relative
    };
    selectedColor = hexColor;
    showModal = true;
  }

  function handleZoomClick(event, x, y) {
    if (event.shiftKey || isAltPressed || zoomMode === 'out') {
      // Zoom out
      zoomLevel = Math.max(0.1, zoomLevel - 0.2);
    } else {
      // Zoom in
      zoomLevel = Math.min(5, zoomLevel + 0.2);
    }
  }

  function setZoomLevel(level) {
    zoomLevel = level;
    showZoomDropdown = false;
  }

  function onCanvasMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    switch (currentTool) {
      case 'hand':
        isPanning = true;
        panX = event.clientX;
        panY = event.clientY;
        break;
      case 'select':
        // Select the image if not already selected
        if (!isImageSelected) {
          isImageSelected = true;
        }

        // Check if clicking on a resize handle (when image is selected)
        if (isImageSelected) {
          const handle = getResizeHandle(x, y);
          if (handle) {
            isResizingImage = true;
            resizeHandle = handle;
            resizeStart = {
              x: imageX,
              y: imageY,
              mouseX: event.clientX,
              mouseY: event.clientY,
              width: imageDisplayWidth || imageWidth,
              height: imageDisplayHeight || imageHeight
            };
          } else {
            // If not on a resize handle, start dragging the image for repositioning
            isDraggingImage = true;
            imageDragStart = { x: event.clientX - imageX, y: event.clientY - imageY };
          }
        }
        break;
    }

    event.preventDefault();
  }


  function getResizeHandle(x, y) {
    const handleSize = 12; // Increased for better usability
    const imageRect = {
      left: 0,
      top: 0,
      right: imageDisplayWidth || imageWidth,
      bottom: imageDisplayHeight || imageHeight
    };

    // Check corner handles (coordinates are relative to the canvas/image)
    if (Math.abs(x - imageRect.right) < handleSize && Math.abs(y - imageRect.bottom) < handleSize) return 'se';
    if (Math.abs(x - imageRect.left) < handleSize && Math.abs(y - imageRect.bottom) < handleSize) return 'sw';
    if (Math.abs(x - imageRect.right) < handleSize && Math.abs(y - imageRect.top) < handleSize) return 'ne';
    if (Math.abs(x - imageRect.left) < handleSize && Math.abs(y - imageRect.top) < handleSize) return 'nw';

    return null;
  }

  function handleResizeMouseDown(event, handle) {
    event.preventDefault();
    event.stopPropagation();

    isResizingImage = true;
    resizeHandle = handle;
    resizeStart = {
      x: imageX,
      y: imageY,
      mouseX: event.clientX,
      mouseY: event.clientY,
      width: imageDisplayWidth || imageWidth,
      height: imageDisplayHeight || imageHeight
    };
  }

  async function saveImagePosition() {
    if (!imageId) return;

    try {
      const response = await fetch(`/api/palettes/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_x: imageX,
          image_y: imageY
        })
      });
    } catch (error) {
      console.error('Error saving image position:', error);
    }
  }

  async function saveImageSize() {
    if (!imageId) return;

    try {
      const response = await fetch(`/api/palettes/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_width: imageDisplayWidth,
          image_height: imageDisplayHeight
        })
      });
    } catch (error) {
      console.error('Error saving image size:', error);
    }
  }

  function onCanvasMouseMove(event) {
    // Don't show color preview or sampling indicator when dragging
    if (isDragging || !overlayCtx) return;

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    // Only show color preview and sampling for eyedropper tool
    if (currentTool === 'eyedropper') {
      // Account for zoom by using actual displayed canvas size
      const displayedCanvasWidth = rect.width;
      const displayedCanvasHeight = rect.height;

      // Scale from displayed canvas coordinates to internal canvas coordinates
      const scaleX = canvas.width / displayedCanvasWidth;
      const scaleY = canvas.height / displayedCanvasHeight;

      const canvasX = x * scaleX;
      const canvasY = y * scaleY;

      // Make sure we're within canvas bounds
      if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
        const { red, green, blue } = getAverageColor(ctx, canvasX, canvasY, samplingSize);
        const hexColor = rgbToHex(red, green, blue);

        // Show preview window but no floating icon - use crosshair cursor
        eyedropperX = event.clientX;
        eyedropperY = event.clientY;
        showEyedropper = true;


        updateToolbarColorPreview(hexColor, red, green, blue);
      }
    }
  }

  function getCanvasCursor() {
    if (isDragging) return 'cursor-grabbing';
    if (isDraggingImage) return 'cursor-move';
    if (isResizingImage) return 'cursor-nw-resize';
    if (isPanning) return 'cursor-grabbing';

    // If spacebar is pressed, always show hand cursor
    if (isSpacePressed) {
      return isPanning ? 'cursor-grabbing' : 'cursor-grab';
    }

    switch (currentTool) {
      case 'select':
        if (isImageSelected) {
          return 'cursor-move'; // Show move cursor when image is selected
        }
        return 'cursor-default';
      case 'eyedropper': return 'cursor-crosshair'; // Use native crosshair cursor
      case 'hand': return isPanning ? 'cursor-grabbing' : 'cursor-grab';
      case 'zoom': return (isAltPressed || zoomMode === 'out') ? 'cursor-zoom-out' : 'cursor-zoom-in';
      default: return 'cursor-default';
    }
  }

  function onCanvasMouseLeave() {
    if (overlayCtx) {
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
    showEyedropper = false;
  }

  function drawSamplingIndicator(x, y) {
    overlayCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    overlayCtx.lineWidth = 1;

    if (samplingSize === 1) {
      // Subtle crosshair for point sampling
      overlayCtx.beginPath();
      overlayCtx.moveTo(x - 4, y);
      overlayCtx.lineTo(x + 4, y);
      overlayCtx.moveTo(x, y - 4);
      overlayCtx.lineTo(x, y + 4);
      overlayCtx.stroke();
    } else {
      // Corner brackets for area sampling (more subtle)
      const halfSize = Math.floor(samplingSize / 2);
      const left = Math.max(0, x - halfSize);
      const top = Math.max(0, y - halfSize);
      const right = Math.min(overlayCanvas.width, x + halfSize);
      const bottom = Math.min(overlayCanvas.height, y + halfSize);
      const cornerLength = Math.min(6, samplingSize / 2);

      overlayCtx.beginPath();
      // Top-left corner
      overlayCtx.moveTo(left, top + cornerLength);
      overlayCtx.lineTo(left, top);
      overlayCtx.lineTo(left + cornerLength, top);
      // Top-right corner
      overlayCtx.moveTo(right - cornerLength, top);
      overlayCtx.lineTo(right, top);
      overlayCtx.lineTo(right, top + cornerLength);
      // Bottom-right corner
      overlayCtx.moveTo(right, bottom - cornerLength);
      overlayCtx.lineTo(right, bottom);
      overlayCtx.lineTo(right - cornerLength, bottom);
      // Bottom-left corner
      overlayCtx.moveTo(left + cornerLength, bottom);
      overlayCtx.lineTo(left, bottom);
      overlayCtx.lineTo(left, bottom - cornerLength);
      overlayCtx.stroke();
    }
  }

  function getAverageColor(ctx, x, y, size) {
    const halfSize = Math.floor(size / 2);
    const startX = Math.max(0, x - halfSize);
    const startY = Math.max(0, y - halfSize);
    const endX = Math.min(ctx.canvas.width, x + halfSize + 1);
    const endY = Math.min(ctx.canvas.height, y + halfSize + 1);

    const width = endX - startX;
    const height = endY - startY;

    const imageData = ctx.getImageData(startX, startY, width, height);
    const data = imageData.data;

    let red = 0, green = 0, blue = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      red += data[i];
      green += data[i + 1];
      blue += data[i + 2];
    }

    red = Math.round(red / pixelCount);
    green = Math.round(green / pixelCount);
    blue = Math.round(blue / pixelCount);

    return { red, green, blue };
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(function(x) {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  }

  function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);

    if (k === 1) {
      c = 0; m = 0; y = 0;
    } else {
      c = (c - k) / (1 - k);
      m = (m - k) / (1 - k);
      y = (y - k) / (1 - k);
    }

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  }

  function updateToolbarColorPreview(hexColor, red, green, blue) {
    previewColor = hexColor;
    previewRed = red;
    previewGreen = green;
    previewBlue = blue;
  }

  function createPlaceholders() {
    const maxSwatches = 8;
    swatchPlaceholders = Array(maxSwatches).fill().map(() => ({
      filled: false,
      data: null
    }));
  }

  function handleSubmit() {
    if (description.trim() && pendingClickData) {
      updateSwatch(
        pendingClickData.hexColor,
        pendingClickData.red,
        pendingClickData.green,
        pendingClickData.blue,
        description.trim(),
        pendingClickData.posX,
        pendingClickData.posY,
        pendingClickData.sampleX,
        pendingClickData.sampleY
      );
      showModal = false;
      description = '';
      pendingClickData = null;
    }
  }

  async function updateSwatch(hexColor, red, green, blue, desc, posX, posY, sampleX, sampleY) {
    // Expand array if we've reached the current limit
    if (swatchIndex >= swatchPlaceholders.length) {
      const newPlaceholders = Array(swatchPlaceholders.length + 8).fill().map(() => ({ filled: false, data: null }));
      // Copy existing swatches
      swatchPlaceholders.forEach((swatch, i) => {
        newPlaceholders[i] = swatch;
      });
      swatchPlaceholders = newPlaceholders;
    }

    const { c, m, y, k } = rgbToCmyk(red, green, blue);
    const cmykString = `C:${c}%, M:${m}%, Y:${y}%, K:${k}%`;

    const swatchData = {
      hexColor,
      red,
      green,
      blue,
      cmyk: cmykString,
      description: desc,
      posX,
      posY,
      sampleX,
      sampleY
    };

    // Add to local array first
    swatchPlaceholders[swatchIndex] = {
      filled: true,
      data: swatchData
    };

    swatchIndex++;

    // Save to database immediately
    try {
      const response = await fetch('/api/swatches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
          hex_color: hexColor,
          red,
          green,
          blue,
          cmyk: cmykString,
          description: desc,
          image_id: imageId,
          pos_x: posX,
          pos_y: posY,
          sample_x: sampleX,
          sample_y: sampleY
        }])
      });

      const result = await response.json();

      if (result.status !== 'success') {
        console.error('Failed to save swatch:', result.message);
      }
    } catch (error) {
      console.error('Error saving swatch:', error);
    }
  }

  async function saveSwatches() {
    const swatchData = swatchPlaceholders
      .filter(swatch => swatch.filled)
      .map(swatch => ({
        hex_color: swatch.data.hexColor,
        red: swatch.data.red,
        green: swatch.data.green,
        blue: swatch.data.blue,
        cmyk: swatch.data.cmyk,
        description: swatch.data.description,
        image_id: imageId,
        pos_x: swatch.data.posX,
        pos_y: swatch.data.posY,
        sample_x: swatch.data.sampleX,
        sample_y: swatch.data.sampleY
      }));

    if (swatchData.length === 0) {
      alert('No swatches to save.');
      return;
    }

    try {
      const response = await fetch('/api/swatches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(swatchData)
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(`Successfully saved ${swatchData.length} swatches!`);
        // Reset the current palette
        swatchIndex = 0;
        swatchPlaceholders = swatchPlaceholders.map(() => ({ filled: false, data: null }));
        // Refresh saved swatches in parent
        if (loadSavedSwatches) {
          loadSavedSwatches();
        }
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving swatches.');
    }
  }

  async function loadArtboardData() {
    if (!imageId) return;

    try {
      const response = await fetch(`/api/palettes/${imageId}`);
      const result = await response.json();

      if (result.status === 'success') {
        const data = result.data;
        artboardWidthInches = data.artboard_width_inches || 8.5;
        artboardHeightInches = data.artboard_height_inches || 11.0;
        imageX = data.image_x || 0;
        imageY = data.image_y || 0;

        // Set display dimensions from saved data, or will be set when image loads
        if (data.image_width) imageDisplayWidth = data.image_width;
        if (data.image_height) imageDisplayHeight = data.image_height;

        // Calculate artboard size in pixels for display
        calculateArtboardSize();
      }
    } catch (error) {
      console.error('Error loading artboard data:', error);
    }
  }

  function calculateArtboardSize() {
    // Use CSS absolute units - 1in = 96px exactly
    // Just convert inches to pixels using CSS standard
    artboardWidthPx = artboardWidthInches * 96;
    artboardHeightPx = artboardHeightInches * 96;
  }

  // Calculate real swatch dimensions using CSS absolute units
  function getSwatchDimensions() {
    // CSS standard: 1in = 96px exactly
    return {
      width: 2.5 * 96,  // 2.5 inches wide
      height: 1.5 * 96  // 1.5 inches tall
    };
  }

  async function loadSavedSwatchesFromDB() {
    if (!imageId) return;

    try {
      const response = await fetch(`/api/swatches/${imageId}`);
      const result = await response.json();

      if (result.status === 'success' && result.data.length > 0) {
        // Create array sized to fit all saved swatches (minimum 8)
        const arraySize = Math.max(8, result.data.length + 8);
        swatchPlaceholders = Array(arraySize).fill().map(() => ({ filled: false, data: null }));

        // Load saved swatches into placeholders
        result.data.forEach((swatch, index) => {
          swatchPlaceholders[index] = {
            filled: true,
            data: {
              hexColor: swatch.hex_color,
              red: swatch.red,
              green: swatch.green,
              blue: swatch.blue,
              cmyk: swatch.cmyk,
              description: swatch.description,
              posX: swatch.pos_x,
              posY: swatch.pos_y,
              sampleX: swatch.sample_x,
              sampleY: swatch.sample_y
            }
          };
        });

        // Update swatchIndex to next available slot
        swatchIndex = result.data.length;
      }
    } catch (error) {
      console.error('Error loading saved swatches:', error);
    }
  }

  function clearPalette() {
    if (confirm('Are you sure you want to clear all current swatches?')) {
      swatchIndex = 0;
      swatchPlaceholders = swatchPlaceholders.map(() => ({ filled: false, data: null }));
    }
  }

  function handleMouseDown(event, index) {
    // Only allow swatch dragging when select tool is active
    if (currentTool !== 'select') {
      return;
    }

    isDragging = true;
    draggedSwatchIndex = index;

    // Get the current swatch position
    const swatch = swatchPlaceholders[index];
    const currentSwatchPos = swatch.data.posX !== undefined ?
      { x: swatch.data.posX, y: swatch.data.posY } :
      getSwatchPosition(index);

    // Calculate offset from mouse to current swatch position
    const artboardRect = document.querySelector('.artboard').getBoundingClientRect();
    const mouseXInArtboard = event.clientX - artboardRect.left;
    const mouseYInArtboard = event.clientY - artboardRect.top;

    dragOffset = {
      x: mouseXInArtboard - currentSwatchPos.x,
      y: mouseYInArtboard - currentSwatchPos.y
    };


    // Clear any sampling indicators
    if (overlayCtx) {
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    event.preventDefault();
  }

  function handleMouseMove(event) {
    // Handle swatch dragging
    if (isDragging && draggedSwatchIndex !== -1) {
      const swatch = swatchPlaceholders[draggedSwatchIndex];
      if (swatch && swatch.filled) {
        // Update swatch position based on mouse movement with requestAnimationFrame for smooth performance
        requestAnimationFrame(() => {
          const swatchDims = getSwatchDimensions();
          const margin = Math.round(artboardWidthPx * 0.02);

          // Calculate new position relative to artboard
          const artboardRect = document.querySelector('.artboard').getBoundingClientRect();
          const newX = (event.clientX - artboardRect.left) - dragOffset.x;
          const newY = (event.clientY - artboardRect.top) - dragOffset.y;

          // Constrain to artboard boundaries
          const constrainedX = Math.max(margin, Math.min(artboardWidthPx - swatchDims.width - 16 - margin, newX));
          const constrainedY = Math.max(margin, Math.min(artboardHeightPx - (swatchDims.height + 60) - margin, newY)); // 60px for text area

          swatch.data.posX = constrainedX;
          swatch.data.posY = constrainedY;
        });
      }
      return;
    }

    // Handle artboard tool interactions
    if (isPanning && currentTool === 'hand') {
      // Handle panning
      const deltaX = event.clientX - panX;
      const deltaY = event.clientY - panY;

      panX = event.clientX;
      panY = event.clientY;

      // Update the artboard transform
      const artboard = document.querySelector('.artboard');
      if (artboard) {
        const currentTransform = artboard.style.transform || `scale(${zoomLevel * 0.9})`;
        artboard.style.transform = `${currentTransform} translate(${deltaX}px, ${deltaY}px)`;
      }
    } else if (isDraggingImage && currentTool === 'select' && isImageSelected) {
      // Handle image dragging with select tool
      imageX = event.clientX - imageDragStart.x;
      imageY = event.clientY - imageDragStart.y;

      // Allow free positioning when image is selected (like resize mode)
      // No bounds checking - image can go outside artboard
    } else if (isResizingImage && currentTool === 'select' && isImageSelected) {
      // Handle image resizing
      const deltaX = event.clientX - resizeStart.mouseX;
      const deltaY = event.clientY - resizeStart.mouseY;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      const aspectRatio = imageHeight / imageWidth;

      switch (resizeHandle) {
        case 'se': // Southeast corner
          newWidth = resizeStart.width + deltaX;
          // Always maintain aspect ratio unless Ctrl is held to break it
          if (!event.ctrlKey) {
            newHeight = newWidth * aspectRatio;
          } else {
            newHeight = resizeStart.height + deltaY;
          }
          break;
        case 'sw': // Southwest corner
          newWidth = resizeStart.width - deltaX;
          if (!event.ctrlKey) {
            newHeight = newWidth * aspectRatio;
          } else {
            newHeight = resizeStart.height + deltaY;
          }
          imageX = resizeStart.x + (resizeStart.width - newWidth);
          break;
        case 'ne': // Northeast corner
          newWidth = resizeStart.width + deltaX;
          if (!event.ctrlKey) {
            newHeight = newWidth * aspectRatio;
          } else {
            newHeight = resizeStart.height - deltaY;
          }
          imageY = resizeStart.y + (resizeStart.height - newHeight);
          break;
        case 'nw': // Northwest corner
          newWidth = resizeStart.width - deltaX;
          if (!event.ctrlKey) {
            newHeight = newWidth * aspectRatio;
          } else {
            newHeight = resizeStart.height - deltaY;
          }
          imageX = resizeStart.x + (resizeStart.width - newWidth);
          imageY = resizeStart.y + (resizeStart.height - newHeight);
          break;
      }

      // Apply minimum constraints only (no maximum - allow overflow)
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(50, newHeight);

      imageDisplayWidth = newWidth;
      imageDisplayHeight = newHeight;
    }
  }

  async function handleMouseUp() {
    // Handle swatch dragging
    if (isDragging && draggedSwatchIndex !== -1) {
      const swatch = swatchPlaceholders[draggedSwatchIndex];

      // Save the new position to database
      if (swatch && swatch.filled) {
        try {
          const response = await fetch('/api/swatches/update-position', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              hex_color: swatch.data.hexColor,
              image_id: imageId,
              pos_x: swatch.data.posX,
              pos_y: swatch.data.posY
            })
          });

          const result = await response.json();
          if (result.status !== 'success') {
            console.error('Failed to save position:', result.message);
          }
        } catch (error) {
          console.error('Error saving position:', error);
        }
      }

      isDragging = false;
      draggedSwatchIndex = -1;
    }

    // Handle artboard tool interactions
    if (isPanning) {
      isPanning = false;
    }
    if (isDraggingImage) {
      isDraggingImage = false;
      // Save image position to database
      saveImagePosition();
    }
    if (isResizingImage) {
      isResizingImage = false;
      resizeHandle = '';
      // Save image size to database
      saveImageSize();
    }
  }
</script>

<style>
  @keyframes float {
    0% {
      transform: translateY(0px) rotate(-1deg);
    }
    100% {
      transform: translateY(-8px) rotate(1deg);
    }
  }
</style>


<!-- Artboard Workspace -->
<div
  class="artboard-workspace relative w-full min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-8"
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
  onclick={(e) => {
    showZoomDropdown = false;
    // Deselect image when clicking outside the artboard area with select tool
    if (currentTool === 'select' && e.target === e.currentTarget) {
      isImageSelected = false;
    }
  }}
>

  <!-- Professional Design Toolbar -->
  <div class="fixed left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-50" onclick={(e) => e.stopPropagation()}>
    <div class="flex flex-col space-y-1">

      <!-- Selection Tool -->
      <button
        onclick={() => currentTool = 'select'}
        class="p-3 rounded-lg transition-all duration-200 {currentTool === 'select' ? 'bg-blue-100 text-blue-600 shadow-md' : 'text-gray-600 hover:bg-gray-100'}"
        title="Selection Tool - Press V (Click to select, drag to move, handles to resize)"
      >
        <i class="fas fa-mouse-pointer text-lg"></i>
      </button>

      <!-- Eyedropper Tool -->
      <button
        onclick={() => currentTool = 'eyedropper'}
        class="p-3 rounded-lg transition-all duration-200 {currentTool === 'eyedropper' ? 'bg-blue-100 text-blue-600 shadow-md' : 'text-gray-600 hover:bg-gray-100'}"
        title="Eyedropper Tool - Press I"
      >
        <i class="fas fa-eye-dropper text-lg"></i>
      </button>

      <!-- Hand Tool -->
      <button
        onclick={() => currentTool = 'hand'}
        class="p-3 rounded-lg transition-all duration-200 {currentTool === 'hand' || isSpacePressed ? 'bg-blue-100 text-blue-600 shadow-md' : 'text-gray-600 hover:bg-gray-100'}"
        title="Hand Tool - Press H or hold Space"
      >
        <i class="fas fa-hand-paper text-lg"></i>
      </button>

      <!-- Zoom Tool -->
      <button
        onclick={() => { currentTool = 'zoom'; zoomMode = 'in'; }}
        class="p-3 rounded-lg transition-all duration-200 {currentTool === 'zoom' ? 'bg-blue-100 text-blue-600 shadow-md' : 'text-gray-600 hover:bg-gray-100'}"
        title="Zoom Tool - Press Z to toggle zoom in/out (Alt+click to zoom out)"
      >
        <i class="fas fa-search-{zoomMode === 'out' ? 'minus' : 'plus'} text-lg"></i>
      </button>

      <!-- Separator -->
      <div class="h-px bg-gray-200 mx-2 my-2"></div>


      <!-- Zoom Level Footer -->
      <div class="relative -mx-2 -mb-2 bg-gray-50 rounded-b-xl border-t border-gray-100">
        <!-- Zoom Level Button with Dropdown -->
        <button
          onclick={() => showZoomDropdown = !showZoomDropdown}
          class="p-2 text-xs text-gray-600 hover:bg-gray-100 transition-all duration-200 flex items-center space-x-1 w-full justify-center rounded-b-xl"
          title="Zoom Levels"
        >
          <span class="font-medium">{Math.round(zoomLevel * 100)}%</span>
          <i class="fas fa-chevron-down text-xs"></i>
        </button>

        <!-- Zoom Dropdown Menu -->
        {#if showZoomDropdown}
          <div class="absolute left-full bottom-0 ml-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-24" onclick={(e) => e.stopPropagation()}>
            <button onclick={() => setZoomLevel(0.25)} class="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 transition-colors">25%</button>
            <button onclick={() => setZoomLevel(0.5)} class="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 transition-colors">50%</button>
            <button onclick={() => setZoomLevel(0.75)} class="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 transition-colors">75%</button>
            <button onclick={() => setZoomLevel(1)} class="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 transition-colors">100%</button>
            <button onclick={() => setZoomLevel(1.25)} class="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 transition-colors">125%</button>
            <button onclick={() => setZoomLevel(1.5)} class="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 transition-colors">150%</button>
            <button onclick={() => setZoomLevel(2)} class="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 transition-colors">200%</button>
            <button onclick={() => setZoomLevel(3)} class="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 transition-colors">300%</button>
            <button onclick={() => setZoomLevel(5)} class="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 transition-colors">500%</button>
          </div>
        {/if}
      </div>

    </div>
  </div>

  <!-- Artboard Canvas -->
  <div
    class="artboard relative bg-white shadow-2xl border border-gray-300 {getCanvasCursor()}"
    style="
      width: {artboardWidthInches}in;
      height: {artboardHeightInches}in;
      transform: scale({zoomLevel * 0.9});
      transition: transform 0.2s ease;
      overflow: {currentTool === 'select' && isImageSelected ? 'visible' : 'hidden'};
    "
  >

    <!-- Artboard Label -->
    <div class="absolute -top-8 left-0 text-sm text-gray-600 font-medium z-50 whitespace-nowrap">
      {artboardWidthInches}" × {artboardHeightInches}" Artboard
    </div>

    <!-- Rulers (optional) -->
    <div class="absolute -left-6 top-0 h-full w-6 bg-gray-100 border-r border-gray-300 text-xs text-gray-500">
      <!-- Vertical ruler markers would go here -->
    </div>
    <div class="absolute -top-6 left-0 w-full h-6 bg-gray-100 border-b border-gray-300 text-xs text-gray-500">
      <!-- Horizontal ruler markers would go here -->
    </div>

    <!-- Main Image within Artboard -->
    <div
      class="absolute image-container"
      style="
        left: {imageX}px;
        top: {imageY}px;
        width: {imageDisplayWidth || imageWidth}px;
        height: {imageDisplayHeight || imageHeight}px;
        z-index: 10;
      "
    >
      <div class="relative w-full h-full">
        <canvas
          bind:this={canvas}
          class="{getCanvasCursor()} shadow-lg border border-gray-200"
          onclick={onCanvasClick}
          onmousedown={onCanvasMouseDown}
          onmousemove={onCanvasMouseMove}
          onmouseleave={onCanvasMouseLeave}
          style="
            background-color: #f8f9fa;
            width: {imageDisplayWidth || imageWidth}px;
            height: {imageDisplayHeight || imageHeight}px;
          "
        ></canvas>

        <!-- Overflow dimming overlay (only visible when image is selected with select tool) -->
        {#if currentTool === 'select' && isImageSelected}
          <!-- Top overflow -->
          {#if imageY < 0}
            <div
              class="absolute bg-black/30 pointer-events-none"
              style="
                left: 0;
                top: 0;
                width: 100%;
                height: {Math.abs(imageY)}px;
                z-index: 15;
              "
            ></div>
          {/if}

          <!-- Left overflow -->
          {#if imageX < 0}
            <div
              class="absolute bg-black/30 pointer-events-none"
              style="
                left: 0;
                top: 0;
                width: {Math.abs(imageX)}px;
                height: 100%;
                z-index: 15;
              "
            ></div>
          {/if}

          <!-- Right overflow -->
          {#if imageX + (imageDisplayWidth || imageWidth) > artboardWidthPx}
            <div
              class="absolute bg-black/30 pointer-events-none"
              style="
                right: 0;
                top: 0;
                width: {(imageX + (imageDisplayWidth || imageWidth)) - artboardWidthPx}px;
                height: 100%;
                z-index: 15;
              "
            ></div>
          {/if}

          <!-- Bottom overflow -->
          {#if imageY + (imageDisplayHeight || imageHeight) > artboardHeightPx}
            <div
              class="absolute bg-black/30 pointer-events-none"
              style="
                left: 0;
                bottom: 0;
                width: 100%;
                height: {(imageY + (imageDisplayHeight || imageHeight)) - artboardHeightPx}px;
                z-index: 15;
              "
            ></div>
          {/if}
        {/if}

        <!-- Resize Handles (only visible when image is selected with select tool) -->
        {#if currentTool === 'select' && isImageSelected}
          <!-- Corner handles -->
          <div
            class="absolute -top-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-nw-resize z-20"
            onmousedown={(e) => handleResizeMouseDown(e, 'nw')}
          ></div>
          <div
            class="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-ne-resize z-20"
            onmousedown={(e) => handleResizeMouseDown(e, 'ne')}
          ></div>
          <div
            class="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-sw-resize z-20"
            onmousedown={(e) => handleResizeMouseDown(e, 'sw')}
          ></div>
          <div
            class="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-se-resize z-20"
            onmousedown={(e) => handleResizeMouseDown(e, 'se')}
          ></div>

          <!-- Selection outline -->
          <div class="absolute -inset-0.5 border-2 border-blue-600 pointer-events-none z-10"></div>
        {/if}

        <!-- Overlay canvas positioned relative to main canvas -->
        <canvas
          bind:this={overlayCanvas}
          class="absolute top-0 left-0 pointer-events-none"
        ></canvas>

      </div>
    </div>

    <!-- Color Swatches (positioned within artboard) -->
    {#each swatchPlaceholders as swatch, i}
      {#if swatch.filled}
        {@const swatchDims = getSwatchDimensions()}
        {@const swatchPos = swatch.data.posX !== undefined ? { x: swatch.data.posX, y: swatch.data.posY } : getSwatchPosition(i)}
        <div
          class="absolute bg-white rounded-lg border border-gray-300 shadow-lg backdrop-blur-sm select-none {currentTool === 'select' ? 'cursor-move' : 'cursor-default'}"
          style="
            left: {swatchPos.x}px;
            top: {swatchPos.y}px;
            width: 2.5in;
            height: 1.5in;
            padding: 0.1in;
            z-index: {isDragging && draggedSwatchIndex === i ? 9999 : 100 + i};
            will-change: transform;
            transform: {isDragging && draggedSwatchIndex === i ? 'scale(1.05)' : 'scale(1)'};
            transition: {isDragging && draggedSwatchIndex === i ? 'none' : 'transform 0.2s ease'};
          "
          onmousedown={(e) => handleMouseDown(e, i)}
        >
          <div style="display: flex; flex-direction: column; gap: 0.05in; height: 100%;">
            <div
              class="rounded-lg border border-gray-200"
              style="
                background-color: {swatch.data.hexColor};
                height: 1in;
                width: 100%;
              "
            ></div>
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <p class="font-medium truncate" style="font-size: 10pt; color: #111; line-height: 1.2;">{swatch.data.description}</p>
              <p class="font-mono" style="font-size: 8pt; color: #666; line-height: 1.1;">
                {colorFormat === 'RGB'
                  ? `RGB(${swatch.data.red}, ${swatch.data.green}, ${swatch.data.blue})`
                  : swatch.data.cmyk
                }
              </p>
            </div>
          </div>
        </div>
      {/if}
    {/each}

  </div>
</div>

<!-- Modal -->
{#if showModal}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">Add Color Description</h3>
          <button
            onclick={() => showModal = false}
            class="text-gray-400 hover:text-gray-600 text-xl"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Selected Color Display -->
        <div
          class="w-24 h-24 rounded-xl border-2 border-gray-200 mx-auto mb-6 shadow-lg"
          style="background-color: {selectedColor}"
        ></div>

        <!-- Form -->
        <form onsubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              bind:value={description}
              placeholder="Enter a description for this color..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autofocus
            />
          </div>
          <button
            type="submit"
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <i class="fas fa-plus mr-2"></i>
            Add to Palette
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- Floating Eyedropper Preview -->
{#if showEyedropper && currentTool === 'eyedropper'}

  <!-- Preview Window -->
  <div
    class="fixed pointer-events-none z-50 bg-white rounded-lg shadow-xl border border-gray-300 p-3"
    style="
      left: {Math.min(eyedropperX + 10, window.innerWidth - 200)}px;
      top: {Math.min(eyedropperY + 10, window.innerHeight - 100)}px;
    "
  >
    <div class="flex items-center space-x-3">
      <!-- Color Swatch -->
      <div
        class="w-10 h-10 rounded border border-gray-200 shadow-inner"
        style="background-color: {previewColor};"
      ></div>

      <!-- Color Values -->
      <div class="text-xs">
        <div class="font-mono text-gray-800">
          {colorFormat === 'RGB'
            ? `RGB(${previewRed}, ${previewGreen}, ${previewBlue})`
            : (() => {
                const cmyk = rgbToCmyk(previewRed, previewGreen, previewBlue);
                return `CMYK(${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k})`;
              })()
          }
        </div>
        <div class="text-gray-500 mt-1">Click to add swatch</div>
      </div>
    </div>
  </div>
{/if}