<svelte:head>
  <title>ColorStudy - Professional Color Sampling & Analysis</title>
  <meta name="description" content="Advanced color sampling tools for artists, designers, and creative professionals. Extract precise colors from images and build beautiful palettes." />
</svelte:head>

<!-- Hero Section -->
<div class="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
  <!-- Navigation will be handled by layout -->

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
    <div class="text-center">
      <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        Professional Color
        <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Sampling & Analysis
        </span>
      </h1>
      <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Extract precise colors from images, build beautiful palettes, and streamline your creative workflow
        with our advanced color sampling tools designed for artists and designers.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <a href="/signup" class="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg">
          Start Free Trial
        </a>
        <a href="/login" class="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-lg">
          Sign In
        </a>
      </div>

      <!-- Feature Preview Image Placeholder -->
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
        <div class="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-96 flex items-center justify-center">
          <div class="text-center">
            <i class="fas fa-paint-brush text-6xl text-gray-400 mb-4"></i>
            <p class="text-gray-500 text-lg">ColorStudy Interface Preview</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Features Section -->
<div class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
      <p class="text-xl text-gray-600">Everything you need for professional color analysis</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="text-center p-6">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-crosshairs text-blue-600 text-2xl"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Precision Sampling</h3>
        <p class="text-gray-600">Advanced sampling algorithms with configurable sample sizes from 1x1 pixel to 31x31 areas for perfect accuracy.</p>
      </div>

      <div class="text-center p-6">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-palette text-green-600 text-2xl"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Multiple Color Modes</h3>
        <p class="text-gray-600">Support for RGB and CMYK color modes to match your workflow and output requirements.</p>
      </div>

      <div class="text-center p-6">
        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-layer-group text-purple-600 text-2xl"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Artboard System</h3>
        <p class="text-gray-600">Organize your work with professional artboards, supporting multiple images and unlimited color swatches.</p>
      </div>
    </div>
  </div>
</div>

<!-- CTA Section -->
<div class="bg-gray-900 text-white py-20">
  <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
    <h2 class="text-4xl font-bold mb-4">Ready to Get Started?</h2>
    <p class="text-xl text-gray-300 mb-8">Join thousands of creative professionals using ColorStudy for their color workflow.</p>
    <a href="/signup" class="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg inline-block">
      Create Your Free Account
    </a>
  </div>
</div>