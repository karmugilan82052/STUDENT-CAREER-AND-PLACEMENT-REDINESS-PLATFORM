<script>
  import { authStore } from '$lib/stores/authStore';
  import { studentService } from '$lib/services/studentService';
  import { onMount, tick } from 'svelte';
  import Chart from 'chart.js/auto';
  import { t } from '$lib/utils/translate';
  import { langStore } from '$lib/stores/themeStore';
  import { 
    TrendingUp, BarChart2, ShieldCheck, Award, Sparkles, RefreshCw 
  } from '@lucide/svelte';

  let loading = $state(true);
  let refreshing = $state(false);
  let currentLanguage = $derived($langStore || 'en');
  
  // Canvas bounds
  let chart1Canvas = $state(null);
  let chart2Canvas = $state(null);
  let chart3Canvas = $state(null);
  let chart4Canvas = $state(null);

  // Instances
  let chart1Inst = null;
  let chart2Inst = null;
  let chart3Inst = null;
  let chart4Inst = null;

  async function fetchInterviewsList(uid) {
    if (import.meta.env.VITE_FIREBASE_API_KEY === "mock-api-key-for-development-only" || !import.meta.env.VITE_FIREBASE_API_KEY) {
      const stored = JSON.parse(localStorage.getItem('cs_interviews') || '[]');
      return stored.filter(i => i.studentId === uid && i.status === 'Completed');
    } else {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('$lib/firebase/firebaseClient');
      const snap = await getDocs(query(collection(db, 'interviews'), where('studentId', '==', uid), where('status', '==', 'Completed')));
      return snap.docs.map(d => d.data());
    }
  }

  async function loadReportCharts() {
    const userState = $authStore;
    const uid = userState.user?.uid;
    
    // If auth is still loading, wait
    if (userState.loading) return;
    
    if (!uid) {
      loading = false;
      return;
    }

    try {
      // Parallel fetch for speed
      const [resumes, skillsObj, interviewsList] = await Promise.all([
        studentService.getResumes(uid).catch(() => []),
        studentService.getSkills(uid).catch(() => ({ categories: { programming: [], database: [], cloud: [], ai: [], softSkills: [] } })),
        fetchInterviewsList(uid).catch(() => [])
      ]);

      // Hide loading spinner first so canvases enter DOM
      loading = false;
      await tick();

      // Render charts
      await Promise.all([
        drawResumeChart(resumes),
        drawSkillsChart(skillsObj),
        drawInterviewsChart(interviewsList),
        drawReadinessChart(resumes, skillsObj, interviewsList)
      ]);

    } catch (e) {
      console.error("Reports loading error:", e);
    } finally {
      loading = false;
      refreshing = false;
    }
  }

  let loadedUid = $state(null);
  $effect(() => {
    const userState = $authStore;
    const uid = userState.user?.uid;
    if (!userState.loading && uid && loadedUid !== uid) {
      loadedUid = uid;
      loadReportCharts();
    }
  });

  async function handleRefresh() {
    refreshing = true;
    await loadReportCharts();
  }

  async function drawResumeChart(resumes) {
    if (!chart1Canvas) return;
    const sorted = [...resumes].sort((a,b) => new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0));
    const labels = sorted.map((r, i) => `V${i+1}`);
    
    const analyses = await Promise.all(
      sorted.map(r => studentService.getResumeAnalysis(r.id).catch(() => null))
    );
    const data = analyses.map(analysis => analysis ? (analysis.atsScore || 75) : 70);

    if (labels.length === 0) {
      labels.push('V1 (Baseline)');
      data.push(72);
    }

    if (chart1Inst) {
      chart1Inst.destroy();
      chart1Inst = null;
    }

    chart1Inst = new Chart(chart1Canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'ATS Score',
          data,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `ATS Score: ${ctx.parsed.y}%`
            }
          }
        },
        scales: { 
          y: { 
            min: 40, 
            max: 100,
            grid: { color: 'rgba(148, 163, 184, 0.15)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  function drawSkillsChart(skillsObj) {
    if (!chart2Canvas) return;
    const labels = ['Programming', 'Database', 'Cloud', 'AI/ML', 'Soft Skills'];
    const data = [65, 60, 55, 50, 75]; // default baseline
    
    if (skillsObj && skillsObj.categories) {
      const cats = skillsObj.categories;
      const keys = ['programming', 'database', 'cloud', 'ai', 'softSkills'];
      keys.forEach((k, i) => {
        const arr = cats[k] || [];
        if (arr.length > 0) {
          const sum = arr.reduce((a,b) => a + (b.rating || 50), 0);
          data[i] = Math.round(sum / arr.length);
        }
      });
    }

    if (chart2Inst) {
      chart2Inst.destroy();
      chart2Inst = null;
    }

    chart2Inst = new Chart(chart2Canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          borderRadius: 8,
          backgroundColor: [
            'rgba(16, 185, 129, 0.75)',
            'rgba(59, 130, 246, 0.75)',
            'rgba(139, 92, 246, 0.75)',
            'rgba(236, 72, 153, 0.75)',
            'rgba(245, 158, 11, 0.75)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        plugins: { legend: { display: false } },
        scales: { 
          y: { 
            min: 0, 
            max: 100,
            grid: { color: 'rgba(148, 163, 184, 0.15)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  function drawInterviewsChart(interviews) {
    if (!chart3Canvas) return;
    const sorted = [...interviews].sort((a,b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    let labels = sorted.map((item, idx) => `Mock ${idx+1}`);
    let data = sorted.map(item => item.evaluation?.score || 65);

    if (labels.length === 0) {
      labels = ['Mock 1', 'Mock 2'];
      data = [68, 75];
    }

    if (chart3Inst) {
      chart3Inst.destroy();
      chart3Inst = null;
    }

    chart3Inst = new Chart(chart3Canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Performance Score',
          data,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        plugins: { legend: { display: false } },
        scales: { 
          y: { 
            min: 40, 
            max: 100,
            grid: { color: 'rgba(148, 163, 184, 0.15)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  async function drawReadinessChart(resumes, skillsObj, interviews) {
    if (!chart4Canvas) return;
    
    const labels = ['CGPA Factor', 'ATS Resume', 'Skills Matrix', 'Core Projects', 'Certifications', 'Mocks Mastery'];
    
    // Calculate values
    const profileCgpa = $authStore.profile?.cgpa || 7.8;
    const cgpaVal = Math.min(100, Math.round(profileCgpa * 10));
    
    let resumeVal = 72;
    const primary = resumes.find(r => r.isPrimary) || resumes[0];
    if (primary) {
      try {
        const primaryAnalysis = await studentService.getResumeAnalysis(primary.id);
        if (primaryAnalysis) resumeVal = primaryAnalysis.atsScore || 78;
      } catch {}
    }

    let skillsVal = 60;
    if (skillsObj && skillsObj.categories) {
      let count = 0;
      Object.values(skillsObj.categories).forEach(arr => count += (Array.isArray(arr) ? arr.length : 0));
      skillsVal = Math.min(100, Math.max(45, count * 10));
    }

    const interviewScore = interviews.length > 0 
      ? Math.round(interviews.reduce((a,b) => a + (b.evaluation?.score || 60), 0) / interviews.length)
      : 70;

    const data = [
      cgpaVal,
      resumeVal,
      skillsVal,
      75, // projects benchmark
      65, // certs benchmark
      interviewScore
    ];

    if (chart4Inst) {
      chart4Inst.destroy();
      chart4Inst = null;
    }

    chart4Inst = new Chart(chart4Canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Student Readiness Index',
          data,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(16, 185, 129)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: { color: 'rgba(148, 163, 184, 0.2)' },
            angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
            pointLabels: {
              font: { size: 11, weight: '600' }
            }
          }
        }
      }
    });
  }

  onMount(() => {
    return () => {
      if (chart1Inst) chart1Inst.destroy();
      if (chart2Inst) chart2Inst.destroy();
      if (chart3Inst) chart3Inst.destroy();
      if (chart4Inst) chart4Inst.destroy();
    };
  });
</script>

<svelte:head>
  <title>Reports — CareerReady AI</title>
</svelte:head>

{#if loading}
  <div class="flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <div class="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    <span class="text-xs font-semibold text-slate-500 animate-pulse">Loading Analytics Data...</span>
  </div>
{:else}
  <div class="space-y-6 text-left">
    
    <div class="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t('reports', currentLanguage)}</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('reports_desc', currentLanguage)}</p>
      </div>
      <button 
        onclick={handleRefresh}
        disabled={refreshing}
        class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer disabled:opacity-60"
      >
        <RefreshCw class="h-3.5 w-3.5 {refreshing ? 'animate-spin' : ''}" />
        <span>{refreshing ? t('refreshing', currentLanguage) : t('refresh_charts', currentLanguage)}</span>
      </button>
    </div>

    <!-- Charts grids -->
    <div class="grid md:grid-cols-2 gap-6">
      
      <!-- Chart 1: Resume Trend -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col h-84">
        <h3 class="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <TrendingUp class="h-4 w-4 text-emerald-600" />
          <span>{t('chart_resume_trend', currentLanguage)}</span>
        </h3>
        <div class="flex-1 min-h-0 relative">
          <canvas bind:this={chart1Canvas}></canvas>
        </div>
      </div>

      <!-- Chart 2: Skills Growth -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col h-84">
        <h3 class="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <BarChart2 class="h-4 w-4 text-blue-600" />
          <span>{t('chart_skills_growth', currentLanguage)}</span>
        </h3>
        <div class="flex-1 min-h-0 relative">
          <canvas bind:this={chart2Canvas}></canvas>
        </div>
      </div>

      <!-- Chart 3: Mock Interview Trends -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col h-84">
        <h3 class="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <ShieldCheck class="h-4 w-4 text-indigo-600" />
          <span>{t('chart_mock_trend', currentLanguage)}</span>
        </h3>
        <div class="flex-1 min-h-0 relative">
          <canvas bind:this={chart3Canvas}></canvas>
        </div>
      </div>

      <!-- Chart 4: Readiness metrics -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col h-84">
        <h3 class="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <Award class="h-4 w-4 text-emerald-600" />
          <span>{t('chart_readiness_radar', currentLanguage)}</span>
        </h3>
        <div class="flex-1 min-h-0 relative">
          <canvas bind:this={chart4Canvas}></canvas>
        </div>
      </div>

    </div>

  </div>
{/if}
