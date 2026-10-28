<script>
  import { toastStore } from '../../stores/toastStore';
  import { CheckCircle2, AlertCircle, X } from '@lucide/svelte';

  function removeToast(id) {
    toastStore.update(toasts => toasts.filter(t => t.id !== id));
  }
</script>

<div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
  {#each $toastStore as toast (toast.id)}
    <div 
      class="pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-in
        {toast.type === 'success' 
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}"
    >
      <div class="flex items-center gap-3">
        {#if toast.type === 'success'}
          <CheckCircle2 class="h-5 w-5 shrink-0" />
        {:else}
          <AlertCircle class="h-5 w-5 shrink-0" />
        {/if}
        <span class="text-sm font-medium">{toast.message}</span>
      </div>
      <button 
        onclick={() => removeToast(toast.id)} 
        class="ml-4 p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  {/each}
</div>

<style>
  @keyframes slide-in {
    from {
      transform: translateY(1rem) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
