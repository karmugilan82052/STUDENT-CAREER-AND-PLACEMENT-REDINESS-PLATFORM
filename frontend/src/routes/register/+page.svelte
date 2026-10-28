<script>
  import { authService } from '$lib/services/authService';
  import { showToast } from '$lib/stores/toastStore';
  import { goto } from '$app/navigation';
  import { Sparkles, Loader, User, Mail, GraduationCap, Phone, Award, Lock, BookOpen, ArrowRight } from '@lucide/svelte';

  let name = $state('');
  let email = $state('');
  let registerNumber = $state('');
  let department = $state('Master of Computer Applications (MCA)');
  let year = $state(1);
  let cgpa = $state('');
  let phone = $state('');
  let address = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let loading = $state(false);

  const departments = [
    "Master of Computer Applications (MCA)",
    "Computer Science (CSE)",
    "Information Technology (IT)",
    "Electronics & Comm. (ECE)",
    "Electrical & Electronics (EEE)",
    "Mechanical Engineering (ME)"
  ];

  async function handleRegister(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    const cgpaVal = parseFloat(cgpa);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
      showToast("CGPA must be a decimal between 0 and 10", "error");
      return;
    }

    loading = true;
    try {
      const regDetails = {
        name,
        registerNumber,
        department,
        year: parseInt(year),
        cgpa: cgpaVal,
        phone,
        address
      };

      await authService.registerStudent(email, password, regDetails);
      showToast("Registration successful!", "success");
      goto('/dashboard');
    } catch (err) {
      showToast(err.message || "Registration failed", "error");
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Student Register — CareerReady AI</title>
</svelte:head>

<div 
  class="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans bg-grid-pattern-light"
>
  <div class="w-full max-w-2xl bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-xl relative z-10 space-y-8">
    
    <div class="text-center space-y-2">
      <div class="inline-flex h-14 w-14 bg-emerald-600 rounded-2xl items-center justify-center mb-1 shadow-md text-white">
        <Sparkles class="h-7 w-7 text-white" />
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Student Registration</h1>
      <p class="text-sm sm:text-base text-slate-600 font-medium">Create your CareerReady candidate profile to begin placement analysis</p>
    </div>

    <form onsubmit={handleRegister} class="space-y-6 text-left">
      
      <!-- Personal Info -->
      <div class="border-b border-slate-200 pb-6">
        <h3 class="text-xs font-extrabold text-emerald-700 uppercase tracking-wider mb-4">Personal Details</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="space-y-1.5">
            <label for="name" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Full Name</label>
            <div class="relative">
              <User class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input type="text" id="name" bind:value={name} placeholder="John Doe" required class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label for="email" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Email Address</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input type="email" id="email" bind:value={email} placeholder="john@university.edu" required class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label for="phone" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Phone Number</label>
            <div class="relative">
              <Phone class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input type="text" id="phone" bind:value={phone} placeholder="+91 98765 43210" required class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label for="regno" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Register Number</label>
            <div class="relative">
              <GraduationCap class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input type="text" id="regno" bind:value={registerNumber} placeholder="2024MCA001" required class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs" />
            </div>
          </div>
        </div>
      </div>

      <!-- Academic Qualifications -->
      <div class="border-b border-slate-200 pb-6">
        <h3 class="text-xs font-extrabold text-emerald-700 uppercase tracking-wider mb-4">Academic Qualifications</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div class="space-y-1.5 sm:col-span-1">
            <label for="dept" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Department</label>
            <div class="relative">
              <BookOpen class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <select id="dept" bind:value={department} class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all cursor-pointer shadow-xs">
                {#each departments as d}
                  <option value={d}>{d}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="year" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Year of Study</label>
            <select id="year" bind:value={year} class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all cursor-pointer shadow-xs">
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
              <option value={3}>3rd Year</option>
              <option value={4}>4th Year</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="cgpa" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Current CGPA</label>
            <div class="relative">
              <Award class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input type="number" step="0.01" min="0" max="10" id="cgpa" bind:value={cgpa} placeholder="8.5" required class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs" />
            </div>
          </div>
        </div>
      </div>

      <!-- Security -->
      <div>
        <h3 class="text-xs font-extrabold text-emerald-700 uppercase tracking-wider mb-4">Security</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="space-y-1.5">
            <label for="password" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Password</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input type="password" id="password" bind:value={password} placeholder="••••••••" required class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label for="confirmpass" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Confirm Password</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input type="password" id="confirmpass" bind:value={confirmPassword} placeholder="••••••••" required class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs" />
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <button 
        type="submit" 
        disabled={loading}
        class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
      >
        {#if loading}
          <Loader class="h-5 w-5 animate-spin" />
          <span>Registering account...</span>
        {:else}
          <span>Register Candidate Profile</span>
          <ArrowRight class="h-5 w-5" />
        {/if}
      </button>
    </form>

    <p class="text-center text-xs sm:text-sm text-slate-500">
      Already have a workspace? <a href="/login" class="text-emerald-600 hover:text-emerald-700 hover:underline font-bold">Sign In here</a>
    </p>

  </div>
</div>
