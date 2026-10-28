<script>
  import { authService } from '$lib/services/authService';
  import { isMockMode } from '$lib/services/dbHelper';
  import { showToast } from '$lib/stores/toastStore';
  import { goto } from '$app/navigation';
  import { 
    Sparkles, Mail, Loader, ArrowLeft, Lock, Inbox, KeyRound, CheckCircle2 
  } from '@lucide/svelte';

  let email = $state('');
  let loading = $state(false);
  let pageState = $state('request'); // 'request' | 'email_preview' | 'reset_password'

  let newPassword = $state('');
  let confirmPassword = $state('');

  async function handleReset(e) {
    e.preventDefault();
    if (!email) {
      showToast("Please enter your email", "error");
      return;
    }

    loading = true;
    try {
      if (isMockMode) {
        // In mock mode, we accept ANY email address and simulate a password reset.
        // If the email is not registered yet, we will register/seed it on the fly when saving the password.
        await new Promise(r => setTimeout(r, 1200));
        showToast("Password reset email simulated!", "success");
        pageState = 'email_preview';
      } else {
        await authService.forgotPassword(email);
        showToast("Password reset link sent to your email!", "success");
        email = '';
      }
    } catch (err) {
      showToast(err.message || "Failed to send reset link", "error");
    } finally {
      loading = false;
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      showToast("Please fill all password fields", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    loading = true;
    try {
      await new Promise(r => setTimeout(r, 1000));
      
      let users = {};
      try { users = JSON.parse(localStorage.getItem('cs_users') || '{}'); } catch(e) {}
      
      let emailKey = email.toLowerCase();
      let foundKey = Object.keys(users).find(k => users[k].email.toLowerCase() === emailKey);
      
      // If the email is not registered, register it on the fly so they can log in!
      if (!foundKey) {
        const uid = emailKey === 'admin@careerready.ai' ? 'admin123' : "stu_" + Math.random().toString(36).substr(2, 9);
        const role = emailKey.includes('admin') ? 'admin' : 'student';
        const name = emailKey.split('@')[0];
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        
        users[emailKey] = {
          uid,
          email: emailKey,
          role,
          name: formattedName
        };
        foundKey = emailKey;

        // If student, also seed the student profile in LocalStorage so it persists
        if (role === 'student') {
          let students = {};
          try { students = JSON.parse(localStorage.getItem('cs_students') || '{}'); } catch(e) {}
          students[uid] = {
            uid,
            name: formattedName,
            registerNumber: "REG" + Math.floor(100000 + Math.random() * 900000),
            email: emailKey,
            department: "Master of Computer Applications (MCA)",
            year: 2,
            cgpa: 8.5,
            phone: "+91 9876543210",
            address: "123 Main Street, Tech City",
            links: { linkedin: "", github: "", portfolio: "" },
            careerGoal: "Software Engineer",
            preferredLanguage: "en",
            profilePhotoUrl: "",
            readinessScore: 75,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('cs_students', JSON.stringify(students));
        }
      }

      users[foundKey].password = newPassword;
      localStorage.setItem('cs_users', JSON.stringify(users));
      
      showToast("Password updated successfully!", "success");
      pageState = 'success_message';
      setTimeout(() => {
        goto('/login');
      }, 2000);
    } catch (err) {
      showToast("Failed to update password", "error");
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Reset Password — CareerReady AI</title>
</svelte:head>

<div 
  class="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans bg-grid-pattern-light"
>
  <div class="w-full max-w-lg bg-white border border-slate-200 rounded-[2rem] p-8 sm:p-12 shadow-xl relative z-10">
    
    {#if pageState === 'request'}
      <!-- Request Form View -->
      <div class="space-y-8 animate-fade-in">
        <div class="text-center space-y-2">
          <div class="inline-flex h-14 w-14 bg-emerald-600 rounded-2xl items-center justify-center mb-1 shadow-md text-white">
            <Sparkles class="h-7 w-7 text-white" />
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Reset Password</h1>
          <p class="text-sm text-slate-600 font-medium">Receive an email to securely reset your account credentials</p>
        </div>

        <form onsubmit={handleReset} class="space-y-5 text-left">
          <div class="space-y-1.5">
            <label for="email" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Email Address</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input 
                type="email" 
                id="email"
                bind:value={email}
                placeholder="student@careerready.ai"
                required
                class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs"
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
              <span>Sending Link...</span>
            {:else}
              <span>Send Reset Link</span>
            {/if}
          </button>
        </form>

        <div class="text-center pt-2">
          <a href="/login" class="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors">
            <ArrowLeft class="h-4 w-4 text-emerald-600" />
            <span>Back to Login</span>
          </a>
        </div>
      </div>

    {:else if pageState === 'email_preview'}
      <!-- Mock Email Delivery Inbox View -->
      <div class="space-y-6 animate-scale-up text-left">
        <div class="text-center space-y-2 mb-4">
          <div class="inline-flex h-12 w-12 bg-emerald-50 border border-emerald-200 rounded-2xl items-center justify-center text-emerald-700">
            <Inbox class="h-6 w-6" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900">Simulated Email Received</h2>
          <p class="text-xs text-slate-500">Since the application is running offline, we've delivered the reset email directly to this browser simulator.</p>
        </div>

        <!-- Simulated Email Client Card -->
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-inner">
          <div class="bg-slate-100 px-4 py-3 border-b border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div><span class="font-bold text-slate-500">From:</span> CareerReady Security &lt;security@careerready.ai&gt;</div>
            <div><span class="font-bold text-slate-500">To:</span> {email}</div>
            <div><span class="font-bold text-slate-500">Subject:</span> 🔒 Reset Your CareerReady Password</div>
          </div>
          
          <div class="p-6 space-y-5 text-slate-700 text-xs sm:text-sm">
            <p>Hello Candidate,</p>
            <p class="leading-relaxed">We received a request to reset your password for your CareerReady account. Click the button below to create a new password.</p>
            
            <div class="text-center py-3">
              <button 
                onclick={() => pageState = 'reset_password'}
                class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <KeyRound class="h-4 w-4" />
                <span>Reset My Password</span>
              </button>
            </div>
            
            <p class="text-[11px] text-slate-400">If you did not request a password reset, you can safely ignore this notice.</p>
          </div>
        </div>

        <button 
          onclick={() => pageState = 'request'}
          class="w-full py-3 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>Go Back & Re-enter Email</span>
        </button>
      </div>

    {:else if pageState === 'reset_password'}
      <!-- Reset Password Form View -->
      <div class="space-y-8 animate-fade-in text-left">
        <div class="text-center space-y-2">
          <div class="inline-flex h-14 w-14 bg-emerald-600 rounded-2xl items-center justify-center mb-1 shadow-md text-white">
            <Lock class="h-7 w-7 text-white" />
          </div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">New Password</h1>
          <p class="text-sm text-slate-600 font-medium">Choose a secure, strong password for your account</p>
        </div>

        <form onsubmit={handleUpdatePassword} class="space-y-5">
          <div class="space-y-4">
            <div class="space-y-1.5">
              <label for="new-password" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">New Password</label>
              <input 
                type="password" 
                id="new-password"
                bind:value={newPassword}
                placeholder="••••••••"
                required
                class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs"
              />
            </div>
            
            <div class="space-y-1.5">
              <label for="confirm-password" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Confirm New Password</label>
              <input 
                type="password" 
                id="confirm-password"
                bind:value={confirmPassword}
                placeholder="••••••••"
                required
                class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {#if loading}
              <Loader class="h-4 w-4 animate-spin" />
              <span>Saving Password...</span>
            {:else}
              <span>Save New Password</span>
            {/if}
          </button>
        </form>
      </div>

    {:else if pageState === 'success_message'}
      <!-- Success / Completed View -->
      <div class="space-y-6 text-center py-6 animate-scale-up">
        <div class="inline-flex h-16 w-16 bg-emerald-50 border border-emerald-200 rounded-full items-center justify-center text-emerald-600 mb-2">
          <CheckCircle2 class="h-8 w-8 animate-bounce" />
        </div>
        <h2 class="text-2xl font-extrabold text-slate-900">Password Updated!</h2>
        <p class="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">Your account credentials have been successfully updated. You are being redirected to the sign in page to access your profile.</p>
        <div class="flex justify-center pt-2">
          <Loader class="h-5 w-5 text-emerald-600 animate-spin" />
        </div>
      </div>
    {/if}

  </div>
</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scale-up {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-scale-up {
    animation: scale-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
