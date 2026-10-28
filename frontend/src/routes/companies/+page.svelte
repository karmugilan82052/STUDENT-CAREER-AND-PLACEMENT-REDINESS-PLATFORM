<script>
  import { authStore } from '$lib/stores/authStore';
  import { studentService } from '$lib/services/studentService';
  import { aiService } from '$lib/services/aiService';
  import { showToast } from '$lib/stores/toastStore';
  import { t, translateCompanyName } from '$lib/utils/translate';
  import { 
    Building2, Sparkles, Calendar, Award, Briefcase, 
    X, Loader, Info, HelpCircle, CheckCircle, Search 
  } from '@lucide/svelte';

  import { langStore } from '$lib/stores/themeStore';

  let profile = $state({});
  let companies = $state([]);
  let applications = $state([]);
  let loading = $state(true);
  let currentLanguage = $derived($langStore || 'en');

  // Filters
  let filter = $state('eligible'); // 'eligible' | 'all' | 'applied'
  let searchQuery = $state('');

  // AI Prep modal state
  let showPrepModal = $state(false);
  let prepLoading = $state(false);
  let prepTargetCompany = $state(null);
  let prepData = $state(null);
  let prepRagSources = $state([]);

  async function loadData() {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    try {
      profile = await studentService.getProfile(uid);
      companies = await studentService.getCompanies(uid);
      applications = await studentService.getApplications(uid);
    } catch (e) {
      showToast("Failed to load catalog", "error");
    } finally {
      loading = false;
    }
  }

  let loadedUid = $state(null);
  $effect(() => {
    const uid = $authStore.user?.uid;
    if (uid && loadedUid !== uid) {
      loadedUid = uid;
      loadData();
    }
  });

  const filteredCompanies = $derived.by(() => {
    let result = [...companies];
    
    // Filter Category
    if (filter === 'eligible') {
      result = result.filter(c => {
        if (profile.cgpa < (c.eligibility?.minCgpa || 0)) return false;
        if (c.eligibility?.departments && c.eligibility.departments.length > 0) {
          if (!c.eligibility.departments.includes(profile.department)) return false;
        }
        return true;
      });
    } else if (filter === 'applied') {
      result = result.filter(c => {
        return applications.some(a => a.companyId === c.id);
      });
    }

    // Filter search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));
    }

    return result;
  });

  async function handleApply(companyId) {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    try {
      await studentService.applyToCompany(uid, companyId);
      showToast("Application submitted successfully!", "success");
      await loadData();
    } catch (e) {
      showToast("Application failed", "error");
    }
  }

  async function handleGetPrepStrategy(company) {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    prepTargetCompany = company;
    prepData = null;
    prepRagSources = [];
    showPrepModal = true;
    prepLoading = true;

    try {
      const res = await aiService.getCompanyPreparation(company.name, company.jobDescription, uid);
      prepData = typeof res === 'object' ? res.text : res;
      prepRagSources = typeof res === 'object' ? (res.ragSources || []) : [];
    } catch (e) {
      showToast("Failed to load preparation guides", "error");
      showPrepModal = false;
    } finally {
      prepLoading = false;
    }
  }

  function getStatusForCompany(companyId) {
    const app = applications.find(a => a.companyId === companyId);
    return app ? app.status : null;
  }
</script>

