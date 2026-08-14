/**
 * Server-Side Rendered Authentication Pages
 */

import { renderHtmlDocument } from "./html-template";

export function renderAuthPage(pathname: string): Response | null {
  const clean = pathname.replace(/^\/+|\/+$/g, "");

  if (clean === "auth/login") {
    const content = `
    <div class="min-h-[calc(100vh-16rem)] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-dark">
          Sign In to Your Account
        </h2>
        <p class="mt-2 text-center text-xs text-gray-600">
          Or <a href="/auth/register" class="font-bold text-brand-green hover:underline">create a new account</a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200">
          <div id="auth-alert" class="hidden mb-4 p-3 rounded-lg text-xs font-semibold"></div>

          <form onsubmit="handleLoginSubmit(event)" class="space-y-5">
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                id="login-email" 
                required 
                class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-brand-green focus:outline-none" 
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-black uppercase tracking-wider text-gray-700">Password</label>
                <a href="/auth/reset" class="text-[11px] font-bold text-brand-green hover:underline">Forgot password?</a>
              </div>
              <input 
                type="password" 
                id="login-password" 
                required 
                class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-brand-green focus:outline-none" 
              />
            </div>

            <button 
              type="submit" 
              id="login-submit-btn" 
              class="w-full bg-brand-green text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-greenHover transition-all shadow"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>`;

    const scripts = `
    <script>
      async function handleLoginSubmit(e) {
        e.preventDefault();
        const alertBox = document.getElementById('auth-alert');
        const btn = document.getElementById('login-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Signing In...';
        alertBox.className = 'hidden';

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem('realestate_token', data.access_token);
            alertBox.className = 'mb-4 p-3 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200 block';
            alertBox.textContent = 'Sign in successful! Redirecting...';
            setTimeout(() => {
              window.location.href = data.user && data.user.role === 'admin' ? '/admin' : '/dashboard';
            }, 600);
          } else {
            alertBox.className = 'mb-4 p-3 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 block';
            alertBox.textContent = data.detail || 'Sign in failed. Check your email and password.';
          }
        } catch (err) {
          alertBox.className = 'mb-4 p-3 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 block';
          alertBox.textContent = 'Network error. Please try again.';
        } finally {
          btn.disabled = false;
          btn.textContent = 'Sign In';
        }
      }
    </script>`;

    return new Response(
      renderHtmlDocument({
        meta: {
          title: "Sign In | PropertyBikri",
          description: "Sign in to your PropertyBikri dashboard to manage listings and inquiries.",
          canonical: "/auth/login",
          noIndex: true,
        },
        content,
        scripts,
      }),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (clean === "auth/register") {
    const content = `
    <div class="min-h-[calc(100vh-16rem)] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-dark">
          Create a Free Account
        </h2>
        <p class="mt-2 text-center text-xs text-gray-600">
          Already have an account? <a href="/auth/login" class="font-bold text-brand-green hover:underline">Sign In</a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200">
          <div id="auth-alert" class="hidden mb-4 p-3 rounded-lg text-xs font-semibold"></div>

          <form onsubmit="handleRegisterSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                id="reg-name" 
                placeholder="e.g. Tanvir Ahmed" 
                required 
                class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-brand-green focus:outline-none" 
              />
            </div>

            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                id="reg-email" 
                placeholder="name@example.com" 
                required 
                class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-brand-green focus:outline-none" 
              />
            </div>

            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                id="reg-password" 
                placeholder="Minimum 8 characters" 
                required 
                class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-brand-green focus:outline-none" 
              />
            </div>

            <button 
              type="submit" 
              id="reg-submit-btn" 
              class="w-full bg-brand-green text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-greenHover transition-all shadow mt-2"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>`;

    const scripts = `
    <script>
      async function handleRegisterSubmit(e) {
        e.preventDefault();
        const alertBox = document.getElementById('auth-alert');
        const btn = document.getElementById('reg-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Creating Account...';
        alertBox.className = 'hidden';

        const full_name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password })
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem('realestate_token', data.access_token);
            alertBox.className = 'mb-4 p-3 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200 block';
            alertBox.textContent = 'Registration successful! Redirecting to dashboard...';
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 600);
          } else {
            alertBox.className = 'mb-4 p-3 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 block';
            alertBox.textContent = data.detail || 'Registration failed.';
          }
        } catch (err) {
          alertBox.className = 'mb-4 p-3 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 block';
          alertBox.textContent = 'Network error. Please try again.';
        } finally {
          btn.disabled = false;
          btn.textContent = 'Create Account';
        }
      }
    </script>`;

    return new Response(
      renderHtmlDocument({
        meta: {
          title: "Sign Up | PropertyBikri",
          description: "Register for a free PropertyBikri account to list and manage real estate properties in Bangladesh.",
          canonical: "/auth/register",
          noIndex: true,
        },
        content,
        scripts,
      }),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (clean === "auth/reset") {
    const content = `
    <div class="min-h-[calc(100vh-16rem)] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-dark">
          Reset Your Password
        </h2>
        <p class="mt-2 text-center text-xs text-gray-600">
          Enter your email to receive password reset instructions.
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200">
          <form onsubmit="alert('If an active account exists with that email, reset instructions have been sent.'); window.location.href='/auth/login'; event.preventDefault();" class="space-y-4">
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1">Email Address</label>
              <input type="email" required class="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-semibold focus:border-brand-green focus:outline-none" />
            </div>
            <button type="submit" class="w-full bg-brand-green text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-greenHover transition-all shadow">
              Send Reset Instructions
            </button>
            <div class="text-center pt-2">
              <a href="/auth/login" class="text-xs font-bold text-gray-500 hover:text-brand-dark">Back to Sign In</a>
            </div>
          </form>
        </div>
      </div>
    </div>`;

    return new Response(
      renderHtmlDocument({
        meta: {
          title: "Reset Password | PropertyBikri",
          description: "Reset your PropertyBikri password.",
          canonical: "/auth/reset",
          noIndex: true,
        },
        content,
      }),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  return null;
}
