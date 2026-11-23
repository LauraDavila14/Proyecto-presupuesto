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
const TIPOS_ACCION = ['Creación', 'Modificación', 'Anulación'];
const TIPOS_ACCION_CREAR = ['Creación', 'Modificación'];

/**
 * Configuración de «Documentos y registros» del clasificador programático. Es una pantalla de ejemplo del
 * taller (nodo de Figma 406:10759): no hay modelo, API ni backend simulado detrás, así que las filas de la
 * pestaña Documentos son fijas (las mismas del diseño). La pestaña Registros (nodo 3326:462158) muestra 10
 * registros fijos con cabecera agrupada (estructura programática, clasificador funcional y vigencia), casillas y
 * los filtros Tipo (PP, AC, APNOP) y Estado del registro.
 *
 * `modoConsulta` deja el botón «Crear documento» (con `createDocumentOptions`) y saca «Verificar»/«Aprobar» y el
 * filtrado de filas por rol — así se ve igual para Creador y Aprobador, como en el diseño. El popover «Crear
 * documento» ofrece un solo documento («Solicitud de clasificador programático») con los tipos de acción
 * Creación y Modificación; lleva a la pantalla de solicitud (nodo de Figma 406:10759), que tampoco
 * graba en un backend real: sus registros viven en memoria del componente.
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

const ESTRUCTURA = 'Estructura programática';
const FUNCIONAL = 'Clasificador funcional';
const VIGENCIA = 'Vigencia';

const recordColumns: DocumentsRecordsColumn[] = [
  { key: 'categoria', label: 'Categ. pres.', visibility: 'visible', group: 'default', widthClass: 'w-[110px]', grupo: ESTRUCTURA },
  { key: 'programa', label: 'Programa', visibility: 'visible', group: 'default', widthClass: 'w-[110px]', grupo: ESTRUCTURA },
  { key: 'producto', label: 'Prod / Proy', visibility: 'visible', group: 'default', widthClass: 'w-[110px]', grupo: ESTRUCTURA },
  { key: 'actividad', label: 'Act / AI / Obr', visibility: 'visible', group: 'default', widthClass: 'w-[130px]', grupo: ESTRUCTURA },
  { key: 'finalidad', label: 'Finalidad', visibility: 'visible', group: 'default', widthClass: 'w-[110px]', grupo: ESTRUCTURA },
  { key: 'funcion', label: 'Función', visibility: 'visible', group: 'default', widthClass: 'w-[100px]', grupo: FUNCIONAL },
  { key: 'division', label: 'Div_F', visibility: 'visible', group: 'default', widthClass: 'w-[100px]', grupo: FUNCIONAL },
  { key: 'grupoFuncional', label: 'Grp_F', visibility: 'visible', group: 'default', widthClass: 'w-[100px]', grupo: FUNCIONAL },
  { key: 'fechaDesde', label: 'Fecha desde', visibility: 'visible', group: 'default', widthClass: 'w-[130px]', grupo: VIGENCIA },
  { key: 'fechaHasta', label: 'Fecha hasta', visibility: 'visible', group: 'default', widthClass: 'w-[130px]', grupo: VIGENCIA },
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

// Registros de ejemplo del diseño (nodo de Figma 3326:462158): estructura programática, clasificador funcional y vigencia.
const registroEjemplo = (
  categoria: string,
  [programa, producto, actividad]: [string, string, string],
  [funcion, division, grupoFuncional]: [string, string, string],
  indice: number,
): DocumentsRecordsRow => ({
  recordId: `reg-${indice + 1}`,
  categoria,
  programa,
  producto,
  actividad,
  finalidad: '-',
  funcion,
  division,
  grupoFuncional,
  fechaDesde: '26/10/2025',
  fechaHasta: '-',
  estado: 'Activo',
});

const recordRows: DocumentsRecordsRow[] = [
  registroEjemplo('PP', ['0062', '3000144', '5004339'], ['02', '002', '0002'], 0),
  registroEjemplo('PP', ['0062', '3000260', '5002719'], ['02', '002', '0002'], 1),
  registroEjemplo('PP', ['0133', '2732524', '0000420'], ['02', '002', '0002'], 2),
  registroEjemplo('PP', ['0133', '2732524', '0000426'], ['02', '002', '0002'], 3),
  registroEjemplo('AC', ['-', '-', '5000001'], ['02', '002', '0002'], 4),
  registroEjemplo('AC', ['-', '-', '5000002'], ['02', '002', '0002'], 5),
  registroEjemplo('AC', ['-', '2355382', '0000420'], ['03', '006', '0010'], 6),
  registroEjemplo('AC', ['-', '2355382', '0000424'], ['03', '006', '0010'], 7),
  registroEjemplo('APNOP', ['-', '-', '5000643'], ['02', '002', '0002'], 8),
  registroEjemplo('APNOP', ['-', '2355896', '0000158'], ['17', '054', '0123'], 9),
];

const recordFilterCampoOptions: DocumentsRecordsFilterOption[] = [
  { label: 'Tipo', value: 'categoria' },
  { label: 'Estado del registro', value: 'estado' },
];

const recordFilterValorOptions: DocumentsRecordsFilterOption[] = ['PP', 'AC', 'APNOP', 'Activo'].map((valor) => ({ label: valor, value: valor }));

const createDocumentOptions: DocumentsRecordsCreateProcessOption[] = [
  {
    id: 'clasificador-programatico',
    label: 'Clasificador programático',
    route: REQUEST_ROUTE,
    documents: [NOMBRE_DOCUMENTO],
    documentOptions: [{ label: NOMBRE_DOCUMENTO, route: REQUEST_ROUTE, actionTypes: TIPOS_ACCION_CREAR }],
    actionTypes: TIPOS_ACCION_CREAR,
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
  recordRows,
  recordSelectable: true,
  recordFilter1Label: 'Tipo',
  recordFilter1Key: 'categoria',
  recordFilter1Options: ['PP', 'AC', 'APNOP'],
  recordFilter2Label: 'Estado del registro',
  recordFilter2Key: 'estado',
  recordFilter2Options: ['Activo'],
  recordFilterCampoOptions,
  recordFilterValorOptions,
  documentColumns,
  recordColumns,
  documentTableMinWidthClass: 'min-w-[1250px]',
  recordTableMinWidthClass: 'min-w-[1150px]',
  recordTrackKey: 'recordId',
  recordHistoryDocumentLabel: NOMBRE_DOCUMENTO,
  recordHistoryKind: 'documento',
  statusFilterOptions: ['Aceptado'],
  actionTypeFilterOptions: TIPOS_ACCION,
  filterCampoOptions,
  filterValorOptions,
  fieldsMenuOptions,
};
