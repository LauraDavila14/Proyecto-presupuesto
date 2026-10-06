import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DocumentsRecordsPageComponent } from '../../../../../shared/components/documents-records-page/documents-records-page.component';
import { CLASIFICADOR_PROGRAMATICO_DOCUMENTS_CONFIG } from '../../config/clasificador-programatico-documents.config';

/**
 * «Documentos y registros» del clasificador programático (nodo de Figma 406:10759): pantalla de ejemplo
 * del taller, sin proceso real detrás. La pantalla entera la arma `siaf-documents-records-page`; acá solo
 * se le pasa la configuración fija con las filas del diseño.
 */
@Component({
  selector: 'siaf-clasificador-programatico-documents',
  standalone: true,
  imports: [DocumentsRecordsPageComponent],
  template: `<siaf-documents-records-page [config]="config" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClasificadorProgramaticoDocumentsComponent {
  readonly config = CLASIFICADOR_PROGRAMATICO_DOCUMENTS_CONFIG;
}
