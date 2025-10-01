<svelte:head>
  <title>ColorStudy - Stop Guessing Colors, Start Seeing Them</title>
  <meta name="description" content="Your eyes lie about color. That brown tree trunk? It's grey. ColorStudy isolates true color values from reference images, creates printable mixing guides with spatial reference, and supports any printer format." />
</svelte:head>

<!-- Hero Section -->
<div class="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
  <!-- Navigation will be handled by layout -->

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
    <div class="text-center">
      <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        Your Eyes Lie About
        <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Color
        </span>
      </h1>
      <p class="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
        That tree trunk looks brown. It's actually grey. When colors appear next to each other, your perception of tone, hue, and value becomes distorted.
      </p>
      <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
        ColorStudy reveals true color values by isolating them, then creates organized, printable color studies with visual lines showing exactly where each color came from.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <a href="/signup" class="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg">
          Get Started
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
            </svg>
            <p class="text-gray-500 text-lg font-medium">Swatches with visual lines to their source</p>
            <p class="text-gray-400 text-sm mt-2">See exactly where each color came from in your reference image</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Why Color Studies Matter Section -->
<div class="py-24 bg-gradient-to-b from-gray-50 to-gray-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Color Studies Matter</h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        To see true color values, you need to isolate them from their context. Color studies let you do this by extracting colors from reference material so you can work with what's actually there, not what your eyes think they see.
      </p>
    </div>

    <div class="text-center mb-16 max-w-3xl mx-auto">
      <p class="text-lg text-gray-600">
        But creating color studies in traditional design software is painstakingly slow and tedious. That's why ColorStudy exists.
      </p>
    </div>
  </div>
</div>

<!-- Features Section -->
<div class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">ColorStudy Makes It Easy</h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Purpose-built for creating color studies from reference material. Fast, intuitive, and fun to use, with features you won't find anywhere else.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <!-- Visual Connection Lines -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-10">
        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">See Where Colors Came From</h3>
        <p class="text-lg text-gray-700">
          Each swatch has a visual line connecting it to its exact location in your reference. Instantly see which color came from where, making your color study a living reference document, not just a collection of squares.
        </p>
      </div>

      <!-- Click to Sample -->
      <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-10">
        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Click Anywhere to Sample</h3>
        <p class="text-lg text-gray-700">
          Just click on your reference image to create a swatch. No manual color picking, no copying hex codes, no creating shapes. ColorStudy handles everything instantly.
        </p>
      </div>

      <!-- Easy to Edit -->
      <div class="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-10">
        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Drag to Reorganize</h3>
        <p class="text-lg text-gray-700">
          Drag swatches and images anywhere on your artboard. Reorganize your color study on the fly without starting over. Change line colors to group related swatches visually.
        </p>
      </div>

      <!-- Print Ready -->
      <div class="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-10">
        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Print at Any Size</h3>
        <p class="text-lg text-gray-700">
          Artboards are sized in real inches. Print at letter size or wide-format (24"+), whatever your printer supports. Tape it next to your canvas and work with confidence.
        </p>
      </div>
    </div>
  </div>
</div>

<!-- Showcase Section: three use-case screenshots -->
<section class="relative py-24 bg-gradient-to-b from-white to-blue-50/60">
  <div class="absolute inset-0 -z-10">
    <div class="absolute -top-10 -left-10 w-72 h-72 bg-blue-300/20 blur-3xl rounded-full"></div>
    <div class="absolute bottom-0 right-0 w-80 h-80 bg-purple-300/20 blur-3xl rounded-full"></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-14">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-4">
        <i class="fas fa-wand-magic-sparkles mr-2"></i> See it in action
      </span>
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Real Workflows, Real Results</h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        Three common use cases showing how ColorStudy adapts to your creative flow.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Use Case 1 -->
      <div class="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div class="relative aspect-[4/3] bg-gradient-to-br from-blue-50 to-purple-50">
          <img src="/uploads/1758821517384_twqzq.png" alt="Fine art reference with extracted swatches" class="w-full h-full object-cover">
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow">
            <i class="fas fa-palette mr-1"></i> Fine Art Study
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Paint From Accurate Swatches</h3>
          <p class="text-gray-600">Extract true colors from your reference and print them at real size for your easel.</p>
        </div>
      </div>

      <!-- Use Case 2 -->
      <div class="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div class="relative aspect-[4/3] bg-gradient-to-br from-emerald-50 to-teal-50">
          <img src="/uploads/1758833212099_3bgd9.png" alt="Brand palette exploration with grouped lines" class="w-full h-full object-cover">
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow">
            <i class="fas fa-swatchbook mr-1"></i> Brand Design
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Build Cohesive Palettes</h3>
          <p class="text-gray-600">Group swatches with colored guide lines and keep visual context from the source.</p>
        </div>
      </div>

      <!-- Use Case 3 -->
      <div class="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div class="relative aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50">
          <img src="/uploads/1758821422954_9ly9xi.jpg" alt="UI theming from screenshots" class="w-full h-full object-cover">
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-semibold shadow">
            <i class="fas fa-desktop mr-1"></i> UI Theming
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Theme Interfaces Quickly</h3>
          <p class="text-gray-600">Sample colors from app screenshots to define token sets and component styles.</p>
        </div>
      </div>
    </div>

    <p class="text-center text-sm text-gray-500 mt-6">You can replace these placeholder screenshots with your own examples anytime.</p>
  </div>
</section>

<!-- CTA Section -->
<div class="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-24">
  <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
    <h2 class="text-4xl md:text-5xl font-bold mb-6">Ready to Make Color Studies Easy?</h2>
    <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
      Stop the tedious manual work in design tools. Create organized, printable color studies from your reference material quickly and easily, with visual lines showing where each color came from.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/signup" class="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg inline-block shadow-lg">
        Get Started
      </a>
      <a href="/login" class="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg inline-block">
        Sign In
      </a>
    </div>
  </div>
</div>