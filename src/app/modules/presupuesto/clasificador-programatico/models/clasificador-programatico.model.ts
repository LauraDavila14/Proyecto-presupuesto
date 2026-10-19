/**
 * Modelo del clasificador programático (nodos de Figma 1391:117188, 1394:125651, 1398:128618 y 1391:117304,
 * «Solicitud de clasificador programático», tipo de acción «Creación»). Pantalla de ejemplo del taller: los
 * registros que agrega el usuario viven en memoria del componente, no hay API ni backend simulado detrás (a
 * diferencia de «Registro de cuentas bancarias»).
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

/**
 * Una cadena: una estructura programática ya existente con su clasificador funcional (códigos). Se elige en
 * «Buscar cadena». En AC y APNOP no hay programa ni producto (quedan vacíos). Datos de ejemplo del taller.
 */
export interface CadenaClasificador {
  id: string;
  tipo: string;
  programa: string;
  producto: string;
  actividad: string;
  funcion: string;
  division: string;
  grupo: string;
}

/** Tipos de cadena del filtro de PP (Figma 1394:125651). */
export const TIPOS_CADENA_PP: OpcionCatalogo[] = [
  { value: 'Producto predeterminado', label: 'Producto predeterminado' },
  { value: 'Inversión', label: 'Inversión' },
];

/** Tipos de cadena del filtro de AC y APNOP (Figma 1398:128618). */
export const TIPOS_CADENA_ACTIVIDAD: OpcionCatalogo[] = [
  { value: 'Actividad predeterminada', label: 'Actividad predeterminada' },
  { value: 'Inversión', label: 'Inversión' },
];

export const CADENAS_PP: CadenaClasificador[] = [
  { id: 'cpp-1', tipo: 'Producto predeterminado', programa: '0146', producto: '3000830', actividad: '5006085', funcion: '019', division: '042', grupo: '0091' },
  { id: 'cpp-2', tipo: 'Inversión', programa: '0146', producto: '2623863', actividad: '0000010', funcion: '015', division: '036', grupo: '0074' },
  { id: 'cpp-3', tipo: 'Inversión', programa: '0146', producto: '2623863', actividad: '0000015', funcion: '015', division: '036', grupo: '0074' },
  { id: 'cpp-4', tipo: 'Producto predeterminado', programa: '0090', producto: '3000001', actividad: '5000276', funcion: '22', division: '047', grupo: '0103' },
  { id: 'cpp-5', tipo: 'Producto predeterminado', programa: '0002', producto: '3000879', actividad: '5000050', funcion: '20', division: '044', grupo: '0096' },
  { id: 'cpp-6', tipo: 'Producto predeterminado', programa: '0016', producto: '3000002', actividad: '5005984', funcion: '23', division: '004', grupo: '0043' },
  { id: 'cpp-7', tipo: 'Inversión', programa: '0146', producto: '2102', actividad: '0000020', funcion: '019', division: '047', grupo: '0103' },
  { id: 'cpp-8', tipo: 'Producto predeterminado', programa: '0030', producto: '3033295', actividad: '5000510', funcion: '24', division: '004', grupo: '0043' },
];

export const CADENAS_ACTIVIDAD: CadenaClasificador[] = [
  { id: 'cac-1', tipo: 'Actividad predeterminada', programa: '', producto: '', actividad: '5006085', funcion: '019', division: '042', grupo: '0091' },
  { id: 'cac-2', tipo: 'Inversión', programa: '', producto: '', actividad: '0000010', funcion: '015', division: '036', grupo: '0074' },
  { id: 'cac-3', tipo: 'Inversión', programa: '', producto: '', actividad: '0000015', funcion: '015', division: '036', grupo: '0074' },
  { id: 'cac-4', tipo: 'Actividad predeterminada', programa: '', producto: '', actividad: '5000276', funcion: '22', division: '047', grupo: '0103' },
  { id: 'cac-5', tipo: 'Actividad predeterminada', programa: '', producto: '', actividad: '5000050', funcion: '20', division: '044', grupo: '0096' },
  { id: 'cac-6', tipo: 'Actividad predeterminada', programa: '', producto: '', actividad: '5005984', funcion: '23', division: '004', grupo: '0043' },
  { id: 'cac-7', tipo: 'Inversión', programa: '', producto: '', actividad: '0000020', funcion: '019', division: '047', grupo: '0103' },
];

/** Un registro de clasificador agregado a la solicitud (fila del resumen «Registro de clasificador»). */
export interface RegistroClasificador {
  id: string;
  /** Códigos de proceso marcados (`P`, `G` o ambos). */
  procesos: string[];
  categoriaPresupuestaria: string;
  cadena: CadenaClasificador;
}
