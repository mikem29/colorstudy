


  // Variables to hold the click coordinates and color data
  let pendingClickData = null;

  // Load the image
  const img = new Image();
  img.crossOrigin = 'Anonymous'; // Enable CORS if needed
  img.src = imageSrc;

  img.onload = function() {
    const canvas = document.getElementById('imageCanvas');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    overlayCanvas.width = img.width;
    overlayCanvas.height = img.height;

    // Adjust image-container dimensions
    const imageContainer = document.getElementById('image-container');
    imageContainer.style.width = img.width + 'px';
    imageContainer.style.height = img.height + 'px';

    // Hide the loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'none';

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);

    // Add event listeners
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('mouseleave', onCanvasMouseLeave);
  };

  img.onerror = function() {
    alert('Failed to load the image. Please try uploading a new image.');
    window.location.href = 'uploadimage.php';
  };

  // Function to handle canvas click event
  function onCanvasClick(event) {
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');

    // Get click coordinates relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    // Get the selected sampling size
    const samplingSize = parseInt(document.getElementById('sampling-size').value);

    // Get average color
    const { red, green, blue } = getAverageColor(ctx, x, y, samplingSize);

    // Convert to hex color
    const hexColor = rgbToHex(red, green, blue);

    // Store click data
    pendingClickData = {
      hexColor,
      red,
      green,
      blue
    };

    // Show modal dialog
    showModal();
  }

  // Function to handle canvas mouse move event
  function onCanvasMouseMove(event) {
    const canvas = document.getElementById('imageCanvas');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    // Clear overlay
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Get mouse coordinates relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    // Get the selected sampling size
    const samplingSize = parseInt(document.getElementById('sampling-size').value);

    // Get average color
    const { red, green, blue } = getAverageColor(ctx, x, y, samplingSize);

    // Convert to hex color
    const hexColor = rgbToHex(red, green, blue);

    // Update color preview bubble
    const colorPreview = document.getElementById('color-preview');
    colorPreview.style.backgroundColor = hexColor;

    // Position the bubble very close to the cursor
    const offsetX = -10; // Adjusted to move the bubble closer
    const offsetY = -10; // Adjusted to move the bubble closer

    // Get the mouse coordinates relative to the image container
    const containerRect = canvas.getBoundingClientRect();
    const containerX = event.clientX - containerRect.left;
    const containerY = event.clientY - containerRect.top;

    colorPreview.style.left = (containerX + offsetX) + 'px';
    colorPreview.style.top = (containerY + offsetY) + 'px';
    colorPreview.style.display = 'block';

    // Draw sampling area indicator
    overlayCtx.strokeStyle = 'red';
    overlayCtx.lineWidth = 1;
    // test

    if (samplingSize === 1) {
      // Draw a red dot at the cursor position
      overlayCtx.fillStyle = 'red';
      overlayCtx.beginPath();
      overlayCtx.arc(x + 0.5, y + 0.5, 2, 0, Math.PI * 2);
      overlayCtx.fill();
    } else {
      const halfSize = Math.floor(samplingSize / 2);

      // Define the corners
      const left = Math.max(0.5, x - halfSize) + 0.5;
      const top = Math.max(0.5, y - halfSize) + 0.5;
      const right = Math.min(overlayCanvas.width - 0.5, x + halfSize) + 0.5;
      const bottom = Math.min(overlayCanvas.height - 0.5, y + halfSize) + 0.5;

      const cornerLength = Math.min(5, samplingSize);

      // Top-left corner
      overlayCtx.beginPath();
      overlayCtx.moveTo(left, top + cornerLength);
      overlayCtx.lineTo(left, top);
      overlayCtx.lineTo(left + cornerLength, top);
      overlayCtx.stroke();

      // Top-right corner
      overlayCtx.beginPath();
      overlayCtx.moveTo(right - cornerLength, top);
      overlayCtx.lineTo(right, top);
      overlayCtx.lineTo(right, top + cornerLength);
      overlayCtx.stroke();

      // Bottom-right corner
      overlayCtx.beginPath();
      overlayCtx.moveTo(right, bottom - cornerLength);
      overlayCtx.lineTo(right, bottom);
      overlayCtx.lineTo(right - cornerLength, bottom);
      overlayCtx.stroke();

      // Bottom-left corner
      overlayCtx.beginPath();
      overlayCtx.moveTo(left + cornerLength, bottom);
      overlayCtx.lineTo(left, bottom);
      overlayCtx.lineTo(left, bottom - cornerLength);
      overlayCtx.stroke();
    }
  }

  // Function to handle canvas mouse leave event
  function onCanvasMouseLeave() {
    const colorPreview = document.getElementById('color-preview');
    colorPreview.style.display = 'none';

    const overlayCanvas = document.getElementById('overlayCanvas');
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }

  // Function to get average color
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

  // Function to convert RGB to Hex
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(function(x) {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  }

  // Function to convert RGB to CMYK
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

  // Modal handling
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  const modalForm = document.getElementById('modal-form');
  const modalInput = document.getElementById('modal-input');
  const selectedColorBox = document.getElementById('selected-color');

  function showModal() {
    modal.style.display = 'block';
    modalInput.value = ''; // Clear input field
    modalInput.focus();
    // Update selected color box
    selectedColorBox.style.backgroundColor = pendingClickData.hexColor;

    // Display all color values in the modal
    document.getElementById('rgb-value').textContent = `RGB: ${pendingClickData.red}, ${pendingClickData.green}, ${pendingClickData.blue}`;
    document.getElementById('hex-value').textContent = `HEX: ${pendingClickData.hexColor}`;
    const cmyk = rgbToCmyk(pendingClickData.red, pendingClickData.green, pendingClickData.blue);
    document.getElementById('cmyk-value').textContent = `CMYK: ${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  modalClose.onclick = function() {
    closeModal();
  };

  window.onclick = function(event) {
    if (event.target == modal) {
      closeModal();
    }
  };

  modalForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    const description = modalInput.value.trim();
    console.log('Modal form submitted with description:', description);
    
    if (description && pendingClickData) {
      console.log('Creating swatch with data:', pendingClickData, 'and description:', description);
      createSwatch(
        pendingClickData.hexColor,
        pendingClickData.red,
        pendingClickData.green,
        pendingClickData.blue,
        description
      );
      closeModal();
      pendingClickData = null;
    } else {
      console.warn('Description or pendingClickData is missing.');
    }
  });

  // Function to create and add a swatch to the grid
  function createSwatch(hexColor, red, green, blue, description) {
    const swatch = {
      hex_color: hexColor,
      red: red,
      green: green,
      blue: blue,
      cmyk: rgbToCmyk(red, green, blue),
      description: description
    };

    const swatchElement = createSwatchElement(swatch);
    swatchContainer.insertBefore(swatchElement, swatchContainer.firstChild);
    console.log('Swatch element created and added to UI:', swatchElement);

    // Save the swatch to the database
    saveSwatch(swatch, swatchElement);
  }

  // Function to gather all swatch data and include image_id
  function gatherSwatchData() {
    const swatches = document.querySelectorAll('.swatch');
    const swatchData = [];

    swatches.forEach(swatch => {
      if (swatch.dataset.filled === 'true') {
        const hexColor = swatch.dataset.hexColor;
        const red = parseInt(swatch.dataset.red);
        const green = parseInt(swatch.dataset.green);
        const blue = parseInt(swatch.dataset.blue);
        const cmyk = swatch.dataset.cmyk;
        const description = swatch.dataset.description;

        swatchData.push({
          hex_color: hexColor,
          red: red,
          green: green,
          blue: blue,
          cmyk: cmyk,
          description: description
        });
      }
    });

    return swatchData;
  }

  // Event listener for color format change
  document.getElementById('color-format').addEventListener('change', function() {
    const swatches = document.querySelectorAll('.swatch');
    const colorFormat = this.value;

    swatches.forEach(swatch => {
      const infoLabel = swatch.querySelector('.swatch-info');
      const red = parseInt(swatch.dataset.red);
      const green = parseInt(swatch.dataset.green);
      const blue = parseInt(swatch.dataset.blue);
      const hexColor = swatch.dataset.hexColor;

      if (colorFormat === 'RGB') {
        infoLabel.textContent = `RGB(${red}, ${green}, ${blue})`;
      } else if (colorFormat === 'HEX') {
        infoLabel.textContent = hexColor;
      } else if (colorFormat === 'CMYK') {
        const { c, m, y, k } = rgbToCmyk(red, green, blue);
        infoLabel.textContent = `CMYK(${c}%, ${m}%, ${y}%, ${k}%)`;
      }
    });
  });

  // Add these functions at the appropriate place in your colorPicker.js file

  function saveSwatch(swatch, swatchElement) {
    console.log('Saving swatch:', swatch);
    fetch('save_swatch.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_id: imageId,
        swatch: swatch
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Response from save_swatch.php:', data);
      if (data.status === 'success') {
        console.log('Swatch saved successfully with ID:', data.swatch_id);
        // Update the swatch element with the database ID
        swatchElement.id = `swatch-${data.swatch_id}`;
        swatch.id = data.swatch_id; // Update the swatch object with the new ID
      } else {
        console.error('Error saving swatch:', data.message);
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
  }

  function deleteSwatch(swatchId) {
    console.log('Initiating deletion for Swatch ID:', swatchId);
    
    fetch('delete_swatch.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ swatch_id: swatchId })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Response from delete_swatch.php:', data);
      if (data.status === 'success') {
        console.log('Swatch deleted successfully.');
        // Remove the swatch element from the UI with a fade-out effect
        const swatchElement = document.getElementById(`swatch-${swatchId}`);
        if (swatchElement) {
          swatchElement.style.opacity = '0'; // Start fade-out
          setTimeout(() => {
            swatchElement.remove();
            console.log('Swatch element removed from UI:', swatchElement);
          }, 500); // Wait for the fade-out transition to complete
        } else {
          console.warn('Swatch element not found in UI for ID:', swatchId);
        }
      } else {
        console.error('Error deleting swatch:', data.message);
        alert('Failed to delete swatch: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Fetch error while deleting swatch:', error);
      alert('An error occurred while deleting the swatch.');
    });
  }

  // Modify your existing addSwatch function to save the swatch immediately
  function addSwatch(color, description) {
    const swatch = {
      hex_color: color.hex,
      red: color.rgb.r,
      green: color.rgb.g,
      blue: color.rgb.b,
      cmyk: `${color.cmyk.c},${color.cmyk.m},${color.cmyk.y},${color.cmyk.k}`,
      description: description
    };

    // Save the swatch to the database
    saveSwatch(swatch);

    // Add the swatch to the UI
    const swatchElement = createSwatchElement(swatch);
    document.getElementById('swatch-container').appendChild(swatchElement);
  }

  // Add a delete button to each swatch in the createSwatchElement function
  function createSwatchElement(swatch) {
    const swatchElement = document.createElement('div');
    swatchElement.className = 'swatch';
    swatchElement.id = `swatch-${swatch.id || ''}`;

    const colorBlock = document.createElement('div');
    colorBlock.className = 'swatch-color';
    colorBlock.style.backgroundColor = swatch.hex_color;

    const title = document.createElement('div');
    title.className = 'swatch-title';
    title.textContent = swatch.description;

    const infoLabel = document.createElement('div');
    infoLabel.className = 'swatch-info';
    infoLabel.textContent = getColorInfo(swatch);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'swatch-delete';
    deleteButton.innerHTML = '<i class="fas fa-times"></i>'; // Use Font Awesome icon
    deleteButton.addEventListener('click', function() {
      deleteSwatch(swatch.id);
    });

    swatchElement.appendChild(colorBlock);
    swatchElement.appendChild(title);
    swatchElement.appendChild(infoLabel);
    swatchElement.appendChild(deleteButton);

    return swatchElement;
  }

  // Add this function to recreate swatches
  function recreateSwatches(swatches) {
    const swatchContainer = document.getElementById('swatch-container');
    swatches.forEach(swatch => {
      const swatchElement = createSwatchElement(swatch);
      swatchContainer.appendChild(swatchElement);
    });
  }

  // Modify the createSwatchElement function to handle existing swatches
  function createSwatchElement(swatch) {
    const swatchElement = document.createElement('div');
    swatchElement.className = 'swatch';
    swatchElement.id = `swatch-${swatch.id || ''}`;

    const colorBlock = document.createElement('div');
    colorBlock.className = 'swatch-color';
    colorBlock.style.backgroundColor = swatch.hex_color;

    const title = document.createElement('div');
    title.className = 'swatch-title';
    title.textContent = swatch.description;

    const infoLabel = document.createElement('div');
    infoLabel.className = 'swatch-info';
    infoLabel.textContent = getColorInfo(swatch);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'swatch-delete';
    deleteButton.innerHTML = '<i class="fas fa-times"></i>'; // Use Font Awesome icon
    deleteButton.addEventListener('click', function() {
      deleteSwatch(swatch.id);
    });

    swatchElement.appendChild(colorBlock);
    swatchElement.appendChild(title);
    swatchElement.appendChild(infoLabel);
    swatchElement.appendChild(deleteButton);

    return swatchElement;
  }

  // Add this to your initialization code (e.g., in a DOMContentLoaded event listener)
  document.addEventListener('DOMContentLoaded', function() {
    // ... (other initialization code)

    // Initialize swatchContainer to point to #swatch-container
    swatchContainer = document.getElementById('swatch-container');
    console.log('Swatch container initialized:', swatchContainer);

    // Recreate existing swatches
    if (existingSwatches && existingSwatches.length > 0) {
      console.log('Existing swatches found:', existingSwatches);
      recreateSwatches(existingSwatches);
    } else {
      console.log('No existing swatches found.');
    }

    // Load the image and set up canvases
    loadImage();
  });

  // Make sure your deleteSwatch function is updated to handle the swatch-${id} format:
  function deleteSwatch(swatchId) {
    console.log('Initiating deletion for Swatch ID:', swatchId);
    
    fetch('delete_swatch.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ swatch_id: swatchId })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Response from delete_swatch.php:', data);
      if (data.status === 'success') {
        console.log('Swatch deleted successfully.');
        // Remove the swatch element from the UI with a fade-out effect
        const swatchElement = document.getElementById(`swatch-${swatchId}`);
        if (swatchElement) {
          swatchElement.style.opacity = '0'; // Start fade-out
          setTimeout(() => {
            swatchElement.remove();
            console.log('Swatch element removed from UI:', swatchElement);
          }, 500); // Wait for the fade-out transition to complete
        } else {
          console.warn('Swatch element not found in UI for ID:', swatchId);
        }
      } else {
        console.error('Error deleting swatch:', data.message);
        alert('Failed to delete swatch: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Fetch error while deleting swatch:', error);
      alert('An error occurred while deleting the swatch.');
    });
  }

  // At the beginning of the file, add:
  let swatchContainer;

  // In the DOMContentLoaded event listener, add:
  document.addEventListener('DOMContentLoaded', function() {
    // ... (other initialization code)

    // Initialize swatchContainer to point to #swatch-container
    swatchContainer = document.getElementById('swatch-container');
    console.log('Swatch container initialized:', swatchContainer);

    // Recreate existing swatches
    if (existingSwatches && existingSwatches.length > 0) {
      console.log('Existing swatches found:', existingSwatches);
      recreateSwatches(existingSwatches);
    } else {
      console.log('No existing swatches found.');
    }

    // Load the image and set up canvases
    loadImage();
  });

  // Update the createSwatchElement function:
  function createSwatchElement(swatch) {
    const swatchElement = document.createElement('div');
    swatchElement.className = 'swatch';
    swatchElement.id = `swatch-${swatch.id || ''}`;

    const colorBlock = document.createElement('div');
    colorBlock.className = 'swatch-color';
    colorBlock.style.backgroundColor = swatch.hex_color;

    const title = document.createElement('div');
    title.className = 'swatch-title';
    title.textContent = swatch.description;

    const infoLabel = document.createElement('div');
    infoLabel.className = 'swatch-info';
    infoLabel.textContent = getColorInfo(swatch);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'swatch-delete';
    deleteButton.innerHTML = '<i class="fas fa-times"></i>'; // Use Font Awesome icon
    deleteButton.addEventListener('click', function() {
      deleteSwatch(swatch.id);
    });

    swatchElement.appendChild(colorBlock);
    swatchElement.appendChild(title);
    swatchElement.appendChild(infoLabel);
    swatchElement.appendChild(deleteButton);

    return swatchElement;
  }

  // Update the recreateSwatches function:
  function recreateSwatches(swatches) {
    swatches.forEach(swatch => {
      const swatchElement = createSwatchElement(swatch);
      swatchContainer.insertBefore(swatchElement, swatchContainer.firstChild);
    });
  }

  // Update the createSwatch function:
  function createSwatch(hexColor, red, green, blue, description) {
    const swatch = {
      hex_color: hexColor,
      red: red,
      green: green,
      blue: blue,
      cmyk: rgbToCmyk(red, green, blue),
      description: description
    };

    const swatchElement = createSwatchElement(swatch);
    swatchContainer.insertBefore(swatchElement, swatchContainer.firstChild);
    console.log('Swatch element created and added to UI:', swatchElement);

    // Save the swatch to the database
    saveSwatch(swatch, swatchElement);
  }

  // Add this helper function:
  function getColorInfo(swatch) {
    const colorFormat = document.getElementById('color-format').value;
    if (colorFormat === 'RGB') {
      return `RGB(${swatch.red}, ${swatch.green}, ${swatch.blue})`;
    } else if (colorFormat === 'HEX') {
      return swatch.hex_color;
    } else if (colorFormat === 'CMYK') {
      return `CMYK(${swatch.cmyk})`;
    }
  }

  // Update the rgbToCmyk function to return a formatted string:
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