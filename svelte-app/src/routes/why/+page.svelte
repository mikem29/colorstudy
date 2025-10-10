<script>
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Why I Built HueMixy - A Tool for Painters, by a Painter</title>
  <meta name="description" content="The story of HueMixy: built by an oil painter tired of time-consuming color studies. Learn why knowing exactly where colors go in your reference makes all the difference in painting." />

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
  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white rounded-xl shadow-lg p-8 md:p-12">
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why I Built HueMixy</h2>

      <div class="prose prose-lg max-w-none">
        <p class="text-xl text-gray-700 leading-relaxed mb-6">
          Hi, I'm Michael. I've been a graphic designer and web developer for over 30 years. Like many old professional designers fortunate enough to find time now for painting, I'm a techy, a purist, a professional.
        </p>

        <div class="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
          <p class="text-lg text-gray-800 italic">
            Hue, tone, and value must be right to make it right. Color studies, physical swatches, and reference material are in order.
          </p>
        </div>

        <p class="text-lg text-gray-700 leading-relaxed mb-6">
          The problem? It's time-consuming and boring work.
        </p>

        <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">The Problem with Existing Tools</h3>

        <p class="text-lg text-gray-700 leading-relaxed mb-4">
          Like any good designer, I started using traditional design tools to create swatches and color palettes from my reference photos. There are plenty of online tools that let you upload an image and generate a color palette, but here's the thing they don't do:
        </p>

        <p class="text-lg text-gray-700 leading-relaxed mb-6 font-semibold">
          They don't tell you exactly where on the painting each color goes.
        </p>

        <p class="text-lg text-gray-700 leading-relaxed mb-6">
          And knowing exactly where each color comes from? That really improved my paintings. It stretched my color mixing skills too, because I started combining colors I never would have thought of. I stopped getting stuck painting the same old mixes from memory.
        </p>

        <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">How I Actually Painted</h3>

        <p class="text-lg text-gray-700 leading-relaxed mb-6">
          As I paint with my swatches, I write down the actual mixes I'm using and record them. That way I'm learning, not just copying. But to do this, I needed a fast way to upload a photograph and instantly isolate all the colors I'd need.
        </p>

        <p class="text-lg text-gray-700 leading-relaxed mb-6">
          The existing workflow was just too time-consuming. I knew there had to be a better way.
        </p>

        <div class="bg-purple-50 border-l-4 border-purple-600 p-6 my-8">
          <p class="text-xl text-gray-800 font-semibold">
            That's how HueMixy was born.
          </p>
        </div>

        <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Paint Mixing Formulas: A Game Changer</h3>

        <p class="text-lg text-gray-700 leading-relaxed mb-6">
          Having approximate paint mixes generated from color lookup tables turned out to be hugely helpful, not just for pros, but even more for students and amateurs. It gives you a starting point for a mix instead of staring at your palette wondering where to begin.
        </p>

        <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">The Biggest Problem I See in Paintings</h3>

        <p class="text-lg text-gray-700 leading-relaxed mb-6">
          One of the biggest failures I see in amateur paintings is the inability to see color. Paintings end up garish, muddy brown, or that bright tube green that, let's be honest, isn't very creative.
        </p>

        <p class="text-lg text-gray-700 leading-relaxed mb-6">
          Having a good color study before you even start painting makes a world of difference. The problem is that generating a good one, one that tells you all the different colors and exactly where they go, has always been time-consuming work.
        </p>

        <p class="text-xl text-gray-900 font-semibold mb-8">
          Until now.
        </p>

        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 my-8">
          <h3 class="text-2xl font-bold mb-4">Built by a Painter, for Painters</h3>
          <p class="text-lg mb-4">
            HueMixy was built by a painter for painters. But honestly, I could see several use cases for this tool: interior designers, crafters, color theorists, anyone working with color from reference material.
          </p>
          <p class="text-lg">
            I hope you like it. If you have feedback, questions, or just want to share what you're working on, reach out anytime at <a href="mailto:support@huemixy.com" class="underline font-semibold">support@huemixy.com</a>.
          </p>
        </div>

        <div class="text-center mt-12">
          <p class="text-gray-600 mb-6">Michael</p>
          <a href="/signup" class="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg shadow-lg">
            Try HueMixy Free
          </a>
        </div>
      </div>
    </div>
  </main>

  <Footer />
</div>
