import { Routes } from '@angular/router';

/** Pantalla de ejemplo del taller: Documentos y registros del clasificador programático. */
export const PRESUPUESTO_ROUTES: Routes = [
  {
    path: 'procesos/clasificador-programatico',
    loadComponent: () =>
      import('./clasificador-programatico/pages/documents/clasificador-programatico-documents.component').then(
        (m) => m.ClasificadorProgramaticoDocumentsComponent,
      ),
  },
  {
    path: 'procesos/clasificador-programatico/solicitud',
    loadComponent: () =>
      import('./clasificador-programatico/pages/solicitud/clasificador-programatico-request.component').then(
        (m) => m.ClasificadorProgramaticoRequestComponent,
      ),
  },
];
