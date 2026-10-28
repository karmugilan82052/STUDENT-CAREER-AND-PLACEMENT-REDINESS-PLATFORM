<script>
  import { themeStore, langStore, fontSizeStore, accessibilityStore } from '$lib/stores/themeStore';
  import { authStore } from '$lib/stores/authStore';
  import { authService } from '$lib/services/authService';
  import { studentService, DEFAULT_NOTIFICATION_PREFERENCES } from '$lib/services/studentService';
  import { showToast } from '$lib/stores/toastStore';
  import { t } from '$lib/utils/translate';
  import Avatar from '$lib/components/common/Avatar.svelte';
  import { goto } from '$app/navigation';
  import { 
    Settings, Moon, Sun, Monitor, Globe, Lock, Bell, 
    ShieldCheck, Loader, ChevronRight, User, Mail, 
    Camera, Trash2, Download, AlertTriangle, Check, 
    Eye, EyeOff, ExternalLink, Shield, Sparkles, 
    Smartphone, KeyRound, GraduationCap, Award, X,
    FileText, CheckCircle2, Type
  } from '@lucide/svelte';

  // State binds: Theme & Display (derived from stores)
  let currentTheme = $derived($themeStore || 'light');
  let currentLanguage = $derived($langStore || 'en');
  let currentFontSize = $derived($fontSizeStore || 'normal');
  let reduceMotion = $derived($accessibilityStore?.reduceMotion || false);
  let highContrast = $derived($accessibilityStore?.highContrast || false);

  // State binds: Password
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmNewPassword = $state('');
  let showCurrentPass = $state(false);
  let showNewPass = $state(false);
  let showConfirmPass = $state(false);
  let passwordLoading = $state(false);
  let forgotLoading = $state(false);

  // State binds: Notifications
  let notifyPlacements = $state(true);
  let notifyInterviews = $state(true);
  let notifyDeadlines = $state(true);
  let notifyDailyReminders = $state(false);
  let notifyResume = $state(true);
  let notifyRoadmap = $state(true);
  let notifyEmail = $state(true);
  let notifyInApp = $state(true);
  let notifSaving = $state(false);
  let notifLoaded = $state(false);

  // State binds: Photo Upload
  let photoFileInput = $state(null);
  let photoUploading = $state(false);
  let photoRemoving = $state(false);

  // State binds: Privacy & Deletion
  let exportLoading = $state(false);
  let showDeleteModal = $state(false);
  let deleteConfirmInput = $state('');
  let deleteLoading = $state(false);

  // Derived user details
  let user = $derived($authStore.user);
  let profile = $derived($authStore.profile || {});
  let role = $derived($authStore.role || 'student');

  // Password strength calculation
  let passwordStrength = $derived.by(() => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-700' };
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (newPassword.length >= 8) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[A-Z]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  });


  // Load existing student preferences from profile
  $effect(() => {
    const uid = $authStore.user?.uid;
    if (uid && !notifLoaded) {
      loadNotificationPreferences(uid);
    }
  });

  async function loadNotificationPreferences(uid) {
    try {
      const prefs = await studentService.getNotificationPreferences(uid);
      notifyPlacements = prefs.placementDrives !== false;
      notifyInterviews = prefs.interviewSchedules !== false;
      notifyDeadlines = prefs.applicationDeadlines !== false;
      notifyDailyReminders = prefs.dailyAiReminders === true;
      notifyResume = prefs.resumeImprovements !== false;
      notifyRoadmap = prefs.skillGapRoadmaps !== false;
      notifyEmail = prefs.emailNotifications !== false;
      notifyInApp = prefs.inAppNotifications !== false;
      notifLoaded = true;
    } catch (e) {
      console.warn("Could not load notification preferences:", e);
      notifLoaded = true;
    }
  }

  // Theme change
  function setTheme(theme) {
    themeStore.set(theme);
    showToast(`Theme updated to ${theme}`, "success");
    // Persist in profile if student is signed in
    if ($authStore.user?.uid) {
      studentService.updateProfile($authStore.user.uid, { themePreference: theme }).catch(() => {});
    }
  }

  // Language change
  function handleLanguageChange(event) {
    const lang = event.target.value;
    langStore.set(lang);
    showToast(`Language updated`, "success");
    if ($authStore.user?.uid) {
      studentService.updateProfile($authStore.user.uid, { preferredLanguage: lang }).catch(() => {});
    }
  }

  // Font size change
  function setFontSize(size) {
    fontSizeStore.set(size);
    showToast(`Font size updated to ${size}`, "success");
  }

  // Accessibility toggle
  function toggleReduceMotion() {
    reduceMotion = !reduceMotion;
    accessibilityStore.update(curr => ({ ...curr, reduceMotion }));
    showToast(reduceMotion ? "Reduced motion enabled" : "Standard animations enabled", "success");
  }

  function toggleHighContrast() {
    highContrast = !highContrast;
    accessibilityStore.update(curr => ({ ...curr, highContrast }));
    showToast(highContrast ? "High contrast enabled" : "Standard contrast enabled", "success");
  }

  // Save Notification Preferences
  async function handleSaveNotifications() {
    const uid = $authStore.user?.uid;
    if (!uid) {
      showToast("Please sign in to save preferences", "error");
      return;
    }

    notifSaving = true;
    try {
      const preferences = {
        placementDrives: notifyPlacements,
        interviewSchedules: notifyInterviews,
        applicationDeadlines: notifyDeadlines,
        dailyAiReminders: notifyDailyReminders,
        resumeImprovements: notifyResume,
        skillGapRoadmaps: notifyRoadmap,
        emailNotifications: notifyEmail,
        inAppNotifications: notifyInApp
      };

      await studentService.updateNotificationPreferences(uid, preferences);
      showToast("Notification preferences saved successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to save preferences", "error");
    } finally {
      notifSaving = false;
    }
  }

  // Photo Upload Handler
  async function handlePhotoSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please upload a valid image file (PNG, JPG, WEBP)", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size must be less than 2MB", "error");
      return;
    }

    const uid = $authStore.user?.uid;
    if (!uid) {
      showToast("Please sign in to update photo", "error");
      return;
    }

    photoUploading = true;
    try {
      await studentService.uploadProfilePhoto(uid, file);
      showToast("Profile photo updated successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to upload photo", "error");
    } finally {
      photoUploading = false;
      if (photoFileInput) photoFileInput.value = '';
    }
  }

  // Remove Photo Handler
  async function handleRemovePhoto() {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    photoRemoving = true;
    try {
      await studentService.removeProfilePhoto(uid);
      showToast("Profile photo removed. Using default monogram avatar.", "success");
    } catch (err) {
      showToast(err.message || "Failed to remove photo", "error");
    } finally {
      photoRemoving = false;
    }
  }

  // Change Password Handler
  async function handlePasswordChange(e) {
    e.preventDefault();

    if (!currentPassword) {
      showToast("Please enter your current password", "error");
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      showToast("Please enter and confirm your new password", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }

    if (currentPassword === newPassword) {
      showToast("New password must be different from current password", "error");
      return;
    }

    passwordLoading = true;
    try {
      const isMock = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "mock-api-key-for-development-only";

      if (isMock) {
        // Mock authentication update
        await new Promise(r => setTimeout(r, 800));
        showToast("Password updated successfully!", "success");
      } else {
        const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
        const { auth } = await import('$lib/firebase/firebaseClient');

        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.email) {
          throw new Error("No active user session found. Please sign in again.");
        }

        // Re-authenticate user before password update
        const cred = EmailAuthProvider.credential(currentUser.email, currentPassword);
        try {
          await reauthenticateWithCredential(currentUser, cred);
        } catch (authErr) {
          if (authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
            throw new Error("Current password is incorrect. Please verify and try again.");
          }
          throw authErr;
        }

        // Update password
        await updatePassword(currentUser, newPassword);
        showToast("Password updated successfully!", "success");
      }

      currentPassword = '';
      newPassword = '';
      confirmNewPassword = '';
    } catch (err) {
      let msg = err.message || "Failed to update password";
      if (err.code === 'auth/weak-password') {
        msg = "The new password is too weak. Please use numbers and special characters.";
      } else if (err.code === 'auth/requires-recent-login') {
        msg = "Session expired for sensitive change. Please log out and log back in.";
      }
      showToast(msg, "error");
    } finally {
      passwordLoading = false;
    }
  }

  // Forgot password quick reset
  async function handleForgotPasswordReset() {
    const email = $authStore.user?.email;
    if (!email) {
      showToast("No email associated with session", "error");
      return;
    }

    forgotLoading = true;
    try {
      await authService.forgotPassword(email);
      showToast(`Password reset link sent to ${email}`, "success");
    } catch (err) {
      showToast(err.message || "Failed to send reset email", "error");
    } finally {
      forgotLoading = false;
    }
  }

  // Export student data
  async function handleExportData() {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    exportLoading = true;
    try {
      const data = await studentService.exportStudentData(uid);
      const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonStr);
      downloadAnchor.setAttribute("download", `careerready_data_${profile?.registerNumber || uid}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Account data exported successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to export data", "error");
    } finally {
      exportLoading = false;
    }
  }

  // Delete account
  async function handleDeleteAccount() {
    if (deleteConfirmInput.trim() !== 'DELETE') {
      showToast("Please type 'DELETE' to confirm account deletion", "error");
      return;
    }

    const uid = $authStore.user?.uid;
    if (!uid) return;

    deleteLoading = true;
    try {
      await studentService.deleteAccount(uid);
      showToast("Account and associated data deleted successfully.", "success");
      goto('/login');
    } catch (err) {
      showToast(err.message || "Failed to delete account", "error");
    } finally {
      deleteLoading = false;
      showDeleteModal = false;
    }
  }

  async function handleSignOut() {
    try {
      await authService.logout();
      showToast("Signed out successfully", "success");
      goto('/login');
    } catch (e) {
      showToast(e.message || "Failed to sign out", "error");
    }
  }
</script>

<svelte:head>
  <title>Settings - CareerReady AI</title>
</svelte:head>

<div class="space-y-6 text-left max-w-6xl mx-auto pb-12">
  
  <!-- Header Banner -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
    <div>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
        <Settings class="h-3.5 w-3.5" />
        <span>System Preferences</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {t('settings', currentLanguage)}
      </h1>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
        Customize appearance, smart placement notifications, verified credentials, and data privacy for your CareerReady profile.
      </p>
    </div>

    <!-- Quick action back to profile -->
    <div class="flex items-center gap-3">
      <a 
        href="/profile"
        class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
      >
        <User class="h-4 w-4 text-emerald-500" />
        <span>{t('edit_profile', currentLanguage)}</span>
        <ExternalLink class="h-3 w-3 text-slate-400" />
      </a>
    </div>
  </div>

  <!-- Main 2-Column Responsive Card Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    
    <!-- LEFT COLUMN -->
    <div class="space-y-6">
      
      <!-- 1. ACCOUNT OVERVIEW CARD -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6" aria-labelledby="account-heading">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <User class="h-4 w-4" />
            </div>
            <div>
              <h2 id="account-heading" class="font-bold text-sm text-slate-900 dark:text-white">
                {t('account_details', currentLanguage)}
              </h2>
              <p class="text-[11px] text-slate-400 mt-0.5">
                {t('account_desc', currentLanguage)}
              </p>
            </div>
          </div>
          <span class="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {role}
          </span>
        </div>

        <!-- Profile Photo & Summary -->
        <div class="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
          <div class="relative group shrink-0">
            <Avatar 
              src={profile?.profilePhotoUrl} 
              name={profile?.name || user?.email} 
              size="xl" 
              rounded="rounded-2xl"
            />
            {#if photoUploading}
              <div class="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-white">
                <Loader class="h-5 w-5 animate-spin text-emerald-400" />
              </div>
            {/if}
          </div>

          <div class="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
            <h3 class="font-bold text-base text-slate-900 dark:text-white truncate">
              {profile?.name || user?.email?.split('@')[0] || 'Student'}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center justify-center sm:justify-start gap-1.5">
              <Mail class="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{user?.email || 'N/A'}</span>
            </p>
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {#if profile?.department}
                <span class="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
                  {profile.department}
                </span>
              {/if}
              {#if profile?.registerNumber}
                <span class="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
                  Reg: {profile.registerNumber}
                </span>
              {/if}
              {#if profile?.year}
                <span class="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
                  Year {profile.year}
                </span>
              {/if}
            </div>
          </div>
        </div>

        <!-- Profile Photo Actions -->
        <div class="space-y-2">
          <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {t('profile_photo', currentLanguage)}
          </label>
          <div class="flex flex-wrap items-center gap-3">
            <button 
              type="button"
              onclick={() => photoFileInput?.click()}
              disabled={photoUploading}
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {#if photoUploading}
                <Loader class="h-3.5 w-3.5 animate-spin" />
                <span>Uploading...</span>
              {:else}
                <Camera class="h-3.5 w-3.5" />
                <span>{t('change_photo', currentLanguage)}</span>
              {/if}
            </button>

            {#if profile?.profilePhotoUrl}
              <button 
                type="button"
                onclick={handleRemovePhoto}
                disabled={photoRemoving}
                class="px-3.5 py-2 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {#if photoRemoving}
                  <Loader class="h-3.5 w-3.5 animate-spin" />
                {:else}
                  <Trash2 class="h-3.5 w-3.5" />
                {/if}
                <span>{t('remove_photo', currentLanguage)}</span>
              </button>
            {/if}

            <input 
              type="file" 
              accept="image/*"
              bind:this={photoFileInput}
              onchange={handlePhotoSelected}
              class="hidden"
            />
          </div>
          <p class="text-[10px] text-slate-400 leading-normal">
            Upload a clear square portrait under 2MB. When removed, your account retains a clean monogram avatar.
          </p>
        </div>

        <!-- Academic Snapshot -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <div class="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CGPA Score</span>
            <span class="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {profile?.cgpa || '0.00'} / 10.0
            </span>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placement Readiness</span>
            <span class="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {profile?.readinessScore || 35}%
            </span>
          </div>
        </div>
      </section>

      <!-- 2. APPEARANCE & DISPLAY PREFERENCES CARD -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6" aria-labelledby="appearance-heading">
        <div class="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Globe class="h-4 w-4" />
          </div>
          <div>
            <h2 id="appearance-heading" class="font-bold text-sm text-slate-900 dark:text-white">
              {t('appearance_preferences', currentLanguage)}
            </h2>
            <p class="text-[11px] text-slate-400 mt-0.5">
              {t('theme_desc', currentLanguage)}
            </p>
          </div>
        </div>

        <!-- Theme Mode Tiles -->
        <div class="space-y-3">
          <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {t('theme_appearance', currentLanguage)}
          </label>
          <div class="grid grid-cols-3 gap-3">
            <!-- Light Tile -->
            <button 
              type="button"
              onclick={() => setTheme('light')}
              class="p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer
                {currentTheme === 'light' 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'}"
            >
              <Sun class="h-5 w-5 {currentTheme === 'light' ? 'text-amber-500' : 'text-slate-400'}" />
              <span class="text-xs font-bold block">{t('light_mode', currentLanguage)}</span>
            </button>

            <!-- Dark Tile -->
            <button 
              type="button"
              onclick={() => setTheme('dark')}
              class="p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer
                {currentTheme === 'dark' 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'}"
            >
              <Moon class="h-5 w-5 {currentTheme === 'dark' ? 'text-indigo-400' : 'text-slate-400'}" />
              <span class="text-xs font-bold block">{t('dark_mode', currentLanguage)}</span>
            </button>

            <!-- System Tile -->
            <button 
              type="button"
              onclick={() => setTheme('system')}
              class="p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer
                {currentTheme === 'system' 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'}"
            >
              <Monitor class="h-5 w-5 {currentTheme === 'system' ? 'text-emerald-500' : 'text-slate-400'}" />
              <span class="text-xs font-bold block">{t('system_mode', currentLanguage)}</span>
            </button>
          </div>
        </div>

        <!-- Language Selector -->
        <div class="space-y-2">
          <label for="language-select" class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {t('language', currentLanguage)}
          </label>
          <div class="relative">
            <select 
              id="language-select"
              value={currentLanguage} 
              onchange={handleLanguageChange}
              class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="en">English (EN)</option>
              <option value="ta">Tamil (தமிழ் - TA)</option>
              <option value="hi">Hindi (हिन्दी - HI)</option>
              <option value="te">Telugu (తెలుగు - TE)</option>
              <option value="ml">Malayalam (മലയാളം - ML)</option>
              <option value="kn">Kannada (ಕನ್ನಡ - KN)</option>
            </select>
          </div>
          <p class="text-[10px] text-slate-400">
            Translates all navigation, buttons, titles, cards, and placement status messages.
          </p>
        </div>

        <!-- Font Size & Accessibility Options -->
        <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {t('font_size', currentLanguage)}
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button 
              type="button"
              onclick={() => setFontSize('compact')}
              class="py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors
                {currentFontSize === 'compact' 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}"
            >
              {t('font_compact', currentLanguage)}
            </button>
            <button 
              type="button"
              onclick={() => setFontSize('normal')}
              class="py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors
                {currentFontSize === 'normal' 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}"
            >
              {t('font_normal', currentLanguage)}
            </button>
            <button 
              type="button"
              onclick={() => setFontSize('large')}
              class="py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors
                {currentFontSize === 'large' 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}"
            >
              {t('font_large', currentLanguage)}
            </button>
          </div>
        </div>

        <!-- Reduced Motion & High Contrast Toggles -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800">
            <div>
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">{t('reduce_motion', currentLanguage)}</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">{t('reduce_motion_desc', currentLanguage)}</span>
            </div>
            <button 
              type="button" 
              role="switch"
              aria-label="Toggle reduced motion animations"
              aria-checked={reduceMotion}
              onclick={toggleReduceMotion}
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 {reduceMotion ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}"
            >
              <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out {reduceMotion ? 'translate-x-5' : 'translate-x-0'}"></span>
            </button>
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800">
            <div>
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">{t('high_contrast', currentLanguage)}</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">{t('high_contrast_desc', currentLanguage)}</span>
            </div>
            <button 
              type="button" 
              role="switch"
              aria-label="Toggle high contrast display"
              aria-checked={highContrast}
              onclick={toggleHighContrast}
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 {highContrast ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}"
            >
              <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out {highContrast ? 'translate-x-5' : 'translate-x-0'}"></span>
            </button>
          </div>
        </div>

      </section>

      <!-- 3. PRIVACY & DATA MANAGEMENT CARD -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6" aria-labelledby="privacy-heading">
        <div class="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck class="h-4 w-4" />
          </div>
          <div>
            <h2 id="privacy-heading" class="font-bold text-sm text-slate-900 dark:text-white">
              {t('privacy_data', currentLanguage)}
            </h2>
            <p class="text-[11px] text-slate-400 mt-0.5">
              {t('privacy_desc', currentLanguage)}
            </p>
          </div>
        </div>

        <div class="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-[11px] text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
          <div class="flex items-center gap-2 font-bold text-slate-850 dark:text-slate-100">
            <Shield class="h-4 w-4 text-emerald-500" />
            <span>How your data is protected</span>
          </div>
          <p>
            Your resume files are securely stored in private cloud storage and accessible only by you and verified campus placement administrators. Uploaded resumes are evaluated for ATS metrics and never sold to third-party ad networks.
          </p>
        </div>

        <div class="space-y-3">
          <!-- Data Export Button -->
          <button 
            type="button"
            onclick={handleExportData}
            disabled={exportLoading}
            class="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {#if exportLoading}
              <Loader class="h-4 w-4 animate-spin text-emerald-500" />
              <span>Generating Export JSON...</span>
            {:else}
              <Download class="h-4 w-4 text-emerald-500" />
              <span>{t('export_data', currentLanguage)}</span>
            {/if}
          </button>

          <!-- Danger Zone: Delete Account -->
          <div class="pt-2">
            <button 
              type="button"
              onclick={() => showDeleteModal = true}
              class="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 class="h-4 w-4" />
              <span>{t('delete_account', currentLanguage)}</span>
            </button>
          </div>
        </div>
      </section>

    </div>

    <!-- RIGHT COLUMN -->
    <div class="space-y-6">
      
      <!-- 4. SMART NOTIFICATION PREFERENCES CARD -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6" aria-labelledby="notifications-heading">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Bell class="h-4 w-4" />
            </div>
            <div>
              <h2 id="notifications-heading" class="font-bold text-sm text-slate-900 dark:text-white">
                {t('smart_notifications', currentLanguage)}
              </h2>
              <p class="text-[11px] text-slate-400 mt-0.5">
                {t('notifications_desc', currentLanguage)}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          
          <!-- Placement Drives -->
          <div class="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
            <div>
              <span class="font-bold text-xs text-slate-900 dark:text-white block">
                {t('placement_drives', currentLanguage)}
              </span>
              <span class="text-[10px] text-slate-400 block mt-0.5">
                {t('placement_drives_desc', currentLanguage)}
              </span>
            </div>
            <button 
              type="button" 
              role="switch"
              aria-label="Toggle placement drive alerts"
              aria-checked={notifyPlacements}
              onclick={() => notifyPlacements = !notifyPlacements}
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 {notifyPlacements ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}"
            >
              <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out {notifyPlacements ? 'translate-x-5' : 'translate-x-0'}"></span>
            </button>
          </div>

          <!-- Interview Schedules -->
          <div class="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
            <div>
              <span class="font-bold text-xs text-slate-900 dark:text-white block">
                {t('interview_schedules', currentLanguage)}
              </span>
              <span class="text-[10px] text-slate-400 block mt-0.5">
                {t('interview_schedules_desc', currentLanguage)}
              </span>
            </div>
            <button 
              type="button" 
              role="switch"
              aria-label="Toggle interview schedule reminders"
              aria-checked={notifyInterviews}
              onclick={() => notifyInterviews = !notifyInterviews}
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 {notifyInterviews ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}"
            >
              <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out {notifyInterviews ? 'translate-x-5' : 'translate-x-0'}"></span>
            </button>
          </div>

          <!-- Application Deadlines -->
          <div class="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
            <div>
              <span class="font-bold text-xs text-slate-900 dark:text-white block">
                {t('application_deadlines', currentLanguage)}
              </span>
              <span class="text-[10px] text-slate-400 block mt-0.5">
                {t('application_deadlines_desc', currentLanguage)}
              </span>
            </div>
            <button 
              type="button" 
              role="switch"
              aria-label="Toggle application deadline reminders"
              aria-checked={notifyDeadlines}
              onclick={() => notifyDeadlines = !notifyDeadlines}
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 {notifyDeadlines ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}"
            >
              <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out {notifyDeadlines ? 'translate-x-5' : 'translate-x-0'}"></span>
            </button>
          </div>

          <!-- Daily AI Learning Reminders -->
          <div class="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
            <div>
              <span class="font-bold text-xs text-slate-900 dark:text-white block">
                {t('daily_ai_reminders', currentLanguage)}
              </span>
              <span class="text-[10px] text-slate-400 block mt-0.5">
                {t('daily_ai_reminders_desc', currentLanguage)}
              </span>
            </div>
            <button 
              type="button" 
              role="switch"
              aria-label="Toggle daily AI learning reminders"
              aria-checked={notifyDailyReminders}
              onclick={() => notifyDailyReminders = !notifyDailyReminders}
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 {notifyDailyReminders ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}"
            >
              <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out {notifyDailyReminders ? 'translate-x-5' : 'translate-x-0'}"></span>
            </button>
          </div>

          <!-- Resume Improvements -->
          <div class="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
            <div>
              <span class="font-bold text-xs text-slate-900 dark:text-white block">
                {t('resume_suggestions', currentLanguage)}
              </span>
              <span class="text-[10px] text-slate-400 block mt-0.5">
                {t('resume_suggestions_desc', currentLanguage)}
              </span>
            </div>
            <button 
              type="button" 
              role="switch"
              aria-label="Toggle resume improvement alerts"
              aria-checked={notifyResume}
              onclick={() => notifyResume = !notifyResume}
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 {notifyResume ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}"
            >
              <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out {notifyResume ? 'translate-x-5' : 'translate-x-0'}"></span>
            </button>
          </div>

          <!-- Skill-Gap & Roadmap Alerts -->
          <div class="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
            <div>
              <span class="font-bold text-xs text-slate-900 dark:text-white block">
                {t('roadmap_alerts', currentLanguage)}
              </span>
              <span class="text-[10px] text-slate-400 block mt-0.5">
                {t('roadmap_alerts_desc', currentLanguage)}
              </span>
            </div>
            <button 
              type="button" 
              role="switch"
              aria-label="Toggle skill-gap and roadmap alerts"
              aria-checked={notifyRoadmap}
              onclick={() => notifyRoadmap = !notifyRoadmap}
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 {notifyRoadmap ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}"
            >
              <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out {notifyRoadmap ? 'translate-x-5' : 'translate-x-0'}"></span>
            </button>
          </div>

          <!-- Delivery Channels Divider -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">Delivery Channels</span>
            
            <div class="space-y-3">
              <!-- Email Notifications -->
              <div class="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
                <div class="flex items-center gap-2.5">
                  <Mail class="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <span class="font-bold text-xs text-slate-900 dark:text-white block">
                      {t('email_notifs', currentLanguage)}
                    </span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">
                      {t('email_notifs_desc', currentLanguage)}
                    </span>
                  </div>
                </div>
                <button 
                  type="button" 
                  role="switch"
                  aria-label="Toggle email notifications"
                  aria-checked={notifyEmail}
                  onclick={() => notifyEmail = !notifyEmail}
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 {notifyEmail ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}"
                >
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out {notifyEmail ? 'translate-x-5' : 'translate-x-0'}"></span>
                </button>
              </div>

              <!-- In-App Notifications -->
              <div class="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
                <div class="flex items-center gap-2.5">
                  <Bell class="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <span class="font-bold text-xs text-slate-900 dark:text-white block">
                      {t('in_app_notifs', currentLanguage)}
                    </span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">
                      {t('in_app_notifs_desc', currentLanguage)}
                    </span>
                  </div>
                </div>
                <button 
                  type="button" 
                  role="switch"
                  aria-label="Toggle in-app notifications"
                  aria-checked={notifyInApp}
                  onclick={() => notifyInApp = !notifyInApp}
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 {notifyInApp ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}"
                >
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out {notifyInApp ? 'translate-x-5' : 'translate-x-0'}"></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <div class="pt-3">
            <button 
              type="button"
              onclick={handleSaveNotifications}
              disabled={notifSaving}
              class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/10 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {#if notifSaving}
                <Loader class="h-4 w-4 animate-spin" />
                <span>{t('saving', currentLanguage)}</span>
              {:else}
                <Check class="h-4 w-4" />
                <span>{t('save_preferences', currentLanguage)}</span>
              {/if}
            </button>
          </div>

        </div>
      </section>

      <!-- 5. SECURITY & CHANGE PASSWORD CARD -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6" aria-labelledby="security-heading">
        <div class="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Lock class="h-4 w-4" />
          </div>
          <div>
            <h2 id="security-heading" class="font-bold text-sm text-slate-900 dark:text-white">
              {t('security_password', currentLanguage)}
            </h2>
            <p class="text-[11px] text-slate-400 mt-0.5">
              {t('security_desc', currentLanguage)}
            </p>
          </div>
        </div>

        <form onsubmit={handlePasswordChange} class="space-y-4">
          
          <!-- Current Password -->
          <div class="space-y-1">
            <label for="current-pass" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('current_password', currentLanguage)} <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input 
                type={showCurrentPass ? 'text' : 'password'} 
                id="current-pass" 
                bind:value={currentPassword} 
                placeholder="Enter current password" 
                required 
                class="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
              />
              <button 
                type="button" 
                onclick={() => showCurrentPass = !showCurrentPass}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                tabindex="-1"
                aria-label={showCurrentPass ? "Hide password" : "Show password"}
              >
                {#if showCurrentPass}
                  <EyeOff class="h-4 w-4" />
                {:else}
                  <Eye class="h-4 w-4" />
                {/if}
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div class="space-y-1">
            <label for="new-pass" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('new_password', currentLanguage)} <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input 
                type={showNewPass ? 'text' : 'password'} 
                id="new-pass" 
                bind:value={newPassword} 
                placeholder="Minimum 6 characters" 
                required 
                class="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
              />
              <button 
                type="button" 
                onclick={() => showNewPass = !showNewPass}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                tabindex="-1"
                aria-label={showNewPass ? "Hide password" : "Show password"}
              >
                {#if showNewPass}
                  <EyeOff class="h-4 w-4" />
                {:else}
                  <Eye class="h-4 w-4" />
                {/if}
              </button>
            </div>

            <!-- Password Strength Bar -->
            {#if newPassword}
              <div class="pt-1.5 space-y-1">
                <div class="flex items-center justify-between text-[10px]">
                  <span class="text-slate-400 font-medium">Strength:</span>
                  <span class="font-bold {passwordStrength.text}">{passwordStrength.label}</span>
                </div>
                <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div class="h-full flex-1 rounded-full transition-all duration-300 {passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}"></div>
                  <div class="h-full flex-1 rounded-full transition-all duration-300 {passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}"></div>
                  <div class="h-full flex-1 rounded-full transition-all duration-300 {passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}"></div>
                  <div class="h-full flex-1 rounded-full transition-all duration-300 {passwordStrength.score >= 4 ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'}"></div>
                </div>
              </div>
            {/if}
          </div>

          <!-- Confirm New Password -->
          <div class="space-y-1">
            <label for="conf-pass" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('confirm_password', currentLanguage)} <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input 
                type={showConfirmPass ? 'text' : 'password'} 
                id="conf-pass" 
                bind:value={confirmNewPassword} 
                placeholder="Re-type new password" 
                required 
                class="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
              />
              <button 
                type="button" 
                onclick={() => showConfirmPass = !showConfirmPass}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                tabindex="-1"
                aria-label={showConfirmPass ? "Hide password" : "Show password"}
              >
                {#if showConfirmPass}
                  <EyeOff class="h-4 w-4" />
                {:else}
                  <Eye class="h-4 w-4" />
                {/if}
              </button>
            </div>
            {#if newPassword && confirmNewPassword && newPassword !== confirmNewPassword}
              <p class="text-[10px] text-rose-500 mt-1">Passwords do not match</p>
            {/if}
          </div>

          <!-- Buttons -->
          <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button 
              type="submit" 
              disabled={passwordLoading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
              class="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {#if passwordLoading}
                <Loader class="h-4 w-4 animate-spin" />
                <span>Updating credentials...</span>
              {:else}
                <KeyRound class="h-4 w-4" />
                <span>{t('update_password', currentLanguage)}</span>
              {/if}
            </button>

            <button 
              type="button"
              onclick={handleForgotPasswordReset}
              disabled={forgotLoading}
              class="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold cursor-pointer underline transition-colors disabled:opacity-50"
            >
              {#if forgotLoading}
                <span>Sending reset email...</span>
              {:else}
                <span>{t('forgot_password', currentLanguage)}</span>
              {/if}
            </button>
          </div>

        </form>

        <!-- Active Session Info Card -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {t('active_session', currentLanguage)}
          </span>
          <div class="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2.5">
              <div class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <span class="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">
                  {user?.email || 'Active Session'}
                </span>
                <span class="text-[10px] text-slate-400 block mt-0.5">
                  Authenticated via Firebase Auth
                </span>
              </div>
            </div>
            <button 
              type="button"
              onclick={handleSignOut}
              class="px-3 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              {t('sign_out', currentLanguage)}
            </button>
          </div>
        </div>

      </section>

    </div>

  </div>

</div>

<!-- Delete Account Confirmation Modal -->
{#if showDeleteModal}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
    onclick={() => showDeleteModal = false}
  >
    <div 
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl text-left space-y-5"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div class="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
          <AlertTriangle class="h-5 w-5" />
          <h3 class="font-bold text-base text-slate-900 dark:text-white">Delete Account & Data</h3>
        </div>
        <button 
          onclick={() => showDeleteModal = false}
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
        <p class="font-semibold text-rose-600 dark:text-rose-400">
          Warning: This action cannot be undone.
        </p>
        <p>
          Executing this deletion will immediately remove:
        </p>
        <ul class="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
          <li>Your student profile and academic metrics</li>
          <li>All uploaded resume PDF files from cloud storage</li>
          <li>Your project, skill matrix, and certification history</li>
          <li>All job application records and notification tray alerts</li>
          <li>Your Firebase Authentication credentials</li>
        </ul>
      </div>

      <div class="space-y-1.5 pt-1">
        <label for="delete-confirm-box" class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Type <span class="font-mono text-rose-500 font-extrabold">DELETE</span> to confirm:
        </label>
        <input 
          id="delete-confirm-box"
          type="text" 
          bind:value={deleteConfirmInput} 
          placeholder="DELETE" 
          class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
        />
      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button 
          type="button"
          onclick={() => showDeleteModal = false}
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button 
          type="button"
          disabled={deleteConfirmInput.trim() !== 'DELETE' || deleteLoading}
          onclick={handleDeleteAccount}
          class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40"
        >
          {#if deleteLoading}
            <Loader class="h-3.5 w-3.5 animate-spin" />
            <span>Deleting Account...</span>
          {:else}
            <Trash2 class="h-3.5 w-3.5" />
            <span>Permanently Delete</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
