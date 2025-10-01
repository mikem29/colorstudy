<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';

  export let form;
</script>

<svelte:head>
  <title>Login - ColorStudy</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md mx-auto">
    <div class="text-center mb-8">
      <h2 class="text-4xl font-bold text-gray-900 mb-3">
        Welcome back
      </h2>
      <p class="text-lg text-gray-600 mb-6">
        Sign in to continue working on your color studies
      </p>
      <p class="text-sm text-gray-600">
        Don't have an account?
        <a href="/signup" class="font-medium text-blue-600 hover:text-blue-500">
          Create one
        </a>
      </p>
    </div>
    <form method="POST" use:enhance class="bg-white shadow-lg rounded-lg px-8 pt-8 pb-8 space-y-5">
      <input type="hidden" name="remember" value="true" />
      <div>
        <label for="email-address" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
        <input
          id="email-address"
          name="email"
          type="email"
          autocomplete="email"
          required
          class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
          value={form?.email ?? ''}
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your password"
        />
      </div>

      {#if form?.error}
        <div class="text-red-600 text-sm text-center">
          {form.error}
        </div>
      {/if}

      <div>
        <button
          type="submit"
          class="w-full flex justify-center py-3 px-4 border border-transparent font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Sign in
        </button>
      </div>
    </form>
  </div>
</div>