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

/** Campos de «Estructura programática»: cada uno se elige con la lupa, en una ventana de selección. */
export type CampoEstructura = 'programa' | 'producto' | 'actividad' | 'funcional';

/** Fila de un catálogo de la estructura programática: `id` más los textos de sus columnas. Datos de ejemplo del taller. */
export type ItemEstructura = { id: string } & Record<string, string>;

export interface CampoEstructuraConfig {
  campo: CampoEstructura;
  /** Título de la fila en el formulario. */
  titulo: string;
  /** Título de la ventana de selección (nodos de Figma 1231:136953, 1231:137206, 1231:137538 y 1231:138743). */
  tituloSeleccion: string;
  /** `widthClass`: ancho en la grilla de la búsqueda. `anchoCard`: ancho fijo del campo en la card del elegido (alinea las columnas entre cards). */
  columnas: { key: string; label: string; widthClass?: string; anchoCard?: string }[];
  catalogo: ItemEstructura[];
  /** Botones junto al buscador de la ventana: solo visuales. */
  mostrarFiltro: boolean;
  mostrarMasOpciones: boolean;
  /** Paginación también arriba de la grilla (solo el clasificador funcional). */
  paginacionSuperior: boolean;
  /** Texto con el que se muestra la fila elegida en el formulario y en la tabla de registros. */
  resumen: (item: ItemEstructura) => string;
}

const resumenCodigoNombre = (i: ItemEstructura): string => `${i['codigo']} — ${i['nombre']}`;

