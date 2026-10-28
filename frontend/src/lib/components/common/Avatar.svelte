<script>
  let { 
    src = '', 
    name = '', 
    size = 'md', 
    rounded = 'rounded-xl',
    class: customClass = '',
    alt = 'User avatar'
  } = $props();

  let imageError = $state(false);

  // Detect legacy or placeholder unsplash URLs that were mistakenly assigned as defaults
  let isLegacyStockPhoto = $derived(
    typeof src === 'string' && (
      src.includes('images.unsplash.com/photo-1535713875002') ||
      src.includes('images.unsplash.com/photo-1539571696357') ||
      src.includes('pravatar.cc') ||
      src.includes('dicebear.com')
    )
  );

  let hasValidImage = $derived(
    Boolean(src) && 
    typeof src === 'string' && 
    src.trim().length > 0 && 
    !isLegacyStockPhoto && 
    !imageError
  );

  // Compute clean, stable initials from user name or email
  let initials = $derived.by(() => {
    if (!name) return 'CR';
    const clean = name.trim();
    if (clean.includes('@')) {
      return clean.charAt(0).toUpperCase();
    }
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  });

  // Size styling map
  const sizeClasses = {
    'xs': 'h-6 w-6 text-[10px]',
    'sm': 'h-8 w-8 text-xs',
    'md': 'h-10 w-10 text-sm',
    'lg': 'h-14 w-14 text-base',
    'xl': 'h-20 w-20 text-xl',
    '2xl': 'h-28 w-28 text-3xl font-extrabold'
  };

  let resolvedSizeClass = $derived(sizeClasses[size] || size);

  function handleImageError() {
    imageError = true;
  }
</script>

<div 
  class="relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none {resolvedSizeClass} {rounded} {customClass} ring-2 ring-emerald-500/20 shadow-sm"
  role="img"
  aria-label={alt || name || 'User avatar'}
>
  {#if hasValidImage}
    <img 
      {src} 
      {alt}
      onerror={handleImageError}
      class="h-full w-full object-cover {rounded}"
      loading="lazy"
    />
  {:else}
    <!-- Consistent, clean default avatar with CareerReady brand green gradient -->
    <div 
      class="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white font-bold tracking-wider select-none shadow-inner"
    >
      <span>{initials}</span>
    </div>
  {/if}
</div>
