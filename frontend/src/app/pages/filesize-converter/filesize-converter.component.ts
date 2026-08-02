import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, FileSizeResponse } from '../../services/api.service';
import { CopyButtonComponent } from '../../components/copy-button/copy-button.component';

@Component({
  selector: 'app-filesize-converter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CopyButtonComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-text-primary">File Size Converter</h2>
        <p class="text-text-muted mt-1">Convert file sizes between different units (Base, SI, IEC).</p>
      </div>

      <div class="card">
        <form [formGroup]="form" (ngSubmit)="convert()" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary">Value</label>
            <input type="number" formControlName="value" placeholder="Enter size" step="any"
                   [class.error]="form.get('value')?.invalid && form.get('value')?.touched">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-text-secondary">From Unit</label>
              <select formControlName="fromUnit" class="w-full">
                <optgroup label="Base">
                  <option value="b">Bits (b)</option>
                  <option value="B">Bytes (B)</option>
                </optgroup>
                <optgroup label="Decimal (SI)">
                  <option value="KB">Kilobytes (KB)</option>
                  <option value="MB">Megabytes (MB)</option>
                  <option value="GB">Gigabytes (GB)</option>
                  <option value="TB">Terabytes (TB)</option>
                  <option value="PB">Petabytes (PB)</option>
                </optgroup>
                <optgroup label="Binary (IEC)">
                  <option value="KiB">Kibibytes (KiB)</option>
                  <option value="MiB">Mebibytes (MiB)</option>
                  <option value="GiB">Gibibytes (GiB)</option>
                  <option value="TiB">Tebibytes (TiB)</option>
                  <option value="PiB">Pebibytes (PiB)</option>
                </optgroup>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-text-secondary">To Unit</label>
              <select formControlName="toUnit" class="w-full">
                <optgroup label="Base">
                  <option value="b">Bits (b)</option>
                  <option value="B">Bytes (B)</option>
                </optgroup>
                <optgroup label="Decimal (SI)">
                  <option value="KB">Kilobytes (KB)</option>
                  <option value="MB">Megabytes (MB)</option>
                  <option value="GB">Gigabytes (GB)</option>
                  <option value="TB">Terabytes (TB)</option>
                  <option value="PB">Petabytes (PB)</option>
                </optgroup>
                <optgroup label="Binary (IEC)">
                  <option value="KiB">Kibibytes (KiB)</option>
                  <option value="MiB">Mebibytes (MiB)</option>
                  <option value="GiB">Gibibytes (GiB)</option>
                  <option value="TiB">Tebibytes (TiB)</option>
                  <option value="PiB">Pebibytes (PiB)</option>
                </optgroup>
              </select>
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

        <div *ngIf="result" class="mt-6 pt-6 border-t border-border animate-fade-in space-y-2">
          <label class="block text-sm font-medium text-text-secondary">Result</label>
          <div class="flex items-center gap-3">
            <input type="text" [value]="result.result + ' ' + result.toUnit" readonly class="flex-1 bg-dark-900 border-border">
            <app-copy-button [value]="result.result.toString()"></app-copy-button>
          </div>
          
          <div class="mt-4 p-4 bg-dark-900 rounded-lg border border-border">
            <p class="text-sm font-medium text-text-secondary mb-1">Conversion Details</p>
            <p class="text-xs text-text-muted">
              {{ form.value.value }} {{ result.fromUnit }} = {{ result.result }} {{ result.toUnit }}
            </p>
            <p class="text-xs text-accent mt-2">
              <span class="font-semibold">Note:</span> SI units use base 10 (1 KB = 1000 B), while IEC units use base 2 (1 KiB = 1024 B).
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FilesizeConverterComponent {
  form: FormGroup;
  result: FileSizeResponse | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private api: ApiService, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      value: [1, [Validators.required, Validators.min(0)]],
      fromUnit: ['MB', Validators.required],
      toUnit: ['GB', Validators.required]
    });
  }

  convert() {
    if (this.form.invalid) return;
    this.loading = true;
    const v = this.form.value;

    this.api.convertFileSize(v.value, v.fromUnit, v.toUnit).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  clearAll() {
    this.form.reset({
      value: 1,
      fromUnit: 'MB',
      toUnit: 'GB'
    });
    this.result = null;
  }
}
