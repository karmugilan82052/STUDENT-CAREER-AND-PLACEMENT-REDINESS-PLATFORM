<script>
  import { authStore } from '$lib/stores/authStore';
  import { studentService } from '$lib/services/studentService';
  import { adminService } from '$lib/services/adminService';
  import { showToast } from '$lib/stores/toastStore';
  import { t, translateCompanyName } from '$lib/utils/translate';
  import { langStore } from '$lib/stores/themeStore';
  import { 
    Award, ShieldAlert, Cpu, Building2, Calendar, 
    ChevronRight, ArrowUpRight, GraduationCap, Briefcase, FileText, CheckCircle2, AlertCircle
  } from '@lucide/svelte';

  let profile = $state({});
  let loading = $state(true);
  let currentLanguage = $derived($langStore || 'en');
  
  // Placement readiness
  let overallScore = $derived(typeof profile.readinessScore === 'number' ? profile.readinessScore : (profile.readinessScore || 35));
  let deptAverage = $state(72);

  let readinessTier = $derived.by(() => {
    if (overallScore >= 75) {
      return {
        status: 'Status: Excellent',
        colorClass: 'text-emerald-600 dark:text-emerald-400',
        strokeClass: 'stroke-emerald-500'
      };
    } else if (overallScore >= 60) {
      return {
        status: 'Status: Good',
        colorClass: 'text-blue-600 dark:text-blue-400',
        strokeClass: 'stroke-blue-500'
      };
    } else if (overallScore >= 40) {
      return {
        status: 'Status: Average',
        colorClass: 'text-amber-600 dark:text-amber-400',
        strokeClass: 'stroke-amber-500'
      };
    } else {
      return {
        status: 'Status: Needs Improvement',
        colorClass: 'text-rose-600 dark:text-rose-400',
        strokeClass: 'stroke-rose-500'
      };
    }
  });

  // Company and Applications listings
  let eligibleCompanies = $state([]);
  let appliedCompanies = $state([]);
  let upcomingDrives = $state([]);

  // Strengths/Weaknesses derived from profiles
  let strengths = $state(["Strong academic performance (CGPA)", "Core programming fundamentals"]);
  let weaknesses = $state(["Upload primary ATS resume PDF", "Complete simulated technical mock round"]);

  async function loadDashboardData() {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    try {
      const p = await studentService.getProfile(uid);
      if (p) profile = p;

      // Fetch companies and applications
      const allCompanies = await studentService.getCompanies(uid);
      const apps = await studentService.getApplications(uid);

      // Match applications
      appliedCompanies = apps.map(app => {
        const comp = allCompanies.find(c => c.id === app.companyId);
        return {
          id: app.id,
          status: app.status,
          appliedDate: app.appliedDate,
          company: comp || { name: "Unknown Company" }
        };
      });

      // Filter eligible companies based on CGPA and department
      eligibleCompanies = allCompanies.filter(c => {
        if (p.cgpa < (c.eligibility?.minCgpa || 0)) return false;
        if (c.eligibility?.departments && c.eligibility.departments.length > 0) {
          if (!c.eligibility.departments.includes(p.department)) return false;
        }
        const hasApplied = apps.some(a => a.companyId === c.id);
        return !hasApplied;
      });

      // Filter upcoming drives
      upcomingDrives = allCompanies.filter(c => {
        const driveDate = new Date(c.driveDate);
        const today = new Date();
        return (driveDate - today) > 0;
      }).sort((a,b) => new Date(a.driveDate) - new Date(b.driveDate));

      const stats = await adminService.getDashboardAnalytics();
      if (stats && stats.deptAverages) {
        deptAverage = stats.deptAverages[p.department] || stats.averageReadiness || 72;
      }

      compileStrengthsWeaknesses(p);

    } catch (err) {
      console.error(err);
      showToast("Error loading dashboard data", "error");
    } finally {
      loading = false;
    }
  }

  function compileStrengthsWeaknesses(prof) {
    const s = [];
    const w = [];

    if (prof.cgpa >= 8.5) {
      s.push(`High academic Standing (CGPA: ${prof.cgpa})`);
    } else if (prof.cgpa < 7.0) {
      w.push(`Below target academic threshold (CGPA: ${prof.cgpa})`);
    } else {
      s.push(`Eligible academic score (CGPA: ${prof.cgpa})`);
    }

    studentService.getProjects(prof.uid).then(projs => {
      if (projs.length >= 2) {
        s.push(`Verified portfolio exposure (${projs.length} projects)`);
      } else {
        w.push("Add at least 2 technical projects to portfolio");
      }
    });

    studentService.getResumes(prof.uid).then(res => {
      const primary = res.find(r => r.isPrimary);
      if (primary) {
        s.push("Active primary PDF resume uploaded");
      } else {
        w.push("Primary ATS PDF resume missing");
      }
    });

    strengths = s;
    weaknesses = w;
  }

  let loadedUid = $state(null);
  $effect(() => {
    const uid = $authStore.user?.uid;
    if (uid && loadedUid !== uid) {
      loadedUid = uid;
      loadDashboardData();
    }
  });

  async function handleApply(companyId) {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    try {
      await studentService.applyToCompany(uid, companyId);
      showToast("Application submitted successfully!", "success");
      await loadDashboardData();
    } catch (e) {
      showToast("Application submission failed", "error");
    }
  }

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = $derived(circumference - (overallScore / 100) * circumference);
</script>

