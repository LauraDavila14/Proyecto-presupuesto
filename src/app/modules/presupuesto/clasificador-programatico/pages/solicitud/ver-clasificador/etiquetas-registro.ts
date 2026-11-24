import type { DocumentsRecordsRow } from '../../../../../../shared/types/documents-records.types';
import {
  CADENAS_TODAS,
  CadenaProgramatica,
  Concepto,
  NOMBRE_CATEGORIA,
  codigoNombre,
} from '../../../models/cadenas-programaticas.mock';

/** Cadena de ejemplo de cada registro: por categoría, programa, producto y actividad. El código de actividad se repite entre categorías con otro nombre. */
const cadenaPorEstructura = new Map<string, CadenaProgramatica>();
for (const c of CADENAS_TODAS) {
  const clave = [c.categoria, c.programa?.codigo ?? '-', c.producto?.codigo ?? '-', c.actividad.codigo].join('|');
  if (!cadenaPorEstructura.has(clave)) cadenaPorEstructura.set(clave, c);
}

/** Nombre del clasificador funcional por código (función, división y grupo funcional no se repiten con otro nombre). */
const nombresFuncionales: Record<'funcion' | 'division' | 'grupoFuncional', Map<string, Concepto>> = {
  funcion: new Map(),
  division: new Map(),
  grupoFuncional: new Map(),
};
for (const c of CADENAS_TODAS) {
  if (!nombresFuncionales.funcion.has(c.funcion.codigo)) nombresFuncionales.funcion.set(c.funcion.codigo, c.funcion);
  if (!nombresFuncionales.division.has(c.division.codigo)) nombresFuncionales.division.set(c.division.codigo, c.division);
  if (!nombresFuncionales.grupoFuncional.has(c.grupo.codigo)) nombresFuncionales.grupoFuncional.set(c.grupo.codigo, c.grupo);
}

/**
 * Texto «código nombre» de una columna de un registro de ejemplo, para los filtros de «Ver clasificador programático».
 * Sin nombre conocido (o con «-») devuelve el valor tal cual; la finalidad no tiene nombre en los datos.
 */
export function etiquetaDe(fila: DocumentsRecordsRow, clave: string): string {
  const valor = String(fila[clave] ?? '-');
  if (valor === '-') return valor;

  if (clave === 'categoria') return NOMBRE_CATEGORIA[valor] ? `${valor} ${NOMBRE_CATEGORIA[valor]}` : valor;
  if (clave === 'funcion' || clave === 'division' || clave === 'grupoFuncional') {
    return nombresFuncionales[clave].has(valor) ? codigoNombre(nombresFuncionales[clave].get(valor)) : valor;
  }
  if (clave === 'programa' || clave === 'producto' || clave === 'actividad') {
    const estructura = [fila['categoria'], fila['programa'], fila['producto'], fila['actividad']].map((v) => String(v ?? '-')).join('|');
    const concepto = cadenaPorEstructura.get(estructura)?.[clave];
    return concepto?.codigo === valor ? codigoNombre(concepto) : valor;
  }
  return valor;
}
