<script>
  import '../app.css';
  import { page } from '$app/stores';
  export let data;

  // Only show the nav on non-artboard and non-dashboard pages
  $: showNav = !$page.url.pathname.includes('/artboard/') && !$page.url.pathname.includes('/dashboard');
</script>

<div class="min-h-screen bg-gray-50">
  {#if showNav}
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a href="/" class="text-xl font-bold text-gray-900">
              ColorStudy
            </a>
          </div>

          <div class="flex items-center space-x-4">
            {#if data.user}
              <span class="text-sm text-gray-700">
                Welcome, {data.user.email}
              </span>
              <form action="/logout" method="POST" class="inline">
                <button
                  type="submit"
                  class="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Logout
                </button>
              </form>
            {:else}
              <a
                href="/login"
                class="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Login
              </a>
              <a
                href="/signup"
                class="text-sm bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign Up
              </a>
            {/if}
          </div>
        </div>
      </div>
    </nav>
  {/if}

  <main>
    <slot />
  </main>
</div>