<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Upgrade to Pro - HueMixy</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-4">
          <a href="/dashboard" class="flex items-center space-x-4 hover:opacity-80 transition-opacity">
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
            href="/dashboard"
            class="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg mb-6">
        <i class="fas fa-crown text-3xl"></i>
      </div>
      <h2 class="text-4xl font-bold text-gray-900 mb-4">Upgrade to Pro</h2>
      <p class="text-xl text-gray-600">Remove the 5 artboard limit and create unlimited color studies</p>
    </div>

    <!-- Pricing Card -->
    <div class="bg-white rounded-2xl border-2 border-purple-200 shadow-xl p-8 mb-8">
      <div class="text-center mb-8">
        <div class="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-4">
          <i class="fas fa-star mr-2"></i>
          Pro Plan
        </div>
        <div class="mb-4">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Unlimited Artboards</h3>
          <p class="text-gray-600">That's it. Same great features, no limits.</p>
        </div>
      </div>

      <!-- Coupon Code Section -->
      <div class="border-t border-gray-200 pt-8 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">Enter Your Coupon Code</h3>

        <form method="POST" action="?/redeemCoupon" use:enhance class="space-y-4">
          <div class="flex gap-4">
            <input
              id="couponCode"
              name="couponCode"
              type="text"
              required
              class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase text-center text-lg font-mono"
              placeholder="ENTER CODE"
            />
          </div>

          {#if form?.couponError}
            <div class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              <i class="fas fa-exclamation-circle mr-2"></i>
              {form.couponError}
            </div>
          {/if}

          <button
            type="submit"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 font-semibold text-lg shadow-lg"
          >
            <i class="fas fa-ticket mr-2"></i>
            Apply Coupon & Upgrade
          </button>
        </form>
      </div>

      <!-- Contact for Coupon -->
      <div class="border-t border-gray-200 pt-6 text-center">
        <p class="text-sm text-gray-600 mb-2">Don't have a coupon code?</p>
        <p class="text-gray-700">
          Email <a href="mailto:michael@indiemade.com" class="text-blue-600 hover:text-blue-700 font-medium">michael@indiemade.com</a> to request one during our launch promo period!
        </p>
      </div>
    </div>
  </main>
</div>