export const CAMPOS_ESTRUCTURA: CampoEstructuraConfig[] = [
  {
    campo: 'programa',
    titulo: 'Programa',
    tituloSeleccion: 'Seleccionar programa',
    columnas: [
      { key: 'codigo', label: 'Código', widthClass: 'w-[180px]', anchoCard: 'lg:basis-[180px]' },
      { key: 'nombre', label: 'Nombre' },
    ],
    mostrarFiltro: true,
    mostrarMasOpciones: true,
    paginacionSuperior: false,
    resumen: resumenCodigoNombre,
    catalogo: [
      { id: 'prg-1', codigo: '0002', nombre: 'Salud materno neonatal' },
      { id: 'prg-2', codigo: '0016', nombre: 'TBC-VIH/SIDA' },
      { id: 'prg-3', codigo: '0017', nombre: 'Enfermedades metaxenicas y zoonosis' },
      { id: 'prg-4', codigo: '0018', nombre: 'Enfermedades no transmisibles' },
      { id: 'prg-5', codigo: '0146', nombre: 'Acceso de las familias a vivienda y entorno urbano adecuado' },
      { id: 'prg-6', codigo: '0030', nombre: 'Reducción de delitos y faltas que afectan la seguridad ciudadana' },
      { id: 'prg-7', codigo: '0035', nombre: 'Lucha contra el terrorismo' },
    ],
  },
  {
    campo: 'producto',
    titulo: 'Producto/Proyecto',
    tituloSeleccion: 'Seleccionar producto/proyecto',
    columnas: [
      { key: 'tipo', label: 'Tipo', widthClass: 'w-[160px]', anchoCard: 'lg:basis-[180px]' },
      { key: 'codigo', label: 'Código', widthClass: 'w-[160px]', anchoCard: 'lg:basis-[180px]' },
      { key: 'nombre', label: 'Nombre' },
    ],
    mostrarFiltro: true,
    mostrarMasOpciones: false,
    paginacionSuperior: false,
    resumen: resumenCodigoNombre,
    catalogo: [
      { id: 'pro-1', tipo: 'Producto', codigo: '3000001', nombre: 'Acciones comunes' },
      { id: 'pro-2', tipo: 'Producto', codigo: '3000879', nombre: 'Adolescentes con atención preventiva de anemia y otras deficiencias nutricionales' },
      { id: 'pro-3', tipo: 'Producto', codigo: '3000830', nombre: 'Familias acceden a viviendas en condiciones adecuadas' },
      { id: 'pro-4', tipo: 'Producto', codigo: '3033295', nombre: 'Atención del parto normal' },
      { id: 'pro-5', tipo: 'Producto', codigo: '3000002', nombre: 'Población informada sobre salud sexual, salud reproductiva y métodos de planificación familiar' },
      { id: 'pro-6', tipo: 'Producto', codigo: '3000005', nombre: 'Adolescentes acceden a servicios de salud para prevención del embarazo' },
      { id: 'pro-7', tipo: 'Producto', codigo: '3033172', nombre: 'Atención prenatal reenfocada' },
    ],
  },
  {
    campo: 'actividad',
    titulo: 'Actividad/Acción Inversión/Obra',
    tituloSeleccion: 'Seleccionar actividad/acción inversión/obra',
    columnas: [
      { key: 'tipo', label: 'Tipo', widthClass: 'w-[160px]', anchoCard: 'lg:basis-[180px]' },
      { key: 'codigo', label: 'Código', widthClass: 'w-[160px]', anchoCard: 'lg:basis-[180px]' },
      { key: 'nombre', label: 'Nombre' },
    ],
    mostrarFiltro: true,
    mostrarMasOpciones: false,
    paginacionSuperior: false,
    resumen: resumenCodigoNombre,
    catalogo: [
      { id: 'act-1', tipo: 'Actividad', codigo: '5006085', nombre: 'Selección asignación y supervisión del bono familiar habitacional' },
      { id: 'act-2', tipo: 'Actividad', codigo: '5000050', nombre: 'Atender complicaciones obstétricas en unidades de cuidados intensivos' },
      { id: 'act-3', tipo: 'Actividad', codigo: '5005984', nombre: 'Promoción de prácticas saludables para el cuidado de la salud sexual y reproductiva en familias' },
      { id: 'act-4', tipo: 'Actividad', codigo: '5000510', nombre: 'Atención especializada de la salud' },
      { id: 'act-5', tipo: 'Actividad', codigo: '5000393', nombre: 'Administración de la gestión documentaria' },
      { id: 'act-6', tipo: 'Actividad', codigo: '5000037', nombre: 'Apoyo a la comunidad' },
      { id: 'act-7', tipo: 'Actividad', codigo: '5000002', nombre: 'Conducción y orientación superior' },
      { id: 'act-8', tipo: 'Actividad', codigo: '5000808', nombre: 'Funcionamiento de servicios de salud' },
    ],
  },
  {
    campo: 'funcional',
    titulo: 'Clasificador funcional',
    tituloSeleccion: 'Seleccionar clasificador funcional',
    columnas: [
      { key: 'funcion', label: 'Función' },
      { key: 'division', label: 'División funcional' },
      { key: 'grupo', label: 'Grupo funcional' },
    ],
    mostrarFiltro: false,
    mostrarMasOpciones: false,
    paginacionSuperior: true,
    resumen: (i) => `${i['funcion']} / ${i['division']} / ${i['grupo']}`,
    catalogo: [
      { id: 'fun-1', funcion: '20 Salud', division: '044 Salud individual', grupo: '0096 Atención médica básica' },
      { id: 'fun-2', funcion: '019 Vivienda y desarrollo urbano', division: '047 Educación básica', grupo: '0103 Educación inicial' },
      { id: 'fun-3', funcion: '23 Protección social', division: '004 Planeamiento gubernamental', grupo: '0043 Control de riesgos y daños para la salud' },
      { id: 'fun-4', funcion: '24 No salud', division: '004 Planeamiento gubernamental', grupo: '0043 Control de riesgos y daños para la salud' },
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

/** Código (primer término) de un texto del clasificador funcional, p. ej. «019 Vivienda y desarrollo urbano» → «019». */
export function codigoFuncional(texto: string): string {
  return texto.split(' ')[0] ?? '';
}

/** Finalidad: no se elige en el formulario; el diseño la muestra fija (nodo de Figma 1096:122648). */
export const FINALIDAD_FIJA = '0000000';
