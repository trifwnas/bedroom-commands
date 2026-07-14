export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns: Record<string, number[]> = {
      light: [10], medium: [20], success: [10, 50, 10], warning: [20, 50, 20],
    };
    navigator.vibrate(patterns[type] || [10]);
  }
}

export function shareCommand(command: string, category: string): void {
  const text = `Bedroom Commands - ${category}\n\n"${command}"`;
  if (navigator.share) {
    navigator.share({ title: 'Bedroom Commands', text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
