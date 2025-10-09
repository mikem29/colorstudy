<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Pricing - HueMixy</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-4">
          <a href={data?.user ? "/dashboard" : "/"} class="flex items-center space-x-4 hover:opacity-80 transition-opacity">
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
            href={data?.user ? "/dashboard" : "/"}
            class="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            {data?.user ? "Back to Dashboard" : "Back to Home"}
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
      <p class="text-xl text-gray-600 mb-8">Start free. Upgrade when you need more boards.</p>

      <!-- Billing Toggle -->
      <div class="inline-flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-sm">
        <button
          onclick={() => billingPeriod = 'monthly'}
          class={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            billingPeriod === 'monthly'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Monthly
        </button>
        <button
          onclick={() => billingPeriod = 'yearly'}
          class={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            billingPeriod === 'yearly'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Yearly
          <span class="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Save 30%</span>
        </button>
      </div>
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
            <span class="text-gray-700"><strong>5 artboards</strong></span>
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
          <div class="flex items-baseline mb-1">
            {#if billingPeriod === 'monthly'}
              <span class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$2</span>
              <span class="text-gray-600 ml-2">/ month</span>
            {:else}
              <span class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$17</span>
              <span class="text-gray-600 ml-2">/ year</span>
            {/if}
          </div>
          {#if billingPeriod === 'yearly'}
            <p class="text-sm text-green-600 font-medium mb-2">That's just $1.40/month - save 30%</p>
          {/if}
          <p class="text-gray-600">For unlimited creativity</p>
        </div>

        <div class="space-y-4 mb-8">
          <div class="flex items-start">
            <i class="fas fa-check text-purple-600 mt-1 mr-3"></i>
            <span class="text-gray-700"><strong>Unlimited artboards</strong></span>
          </div>
          <div class="flex items-start">
            <i class="fas fa-check text-purple-600 mt-1 mr-3"></i>
            <span class="text-gray-700">Everything in Free, plus:</span>
          </div>
          <div class="flex items-start">
            <i class="fas fa-check text-purple-600 mt-1 mr-3"></i>
            <span class="text-gray-700">Create as many boards as you need</span>
          </div>
          <div class="flex items-start">
            <i class="fas fa-check text-purple-600 mt-1 mr-3"></i>
            <span class="text-gray-700">Perfect for professional use</span>
          </div>
          <div class="flex items-start">
            <i class="fas fa-check text-purple-600 mt-1 mr-3"></i>
            <span class="text-gray-700">Priority support</span>
          </div>
        </div>

        {#if data?.user?.subscription_tier === 'paid'}
          <div class="w-full py-3 px-4 text-center bg-green-50 text-green-700 rounded-lg font-semibold border-2 border-green-200">
            <i class="fas fa-check-circle mr-2"></i>
            Current Plan
          </div>
        {:else if data?.user}
          <form method="POST" action="?/upgradeToPro" use:enhance>
            <button
              type="submit"
              class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Upgrade to Pro
            </button>
          </form>
        {:else}
          <a
            href="/signup"
            class="block w-full py-3 px-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Get Started Free
          </a>
        {/if}
      </div>
    </div>

    <!-- FAQ or Additional Info -->
    <div class="mt-16 max-w-2xl mx-auto text-center">
      <h3 class="text-2xl font-bold text-gray-900 mb-6">Questions?</h3>
      <div class="space-y-4 text-left">
        <details class="bg-white rounded-lg border border-gray-200 p-4">
          <summary class="font-semibold text-gray-900 cursor-pointer">Can I cancel anytime?</summary>
          <p class="mt-2 text-gray-600">Yes! Cancel anytime from your profile page. No questions asked.</p>
        </details>
        <details class="bg-white rounded-lg border border-gray-200 p-4">
          <summary class="font-semibold text-gray-900 cursor-pointer">What happens to my boards if I downgrade?</summary>
          <p class="mt-2 text-gray-600">Your boards are safe! You can still view and export all your boards. You just can't create new ones beyond the free tier limit until you upgrade again.</p>
        </details>
        <details class="bg-white rounded-lg border border-gray-200 p-4">
          <summary class="font-semibold text-gray-900 cursor-pointer">Do you offer refunds?</summary>
          <p class="mt-2 text-gray-600">Yes! If you're not happy within 30 days, email <a href="mailto:support@huemixy.com" class="text-blue-600 hover:text-blue-700">support@huemixy.com</a> for a full refund.</p>
        </details>
      </div>
    </div>

    <!-- Coupon Section (kept for existing coupon functionality) -->
    {#if data?.user && data?.user?.subscription_tier !== 'paid'}
      <div class="mt-16 max-w-md mx-auto">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">Have a Coupon Code?</h3>

          <form method="POST" action="?/redeemCoupon" use:enhance class="space-y-4">
            <input
              id="couponCode"
              name="couponCode"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase text-center text-lg font-mono"
              placeholder="ENTER CODE"
            />

            {#if form?.couponError}
              <div class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                <i class="fas fa-exclamation-circle mr-2"></i>
                {form.couponError}
              </div>
            {/if}

            <button
              type="submit"
              class="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              <i class="fas fa-ticket mr-2"></i>
              Apply Coupon
            </button>
          </form>
        </div>
      </div>
    {/if}
  </main>
</div>
