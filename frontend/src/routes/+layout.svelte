<script>
  import './layout.css';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/authStore';
  import { themeStore, langStore } from '$lib/stores/themeStore';
  import { authService } from '$lib/services/authService';
  import { studentService } from '$lib/services/studentService';
  import { t } from '$lib/utils/translate';
  import Toast from '$lib/components/common/Toast.svelte';
  import Avatar from '$lib/components/common/Avatar.svelte';
  import { showToast } from '$lib/stores/toastStore';
  import { 
    LayoutDashboard, User, FileText, Award, Route, 
    MessageSquare, Building2, Bell, Shield, LogOut, 
    Menu, X, Sun, Moon, Sparkles, BarChart2, Settings, Globe, Filter 
  } from '@lucide/svelte';

  import { onMount } from 'svelte';
  import { notificationStore, fetchNotifications } from '$lib/stores/notificationStore';
  import { initAutoTranslate } from '$lib/utils/autoTranslate';

  let { children } = $props();

  // Navigation collapsible state
  let isMobileNavOpen = $state(false);
  let isNotificationsOpen = $state(false);
  let showLogoutConfirm = $state(false);
  let isLoggingOut = $state(false);

  // Layout-wide states via Svelte store auto-subscriptions (zero re-subscription overhead)
  let notifications = $derived($notificationStore || []);
  let unreadCount = $derived(notifications.filter(n => !n.read).length);
  let theme = $derived($themeStore || 'light');
  let currentLanguage = $derived($langStore || 'en');

  // Route protection rules
  const publicRoutes = ['/login', '/register', '/forgot-password', '/'];

  onMount(() => {
    const cleanupTranslator = initAutoTranslate();
    return () => {
      if (cleanupTranslator) cleanupTranslator();
    };
  });

  // Watch Authentication status and redirect accordingly
  $effect(() => {
    const userState = $authStore;
    const currentPath = $page.url.pathname;
    
    if (!userState.loading) {
      if (!userState.user) {
        // Not authenticated
        const isPublic = publicRoutes.includes(currentPath);
        if (!isPublic) {
          goto('/login');
        }
      } else {
        // Authenticated
        if (publicRoutes.includes(currentPath) || currentPath === '/') {
          if (userState.role === 'admin') {
            goto('/admin/dashboard');
          } else {
            goto('/dashboard');
          }
        } else if (currentPath.startsWith('/admin') && userState.role !== 'admin') {
          // Student trying to access admin
          goto('/dashboard');
        } else if (!currentPath.startsWith('/admin') && userState.role === 'admin' && currentPath !== '/settings') {
          // Admin trying to access student route (except settings)
          goto('/admin/dashboard');
        }
      }
    }
  });

  // Fetch and periodically refresh notifications for logged-in student (guarded by uid)
  let activeStudentNotifUid = null;
  $effect(() => {
    const user = $authStore.user;
    const role = $authStore.role;
    const uid = user?.uid;
    if (uid && role === 'student' && activeStudentNotifUid !== uid) {
      activeStudentNotifUid = uid;
      fetchNotifications(uid);
      const timer = setInterval(() => {
        fetchNotifications(uid);
      }, 45000);
      return () => {
        clearInterval(timer);
        activeStudentNotifUid = null;
      };
    }
  });

  async function handleLogout() {
    try {
      isLoggingOut = true;
      await authService.logout();
      showToast("Logged out successfully", "success");
      showLogoutConfirm = false;
      goto('/login');
    } catch (e) {
      showToast(e.message || "Logout failed", "error");
    } finally {
      isLoggingOut = false;
    }
  }

  function triggerLogout() {
    showLogoutConfirm = true;
  }

  function toggleTheme() {
    themeStore.update(curr => curr === 'light' ? 'dark' : 'light');
  }

  function handleLanguageChange(event) {
    langStore.set(event.target.value);
    showToast(`Language changed`, "success");
  }

  async function handleMarkAllAsRead() {
    const studentId = $authStore.user?.uid;
    if (!studentId) return;

    for (const n of notifications) {
      if (!n.read) {
        await studentService.markNotificationRead(n.id, studentId);
      }
    }
    await fetchNotifications(studentId);
    showToast("Notifications marked as read", "success");
  }

  // Navigation configuration
  const studentNav = [
    { name: "dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "profile", path: "/profile", icon: User },
    { name: "resume", path: "/resume", icon: FileText },
    { name: "skills", path: "/skills", icon: Award },
    { name: "recommendations", path: "/recommendations", icon: Route },
    { name: "interview", path: "/interview", icon: Shield },
    { name: "companies", path: "/companies", icon: Building2 },
    { name: "chatbot", path: "/chatbot", icon: MessageSquare },
    { name: "reports", path: "/reports", icon: BarChart2 },
    { name: "settings", path: "/settings", icon: Settings }
  ];

  const adminNav = [
    { name: "dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "eligibility", path: "/admin/eligibility", icon: Filter },
    { name: "profile", path: "/admin/students", icon: User },
    { name: "companies", path: "/admin/companies", icon: Building2 },
    { name: "reports", path: "/admin/analytics", icon: BarChart2 },
    { name: "settings", path: "/settings", icon: Settings }
  ];

  const sidebarItems = $derived($authStore.role === 'admin' ? adminNav : studentNav);
  const isPublicPage = $derived(publicRoutes.includes($page.url.pathname));
</script>

<Toast />

{#if $authStore.loading}
  <div class="fixed inset-0 flex items-center justify-center bg-slate-900 text-white z-50">
    <div class="flex flex-col items-center gap-4">
      <div class="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm font-semibold tracking-wider animate-pulse">CAREERREADY LOADING...</p>
    </div>
  </div>
{:else if isPublicPage}
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans relative transition-colors duration-300">
    <!-- Public Quick Language & Theme Controls -->
    <div class="absolute top-4 right-4 z-50 flex items-center gap-2">
      <div class="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 shadow-md backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <Globe class="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <select 
          value={currentLanguage} 
          onchange={handleLanguageChange}
          class="text-xs font-semibold bg-transparent border-none text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="en">EN (English)</option>
          <option value="ta">TA (தமிழ்)</option>
          <option value="hi">HI (हिन्दी)</option>
          <option value="te">TE (తెలుగు)</option>
          <option value="ml">ML (മലയാളം)</option>
          <option value="kn">KN (ಕನ್ನಡ)</option>
        </select>
      </div>
      <button 
        onclick={toggleTheme}
        class="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 shadow-md backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        title="Toggle Theme"
      >
        {#if theme === 'dark'}
          <Sun class="h-3.5 w-3.5" />
        {:else}
          <Moon class="h-3.5 w-3.5" />
        {/if}
      </button>
    </div>
    {@render children()}
  </div>
{:else}
  <!-- Complete Authed Shell -->
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
    
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 z-20">
      <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div class="h-9 w-9 bg-emerald-600 dark:bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm font-black text-lg">
          CR
        </div>
        <div>
          <h1 class="font-bold text-base text-slate-900 dark:text-white leading-tight">
            CareerReady
          </h1>
          <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase">Placement Hub</span>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {#each sidebarItems as item}
          <a 
            href={item.path}
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
              {$page.url.pathname === item.path 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-l-4 border-emerald-500' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'}"
          >
            <item.icon class="h-4 w-4" />
            <span>{t(item.name, currentLanguage)}</span>
          </a>
        {/each}

        <!-- In-Navigation Logout Option right below Settings -->
        <div class="pt-2 mt-2 border-t border-slate-200/80 dark:border-slate-800/80">
          <button 
            type="button"
            onclick={triggerLogout}
            class="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300 transition-all duration-150 cursor-pointer group text-left"
          >
            <LogOut class="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>{t('logout', currentLanguage)}</span>
          </button>
        </div>
      </nav>
    </aside>

    <!-- Mobile Sidebar overlay -->
    {#if isMobileNavOpen}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        onclick={() => isMobileNavOpen = false} 
        class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden"
      ></div>
      <aside class="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-slate-900 z-50 flex flex-col md:hidden animate-slide-right shadow-2xl border-r border-slate-200 dark:border-slate-800">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles class="h-4 w-4" />
            </div>
            <span class="font-bold text-lg text-slate-850 dark:text-white">CareerReady AI</span>
          </div>
          <button onclick={() => isMobileNavOpen = false} class="p-2 rounded-lg text-slate-500">
            <X class="h-5 w-5" />
          </button>
        </div>
        
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {#each sidebarItems as item}
            <a 
              href={item.path}
              onclick={() => isMobileNavOpen = false}
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                {$page.url.pathname === item.path 
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500 font-semibold' 
                  : 'text-slate-500 dark:text-slate-400'}"
            >
              <item.icon class="h-5 w-5" />
              <span>{t(item.name, currentLanguage)}</span>
            </a>
          {/each}

          <!-- In-Navigation Logout Option in Mobile Drawer -->
          <div class="pt-2 mt-2 border-t border-slate-200/80 dark:border-slate-800/80">
            <button 
              type="button"
              onclick={() => { isMobileNavOpen = false; triggerLogout(); }}
              class="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
            >
              <LogOut class="h-5 w-5" />
              <span>{t('logout', currentLanguage)}</span>
            </button>
          </div>
        </nav>
      </aside>
    {/if}

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- Top Navbar -->
      <header class="h-16 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30">
        
        <!-- Toggle button for mobile nav -->
        <button 
          onclick={() => isMobileNavOpen = true} 
          class="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu class="h-5 w-5" />
        </button>

        <div class="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          <span>{t('dashboard', currentLanguage)}</span>
          <span>/</span>
          <span class="text-slate-800 dark:text-slate-200 capitalize">
            {t($page.url.pathname.split('/').pop() || 'overview', currentLanguage)}
          </span>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-4 ml-auto md:ml-0">
          
          <!-- Language selector -->
          <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Globe class="h-4 w-4 text-slate-400 shrink-0" />
            <select 
              value={currentLanguage} 
              onchange={handleLanguageChange}
              class="text-xs font-semibold bg-transparent border-none text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="en">EN (English)</option>
              <option value="ta">TA (தமிழ்)</option>
              <option value="hi">HI (हिन्दी)</option>
              <option value="te">TE (తెలుగు)</option>
              <option value="ml">ML (മലയാളം)</option>
              <option value="kn">KN (ಕನ್ನಡ)</option>
            </select>
          </div>

          <!-- Theme Toggle -->
          <button 
            onclick={toggleTheme}
            class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Toggle Theme"
          >
            {#if theme === 'dark'}
              <Sun class="h-4 w-4" />
            {:else}
              <Moon class="h-4 w-4" />
            {/if}
          </button>

          <!-- Notifications tray -->
          {#if $authStore.role === 'student'}
            <div class="relative">
              <button 
                onclick={() => isNotificationsOpen = !isNotificationsOpen}
                class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors relative"
              >
                <Bell class="h-4 w-4" />
                {#if unreadCount > 0}
                  <span class="absolute top-0 right-0 h-4 w-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                    {unreadCount}
                  </span>
                {/if}
              </button>

              <!-- Notifications Menu -->
              {#if isNotificationsOpen}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div 
                  onclick={() => isNotificationsOpen = false} 
                  class="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]"
                ></div>
                <div 
                  class="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150"
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-sm text-slate-800 dark:text-white">{t('notifications', currentLanguage)}</span>
                      {#if unreadCount > 0}
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                          {unreadCount} new
                        </span>
                      {/if}
                    </div>
                    <div class="flex items-center gap-2">
                      {#if unreadCount > 0}
                        <button 
                          onclick={handleMarkAllAsRead} 
                          class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                        >
                          Mark all read
                        </button>
                      {/if}
                      <button 
                        onclick={() => isNotificationsOpen = false}
                        class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Close notifications"
                      >
                        <X class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div class="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {#if notifications.length === 0}
                      <div class="py-8 text-center space-y-1">
                        <Bell class="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p class="text-xs font-medium text-slate-500 dark:text-slate-400">No notifications yet</p>
                        <p class="text-[10px] text-slate-400">Updates on drives and tests will appear here</p>
                      </div>
                    {:else}
                      {#each notifications as notif}
                        <div class="px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors {notif.read ? 'opacity-65' : 'bg-emerald-500/[0.03]' }">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full 
                              {notif.type === 'Placement' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                               notif.type === 'AI_Analysis' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                               notif.type === 'Company' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                               'bg-slate-500/10 text-slate-600 dark:text-slate-400'}">
                              {notif.type}
                            </span>
                            <span class="text-[9px] text-slate-400 ml-auto font-medium">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 class="font-semibold text-xs text-slate-800 dark:text-slate-200 leading-snug">{notif.title}</h4>
                          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                        </div>
                      {/each}
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/if}

          <!-- User Details Profile photo -->
          <a 
            href="/settings"
            class="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
            title="Go to Settings"
          >
            <Avatar 
              src={$authStore.profile?.profilePhotoUrl} 
              name={$authStore.profile?.name || $authStore.user?.email} 
              size="sm" 
              rounded="rounded-xl"
            />
            <div class="hidden xl:flex flex-col text-left">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {$authStore.profile?.name || $authStore.user?.email || 'User'}
              </span>
              <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {$authStore.role || 'student'}
              </span>
            </div>
          </a>

        </div>

      </header>

      <!-- Page Content Layout -->
      <main class="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div class="max-w-7xl mx-auto space-y-6">
          {@render children()}
        </div>
      </main>

    </div>

    <!-- Logout Confirmation Modal -->
    {#if showLogoutConfirm}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        onclick={() => !isLoggingOut && (showLogoutConfirm = false)}
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      >
        <div 
          onclick={(e) => e.stopPropagation()}
          class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-left space-y-5 animate-scale-up"
        >
          <div class="flex items-center gap-3.5">
            <div class="h-11 w-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <LogOut class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Sign out of CareerReady?
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Are you sure you want to end your current session?
              </p>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
            <Avatar 
              src={$authStore.profile?.profilePhotoUrl} 
              name={$authStore.profile?.name || $authStore.user?.email} 
              size="sm" 
              rounded="rounded-xl"
            />
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {$authStore.profile?.name || $authStore.user?.email || 'Logged In User'}
              </span>
              <span class="text-[10px] text-slate-400 font-semibold truncate">
                {$authStore.user?.email} • <span class="uppercase">{$authStore.role || 'student'}</span>
              </span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isLoggingOut}
              onclick={() => showLogoutConfirm = false}
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoggingOut}
              onclick={handleLogout}
              class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {#if isLoggingOut}
                <div class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing Out...</span>
              {:else}
                <LogOut class="h-3.5 w-3.5" />
                <span>Sign Out</span>
              {/if}
            </button>
          </div>
        </div>
      </div>
    {/if}

  </div>
{/if}

<style>
  @keyframes slide-right {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
  .animate-slide-right {
    animation: slide-right 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes scale-up {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .animate-scale-up {
    animation: scale-up 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