<svelte:head>
  <title>Companies - CareerReady AI</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 text-left">
    
    <!-- Top rows title -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tight">{t('companies', currentLanguage)}</h2>
        <p class="text-xs text-slate-555 dark:text-slate-400 mt-1">{t('companies_desc', currentLanguage)}</p>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <button 
          onclick={() => filter = 'eligible'}
          class="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer
            {filter === 'eligible' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}"
        >
          {t('eligible', currentLanguage)}
        </button>
        <button 
          onclick={() => filter = 'all'}
          class="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer
            {filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}"
        >
          {t('all', currentLanguage)}
        </button>
        <button 
          onclick={() => filter = 'applied'}
          class="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer
            {filter === 'applied' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}"
        >
          {t('applied', currentLanguage)}
        </button>
      </div>
    </div>

    <!-- Search box -->
    <div class="relative w-full max-w-md">
      <Search class="absolute left-3 top-3 h-4.5 w-4.5 text-slate-450 pointer-events-none" />
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder={t('search_company_placeholder', currentLanguage)}
        class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-850 dark:text-white placeholder-slate-450 focus:outline-none focus:border-indigo-500 transition-colors"
      />
    </div>

    <!-- Company Grid -->
    {#if filteredCompanies.length === 0}
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-450 text-xs italic">
        {t('no_companies_found', currentLanguage)}
      </div>
    {:else}
      <div class="grid gap-6 md:grid-cols-2">
        {#each filteredCompanies as comp}
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            
            <!-- Top details row -->
            <div class="flex items-start gap-4">
              <img src={comp.logoUrl} alt={comp.name} class="h-14 w-14 rounded-2xl object-cover ring-2 ring-indigo-500/10 shrink-0" />
              
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="font-extrabold text-lg text-slate-850 dark:text-white truncate">{translateCompanyName(comp.name, currentLanguage)}</h3>
                  {#if getStatusForCompany(comp.id)}
                    <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
                      {t(getStatusForCompany(comp.id), currentLanguage)}
                    </span>
                  {/if}
                </div>
                <p class="text-sm text-slate-500 mt-0.5">{comp.location}</p>
                <div class="flex flex-wrap gap-4 mt-2 text-xs font-semibold text-slate-400">
                  <span class="flex items-center gap-1">
                    <Briefcase class="h-4.5 w-4.5 text-indigo-500" />
                    {t('package', currentLanguage)}: <strong class="text-indigo-650 dark:text-indigo-400">{comp.package} LPA</strong>
                  </span>
                  <span class="flex items-center gap-1">
                    <Calendar class="h-4.5 w-4.5 text-indigo-500" />
                    {t('drive_date', currentLanguage)}: {new Date(comp.driveDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <!-- Job Description snippet -->
            <div class="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              <span class="font-bold text-slate-800 dark:text-slate-300 block mb-1">{t('job_description', currentLanguage)}:</span>
              {comp.jobDescription}
            </div>

            <!-- Eligibility parameters list -->
            <div class="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-2xl space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('eligibility_check', currentLanguage)}</span>
              <div class="grid grid-cols-2 gap-y-2 text-xs">
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full {profile.cgpa >= comp.eligibility.minCgpa ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                  <span>{t('min_cgpa', currentLanguage)}: <strong>{comp.eligibility.minCgpa}</strong></span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
                  <span>{t('bond', currentLanguage)}: <strong>{comp.bond}</strong></span>
                </div>
                {#if comp.eligibility.departments && comp.eligibility.departments.length > 0}
                  <div class="col-span-2 flex items-start gap-2">
                    <span class="h-2 w-2 rounded-full bg-violet-500 mt-1.5 shrink-0"></span>
                    <span class="text-slate-500">{t('allowed', currentLanguage)}: <strong class="text-slate-700 dark:text-slate-350">{comp.eligibility.departments.join(', ')}</strong></span>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Actions panel -->
            <div class="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
              <button 
                onclick={() => handleGetPrepStrategy(comp)}
                class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:bg-indigo-500/5 rounded-xl transition-all cursor-pointer"
              >
                <Sparkles class="h-4 w-4" />
                <span>{t('ai_prep_guide', currentLanguage)}</span>
              </button>

              <div class="flex gap-2">
                {#if getStatusForCompany(comp.id)}
                  <span class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-450 rounded-xl text-xs font-bold cursor-not-allowed">
                    {t('applied', currentLanguage)}
                  </span>
                {:else}
                  {@const isEligible = profile.cgpa >= comp.eligibility.minCgpa}
                  {#if isEligible}
                    <button 
                      onclick={() => handleApply(comp.id)}
                      class="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 cursor-pointer"
                    >
                      {t('apply_now', currentLanguage)}
                    </button>
                  {:else}
                    <span class="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold cursor-not-allowed flex items-center gap-1.5">
                      <Info class="h-3.5 w-3.5" />
                      {t('ineligible', currentLanguage)}
                    </span>
                  {/if}
                {/if}
              </div>
            </div>

          </div>
        {/each}
      </div>
    {/if}

    <!-- AI Preparation Modal -->
    {#if showPrepModal}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        onclick={() => showPrepModal = false}
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <!-- Modal Card content -->
        <div 
          onclick={(e) => e.stopPropagation()}
          class="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-scale-up"
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
            <div class="flex items-center gap-3">
              <Sparkles class="h-5 w-5 text-indigo-500" />
              <div class="flex items-center gap-2">
                <h3 class="font-extrabold text-base text-slate-850 dark:text-white">{t('ai_prep_guide', currentLanguage)}: {translateCompanyName(prepTargetCompany?.name, currentLanguage)}</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  ⚡ RAG Grounded
                </span>
              </div>
            </div>
            <button onclick={() => showPrepModal = false} class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Body contents -->
          <div class="p-6 overflow-y-auto max-h-[70vh] space-y-4">
            {#if prepLoading}
              <div class="py-16 text-center">
                <Loader class="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
                <p class="text-xs text-slate-450 mt-4">Retrieving company placement archives & generating target interview syllabus via Gemini + RAG...</p>
              </div>
            {:else if prepData}
              {#if prepRagSources && prepRagSources.length > 0}
                <div class="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between text-xs text-left">
                  <div class="space-y-0.5">
                    <span class="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <Sparkles class="h-3.5 w-3.5" />
                      <span>Retrieved Institutional Placement Archive: {prepRagSources[0].title}</span>
                    </span>
                    <p class="text-[10px] text-slate-400">{prepRagSources[0].source}</p>
                  </div>
                  <span class="font-mono text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-lg">
                    {prepRagSources[0].similarityScore}% Match
                  </span>
                </div>
              {/if}

              <div class="markdown leading-relaxed text-xs text-slate-600 dark:text-slate-350 space-y-4 text-left">
                <!-- Direct formatted render of Markdown -->
                {@html prepData
                  .replace(/# (.*)/g, '<h1 class="text-lg font-black text-slate-900 dark:text-white mt-4 pb-2 border-b border-slate-100 dark:border-slate-850">$1</h1>')
                  .replace(/## (.*)/g, '<h2 class="text-sm font-extrabold text-indigo-500 mt-4 mb-2">$1</h2>')
                  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                  .replace(/- (.*)/g, '<div class="pl-3 mt-1.5 flex items-start gap-2"><span>•</span><span>$1</span></div>')
                  .replace(/\n/g, '<br/>')}
              </div>
            {/if}
          </div>

          <!-- Footer controls -->
          <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950/20">
            <button 
              onclick={() => showPrepModal = false}
              class="px-4 py-2 border border-slate-250 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
            >
              {t('close_guide', currentLanguage)}
            </button>
          </div>
        </div>
      </div>
    {/if}

  </div>
{/if}

<style>
  @keyframes scale-up {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  .animate-scale-up {
    animation: scale-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
