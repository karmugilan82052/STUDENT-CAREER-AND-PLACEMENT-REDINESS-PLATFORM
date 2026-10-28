<script>
  import { authStore } from '$lib/stores/authStore';
  import { aiService } from '$lib/services/aiService';
  import { studentService } from '$lib/services/studentService';
  import { showToast } from '$lib/stores/toastStore';
  import { t } from '$lib/utils/translate';
  import { langStore } from '$lib/stores/themeStore';
  import { 
    Sparkles, Route, GraduationCap, Video, BookOpen, 
    Plus, Loader, Calendar, Compass, ClipboardList, Target 
  } from '@lucide/svelte';

  let currentLanguage = $derived($langStore || 'en');
  let generating = $state(false);
  let recs = $state(null);
  let loading = $state(true);
  let activeTab = $state('roadmap'); // 'roadmap' | 'courses' | 'projects' | 'schedule'

  async function loadRecommendations(forceGenerate = false) {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    if (forceGenerate) {
      generating = true;
      recs = null;
    } else if (!recs) {
      loading = true;
    }

    try {
      if (forceGenerate) {
        recs = await aiService.generateLearningRecommendations(uid);
        showToast("AI Recommendations updated!", "success");
      } else {
        // Try to fetch from local storage / Firestore first
        let fetched = null;
        if (typeof window !== 'undefined') {
          if (import.meta.env.VITE_FIREBASE_API_KEY === "mock-api-key-for-development-only" || !import.meta.env.VITE_FIREBASE_API_KEY) {
            const dbRecs = JSON.parse(localStorage.getItem('cs_recommendations') || '{}');
            fetched = dbRecs[uid] || null;
          } else {
            // Firestore call
            const snap = await studentService.getProfile(uid); // fetch profile first or custom recommendation doc
            // Fetch database recs directly
            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('$lib/firebase/firebaseClient');
            const dSnap = await getDoc(doc(db, 'recommendations', uid));
            if (dSnap.exists()) fetched = dSnap.data();
          }
        }
        
        if (fetched) {
          recs = fetched;
        } else {
          // If empty, generate initially
          recs = await aiService.generateLearningRecommendations(uid);
        }
      }
    } catch (e) {
      showToast("Failed to compile path", "error");
    } finally {
      loading = false;
      generating = false;
    }
  }

  let loadedUid = $state(null);
  $effect(() => {
    const uid = $authStore.user?.uid;
    if (uid && loadedUid !== uid) {
      loadedUid = uid;
      loadRecommendations();
    }
  });

  const tabDetails = {
    roadmap: { label: "Study Roadmap", icon: Route },
    courses: { label: "Courses & Resources", icon: Video },
    projects: { label: "Project Recommendations", icon: Compass },
    schedule: { label: "Weekly Schedule", icon: Calendar }
  };
</script>

