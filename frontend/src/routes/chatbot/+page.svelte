<script>
  import { authStore } from '$lib/stores/authStore';
  import { aiService } from '$lib/services/aiService';
  import { showToast } from '$lib/stores/toastStore';
  import { t } from '$lib/utils/translate';
  import { onMount } from 'svelte';
  import { 
    Send, Sparkles, User, MessageSquare, Trash2, 
    Bot, Loader, Compass, Lightbulb, GraduationCap 
  } from '@lucide/svelte';

  import { langStore } from '$lib/stores/themeStore';

  let currentLanguage = $derived($langStore || 'en');
  let messages = $state([]);
  let inputMessage = $state('');
  let loading = $state(true);
  let sending = $state(false);
  let chatWindow;

  async function loadChatHistory() {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    try {
      let fetched = null;
      if (import.meta.env.VITE_FIREBASE_API_KEY === "mock-api-key-for-development-only" || !import.meta.env.VITE_FIREBASE_API_KEY) {
        const chats = JSON.parse(localStorage.getItem('cs_chat_history') || '{}');
        fetched = chats[uid] || null;
      } else {
        // Firestore call
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('$lib/firebase/firebaseClient');
        const snap = await getDoc(doc(db, 'chatHistory', uid));
        if (snap.exists()) fetched = snap.data();
      }

      if (fetched && fetched.messages) {
        messages = fetched.messages;
      } else {
        // Welcoming seed message
        messages = [{
          sender: "ai",
          text: `Hello ${$authStore.profile?.name || 'Student'}! I'm your AI Career Mentor. I can help you with resume optimizations, mock interview guidelines, higher studies inquiries, and placement tips. Ask me anything!`,
          timestamp: new Date().toISOString()
        }];
      }
    } catch (e) {
      showToast("Error loading chat", "error");
    } finally {
      loading = false;
      scrollToBottom();
    }
  }

  let loadedUid = $state(null);
  $effect(() => {
    const userState = $authStore;
    const uid = userState.user?.uid;
    if (uid && loadedUid !== uid) {
      loadedUid = uid;
      loadChatHistory();
    }
  });

  async function saveChatHistory() {
    const uid = $authStore.user?.uid;
    if (!uid) return;

    const data = { studentId: uid, messages, updatedAt: new Date().toISOString() };
    if (import.meta.env.VITE_FIREBASE_API_KEY === "mock-api-key-for-development-only" || !import.meta.env.VITE_FIREBASE_API_KEY) {
      const chats = JSON.parse(localStorage.getItem('cs_chat_history') || '{}');
      chats[uid] = data;
      localStorage.setItem('cs_chat_history', JSON.stringify(chats));
    } else {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('$lib/firebase/firebaseClient');
      await setDoc(doc(db, 'chatHistory', uid), data);
    }
  }

  async function handleSend(e) {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const msgText = inputMessage.trim();
    inputMessage = '';
    sending = true;

    // Append user message
    messages.push({
      sender: "student",
      text: msgText,
      timestamp: new Date().toISOString()
    });
    scrollToBottom();

    try {
      const uid = $authStore.user?.uid;
      const response = await aiService.getChatMentorResponse(uid, messages, msgText);
      const text = typeof response === 'object' ? response.text : response;
      const ragSources = typeof response === 'object' ? (response.ragSources || []) : [];
      
      messages.push({
        sender: "ai",
        text: text,
        ragSources: ragSources,
        timestamp: new Date().toISOString()
      });
      scrollToBottom();
      await saveChatHistory();
    } catch (err) {
      showToast("Failed to connect with AI Mentor", "error");
      messages.pop(); // Remove student message on failure to let them retry
    } finally {
      sending = false;
    }
  }

  async function handleClearHistory() {
    if (!confirm("Are you sure you want to clear chat history?")) return;

    messages = [{
      sender: "ai",
      text: `Hello ${$authStore.profile?.name || 'Student'}! Chat history cleared. What can I help you with today?`,
      timestamp: new Date().toISOString()
    }];
    await saveChatHistory();
    showToast("History cleared", "success");
  }

  function handleSuggestionClick(suggestedText) {
    inputMessage = suggestedText;
    handleSend();
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }
    }, 50);
  }

  const suggestions = [
    { text: "What are some tips to optimize my resume?", icon: MessageSquare },
    { text: "Give me a checklist for placements prep", icon: Compass },
    { text: "What higher studies routes are available?", icon: GraduationCap }
  ];
</script>

<svelte:head>
  <title>Career Mentor - CareerReady AI</title>
</svelte:head>

