<script>
  import { authStore } from '$lib/stores/authStore';
  import { studentService } from '$lib/services/studentService';
  import { showToast } from '$lib/stores/toastStore';
  import { t } from '$lib/utils/translate';
  import { 
    User, Mail, Phone, MapPin, Award, GraduationCap, 
    Linkedin, Github, Globe, Target, BookOpen, Calendar, 
    Loader, Check, Camera
  } from '@lucide/svelte';
  import Avatar from '$lib/components/common/Avatar.svelte';

  import { langStore } from '$lib/stores/themeStore';

  let profile = $state({});
  let loading = $state(true);
  let saving = $state(false);
  let currentLanguage = $derived($langStore || 'en');

  // Bindable edit variables
  let name = $state('');
  let phone = $state('');
  let address = $state('');
  let linkedin = $state('');
  let github = $state('');
  let portfolio = $state('');
  let careerGoal = $state('');
  let preferredLanguage = $state('en');
  let cgpa = $state('');
  let year = $state(1);

  // Sync profile details once loaded
  $effect(() => {
    const userState = $authStore;
    if (userState.user) {
      studentService.getProfile(userState.user.uid).then(p => {
        if (p) {
          profile = p;
          name = p.name || '';
          phone = p.phone || '';
          address = p.address || '';
          linkedin = p.links?.linkedin || '';
          github = p.links?.github || '';
          portfolio = p.links?.portfolio || '';
          careerGoal = p.careerGoal || '';
          preferredLanguage = p.preferredLanguage || 'en';
          cgpa = p.cgpa || '';
          year = p.year || 1;
        }
        loading = false;
      });
    }
  });

  async function handleSave(e) {
    e.preventDefault();
    const uid = $authStore.user?.uid;
    if (!uid) return;

    saving = true;
    try {
      const cgpaVal = parseFloat(cgpa);
      if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
        showToast("CGPA must be a decimal between 0 and 10", "error");
        saving = false;
        return;
      }

      const updated = {
        name,
        phone,
        address,
        links: { linkedin, github, portfolio },
        careerGoal,
        preferredLanguage,
        cgpa: cgpaVal,
        year: parseInt(year)
      };

      await studentService.updateProfile(uid, updated);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      saving = false;
    }
  }

  let fileInput = $state(null);
  let photoUploading = $state(false);

  // Simulated profile picture uploader
  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please upload an image file", "error");
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size must be less than 2MB", "error");
      return;
    }

    photoUploading = true;
    try {
      const uid = $authStore.user?.uid;
      const url = await studentService.uploadProfilePhoto(uid, file);
      profile.profilePhotoUrl = url;
      showToast("Profile photo uploaded successfully!", "success");
    } catch (err) {
      showToast("Failed to upload profile photo", "error");
    } finally {
      photoUploading = false;
    }
  }
</script>

<svelte:head>
  <title>Student Profile - CareerReady AI</title>
</svelte:head>