<svelte:head>
  <title>Student Dashboard — CareerReady</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="h-8 w-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 text-left">
    
    <!-- Candidate Overview Header Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
            {t('welcome_back', currentLanguage)}, {profile.name || 'Candidate'}
          </h2>
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            {t('active_candidate', currentLanguage)}
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {profile.department || 'Computer Science'} Candidate • {t('reg_no', currentLanguage)}: <span class="font-mono text-slate-700 dark:text-slate-300 font-semibold">{profile.registerNo || '2026-CS-042'}</span>
        </p>
      </div>

      <div class="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
        <div class="text-right">
          <span class="text-xs font-bold text-slate-400 block uppercase tracking-wider">{t('current_cgpa', currentLanguage)}</span>
          <span class="text-xl font-extrabold text-slate-900 dark:text-white">{profile.cgpa || '8.4'} / 10.0</span>
        </div>
        <div class="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
        <a 
          href="/resume" 
          class="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <FileText class="h-3.5 w-3.5 text-emerald-400" />
          <span>{t('audit_ats_resume', currentLanguage)}</span>
        </a>
      </div>
    </div>

    <!-- Analytics Dashboard Metrics -->
    <div class="grid lg:grid-cols-3 gap-6">
      
      <!-- Placement Readiness Gauge -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">{t('readiness_score', currentLanguage)}</h3>
          <span class="text-xs font-bold {readinessTier.colorClass}">{t(readinessTier.status, currentLanguage)}</span>
        </div>
        
        <div class="relative w-36 h-36 mx-auto my-6 flex items-center justify-center">
          <svg class="w-full h-full -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="54" class="stroke-slate-100 dark:stroke-slate-800 fill-none" stroke-width="8"></circle>
            <circle 
              cx="72" 
              cy="72" 
              r="54" 
              class="{readinessTier.strokeClass} fill-none transition-all duration-500 ease-out" 
              stroke-width="8"
              stroke-dasharray={circumference}
              stroke-dashoffset={strokeDashoffset}
              stroke-linecap="round"
            ></circle>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
            <span class="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">{overallScore}%</span>
            <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mt-1.5">{t('eligibility_fit', currentLanguage)}</span>
          </div>
        </div>

        <div class="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
          <div class="flex justify-between items-center">
            <span class="text-slate-500 dark:text-slate-400">{t('your_placement_score', currentLanguage)}</span>
            <span class="font-bold text-sm {readinessTier.colorClass}">{overallScore}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 dark:text-slate-400">{t('department_benchmark_avg', currentLanguage)}</span>
            <span class="font-semibold text-sm text-slate-700 dark:text-slate-300">{deptAverage}%</span>
          </div>
        </div>
      </div>

      <!-- Strengths & Priority Fixes -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          {t('ai_placement_intelligence', currentLanguage)}
        </h3>
        
        <div class="grid sm:grid-cols-2 gap-6">
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 class="h-4 w-4" />
              <span>{t('key_candidate_strengths', currentLanguage)}</span>
            </h4>
            <div class="space-y-2">
              {#each strengths as str}
                <div class="text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium">
                  {t(str, currentLanguage)}
                </div>
              {/each}
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle class="h-4 w-4" />
              <span>{t('priority_improvement_areas', currentLanguage)}</span>
            </h4>
            <div class="space-y-2">
              {#each weaknesses as weak}
                <div class="text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium">
                  {t(weak, currentLanguage)}
                </div>
              {/each}
            </div>
          </div>
        </div>

        <div class="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          Evaluated against active recruiters: TCS Ninja, Accenture ASE, Infosys Specialist, Amazon SDE.
        </div>
      </div>

    </div>

    <!-- Company Drives Grid -->
    <div class="grid lg:grid-cols-3 gap-6">
      
      <!-- Eligible Campus Placement Drives -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase class="h-4 w-4 text-emerald-500" />
            <span>{t('eligible_recruitment_drives', currentLanguage)}</span>
          </h3>
          <span class="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{eligibleCompanies.length} {t('companies', currentLanguage)}</span>
        </div>

        {#if eligibleCompanies.length === 0}
          <p class="text-xs text-slate-400 italic py-8 text-center">{t('No new eligible company drives currently available.', currentLanguage)}</p>
        {:else}
          <div class="space-y-3">
            {#each eligibleCompanies as comp}
              <div class="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm">
                    {comp.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-slate-900 dark:text-white">{translateCompanyName(comp.name, currentLanguage)}</h4>
                    <p class="text-xs text-slate-500 mt-0.5">{comp.location} • {t('annual_package', currentLanguage)}: <strong class="text-emerald-600 dark:text-emerald-400">{comp.package} LPA</strong></p>
                  </div>
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <a 
                    href="/companies"
                    class="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-bold transition-all"
                  >
                    {t('view_details', currentLanguage)}
                  </a>
                  <button 
                    onclick={() => handleApply(comp.id)}
                    class="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {t('apply_now', currentLanguage)}
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Right Side Column: Submissions & Dates -->
      <div class="space-y-6">
        
        <!-- Application Status -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            {t('applied_applications', currentLanguage)}
          </h3>
          
          {#if appliedCompanies.length === 0}
            <p class="text-xs text-slate-400 italic py-4">{t('No drive applications submitted yet.', currentLanguage)}</p>
          {:else}
            <div class="space-y-2.5">
              {#each appliedCompanies as app}
                <div class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <span class="font-bold text-xs text-slate-900 dark:text-white block">{translateCompanyName(app.company?.name, currentLanguage)}</span>
                    <span class="text-[10px] text-slate-400">{t('applied', currentLanguage)}: {new Date(app.appliedDate).toLocaleDateString()}</span>
                  </div>
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                    {app.status === 'Applied' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                     app.status === 'Shortlisted' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                     app.status === 'Placed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                     'bg-rose-500/10 text-rose-500 border border-rose-500/20'}">
                    {t(app.status, currentLanguage)}
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Upcoming Drive Schedule -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            {t('upcoming_campus_drives', currentLanguage)}
          </h3>
          
          {#if upcomingDrives.length === 0}
            <p class="text-xs text-slate-400 italic py-4">{t('No scheduled drive dates.', currentLanguage)}</p>
          {:else}
            <div class="space-y-2.5">
              {#each upcomingDrives.slice(0, 3) as drive}
                <div class="p-3 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-3">
                  <div class="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                    <Calendar class="h-4 w-4" />
                  </div>
                  <div>
                    <span class="font-bold text-xs text-slate-900 dark:text-white block">{translateCompanyName(drive.name, currentLanguage)}</span>
                    <span class="text-[10px] text-slate-400">{t('drive_date', currentLanguage)}: {new Date(drive.driveDate).toLocaleDateString()}</span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

      </div>

    </div>

  </div>
{/if}
