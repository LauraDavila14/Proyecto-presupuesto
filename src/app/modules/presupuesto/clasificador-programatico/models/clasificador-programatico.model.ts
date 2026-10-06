/**
 * Modelo del clasificador programático (nodo de Figma 1096:123152, «Solicitud de clasificador programático»,
 * tipo de acción «Creación»). Pantalla de ejemplo del taller: los registros que agrega el usuario viven en
 * memoria del componente, no hay API ni backend simulado detrás (a diferencia de «Registro de cuentas bancarias»).
 */

export interface OpcionCatalogo {
  value: string;
  label: string;
}

/** Procesos que se marcan en el panel «Registro de clasificador» (casillas de «Proceso»). */
export const PROCESOS_CLASIFICADOR: OpcionCatalogo[] = [
  { value: 'P', label: 'Programación (P)' },
  { value: 'G', label: 'Gestión (G)' },
];

/** Opciones del desplegable «Categoría presupuestaria» (sección «Detalle»). */
export const CATEGORIAS_PRESUPUESTARIAS: OpcionCatalogo[] = [
  { value: 'PP', label: 'PP' },
  { value: 'AC', label: 'AC' },
  { value: 'APNOP', label: 'APNOP' },
];

/** Campos de «Estructura programática»: cada uno se elige con la lupa, desde un panel lateral de selección. */
export type CampoEstructura = 'programa' | 'producto' | 'actividad' | 'funcional';

/** Elemento de un catálogo de la estructura programática. Datos de ejemplo del taller. */
export interface ItemEstructura {
  id: string;
  codigo: string;
  denominacion: string;
}

export interface CampoEstructuraConfig {
  campo: CampoEstructura;
  /** Título de la fila y del panel de selección. */
  titulo: string;
  catalogo: ItemEstructura[];
}

export const CAMPOS_ESTRUCTURA: CampoEstructuraConfig[] = [
  {
    campo: 'programa',
    titulo: 'Programa',
    catalogo: [
      { id: 'prg-1', codigo: '0001', denominacion: 'Programa presupuestal 0001 - Planeamiento gubernamental' },
      { id: 'prg-2', codigo: '0002', denominacion: 'Programa presupuestal 0002 - Gestión institucional' },
      { id: 'prg-3', codigo: '0045', denominacion: 'Programa presupuestal 0045 - Fortalecimiento de capacidades' },
    ],
  },
  {
    campo: 'producto',
    titulo: 'Producto/Proyecto',
    catalogo: [
      { id: 'pro-1', codigo: '3000001', denominacion: 'Acciones comunes' },
      { id: 'pro-2', codigo: '3000132', denominacion: 'Servicios de supervisión y control' },
      { id: 'pro-3', codigo: '2102', denominacion: 'Mejoramiento de la infraestructura vial' },
    ],
  },
  {
    campo: 'actividad',
    titulo: 'Actividad/Acción Inversión/Obra',
    catalogo: [
      { id: 'act-1', codigo: '5000001', denominacion: 'Gestión administrativa' },
      { id: 'act-2', codigo: '5000276', denominacion: 'Supervisión y control administrativo' },
      { id: 'act-3', codigo: '6000012', denominacion: 'Ejecución de obra' },
    ],
  },
  {
    campo: 'funcional',
    titulo: 'Clasificador funcional',
    catalogo: [
      { id: 'fun-1', codigo: '0001', denominacion: 'Planeamiento, gestión y reserva de contingencia' },
      { id: 'fun-2', codigo: '0002', denominacion: 'Administración' },
      { id: 'fun-3', codigo: '0003', denominacion: 'Transporte' },
    ],
  },
];

/** Un registro de clasificador agregado a la solicitud (fila de la tabla «Registro de clasificador»). */
export interface RegistroClasificador {
  id: string;
  /** Códigos de proceso marcados (`P`, `G` o ambos). */
  procesos: string[];
  categoriaPresupuestaria: string;
  estructura: Record<CampoEstructura, ItemEstructura>;
}

/** Texto de los procesos de un registro, p. ej. «Programación (P), Gestión (G)». */
export function nombreProcesos(codigos: readonly string[]): string {
  return PROCESOS_CLASIFICADOR.filter((p) => codigos.includes(p.value))
    .map((p) => p.label)
    .join(', ');
}
