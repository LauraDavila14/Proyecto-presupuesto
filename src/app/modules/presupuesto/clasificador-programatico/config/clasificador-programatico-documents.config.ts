import type {
  DocumentsRecordsColumn,
  DocumentsRecordsConfig,
  DocumentsRecordsCreateProcessOption,
  DocumentsRecordsFilterOption,
  DocumentsRecordsMenuOption,
  DocumentsRecordsRow,
} from '../../../../shared/types/documents-records.types';
import { buildProcessBreadcrumbs } from '../../../../shared/utils/breadcrumbs.util';
import { PROCESS_ID, PROCESS_ROUTE, REQUEST_ROUTE } from './clasificador-programatico.rutas';

const NOMBRE_DOCUMENTO = 'Solicitud de clasificador programático';
const NOMBRE_DOCUMENTO_UE = 'Solicitud de clasificador programático UE';
const NOMBRE_DOCUMENTO_UE_CON_PLAZOS = 'Solicitud de clasificador programático UE - Con plazos';
const TIPOS_ACCION = ['Creación', 'Modificación', 'Anulación'];

/**
 * Configuración de «Documentos y registros» del clasificador programático. Es una pantalla de ejemplo del
 * taller (nodo de Figma 406:10759): no hay modelo, API ni backend simulado detrás, así que las filas de la
 * pestaña Documentos son fijas (las mismas del diseño).
 *
 * `modoConsulta` deja el botón «Crear documento» (con `createDocumentOptions`) y saca «Verificar»/«Aprobar» y el
 * filtrado de filas por rol — así se ve igual para Creador y Aprobador, como en el diseño. El popover «Crear
 * documento» ofrece dos documentos (UE y UE - Con plazos) con los mismos tres tipos de acción cada uno; como
 * todavía no hay una pantalla distinta para «Con plazos», ambos llevan a la misma pantalla de solicitud (nodo de
 * Figma 406:10759), que tampoco graba en un backend real: sus registros viven en memoria del componente.
 */

const documentColumns: DocumentsRecordsColumn[] = [
  { key: 'document', label: 'Documento', visibility: 'visible', group: 'default', widthClass: 'w-[280px]' },
  { key: 'number', label: 'Número', visibility: 'visible', group: 'default', widthClass: 'w-[160px]' },
  { key: 'actionType', label: 'Tipo de acción', visibility: 'visible', group: 'default', widthClass: 'w-[140px]' },
  { key: 'status', label: 'Estado', visibility: 'visible', group: 'default', widthClass: 'w-[120px]', kind: 'flow-status' },
  { key: 'system', label: 'Sistema', visibility: 'visible', group: 'default', widthClass: 'w-[150px]' },
  { key: 'date', label: 'Fecha de registro', visibility: 'visible', group: 'default', widthClass: 'w-[120px]' },
  { key: 'entity', label: 'Entidad', visibility: 'visible', group: 'default', widthClass: 'w-[280px]' },
];

const recordColumns: DocumentsRecordsColumn[] = [
  { key: 'codigo', label: 'Código', visibility: 'visible', group: 'default', widthClass: 'w-[160px]' },
  { key: 'denominacion', label: 'Denominación', visibility: 'visible', group: 'default', widthClass: 'min-w-[320px]' },
];

const fieldsMenuOptions: DocumentsRecordsMenuOption[] = [
  { label: 'Documento' },
  { label: 'Tipo de acción' },
  { label: 'Estado' },
  { label: 'Fecha de registro' },
  { label: 'Entidad' },
];

const filterCampoOptions: DocumentsRecordsFilterOption[] = [
  { label: 'Documento', value: 'document' },
  { label: 'Número', value: 'number' },
  { label: 'Tipo de acción', value: 'actionType' },
  { label: 'Estado', value: 'status' },
  { label: 'Entidad', value: 'entity' },
];

const filterValorOptions: DocumentsRecordsFilterOption[] = [{ label: 'Aceptado', value: 'Aceptado' }];

// Filas de ejemplo del diseño: mismos datos repetidos, solo cambia el número.
const documentRows: DocumentsRecordsRow[] = ['0005', '0004', '0003', '0002', '0001'].map((numero) => ({
  document: NOMBRE_DOCUMENTO,
  number: numero,
  actionType: 'Creación',
  status: 'Aceptado',
  system: 'Presupuesto',
  date: '15/06/2026',
  entity: 'Ministerio de Economía y Finanzas',
}));

const createDocumentOptions: DocumentsRecordsCreateProcessOption[] = [
  {
    id: 'clasificador-programatico',
    label: 'Clasificador programático',
    route: REQUEST_ROUTE,
    documents: [NOMBRE_DOCUMENTO_UE, NOMBRE_DOCUMENTO_UE_CON_PLAZOS],
    documentOptions: [
      { label: NOMBRE_DOCUMENTO_UE, route: REQUEST_ROUTE, actionTypes: TIPOS_ACCION },
      { label: NOMBRE_DOCUMENTO_UE_CON_PLAZOS, route: REQUEST_ROUTE, actionTypes: TIPOS_ACCION },
    ],
    actionTypes: TIPOS_ACCION,
  },
];

export const CLASIFICADOR_PROGRAMATICO_DOCUMENTS_CONFIG: DocumentsRecordsConfig = {
  title: 'Clasificador programático',
  processId: PROCESS_ID,
  defaultRequestRoute: REQUEST_ROUTE,
  createDocumentOptions,
  modoConsulta: true,
  breadcrumbs: buildProcessBreadcrumbs(PROCESS_ID, PROCESS_ROUTE),
  documentRows,
  recordRows: [],
  documentColumns,
  recordColumns,
  documentTableMinWidthClass: 'min-w-[1250px]',
  recordTableMinWidthClass: 'min-w-[480px]',
  recordTrackKey: 'codigo',
  recordHistoryDocumentLabel: NOMBRE_DOCUMENTO,
  recordHistoryKind: 'documento',
  statusFilterOptions: ['Aceptado'],
  actionTypeFilterOptions: TIPOS_ACCION,
  filterCampoOptions,
  filterValorOptions,
  fieldsMenuOptions,
};
