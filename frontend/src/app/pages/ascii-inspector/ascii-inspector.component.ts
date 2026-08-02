import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, CharCode } from '../../services/api.service';
import { CopyButtonComponent } from '../../components/copy-button/copy-button.component';

@Component({
  selector: 'app-ascii-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule, CopyButtonComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-text-primary">ASCII Inspector</h2>
        <p class="text-text-muted mt-1">Convert text to ASCII codes and vice versa.</p>
      </div>

      <!-- Text to Codes -->
      <div class="card space-y-4">
        <h3 class="text-lg font-semibold text-text-primary border-b border-border pb-2">Text → Codes</h3>
        <textarea [(ngModel)]="textInput" rows="3" placeholder="Enter text here..."></textarea>
        
        <div class="flex items-center gap-3">
          <button (click)="convertTextToCodes()" [disabled]="!textInput || loadingText" class="btn-primary flex-1 disabled:opacity-50">
            {{ loadingText ? 'Converting...' : 'Convert to Codes' }}
          </button>
          <button (click)="clearTextToCodes()" class="btn-danger">Clear All</button>
        </div>

        <div *ngIf="charCodes.length > 0" class="mt-4 overflow-hidden rounded-lg border border-border">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-text-secondary uppercase bg-dark-900 border-b border-border">
              <tr>
                <th class="px-4 py-3">Character</th>
                <th class="px-4 py-3">Decimal</th>
                <th class="px-4 py-3">Hex</th>
                <th class="px-4 py-3 w-20">Copy</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of charCodes; let i = index" [class.bg-dark-800]="i % 2 === 0" [class.bg-dark-900]="i % 2 !== 0" class="border-b border-border last:border-0 hover:bg-dark-700 transition-colors">
                <td class="px-4 py-2 font-mono text-text-primary">{{ c.char === ' ' ? '(space)' : c.char }}</td>
                <td class="px-4 py-2 font-mono text-accent">{{ c.decimal }}</td>
                <td class="px-4 py-2 font-mono text-success">{{ c.hex }}</td>
                <td class="px-4 py-2">
                  <app-copy-button [value]="c.decimal.toString()"></app-copy-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Codes to Text -->
      <div class="card space-y-4">
        <h3 class="text-lg font-semibold text-text-primary border-b border-border pb-2">Codes → Text</h3>
        <textarea [(ngModel)]="codesInput" rows="3" placeholder="Enter comma-separated decimal codes (e.g., 72, 101, 108, 108, 111)"></textarea>
        
        <div class="flex items-center gap-3">
          <button (click)="convertCodesToText()" [disabled]="!codesInput || loadingCodes" class="btn-primary flex-1 disabled:opacity-50">
            {{ loadingCodes ? 'Converting...' : 'Convert to Text' }}
          </button>
          <button (click)="clearCodesToText()" class="btn-danger">Clear All</button>
        </div>

        <div *ngIf="textResult" class="mt-4 pt-4 border-t border-border animate-fade-in">
          <label class="block text-sm font-medium text-text-secondary mb-2">Resulting Text</label>
          <div class="flex items-center gap-3">
            <input type="text" [value]="textResult" readonly class="flex-1 bg-dark-900 border-border">
            <app-copy-button [value]="textResult"></app-copy-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AsciiInspectorComponent {
  textInput = '';
  charCodes: CharCode[] = [];
  loadingText = false;

  codesInput = '';
  textResult = '';
  loadingCodes = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  convertTextToCodes() {
    if (!this.textInput) return;
    this.loadingText = true;
    this.api.textToCodes(this.textInput).subscribe({
      next: (res) => {
        this.charCodes = res.characters;
        this.loadingText = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loadingText = false; this.cdr.markForCheck(); }
    });
  }

  clearTextToCodes() {
    this.textInput = '';
    this.charCodes = [];
  }

  convertCodesToText() {
    if (!this.codesInput) return;
    const codes = this.codesInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (codes.length === 0) return;

    this.loadingCodes = true;
    this.api.codesToText(codes).subscribe({
      next: (res) => {
        this.textResult = res.text;
        this.loadingCodes = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loadingCodes = false; this.cdr.markForCheck(); }
    });
  }

  clearCodesToText() {
    this.codesInput = '';
    this.textResult = '';
  }
}
