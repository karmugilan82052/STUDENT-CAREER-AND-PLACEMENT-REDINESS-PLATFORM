<script>
  import { adminService } from '$lib/services/adminService';
  import { studentService } from '$lib/services/studentService';
  import { showToast } from '$lib/stores/toastStore';
  import { t, translateCompanyName } from '$lib/utils/translate';
  import { langStore } from '$lib/stores/themeStore';
  import { 
    Plus, Trash2, Calendar, Briefcase, Award, 
    Loader, Building2, MapPin, ClipboardList, Check, Info 
  } from '@lucide/svelte';

  let companies = $state([]);
  let applications = $state([]);
  let loading = $state(true);
  let currentLanguage = $state('en');

  $effect(() => {
    const unsub = langStore.subscribe(v => currentLanguage = v);
    return () => unsub();
  });

  // Form states (Add company)
  let name = $state('');
  let packageLpa = $state('');
  let location = $state('');
  let minCgpa = $state(6.0);
  let bond = $state('None');
  let driveDate = $state('');
  let jobDescription = $state('');
  let selectedDepts = $state([]);
  let rawSkills = $state('');
  
  let posting = $state(false);

  const departments = [
    "Master of Computer Applications (MCA)",
    "Computer Science (CSE)",
    "Information Technology (IT)",
    "Electronics & Comm. (ECE)"
  ];

  async function loadAdminCompanies() {
    try {
      // In Svelte 5 we are executing client service calls
      const list = await studentService.getCompanies("admin123");
      companies = list;
      applications = await adminService.getAllApplications();
    } catch (e) {
      showToast("Error loading drives", "error");
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    loadAdminCompanies();
  });

  async function handleAddCompany(e) {
    e.preventDefault();
    if (!name || !packageLpa || !location || !driveDate || !jobDescription) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    posting = true;
    try {
      const skillsArray = rawSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const newCompany = {
        name,
        package: parseFloat(packageLpa),
        location,
        eligibility: {
          minCgpa: parseFloat(minCgpa),
          departments: selectedDepts,
          requiredSkills: skillsArray
        },
        bond,
        driveDate,
        jobDescription
      };

      await adminService.addCompany(newCompany);
      showToast("Company Drive Posted!", "success");

      // Reset
      name = '';
      packageLpa = '';
      location = '';
      minCgpa = 6.0;
      bond = 'None';
      driveDate = '';
      jobDescription = '';
      selectedDepts = [];
      rawSkills = '';

      await loadAdminCompanies();
    } catch (err) {
      showToast(err.message || "Failed to post drive", "error");
    } finally {
      posting = false;
    }
  }

  async function handleDeleteCompany(compId) {
    if (!confirm("Are you sure you want to delete this drive posting and all student applications?")) return;

    try {
      await adminService.deleteCompany(compId);
      showToast("Drive deleted successfully", "success");
      await loadAdminCompanies();
    } catch (err) {
      showToast("Failed to delete drive", "error");
    }
  }

  function toggleDept(dept) {
    if (selectedDepts.includes(dept)) {
      selectedDepts = selectedDepts.filter(d => d !== dept);
    } else {
      selectedDepts = [...selectedDepts, dept];
    }
  }

  function getApplicantsCount(companyId) {
    return applications.filter(a => a.companyId === companyId).length;
  }

  const presetTemplates = [
    {
      name: "NVIDIA India",
      package: 40,
      location: "Bengaluru, India",
      minCgpa: 8.5,
      bond: "None",
      driveDate: "2026-11-01",
      rawSkills: "C++, CUDA, Deep Learning, GPU Architecture",
      selectedDepts: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
      jobDescription: "AI & Autonomous Systems Engineer. Design parallel algorithms, optimize neural network acceleration engines, and develop CUDA drivers."
    },
    {
      name: "Salesforce",
      package: 24,
      location: "Hyderabad, India",
      minCgpa: 7.5,
      bond: "None",
      driveDate: "2026-10-25",
      rawSkills: "Java, Apex, Microservices, Cloud Architecture",
      selectedDepts: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
      jobDescription: "Software Engineer - CRM & Cloud Platform. Develop multi-tenant SaaS backend components and customer engagement APIs."
    },
    {
      name: "Meta",
      package: 38,
      location: "Gurugram, India",
      minCgpa: 8.5,
      bond: "None",
      driveDate: "2026-11-15",
      rawSkills: "React, Python, System Design, Distributed Systems",
      selectedDepts: ["Master of Computer Applications (MCA)", "Computer Science (CSE)"],
      jobDescription: "Software Engineer - Infrastructure & Web Services. Scale social networking platforms, real-time messaging, and media processing pipelines."
    },
    {
      name: "Atlassian",
      package: 30,
      location: "Bengaluru, India",
      minCgpa: 8.0,
      bond: "None",
      driveDate: "2026-10-30",
      rawSkills: "Java, Microservices, React, TypeScript, GraphQL",
      selectedDepts: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
      jobDescription: "Site Reliability / Software Engineer. Build developer collaboration platforms, cloud infrastructure, and DevOps tools."
    },
    {
      name: "Goldman Sachs",
      package: 26,
      location: "Bengaluru, India",
      minCgpa: 8.0,
      bond: "None",
      driveDate: "2026-10-10",
      rawSkills: "C++, Java, Algorithms, Financial Mathematics, SQL",
      selectedDepts: ["Master of Computer Applications (MCA)", "Computer Science (CSE)", "Information Technology (IT)"],
      jobDescription: "Quantitative Technology Analyst. Design low-latency trading software, algorithmic risk calculators, and financial transaction engines."
    }
  ];

  function applyPreset(presetIndex) {
    if (presetIndex === '') return;
    const p = presetTemplates[parseInt(presetIndex)];
    if (!p) return;
    name = p.name;
    packageLpa = p.package;
    location = p.location;
    minCgpa = p.minCgpa;
    bond = p.bond;
    driveDate = p.driveDate;
    rawSkills = p.rawSkills;
    selectedDepts = [...p.selectedDepts];
    jobDescription = p.jobDescription;
  }
