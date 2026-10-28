<script>
  import { adminService } from '$lib/services/adminService';
  import { studentService } from '$lib/services/studentService';
  import { showToast } from '$lib/stores/toastStore';
  import { t, translateCompanyName } from '$lib/utils/translate';
  import { langStore } from '$lib/stores/themeStore';
  import { 
    Users, Search, Filter, Download, Printer, Bell, 
    CheckCircle, XCircle, AlertCircle, Sparkles, Building2, 
    GraduationCap, Award, FileText, Check, ChevronDown, 
    ArrowUpDown, Eye, X, Loader, ShieldCheck, Send
  } from '@lucide/svelte';

  let loading = $state(true);
  let students = $state([]);
  let companies = $state([]);
  let currentLanguage = $state('en');

  $effect(() => {
    const unsub = langStore.subscribe(v => currentLanguage = v);
    return () => unsub();
  });

  // Filter States
  let selectedCompanyId = $state('all');
  let minCgpa = $state(6.5);
  let maxBacklogs = $state(0); // 0: 0 only, 1: <=1, -1: any
  let minAtsScore = $state(70);
  let mockInterviewFilter = $state('any'); // 'any' | 'attempted' | 'passed'
  let selectedDepartments = $state([
    'Master of Computer Applications (MCA)',
    'Computer Science (CSE)',
    'Information Technology (IT)',
    'Electronics & Comm. (ECE)'
  ]);
  let searchQuery = $state('');

  // Selected students for batch action
  let selectedStudentIds = $state(new Set());
  let showPrintNominalRoll = $state(false);
  let broadcasting = $state(false);

  // Student details modal
  let selectedStudentDetails = $state(null);
  let showDetailsModal = $state(false);
  let detailsLoading = $state(false);

  const availableDepts = [
    'Master of Computer Applications (MCA)',
    'Computer Science (CSE)',
    'Information Technology (IT)',
    'Electronics & Comm. (ECE)'
  ];

  async function loadData() {
    loading = true;
    try {
      students = await adminService.getAllStudents();
      companies = await studentService.getCompanies();
      
      // Auto-select first company preset if available
      if (companies.length > 0 && selectedCompanyId === 'all') {
        selectedCompanyId = companies[0].id;
        applyCompanyPreset(companies[0]);
      }
    } catch (e) {
      showToast("Error loading student and company data", "error");
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    loadData();
  });

  function applyCompanyPreset(company) {
    if (!company) return;
    minCgpa = company.eligibility?.minCgpa || 6.5;
    if (company.eligibility?.departments && company.eligibility.departments.length > 0) {
      selectedDepartments = [...company.eligibility.departments];
    }
    maxBacklogs = 0; // Strict standard for top drives
    minAtsScore = 70;
  }

  function handleCompanyChange(e) {
    const compId = e.target.value;
    selectedCompanyId = compId;
    if (compId !== 'custom') {
      const comp = companies.find(c => c.id === compId);
      if (comp) applyCompanyPreset(comp);
    }
  }

  function toggleDepartment(dept) {
    if (selectedDepartments.includes(dept)) {
      if (selectedDepartments.length > 1) {
        selectedDepartments = selectedDepartments.filter(d => d !== dept);
      } else {
        showToast("At least one department must be selected", "error");
      }
    } else {
      selectedDepartments = [...selectedDepartments, dept];
    }
  }

  // Active target company object
  const activeCompany = $derived(() => {
    if (selectedCompanyId === 'custom') {
      return {
        name: 'Custom Placement Drive Criteria',
        package: 'Flexible',
        driveDate: new Date().toLocaleDateString()
      };
    }
    return companies.find(c => c.id === selectedCompanyId) || {
      name: 'Campus Placement Drive',
      package: '6.5',
      driveDate: new Date().toLocaleDateString()
    };
  });

  // Evaluate single student eligibility against active criteria
  function evaluateStudent(s) {
    const cgpa = s.cgpa || 0.0;
    const backlogs = s.backlogs !== undefined ? s.backlogs : (cgpa < 6.5 ? 1 : 0);
    const ats = s.atsScore || 70;
    const mock = s.mockScore || 0;
    const dept = s.department || '';

    const reasons = [];

    if (cgpa < minCgpa) {
      reasons.push(`CGPA ${cgpa} is below cutoff ${minCgpa}`);
    }
    if (maxBacklogs !== -1 && backlogs > maxBacklogs) {
      reasons.push(`Has ${backlogs} active backlogs (max allowed: ${maxBacklogs})`);
    }
    if (ats < minAtsScore) {
      reasons.push(`Resume ATS score ${ats}% is below ${minAtsScore}%`);
    }
    if (!selectedDepartments.some(d => dept.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(dept.toLowerCase()))) {
      reasons.push(`Department ${dept} is not eligible`);
    }
    if (mockInterviewFilter === 'attempted' && mock <= 0) {
      reasons.push(`Has not attempted mock interview`);
    } else if (mockInterviewFilter === 'passed' && mock < 70) {
      reasons.push(`Mock interview score ${mock}% is below 70% passing threshold`);
    }

    return {
      isEligible: reasons.length === 0,
      reasons,
      cgpa,
      backlogs,
      ats,
      mock
    };
  }

  // Process and filter student list
  const evaluatedStudents = $derived(() => {
    return students.map(s => {
      const evalResult = evaluateStudent(s);
      return {
        ...s,
        ...evalResult
      };
    });
  });

  const filteredStudents = $derived(() => {
    let result = evaluatedStudents();
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

  const eligibleCohort = $derived(() => {
    return filteredStudents().filter(s => s.isEligible);
  });

  const ineligibleCohort = $derived(() => {
    return filteredStudents().filter(s => !s.isEligible);
  });

  // Derived metrics
  const totalCount = $derived(filteredStudents().length);
  const eligibleCount = $derived(eligibleCohort().length);
  const eligibilityRate = $derived(totalCount > 0 ? ((eligibleCount / totalCount) * 100).toFixed(1) : '0.0');

  const averageEligibleCgpa = $derived(() => {
    const list = eligibleCohort();
    if (list.length === 0) return '0.0';
    const sum = list.reduce((acc, curr) => acc + (curr.cgpa || 0), 0);
    return (sum / list.length).toFixed(2);
  });

  const averageEligibleAts = $derived(() => {
    const list = eligibleCohort();
    if (list.length === 0) return '0';
    const sum = list.reduce((acc, curr) => acc + (curr.ats || 0), 0);
    return Math.round(sum / list.length);
  });

  // Select all eligible toggle
  function handleSelectAllEligible() {
    const eligibleIds = eligibleCohort().map(s => s.uid);
    if (selectedStudentIds.size === eligibleIds.length) {
      selectedStudentIds = new Set();
    } else {
      selectedStudentIds = new Set(eligibleIds);
    }
  }

  function toggleStudentSelection(uid) {
    const updated = new Set(selectedStudentIds);
    if (updated.has(uid)) {
      updated.delete(uid);
    } else {
      updated.add(uid);
    }
    selectedStudentIds = updated;
  }

  // One-Click CSV Export for HR & Recruiters
  function handleExportCsv() {
    const list = eligibleCohort();
    if (list.length === 0) {
      showToast("No eligible candidates to export", "error");
      return;
    }

    const company = activeCompany();
    const headers = [
      "S.No",
      "Register Number",
      "Student Name",
      "Department",
      "CGPA",
      "Active Backlogs",
      "Email Address",
      "Phone Number",
      "Resume ATS Score",
      "Mock Interview Score",
      "Readiness Score",
      "Eligibility Status"
    ];

    const rows = list.map((s, idx) => [
      idx + 1,
      `"${s.registerNumber || 'N/A'}"`,
      `"${s.name || 'Candidate'}"`,
      `"${s.department || 'MCA'}"`,
      s.cgpa || 0.0,
      s.backlogs,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `${s.ats}%`,
      `${s.mock}%`,
      `${s.readinessScore || 70}%`,
      "VERIFIED ELIGIBLE"
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `${(company.name || 'Placement').replace(/\s+/g, '_')}_Eligible_Candidates_${new Date().toISOString().slice(0, 10)}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${list.length} eligible students to CSV!`, "success");
  }

  // Official Printable Nominal Roll
  function handlePrintNominalRoll() {
    window.print();
  }

  // Broadcast Alert to Eligible Candidates
  async function handleBroadcastToEligible() {
    const count = eligibleCount();
    if (count === 0) {
      showToast("No eligible candidates found", "error");
      return;
    }

    const comp = activeCompany();
    broadcasting = true;
    try {
      await adminService.broadcastNotification({
        title: `Placement Drive Verification: ${comp.name}`,
        message: `Congratulations! You meet all institutional eligibility thresholds (CGPA >= ${minCgpa}, ATS Score >= ${minAtsScore}%) for ${comp.name}. Verify your profile and attend pre-placement briefing.`,
        type: "Placement"
      });
      showToast(`Placement announcement sent to all eligible candidates!`, "success");
    } catch (e) {
      showToast("Failed to broadcast alert", "error");
    } finally {
      broadcasting = false;
    }
  }

  // Send Remedial Alert to Ineligible Candidates
  async function handleAlertIneligible() {
    const list = ineligibleCohort();
    if (list.length === 0) {
      showToast("All students in current batch are eligible!", "success");
      return;
    }

    broadcasting = true;
    try {
      await adminService.broadcastNotification({
        title: `Placement Eligibility Improvement Notice`,
        message: `Upcoming placement drives require minimum CGPA of ${minCgpa} and Resume ATS score of ${minAtsScore}%. Utilize CareerReady AI Resume Builder and Mock Interviews to raise your readiness index.`,
        type: "Reminder"
      });
      showToast(`Remedial improvement alert sent to students!`, "success");
    } catch (e) {
      showToast("Failed to send alert", "error");
    } finally {
      broadcasting = false;
    }
  }

  // Quick view student details modal
  async function handleViewStudent(uid) {
    showDetailsModal = true;
    detailsLoading = true;
    try {
      selectedStudentDetails = await adminService.getStudentDetails(uid);
    } catch (e) {
      showToast("Could not load student profile", "error");
      showDetailsModal = false;
    } finally {
      detailsLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Candidate Placement Eligibility & Export - CareerReady AI</title>
</svelte:head>

<!-- ======================================================== -->
<!-- PRINT-ONLY OFFICIAL INSTITUTIONAL NOMINAL ROLL (A4)       -->
<!-- ======================================================== -->
<div class="hidden print-only print-container p-8 text-black bg-white font-sans text-xs">
  
  <!-- College Institutional Header -->
  <div class="text-center border-b-2 border-slate-900 pb-4 mb-4">
    <h1 class="text-xl font-black uppercase tracking-wider text-slate-900">SONA COLLEGE OF TECHNOLOGY</h1>
    <p class="text-xs font-bold text-slate-700 tracking-wide uppercase">(An Autonomous Institution • Affiliated to Anna University)</p>
    <p class="text-[10px] text-slate-600">Salem - 636 005, Tamil Nadu, India</p>
    
    <div class="mt-3 py-1.5 px-4 bg-slate-100 border border-slate-300 rounded inline-block">
      <h2 class="text-xs font-black uppercase tracking-widest text-slate-900">
        OFFICE OF CAMPUS PLACEMENTS & CAREER DEVELOPMENT CELL
      </h2>
      <p class="text-[10px] font-bold text-indigo-900 mt-0.5">
        OFFICIAL VERIFIED CANDIDATE ELIGIBILITY NOMINAL ROLL
      </p>
    </div>
  </div>

  <!-- Drive Details & Verification Criteria Grid -->
  <div class="grid grid-cols-2 gap-4 border border-slate-300 p-3 mb-4 text-[11px] bg-slate-50/50">
    <div>
      <p><span class="font-bold">Recruiting Enterprise:</span> {activeCompany().name}</p>
      <p><span class="font-bold">Annual Compensation Package:</span> {activeCompany().package} LPA</p>
      <p><span class="font-bold">Scheduled Drive Date:</span> {activeCompany().driveDate || 'Upcoming'}</p>
    </div>
    <div class="text-right">
      <p><span class="font-bold">Cutoff CGPA Threshold:</span> ≥ {minCgpa}</p>
      <p><span class="font-bold">Active Backlog Constraint:</span> {maxBacklogs === 0 ? 'Zero (0) Standing Arrears' : `Max ${maxBacklogs}`}</p>
      <p><span class="font-bold">Min ATS Resume Score:</span> ≥ {minAtsScore}%</p>
      <p><span class="font-bold">Total Eligible Candidates:</span> {eligibleCount} / {totalCount} ({eligibilityRate}%)</p>
    </div>
  </div>

  <!-- Table of Eligible Candidates -->
  <table class="w-full border-collapse border border-slate-400 text-[10px] mb-8">
    <thead>
      <tr class="bg-slate-200 text-slate-900 font-bold uppercase text-left">
        <th class="border border-slate-400 p-1.5 w-8 text-center">S.No</th>
        <th class="border border-slate-400 p-1.5">Register No</th>
        <th class="border border-slate-400 p-1.5">Candidate Name</th>
        <th class="border border-slate-400 p-1.5">Department</th>
        <th class="border border-slate-400 p-1.5 text-center">CGPA</th>
        <th class="border border-slate-400 p-1.5 text-center">Backlogs</th>
        <th class="border border-slate-400 p-1.5 text-center">ATS Score</th>
        <th class="border border-slate-400 p-1.5 text-center">Readiness</th>
        <th class="border border-slate-400 p-1.5 text-center">Status</th>
      </tr>
    </thead>
    <tbody>
      {#each eligibleCohort() as student, idx}
        <tr class="{idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
          <td class="border border-slate-400 p-1.5 text-center">{idx + 1}</td>
          <td class="border border-slate-400 p-1.5 font-mono font-bold">{student.registerNumber}</td>
          <td class="border border-slate-400 p-1.5 font-bold">{student.name}</td>
          <td class="border border-slate-400 p-1.5">{student.department}</td>
          <td class="border border-slate-400 p-1.5 text-center font-bold">{student.cgpa}</td>
          <td class="border border-slate-400 p-1.5 text-center font-semibold text-emerald-800">{student.backlogs}</td>
          <td class="border border-slate-400 p-1.5 text-center font-bold text-indigo-900">{student.ats}%</td>
          <td class="border border-slate-400 p-1.5 text-center font-bold">{student.readinessScore || 75}%</td>
          <td class="border border-slate-400 p-1.5 text-center font-bold text-emerald-800">ELIGIBLE</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <!-- Official Institutional Signatures -->
  <div class="grid grid-cols-3 gap-6 pt-12 text-center text-[10px]">
    <div>
      <div class="border-t border-slate-800 pt-1.5 font-bold">
        Placement Officer
      </div>
      <p class="text-slate-500">Training & Placement Cell</p>
    </div>

    <div>
      <div class="border-t border-slate-800 pt-1.5 font-bold">
        Head of Department (HoD)
      </div>
      <p class="text-slate-500">Dept. of Computer Applications</p>
    </div>

    <div>
      <div class="border-t border-slate-800 pt-1.5 font-bold">
        Principal / Dean
      </div>
      <p class="text-slate-500">Sona College of Technology</p>
    </div>
  </div>

  <div class="mt-8 text-center text-[9px] text-slate-400">
    Generated automatically by CareerReady AI Institutional Placement Analytics Platform • Verification Timestamp: {new Date().toLocaleString()}
  </div>
</div>

<!-- ======================================================== -->
<!-- INTERACTIVE WEB APPLICATION VIEW                          -->
<!-- ======================================================== -->
{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 text-left no-print">

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('eligibility_page_title', currentLanguage)}
          </h2>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {t('institutional_roster', currentLanguage)}
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('eligibility_page_desc', currentLanguage)}
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <button
          onclick={handleExportCsv}
          class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Download class="h-4 w-4" />
          <span>{t('export_recruiter_csv', currentLanguage)} ({eligibleCount})</span>
        </button>

        <button
          onclick={handlePrintNominalRoll}
          class="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Printer class="h-4 w-4" />
          <span>{t('official_nominal_roll', currentLanguage)}</span>
        </button>

        <button
          onclick={handleBroadcastToEligible}
          disabled={broadcasting}
          class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Send class="h-3.5 w-3.5" />
          <span>{t('alert_eligible_students', currentLanguage)}</span>
        </button>
      </div>
    </div>

    <!-- Live Placement Metrics Bar -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      
      <!-- Metric 1: Total Batch Size -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">{t('batch_size', currentLanguage)}</span>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</span>
          <span class="text-xs font-medium text-slate-400">candidates</span>
        </div>
      </div>

      <!-- Metric 2: Eligible Candidates -->
      <div class="bg-emerald-500/[0.04] border border-emerald-500/20 p-4 rounded-2xl shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">{t('eligible_roster', currentLanguage)}</span>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{eligibleCount}</span>
          <span class="text-xs font-bold text-emerald-500">({eligibilityRate}%)</span>
        </div>
      </div>

      <!-- Metric 3: Ineligible / Blocked -->
      <div class="bg-rose-500/[0.04] border border-rose-500/20 p-4 rounded-2xl shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">{t('below_cutoff', currentLanguage)}</span>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-rose-500">{ineligibleCohort().length}</span>
          <span class="text-xs font-medium text-rose-400">students</span>
        </div>
      </div>

      <!-- Metric 4: Avg CGPA of Eligible -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">{t('avg_cgpa_eligible', currentLanguage)}</span>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-indigo-600 dark:text-indigo-400">{averageEligibleCgpa()}</span>
          <span class="text-xs font-medium text-slate-400">/ 10.0</span>
        </div>
      </div>

      <!-- Metric 5: Avg ATS Score -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm col-span-2 md:col-span-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">{t('avg_ats_score', currentLanguage)}</span>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-amber-500">{averageEligibleAts()}%</span>
          <span class="text-xs font-medium text-slate-400">match</span>
        </div>
      </div>

    </div>

    <!-- Filter Configuration Console -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
      
      <!-- Row 1: Company Preset & Search -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div class="flex items-center gap-2">
            <Building2 class="h-4 w-4 text-indigo-500" />
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{t('target_company_preset', currentLanguage)}</span>
          </div>

          <select 
            value={selectedCompanyId}
            onchange={handleCompanyChange}
            class="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            {#each companies as comp}
              <option value={comp.id}>{translateCompanyName(comp.name, currentLanguage)} ({comp.package} LPA • {t('cgpa', currentLanguage)}: {comp.eligibility?.minCgpa || 6.5})</option>
            {/each}
            <option value="custom">⚙️ {t('Custom Institutional Criteria', currentLanguage)}</option>
          </select>
        </div>

        <!-- Quick Search -->
        <div class="relative w-full md:w-72">
          <Search class="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            bind:value={searchQuery}
            placeholder={t('search_students_placeholder', currentLanguage)}
            class="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
          />
        </div>
      </div>

      <!-- Row 2: Sliders & Criteria Controls -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-3 border-t border-slate-100 dark:border-slate-850">
        
        <!-- Filter 1: Min CGPA -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">{t('min_cgpa_threshold', currentLanguage)}</label>
            <span class="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
              ≥ {minCgpa}
            </span>
          </div>
          <input 
            type="range" 
            min="5.0" 
            max="9.5" 
            step="0.1" 
            bind:value={minCgpa}
            class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div class="flex justify-between text-[10px] text-slate-400">
            <span>5.0</span>
            <span>6.5</span>
            <span>7.5</span>
            <span>9.0</span>
          </div>
        </div>

        <!-- Filter 2: Backlogs -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">{t('allowed_backlogs', currentLanguage)}</label>
          <select 
            bind:value={maxBacklogs}
            class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value={0}>{t('zero_backlogs', currentLanguage)}</option>
            <option value={1}>{t('max_1_backlog', currentLanguage)}</option>
            <option value={2}>Maximum 2 Active Backlogs</option>
            <option value={-1}>{t('any_backlogs', currentLanguage)}</option>
          </select>
        </div>

        <!-- Filter 3: Min ATS Score -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">{t('min_ats_threshold', currentLanguage)}</label>
            <span class="text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
              ≥ {minAtsScore}%
            </span>
          </div>
          <input 
            type="range" 
            min="50" 
            max="90" 
            step="5" 
            bind:value={minAtsScore}
            class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div class="flex justify-between text-[10px] text-slate-400">
            <span>50%</span>
            <span>70%</span>
            <span>80%</span>
            <span>90%</span>
          </div>
        </div>

        <!-- Filter 4: Mock Interview Clearance -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">{t('mock_interview_clearance', currentLanguage)}</label>
          <select 
            bind:value={mockInterviewFilter}
            class="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="any">{t('all_mock', currentLanguage)}</option>
            <option value="attempted">{t('attempted_mock', currentLanguage)}</option>
            <option value="passed">{t('passed_mock', currentLanguage)}</option>
          </select>
        </div>

      </div>

      <!-- Row 3: Department Multi-select Badges -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-850 flex flex-wrap items-center gap-2">
        <span class="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1.5">
          <GraduationCap class="h-4 w-4" /> {t('allowed_departments', currentLanguage)}:
        </span>
        {#each availableDepts as dept}
          <button
            onclick={() => toggleDepartment(dept)}
            class="text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 {selectedDepartments.includes(dept) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}"
          >
            {#if selectedDepartments.includes(dept)}
              <Check class="h-3 w-3" />
            {/if}
            <span>{dept}</span>
          </button>
        {/each}
      </div>

    </div>

    <!-- Candidate Evaluation Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
      
      <!-- Table Top Toolbar -->
      <div class="p-4 border-b border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="flex items-center gap-2">
          <button
            onclick={handleSelectAllEligible}
            class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {selectedStudentIds.size === eligibleCount && eligibleCount > 0 ? t('Deselect All', currentLanguage) : `${t('Select All Eligible', currentLanguage)} (${eligibleCount})`}
          </button>
          {#if selectedStudentIds.size > 0}
            <span class="text-[11px] text-slate-400">• {selectedStudentIds.size} {t('candidates selected', currentLanguage)}</span>
          {/if}
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span class="text-slate-600 dark:text-slate-400 font-semibold">{eligibleCount} {t('eligible', currentLanguage)}</span>
          <span class="text-slate-300 dark:text-slate-700">|</span>
          <span class="h-2 w-2 rounded-full bg-rose-500"></span>
          <span class="text-slate-600 dark:text-slate-400 font-semibold">{ineligibleCohort().length} {t('Below Cutoff', currentLanguage)}</span>
        </div>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-850">
            <tr>
              <th class="p-4 w-10 text-center">#</th>
              <th class="p-4">{t('th_name_reg', currentLanguage)}</th>
              <th class="p-4">{t('department', currentLanguage)}</th>
              <th class="p-4 text-center">{t('cgpa', currentLanguage)}</th>
              <th class="p-4 text-center">{t('Backlogs', currentLanguage)}</th>
              <th class="p-4 text-center">{t('ats_score', currentLanguage)}</th>
              <th class="p-4 text-center">{t('Mock Score', currentLanguage)}</th>
              <th class="p-4 text-center">{t('readiness', currentLanguage)}</th>
              <th class="p-4 text-center">{t('status', currentLanguage)}</th>
              <th class="p-4 text-right">{t('actions', currentLanguage)}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-850">
            {#if filteredStudents().length === 0}
              <tr>
                <td colspan="10" class="p-8 text-center text-slate-400">
                  No candidates match the specified search or filter criteria.
                </td>
              </tr>
            {:else}
              {#each filteredStudents() as s, idx}
                <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-950/40 transition-colors {s.isEligible ? '' : 'opacity-75'}">
                  <td class="p-4 text-center text-slate-400 font-medium">
                    {#if s.isEligible}
                      <input 
                        type="checkbox" 
                        checked={selectedStudentIds.has(s.uid)}
                        onchange={() => toggleStudentSelection(s.uid)}
                        class="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                    {:else}
                      <span class="text-[10px]">{idx + 1}</span>
                    {/if}
                  </td>

                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p class="font-bold text-slate-900 dark:text-white">{s.name}</p>
                        <p class="font-mono text-[10px] text-slate-400">{s.registerNumber}</p>
                      </div>
                    </div>
                  </td>

                  <td class="p-4 font-medium text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                    {s.department}
                  </td>

                  <td class="p-4 text-center">
                    <span class="font-bold {s.cgpa >= minCgpa ? 'text-slate-900 dark:text-white' : 'text-rose-500'}">
                      {s.cgpa}
                    </span>
                  </td>

                  <td class="p-4 text-center font-semibold">
                    {#if s.backlogs === 0}
                      <span class="text-emerald-500 font-bold">0</span>
                    {:else}
                      <span class="text-rose-500 font-bold">{s.backlogs}</span>
                    {/if}
                  </td>

                  <td class="p-4 text-center">
                    <span class="px-2 py-0.5 rounded-lg text-xs font-bold {s.ats >= minAtsScore ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-rose-500/10 text-rose-500'}">
                      {s.ats}%
                    </span>
                  </td>

                  <td class="p-4 text-center">
                    <span class="font-semibold text-slate-700 dark:text-slate-300">
                      {s.mock > 0 ? `${s.mock}%` : '—'}
                    </span>
                  </td>

                  <td class="p-4 text-center">
                    <span class="font-bold text-indigo-600 dark:text-indigo-400">
                      {s.readinessScore || 70}%
                    </span>
                  </td>

                  <!-- Status with Tooltip Reasons -->
                  <td class="p-4 text-center">
                    {#if s.isEligible}
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle class="h-3 w-3" />
                        <span>Eligible</span>
                      </span>
                    {:else}
                      <div class="inline-flex flex-col items-center group relative cursor-help">
                        <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <XCircle class="h-3 w-3" />
                          <span>Not Eligible</span>
                        </span>
                        
                        <!-- Tooltip with reasons -->
                        <div class="hidden group-hover:block absolute bottom-full mb-1 z-30 p-2.5 bg-slate-900 text-white text-[10px] rounded-xl shadow-lg w-52 text-left pointer-events-none">
                          <span class="font-bold text-rose-400 block mb-1">Eligibility Gaps:</span>
                          <ul class="space-y-1">
                            {#each s.reasons as r}
                              <li>• {r}</li>
                            {/each}
                          </ul>
                        </div>
                      </div>
                    {/if}
                  </td>

                  <td class="p-4 text-right">
                    <button
                      onclick={() => handleViewStudent(s.uid)}
                      class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
                      title="View Student Profile"
                    >
                      <Eye class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

    </div>

  </div>
{/if}

<!-- Student Details Modal -->
{#if showDetailsModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 text-left shadow-2xl relative">
      <button 
        onclick={() => showDetailsModal = false}
        class="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
      >
        <X class="h-5 w-5" />
      </button>

      {#if detailsLoading}
        <div class="py-12 text-center">
          <Loader class="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
          <p class="text-xs text-slate-400 mt-2">Loading profile details...</p>
        </div>
      {:else if selectedStudentDetails}
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-base font-bold">
              {selectedStudentDetails.profile?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">{selectedStudentDetails.profile?.name}</h3>
              <p class="text-xs text-slate-400">{selectedStudentDetails.profile?.registerNumber} • {selectedStudentDetails.profile?.department}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold block">CGPA</span>
              <span class="font-bold text-slate-900 dark:text-white text-sm">{selectedStudentDetails.profile?.cgpa || 'N/A'}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold block">Readiness Score</span>
              <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{selectedStudentDetails.profile?.readinessScore || 70}%</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
              <span class="font-medium text-slate-600 dark:text-slate-300 truncate block">{selectedStudentDetails.profile?.email}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
              <span class="font-medium text-slate-600 dark:text-slate-300">{selectedStudentDetails.profile?.phone || 'N/A'}</span>
            </div>
          </div>

          <!-- Skills list -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Technical Skills Verified:</span>
            <div class="flex flex-wrap gap-1">
              {#each Object.values(selectedStudentDetails.skills?.categories || {}).flatMap(arr => (arr || []).map(s => s.name)) as skill}
                <span class="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {skill}
                </span>
              {/each}
            </div>
          </div>

          <div class="flex justify-end pt-3">
            <button
              onclick={() => showDetailsModal = false}
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
