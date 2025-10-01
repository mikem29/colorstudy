<svelte:head>
  <title>HueMixy - Stop Guessing Colors, Start Seeing Them</title>
  <meta name="description" content="Your eyes lie about color. That brown tree trunk? It's grey. HueMixy isolates true color values from reference images, creates printable mixing guides with spatial reference, and supports any printer format." />
</svelte:head>

<!-- Hero Section -->
<div class="bg-gray-100 min-h-screen">
  <!-- Navigation will be handled by layout -->

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
    <div class="text-left">
      <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-10 text-center">
        Your Eyes Lie About
        <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Color
        </span>
      </h1>
      <p class="text-xl md:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto">
        That tree trunk reads as brown because we learn it that way. The same goes for leaves as bright green and eyeballs as white. In isolation, those spots are often neutral greys, muted greens, or warm off white, depending on the light.
      </p>
      <p class="text-xl md:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto">
        Colors that sit next to each other also bend perception. Surrounding hues and values bias how a patch looks, shifting its apparent hue, value, and chroma, even for experienced eyes.
      </p>
		<p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
			The solution is to isolate the color. HueMixy is the simple way to do the whole job in one place. Isolate the color, record the source, organize swatches, and lay out on boards for print. Get a clean, ready to print study without the detours of general design suites.
		</p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <a href="/signup" class="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg">
          Get Started
        </a>
        <a href="/login" class="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-lg">
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

<!-- Why Color Studies Matter Section -->
<div class="py-20 bg-gradient-to-b from-gray-100 to-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Color Studies Matter</h2>
      <p class="text-2xl md:text-3xl text-gray-700 max-w-4xl mx-auto text-left">
        To see true color values, you need to isolate them from their context. Color studies let you do this by extracting colors from reference material so you can work with what is actually there, not what your eyes assume. Catching these relationships is often what turns a good painting into a great one.
      </p>
    </div>

    <div class="mb-6 max-w-4xl mx-auto">
      <p class="text-2xl md:text-3xl text-gray-700 text-left">
        Creating color studies in general design software, web based or otherwise, takes more time than needed, even for professional graphic designers. HueMixy is purpose built for speed. More time creating, less time working.
      </p>
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
          <p class="text-blue-100">Familiar controls without the extra weight. Focused on color studies so common tasks take seconds.</p>
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
              <p class="text-sm text-gray-700">Purpose-built to remove repetitive steps so you can focus on decisions.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">HueMixy Makes It Easy</h2>
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
          Just click on your reference image to create a swatch. No manual color picking, no copying hex codes, no creating shapes. HueMixy handles everything instantly.
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
        Three common use cases showing how HueMixy adapts to your creative flow.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Use Case 1 -->
      <div class="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div class="relative bg-gray-900 p-4 sm:p-6">
          <img src="/images/isabel.png" alt="Fine art reference with extracted swatches" class="w-full h-auto rounded-lg shadow-lg" loading="lazy">
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-semibold shadow">
            <i class="fas fa-palette mr-1"></i> Fine Artists
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Print-Ready Studies</h3>
          <p class="text-gray-600">Purpose-built for study boards. The steps you need, nothing you don't.</p>
        </div>
      </div>

      <!-- Use Case 2 -->
      <div class="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div class="relative aspect-[4/3] bg-gradient-to-br from-emerald-50 to-teal-50">
          <img src="/images/designers.png" alt="Interior design photo with specified colors" class="w-full h-full object-cover">
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow">
            <i class="fas fa-swatchbook mr-1"></i> Designers
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Build Cohesive Palettes</h3>
          <p class="text-gray-600">Set palettes fast without wrestling a full design suite. Resize, rearrange, print.</p>
        </div>
      </div>

      <!-- Use Case 3 -->
      <div class="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div class="relative aspect-[4/3] bg-gradient-to-br from-indigo-50 to-blue-50">
          <img src="/images/pearl.png" alt="Teaching workshop with printed color palettes" class="w-full h-full object-cover">
          <div class="absolute top-3 left-3 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow">
            <i class="fas fa-chalkboard mr-1"></i> Teaching Workshops
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Teaching Workshops</h3>
          <p class="text-gray-600">Get repeatable results quickly. Consistent targets, ready to hand out.</p>
        </div>
      </div>
    </div>

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