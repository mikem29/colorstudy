<svelte:head>
  <title>ColorStudy - Visual Color Sampling with Artboard Workspace</title>
  <meta name="description" content="The color sampling tool that shows you exactly where each color came from. Artboard workspace, visual connection lines, and pixel-precise sampling for designers who need to see the full picture." />
</svelte:head>

<!-- Hero Section -->
<div class="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
  <!-- Navigation will be handled by layout -->

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
    <div class="text-center">
      <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        See Where Every Color
        <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Actually Came From
        </span>
      </h1>
      <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Not another color picker. ColorStudy is a visual workspace where your swatches connect to their source with customizable lines,
        letting you sample multiple images on one artboard and see your entire color story at a glance.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <a href="/signup" class="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg">
          Start Creating Free
        </a>
        <a href="/login" class="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-lg">
          Sign In
        </a>
      </div>

      <!-- Feature Preview Image Placeholder -->
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
        <div class="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-96 flex items-center justify-center">
          <div class="text-center">
            <svg class="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-gray-500 text-lg font-medium">Your artboard workspace with visual connections</p>
            <p class="text-gray-400 text-sm mt-2">Multiple images, draggable swatches, connection lines to sample points</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- What Makes This Different Section -->
<div class="py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-gray-900 mb-4">Why ColorStudy Works Differently</h2>
      <p class="text-xl text-gray-600">Traditional color pickers just give you hex codes. We show you the whole story.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
      <!-- Visual Connection System -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-8">
        <div class="flex items-start space-x-4 mb-4">
          <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Visual Connection Lines</h3>
            <p class="text-gray-700 leading-relaxed mb-4">
              Each color swatch draws a line back to its exact sample point on your image. Change the line color to organize your palette or match it to the swatch for a clean look.
            </p>
            <p class="text-gray-600 text-sm italic">
              Like DaVinci Resolve node connectors, but for color sampling.
            </p>
          </div>
        </div>
      </div>

      <!-- Artboard Workspace -->
      <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-8">
        <div class="flex items-start space-x-4 mb-4">
          <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Multi-Image Artboards</h3>
            <p class="text-gray-700 leading-relaxed mb-4">
              Place multiple reference images on one artboard sized in real inches. Drag images and swatches wherever you need them. Pan and zoom to work at any scale.
            </p>
            <p class="text-gray-600 text-sm italic">
              Build color palettes from multiple sources in one organized workspace.
            </p>
          </div>
        </div>
      </div>

      <!-- Precision Sampling -->
      <div class="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-8">
        <div class="flex items-start space-x-4 mb-4">
          <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="fas fa-crosshairs text-white text-xl"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Pixel-Precise Sampling</h3>
            <p class="text-gray-700 leading-relaxed mb-4">
              Sample a single pixel or average across areas from 3x3 up to 101x101 pixels. Switch between point sampling for exact colors or area averaging for smoother tones.
            </p>
            <p class="text-gray-600 text-sm italic">
              Seven sample sizes to match how you work.
            </p>
          </div>
        </div>
      </div>

      <!-- Professional Output -->
      <div class="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-8">
        <div class="flex items-start space-x-4 mb-4">
          <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="fas fa-palette text-white text-xl"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">RGB & CMYK Output</h3>
            <p class="text-gray-700 leading-relaxed mb-4">
              View colors in RGB or CMYK format with values displayed directly on swatches. Toggle the display on or off to keep your workspace clean while maintaining all color data.
            </p>
            <p class="text-gray-600 text-sm italic">
              Export-ready color values for screen or print.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Who This Is For -->
    <div class="bg-gray-900 rounded-2xl p-12 text-white">
      <h3 class="text-3xl font-bold mb-8 text-center">Built for Visual Thinkers</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="text-4xl mb-4">🎨</div>
          <h4 class="font-semibold text-lg mb-2">Digital Artists</h4>
          <p class="text-gray-300 text-sm">
            Sample colors from photo references while keeping your entire composition visible
          </p>
        </div>
        <div class="text-center">
          <div class="text-4xl mb-4">🏗️</div>
          <h4 class="font-semibold text-lg mb-2">Brand Designers</h4>
          <p class="text-gray-300 text-sm">
            Extract brand colors from multiple logo variations and competitor materials
          </p>
        </div>
        <div class="text-center">
          <div class="text-4xl mb-4">📐</div>
          <h4 class="font-semibold text-lg mb-2">UI/UX Designers</h4>
          <p class="text-gray-300 text-sm">
            Build design system palettes with documented sources for every color choice
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- How It Works Section -->
<div class="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-4xl font-bold text-gray-900 mb-4 text-center">How It Works</h2>
    <p class="text-xl text-gray-600 mb-12 text-center">Three steps to organized color sampling</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-white rounded-xl p-8 shadow-md">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">1</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Create an Artboard</h3>
        <p class="text-gray-600">
          Start with a workspace sized in real inches, letter to tabloid size or custom dimensions. Name it for your project.
        </p>
      </div>

      <div class="bg-white rounded-xl p-8 shadow-md">
        <div class="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Add Your Images</h3>
        <p class="text-gray-600">
          Upload reference images, mood boards, or design comps. Drag them around your artboard and resize to compare multiple sources.
        </p>
      </div>

      <div class="bg-white rounded-xl p-8 shadow-md">
        <div class="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">3</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3">Sample & Connect</h3>
        <p class="text-gray-600">
          Click anywhere to sample colors. Each swatch shows a visual line to its source. Customize line colors and organize your palette.
        </p>
      </div>
    </div>
  </div>
</div>

<!-- CTA Section -->
<div class="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20">
  <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
    <h2 class="text-4xl md:text-5xl font-bold mb-4">Stop Losing Track of Your Colors</h2>
    <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
      See where every color came from. Build palettes that tell a story. Work the way visual thinkers actually think.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/signup" class="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg inline-block shadow-lg">
        Start Creating Free
      </a>
      <a href="/login" class="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg inline-block">
        Sign In
      </a>
    </div>
    <p class="text-blue-200 text-sm mt-6">No credit card required. Start sampling in seconds.</p>
  </div>
</div>