{#if loading}
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6">
    
    <!-- Top banner glass -->
    <div class="bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 dark:from-indigo-500/5 dark:via-violet-500/5 dark:to-fuchsia-500/5 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 backdrop-blur">
      <div class="relative group">
        <Avatar 
          src={profile.profilePhotoUrl} 
          name={profile.name || $authStore.user?.email} 
          size="2xl" 
          rounded="rounded-2xl" 
        />
        <button 
          onclick={() => fileInput.click()} 
          disabled={photoUploading}
          class="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
          title="Upload Photo"
        >
          {#if photoUploading}
            <Loader class="h-4 w-4 animate-spin" />
          {:else}
            <Camera class="h-4 w-4" />
          {/if}
        </button>
        <input 
          type="file" 
          accept="image/*" 
          bind:this={fileInput} 
          onchange={handlePhotoUpload} 
          class="hidden" 
        />
      </div>

      <div class="text-center md:text-left space-y-2 flex-1">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
          {t('profile', currentLanguage)}
        </div>
        <h2 class="text-3xl font-extrabold tracking-tight">{profile.name}</h2>
        
        <div class="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1.5">
            <GraduationCap class="h-4 w-4 text-slate-450" />
            {profile.department}
          </span>
          <span class="flex items-center gap-1.5">
            <Calendar class="h-4 w-4 text-slate-450" />
            Year {profile.year}
          </span>
          <span class="flex items-center gap-1.5">
            <Award class="h-4 w-4 text-slate-450" />
            CGPA: <strong class="text-indigo-650 dark:text-indigo-400">{profile.cgpa}</strong>
          </span>
        </div>
      </div>

      <div class="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl text-center md:w-48 shrink-0">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block">Readiness Score</span>
        <h3 class="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{profile.readinessScore || 35}%</h3>
        <div class="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
          <div class="bg-indigo-500 h-full rounded-full" style="width: {profile.readinessScore || 35}%"></div>
        </div>
      </div>
    </div>

    <!-- Details forms -->
    <form onsubmit={handleSave} class="grid md:grid-cols-3 gap-6 text-left">
      
      <!-- Left columns: Forms details -->
      <div class="md:col-span-2 space-y-6">
        
        <!-- Section: Profile Details -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <h3 class="text-lg font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
            <User class="h-5 w-5 text-indigo-500" />
            <span>{t('profile_details', currentLanguage)}</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label for="p-name" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('full_name', currentLanguage)}</label>
              <input type="text" id="p-name" bind:value={name} required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>

            <div class="space-y-1">
              <label for="p-email" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('email_readonly', currentLanguage)}</label>
              <div class="relative">
                <Mail class="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                <input type="email" id="p-email" value={profile.email} readonly class="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-400 cursor-not-allowed focus:outline-none" />
              </div>
            </div>

            <div class="space-y-1">
              <label for="p-phone" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('phone_number', currentLanguage)}</label>
              <div class="relative">
                <Phone class="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                <input type="text" id="p-phone" bind:value={phone} required class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
            </div>

            <div class="space-y-1">
              <label for="p-regno" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('reg_no_readonly', currentLanguage)}</label>
              <input type="text" id="p-regno" value={profile.registerNumber} readonly class="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-400 cursor-not-allowed focus:outline-none" />
            </div>

            <div class="space-y-1">
              <label for="p-cgpa" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('current_cgpa', currentLanguage)}</label>
              <input type="number" step="0.01" min="0" max="10" id="p-cgpa" bind:value={cgpa} required class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>

            <div class="space-y-1">
              <label for="p-year" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('year_of_study', currentLanguage)}</label>
              <select id="p-year" bind:value={year} class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label for="p-address" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('residential_address', currentLanguage)}</label>
            <div class="relative">
              <MapPin class="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input type="text" id="p-address" bind:value={address} required class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>

        </div>

        <!-- Section: Career Ambitions -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <h3 class="text-lg font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
            <Target class="h-5 w-5 text-indigo-500" />
            <span>{t('career_goals_section', currentLanguage)}</span>
          </h3>

          <div class="space-y-4">
            <div class="space-y-1">
              <label for="p-goal" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('career_goals_bio', currentLanguage)}</label>
              <textarea 
                id="p-goal" 
                bind:value={careerGoal} 
                rows="3"
                placeholder="Full Stack AI Engineer with specialization in SvelteKit and Node.js backend pipelines..." 
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              ></textarea>
            </div>

            <div class="space-y-1">
              <label for="p-lang" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('preferred_ui_lang', currentLanguage)}</label>
              <select id="p-lang" bind:value={preferredLanguage} class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                <option value="en">English</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Links and Save -->
      <div class="space-y-6">
        
        <!-- Social/Portfolio Links -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
          <h3 class="text-base font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
            <Globe class="h-4.5 w-4.5 text-indigo-500" />
            <span>{t('professional_networks', currentLanguage)}</span>
          </h3>

          <div class="space-y-4">
            <div class="space-y-1">
              <label for="p-linkedin" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LinkedIn Profile URL</label>
              <div class="relative">
                <Linkedin class="absolute left-3 top-3 h-4 w-4 text-slate-450" />
                <input type="url" id="p-linkedin" bind:value={linkedin} placeholder="https://linkedin.com/in/..." class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
            </div>

            <div class="space-y-1">
              <label for="p-github" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GitHub Profile URL</label>
              <div class="relative">
                <Github class="absolute left-3 top-3 h-4 w-4 text-slate-450" />
                <input type="url" id="p-github" bind:value={github} placeholder="https://github.com/..." class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
            </div>

            <div class="space-y-1">
              <label for="p-portfolio" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Portfolio URL</label>
              <div class="relative">
                <Globe class="absolute left-3 top-3 h-4 w-4 text-slate-450" />
                <input type="url" id="p-portfolio" bind:value={portfolio} placeholder="https://yourname.dev" class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Save Button -->
        <button 
          type="submit" 
          disabled={saving}
          class="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer transition-opacity disabled:opacity-50"
        >
          {#if saving}
            <Loader class="h-5 w-5 animate-spin" />
            <span>{t('saving', currentLanguage)}</span>
          {:else}
            <Check class="h-5 w-5" />
            <span>{t('save_changes', currentLanguage)}</span>
          {/if}
        </button>

      </div>

    </form>

  </div>
{/if}
