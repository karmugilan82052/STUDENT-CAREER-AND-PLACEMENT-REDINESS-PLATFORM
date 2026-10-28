<script>
  import { authService } from '$lib/services/authService';
  import { showToast } from '$lib/stores/toastStore';
  import { goto } from '$app/navigation';
  import { Mail, Lock, User, ShieldCheck, Loader, ArrowRight, CheckCircle2, GraduationCap } from '@lucide/svelte';

  let email = $state('');
  let password = $state('');
  let role = $state('student'); // 'student' | 'admin'
  let loading = $state(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    loading = true;
    try {
      await authService.login(email, password);
      showToast("Logged in successfully!", "success");
      
      if (role === 'admin') {
        goto('/admin/dashboard');
      } else {
        goto('/dashboard');
      }
    } catch (err) {
      showToast(err.message || "Invalid email or password", "error");
    } finally {
      loading = false;
    }
  }

  // Pre-fill helper for quick grading / demo
  function prefillUser(type) {
    if (type === 'student') {
      email = "student@careerready.ai";
      password = "password123";
      role = "student";
    } else if (type === 'admin') {
      email = "admin@careerready.ai";
      password = "password123";
      role = "admin";
    }
  }
</script>

<svelte:head>
  <title>Sign In — CareerReady Placement Portal</title>
  <meta name="description" content="Sign in to your CareerReady placement readiness workspace." />
</svelte:head>

<!-- Split-Screen Login Page (Light Mode) -->
<div class="min-h-screen bg-slate-50 text-slate-900 grid lg:grid-cols-12 font-sans bg-grid-pattern-light">
  
  <!-- Left Side: Brand Highlight Panel -->
  <div class="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-slate-100/90 via-slate-50 to-emerald-50/50 border-r border-slate-200 p-12 flex-col justify-between relative overflow-hidden">
    <div class="space-y-6 relative z-10">
      <a href="/" class="flex items-center gap-3">
        <div class="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
          CR
        </div>
        <div>
          <span class="font-bold text-xl text-slate-900 block">CareerReady</span>
          <span class="text-xs text-emerald-700 font-bold uppercase tracking-wider">Placement Portal</span>
        </div>
      </a>

      <div class="pt-12 space-y-4">
        <span class="px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold inline-flex items-center gap-2 shadow-xs">
          <GraduationCap class="h-4 w-4 text-emerald-700" /> Official Campus Recruitment Engine
        </span>
        <h2 class="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
          Streamlined Placement Assessments & ATS Resume Audit
        </h2>
        <p class="text-slate-600 text-sm leading-relaxed max-w-md">
          Access your personal candidate readiness dashboard, track eligible company drives, evaluate resume ATS scores, and practice company mock rounds.
        </p>
      </div>
    </div>

    <!-- Feature Badges -->
    <div class="space-y-3 relative z-10 border-t border-slate-200/80 pt-6">
      <div class="flex items-center gap-3 text-xs text-slate-700 font-medium">
        <CheckCircle2 class="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Automated TCS, Accenture & Amazon eligibility matching</span>
      </div>
      <div class="flex items-center gap-3 text-xs text-slate-700 font-medium">
        <CheckCircle2 class="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Live ATS Resume score audit & keyword optimization</span>
      </div>
      <div class="flex items-center gap-3 text-xs text-slate-700 font-medium">
        <CheckCircle2 class="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Simulated Technical & HR mock interview rounds</span>
      </div>
    </div>
  </div>

  <!-- Right Side: Clean Login Card Form -->
  <div class="lg:col-span-6 flex flex-col justify-center items-center p-6 sm:p-12 bg-white lg:bg-transparent">
    <div class="w-full max-w-md space-y-7 text-left">
      
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Sign In to Workspace</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Select your role and enter your portal credentials.</p>
      </div>

      <!-- Role Switcher -->
      <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button 
          type="button" 
          onclick={() => role = 'student'}
          class="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer
            {role === 'student' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'}"
        >
          <User class="h-4 w-4 {role === 'student' ? 'text-emerald-600' : 'text-slate-500'}" />
          <span>Student Candidate</span>
        </button>
        <button 
          type="button" 
          onclick={() => role = 'admin'}
          class="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer
            {role === 'admin' ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80 font-bold' : 'text-slate-600 hover:text-slate-900'}"
        >
          <ShieldCheck class="h-4 w-4 {role === 'admin' ? 'text-emerald-600' : 'text-slate-500'}" />
          <span>Placement Officer</span>
        </button>
      </div>

      <!-- Login Form -->
      <form onsubmit={handleLogin} class="space-y-4">
        <div class="space-y-1.5">
          <label for="email" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Email Address</label>
          <div class="relative">
            <Mail class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input 
              type="email" 
              id="email"
              bind:value={email}
              placeholder={role === 'admin' ? "admin@careerready.ai" : "student@careerready.ai"}
              required
              class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-xs transition-all"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <label for="password" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
            <a href="/forgot-password" class="text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-semibold">Forgot password?</a>
          </div>
          <div class="relative">
            <Lock class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input 
              type="password" 
              id="password"
              bind:value={password}
              placeholder="••••••••"
              required
              class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-xs transition-all"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {#if loading}
            <Loader class="h-4 w-4 animate-spin" />
            <span>Authenticating...</span>
          {:else}
            <span>Sign In to {role === 'admin' ? 'Placement Admin' : 'Student Portal'}</span>
            <ArrowRight class="h-4 w-4" />
          {/if}
        </button>
      </form>

      <!-- Quick Access Credentials Box -->
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">Quick Access Login</span>
        <div class="grid grid-cols-2 gap-2.5">
          <button 
            type="button" 
            onclick={() => prefillUser('student')}
            class="py-2.5 px-3 border border-emerald-300/80 bg-emerald-50 hover:bg-emerald-100/90 rounded-lg text-xs text-emerald-800 font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>🎓</span>
            <span>Student Access</span>
          </button>
          <button 
            type="button" 
            onclick={() => prefillUser('admin')}
            class="py-2.5 px-3 border border-indigo-300/80 bg-indigo-50 hover:bg-indigo-100/90 rounded-lg text-xs text-indigo-800 font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>🔑</span>
            <span>Placement Officer</span>
          </button>
        </div>
      </div>

      <p class="text-center text-xs text-slate-500">
        New candidate? <a href="/register" class="text-emerald-600 hover:text-emerald-700 hover:underline font-bold">Register candidate account</a>
      </p>

    </div>
  </div>

</div>
