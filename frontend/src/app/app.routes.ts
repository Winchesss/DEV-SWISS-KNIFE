import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'number-converter', pathMatch: 'full' },
  {
    path: 'number-converter',
    loadComponent: () =>
      import('./pages/number-converter/number-converter.component').then(
        (m) => m.NumberConverterComponent,
      ),
  },
  {
    path: 'ascii-inspector',
    loadComponent: () =>
      import('./pages/ascii-inspector/ascii-inspector.component').then(
        (m) => m.AsciiInspectorComponent,
      ),
  },
  {
    path: 'crypto-hub',
    loadComponent: () =>
      import('./pages/crypto-hub/crypto-hub.component').then((m) => m.CryptoHubComponent),
  },
  {
    path: 'filesize-converter',
    loadComponent: () =>
      import('./pages/filesize-converter/filesize-converter.component').then(
        (m) => m.FilesizeConverterComponent,
      ),
  },
  { path: '**', redirectTo: 'number-converter' },
];
