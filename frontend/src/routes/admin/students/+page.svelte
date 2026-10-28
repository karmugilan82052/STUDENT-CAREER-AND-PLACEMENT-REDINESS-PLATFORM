<script>
  import { adminService } from '$lib/services/adminService';
  import { showToast } from '$lib/stores/toastStore';
  import { t, translateCompanyName } from '$lib/utils/translate';
  import { langStore } from '$lib/stores/themeStore';
  import { 
    Users, Search, Eye, X, GraduationCap, Award, 
    Calendar, Link2, FileText, Cpu, Database, Cloud, Sparkles, Filter 
  } from '@lucide/svelte';
  import Avatar from '$lib/components/common/Avatar.svelte';

  let students = $state([]);
  let loading = $state(true);
  let searchQuery = $state('');
  let currentLanguage = $state('en');

  $effect(() => {
    const unsub = langStore.subscribe(v => currentLanguage = v);
    return () => unsub();
  });

  // Student details modal state
  let selectedStudentId = $state(null);
  let studentDetails = $state(null);
  let detailsLoading = $state(false);
  let showDetailsModal = $state(false);

  async function loadStudents() {
    try {
      students = await adminService.getAllStudents();
    } catch (e) {
      showToast("Error loading students", "error");
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    loadStudents();
  });

  const filteredStudents = $derived.by(() => {
    let result = [...students];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.registerNumber.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }
    return result;
  });

  async function handleViewDetails(studentId) {
    selectedStudentId = studentId;
    showDetailsModal = true;
    detailsLoading = true;
    studentDetails = null;

    try {
      studentDetails = await adminService.getStudentDetails(studentId);
    } catch (err) {
      showToast("Error loading details", "error");
      showDetailsModal = false;
    } finally {
      detailsLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Manage Students - CareerReady AI</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 text-left animate-slide-in">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tight">{t('manage_students', currentLanguage)}</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('manage_students_desc', currentLanguage)}</p>
      </div>
      <a
        href="/admin/eligibility"
        class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
      >
        <Filter class="h-4 w-4" />
        <span>{t('eligibility_filter_export', currentLanguage)}</span>
      </a>
    </div>

    <!-- Search box -->
    <div class="relative w-full max-w-md">
      <Search class="absolute left-3 top-3 h-4.5 w-4.5 text-slate-450 pointer-events-none" />
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder={t('search_students_placeholder', currentLanguage)}
        class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-850 dark:text-white placeholder-slate-450 focus:outline-none focus:border-indigo-500 transition-colors"
      />
    </div>

    <!-- Directory list -->
    {#if filteredStudents.length === 0}
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-450 text-xs italic">
        {t('no_students_found', currentLanguage)}
      </div>
    {:else}
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold bg-slate-50/50 dark:bg-slate-950/20">
                <th class="p-4">{t('th_name_reg', currentLanguage)}</th>
                <th class="p-4">{t('th_dept_year', currentLanguage)}</th>
                <th class="p-4 text-center">{t('cgpa', currentLanguage)}</th>
                <th class="p-4 text-center">{t('th_readiness', currentLanguage)}</th>
                <th class="p-4 text-center">{t('actions', currentLanguage)}</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredStudents as student}
                <tr class="border-b border-slate-200 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <Avatar src={student.profilePhotoUrl} name={student.name} size="sm" rounded="rounded-xl" />
                      <div>
                        <span class="font-bold text-slate-850 dark:text-white block">{student.name}</span>
                        <span class="text-[10px] text-slate-450 block mt-0.5">{student.registerNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td class="p-4">
                    <span class="font-semibold block text-slate-700 dark:text-slate-350">{student.department}</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">Year {student.year} Candidate</span>
                  </td>
                  <td class="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {student.cgpa}
                  </td>
                  <td class="p-4 text-center">
                    <span class="inline-block text-[10px] font-extrabold bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-xl">
                      {student.readinessScore || 35}%
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <button 
                      onclick={() => handleViewDetails(student.uid)}
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-slate-500 hover:text-indigo-500 rounded-xl font-bold transition-all cursor-pointer"
                    >
                      <Eye class="h-3.5 w-3.5" />
                      <span>{t('profile_detail', currentLanguage)}</span>
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    <!-- Student Detail Modal Overlay -->
    {#if showDetailsModal}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        onclick={() => showDetailsModal = false}
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div 
          onclick={(e) => e.stopPropagation()}
          class="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up"
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
            <h3 class="font-extrabold text-base text-slate-850 dark:text-white">{t('student_candidate_profile', currentLanguage)}</h3>
            <button onclick={() => showDetailsModal = false} class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto max-h-[75vh] space-y-6 text-left">
            {#if detailsLoading}
              <div class="py-16 text-center">
                <Loader class="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
                <p class="text-xs text-slate-450 mt-4">{t('retrieving_student_files', currentLanguage)}</p>
              </div>
            {:else if studentDetails}
              {@const p = studentDetails.profile}
              
              <!-- Core details row -->
              <div class="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl">
                <Avatar src={p.profilePhotoUrl} name={p.name} size="xl" rounded="rounded-2xl" />
                <div class="flex-1 space-y-1.5 text-center sm:text-left">
                  <h4 class="text-xl font-extrabold text-slate-850 dark:text-white">{p.name}</h4>
                  <div class="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span class="flex items-center gap-1"><GraduationCap class="h-4 w-4" /> {p.department} (Year {p.year})</span>
                    <span class="flex items-center gap-1"><Award class="h-4 w-4" /> {t('cgpa', currentLanguage)}: {p.cgpa}</span>
                    <span class="flex items-center gap-1"><Calendar class="h-4 w-4" /> {t('reg_no', currentLanguage)}: {p.registerNumber}</span>
                  </div>
                  <div class="flex justify-center sm:justify-start gap-3 mt-3 text-xs">
                    {#if p.links?.linkedin}
                      <a href={p.links.linkedin} target="_blank" class="text-indigo-400 hover:underline">LinkedIn</a>
                    {/if}
                    {#if p.links?.github}
                      <a href={p.links.github} target="_blank" class="text-indigo-400 hover:underline">GitHub</a>
                    {/if}
                    {#if p.links?.portfolio}
                      <a href={p.links.portfolio} target="_blank" class="text-indigo-400 hover:underline">Portfolio</a>
                    {/if}
                  </div>
                </div>

                <div class="px-5 py-3 bg-indigo-500/10 rounded-2xl text-center shrink-0">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('readiness', currentLanguage)}</span>
                  <span class="text-2xl font-black text-indigo-500 block mt-1">{p.readinessScore || 35}%</span>
                </div>
              </div>

              <!-- Skills categories lists -->
              <div class="space-y-3">
                <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400">{t('technical_skills_index', currentLanguage)}</h5>
                <div class="grid gap-3 sm:grid-cols-2">
                  {#each Object.entries(studentDetails.skills?.categories || {}) as [catKey, catVal]}
                    {#if catVal.length > 0}
                      <div class="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850 rounded-xl">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">{catKey}</span>
                        <div class="flex flex-wrap gap-1.5">
                          {#each catVal as skill}
                            <span class="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-lg font-semibold">{skill.name} ({skill.rating}%)</span>
                          {/each}
                        </div>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>

              <!-- Projects & certifications list -->
              <div class="grid md:grid-cols-2 gap-6">
                
                <!-- Projects -->
                <div class="space-y-3">
                  <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400">Student Portfolio Projects</h5>
                  {#if studentDetails.projects?.length === 0}
                    <p class="text-xs text-slate-450 italic py-4">No projects listed.</p>
                  {:else}
                    <div class="space-y-3">
                      {#each studentDetails.projects as proj}
                        <div class="p-3 border border-slate-200 dark:border-slate-850 rounded-xl">
                          <h6 class="text-xs font-bold text-slate-800 dark:text-slate-250">{proj.title}</h6>
                          <p class="text-[10px] text-slate-500 mt-1 leading-relaxed">{proj.description}</p>
                          <div class="flex flex-wrap gap-1 mt-2">
                            {#each proj.technologies as tech}
                              <span class="text-[8px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-950 rounded text-slate-450">{tech}</span>
                            {/each}
                          </div>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>

                <!-- Certifications -->
                <div class="space-y-3">
                  <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400">Student Certifications</h5>
                  {#if studentDetails.certs?.length === 0}
                    <p class="text-xs text-slate-450 italic py-4">No certifications listed.</p>
                  {:else}
                    <div class="space-y-3">
                      {#each studentDetails.certs as cert}
                        <div class="p-3 border border-slate-200 dark:border-slate-850 rounded-xl">
                          <h6 class="text-xs font-bold text-slate-800 dark:text-slate-250">{cert.name}</h6>
                          <p class="text-[10px] text-slate-500 mt-1">Issuer: {cert.issuer} | Date: {cert.issueDate}</p>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>

              </div>

            {/if}
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950/20">
            <button onclick={() => showDetailsModal = false} class="px-4 py-2 border border-slate-250 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 text-xs font-bold rounded-xl cursor-pointer">
              Close Profile
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