<svelte:head>
  <title>AI Roadmaps - CareerReady AI</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6">
    
    <!-- Top Row -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
      <div class="text-left">
        <h2 class="text-3xl font-extrabold tracking-tight">{t('recommendations', currentLanguage)}</h2>
        <p class="text-xs text-slate-555 dark:text-slate-400 mt-1">{t('recommendations_desc', currentLanguage)}</p>
      </div>

      <button 
        onclick={() => loadRecommendations(true)}
        disabled={generating}
        class="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 via-violet-600 to-fuchsia-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer disabled:opacity-50"
      >
        {#if generating}
          <Loader class="h-4 w-4 animate-spin" />
          <span>{t('generating_syllabus', currentLanguage)}</span>
        {:else}
          <Sparkles class="h-4 w-4" />
          <span>{t('refresh_guidance', currentLanguage)}</span>
        {/if}
      </button>
    </div>

    <!-- AI Output Tabs Navigation -->
    {#if generating}
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
        <Loader class="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
        <p class="text-xs text-slate-450 mt-4">{t('generating_syllabus', currentLanguage)}</p>
      </div>
    {:else if !recs}
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm text-slate-450 text-xs">
        {t('No roadmap generated. Click "Refresh AI Guidance" to get started.', currentLanguage)}
      </div>
    {:else}
      
      <!-- Top banner goals summary -->
      <div class="bg-indigo-500/[0.02] border border-indigo-500/15 rounded-3xl p-5 md:p-6 flex items-start gap-4 text-left shadow-sm">
        <div class="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl shrink-0 mt-0.5">
          <Target class="h-5 w-5" />
        </div>
        <div>
          <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">{t('monthly_target', currentLanguage)}</span>
          <p class="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
            "{t(recs.monthlyGoal || 'Complete advanced web frameworks and construct 2 portfolio databases.', currentLanguage)}"
          </p>
        </div>
      </div>

      <!-- Tab bar -->
      <div class="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        {#each Object.entries(tabDetails) as [key, val]}
          <button 
            onclick={() => activeTab = key}
            class="flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-xs tracking-wider uppercase shrink-0 transition-all cursor-pointer
              {activeTab === key 
                ? 'border-indigo-500 text-indigo-650 dark:text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-350'}"
          >
            <val.icon class="h-4 w-4" />
            <span>{t(val.label, currentLanguage)}</span>
          </button>
        {/each}
      </div>

      <!-- Tab Content panels -->
      <div class="text-left animate-slide-in">
        
        <!-- Tab 1: Roadmap Timeline -->
        {#if activeTab === 'roadmap'}
          <div class="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-8 py-4">
            {#each recs.roadmap || [] as step, index}
              <div class="relative">
                <!-- Circle node -->
                <div class="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-950 flex items-center justify-center">
                  <div class="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                </div>

                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h4 class="font-extrabold text-sm text-slate-850 dark:text-white">{t(step.title, currentLanguage)}</h4>
                    <span class="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-bold tracking-wider uppercase">{t(step.duration, currentLanguage)}</span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t(step.desc, currentLanguage)}</p>
                </div>
              </div>
            {/each}
          </div>

        <!-- Tab 2: Courses & Video Resource Links -->
        {:else if activeTab === 'courses'}
          <div class="grid md:grid-cols-2 gap-6">
            
            <!-- Online courses catalog -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 class="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <GraduationCap class="h-4 w-4 text-indigo-500" />
                <span>{t('certification_courses', currentLanguage)}</span>
              </h3>
              <div class="space-y-3">
                {#each recs.courses || [] as course}
                  <a 
                    href={course.url} 
                    target="_blank" 
                    class="p-4 border border-slate-200 dark:border-slate-850 rounded-2xl flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors group"
                  >
                    <div>
                      <h4 class="font-bold text-xs text-slate-850 dark:text-slate-250 group-hover:text-indigo-500 transition-colors">{t(course.title, currentLanguage)}</h4>
                      <span class="text-[10px] text-slate-400 block mt-1">{t(course.platform, currentLanguage)}</span>
                    </div>
                    <Plus class="h-4 w-4 text-slate-450 shrink-0 transform group-hover:rotate-45 transition-transform" />
                  </a>
                {/each}
              </div>
            </div>

            <!-- YouTube Video links -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 class="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Video class="h-4 w-4 text-indigo-500" />
                <span>{t('recommended_videos', currentLanguage)}</span>
              </h3>
              <div class="space-y-3">
                {#each recs.videos || [] as video}
                  <a 
                    href={video.url} 
                    target="_blank" 
                    class="p-4 border border-slate-200 dark:border-slate-850 rounded-2xl flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors group"
                  >
                    <div>
                      <h4 class="font-bold text-xs text-slate-850 dark:text-slate-250 group-hover:text-indigo-500 transition-colors">{t(video.title, currentLanguage)}</h4>
                      <span class="text-[10px] text-slate-400 block mt-1">{t('channel', currentLanguage)}: {video.channel}</span>
                    </div>
                    <Plus class="h-4 w-4 text-slate-450 shrink-0 transform group-hover:rotate-45 transition-transform" />
                  </a>
                {/each}
              </div>
            </div>

          </div>

        <!-- Tab 3: Recommended Projects & Practice -->
        {:else if activeTab === 'projects'}
          <div class="grid md:grid-cols-3 gap-6">
            
            <!-- Books & Practice Platforms (1 column) -->
            <div class="md:col-span-1 space-y-6">
              <!-- Practice Platforms -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 class="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <ClipboardList class="h-4 w-4 text-indigo-500" />
                  <span>{t('practice_sites', currentLanguage)}</span>
                </h3>
                <div class="space-y-2">
                  {#each recs.platforms || [] as site}
                    <a 
                      href={site.url} 
                      target="_blank" 
                      class="block p-3 border border-slate-100 dark:border-slate-850 hover:bg-indigo-500/[0.02] dark:hover:bg-indigo-500/[0.01] rounded-xl text-xs font-bold text-indigo-650 dark:text-indigo-400"
                    >
                      {t(site.name, currentLanguage)} →
                    </a>
                  {/each}
                </div>
              </div>

              <!-- Books -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 class="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <BookOpen class="h-4 w-4 text-indigo-500" />
                  <span>{t('technical_literature', currentLanguage)}</span>
                </h3>
                <div class="space-y-3">
                  {#each recs.books || [] as book}
                    <div class="text-xs">
                      <span class="font-bold text-slate-800 dark:text-slate-200 block">{t(book.title, currentLanguage)}</span>
                      <span class="text-[10px] text-slate-400 block mt-0.5">{t('author', currentLanguage)}: {book.author}</span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>

            <!-- Project Proposals (2 columns) -->
            <div class="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 class="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Compass class="h-4 w-4 text-indigo-500" />
                <span>{t('project_proposals', currentLanguage)}</span>
              </h3>
              <div class="grid gap-4 sm:grid-cols-2">
                {#each recs.projects || [] as proj}
                  <div class="p-4 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 class="font-extrabold text-sm text-slate-850 dark:text-white">{t(proj.title, currentLanguage)}</h4>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{t(proj.desc, currentLanguage)}</p>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-4">
                      {#each proj.tech as tech}
                        <span class="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-lg text-slate-500 dark:text-slate-450">{tech}</span>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            </div>

          </div>

        <!-- Tab 4: Weekly schedule planner -->
        {:else if activeTab === 'schedule'}
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 class="font-bold text-sm uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <Calendar class="h-4.5 w-4.5 text-indigo-500" />
              <span>{t('weekly_schedule_planner', currentLanguage)}</span>
            </h3>
            
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {#each Object.entries(recs.weeklySchedule || {}) as [day, task]}
                <div class="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <span class="text-xs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest">{t(day, currentLanguage)}</span>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">{t(task, currentLanguage)}</p>
                </div>
              {/each}
            </div>
          </div>

        {/if}

      </div>

    {/if}

  </div>
{/if}

<style>
  @keyframes slide-in {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out forwards;
  }
</style>
