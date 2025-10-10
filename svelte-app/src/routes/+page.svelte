<script>
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>HueMixy - Create Color Swatches from Any Image</title>
  <meta name="description" content="Extract color swatches from photos and images. Click to sample colors, organize them beautifully, and print at any size. Perfect for designers, artists, and hobbyists." />

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-306485116"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'AW-306485116');
  </script>
</svelte:head>

<!-- Hero Section -->
<div class="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
    <div class="text-center">
      <h1 class="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
        Create Color Swatches from<br>
        <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Any Image
        </span>
      </h1>
      <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Extract colors from photos, organize them beautifully, and print at any size. Perfect for design projects, interior planning, and creative work.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <a href="/signup" class="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg shadow-lg">
          Get Started Free
        </a>
        <a href="/login" class="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-lg">
          Sign In
        </a>
      </div>

      <!-- Feature Preview Image (full-bleed, full screen) -->
      <div class="relative mt-8">
        <div class="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen h-screen">
          <img
            src="/images/screen_2.png"
            alt="HueMixy main workflow screenshot"
            class="block w-screen h-screen object-contain mx-auto shadow-2xl shadow-black/40 ring-1 ring-black/10"
            loading="eager"
          />
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Features Section -->
<div class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Familiar UI Section (full-bleed dark band) -->
    <section class="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-blue-900 py-14 sm:py-20 mb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center md:text-left space-y-4">
          <h3 class="text-2xl md:text-3xl font-bold text-white">Familiar, Flexible UI</h3>
          <p class="text-blue-100">Simple controls that work the way you expect. Everything you need, nothing you don't.</p>
        </div>

        <!-- Full-width layout image with strong shadow -->
        <div class="mt-8">
          <img src="/images/layout.png" alt="Huemixy UI layout illustrating full customization" class="block w-full h-auto object-contain shadow-2xl shadow-black/50 ring-1 ring-white/10" loading="lazy" />
        </div>

        <!-- Bullets with more presence and spacing -->
        <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          <div class="flex items-start gap-4 p-6 rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
            <i class="fas fa-grip text-blue-700 text-2xl mt-1"></i>
            <div>
              <p class="font-semibold text-gray-900 text-lg">You set the layout</p>
              <p class="text-sm text-gray-700">No rigid templates. Arrange images and swatches any way you like.</p>
            </div>
          </div>
          <div class="flex items-start gap-4 p-6 rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
            <i class="fas fa-expand text-purple-700 text-2xl mt-1"></i>
            <div>
              <p class="font-semibold text-gray-900 text-lg">Fully resizable</p>
              <p class="text-sm text-gray-700">Custom sizes in real-world inches for perfect print.</p>
            </div>
          </div>
          <div class="flex items-start gap-4 p-6 rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
            <i class="fas fa-bolt text-emerald-700 text-2xl mt-1"></i>
            <div>
              <p class="font-semibold text-gray-900 text-lg">Intuitive and fast</p>
              <p class="text-sm text-gray-700">Simple workflow that gets out of your way. Extract colors and create boards in minutes.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Simple, Powerful Features</h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        Everything you need to extract colors from images and create professional swatch boards. No complicated design software required.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <!-- Visual Connection Lines -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-10">
        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">See Where Colors Came From</h3>
        <p class="text-lg text-gray-700">
          Visual lines connect each swatch to its exact location in your image. Instantly see which color came from where - perfect for reference and documentation.
        </p>
      </div>

      <!-- Click to Sample -->
      <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-10">
        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Click Anywhere to Sample</h3>
        <p class="text-lg text-gray-700">
          Just click on your image to create a color swatch. No manual color picking, no copying hex codes. Get RGB and CMYK values instantly.
        </p>
      </div>

      <!-- Easy to Edit -->
      <div class="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-10">
        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Drag to Reorganize</h3>
        <p class="text-lg text-gray-700">
          Drag swatches and images anywhere on your board. Reorganize on the fly without starting over. Change line colors to group related swatches.
        </p>
      </div>

      <!-- Print Ready -->
      <div class="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-10">
        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Print at Any Size</h3>
        <p class="text-lg text-gray-700">
          Set your board size in real inches. Print at letter size or wide-format (24"+), whatever your printer supports. Ready for professional use.
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
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">For Designers, Artists & More</h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        Whether you're planning a room, creating art, or teaching color theory - HueMixy makes it simple.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Use Case 1 -->
      <div class="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div class="relative bg-gray-900 p-4 sm:p-6">
          <img src="/images/isabel.png" alt="Art reference with extracted color swatches" class="w-full h-auto rounded-lg shadow-lg" loading="lazy">
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-semibold shadow">
            <i class="fas fa-palette mr-1"></i> Artists
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Extract Colors from Reference</h3>
          <p class="text-gray-600">Sample colors from photos and create organized swatch boards. Print and keep by your easel.</p>
        </div>
      </div>

      <!-- Use Case 2 -->
      <div class="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div class="relative aspect-[4/3] bg-gradient-to-br from-emerald-50 to-teal-50">
          <img src="/images/designers.png" alt="Interior design photo with color swatches" class="w-full h-full object-cover">
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow">
            <i class="fas fa-swatchbook mr-1"></i> Designers
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Build Color Palettes</h3>
          <p class="text-gray-600">Extract colors from inspiration photos. Create boards to share with clients or teams.</p>
        </div>
      </div>

      <!-- Use Case 3 -->
      <div class="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div class="relative aspect-[4/3] bg-gradient-to-br from-indigo-50 to-blue-50">
          <img src="/images/pearl.png" alt="Printed color swatch board" class="w-full h-full object-cover">
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow">
            <i class="fas fa-chalkboard mr-1"></i> Educators
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Create Teaching Materials</h3>
          <p class="text-gray-600">Make consistent color samples for students. Print multiple copies at any size.</p>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- CTA Section -->
<div class="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-24">
  <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
    <h2 class="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
    <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
      Create color swatch boards from any image. Free to start, upgrade for unlimited boards.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/signup" class="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg inline-block shadow-lg">
        Get Started Free
      </a>
      <a href="/login" class="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg inline-block">
        Sign In
      </a>
    </div>
  </div>
</div>

<Footer />