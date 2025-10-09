
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SwatchSnap</title>
    <!-- Include Bootstrap CSS from CDN -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <!-- Include Font Awesome -->
    <script src="https://kit.fontawesome.com/6905d8d4cb.js" crossorigin="anonymous"></script>
</head>
<body>
    <!-- Navigation Header -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="pigment_add.php">SwatchSnap</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" 
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item<?php echo basename($_SERVER['PHP_SELF']) == 'pigment_results.php' ? ' active' : ''; ?>">
                    <a class="nav-link" href="pigment_results.php">Pigments</a>
                </li>
                <!-- Add more menu items here if needed -->
            </ul>
        </div>
    </nav>
    <div class="container mt-4">