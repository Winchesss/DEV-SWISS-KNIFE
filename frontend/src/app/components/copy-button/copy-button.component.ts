import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-copy-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="copyToClipboard()"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer"
      [class]="copied ? 'bg-success/20 text-success border border-success/30' : 'bg-dark-600 hover:bg-dark-500 text-text-secondary hover:text-text-primary border border-border'"
      [title]="copied ? 'Copied!' : 'Copy to clipboard'">
      <svg *ngIf="!copied" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <svg *ngIf="copied" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {{ copied ? 'Copied!' : 'Copy' }}
    </button>
  `
})
export class CopyButtonComponent {
  @Input() value: string = '';
  copied = false;

  constructor(private cdr: ChangeDetectorRef) {}

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.value);
      this.copied = true;
      this.cdr.markForCheck();
      setTimeout(() => { this.copied = false; this.cdr.markForCheck(); }, 1500);
    } catch {
      const el = document.createElement('textarea');
      el.value = this.value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.copied = true;
      this.cdr.markForCheck();
      setTimeout(() => { this.copied = false; this.cdr.markForCheck(); }, 1500);
    }
  }
}