<div class="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
  
  <!-- Chat Header -->
  <div class="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20">
    <div class="flex items-center gap-3 text-left">
      <div class="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
        <Bot class="h-5 w-5" />
      </div>
      <div>
        <h3 class="font-bold text-sm text-slate-850 dark:text-white flex items-center gap-1.5">
          <span>{t('chatbot', currentLanguage)}</span>
          <Sparkles class="h-3.5 w-3.5 text-indigo-500" />
        </h3>
        <span class="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
          ⚡ Gemini 2.5 + RAG Grounding Active
        </span>
      </div>
    </div>

    <button 
      onclick={handleClearHistory}
      class="p-2 border border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 text-slate-500 rounded-xl transition-colors shrink-0"
      title="Clear Chat Logs"
    >
      <Trash2 class="h-4 w-4" />
    </button>
  </div>

  <!-- Chat Message Screen -->
  <div 
    bind:this={chatWindow}
    class="flex-1 overflow-y-auto p-6 space-y-4"
  >
    {#if loading}
      <div class="flex items-center justify-center h-full">
        <Loader class="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    {:else}
      {#each messages as msg}
        <div class="flex gap-3 max-w-[85%] sm:max-w-[70%] {msg.sender === 'student' ? 'ml-auto flex-row-reverse' : 'mr-auto text-left' }">
          
          <!-- Avatar Icon -->
          <div class="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm
            {msg.sender === 'student' 
              ? 'bg-indigo-500 text-white' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}"
          >
            {#if msg.sender === 'student'}
              <User class="h-4 w-4" />
            {:else}
              <Bot class="h-4 w-4" />
            {/if}
          </div>

          <!-- Speech bubble -->
          <div class="space-y-1">
            <div class="p-3 md:p-4 rounded-2xl text-xs leading-relaxed border
              {msg.sender === 'student' 
                ? 'bg-indigo-600 border-indigo-750 text-white rounded-tr-none' 
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-350 rounded-tl-none markdown'}"
            >
              <!-- Format text markdown blocks if sender is AI -->
              {#if msg.sender === 'ai'}
                <!-- Simple inline markdown parsing to handle headers and bullets -->
                {@html msg.text
                  .replace(/### (.*)/g, '<h4 class="font-extrabold text-xs text-slate-800 dark:text-white mt-3 mb-1">$1</h4>')
                  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                  .replace(/- (.*)/g, '<div class="pl-3 mt-1 flex items-start gap-1.5"><span>•</span><span>$1</span></div>')
                  .replace(/\n/g, '<br/>')}
                
                {#if msg.ragSources && msg.ragSources.length > 0}
                  <div class="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px]">
                    <div class="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                      <Sparkles class="h-3 w-3 shrink-0" />
                      <span>Grounded via: {msg.ragSources[0].title}</span>
                      <span class="ml-auto font-mono bg-purple-500/10 px-1 rounded">{msg.ragSources[0].similarityScore}% match</span>
                    </div>
                  </div>
                {/if}
              {:else}
                {msg.text}
              {/if}
            </div>
            <span class="text-[9px] text-slate-400 block px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

        </div>
      {/each}

      {#if sending}
        <div class="flex gap-3 max-w-[70%] mr-auto text-left">
          <div class="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
            <Bot class="h-4 w-4" />
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl rounded-tl-none flex items-center gap-1.5 py-4">
            <span class="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></span>
            <span class="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span class="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Suggested triggers row (only show when not sending/loading) -->
  {#if !sending && !loading && messages.length <= 2}
    <div class="px-6 py-3 border-t border-slate-150 dark:border-slate-850 flex flex-wrap gap-2 text-left bg-slate-50/50 dark:bg-slate-950/10">
      {#each suggestions as sug}
        <button 
          onclick={() => handleSuggestionClick(t(sug.text, currentLanguage))}
          class="flex items-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-500/[0.01] rounded-xl text-xs font-bold text-slate-600 dark:text-slate-405 transition-all text-left cursor-pointer"
        >
          <sug.icon class="h-3.5 w-3.5 text-indigo-500" />
          <span>{t(sug.text, currentLanguage)}</span>
        </button>
      {/each}
    </div>
  {/if}

  <!-- Chat Input Box -->
  <form 
    onsubmit={handleSend}
    class="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-950/20"
  >
    <input 
      type="text" 
      bind:value={inputMessage}
      placeholder={t('mentor_chat_placeholder', currentLanguage)}
      disabled={loading || sending}
      class="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-850 dark:text-white placeholder-slate-450 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
    />
    <button 
      type="submit"
      disabled={loading || sending || !inputMessage.trim()}
      class="p-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl shadow shadow-indigo-500/10 hover:opacity-95 transition-opacity disabled:opacity-50 shrink-0 cursor-pointer"
    >
      <Send class="h-4 w-4" />
    </button>
  </form>

</div>
