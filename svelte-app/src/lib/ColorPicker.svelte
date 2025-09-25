<script>
  import { onMount } from 'svelte';

  let {
    loadSavedSwatches,
    imageSrc = '/dunes.png',
    imageId = null,
    artboardId,
    artboardWidth,
    artboardHeight,
    existingImages = [],
    existingSwatches = [],
    enableMultipleImages = false,
    onSwatchCreated,
    onImageUpload
  } = $props();

  // Multiple images support
  let artboardImages = $state([]);
  let selectedImageId = $state(null);
  let selectedImageIndex = $state(-1);

  // Throttle validation error messages to prevent console flooding
  let lastValidationLogTime = 0;
  const VALIDATION_LOG_THROTTLE = 1000; // Only log validation errors once per second

  // Helper function to throttle validation error messages
  function throttledValidationLog(message, ...args) {
    const now = Date.now();
    if (now - lastValidationLogTime > VALIDATION_LOG_THROTTLE) {
      console.error(message, ...args);
      lastValidationLogTime = now;
    }
  }

  // Throttle resize operations to improve performance
  let lastResizeTime = 0;
  const RESIZE_THROTTLE = 16; // ~60fps (16ms between updates)

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
  let placementMode = $state(false);
  let pendingImageData = $state(null);
  let placementPreviewX = $state(0);
  let placementPreviewY = $state(0);
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

  // Swatch selection state
  let selectedSwatchIndex = $state(-1);

  // Image manipulation state
  let isDraggingImage = $state(false);
  let isResizingImage = $state(false);
  let imageDragStart = $state({ x: 0, y: 0 });
  let resizeStart = $state({ x: 0, y: 0, width: 0, height: 0 });
  let resizeHandle = $state(''); // 'nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w'
  let resizeUpdateTimeout = null;

  let samplingSize = $state(1);
  let colorFormat = $state('RGB');

  // Manual swatch placement states
  let isPlacingSwatch = $state(false);
  let pendingSwatchData = $state(null);
  let swatchPlacementX = $state(0);
  let swatchPlacementY = $state(0);
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
  let imageCanvases = new Map(); // Map of imageId -> canvas element

  // Track canvas loading state to trigger connection line re-render
  let canvasLoadState = $state(0);
  let colorPreview;


  onMount(() => {
    // Initialize artboard images from existing images
    if (enableMultipleImages && existingImages.length > 0) {
      artboardImages = existingImages.map(img => ({
        id: img.id,
        src: `/${img.file_path}`,
        x: img.image_x || 0,
        y: img.image_y || 0,
        width: img.image_width || 400,
        height: img.image_height || 300,
        originalWidth: img.image_width || 400, // Will be updated when actual image loads
        originalHeight: img.image_height || 300, // Will be updated when actual image loads
        filename: img.file_path,
        needsOriginalDimensions: true // Flag to load actual dimensions
      }));

      // Load actual original dimensions for each image
      artboardImages.forEach(async (imageData, index) => {
        const img = new Image();
        img.onload = () => {
          // Update with actual original dimensions
          const updatedImages = [...artboardImages];
          updatedImages[index] = {
            ...updatedImages[index],
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
            needsOriginalDimensions: false
          };
          artboardImages = updatedImages;
        };
        img.src = imageData.src;
      });

      // Don't auto-select images - only select when clicked
    }

    // Load artboard data
    loadArtboardData();

    // Load saved swatches from database with delay to ensure artboardId is available
    setTimeout(() => {
      if (artboardId) {
        loadSavedSwatchesFromDB();
      }
    }, 200);

    // Initialize swatch placeholders with existing swatches
    createPlaceholders();

    // Add global mouse event listeners for smooth dragging
    const handleGlobalMouseMove = (event) => handleMouseMove(event);
    const handleGlobalMouseUp = () => handleMouseUp();

    // Add keyboard event listeners for alt key and spacebar detection
    const handleKeyDown = (event) => {
      // Skip all keyboard shortcuts when modal is open
      if (showModal) {
        return;
      }

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

      // Handle delete key for selected items
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        handleDeleteKey();
        return;
      }

      // Handle tool keyboard shortcuts
      if (!isSpacePressed) { // Don't switch tools while spacebar is held
        switch (event.code) {
          case 'KeyV':
            event.preventDefault();
            currentTool = 'select';
            // Clear all selections when switching to select tool
            selectedImageId = null;
            selectedImageIndex = -1;
            isImageSelected = false;
            selectedSwatchIndex = -1;
            break;
          case 'KeyI':
            event.preventDefault();
            currentTool = 'eyedropper';
            // Clear all selections when switching to eyedropper
            selectedImageId = null;
            selectedImageIndex = -1;
            isImageSelected = false;
            selectedSwatchIndex = -1;
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
      // Skip all keyboard shortcuts when modal is open
      if (showModal) {
        return;
      }

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

    // Only load the single image if we're NOT in multiple images mode
    if (!enableMultipleImages) {
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
    }

    // Return cleanup function
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  });

  function loadImageToCanvas(img) {
    // Skip this function entirely if using multiple images
    if (enableMultipleImages) {
      return;
    }

    // For the new multiple image system, we mainly need to set up the primary canvas
    // if it exists (for the first image) to support eyedropper functionality
    if (!canvas) {
      console.log('No canvas available, skipping canvas setup');
      return;
    }

    try {
      // Get container width (assuming max width of container)
      const containerWidth = canvas.parentElement?.offsetWidth || 800;
      const maxWidth = Math.min(containerWidth, 1200); // Max width of 1200px

      // Calculate scaled dimensions maintaining aspect ratio
      const aspectRatio = img.height / img.width;
      const scaledWidth = Math.min(img.width, maxWidth);
      const scaledHeight = scaledWidth * aspectRatio;

      canvas.width = scaledWidth;
      canvas.height = scaledHeight;

      if (overlayCanvas) {
        overlayCanvas.width = scaledWidth;
        overlayCanvas.height = scaledHeight;
        overlayCanvas.style.width = scaledWidth + 'px';
        overlayCanvas.style.height = scaledHeight + 'px';
      }

      imageWidth = scaledWidth;
      imageHeight = scaledHeight;

      // Initialize display dimensions to match canvas if not already set
      if (!imageDisplayWidth) imageDisplayWidth = scaledWidth;
      if (!imageDisplayHeight) imageDisplayHeight = scaledHeight;

      ctx = canvas.getContext('2d');
      if (overlayCanvas) {
        overlayCtx = overlayCanvas.getContext('2d');
      }
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

      createPlaceholders();

      console.log('Canvas updated:', scaledWidth, 'x', scaledHeight);
    } catch (error) {
      console.error('Error loading image to canvas:', error);
    }
  }

  function initializeEmptyCanvas() {
    // Skip this function entirely if using multiple images
    if (enableMultipleImages) {
      return;
    }

    if (!canvas) {
      console.log('No canvas available for initialization');
      return;
    }
    const containerWidth = canvas.parentElement?.offsetWidth || 800;
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
    // Don't trigger actions if we're dragging a swatch, manipulating image, or placing a swatch
    if (isDragging || isDraggingImage || isResizingImage || isPlacingSwatch) return;

    // Get coordinates from the img element that was clicked
    const rect = event.target.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    // Handle different tool modes
    switch (currentTool) {
      case 'eyedropper':
        handleEyedropperClick(x, y, event.target);
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
      case 'place':
        handleImagePlacement(event);
        break;
      default:
        // Default to eyedropper behavior for backward compatibility
        handleEyedropperClick(x, y, event.target);
    }
  }

  function handleEyedropperClick(x, y, targetElement) {
    // Find which image this img element belongs to by checking artboardImages
    let clickedImageId = null;
    let clickedImage = null;

    // Use data-image-id attribute for reliable matching
    const imageIdAttr = targetElement.getAttribute('data-image-id');
    if (imageIdAttr) {
      clickedImageId = parseInt(imageIdAttr);
      clickedImage = artboardImages.find(img => img.id === clickedImageId);
    }

    if (!clickedImageId || !clickedImage) {
      console.log('No image found for eyedropper click');
      return;
    }

    // Get the canvas element for the clicked image
    const clickedCanvas = imageCanvases.get(clickedImageId);
    if (!clickedCanvas) {
      console.log('Canvas not found for clicked image');
      return;
    }

    const clickedCtx = clickedCanvas.getContext('2d');
    if (!clickedCtx) {
      console.log('Cannot get canvas context for clicked image');
      return;
    }

    // Get the img element's displayed size for consistent coordinate calculation
    const imgElement = document.querySelector(`img[data-image-id="${clickedImageId}"]`);
    if (!imgElement) {
      console.log('Image element not found for coordinate calculation');
      return;
    }

    const imgRect = imgElement.getBoundingClientRect();

    // Scale coordinates from displayed image size to canvas size (same as hover preview)
    const scaleX = clickedCanvas.width / imgRect.width;
    const scaleY = clickedCanvas.height / imgRect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    // Make sure coordinates are within canvas bounds
    if (canvasX < 0 || canvasX >= clickedCanvas.width || canvasY < 0 || canvasY >= clickedCanvas.height) {
      console.log('Click coordinates outside canvas bounds');
      return;
    }

    const { red, green, blue } = getAverageColor(clickedCtx, canvasX, canvasY, samplingSize);
    const hexColor = rgbToHex(red, green, blue);

    console.log('Click sampling - Canvas coords:', canvasX, canvasY, 'RGB:', red, green, blue, 'Hex:', hexColor);

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
      posY: swatchPos.y, // Already artboard-relative
      imageId: clickedImageId // Track which image this color was sampled from
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

  function selectImage(imageId, index) {
    selectedImageId = imageId;
    selectedImageIndex = index;
    // Deselect any selected swatch when selecting image
    selectedSwatchIndex = -1;
    console.log('Selected image:', imageId, 'at index:', index);
  }

  function getSelectedImage() {
    return artboardImages.find(img => img.id === selectedImageId);
  }

  function findNextAvailableGridPosition() {
    const SWATCH_WIDTH = 2.5 * 96; // 2.5 inches in pixels
    const SWATCH_HEIGHT = 1.5 * 96; // 1.5 inches in pixels
    const GRID_SPACING = 10; // 10px column spacing
    const MARGIN = 20; // Margin from artboard edges

    // Get artboard dimensions in pixels
    const artboardWidth = artboardWidthInches * 96; // Convert inches to pixels at 96 DPI
    const artboardHeight = artboardHeightInches * 96;

    // Calculate grid dimensions
    const gridCellWidth = SWATCH_WIDTH + GRID_SPACING;
    const gridCellHeight = SWATCH_HEIGHT + GRID_SPACING;

    // Create occupancy grid for the entire artboard
    const cols = Math.floor((artboardWidth - 2 * MARGIN) / gridCellWidth);
    const rows = Math.floor((artboardHeight - 2 * MARGIN) / gridCellHeight);

    // Initialize grid as empty
    const occupancyGrid = Array(rows).fill().map(() => Array(cols).fill(false));

    // Mark occupied positions by existing swatches
    let existingSwatchCount = 0;
    swatchPlaceholders.forEach((swatch, index) => {
      if (swatch.filled) {
        existingSwatchCount++;
        const swatchX = swatch.data.posX !== undefined ? swatch.data.posX : 0;
        const swatchY = swatch.data.posY !== undefined ? swatch.data.posY : 0;

        console.log(`Existing swatch ${index} at position:`, { x: swatchX, y: swatchY });

        // Convert swatch position to grid coordinates
        const gridCol = Math.floor((swatchX - MARGIN) / gridCellWidth);
        const gridRow = Math.floor((swatchY - MARGIN) / gridCellHeight);

        // Mark as occupied if within grid bounds
        if (gridRow >= 0 && gridRow < rows && gridCol >= 0 && gridCol < cols) {
          console.log(`Marking grid cell [${gridRow}, ${gridCol}] as occupied`);
          occupancyGrid[gridRow][gridCol] = true;
        }
      }
    });

    console.log(`Found ${existingSwatchCount} existing swatches to avoid`);

    // Mark occupied positions by images
    artboardImages.forEach(image => {
      console.log('Checking image collision:', {
        imagePos: { x: image.x, y: image.y, w: image.width, h: image.height },
        artboardSize: { w: artboardWidth, h: artboardHeight }
      });

      const imgLeft = image.x;
      const imgRight = image.x + image.width;
      const imgTop = image.y;
      const imgBottom = image.y + image.height;

      // Check which grid cells this image overlaps
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const gridLeft = MARGIN + col * gridCellWidth;
          const gridRight = gridLeft + SWATCH_WIDTH;
          const gridTop = MARGIN + row * gridCellHeight;
          const gridBottom = gridTop + SWATCH_HEIGHT;

          // More explicit overlap detection
          const horizontalOverlap = gridRight > imgLeft && gridLeft < imgRight;
          const verticalOverlap = gridBottom > imgTop && gridTop < imgBottom;
          const overlaps = horizontalOverlap && verticalOverlap;

          if (overlaps) {
            console.log('Grid cell blocked by image:', {
              gridCell: { row, col, left: gridLeft, top: gridTop, right: gridRight, bottom: gridBottom },
              image: { left: imgLeft, top: imgTop, right: imgRight, bottom: imgBottom }
            });
            occupancyGrid[row][col] = true;
          }
        }
      }
    });

    // Find the first available position (left to right, top to bottom)
    console.log('Searching for available grid position in', rows, 'x', cols, 'grid');
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!occupancyGrid[row][col]) {
          const position = {
            x: MARGIN + col * gridCellWidth,
            y: MARGIN + row * gridCellHeight
          };
          console.log('Found available position:', { row, col, position });
          return position;
        }
      }
    }

    // If no space available, place at origin (fallback - overlapping will be handled later)
    console.log('No available grid position found, using fallback');
    return {
      x: MARGIN,
      y: MARGIN
    };
  }

  // Action to draw image data onto canvas for eyedropper functionality
  function drawImageOnCanvas(canvas, image) {
    let currentImage = null;
    let isLoaded = false;

    // Store canvas reference immediately when action is created
    imageCanvases.set(image.id, canvas);

    function loadAndDrawImage() {
      // Validate dimensions before setting
      if (!image.width || !image.height || image.width <= 0 || image.height <= 0 ||
          image.width === null || image.height === null ||
          isNaN(image.width) || isNaN(image.height)) {
        console.error('Invalid image dimensions:', image.width, 'x', image.height);
        return;
      }

      // Set canvas internal dimensions to original image size for crisp rendering
      const originalWidth = image.originalWidth || image.width;
      const originalHeight = image.originalHeight || image.height;

      canvas.width = originalWidth;
      canvas.height = originalHeight;

      // Set display size via CSS
      canvas.style.width = image.width + 'px';
      canvas.style.height = image.height + 'px';

      // Only reload image if source changed or not yet loaded
      if (!isLoaded || currentImage?.src !== image.src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = function() {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Update canvas reference to ensure it's current
          imageCanvases.set(image.id, canvas);
          currentImage = { src: image.src, width: image.width, height: image.height };
          isLoaded = true;
          console.log('Canvas loaded and stored for image ID:', image.id);

          // Trigger connection line re-render by updating state
          canvasLoadState++;
        };

        img.onerror = function() {
          console.error('Failed to load image for canvas:', image.src);
        };

        img.src = image.src;
      } else {
        // Just update display size without reloading image
        canvas.style.width = image.width + 'px';
        canvas.style.height = image.height + 'px';
      }
    }

    // Initial load
    loadAndDrawImage();

    return {
      update(newImage) {
        image = newImage; // Update the reference
        loadAndDrawImage();
      },
      destroy() {
        imageCanvases.delete(image.id);
      }
    };
  }

  async function handleImagePlacement(event) {
    if (!placementMode || !pendingImageData) return;

    try {
      // Get placement coordinates relative to artboard
      const artboardRect = document.querySelector('.artboard')?.getBoundingClientRect();
      if (!artboardRect) return;

      const placeX = event.clientX - artboardRect.left;
      const placeY = event.clientY - artboardRect.top;

      // Create new image object for the artboard
      const newImage = {
        id: Date.now(), // Temporary ID
        src: pendingImageData.url,
        x: placeX, // Top-left corner at cursor position
        y: placeY,
        width: pendingImageData.originalWidth, // Full resolution
        height: pendingImageData.originalHeight,
        originalWidth: pendingImageData.originalWidth,
        originalHeight: pendingImageData.originalHeight,
        filename: pendingImageData.filename
      };

      // Save to database via artboard API
      if (artboardId) {
        const response = await fetch(`/api/artboards/${artboardId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: pendingImageData.filename,
            image_x: newImage.x,
            image_y: newImage.y,
            image_width: newImage.width,
            image_height: newImage.height
          })
        });

        const result = await response.json();
        if (result.status === 'success') {
          // Update the image with the real database ID
          newImage.id = result.image_id;
          console.log('Image saved to database with ID:', result.image_id);
        } else {
          console.error('Failed to save image to database:', result.message);
        }
      }

      // Add to artboard images array
      artboardImages = [...artboardImages, newImage];

      // Auto-select the newly placed image
      selectedImageId = newImage.id;
      selectedImageIndex = artboardImages.length - 1;

      // Exit placement mode
      placementMode = false;
      pendingImageData = null;
      currentTool = 'select';

      console.log('Added new image to artboard:', newImage);
      console.log('Total images on artboard:', artboardImages.length);

    } catch (error) {
      console.error('Error placing image:', error);
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
        // Check if we have a selected image to work with
        const selectedImage = getSelectedImage();
        if (selectedImage) {
          // For dragging, we need to calculate the offset from the click point to the image position
          // Since the click is on the image canvas, we need to account for the image's position on the artboard
          isDraggingImage = true;
          imageDragStart = {
            x: event.clientX - selectedImage.x,
            y: event.clientY - selectedImage.y
          };
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

  function handleResizeMouseDown(event, handle, image) {
    event.preventDefault();
    event.stopPropagation();

    // Ensure the image is selected
    selectImage(image.id, artboardImages.findIndex(img => img.id === image.id));

    isResizingImage = true;
    resizeHandle = handle;
    resizeStart = {
      x: image.x,
      y: image.y,
      mouseX: event.clientX,
      mouseY: event.clientY,
      width: image.width,
      height: image.height,
      imageId: image.id
    };
  }

  async function saveImagePosition() {
    if (!selectedImageId) {
      console.log('No selected image to save position for');
      return;
    }

    const selectedImage = getSelectedImage();
    if (!selectedImage) {
      console.log('Selected image not found');
      return;
    }

    try {
      const response = await fetch(`/api/palettes/${selectedImageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_x: selectedImage.x,
          image_y: selectedImage.y
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        console.log('Image position saved successfully');
      } else {
        console.error('Failed to save image position:', result.message);
      }
    } catch (error) {
      console.error('Error saving image position:', error);
    }
  }

  async function saveImageSize() {
    if (!selectedImageId) {
      console.log('No selected image to save size for');
      return;
    }

    const selectedImage = getSelectedImage();
    if (!selectedImage) {
      console.log('Selected image not found');
      return;
    }

    try {
      const response = await fetch(`/api/palettes/${selectedImageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_width: selectedImage.width,
          image_height: selectedImage.height
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        console.log('Image size saved successfully');
      } else {
        console.error('Failed to save image size:', result.message);
      }
    } catch (error) {
      console.error('Error saving image size:', error);
    }
  }

  function onCanvasMouseMove(event) {
    // Don't show color preview or sampling indicator when dragging
    if (isDragging) return;

    // Clear overlay if it exists (overlay canvas removed to eliminate artifacts)
    if (overlayCtx && overlayCanvas) {
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    // Get the rect from the actual target canvas, not the global canvas
    const targetCanvas = event.currentTarget;
    const rect = targetCanvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    // Only show color preview and sampling for eyedropper tool
    if (currentTool === 'eyedropper') {
      // Find which image this img element belongs to by checking artboardImages
      let hoveredImageId = null;
      let hoveredImage = null;

      // The targetCanvas is actually an img element, so use the data-image-id attribute
      const imageIdAttr = targetCanvas.getAttribute('data-image-id');
      if (imageIdAttr) {
        hoveredImageId = parseInt(imageIdAttr);
        hoveredImage = artboardImages.find(img => img.id === hoveredImageId);
      }

      if (!hoveredImageId || !hoveredImage) {
        updateToolbarColorPreview('#000000', 0, 0, 0);
        return;
      }

      // Get the canvas for the hovered image
      const hoveredCanvas = imageCanvases.get(hoveredImageId);
      if (!hoveredCanvas) {
        console.log('Hover: Canvas not found for image ID:', hoveredImageId, 'Available canvases:', Array.from(imageCanvases.keys()));
        updateToolbarColorPreview('#000000', 0, 0, 0);
        return;
      }

      const hoveredCtx = hoveredCanvas.getContext('2d');
      if (!hoveredCtx) {
        updateToolbarColorPreview('#000000', 0, 0, 0);
        return;
      }

      // Account for zoom by using actual displayed canvas size
      const displayedCanvasWidth = rect.width;
      const displayedCanvasHeight = rect.height;

      // Scale from displayed canvas coordinates to internal canvas coordinates
      const scaleX = hoveredCanvas.width / displayedCanvasWidth;
      const scaleY = hoveredCanvas.height / displayedCanvasHeight;

      const canvasX = x * scaleX;
      const canvasY = y * scaleY;

      console.log('Hover: Mouse pos:', x, y, 'Scale:', scaleX, scaleY, 'Canvas pos:', canvasX, canvasY);

      // Make sure we're within canvas bounds
      if (canvasX >= 0 && canvasX < hoveredCanvas.width && canvasY >= 0 && canvasY < hoveredCanvas.height) {
        // Test if canvas has image data by sampling a pixel
        const testPixel = hoveredCtx.getImageData(Math.floor(canvasX), Math.floor(canvasY), 1, 1);

        const { red, green, blue } = getAverageColor(hoveredCtx, canvasX, canvasY, samplingSize);
        const hexColor = rgbToHex(red, green, blue);

        console.log('Hover sampling - Canvas coords:', canvasX, canvasY, 'RGB:', red, green, blue, 'Hex:', hexColor);

        // Show preview window but no floating icon - use crosshair cursor
        eyedropperX = event.clientX;
        eyedropperY = event.clientY;
        showEyedropper = true;

        updateToolbarColorPreview(hexColor, red, green, blue);
      } else {
        updateToolbarColorPreview('#000000', 0, 0, 0);
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
      case 'place': return 'cursor-crosshair';
      case 'upload': return 'cursor-default';
      default: return 'cursor-default';
    }
  }

  function onCanvasMouseLeave() {
    if (overlayCtx && overlayCanvas) {
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
    showEyedropper = false;
  }

  function drawSamplingIndicator(x, y) {
    // Sampling indicator disabled to eliminate overlay artifacts
    // Visual feedback now provided through cursor and toolbar preview
    if (!overlayCtx || !overlayCanvas) return;

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
    // Ensure coordinates are integers for getImageData
    x = Math.floor(x);
    y = Math.floor(y);

    const halfSize = Math.floor(size / 2);
    const startX = Math.max(0, x - halfSize);
    const startY = Math.max(0, y - halfSize);
    const endX = Math.min(ctx.canvas.width, x + halfSize + 1);
    const endY = Math.min(ctx.canvas.height, y + halfSize + 1);

    const width = endX - startX;
    const height = endY - startY;

    if (width <= 0 || height <= 0) {
      return { red: 0, green: 0, blue: 0 };
    }

    try {
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
    } catch (error) {
      console.error('getAverageColor error:', error);
      return { red: 0, green: 0, blue: 0 };
    }
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
    // Keep selectedColor in sync with preview for consistency
    selectedColor = hexColor;
  }

  function createPlaceholders() {
    const maxSwatches = 8;

    // If we have existing swatches, load them first
    if (existingSwatches && existingSwatches.length > 0) {
      // Start with existing swatches
      swatchPlaceholders = existingSwatches.map(swatch => ({
        filled: true,
        data: {
          hexColor: swatch.hex_color,
          red: swatch.red,
          green: swatch.green,
          blue: swatch.blue,
          cmyk: swatch.cmyk,
          description: swatch.description,
          posX: parseFloat(swatch.pos_x) || 0,
          posY: parseFloat(swatch.pos_y) || 0,
          sampleX: swatch.sample_x,
          sampleY: swatch.sample_y,
          sampleSize: swatch.sample_size || 1,
          imageId: swatch.image_id
        }
      }));

      // Set the index to the next available slot
      swatchIndex = existingSwatches.length;

      // Add empty placeholders to reach maxSwatches
      const remainingSlots = Math.max(maxSwatches - existingSwatches.length, 0);
      for (let i = 0; i < remainingSlots; i++) {
        swatchPlaceholders.push({
          filled: false,
          data: null
        });
      }
    } else {
      // Create all empty placeholders
      swatchPlaceholders = Array(maxSwatches).fill().map(() => ({
        filled: false,
        data: null
      }));
      swatchIndex = 0;
    }
  }

  function handleSwatchPlacement(event) {
    if (!isPlacingSwatch || !pendingSwatchData) return;

    // Stop propagation to prevent other click handlers
    event.stopPropagation();

    // Get click position relative to artboard container
    const rect = event.currentTarget.getBoundingClientRect();
    let posX = event.clientX - rect.left;
    let posY = event.clientY - rect.top;

    // Account for zoom and pan transforms to get actual position on artboard
    posX = (posX - panX) / zoomLevel;
    posY = (posY - panY) / zoomLevel;

    console.log('Swatch placement - Raw coords:', event.clientX - rect.left, event.clientY - rect.top);
    console.log('Swatch placement - Transformed coords:', posX, posY);
    console.log('Zoom level:', zoomLevel, 'Pan:', panX, panY);

    // Place the swatch at the clicked position
    updateSwatch(
      pendingSwatchData.hexColor,
      pendingSwatchData.red,
      pendingSwatchData.green,
      pendingSwatchData.blue,
      pendingSwatchData.description,
      posX,
      posY,
      pendingSwatchData.sampleX,
      pendingSwatchData.sampleY,
      pendingSwatchData.imageId
    );

    // Exit placement mode
    isPlacingSwatch = false;
    pendingSwatchData = null;
  }

  async function handleSubmit() {
    if (pendingClickData) {
      // Find next available grid position
      const nextPosition = findNextAvailableGridPosition();
      console.log('handleSubmit: Grid position calculated:', nextPosition);

      // Create swatch immediately at the grid position
      await updateSwatch(
        pendingClickData.hexColor,
        pendingClickData.red,
        pendingClickData.green,
        pendingClickData.blue,
        description.trim(), // Optional description
        nextPosition.x,
        nextPosition.y,
        pendingClickData.sampleX,
        pendingClickData.sampleY,
        pendingClickData.imageId
      );

      console.log('handleSubmit: Swatch created at position:', nextPosition.x, nextPosition.y);

      // Clean up
      showModal = false;
      description = '';
      pendingClickData = null;
    }
  }

  async function updateSwatch(hexColor, red, green, blue, desc, posX, posY, sampleX, sampleY, imageId) {
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
      sampleY,
      sampleSize: samplingSize,
      imageId: imageId // Use the imageId passed as parameter
    };

    console.log('updateSwatch: Creating swatch with posX:', posX, 'posY:', posY);

    // Add to local array first
    swatchPlaceholders[swatchIndex] = {
      filled: true,
      data: swatchData
    };

    swatchIndex++;

    // Save to database immediately with the correct image ID
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
          image_id: imageId || swatchData.imageId, // Use the imageId parameter first, then fallback
          pos_x: posX,
          pos_y: posY,
          sample_x: sampleX,
          sample_y: sampleY,
          sample_size: samplingSize,
          artboard_id: artboardId // Also include artboard ID
        }])
      });

      console.log('updateSwatch: Saving to database - pos_x:', posX, 'pos_y:', posY);

      const result = await response.json();

      if (result.status !== 'success') {
        console.error('Failed to save swatch:', result.message);
      }
    } catch (error) {
      console.error('Error saving swatch:', error);
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Upload the image file
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.status === 'success') {
        // Enter placement mode with thumbnail preview
        placementMode = true;
        pendingImageData = {
          filename: uploadResult.filename,
          url: `/${uploadResult.filename}`,
          originalWidth: 400, // Will be updated when image loads
          originalHeight: 300
        };

        // Load image to get actual dimensions
        const img = new Image();
        img.onload = () => {
          pendingImageData.originalWidth = img.naturalWidth;
          pendingImageData.originalHeight = img.naturalHeight;
        };
        img.src = pendingImageData.url;

        // Switch to placement tool
        currentTool = 'place';
      } else {
        console.error('Upload failed:', uploadResult.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      // Reset the input
      event.target.value = '';
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
        image_id: swatch.data.imageId || imageId, // Use imageId from swatch data, fallback to global imageId
        pos_x: swatch.data.posX,
        pos_y: swatch.data.posY,
        sample_x: swatch.data.sampleX,
        sample_y: swatch.data.sampleY,
        sample_size: swatch.data.sampleSize || 1
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
    if (!artboardId) return;

    console.log('loadSavedSwatchesFromDB: Loading swatches for artboard', artboardId);

    try {
      const response = await fetch(`/api/swatches/artboard/${artboardId}`);
      const result = await response.json();

      console.log('loadSavedSwatchesFromDB: API response:', result);

      if (result.status === 'success' && result.data.length > 0) {
        console.log('loadSavedSwatchesFromDB: Found', result.data.length, 'saved swatches');
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
              posX: parseFloat(swatch.pos_x) || 0,
              posY: parseFloat(swatch.pos_y) || 0,
              sampleX: swatch.sample_x,
              sampleY: swatch.sample_y,
              sampleSize: swatch.sample_size || 1,
              imageId: swatch.image_id
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
    // Prevent event from bubbling to canvas mouse handlers
    event.preventDefault();
    event.stopPropagation();

    // Smart tool switching: if in eyedropper mode and clicking existing swatch, switch to select mode
    if (currentTool === 'eyedropper') {
      currentTool = 'select';
      // Clear other selections but select this swatch
      selectedImageId = null;
      selectedImageIndex = -1;
      isImageSelected = false;
      selectedSwatchIndex = index;
    }

    // Only allow swatch dragging when select tool is active
    if (currentTool !== 'select') {
      return;
    }

    // If we're here, we're in select mode (either originally or switched from eyedropper)
    // Deselect any selected image when clicking on swatch (if not already done above)
    if (currentTool === 'select' && selectedSwatchIndex !== index) {
      selectedImageId = null;
      selectedImageIndex = -1;
      isImageSelected = false;
      selectedSwatchIndex = index;
    }

    isDragging = true;
    draggedSwatchIndex = index;

    const swatch = swatchPlaceholders[index];

    // Initialize position if not set
    if (swatch.data.posX === undefined) {
      const currentPos = getSwatchPosition(index);
      swatch.data.posX = currentPos.x;
      swatch.data.posY = currentPos.y;
    }

    // Calculate offset from mouse to swatch position relative to artboard
    const artboardRect = document.querySelector('.artboard').getBoundingClientRect();
    const mouseX = event.clientX - artboardRect.left;
    const mouseY = event.clientY - artboardRect.top;

    dragOffset = {
      x: mouseX - swatch.data.posX,
      y: mouseY - swatch.data.posY
    };


    // Clear any sampling indicators
    if (overlayCtx && overlayCanvas) {
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
  }

  function handleMouseMove(event) {
    // Handle swatch placement preview
    if (isPlacingSwatch && pendingSwatchData) {
      const artboardRect = document.querySelector('.artboard')?.getBoundingClientRect();
      if (artboardRect) {
        swatchPlacementX = event.clientX - artboardRect.left;
        swatchPlacementY = event.clientY - artboardRect.top;
      }
    }

    // Handle image placement preview
    if (currentTool === 'place' && placementMode && pendingImageData) {
      const artboardRect = document.querySelector('.artboard')?.getBoundingClientRect();
      if (artboardRect) {
        placementPreviewX = event.clientX - artboardRect.left;
        placementPreviewY = event.clientY - artboardRect.top;
      }
    }

    // Handle swatch dragging
    if (isDragging && draggedSwatchIndex !== -1) {
      const swatch = swatchPlaceholders[draggedSwatchIndex];
      if (swatch && swatch.filled) {
        // Calculate new position relative to artboard container
        const artboardRect = document.querySelector('.artboard').getBoundingClientRect();
        const mouseX = event.clientX - artboardRect.left;
        const mouseY = event.clientY - artboardRect.top;

        const newX = mouseX - dragOffset.x;
        const newY = mouseY - dragOffset.y;

        // No boundary constraints for now - let swatches move freely
        swatch.data.posX = newX;
        swatch.data.posY = newY;
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
    } else if (isDraggingImage && currentTool === 'select' && selectedImageId) {
      // Handle image dragging with select tool for the selected image
      const selectedImage = getSelectedImage();
      if (selectedImage) {
        const newX = event.clientX - imageDragStart.x;
        const newY = event.clientY - imageDragStart.y;

        // Update the selected image position in the artboardImages array
        const imageIndex = artboardImages.findIndex(img => img.id === selectedImageId);
        if (imageIndex !== -1) {
          artboardImages[imageIndex] = {
            ...artboardImages[imageIndex],
            x: newX,
            y: newY
          };
          artboardImages = [...artboardImages]; // Trigger reactivity
        }
      }

      // Allow free positioning when image is selected (like resize mode)
      // No bounds checking - image can go outside artboard
    } else if (isResizingImage && currentTool === 'select' && selectedImageId) {
      // Handle image resizing for the selected image
      const selectedImage = getSelectedImage();
      if (!selectedImage || !resizeStart.imageId) return;

      // Don't resize if original dimensions aren't loaded yet (race condition prevention)
      if (selectedImage.needsOriginalDimensions) {
        console.log('Resize blocked - waiting for original dimensions to load');
        return;
      }

      // Throttle resize operations to improve performance and reduce console spam
      const now = Date.now();
      if (now - lastResizeTime < RESIZE_THROTTLE) {
        return;
      }
      lastResizeTime = now;

      const deltaX = event.clientX - resizeStart.mouseX;
      const deltaY = event.clientY - resizeStart.mouseY;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = selectedImage.x;
      let newY = selectedImage.y;

      // Calculate aspect ratio with fallbacks to ensure it's never null/undefined
      const originalWidth = selectedImage.originalWidth || selectedImage.width || resizeStart.width;
      const originalHeight = selectedImage.originalHeight || selectedImage.height || resizeStart.height;
      const aspectRatio = originalHeight / originalWidth;

      // Validate aspect ratio
      if (!aspectRatio || isNaN(aspectRatio) || !isFinite(aspectRatio)) {
        throttledValidationLog('Invalid aspect ratio calculated:', aspectRatio, 'originalWidth:', originalWidth, 'originalHeight:', originalHeight);
        return; // Don't proceed with invalid aspect ratio
      }

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
          newX = resizeStart.x + (resizeStart.width - newWidth);
          break;
        case 'ne': // Northeast corner
          newWidth = resizeStart.width + deltaX;
          if (!event.ctrlKey) {
            newHeight = newWidth * aspectRatio;
          } else {
            newHeight = resizeStart.height - deltaY;
          }
          newY = resizeStart.y + (resizeStart.height - newHeight);
          break;
        case 'nw': // Northwest corner
          newWidth = resizeStart.width - deltaX;
          if (!event.ctrlKey) {
            newHeight = newWidth * aspectRatio;
          } else {
            newHeight = resizeStart.height - deltaY;
          }
          newX = resizeStart.x + (resizeStart.width - newWidth);
          newY = resizeStart.y + (resizeStart.height - newHeight);
          break;
      }

      // Validate and constrain dimensions - never allow null/undefined/NaN
      if (!newWidth || isNaN(newWidth) || !isFinite(newWidth)) {
        throttledValidationLog('Invalid newWidth:', newWidth, 'using fallback');
        newWidth = resizeStart.width;
      }
      if (!newHeight || isNaN(newHeight) || !isFinite(newHeight)) {
        throttledValidationLog('Invalid newHeight:', newHeight, 'using fallback');
        newHeight = resizeStart.height;
      }

      // Apply minimum constraints and ensure valid numbers
      newWidth = Math.max(50, Math.round(newWidth));
      newHeight = Math.max(50, Math.round(newHeight));

      // Update the selected image in the artboardImages array
      const imageIndex = artboardImages.findIndex(img => img.id === selectedImageId);
      if (imageIndex !== -1) {
        // Update the image object immediately for smooth visual feedback
        artboardImages[imageIndex] = {
          ...artboardImages[imageIndex],
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        };
        artboardImages = [...artboardImages]; // Trigger reactivity
      }
    }
  }

  async function handleMouseUp() {
    // Handle swatch dragging
    if (isDragging && draggedSwatchIndex !== -1) {
      const swatch = swatchPlaceholders[draggedSwatchIndex];

      // Save the new position to database
      if (swatch && swatch.filled) {
        // Get a valid image_id - use the swatch's stored imageId, fallback to first available image
        const validImageId = swatch.data.imageId || imageId || (artboardImages.length > 0 ? artboardImages[0].id : null);

        const requestData = {
          hex_color: swatch.data.hexColor,
          image_id: validImageId,
          pos_x: swatch.data.posX,
          pos_y: swatch.data.posY
        };


        try {
          const response = await fetch('/api/swatches/update-position', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
          });

          const result = await response.json();
          if (result.status === 'success') {
            console.log('Position saved successfully');
          } else {
            console.error('Failed to save position:', result.message);
          }
        } catch (error) {
          console.error('Error saving position:', error);
        }
      }

      isDragging = false;
      draggedSwatchIndex = -1;
      // Don't deselect swatch here - keep it selected after drag
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

  function handleDeleteKey() {
    // Delete selected image
    if (selectedImageId && selectedImageIndex !== -1) {
      deleteSelectedImage();
      return;
    }

    // Delete selected swatch
    if (selectedSwatchIndex !== -1 && swatchPlaceholders[selectedSwatchIndex]?.filled) {
      deleteSelectedSwatch();
      return;
    }
  }

  async function deleteSelectedImage() {
    if (!selectedImageId || selectedImageIndex === -1) return;

    try {
      const response = await fetch(`/api/images/${selectedImageId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.status === 'success') {
        // Remove from artboardImages array
        artboardImages = artboardImages.filter(img => img.id !== selectedImageId);

        // Clear selection
        selectedImageId = null;
        selectedImageIndex = -1;
        isImageSelected = false;

        // Clean up canvas reference
        imageCanvases.delete(selectedImageId);

        console.log('Image deleted successfully');

        // Trigger callback to parent if provided
        if (onSwatchCreated) {
          onSwatchCreated(); // Reuse this callback to trigger reload
        }
      } else {
        console.error('Failed to delete image:', result.message);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  async function deleteSelectedSwatch() {
    if (selectedSwatchIndex === -1 || !swatchPlaceholders[selectedSwatchIndex]?.filled) return;

    const swatch = swatchPlaceholders[selectedSwatchIndex];

    try {
      // Find the swatch ID by matching properties - we need to query the database
      // Since we don't store the swatch ID in the component, we'll identify it by unique properties
      const response = await fetch('/api/swatches', {
        method: 'DELETE', // We'll need to modify the swatches API to support deletion by properties
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hex_color: swatch.data.hexColor,
          image_id: swatch.data.imageId,
          pos_x: swatch.data.posX,
          pos_y: swatch.data.posY
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        // Remove from swatchPlaceholders array
        swatchPlaceholders[selectedSwatchIndex] = { filled: false, data: null };

        // Clear selection
        selectedSwatchIndex = -1;

        console.log('Swatch deleted successfully');
      } else {
        console.error('Failed to delete swatch:', result.message);
      }
    } catch (error) {
      console.error('Error deleting swatch:', error);
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
    // Deselect selections when clicking outside the artboard area with select tool
    if (currentTool === 'select' && e.target === e.currentTarget) {
      isImageSelected = false;
      selectedImageId = null;
      selectedImageIndex = -1;
      selectedSwatchIndex = -1;
    }
  }}
>

  <!-- Professional Design Toolbar -->
  <div class="fixed left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-50" onclick={(e) => e.stopPropagation()}>
    <div class="flex flex-col space-y-1">

      <!-- Selection Tool -->
      <button
        onclick={() => {
          currentTool = 'select';
          // Clear all selections when switching to select tool
          selectedImageId = null;
          selectedImageIndex = -1;
          isImageSelected = false;
          selectedSwatchIndex = -1;
        }}
        class="p-3 rounded-lg transition-all duration-200 {currentTool === 'select' ? 'bg-blue-100 text-blue-600 shadow-md' : 'text-gray-600 hover:bg-gray-100'}"
        title="Selection Tool - Press V (Click to select, drag to move, handles to resize)"
      >
        <i class="fas fa-mouse-pointer text-lg"></i>
      </button>

      <!-- Eyedropper Tool -->
      <button
        onclick={() => {
          currentTool = 'eyedropper';
          // Clear all selections when switching to eyedropper
          selectedImageId = null;
          selectedImageIndex = -1;
          isImageSelected = false;
          selectedSwatchIndex = -1;
        }}
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

      <!-- Upload Image Tool -->
      <button
        onclick={() => {
          currentTool = 'upload';
          document.getElementById('image-upload-input').click();
        }}
        class="p-3 rounded-lg transition-all duration-200 {currentTool === 'upload' ? 'bg-blue-100 text-blue-600 shadow-md' : 'text-gray-600 hover:bg-gray-100'}"
        title="Upload Image - Add image to artboard"
      >
        <i class="fas fa-image text-lg"></i>
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
    class="artboard relative bg-white shadow-sm border border-gray-300 {getCanvasCursor()}"
    style="
      width: {artboardWidthInches}in;
      height: {artboardHeightInches}in;
      transform: scale({zoomLevel * 0.9});
      transition: transform 0.2s ease;
      overflow: visible;
    "
    onclick={isPlacingSwatch ? handleSwatchPlacement : currentTool === 'place' ? handleImagePlacement : undefined}
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

    <!-- Multiple Images within Artboard -->
    {#each artboardImages as image, index (image.id)}
      <div
        class="absolute image-container"
        style="
          left: {image.x}px;
          top: {image.y}px;
          width: {image.width}px;
          height: {image.height}px;
          z-index: {10 + index};
        "
      >
        <div class="relative w-full h-full">
          <!-- Use img element for display - much more reliable than canvas -->
          <img
            src={image.src}
            alt="Artboard image"
            data-image-id={image.id}
            class="{getCanvasCursor()} shadow-sm border {selectedImageId === image.id ? 'border-blue-500 border-2' : 'border-gray-200'} block"
            onclick={(e) => {
              // Only select image when using select tool, not eyedropper
              if (currentTool === 'select') {
                selectImage(image.id, index);
              }
              onCanvasClick(e);
            }}
            onmousedown={onCanvasMouseDown}
            onmousemove={onCanvasMouseMove}
            onmouseleave={onCanvasMouseLeave}
            style="
              width: {image.width}px;
              height: {image.height}px;
              object-fit: contain;
            "
          />

          <!-- Hidden canvas for eyedropper functionality -->
          {#if index === 0}
            <canvas
              bind:this={canvas}
              class="hidden"
              width={image.originalWidth || image.width}
              height={image.originalHeight || image.height}
              use:drawImageOnCanvas={image}
            ></canvas>
          {:else}
            <canvas
              class="hidden"
              width={image.originalWidth || image.width}
              height={image.originalHeight || image.height}
              use:drawImageOnCanvas={image}
            ></canvas>
          {/if}

          <!-- Loading indicator for images still loading dimensions -->
          {#if image.needsOriginalDimensions}
            <div class="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 z-30">
              <i class="fas fa-spinner fa-spin text-xs"></i>
            </div>
          {/if}

          <!-- Resize handles for selected image (clean, minimal design) -->
          {#if selectedImageId === image.id && currentTool === 'select'}
            {#if !image.needsOriginalDimensions}
              <!-- Only show resize handles when dimensions are ready -->
              <div
                class="absolute -top-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-nw-resize z-20 pointer-events-auto"
                onmousedown={(e) => handleResizeMouseDown(e, 'nw', image)}
              ></div>
              <div
                class="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-ne-resize z-20 pointer-events-auto"
                onmousedown={(e) => handleResizeMouseDown(e, 'ne', image)}
              ></div>
              <div
                class="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-sw-resize z-20 pointer-events-auto"
                onmousedown={(e) => handleResizeMouseDown(e, 'sw', image)}
              ></div>
              <div
                class="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 border border-white rounded-sm cursor-se-resize z-20 pointer-events-auto"
                onmousedown={(e) => handleResizeMouseDown(e, 'se', image)}
              ></div>
            {:else}
              <!-- Show loading message instead of resize handles -->
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-20">
                Loading dimensions...
              </div>
            {/if}
          {/if}

        <!-- Image Placement Preview -->
        {#if currentTool === 'place' && placementMode && pendingImageData}
          <div
            class="absolute pointer-events-none z-20 border-2 border-blue-500 border-dashed bg-blue-50/30"
            style="
              left: {placementPreviewX - 50}px;
              top: {placementPreviewY - 50}px;
              width: 100px;
              height: 100px;
              background-image: url('{pendingImageData.url}');
              background-size: cover;
              background-position: center;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            "
          >
            <div class="absolute inset-0 bg-blue-500/20 rounded-lg"></div>
            <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-blue-600 text-white px-2 py-1 rounded whitespace-nowrap">
              Click to place
            </div>
          </div>
        {/if}



        <!-- Overlay canvas removed to eliminate dark artifacts -->

        </div>
      </div>
    {/each}

    <!-- Visual Connectors from Swatches to Sample Locations -->
    {#each swatchPlaceholders as swatch, i}
      {#if swatch.filled && swatch.data.sampleX != null && swatch.data.sampleY != null && swatch.data.imageId}
        {@const sourceImage = artboardImages.find(img => img.id === swatch.data.imageId)}
        {#if sourceImage && !sourceImage.needsOriginalDimensions}
          {@const swatchPos = {
            x: swatch.data.posX !== undefined && swatch.data.posX !== null ? swatch.data.posX : getSwatchPosition(i).x,
            y: swatch.data.posY !== undefined && swatch.data.posY !== null ? swatch.data.posY : getSwatchPosition(i).y
          }}
          {@const swatchCenterX = swatchPos.x + (2.5 * 96) / 2}
          {@const swatchCenterY = swatchPos.y + (1.5 * 96) / 2}
          {@const imgCanvas = imageCanvases.get(swatch.data.imageId)}
          {@const sampleSize = swatch.data.sampleSize || 1}
          {@const _ = canvasLoadState} <!-- Force reactivity when canvases load -->

          {#if imgCanvas && sourceImage.width > 0 && sourceImage.height > 0 && imgCanvas.width > 0 && imgCanvas.height > 0 && typeof swatch.data.sampleX === 'number' && typeof swatch.data.sampleY === 'number' && !isNaN(swatch.data.sampleX) && !isNaN(swatch.data.sampleY) && sourceImage.originalWidth && sourceImage.originalHeight}
            {@const scaleX = sourceImage.width / imgCanvas.width}
            {@const scaleY = sourceImage.height / imgCanvas.height}
            {@const sampleX = Math.round(sourceImage.x + (swatch.data.sampleX * scaleX))}
            {@const sampleY = Math.round(sourceImage.y + (swatch.data.sampleY * scaleY))}
            {@const debugInfo = console.log('Connection line calc:', {
              imageId: swatch.data.imageId,
              sourceImage: { x: sourceImage.x, y: sourceImage.y, w: sourceImage.width, h: sourceImage.height },
              canvas: { w: imgCanvas.width, h: imgCanvas.height },
              sampleData: { x: swatch.data.sampleX, y: swatch.data.sampleY },
              scales: { x: scaleX, y: scaleY },
              finalSample: { x: sampleX, y: sampleY }
            })}
            {@const sampleRadius = Math.max(4, Math.round((sampleSize * scaleX) / 2))}

            <!-- Connection Line -->
            <svg
              class="absolute pointer-events-none"
              style="
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                z-index: 50;
              "
            >
              <defs>
                <marker id="arrowhead-{i}" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                  <polygon points="0 0, 6 2, 0 4" fill="{swatch.data.hexColor}" stroke="#333" stroke-width="0.5"/>
                </marker>
              </defs>
              <line
                x1="{swatchCenterX}"
                y1="{swatchCenterY}"
                x2="{sampleX}"
                y2="{sampleY}"
                stroke="{swatch.data.hexColor}"
                stroke-width="2"
                stroke-dasharray="3,3"
                opacity="0.7"
                marker-end="url(#arrowhead-{i})"
              />
            </svg>

            <!-- Sample Location Circle (only for multi-pixel samples) -->
            {#if sampleSize && sampleSize > 1}
              <div
                class="absolute pointer-events-none border-2 rounded-full bg-white/80 backdrop-blur-sm"
                style="
                  left: {sampleX - sampleRadius}px;
                  top: {sampleY - sampleRadius}px;
                  width: {sampleRadius * 2}px;
                  height: {sampleRadius * 2}px;
                  border-color: {swatch.data.hexColor};
                  z-index: 60;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                "
              >
                <div
                  class="w-full h-full rounded-full border"
                  style="border-color: {swatch.data.hexColor}; opacity: 0.3;"
                ></div>
                <!-- Size indicator text -->
                <div
                  class="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style="color: {swatch.data.hexColor}; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);"
                >
                  {sampleSize}
                </div>
              </div>
            {/if}
          {/if}
        {/if}
      {/if}
    {/each}

    <!-- Color Swatches (positioned within artboard) -->
    {#each swatchPlaceholders as swatch, i}
      {#if swatch.filled}
        {@const swatchDims = getSwatchDimensions()}
        {@const swatchPos = {
          x: swatch.data.posX !== undefined && swatch.data.posX !== null ? swatch.data.posX : getSwatchPosition(i).x,
          y: swatch.data.posY !== undefined && swatch.data.posY !== null ? swatch.data.posY : getSwatchPosition(i).y
        }}
        <div
          class="absolute bg-white rounded-lg border {selectedSwatchIndex === i ? 'border-blue-500 border-2' : 'border-gray-300'} shadow-sm backdrop-blur-sm select-none {currentTool === 'select' ? 'cursor-move' : 'cursor-default'}"
          style="
            left: {swatchPos.x}px;
            top: {swatchPos.y}px;
            width: 2.5in;
            height: 1.5in;
            padding: 0.1in;
            z-index: {isDragging && draggedSwatchIndex === i ? 9999 : 100 + i};
            will-change: transform;
            transform: scale(1);
            transition: none;
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
              {#if swatch.data.description && swatch.data.description.trim()}
                <p class="font-medium truncate" style="font-size: 10pt; color: #111; line-height: 1.2;">{swatch.data.description}</p>
              {/if}
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
    <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm relative">
      <div class="p-6">
        <!-- Close button in top right -->
        <button
          onclick={() => showModal = false}
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          <i class="fas fa-times"></i>
        </button>

        <!-- Selected Color Display -->
        <div
          class="w-20 h-20 rounded-lg border border-gray-200 mx-auto mb-4 shadow-md"
          style="background-color: {selectedColor}"
        ></div>

        <!-- Form -->
        <form onsubmit={handleSubmit} class="space-y-4">
          <input
            type="text"
            bind:value={description}
            placeholder="Color reference note (optional)..."
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
            autofocus
          />
          <button
            type="submit"
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Add Swatch
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- Floating Eyedropper Preview -->
{#if showEyedropper && currentTool === 'eyedropper' && !isPlacingSwatch}

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

<!-- Floating Swatch Preview During Placement -->
{#if isPlacingSwatch && pendingSwatchData}
  <div
    class="fixed pointer-events-none z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2"
    style="
      left: {swatchPlacementX + 15}px;
      top: {swatchPlacementY + 15}px;
    "
  >
    <div class="flex flex-col items-center space-y-2">
      <!-- Color Swatch Preview -->
      <div
        class="w-16 h-16 rounded-lg border border-gray-200 shadow-inner"
        style="background-color: {pendingSwatchData.hexColor};"
      ></div>

      <!-- Description -->
      <div class="text-xs text-center px-2">
        <div class="font-medium text-gray-800 truncate max-w-20">
          {pendingSwatchData.description || 'Untitled'}
        </div>
        <div class="text-gray-500 mt-0.5">Click to place</div>
      </div>
    </div>
  </div>
{/if}

<!-- Hidden File Input for Image Upload -->
<input
  type="file"
  id="image-upload-input"
  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
  onchange={handleImageUpload}
  class="hidden"
/>