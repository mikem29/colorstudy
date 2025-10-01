<script lang="ts">
  export let form;
</script>

<svelte:head>
  <title>Sign Up - ColorStudy</title>
</svelte:head>

<div class="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
  <div class="absolute -top-16 -left-16 w-72 h-72 bg-blue-300/20 blur-3xl rounded-full"></div>
  <div class="absolute bottom-0 -right-10 w-80 h-80 bg-purple-300/20 blur-3xl rounded-full"></div>

  <div class="max-w-md mx-auto relative">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg mb-4">
        <i class="fas fa-user-plus text-xl"></i>
      </div>
      <h2 class="text-4xl font-bold text-gray-900 mb-3">Create your account</h2>
      <p class="text-lg text-gray-600 mb-6">Start creating color studies from your reference material</p>
      <p class="text-sm text-gray-600">
        Already have an account?
        <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
      </p>
    </div>
    <form method="POST" class="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl px-8 pt-8 pb-8 space-y-5 border border-gray-100">
      <div>
        <label for="email-address" class="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
        <input
          id="email-address"
          name="email"
          type="email"
          autocomplete="email"
          required
          class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
          value={form?.email ?? ''}
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="new-password"
          required
          class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Minimum 6 characters"
          minlength="6"
        />
      </div>

      {#if form?.error}
        <div class="text-red-600 text-sm text-center">
          {form.error}
        </div>
      {/if}

      <ul class="text-sm text-gray-600 space-y-2">
        <li class="flex items-center gap-2"><i class="fas fa-check text-emerald-600"></i> Unlimited color sampling</li>
        <li class="flex items-center gap-2"><i class="fas fa-check text-emerald-600"></i> Printable, inch-accurate artboards</li>
        <li class="flex items-center gap-2"><i class="fas fa-check text-emerald-600"></i> Visual source lines for every swatch</li>
      </ul>

      <button
        type="submit"
        class="w-full inline-flex items-center justify-center gap-2 py-3 px-4 border border-transparent font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow"
      >
        <i class="fas fa-user-plus"></i>
        <span>Create Account</span>
      </button>
    </form>
  </div>
</div>