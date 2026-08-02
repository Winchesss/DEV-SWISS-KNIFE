import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="fixed left-0 top-0 h-full w-64 bg-dark-800 border-r border-border flex flex-col z-50">
      <!-- Logo -->
      <div class="p-5 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-sm font-bold text-text-primary tracking-tight">Dev Swiss Knife</h1>
            <p class="text-[10px] text-text-muted font-medium">Developer Toolkit</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <p class="text-[10px] uppercase tracking-widest text-text-muted font-semibold px-3 pt-3 pb-2">Tools</p>
        
        <a *ngFor="let item of navItems"
           [routerLink]="item.route"
           routerLinkActive="bg-accent/10 text-accent border-accent/30"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary
                  hover:bg-dark-700 hover:text-text-primary border border-transparent
                  transition-all duration-200 group">
          <span class="w-8 h-8 rounded-md bg-dark-700 group-hover:bg-dark-600 flex items-center justify-center
                       transition-all duration-200" [innerHTML]="item.icon"></span>
          <span>{{ item.label }}</span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-border">
        <p class="text-[10px] text-text-muted text-center">Built with Go + Angular</p>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  navItems = [
    {
      label: 'Number Converter',
      route: '/number-converter',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>'
    },
    {
      label: 'ASCII Inspector',
      route: '/ascii-inspector',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
    },
    {
      label: 'Crypto Hub',
      route: '/crypto-hub',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
    },
    {
      label: 'File Size Converter',
      route: '/filesize-converter',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    }
  ];
}
