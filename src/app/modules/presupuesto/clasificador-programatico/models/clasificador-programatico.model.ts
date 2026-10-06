/**
 * Modelo del clasificador programático (nodo de Figma 406-10759, «Solicitud de clasificador programático sin
 * plazos»). Pantalla de ejemplo del taller: los registros que agrega el usuario viven en memoria del componente,
 * no hay API ni backend simulado detrás (a diferencia de «Registro de cuentas bancarias»).
 */

export interface OpcionCatalogo {
  value: string;
  label: string;
}

export const TIPOS_CLASIFICADOR: OpcionCatalogo[] = [
  { value: 'PROGRAMA', label: 'Programa' },
  { value: 'SUBPROGRAMA', label: 'Subprograma' },
  { value: 'ACTIVIDAD', label: 'Actividad' },
  { value: 'PROYECTO', label: 'Proyecto' },
];

export function nombreTipoClasificador(codigo: string): string {
  return TIPOS_CLASIFICADOR.find((t) => t.value === codigo)?.label ?? codigo;
}

/** Un registro de clasificador agregado a la solicitud (fila de la tabla «Registro de clasificador»). */
export interface RegistroClasificador {
  id: string;
  codigo: string;
  denominacion: string;
  tipoClasificador: string;
  fechaVigencia: string;
}

/** Estructura del catálogo (para «Buscar estructura», nodo de Figma 726:19845). Datos de ejemplo del taller. */
export interface EstructuraClasificador {
  id: string;
  codigo: string;
  denominacion: string;
  tipoClasificador: string;
  fechaVigencia: string;
}

export const CATALOGO_ESTRUCTURAS: EstructuraClasificador[] = [
  { id: 'est-1', codigo: '0001', denominacion: 'Planeamiento gubernamental', tipoClasificador: 'PROGRAMA', fechaVigencia: '2026-01-01' },
  { id: 'est-2', codigo: '0002', denominacion: 'Gestión institucional', tipoClasificador: 'PROGRAMA', fechaVigencia: '2026-01-01' },
  { id: 'est-3', codigo: '0045', denominacion: 'Fortalecimiento de capacidades de gestión', tipoClasificador: 'SUBPROGRAMA', fechaVigencia: '2026-01-01' },
  { id: 'est-4', codigo: '0089', denominacion: 'Supervisión y control administrativo', tipoClasificador: 'ACTIVIDAD', fechaVigencia: '2026-01-01' },
  { id: 'est-5', codigo: '0102', denominacion: 'Mejoramiento de la infraestructura vial', tipoClasificador: 'PROYECTO', fechaVigencia: '2026-01-01' },
  { id: 'est-6', codigo: '0134', denominacion: 'Modernización de la gestión pública', tipoClasificador: 'PROYECTO', fechaVigencia: '2026-01-01' },
];
