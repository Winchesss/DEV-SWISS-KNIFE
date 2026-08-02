import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CopyButtonComponent } from '../../components/copy-button/copy-button.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-number-converter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CopyButtonComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-text-primary">Number Converter</h2>
        <p class="text-text-muted mt-1">Convert numbers between different bases with real-time validation.</p>
      </div>

      <div class="card">
        <form [formGroup]="form" (ngSubmit)="convert()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-text-secondary">From Base</label>
              <select formControlName="fromBasePreset" class="w-full">
                <option [ngValue]="2">Binary (Base 2)</option>
                <option [ngValue]="8">Octal (Base 8)</option>
                <option [ngValue]="10">Decimal (Base 10)</option>
                <option [ngValue]="16">Hexadecimal (Base 16)</option>
                <option [ngValue]="0">Custom</option>
              </select>
              <div *ngIf="form.get('fromBasePreset')?.value === 0" class="mt-2 animate-fade-in">
                <input type="number" formControlName="fromBase" placeholder="Enter base (2-36)" min="2" max="36"
                       [class.error]="form.get('fromBase')?.invalid && form.get('fromBase')?.touched">
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-text-secondary">To Base</label>
              <select formControlName="toBasePreset" class="w-full">
                <option [ngValue]="2">Binary (Base 2)</option>
                <option [ngValue]="8">Octal (Base 8)</option>
                <option [ngValue]="10">Decimal (Base 10)</option>
                <option [ngValue]="16">Hexadecimal (Base 16)</option>
                <option [ngValue]="0">Custom</option>
              </select>
              <div *ngIf="form.get('toBasePreset')?.value === 0" class="mt-2 animate-fade-in">
                <input type="number" formControlName="toBase" placeholder="Enter base (2-36)" min="2" max="36"
                       [class.error]="form.get('toBase')?.invalid && form.get('toBase')?.touched">
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary">Value</label>
            <input type="text" formControlName="value" placeholder="Enter number to convert"
                   [class.error]="form.get('value')?.invalid && form.get('value')?.touched">
            <div *ngIf="form.get('value')?.invalid && form.get('value')?.touched" class="error-text">
              Invalid characters for the selected base.
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button type="submit" [disabled]="form.invalid || loading" class="btn-primary flex-1 opacity-100 disabled:opacity-50">
              {{ loading ? 'Converting...' : 'Convert' }}
            </button>
            <button type="button" (click)="clearAll()" class="btn-danger">
              Clear All
            </button>
          </div>
        </form>

        <div *ngIf="result" class="mt-6 pt-6 border-t border-border animate-fade-in">
          <label class="block text-sm font-medium text-text-secondary mb-2">Result (Base {{ form.value.toBasePreset === 0 ? form.value.toBase : form.value.toBasePreset }})</label>
          <div class="flex items-center gap-3">
            <input type="text" [value]="result" readonly class="flex-1 bg-dark-900 border-border">
            <app-copy-button [value]="result"></app-copy-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NumberConverterComponent implements OnDestroy {
  form: FormGroup;
  result = '';
  loading = false;
  destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private api: ApiService, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      fromBasePreset: [10],
      fromBase: [10, [Validators.min(2), Validators.max(36)]],
      toBasePreset: [2],
      toBase: [2, [Validators.min(2), Validators.max(36)]],
      value: ['', [Validators.required, this.baseValidator()]]
    });

    this.form.get('fromBasePreset')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if (val !== 0) this.form.patchValue({ fromBase: val });
      this.form.get('value')?.updateValueAndValidity();
    });

    this.form.get('fromBase')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.form.get('value')?.updateValueAndValidity();
    });
    
    this.form.get('toBasePreset')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if (val !== 0) this.form.patchValue({ toBase: val });
    });
  }

  baseValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      if (!this.form) return null;
      
      const preset = this.form.get('fromBasePreset')?.value;
      const base = preset === 0 ? this.form.get('fromBase')?.value : preset;
      
      if (!base || base < 2 || base > 36) return null;
      
      const val = control.value.toString().toUpperCase();
      const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substring(0, base);
      
      for (let i = 0; i < val.length; i++) {
        if (!validChars.includes(val[i])) {
          return { invalidBase: true };
        }
      }
      return null;
    };
  }

  convert() {
    if (this.form.invalid) return;
    
    this.loading = true;
    const v = this.form.value;
    const fromB = v.fromBasePreset === 0 ? v.fromBase : v.fromBasePreset;
    const toB = v.toBasePreset === 0 ? v.toBase : v.toBasePreset;
    
    this.api.convertNumber({
      value: v.value,
      fromBase: fromB,
      toBase: toB
    }).subscribe({
      next: (res) => {
        this.result = res.result;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  clearAll() {
    this.form.reset({
      fromBasePreset: 10,
      fromBase: 10,
      toBasePreset: 2,
      toBase: 2,
      value: ''
    });
    this.result = '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
