<script>
  import { authStore } from '$lib/stores/authStore';
  import { studentService } from '$lib/services/studentService';
  import { aiService } from '$lib/services/aiService';
  import { showToast } from '$lib/stores/toastStore';
  import { t } from '$lib/utils/translate';
  import { langStore } from '$lib/stores/themeStore';
  import { 
    Award, Plus, Trash2, Cpu, Database, Cloud, 
    Sparkles, BookOpen, BrainCircuit, Loader, ChevronRight 
  } from '@lucide/svelte';

  let skills = $state({ categories: { programming: [], database: [], cloud: [], ai: [], softSkills: [] } });
  let loading = $state(true);
  let currentLanguage = $derived($langStore || 'en');
  
  // Form states
  let skillName = $state('');
  let rating = $state(70);
  let category = $state('programming');
  let saving = $state(false);

  // AI Gap states
  let gapLoading = $state(false);
  let gapAnalysis = $state(null);

  async function loadSavedGapAnalysis(uid) {
    try {
      let recs = null;
      if (typeof window !== 'undefined') {
        const dbRecs = JSON.parse(localStorage.getItem('cs_recommendations') || '{}');
        recs = dbRecs[uid] || null;
      }
      if (recs) {
        gapAnalysis = {
          roadmap: recs.roadmap || [],
          missing: recs.projects?.[0]?.tech || ["Cloud Functions", "Tailwind CSS", "Unit Testing"],
          recommendation: recs.monthlyGoal || "Complete frameworks architectures and practice 2 portfolio deployments."
        };
      }
    } catch (e) {
      console.warn("Could not load saved gap analysis:", e);
    }
  }

  let loadedUid = $state(null);
  $effect(() => {
    const uid = $authStore.user?.uid;
    if (uid && loadedUid !== uid) {
      loadedUid = uid;
      studentService.getSkills(uid).then(s => {
        if (s && s.categories) {
          skills = s;
        }
        loading = false;
      });
      loadSavedGapAnalysis(uid);
    }
  });

  const categoryDetails = {
    programming: { label: "Programming", icon: Cpu, color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5", progressColor: "bg-indigo-500" },
    database: { label: "Database", icon: Database, color: "text-violet-400 border-violet-500/20 bg-violet-500/5", progressColor: "bg-violet-500" },
    cloud: { label: "Cloud Computing", icon: Cloud, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", progressColor: "bg-emerald-500" },
    ai: { label: "AI & ML", icon: Sparkles, color: "text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5", progressColor: "bg-fuchsia-500" },
    softSkills: { label: "Soft Skills", icon: BrainCircuit, color: "text-amber-400 border-amber-500/20 bg-amber-500/5", progressColor: "bg-amber-500" }
  };

  async function handleAddSkill(e) {
    e.preventDefault();
    if (!skillName.trim()) {
      showToast("Please enter a skill name", "error");
      return;
    }

    const uid = $authStore.user?.uid;
    if (!uid) return;

    saving = true;
    try {
      const copy = JSON.parse(JSON.stringify(skills.categories));
      
      // Check if skill already exists in this category
      const exists = copy[category].find(s => s.name.toLowerCase() === skillName.trim().toLowerCase());
      if (exists) {
        exists.rating = parseInt(rating);
      } else {
        copy[category].push({ name: skillName.trim(), rating: parseInt(rating) });
      }

      const res = await studentService.saveSkills(uid, copy);
      skills = res;
      skillName = '';
      rating = 70;
      showToast("Skill added successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to save skill", "error");
    } finally {
      saving = false;
    }
  }

  async function handleDeleteSkill(cat, name) {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    try {
      const copy = JSON.parse(JSON.stringify(skills.categories));
      copy[cat] = copy[cat].filter(s => s.name !== name);
      const res = await studentService.saveSkills(uid, copy);
      skills = res;
      showToast("Skill removed", "success");
    } catch (err) {
      showToast("Failed to remove skill", "error");
    }
  }

  async function runGapAnalysis() {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    gapLoading = true;
    gapAnalysis = null;
    try {
      // We will trigger a learning recommendations call since it has prompt engineering 
      // targeting skill gap analytics.
      const recs = await aiService.generateLearningRecommendations(uid);
      
      // Extract gaps dynamically
      gapAnalysis = {
        roadmap: recs.roadmap || [],
        missing: recs.projects?.[0]?.tech || ["Cloud Functions", "Tailwind CSS", "Unit Testing"],
        recommendation: recs.monthlyGoal || "Complete frameworks architectures and practice 2 portfolio deployments."
      };
      showToast("Skill Gap Analysis Complete!", "success");
    } catch (err) {
      showToast("Failed to generate AI analysis", "error");
    } finally {
      gapLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Skills Profile - CareerReady AI</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6">
    
    <!-- Top info row -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
      <div class="text-left">
        <h2 class="text-3xl font-extrabold tracking-tight">{t('skills', currentLanguage)}</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('skills_desc', currentLanguage)}</p>
      </div>

      <button 
        onclick={runGapAnalysis}
        disabled={gapLoading}
        class="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-650 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer disabled:opacity-50"
      >
        {#if gapLoading}
          <Loader class="h-4 w-4 animate-spin" />
          <span>{t('analyzing_gaps', currentLanguage)}</span>
        {:else}
          <Sparkles class="h-4 w-4" />
          <span>{t('ai_skill_gap_analysis', currentLanguage)}</span>
        {/if}
      </button>
    </div>

    <!-- AI Output Box -->
    {#if gapAnalysis}
      <div class="bg-indigo-500/[0.03] border border-indigo-500/20 rounded-3xl p-6 text-left animate-slide-in space-y-4">
        <h3 class="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
          <Sparkles class="h-4 w-4" />
          <span>{t('ai_gap_report', currentLanguage)}</span>
        </h3>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-400 uppercase">{t('suggested_tech_priorities', currentLanguage)}</h4>
            <div class="flex flex-wrap gap-2">
              {#each gapAnalysis.missing as tech}
                <span class="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-semibold">
                  {tech}
                </span>
              {/each}
            </div>
            <p class="text-xs text-slate-400 leading-relaxed mt-2">
              <strong>{t('monthly_roadmap_action', currentLanguage)}:</strong> {t(gapAnalysis.recommendation, currentLanguage)}
            </p>
          </div>

          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-400 uppercase">{t('personalized_learning_roadmap', currentLanguage)}</h4>
            <div class="space-y-2 max-h-48 overflow-y-auto pr-2">
              {#each gapAnalysis.roadmap as step}
                <div class="flex items-start gap-3 bg-slate-900/30 border border-slate-850 p-3 rounded-xl">
                  <div class="px-2 py-0.5 bg-indigo-500/10 text-[9px] text-indigo-400 font-bold rounded mt-0.5 shrink-0">{t(step.duration, currentLanguage)}</div>
                  <div>
                    <h5 class="text-xs font-bold text-slate-200">{t(step.title, currentLanguage)}</h5>
                    <p class="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{t(step.desc, currentLanguage)}</p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Main skills grid -->
    <div class="grid md:grid-cols-3 gap-6">
      
      <!-- Skill Input Form (Left column) -->
      <div class="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-left h-fit space-y-6">
        <h3 class="text-lg font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
          <Plus class="h-5 w-5 text-indigo-500" />
          <span>{t('add_update_skill', currentLanguage)}</span>
        </h3>

        <form onsubmit={handleAddSkill} class="space-y-4">
          <div class="space-y-1">
            <label for="s-cat" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('skill_category', currentLanguage)}</label>
            <select id="s-cat" bind:value={category} class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
              {#each Object.entries(categoryDetails) as [key, val]}
                <option value={key}>{t(val.label, currentLanguage)}</option>
              {/each}
            </select>
          </div>

          <div class="space-y-1">
            <label for="s-name" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('skill_name', currentLanguage)}</label>
            <input 
              type="text" 
              id="s-name" 
              bind:value={skillName} 
              placeholder="e.g. SvelteKit, Java, Docker" 
              required 
              class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" 
            />
          </div>

          <div class="space-y-2">
            <div class="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{t('proficiency_rating', currentLanguage)}</span>
              <span class="text-indigo-650 dark:text-indigo-400 text-xs">{rating}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              step="5"
              bind:value={rating} 
              class="w-full accent-indigo-500 cursor-pointer" 
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            class="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            {#if saving}
              <Loader class="h-4 w-4 animate-spin" />
              <span>{t('saving', currentLanguage)}</span>
            {:else}
              <Plus class="h-4 w-4" />
              <span>{t('save', currentLanguage)}</span>
            {/if}
          </button>
        </form>
      </div>

      <!-- Skill Lists (Right 2 columns) -->
      <div class="md:col-span-2 space-y-6">
        
        {#each Object.entries(categoryDetails) as [key, val]}
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-left">
            <h4 class="text-sm font-bold tracking-widest uppercase flex items-center gap-2 mb-4">
              <span class="p-2 border rounded-xl {val.color} shrink-0">
                <val.icon class="h-4 w-4" />
              </span>
              <span>{val.label}</span>
            </h4>

            {#if !skills.categories[key] || skills.categories[key].length === 0}
              <p class="text-xs text-slate-450 py-4 italic">No skills listed under this category.</p>
            {:else}
              <div class="grid gap-4 sm:grid-cols-2">
                {#each skills.categories[key] as item}
                  <div class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between gap-4">
                    <div class="flex-1 space-y-2">
                      <div class="flex justify-between items-center text-xs font-bold">
                        <span>{item.name}</span>
                        <span class="text-[10px] text-slate-400">{item.rating}%</span>
                      </div>
                      <div class="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div class="h-full rounded-full {val.progressColor}" style="width: {item.rating}%"></div>
                      </div>
                    </div>
                    <button 
                      onclick={() => handleDeleteSkill(key, item.name)}
                      class="p-2 border border-slate-200 dark:border-slate-850 text-slate-400 hover:text-rose-500 hover:border-rose-500/20 hover:bg-rose-500/5 rounded-lg transition-colors shrink-0"
                      title="Delete Skill"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}

      </div>

    </div>

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
