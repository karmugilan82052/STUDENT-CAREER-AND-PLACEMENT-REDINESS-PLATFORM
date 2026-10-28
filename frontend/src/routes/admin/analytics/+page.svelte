<script>
  import { adminService } from '$lib/services/adminService';
  import { studentService } from '$lib/services/studentService';
  import { showToast } from '$lib/stores/toastStore';
  import { t } from '$lib/utils/translate';
  import { langStore } from '$lib/stores/themeStore';
  import { 
    BarChart2, Sparkles, Bell, Send, Users, 
    ShieldCheck, Loader, ChevronRight, MessageSquare 
  } from '@lucide/svelte';

  let analytics = $state(null);
  let loading = $state(true);
  let currentLanguage = $state('en');

  $effect(() => {
    const unsub = langStore.subscribe(v => currentLanguage = v);
    return () => unsub();
  });

  // Form states (Broadcast)
  let title = $state('');
  let message = $state('');
  let type = $state('Placement'); // 'Placement' | 'Company' | 'Reminder'
  let recipient = $state('all'); // 'all' | 'stu_id'
  let studentsList = $state([]);
  let broadcasting = $state(false);

  async function loadAnalyticsData() {
    try {
      analytics = await adminService.getDashboardAnalytics();
      studentsList = await adminService.getAllStudents();
    } catch (e) {
      showToast("Error loading metrics", "error");
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    loadAnalyticsData();
  });

  async function handleBroadcast(e) {
    e.preventDefault();
    if (!title || !message) {
      showToast("Please fill all required inputs", "error");
      return;
    }

    broadcasting = true;
    try {
      if (recipient === 'all') {
        await adminService.broadcastNotification({ title, message, type });
        showToast("Global announcement broadcasted!", "success");
      } else {
        await studentService.addNotification(recipient, { title, message, type });
        showToast("Alert sent to student", "success");
      }

      title = '';
      message = '';
    } catch (err) {
      showToast("Failed to broadcast alert", "error");
    } finally {
      broadcasting = false;
    }
  }
</script>

<svelte:head>
  <title>Analytics & Alerts - CareerReady AI</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 text-left animate-slide-in">
    
    <div class="border-b border-slate-200 dark:border-slate-800 pb-4">
      <h2 class="text-3xl font-extrabold tracking-tight">{t('analytics_alerts', currentLanguage)}</h2>
      <p class="text-xs text-slate-550 dark:text-slate-400 mt-1">Review campus-wide AI evaluations logs and dispatch notifications alert systems.</p>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      
      <!-- AI Statistics (Right 2 columns) -->
      <div class="md:col-span-2 space-y-6">
        
        <!-- Statistics cards -->
        <div class="grid gap-6 sm:grid-cols-2">
          
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('Average ATS Rating', currentLanguage)}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-black text-indigo-600 dark:text-indigo-400">{analytics.averageAts}</span>
              <span class="text-xs text-slate-400">/ 100</span>
            </div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Average score of all candidate PDF resumes processed by Svelte-Gemini parsing engines.</p>
          </div>

          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('interview_completion_rate', currentLanguage)}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-black text-violet-650 dark:text-violet-400">82%</span>
            </div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Completion of simulated HR, Technical, behavioral, coding, and domain questions mock rounds.</p>
          </div>

        </div>

        <!-- AI Audit Logs -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles class="h-4.5 w-4.5 text-indigo-500" />
            <span>{t('ai_audit_logs', currentLanguage)}</span>
          </h3>

          <div class="space-y-3">
            <div class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between text-[11px]">
              <div>
                <span class="font-bold text-slate-800 dark:text-slate-250 block">Resume Parser Function Called</span>
                <span class="text-[10px] text-slate-450 block mt-0.5">Parameters: pdfDoc, parseSchema</span>
              </div>
              <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-semibold shrink-0">Success</span>
            </div>

            <div class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between text-[11px]">
              <div>
                <span class="font-bold text-slate-800 dark:text-slate-250 block">Interview Question Engine Triggered</span>
                <span class="text-[10px] text-slate-450 block mt-0.5">Parameters: studentSkills, category: Technical</span>
              </div>
              <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-semibold shrink-0">Success</span>
            </div>

            <div class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between text-[11px]">
              <div>
                <span class="font-bold text-slate-800 dark:text-slate-250 block">UI Translation Service Triggered</span>
                <span class="text-[10px] text-slate-450 block mt-0.5">Parameters: dictionaryKeys, lang: {currentLanguage}</span>
              </div>
              <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-semibold shrink-0">Success</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Broadcast Panel (Left 1 column) -->
      <div class="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-fit space-y-6">
        <h3 class="text-lg font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
          <Bell class="h-5 w-5 text-indigo-500" />
          <span>{t('broadcast_announcement', currentLanguage)}</span>
        </h3>

        <form onsubmit={handleBroadcast} class="space-y-4">
          <div class="space-y-1">
            <label for="n-rec" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('Select Recipient', currentLanguage)}</label>
            <select id="n-rec" bind:value={recipient} class="w-full px-4 py-2 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 cursor-pointer">
              <option value="all">📢 {t('All', currentLanguage)} ({t('Enrolled Students', currentLanguage)})</option>
              {#each studentsList as s}
                <option value={s.uid}>🎓 {s.name} ({s.registerNumber})</option>
              {/each}
            </select>
          </div>

          <div class="space-y-1">
            <label for="n-type" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('Alert Category', currentLanguage)}</label>
            <select id="n-type" bind:value={type} class="w-full px-4 py-2 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 cursor-pointer">
              <option value="Placement">Placement Campaign Alert</option>
              <option value="Company">Application Status Alert</option>
              <option value="Reminder">Standard Reminder</option>
            </select>
          </div>

          <div class="space-y-1">
            <label for="n-title" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('Notification Title', currentLanguage)}</label>
            <input type="text" id="n-title" bind:value={title} placeholder="e.g. TCS Assessment Scheduled" required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
          </div>

          <div class="space-y-1">
            <label for="n-msg" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('Notification Message', currentLanguage)}</label>
            <textarea id="n-msg" bind:value={message} rows="5" placeholder="Details of the schedules, links or announcements details..." required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 resize-none"></textarea>
          </div>

          <button 
            type="submit" 
            disabled={broadcasting}
            class="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            {#if broadcasting}
              <Loader class="h-4 w-4 animate-spin" />
              <span>{t('Broadcasting...', currentLanguage)}</span>
            {:else}
              <Send class="h-4 w-4" />
              <span>{t('send', currentLanguage)}</span>
            {/if}
          </button>
        </form>
      </div>

    </div>

  </div>
{/if}
