<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Interactive Color Picker</title>
  <style>
    body {
      font-family: Arial, sans-serif;
    }
    #canvas-container {
      position: relative;
      display: inline-block;
      margin-left: calc(var(--swatch-width) + 20px);
    }
    #imageCanvas {
      cursor: crosshair;
      display: block;
      position: relative;
    }
    #overlayCanvas {
      position: absolute;
      top: 0;
      left: 0;
      cursor: crosshair;
      pointer-events: none;
    }
    #swatch-container {
      position: absolute;
      top: 0;
      left: -calc(var(--swatch-width) + 20px);
    }
    .swatch {
      width: var(--swatch-width);
      height: var(--swatch-height);
      border: 2px solid #000;
      box-sizing: border-box;
      position: absolute;
      background-color: #fff;
      padding: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }
    .swatch-placeholder {
      background-color: #e0e0e0;
    }
    .swatch-color {
      width: 100%;
      height: 70px;
      background-color: #ccc;
      margin-bottom: 10px;
    }
    .swatch-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .swatch-info {
      font-size: 14px;
      color: #555;
    }
    #version-number {
      font-size: 14px;
      color: #777;
    }
    /* Modal Styles */
    #modal {
      display: none;
      position: fixed;
      z-index: 10;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgba(0,0,0,0.5);
    }
    #modal-content {
      background-color: #fff;
      margin: 5% auto;
      padding: 30px;
      border-radius: 10px;
      border: 1px solid #ccc;
      width: 400px;
      max-width: 90%;
      box-sizing: border-box;
      position: relative;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    #modal-close {
      color: #aaa;
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
    }
    #modal-close:hover,
    #modal-close:focus {
      color: #000;
      text-decoration: none;
      cursor: pointer;
    }
    #modal h2 {
      margin-top: 0;
      margin-bottom: 20px;
      text-align: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    #selected-color {
      width: 60px;
      height: 60px;
      margin: 0 auto 20px auto;
      border: 1px solid #888;
      border-radius: 4px;
      box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
    }
    #modal-form {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    #modal-input {
      width: 100%;
      padding: 12px 20px;
      margin-bottom: 15px;
      box-sizing: border-box;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
    }
    #modal-button {
      width: 100%;
      padding: 12px 20px;
      background-color: #4285f4;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }
    #modal-button:hover {
      background-color: #357ae8;
    }
    /* Color Preview Bubble */
    #color-preview {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      position: absolute;
      pointer-events: none;
      border: 4px solid #000;
      box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
      transform: translate(-50%, -50%);
      display: none;
    }
    #color-preview::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: radial-gradient(circle at 15% 15%, rgba(255,255,255,0.7), rgba(255,255,255,0) 30%);
    }
    /* Controls */
    #controls {
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    #controls label {
      margin-right: 5px;
    }
    /* Save Button */
    #save-swatches-button {
      padding: 8px 16px;
      font-size: 16px;
      cursor: pointer;
      background-color: #34A853;
      color: #fff;
      border: none;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }
    #save-swatches-button:hover {
      background-color: #2C8E46;
    }
    /* Print Styles */
    @media print {
      body {
        color: #000;
      }
      .swatch {
        background-color: #fff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .swatch-placeholder {
        background-color: #e0e0e0 !important;
      }
      .swatch-color {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>

<h1>Interactive Color Picker</h1>
<p>Click on any point in the image to add a color swatch with a description.</p>

<!-- Controls -->
<div id="controls">
  <label for="sampling-size">Sampling Size:</label>
  <select id="sampling-size">
    <option value="1">Point Sample</option>
    <option value="3">3x3 Average</option>
    <option value="5">5x5 Average</option>
    <option value="11">11x11 Average</option>
    <option value="31">31x31 Average</option>
    <option value="51">51x51 Average</option>
    <option value="101">101x101 Average</option>
  </select>

  <label for="color-format">Color Format:</label>
  <select id="color-format">
    <option value="RGB">RGB</option>
    <option value="CMYK">CMYK</option>
  </select>

  <!-- Save Swatches Button Added Here -->
  <button id="save-swatches-button">Save Swatches</button>
</div>
<p id="version-number"></p>

<div id="canvas-container">
  <canvas id="imageCanvas"></canvas>
  <canvas id="overlayCanvas"></canvas>
  <div id="swatch-container"></div>
  <!-- Color Preview Bubble -->
  <div id="color-preview"></div>
</div>

<!-- Modal Structure -->
<div id="modal">
  <div id="modal-content">
    <span id="modal-close">&times;</span>
    <h2>Enter Description</h2>
    <!-- Selected Color Box -->
    <div id="selected-color"></div>
    <form id="modal-form">
      <input type="text" id="modal-input" placeholder="Description">
      <button type="submit" id="modal-button">Add Swatch</button>
    </form>
  </div>
</div>

<script>
  // Version number
  const version = 'Version 3.3'; // Updated version number
  document.getElementById('version-number').textContent = version;

  /* @todo
 * 1. Ability to reset a swatch each swatch has an eye dropper use font awesome free
 *    This will allow you to simply change the color and description of
 *    each swatch.
 * 2. Make the loupe show a zoomed in area that is picked instead
    of the color. And the color can fill the swatch area its going to inhabit.
 */


  // Configuration variables
  const swatchWidth = 250; // Adjust the swatch width here
  const swatchHeight = 150; // Adjust the swatch height here
  const swatchMargin = 10;  // Space between swatches
  const additionalColumns = 2; // Number of additional columns on the right

  // Set CSS variables
  document.documentElement.style.setProperty('--swatch-width', swatchWidth + 'px');
  document.documentElement.style.setProperty('--swatch-height', swatchHeight + 'px');
  document.documentElement.style.setProperty('--swatch-margin', swatchMargin + 'px');
  document.documentElement.style.setProperty('--additional-columns', additionalColumns);

  // Replace 'dunes.png' with the path to your image
  const imageSrc = 'knight_dunes_colors.png'; // Update this to your image path

  // Variables to hold the click coordinates and color data
  let pendingClickData = null;

  // Variables to store image dimensions
  let imageWidth, imageHeight;

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

    imageWidth = img.width;
    imageHeight = img.height;

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);

    // Create placeholders
    createPlaceholders();

    // Add event listeners
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('mouseleave', onCanvasMouseLeave);
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

    // Get the mouse coordinates relative to the canvas-container
    const containerRect = canvas.parentElement.getBoundingClientRect();
    const containerX = event.clientX - containerRect.left;
    const containerY = event.clientY - containerRect.top;

    colorPreview.style.left = (containerX + offsetX) + 'px';
    colorPreview.style.top = (containerY + offsetY) + 'px';
    colorPreview.style.display = 'block';

    // Draw sampling area indicator
    overlayCtx.strokeStyle = 'red';
    overlayCtx.lineWidth = 1;

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
    if (description && pendingClickData) {
      // Create swatch with the description
      updateSwatch(
        pendingClickData.hexColor,
        pendingClickData.red,
        pendingClickData.green,
        pendingClickData.blue,
        description
      );
      closeModal();
      pendingClickData = null;
    } else {
      alert('Please enter a description.');
    }
  });

  // Variables for swatch placement
  let swatchesPerSide = 0;
  let swatchesPerBottom = 0;
  let swatchPlaceholders = [];
  let swatchIndex = 0;

  // Function to create placeholders
  function createPlaceholders() {
    const swatchContainer = document.getElementById('swatch-container');

    // Calculate the number of swatches that can fit along the image height
    swatchesPerSide = Math.max(1, Math.floor(imageHeight / (swatchHeight + swatchMargin)));

    // Calculate the number of swatches that can fit along the image width (for bottom)
    swatchesPerBottom = Math.max(1, Math.floor(imageWidth / (swatchWidth + swatchMargin)));

    // Create placeholders for left side
    for (let i = 0; i < swatchesPerSide; i++) {
      const swatch = createPlaceholderSwatch();
      const swatchX = -swatchWidth - swatchMargin;
      const swatchY = i * (swatchHeight + swatchMargin);
      swatch.style.left = swatchX + 'px';
      swatch.style.top = swatchY + 'px';
      swatchContainer.appendChild(swatch);
      swatchPlaceholders.push(swatch);
    }

    // Create placeholders for bottom side
    for (let i = 0; i < swatchesPerBottom; i++) {
      const swatch = createPlaceholderSwatch();
      const swatchX = i * (swatchWidth + swatchMargin);
      const swatchY = imageHeight + swatchMargin;
      swatch.style.left = swatchX + 'px';
      swatch.style.top = swatchY + 'px';
      swatchContainer.appendChild(swatch);
      swatchPlaceholders.push(swatch);
    }

    // Create placeholders for right side
    for (let i = swatchesPerSide - 1; i >= 0; i--) {
      const swatch = createPlaceholderSwatch();
      const swatchX = imageWidth + swatchMargin;
      const swatchY = i * (swatchHeight + swatchMargin);
      swatch.style.left = swatchX + 'px';
      swatch.style.top = swatchY + 'px';
      swatchContainer.appendChild(swatch);
      swatchPlaceholders.push(swatch);
    }

    // Create additional placeholders in columns to the right
    for (let col = 1; col <= additionalColumns; col++) {
      for (let i = 0; i < swatchesPerSide; i++) {
        const swatch = createPlaceholderSwatch();
        const swatchX = imageWidth + swatchMargin + col * (swatchWidth + swatchMargin);
        const swatchY = i * (swatchHeight + swatchMargin);
        swatch.style.left = swatchX + 'px';
        swatch.style.top = swatchY + 'px';
        swatchContainer.appendChild(swatch);
        swatchPlaceholders.push(swatch);
      }
    }

    // Adjust canvas-container height to accommodate bottom swatches
    document.getElementById('canvas-container').style.height = (imageHeight + swatchHeight + swatchMargin) + 'px';
  }

  // Helper function to create a placeholder swatch
  function createPlaceholderSwatch() {
    const swatch = document.createElement('div');
    swatch.className = 'swatch swatch-placeholder';
    return swatch;
  }

  // Function to update a placeholder swatch with actual data
  function updateSwatch(hexColor, red, green, blue, description) {
    if (swatchIndex >= swatchPlaceholders.length) {
      alert('No more swatch placeholders available.');
      return;
    }

    const swatch = swatchPlaceholders[swatchIndex];
    swatch.dataset.filled = 'true';
    swatch.classList.remove('swatch-placeholder');

    // Clear existing content
    swatch.innerHTML = '';

    // Create color block
    const colorBlock = document.createElement('div');
    colorBlock.className = 'swatch-color';
    colorBlock.style.backgroundColor = hexColor;

    // Create title
    const title = document.createElement('div');
    title.className = 'swatch-title';
    title.textContent = description;

    // Get the selected color format
    const colorFormat = document.getElementById('color-format').value;

    // Create info label
    const infoLabel = document.createElement('div');
    infoLabel.className = 'swatch-info';

    if (colorFormat === 'RGB') {
      infoLabel.textContent = `RGB(${red}, ${green}, ${blue})`;
    } else if (colorFormat === 'CMYK') {
      const { c, m, y, k } = rgbToCmyk(red, green, blue);
      infoLabel.textContent = `CMYK(${c}%, ${m}%, ${y}%, ${k}%)`;
    }

    // Assemble the swatch
    swatch.appendChild(colorBlock);
    swatch.appendChild(title);
    swatch.appendChild(infoLabel);

    // Increment swatch index for the next swatch
    swatchIndex++;
  }

  // Function to gather all swatch data
  function gatherSwatchData() {
    const swatches = document.querySelectorAll('.swatch');
    const swatchData = [];

    swatches.forEach(swatch => {
      if (swatch.dataset.filled === 'true') {
        const hexColor = swatch.querySelector('.swatch-color').style.backgroundColor;
        const rgbText = swatch.querySelector('.swatch-info').textContent;
        const description = swatch.querySelector('.swatch-title').textContent;

        // Extract RGB values from the text (e.g., "RGB(255, 255, 255)")
        const rgbMatch = rgbText.match(/RGB\((\d+),\s*(\d+),\s*(\d+)\)/);
        let red = 0, green = 0, blue = 0, cmyk = '';

        if (rgbMatch) {
          red = parseInt(rgbMatch[1]);
          green = parseInt(rgbMatch[2]);
          blue = parseInt(rgbMatch[3]);
        }

        // Extract CMYK values from the text (e.g., "CMYK(0%, 0%, 0%, 0%)")
        const cmykMatch = rgbText.match(/CMYK\((\d+)%\,\s*(\d+)%\,\s*(\d+)%\,\s*(\d+)%\)/);
        if (cmykMatch) {
          cmyk = `C:${cmykMatch[1]}%, M:${cmykMatch[2]}%, Y:${cmykMatch[3]}%, K:${cmykMatch[4]}%`;
        }

        swatchData.push({
          hex_color: rgbToHexFromStyle(hexColor),
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

  // Helper function to convert RGB string to Hex
  function rgbToHexFromStyle(rgb) {
    // rgb format: rgb(r, g, b) or rgba(r, g, b, a)
    const result = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(rgb);
    if (!result) {
      return '#000000';
    }
    const r = parseInt(result[1]);
    const g = parseInt(result[2]);
    const b = parseInt(result[3]);

    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  }

  // Event listener for the Save button
  document.getElementById('save-swatches-button').addEventListener('click', function() {
    const swatchData = gatherSwatchData();

    if (swatchData.length === 0) {
      alert('No swatches to save.');
      return;
    }

    // Send the swatch data to the server using Fetch API
    fetch('save_swatches.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(swatchData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          alert(data.message);
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while saving swatches.');
      });
  });

  // Function to fetch and display saved swatches (Optional Enhancement)
  /*
  function fetchSavedSwatches() {
    fetch('fetch_swatches.php')
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        const savedSwatches = data.data;
        savedSwatches.forEach(swatch => {
          createSavedSwatch(swatch);
        });
      } else {
        console.error('Error fetching swatches:', data.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  // Function to create and display a saved swatch
  function createSavedSwatch(swatchData) {
    const swatchContainer = document.getElementById('swatch-container');

    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.dataset.filled = 'true';

    // Create color block
    const colorBlock = document.createElement('div');
    colorBlock.className = 'swatch-color';
    colorBlock.style.backgroundColor = swatchData.hex_color;

    // Create title
    const title = document.createElement('div');
    title.className = 'swatch-title';
    title.textContent = swatchData.description;

    // Create info label
    const infoLabel = document.createElement('div');
    infoLabel.className = 'swatch-info';
    infoLabel.textContent = swatchData.cmyk ? swatchData.cmyk : `RGB(${swatchData.red}, ${swatchData.green}, ${swatchData.blue})`;

    // Assemble the swatch
    swatch.appendChild(colorBlock);
    swatch.appendChild(title);
    swatch.appendChild(infoLabel);

    // Append to container
    swatchContainer.appendChild(swatch);
  }

  // Call fetchSavedSwatches on page load
  window.onload = function() {
    fetchSavedSwatches();
  };
  */
</script>

</body>
</html>
