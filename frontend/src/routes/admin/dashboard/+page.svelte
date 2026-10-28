<script>
  import { adminService } from '$lib/services/adminService';
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { t, translateCompanyName } from '$lib/utils/translate';
  import { langStore } from '$lib/stores/themeStore';
  import { 
    Users, Building2, Briefcase, TrendingUp, 
    Award, ShieldAlert, Sparkles, Loader, BarChart2,
    Filter, ArrowRight 
  } from '@lucide/svelte';

  let analytics = $state(null);
  let loading = $state(true);
  let currentLanguage = $state('en');

  $effect(() => {
    const unsub = langStore.subscribe(v => currentLanguage = v);
    return () => unsub();
  });

  // Canvas bounds
  let chart1Canvas = $state();
  let chart2Canvas = $state();
  
  let chart1Inst = null;
  let chart2Inst = null;

  async function loadAnalytics() {
    try {
      analytics = await adminService.getDashboardAnalytics();
      loading = false;

      // Draw charts
      setTimeout(() => {
        drawCharts();
      }, 50);
    } catch (e) {
      console.error(e);
    }
  }

  $effect(() => {
    loadAnalytics();
  });

  function drawCharts() {
    if (!analytics) return;

    // Chart 1: Dept-wise placement readiness score average
    if (chart1Canvas) {
      const depts = Object.keys(analytics.deptAverages || {});
      const scores = Object.values(analytics.deptAverages || {});

      if (chart1Inst) chart1Inst.destroy();
      chart1Inst = new Chart(chart1Canvas, {
        type: 'bar',
        data: {
          labels: depts.length > 0 ? depts : ['MCA', 'CSE', 'ECE'],
          datasets: [{
            data: scores.length > 0 ? scores : [78, 80, 72],
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 1,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } } }
        }
      });
    }

    // Chart 2: ATS Score distribution
    if (chart2Canvas) {
      const ranges = Object.keys(analytics.atsRanges || {});
      const counts = Object.values(analytics.atsRanges || {});

      if (chart2Inst) chart2Inst.destroy();
      chart2Inst = new Chart(chart2Canvas, {
        type: 'doughnut',
        data: {
          labels: ranges.length > 0 ? ranges : ['90+', '80-89', '70-79', '60-69', '<60'],
          datasets: [{
            data: counts.length > 0 ? counts : [2, 5, 8, 3, 1],
            backgroundColor: [
              'rgba(16, 185, 129, 0.6)', // 90+ (green)
              'rgba(99, 102, 241, 0.6)', // 80-89 (indigo)
              'rgba(139, 92, 246, 0.6)', // 70-79 (purple)
              'rgba(245, 158, 11, 0.6)', // 60-69 (amber)
              'rgba(239, 68, 68, 0.6)'   // <60 (red)
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } }
          }
        }
      });
    }
  }

  onMount(() => {
    return () => {
      if (chart1Inst) chart1Inst.destroy();
      if (chart2Inst) chart2Inst.destroy();
    };
  });
</script>

<svelte:head>
  <title>Admin Dashboard - CareerReady AI</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 text-left animate-slide-in">
    
    <div class="border-b border-slate-200 dark:border-slate-800 pb-4">
      <h2 class="text-3xl font-extrabold tracking-tight">{t('admin_dashboard', currentLanguage)}</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time institutional metrics, batch-wide readiness scores, and placement stats.</p>
    </div>

    <!-- Quick stats grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- Card: Total Students -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-slate-400 uppercase">{t('enrolled_students', currentLanguage)}</span>
          <h3 class="text-3xl font-black mt-2 text-indigo-650 dark:text-indigo-400">{analytics.totalStudents}</h3>
        </div>
        <div class="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
          <Users class="h-6 w-6" />
        </div>
      </div>

      <!-- Card: Registered Companies -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-slate-400 uppercase">{t('partner_companies', currentLanguage)}</span>
          <h3 class="text-3xl font-black mt-2 text-violet-650 dark:text-violet-400">{analytics.totalCompanies}</h3>
        </div>
        <div class="p-3 bg-violet-500/10 text-violet-500 rounded-2xl">
          <Building2 class="h-6 w-6" />
        </div>
      </div>

      <!-- Card: Placed Count -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-slate-400 uppercase">{t('placed_candidates', currentLanguage)}</span>
          <h3 class="text-3xl font-black mt-2 text-emerald-650 dark:text-emerald-400">{analytics.placedCount}</h3>
        </div>
        <div class="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
          <Briefcase class="h-6 w-6" />
        </div>
      </div>

      <!-- Card: Average Readiness -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-slate-400 uppercase">{t('readiness_index', currentLanguage)}</span>
          <h3 class="text-3xl font-black mt-2 text-amber-650 dark:text-amber-400">{analytics.averageReadiness}%</h3>
        </div>
        <div class="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
          <TrendingUp class="h-6 w-6" />
        </div>
      </div>

    </div>

    <!-- High Impact Institutional Feature Banner -->
    <div class="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-violet-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div class="flex items-start gap-4">
        <div class="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
          <Filter class="h-6 w-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">{t('placement_eligibility_engine_banner', currentLanguage)}</h3>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">NEW</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Filter student cohorts dynamically across CGPA, active arrears, resume ATS compatibility, and mock interview status. Generate instant CSV recruiter exports and printable official College Nominal Rolls.
          </p>
        </div>
      </div>
      <a
        href="/admin/eligibility"
        class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
      >
        <span>{t('launch_eligibility_engine', currentLanguage)}</span>
        <ArrowRight class="h-4 w-4" />
      </a>
    </div>

    <!-- Charts graphs grids -->
    <div class="grid md:grid-cols-2 gap-6">
      
      <!-- Chart 1: Dept distribution -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-80">
        <h3 class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <BarChart2 class="h-4.5 w-4.5 text-indigo-500" />
          <span>{t('avg_readiness_by_dept', currentLanguage)}</span>
        </h3>
        <div class="flex-1 min-h-0 relative">
          <canvas bind:this={chart1Canvas}></canvas>
        </div>
      </div>

      <!-- Chart 2: ATS ranges -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-80">
        <h3 class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <Sparkles class="h-4.5 w-4.5 text-indigo-500" />
          <span>{t('ats_score_ranges', currentLanguage)}</span>
        </h3>
        <div class="flex-1 min-h-0 relative">
          <canvas bind:this={chart2Canvas}></canvas>
        </div>
      </div>

    </div>

    <!-- Placed metrics progress -->
    <div class="bg-indigo-500/[0.02] border border-indigo-500/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-left space-y-1">
        <h4 class="font-extrabold text-sm text-slate-800 dark:text-white">{t('placement_rate_label', currentLanguage)}: {analytics.placementRate}%</h4>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">Calculated as (Placed Students / Total Enrolled Students) * 100.</p>
      </div>
      <div class="w-full sm:w-64 bg-slate-250 dark:bg-slate-850 h-3 rounded-full overflow-hidden shrink-0">
        <div class="bg-indigo-500 h-full rounded-full" style="width: {analytics.placementRate}%"></div>
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