</script>

<svelte:head>
  <title>Manage Companies - CareerReady AI</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 text-left animate-slide-in">
    
    <div class="border-b border-slate-200 dark:border-slate-800 pb-4">
      <h2 class="text-3xl font-extrabold tracking-tight">{t('campus_placement_drives', currentLanguage)}</h2>
      <p class="text-xs text-slate-550 dark:text-slate-400 mt-1">{t('Configure company profiles, set CGPA thresholds, and list active recruitment dates.', currentLanguage)}</p>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      
      <!-- Add Company Form (Left column) -->
      <div class="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-fit space-y-6">
        <h3 class="text-lg font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
          <Plus class="h-5 w-5 text-indigo-500" />
          <span>{t('Post New Placement Campaign', currentLanguage)}</span>
        </h3>

        <!-- Preset quick-fill dropdown -->
        <div class="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl space-y-1 text-left">
          <label for="preset-select" class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">⚡ {t('target_company_preset', currentLanguage)}</label>
          <select 
            id="preset-select" 
            onchange={(e) => applyPreset(e.target.value)} 
            class="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">-- {t('Choose Preset Template', currentLanguage)} --</option>
            {#each presetTemplates as pt, i}
              <option value={i}>{pt.name} ({pt.package} LPA)</option>
            {/each}
          </select>
        </div>

        <form onsubmit={handleAddCompany} class="space-y-4">
          <div class="space-y-1">
            <label for="c-name" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
            <input type="text" id="c-name" bind:value={name} placeholder="e.g. Google India" required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label for="c-pack" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Package (LPA)</label>
              <input type="number" step="0.1" id="c-pack" bind:value={packageLpa} placeholder="e.g. 12" required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
            </div>
            <div class="space-y-1">
              <label for="c-date" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Drive Date</label>
              <input type="date" id="c-date" bind:value={driveDate} required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label for="c-cgpa" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Min CGPA</label>
              <input type="number" step="0.1" min="0" max="10" id="c-cgpa" bind:value={minCgpa} required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
            </div>
            <div class="space-y-1">
              <label for="c-bond" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bond Details</label>
              <input type="text" id="c-bond" bind:value={bond} placeholder="e.g. 2 Years / None" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div class="space-y-1">
            <label for="c-loc" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
            <div class="relative">
              <MapPin class="absolute left-3 top-2.5 h-4 w-4 text-slate-450" />
              <input type="text" id="c-loc" bind:value={location} placeholder="e.g. Bengaluru, India" required class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div class="space-y-1">
            <label for="c-skills" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Skills (Comma Sep)</label>
            <input type="text" id="c-skills" bind:value={rawSkills} placeholder="JavaScript, React, DBMS" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
          </div>

          <!-- Dept checklist -->
          <div class="space-y-2">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Allowed Departments</span>
            <div class="space-y-1.5 max-h-36 overflow-y-auto pr-2">
              {#each departments as d}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div 
                  onclick={() => toggleDept(d)}
                  class="flex items-center justify-between p-2 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950
                    {selectedDepts.includes(d) ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-500'}"
                >
                  <span>{d}</span>
                  {#if selectedDepts.includes(d)}
                    <Check class="h-3 w-3 shrink-0" />
                  {/if}
                </div>
              {/each}
            </div>
          </div>

          <div class="space-y-1">
            <label for="c-jd" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Description</label>
            <textarea id="c-jd" bind:value={jobDescription} rows="4" placeholder="Brief job responsibilities, skills, interview expectations..." required class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 resize-none"></textarea>
          </div>

          <button 
            type="submit" 
            disabled={posting}
            class="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            {#if posting}
              <Loader class="h-4 w-4 animate-spin" />
              <span>Posting drive...</span>
            {:else}
              <Plus class="h-4 w-4" />
              <span>Post Campaign</span>
            {/if}
          </button>
        </form>
      </div>

      <!-- Drives lists (Right columns) -->
      <div class="md:col-span-2 space-y-4">
        <h3 class="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">{t('campus_placement_drives', currentLanguage)}</h3>

        {#if companies.length === 0}
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-450 text-xs italic">
            {t('no_companies_found', currentLanguage)}
          </div>
        {:else}
          <div class="grid gap-4 sm:grid-cols-2">
            {#each companies as comp}
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4 text-left">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <img src={comp.logoUrl} alt="logo" class="h-10 w-10 rounded-xl object-cover shrink-0 ring-2 ring-indigo-500/10" />
                    <div>
                      <h4 class="font-extrabold text-base text-slate-800 dark:text-white leading-tight">{translateCompanyName(comp.name, currentLanguage)}</h4>
                      <span class="text-xs text-slate-400">{comp.location}</span>
                    </div>
                  </div>

                  <button 
                    onclick={() => handleDeleteCompany(comp.id)}
                    class="p-2 border border-slate-200 dark:border-slate-850 text-slate-400 hover:text-rose-500 hover:border-rose-500/20 hover:bg-rose-500/5 rounded-lg transition-colors shrink-0"
                    title="Delete Drive"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>

                <div class="text-[11px] text-slate-500 space-y-1 font-medium">
                  <p>{t('package', currentLanguage)}: <strong class="text-indigo-650 dark:text-indigo-400">{comp.package} LPA</strong></p>
                  <p>{t('drive_date', currentLanguage)}: <strong>{new Date(comp.driveDate).toLocaleDateString()}</strong></p>
                  <p>{t('min_cgpa', currentLanguage)}: <strong>CGPA >= {comp.eligibility?.minCgpa || 6.0}</strong></p>
                </div>

                <!-- Applicant metric indicator -->
                <div class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs">
                  <span class="text-slate-500 font-semibold">{t('applied_companies', currentLanguage)}:</span>
                  <span class="font-bold text-indigo-500">{getApplicantsCount(comp.id)} students</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

    </div>

  </div>
{/if}
