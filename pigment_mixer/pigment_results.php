<?php

// Include the database connection file
include 'db_connect.php';
// Handle deletion of a pigment
if (isset($_GET['delete_id'])) {
    $deleteId = intval($_GET['delete_id']);
    $deleteSql = "DELETE FROM pigments WHERE pigment_id = :id";
    $deleteStmt = $pdo->prepare($deleteSql);
    $deleteStmt->bindParam(':id', $deleteId, PDO::PARAM_INT);
    $deleteStmt->execute();
    header("Location: pigment_results.php");
    exit;
}

// 


// Retrieve all pigments from the database
$sql = "SELECT * FROM pigments";
$stmt = $pdo->query($sql); // Use PDO instance
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Virtual Mixer</title>
    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <script src="https://kit.fontawesome.com/6905d8d4cb.js" crossorigin="anonymous"></script>
    <!-- Include noUiSlider CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.6.1/nouislider.min.css">
       <!-- jQuery -->
       <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min.js"></script>


    <style>
        .left-nav {
            width: 300px;
            position: fixed;
            top: 0;
            bottom: 0;
            z-index: 1000;
        }

        .content-area {
            margin-left: 310px;
            padding: 20px;
        }

        .pigment-card {
            width: 200px;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 10px 0; /* Adjusted padding: 5px top/bottom, 0 left/right */
            margin: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .swatch {
            width: 100%;
            height: 50px;
            border-radius: 4px;
            margin-bottom: 10px;
        }

        .name-cell {
            font-size: 0.9rem;
            margin-bottom: 10px;
            text-align: center;
        }

        .slider-column {
            width: 100%;
            margin-bottom: 10px;
        }

        .pigment-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.8rem; /* Smaller font size for denser table */
        }

        .table td, .table th {
            padding: 5px; /* Reduced padding for denser table */
            border: 1px solid #ccc;
            font-weight: normal; /* Remove bold style */
        }

        .swatch {
            width: 150px;
            height: 50px;
        }

        .slider-column {
            width: 60%;
        }

        /* Style for the selected pigments display */
        #selected-pigments {
            margin-top: 20px;
            font-size: 16px;
            font-weight: bold;
        }

        /* Style for the color swatch */
        #color-swatch {
            width: 50px;
            height: 50px;
            background-color: #ffffff;
            border: 1px solid #ccc;
        }

        .fixed-top {
            position: fixed;
            top: 0;
            left: 0;
            margin: 10px;
            border-radius: 8px;
        }

        .list-group-item {
            padding: 0.3rem;
        }

        .border-right {
            border-right: 1px solid #ddd;
        }

        .swatch-label {
            font-size: 0.7rem; /* Smaller font size for labels */
            text-align: center;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="d-flex">
        <!-- Main Container -->
        <div class="d-flex" style="width: 100%;">
            <!-- Left Navigation Bar: This is the toolbar where all tools will be placed -->
            <div class="bg-light border-right shadow-sm left-nav">
                <div class="d-flex flex-column align-items-center p-2">
                    <!-- Swatches Container -->
                    <div class="d-flex justify-content-center align-items-center mb-2" style="width: 100%;">

                       <div class="text-center mx-1">
                            <div id="target-mix-swatch" class="rounded" style="width: 60px; height: 60px; background-color: #ffffff; border: 1px solid #ccc;"></div>
                            <div class="swatch-label">Target Mix</div>
                        </div>
                        <!-- Virtual Mix Swatch -->
                        <div class="text-center mx-1">
                            <div id="color-swatch" class="rounded" style="width: 60px; height: 60px; background-color: #ffffff; border: 1px solid #ccc;"></div>
                            <div class="swatch-label">Virtual Mix</div>
                        </div>

                        <!-- Analog Mix Swatch -->
                        <div class="text-center mx-1">
                            <div id="analog-mix-swatch" class="rounded" style="width: 60px; height: 60px; background-color: #ffffff; border: 1px solid #ccc;"></div>
                            <div class="swatch-label">Analog Mix</div>
                        </div>
                    </div>

                    <!-- Reset icon -->
                    <i id="reset-icon" class="fas fa-sync-alt text-secondary mb-2" style="cursor: pointer;" title="Reset Swatches"></i>
                    <!-- Save message -->
                    <!-- Mix details -->
                    <ul id="selected-pigments" class="list-group list-group-flush" style="font-size: 0.7rem; width: 100%;">
                        <!-- Pigment items will be dynamically added here -->
                    </ul>
                    <!-- Form for entering final RGB and saving as analog -->
                    <div class="form-group mt-2 mb-0" style="width: 100%;">
                        <input type="text" id="final-rgb-input" class="form-control form-control-sm" placeholder="RGB">
                        <button id="save-analog-button" class="btn btn-primary btn-sm mt-1 w-100">Save Analog Mix</button>
                    </div>
                </div>
            </div>

            <!-- Content Area -->
            <div class="flex-grow-1 content-area">
            <?php include 'header.php'; ?>

                <div class="container mt-3">
                    <h1 class="mb-0">Pigments</h1>
                    <div class="pigment-container">
                        <?php if ($stmt->rowCount() > 0): ?>
                            <?php while($row = $stmt->fetch()): ?>
                                <div class="pigment-card">
                                    <div class="swatch" style="background-color: <?= htmlspecialchars($row['color_hex']) ?>;"></div>
                                    <div class="name-cell"><?= htmlspecialchars($row['name']) ?></div>
                                    <div class="slider-column">
                                        <div class="slider" 
                                             id="slider-<?= $row['pigment_id'] ?>" 
                                             data-name="<?= htmlspecialchars($row['name']) ?>" 
                                             data-rgb="<?= htmlspecialchars($row['color_hex']) ?>"></div>
                                    </div>
                                </div>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <p>No pigments found.</p>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Include noUiSlider JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.6.1/nouislider.min.js"></script>
    <script src="/scripts/mixbox.js"></script>

    <!-- Initialize sliders and update selected pigments display -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Initializing sliders.');

        // Object to keep track of selected pigments
        var selectedPigments = {};

        // Element to display selected pigments
        var selectedPigmentsDisplay = document.getElementById('selected-pigments');

        // Element for the color swatch
        var colorSwatch = document.getElementById('color-swatch');

        // Select all slider elements
        var sliders = document.querySelectorAll('.slider');

        // Loop through each slider and initialize it
        sliders.forEach(function(slider) {
            var pigmentName = slider.getAttribute('data-name');
            var pigmentId = slider.id.split('-')[1]; // Extract the actual pigment_id from the slider ID

            // Get RGB value from data attribute and convert to array
            var hexColor = slider.getAttribute('data-rgb');
            var rgbColor = hexToRgb(hexColor);

            // Store RGB color in the slider element for easy access
            slider.rgbColor = rgbColor;

            // Initialize the slider with noUiSlider
            noUiSlider.create(slider, {
                start: 0, // Start at 0 (no parts selected)
                connect: [true, false],
                step: 1, // Steps of 1
                range: {
                    'min': 0,
                    'max': 10
                },
                // Remove tooltips
                tooltips: false
            });

            // Update selected pigments on slider change
            slider.noUiSlider.on('update', function(values, handle) {
                var value = parseInt(values[handle]);
                if (value > 0) {
                    selectedPigments[pigmentId] = {
                        id: pigmentId, // Use the actual pigment_id
                        name: pigmentName,
                        value: value,
                        rgb: slider.rgbColor
                    };
                } else {
                    delete selectedPigments[pigmentId];
                }

                updateSelectedPigmentsDisplay();
                updateColorSwatch();

                // Check the number of selected pigments
                var selectedCount = Object.keys(selectedPigments).length;
                if (selectedCount > 5) {
                    // Show the modal if more than three pigments are selected
                    console.log('Showing modal');
                    $('#mixLimitModal').modal('show');
                    // Reset the slider to 0 if more than three are selected
                    slider.noUiSlider.set(0);
                    delete selectedPigments[pigmentId];
                } else if (selectedCount > 1) {
                    // Save the current mix only if more than one pigment is selected
                    saveCurrentMix();
                }
            });
        });

        // Function to update the selected pigments display
        function updateSelectedPigmentsDisplay() {
            var selectedPigmentsArray = Object.values(selectedPigments);
            var selectedPigmentsList = document.getElementById('selected-pigments');

            // Clear the current list
            selectedPigmentsList.innerHTML = '';

            if (selectedPigmentsArray.length === 0) {
                var noPigmentsItem = document.createElement('li');
                noPigmentsItem.className = 'list-group-item';
                noPigmentsItem.textContent = 'No pigments selected.';
                selectedPigmentsList.appendChild(noPigmentsItem);
            } else {
                // Calculate total parts
                var totalParts = selectedPigmentsArray.reduce(function(acc, pigment) {
                    return acc + pigment.value;
                }, 0);

                selectedPigmentsArray.forEach(function(pigment) {
                    var listItem = document.createElement('li');
                    listItem.className = 'list-group-item';
                    var partText = pigment.value === 1 ? 'Part' : 'Parts';
                    var percentage = Math.round((pigment.value / totalParts) * 100);
                    listItem.textContent = `${pigment.value} ${partText} ${pigment.name} (${percentage}%)`;
                    selectedPigmentsList.appendChild(listItem);
                });
            }
        }

        // Function to update the color swatch
        function updateColorSwatch() {
            var selectedPigmentsArray = Object.values(selectedPigments);

            if (selectedPigmentsArray.length === 0) {
                // If no pigments selected, set swatch to default color
                colorSwatch.style.backgroundColor = '#ffffff';
            } else {
                // Prepare arrays for mixbox.js
                var latents = [];
                var weights = [];

                // Total parts for weighting
                var totalParts = selectedPigmentsArray.reduce(function(acc, pigment) {
                    return acc + pigment.value;
                }, 0);

                selectedPigmentsArray.forEach(function(pigment) {
                    // Normalize weight
                    var weight = pigment.value / totalParts;

                    // Convert RGB to latent vector
                    var latent = mixbox.rgbToLatent(pigment.rgb);

                    latents.push(latent);
                    weights.push(weight);
                });

                // Initialize mixed latent vector
                var mixedLatent = new Array(mixbox.LATENT_SIZE).fill(0);

                // Mix the latents based on weights
                for (var i = 0; i < mixbox.LATENT_SIZE; i++) {
                    for (var j = 0; j < latents.length; j++) {
                        mixedLatent[i] += weights[j] * latents[j][i];
                    }
                }

                // Convert the mixed latent vector back to RGB
                var mixedRgb = mixbox.latentToRgb(mixedLatent);

                // Convert RGB array to CSS color string
                var mixedColor = `rgb(${mixedRgb[0]}, ${mixedRgb[1]}, ${mixedRgb[2]})`;

                // Update the swatch color
                colorSwatch.style.backgroundColor = mixedColor;
            }
        }

        // Function to convert hex color code to RGB array
        function hexToRgb(hex) {
            // Remove the hash symbol if present
            hex = hex.replace('#', '');

            // Expand shorthand form (e.g., "03F") to full form (e.g., "0033FF")
            if (hex.length === 3) {
                hex = hex.split('').map(function(h) {
                    return h + h;
                }).join('');
            }

            var bigint = parseInt(hex, 16);
            var r = (bigint >> 16) & 255;
            var g = (bigint >> 8) & 255;
            var b = bigint & 255;

            return [r, g, b];
        }

        function saveCurrentMix() {
            // Calculate total parts
            var totalParts = Object.values(selectedPigments).reduce(function(acc, pigment) {
                return acc + pigment.value;
            }, 0);

            var pigments = Object.values(selectedPigments).map(function(pigment) {
                return {
                    pigment_id: pigment.id, // Use the actual pigment_id
                    parts: pigment.value,
                    percentage: ((pigment.value / totalParts) * 100).toFixed(2)
                };
            });

            console.log(pigments);

            var finalRgb = calculateFinalRgb(); // Function to calculate the final RGB

            // Send data to the server
            fetch('save_mix.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'virtual',
                    finalRgb: finalRgb,
                    pigments: pigments
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Mix saved:', data);
            })
            .catch(error => {
                console.error('Error saving mix:', error);
            });
        }

        function calculateFinalRgb() {
            // Your existing logic to calculate the final RGB
            return '255,165,0'; // Example RGB value
        }

        // Example function to show the modal
        function showMixLimitModal() {
            $('#mixLimitModal').modal('show');
        }

        // Example condition to trigger the modal
        if (Object.keys(selectedPigments).length > 3) {
            showMixLimitModal();
        }

        var resetIcon = document.getElementById('reset-icon');
        var saveAnalogButton = document.getElementById('save-analog-button');
        var finalRgbInput = document.getElementById('final-rgb-input');
        var analogMixSwatch = document.getElementById('analog-mix-swatch');

        // Reset icon functionality
        resetIcon.addEventListener('click', function() {
            if (Object.keys(selectedPigments).length > 0) {
                resetSwatches();
            }
        });

        function resetSwatches() {
            // Reset all sliders to 0
            sliders.forEach(function(slider) {
                slider.noUiSlider.set(0);
            });

            // Clear selected pigments
            selectedPigments = {};
            updateSelectedPigmentsDisplay();
            updateColorSwatch();
        }

        // Save as Analog functionality
        saveAnalogButton.addEventListener('click', function() {
            var finalRgb = finalRgbInput.value.trim();
            if (finalRgb.match(/^\d{1,3},\d{1,3},\d{1,3}$/)) {
                saveCurrentMix('analog', finalRgb);
            } else {
                alert('Please enter a valid RGB value in the format R,G,B.');
            }
        });

        function saveCurrentMix(type = 'virtual', finalRgb = calculateFinalRgb()) {
            // Calculate total parts
            var totalParts = Object.values(selectedPigments).reduce(function(acc, pigment) {
                return acc + pigment.value;
            }, 0);

            var pigments = Object.values(selectedPigments).map(function(pigment) {
                return {
                    pigment_id: pigment.id, // Use the actual pigment_id
                    parts: pigment.value,
                    percentage: ((pigment.value / totalParts) * 100).toFixed(2)
                };
            });

            console.log(pigments);

            // Send data to the server
            fetch('save_mix.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: type,
                    finalRgb: finalRgb,
                    pigments: pigments
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Mix saved:', data);
            })
            .catch(error => {
                console.error('Error saving mix:', error);
            });
        }

       
        function saveCurrentMix(type = 'virtual', finalRgb = calculateFinalRgb()) {
            // Calculate total parts
            var totalParts = Object.values(selectedPigments).reduce(function(acc, pigment) {
                return acc + pigment.value;
            }, 0);

            var pigments = Object.values(selectedPigments).map(function(pigment) {
                return {
                    pigment_id: pigment.id, // Use the actual pigment_id
                    parts: pigment.value,
                    percentage: ((pigment.value / totalParts) * 100).toFixed(2)
                };
            });


            // Send data to the server
            fetch('save_mix.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: type,
                    finalRgb: finalRgb,
                    pigments: pigments
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Mix saved:', data);
            })
            .catch(error => {
                console.error('Error saving mix:', error);
            });
        }

        // Function to update the analog mix swatch
        function updateAnalogMixSwatch(rgb) {
            analogMixSwatch.style.backgroundColor = `rgb(${rgb})`;
        }

        // Event listener for the final RGB input
        finalRgbInput.addEventListener('input', function() {
            var finalRgb = finalRgbInput.value.trim();
            console.log('hi');
            if (finalRgb.match(/^\d{1,3},\d{1,3},\d{1,3}$/)) {
                updateAnalogMixSwatch(finalRgb);
            } else {
                // Optionally reset the swatch if the input is invalid
                analogMixSwatch.style.backgroundColor = '#ffffff';
            }
        });
    });
    </script>

    <!-- Modal -->
    <div class="modal fade" id="mixLimitModal" tabindex="-1" aria-labelledby="mixLimitModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="mixLimitModalLabel"><i class="fas fa-palette"></i> Mixing Limit</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p><i class="fas fa-exclamation-triangle"></i> For a balanced and professional mix, please limit your selection.</p>
            <p>Think like a professional oil painter: simplicity is key!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-dismiss="modal">Got it!</button>
          </div>
        </div>
      </div>
    </div>
</body>
</html>
