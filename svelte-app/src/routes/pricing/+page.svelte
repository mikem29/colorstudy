<script>
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Pricing - HueMixy</title>
  <meta name="description" content="Simple, transparent pricing. Start free with 5 artboards. Upgrade to Pro for unlimited artboards at $2/month or $17/year." />

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-306485116"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'AW-306485116');
  </script>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-4">
          <a href="/" class="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <i class="fas fa-palette text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HueMixy
              </h1>
            </div>
          </a>
        </div>

        <div class="flex items-center space-x-4">
          <a
            href="/"
            class="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
      <p class="text-xl text-gray-600">Start free. Upgrade when you need more boards.</p>
    </div>

    <!-- Pricing Cards -->
    <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <!-- Free Tier -->
      <div class="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-8">
        <div class="mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Free</h3>
          <div class="flex items-baseline mb-4">
            <span class="text-5xl font-bold text-gray-900">$0</span>
            <span class="text-gray-600 ml-2">/ forever</span>
          </div>
          <p class="text-gray-600">Perfect for trying HueMixy</p>
        </div>

        <div class="space-y-4 mb-8">
          <div class="flex items-start">
            <i class="fas fa-check text-green-600 mt-1 mr-3"></i>
            <span class="text-gray-700"><strong>Limited to 5 artboards</strong></span>
          </div>
          <div class="flex items-start">
            <i class="fas fa-check text-green-600 mt-1 mr-3"></i>
            <span class="text-gray-700">Unlimited color swatches</span>
          </div>
          <div class="flex items-start">
            <i class="fas fa-check text-green-600 mt-1 mr-3"></i>
            <span class="text-gray-700">RGB & CMYK values</span>
          </div>
          <div class="flex items-start">
            <i class="fas fa-check text-green-600 mt-1 mr-3"></i>
            <span class="text-gray-700">Print at any size</span>
          </div>
          <div class="flex items-start">
            <i class="fas fa-check text-green-600 mt-1 mr-3"></i>
            <span class="text-gray-700">Visual connection lines</span>
          </div>
        </div>

        <a
          href="/signup"
          class="block w-full py-3 px-4 text-center border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Get Started Free
        </a>
      </div>

      <!-- Pro Tier -->
      <div class="bg-white rounded-2xl border-2 border-purple-500 shadow-xl p-8 relative">
        <!-- Best Value Badge -->
        <div class="absolute -top-4 left-1/2 -translate-x-1/2">
          <span class="inline-flex items-center px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg">
            <i class="fas fa-star mr-2"></i>
            Best Value
          </span>
        </div>

        <div class="mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
          <div class="mb-4">
            <div class="flex items-baseline mb-2">
              <span class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$2</span>
              <span class="text-gray-600 ml-2">/ month</span>
            </div>
            <div class="flex items-baseline">
              <span class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$17</span>
              <span class="text-gray-600 ml-2">/ year</span>
              <span class="ml-3 text-sm text-green-600 font-medium">(save 30%)</span>
            </div>
          </div>
          <p class="text-gray-600">For unlimited creativity</p>
        </div>

        <div class="space-y-4 mb-8">
          <div class="flex items-start">
            <i class="fas fa-check text-purple-600 mt-1 mr-3"></i>
            <span class="text-gray-700"><strong>Unlimited artboards</strong></span>
          </div>
        </div>

        <a
          href="/signup"
          class="block w-full py-3 px-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          Get Started Free
        </a>
      </div>
    </div>
  </main>

  <Footer />
</div>
