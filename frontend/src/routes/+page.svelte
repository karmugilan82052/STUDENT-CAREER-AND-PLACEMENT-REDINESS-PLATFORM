<script>
  import { 
    ArrowRight, ShieldCheck, Cpu, Target, Award, Route, CheckCircle2, 
    GraduationCap, Building2, Users, Briefcase, 
    FileText, LogIn, ClipboardCheck, Sparkles, TrendingUp, Search, Calendar
  } from '@lucide/svelte';

  const recruiterLogos = [
    { name: "Google", package: "22.0 - 34.0 LPA", type: "Software Engineer SDE-1", status: "Active" },
    { name: "Microsoft", package: "18.0 - 42.0 LPA", type: "Software Engineer (IDC)", status: "Active" },
    { name: "Capgemini", package: "4.2 - 7.5 LPA", type: "Senior Analyst / Engineer", status: "Active" },
    { name: "Amazon", package: "16.0 - 32.0 LPA", type: "SDE-1 Off-Campus", status: "Shortlisting" },
    { name: "TCS", package: "3.36 - 7.0 LPA", type: "Ninja & Digital", status: "Active" },
    { name: "Infosys", package: "3.6 - 9.5 LPA", type: "Specialist Programmer", status: "Upcoming" }
  ];

  const features = [
    {
      icon: FileText,
      title: "ATS Resume Health Auditor",
      desc: "Instantly score resumes against recruiter filters, check keyword coverage, format compliance, and detect missing technical skills.",
      tag: "Resume Audit"
    },
    {
      icon: ShieldCheck,
      title: "Proctored AI Technical Mocks",
      desc: "Practice company-specific technical interviews, coding assessments, and HR rounds with instant evaluation rubrics.",
      tag: "Interview Prep"
    },
    {
      icon: Route,
      title: "5-Day Company Preparation Plans",
      desc: "Step-by-step revision roadmaps tailored to specific company syllabus patterns, previous questions, and core subjects.",
      tag: "Roadmaps"
    },
    {
      icon: Building2,
      title: "Campus Drive Eligibility Hub",
      desc: "Track active campus recruitment drives, verify CGPA and department eligibility thresholds, and submit direct applications.",
      tag: "Placements"
    }
  ];
</script>

<svelte:head>
  <title>CareerReady | Campus Placement & Candidate Readiness Platform</title>
  <meta name="description" content="Official campus placement portal for candidate readiness, ATS resume scoring, and company eligibility matching." />
</svelte:head>

