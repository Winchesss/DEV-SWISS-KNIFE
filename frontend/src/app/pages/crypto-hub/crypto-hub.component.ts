import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, CryptoResponse } from '../../services/api.service';
import { CopyButtonComponent } from '../../components/copy-button/copy-button.component';

type Algorithm = 'caesar' | 'vigenere' | 'xor' | 'base64' | 'aes';
type Action = 'encrypt' | 'decrypt';

@Component({
  selector: 'app-crypto-hub',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CopyButtonComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-text-primary">Crypto Hub</h2>
        <p class="text-text-muted mt-1">Encrypt and decrypt strings using various algorithms.</p>
      </div>

      <div class="flex overflow-x-auto border-b border-border hide-scrollbar">
        <button *ngFor="let algo of algorithms" 
                (click)="setAlgorithm(algo.id)"
                class="px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                [class]="selectedAlgorithm === algo.id ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'">
          {{ algo.label }}
        </button>
      </div>

      <div class="card">
        <form [formGroup]="form" (ngSubmit)="execute()" class="space-y-6">
          
          <div class="flex p-1 bg-dark-900 rounded-lg max-w-xs">
            <button type="button" (click)="setAction('encrypt')" 
                    class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all"
                    [class]="action === 'encrypt' ? 'bg-dark-700 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'">
              {{ selectedAlgorithm === 'base64' ? 'Encode' : 'Encrypt' }}
            </button>
            <button type="button" (click)="setAction('decrypt')" 
                    class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all"
                    [class]="action === 'decrypt' ? 'bg-dark-700 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'">
              {{ selectedAlgorithm === 'base64' ? 'Decode' : 'Decrypt' }}
            </button>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary">Text Input</label>
            <textarea formControlName="text" rows="4" placeholder="Enter text here..."
                      [class.error]="form.get('text')?.invalid && form.get('text')?.touched"></textarea>
          </div>

          <!-- Dynamic Fields based on Algorithm -->
          <div *ngIf="selectedAlgorithm === 'caesar'" class="space-y-2 animate-fade-in">
            <label class="block text-sm font-medium text-text-secondary">Shift Amount (Number)</label>
            <input type="number" formControlName="shift" placeholder="e.g., 3"
                   [class.error]="form.get('shift')?.invalid && form.get('shift')?.touched">
          </div>

          <div *ngIf="selectedAlgorithm === 'vigenere'" class="space-y-2 animate-fade-in">
            <label class="block text-sm font-medium text-text-secondary">Keyword (Letters only)</label>
            <input type="text" formControlName="keyword" placeholder="e.g., SECRET"
                   [class.error]="form.get('keyword')?.invalid && form.get('keyword')?.touched">
            <div *ngIf="form.get('keyword')?.errors?.['pattern'] && form.get('keyword')?.touched" class="error-text">
              Keyword must contain only letters.
            </div>
          </div>

          <div *ngIf="selectedAlgorithm === 'xor'" class="space-y-2 animate-fade-in">
            <label class="block text-sm font-medium text-text-secondary">Key (String)</label>
            <input type="text" formControlName="key" placeholder="Enter XOR key"
                   [class.error]="form.get('key')?.invalid && form.get('key')?.touched">
          </div>

          <div *ngIf="selectedAlgorithm === 'aes'" class="space-y-4 animate-fade-in">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-text-secondary">Passphrase</label>
              <input type="text" formControlName="passphrase" placeholder="Enter secure passphrase"
                     [class.error]="form.get('passphrase')?.invalid && form.get('passphrase')?.touched">
            </div>
            <div *ngIf="action === 'decrypt'" class="space-y-2">
              <label class="block text-sm font-medium text-text-secondary">IV (Initialization Vector - Hex format)</label>
              <input type="text" formControlName="iv" placeholder="Enter IV for decryption"
                     [class.error]="form.get('iv')?.invalid && form.get('iv')?.touched">
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button type="submit" [disabled]="form.invalid || loading" class="btn-primary flex-1 opacity-100 disabled:opacity-50">
              {{ loading ? 'Processing...' : 'Execute' }}
            </button>
            <button type="button" (click)="clearAll()" class="btn-danger">
              Clear All
            </button>
          </div>
        </form>

        <div *ngIf="result" class="mt-6 pt-6 border-t border-border animate-fade-in space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary">Result</label>
            <div class="flex items-center gap-3">
              <textarea [value]="result.result" readonly rows="3" class="flex-1 bg-dark-900 border-border resize-none"></textarea>
              <app-copy-button [value]="result.result"></app-copy-button>
            </div>
          </div>
          
          <div *ngIf="result.iv" class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary">Initialization Vector (IV)</label>
            <div class="flex items-center gap-3">
              <input type="text" [value]="result.iv" readonly class="flex-1 bg-dark-900 border-border">
              <app-copy-button [value]="result.iv"></app-copy-button>
            </div>
            <p class="text-xs text-warn">Save this IV! You will need it along with the passphrase to decrypt the message.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CryptoHubComponent {
  algorithms: {id: Algorithm, label: string}[] = [
    {id: 'caesar', label: 'Caesar Cipher'},
    {id: 'vigenere', label: 'Vigenère Cipher'},
    {id: 'xor', label: 'XOR Cipher'},
    {id: 'base64', label: 'Base64'},
    {id: 'aes', label: 'AES-256'}
  ];
  
  selectedAlgorithm: Algorithm = 'caesar';
  action: Action = 'encrypt';
  form: FormGroup;
  result: CryptoResponse | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private api: ApiService, private cdr: ChangeDetectorRef) {
    this.form = this.buildForm();
  }

  setAlgorithm(algo: Algorithm) {
    this.selectedAlgorithm = algo;
    this.form = this.buildForm();
    this.result = null;
  }

  setAction(act: Action) {
    this.action = act;
    this.form = this.buildForm();
    this.result = null;
  }

  buildForm(): FormGroup {
    const group: any = {
      text: ['', Validators.required]
    };

    if (this.selectedAlgorithm === 'caesar') {
      group.shift = [3, Validators.required];
    } else if (this.selectedAlgorithm === 'vigenere') {
      group.keyword = ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]];
    } else if (this.selectedAlgorithm === 'xor') {
      group.key = ['', Validators.required];
    } else if (this.selectedAlgorithm === 'aes') {
      group.passphrase = ['', Validators.required];
      if (this.action === 'decrypt') {
        group.iv = ['', Validators.required];
      }
    }

    return this.fb.group(group);
  }

  execute() {
    if (this.form.invalid) return;
    this.loading = true;
    const v = this.form.value;
    
    let obs$;
    switch (this.selectedAlgorithm) {
      case 'caesar':
        obs$ = this.api.caesarCipher(v.text, v.shift, this.action);
        break;
      case 'vigenere':
        obs$ = this.api.vigenereCipher(v.text, v.keyword, this.action);
        break;
      case 'xor':
        obs$ = this.api.xorCipher(v.text, v.key, this.action);
        break;
      case 'base64':
        obs$ = this.api.base64(v.text, this.action === 'encrypt' ? 'encode' : 'decode');
        break;
      case 'aes':
        obs$ = this.api.aes(v.text, v.passphrase, this.action, v.iv);
        break;
    }

    if (obs$) {
      obs$.subscribe({
        next: (res) => {
          this.result = res;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
    }
  }

  clearAll() {
    this.form = this.buildForm();
    this.result = null;
  }
}
