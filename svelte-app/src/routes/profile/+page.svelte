<script lang="ts">
  import { enhance } from '$app/forms';

  let { data, form } = $props();

  let updating = $state(false);
</script>

<svelte:head>
  <title>Profile - HueMixy</title>
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
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h2>
      <p class="text-gray-600">Manage your account settings and preferences</p>
    </div>

    <!-- Subscription Info -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Subscription Plan</h3>
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {data.user.subscription_tier === 'paid' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
              {data.user.subscription_tier === 'paid' ? 'Pro' : 'Free'}
            </span>
            {#if data.user.subscription_tier === 'free'}
              <span class="text-sm text-gray-600">• Limited to 5 artboards</span>
            {:else}
              <span class="text-sm text-gray-600">• Unlimited artboards</span>
            {/if}
          </div>
        </div>
        {#if data.user.subscription_tier === 'free'}
          <a
            href="/upgrade"
            class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 font-medium"
          >
            <i class="fas fa-crown mr-2"></i>
            Upgrade to Pro
          </a>
        {/if}
      </div>
    </div>

    <!-- Profile Form -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>

      <form method="POST" action="?/updateProfile" use:enhance={() => {
        updating = true;
        return async ({ update }) => {
          await update();
          updating = false;
        };
      }} class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form?.email ?? data.user.email}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
            New Password <span class="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Leave blank to keep current password"
          />
          <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
        </div>

        {#if form?.error}
          <div class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            <i class="fas fa-exclamation-circle mr-2"></i>
            {form.error}
          </div>
        {/if}

        {#if form?.success}
          <div class="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
            <i class="fas fa-check-circle mr-2"></i>
            Profile updated successfully
          </div>
        {/if}

        <button
          type="submit"
          disabled={updating}
          class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if updating}
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Updating...
          {:else}
            <i class="fas fa-save mr-2"></i>
            Update Profile
          {/if}
        </button>
      </form>
    </div>
  </main>
</div>