<!-- Main Outer Shell -->
<div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between overflow-x-hidden font-sans relative bg-grid-pattern-light">

  <!-- Subtle Top Notification Header -->
  <div class="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
    <span class="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">Campus Drive Alert</span>
    <span>2026 Batch Placement Registration & Mock Assessments are now live.</span>
    <a href="/register" class="text-emerald-700 underline font-bold hover:text-emerald-900 inline-flex items-center gap-1 ml-1">Check Eligibility <ArrowRight class="h-3 w-3" /></a>
  </div>

  <!-- Main Navigation Header -->
  <header class="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <a href="/" class="flex items-center gap-3">
        <div class="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
          CR
        </div>
        <div class="text-left">
          <span class="font-bold text-lg tracking-tight text-slate-900">
            CareerReady
          </span>
          <span class="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider leading-none">Placement Hub</span>
        </div>
      </a>

      <!-- Streamlined Working Navigation Links -->
      <nav class="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
        <a href="/companies" class="hover:text-emerald-600 transition-colors">Placement Drives</a>
        <a href="/resume" class="hover:text-emerald-600 transition-colors">ATS Resume Audit</a>
        <a href="/skills" class="hover:text-emerald-600 transition-colors">Skill Matrix</a>
        <a href="/interview" class="hover:text-emerald-600 transition-colors">Mock Interviews</a>
        <a href="/reports" class="hover:text-emerald-600 transition-colors">Analytics</a>
      </nav>

      <!-- Clean Action Buttons -->
      <div class="flex items-center gap-3">
        <a 
          href="/login" 
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <LogIn class="h-4 w-4 text-emerald-600" /> Sign In
        </a>
        <a 
          href="/register" 
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm shadow-emerald-600/20"
        >
          <ClipboardCheck class="h-4 w-4" /> Student Register
        </a>
      </div>

    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative isolate overflow-hidden bg-white text-slate-900 py-16 lg:py-24 px-4 border-b border-slate-200">
    <div class="max-w-4xl mx-auto text-center space-y-7">
      
      <!-- Top Institutional Tag -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold mx-auto shadow-2xs">
        <GraduationCap class="h-4 w-4 text-emerald-600" />
        <span>Official Campus Placement & Candidate Readiness Platform</span>
      </div>

      <!-- Main Title -->
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
        Prepare, Evaluate & Get Placed in Top Recruitment Drives
      </h1>

      <!-- Subtitle -->
      <p class="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
        Automated ATS resume health audits, proctored company-specific mock interviews, and live eligibility matching tailored for college candidates and placement officers.
      </p>

      <!-- Primary Action Buttons -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
        <a 
          href="/register" 
          class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold rounded-xl shadow-md shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
        >
          <span>Start Placement Assessment</span>
          <ArrowRight class="h-4 w-4" />
        </a>
        <a 
          href="/companies" 
          class="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-base font-semibold rounded-xl transition-all shadow-2xs"
        >
          <Building2 class="h-4 w-4 text-slate-500" />
          <span>Explore Active Drives</span>
        </a>
      </div>

      <!-- Key Platform Metrics -->
      <div class="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 max-w-2xl mx-auto">
        <div class="p-3">
          <span class="text-2xl sm:text-3xl font-extrabold text-slate-900">85%</span>
          <span class="block text-xs font-semibold text-slate-500 mt-0.5">Average Placement Rate</span>
        </div>
        <div class="p-3">
          <span class="text-2xl sm:text-3xl font-extrabold text-slate-900">12+</span>
          <span class="block text-xs font-semibold text-slate-500 mt-0.5">Active Campus Drives</span>
        </div>
        <div class="p-3">
          <span class="text-2xl sm:text-3xl font-extrabold text-slate-900">92%</span>
          <span class="block text-xs font-semibold text-slate-500 mt-0.5">ATS Filter Precision</span>
        </div>
      </div>

    </div>
  </section>

  <!-- Hiring Partner Network Grid -->
  <section class="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
    <div>
      <span class="text-xs font-bold text-emerald-700 uppercase tracking-widest">Recruitment Network</span>
      <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Participating Corporate Partners</h3>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {#each recruiterLogos as r}
        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-1.5 hover:border-emerald-500 hover:shadow-md transition-all text-center">
          <span class="font-bold text-base text-slate-900">{r.name}</span>
          <span class="text-xs font-bold text-emerald-600">{r.package}</span>
          <span class="text-[10px] text-slate-500 font-medium">{r.type}</span>
        </div>
      {/each}
    </div>
  </section>

  <!-- Core Product Modules Grid -->
  <section class="py-16 bg-slate-100/60 border-t border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div class="text-center">
        <span class="text-xs font-bold text-emerald-700 uppercase tracking-widest">Readiness System</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Comprehensive Placement Workflow</h2>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each features as f}
          <div class="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 hover:border-emerald-500/60 hover:shadow-lg transition-all text-left shadow-xs">
            <div class="flex items-center justify-between">
              <div class="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <f.icon class="h-5 w-5" />
              </div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-2 py-0.5 rounded-md bg-slate-100">{f.tag}</span>
            </div>
            <h3 class="font-bold text-base text-slate-900">{f.title}</h3>
            <p class="text-xs text-slate-600 leading-relaxed font-normal">{f.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Clean Footer -->
  <footer class="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <div class="h-5 w-5 rounded-md bg-emerald-600 text-white font-black flex items-center justify-center text-[10px]">CR</div>
        <span class="font-bold text-slate-800">CareerReady Placement Portal</span>
      </div>
      <p>© 2026 CareerReady. Official Institutional Placement & Candidate Readiness System.</p>
    </div>
  </footer>

</div>
