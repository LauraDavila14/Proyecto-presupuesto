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

/** Campos de «Estructura programática» que se eligen con la lupa. El clasificador funcional no está: se asigna solo al elegir la actividad. */
export type CampoEstructura = 'programa' | 'producto' | 'proyecto' | 'actividad';

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
  /** Con panel «Filtros» (Tipo, Código, Nombre) detrás del ícono de filtro de la búsqueda; nodos de Figma 1274:156515 y 1274:157301. */
  filtrosAvanzados?: boolean;
  /** Filas por página con que abre la búsqueda (por defecto 10). */
  filasPorPagina?: number;
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
    filtrosAvanzados: true,
    filasPorPagina: 25,
    resumen: resumenCodigoNombre,
    catalogo: [
      { id: 'pro-1', tipo: 'Producto', codigo: '3000001', nombre: 'Acciones comunes' },
      { id: 'pro-2', tipo: 'Producto', codigo: '3000879', nombre: 'Adolescentes con atención preventiva de anemia y otras deficiencias nutricionales' },
      { id: 'pro-3', tipo: 'Producto', codigo: '3000830', nombre: 'Familias acceden a viviendas en condiciones adecuadas' },
      { id: 'pro-4', tipo: 'Producto', codigo: '3033295', nombre: 'Atención del parto normal' },
      { id: 'pro-5', tipo: 'Producto', codigo: '3000002', nombre: 'Población informada sobre salud sexual, salud reproductiva y métodos de planificación familiar' },
      { id: 'pro-6', tipo: 'Producto', codigo: '3000005', nombre: 'Adolescentes acceden a servicios de salud para prevención del embarazo' },
      { id: 'pro-7', tipo: 'Producto', codigo: '3033172', nombre: 'Atención prenatal reenfocada' },
      { id: 'pro-8', tipo: 'Proyecto', codigo: '2102', nombre: 'Mejoramiento de la infraestructura vial' },
      { id: 'pro-9', tipo: 'Proyecto', codigo: '2330', nombre: 'Construcción de vivienda de interés social' },
      { id: 'pro-10', tipo: 'Proyecto', codigo: '2451', nombre: 'Ampliación del servicio de agua potable y saneamiento' },
    ],
  },
  {
    campo: 'proyecto',
    titulo: 'Proyecto',
    tituloSeleccion: 'Seleccionar proyecto',
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
      { id: 'proy-1', tipo: 'Proyecto', codigo: '2102', nombre: 'Mejoramiento de la infraestructura vial' },
      { id: 'proy-2', tipo: 'Proyecto', codigo: '2330', nombre: 'Construcción de vivienda de interés social' },
      { id: 'proy-3', tipo: 'Proyecto', codigo: '2451', nombre: 'Ampliación del servicio de agua potable y saneamiento' },
      { id: 'proy-4', tipo: 'Proyecto', codigo: '2518', nombre: 'Instalación de establecimientos de salud' },
      { id: 'proy-5', tipo: 'Proyecto', codigo: '2602', nombre: 'Mejoramiento de espacios públicos urbanos' },
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
      { id: 'act-1', tipo: 'Actividad', codigo: '5006085', nombre: 'Selección asignación y supervisión del bono familiar habitacional', funcionalId: 'fun-1' },
      { id: 'act-2', tipo: 'Actividad', codigo: '5000050', nombre: 'Atender complicaciones obstétricas en unidades de cuidados intensivos', funcionalId: 'fun-2' },
      { id: 'act-3', tipo: 'Actividad', codigo: '5005984', nombre: 'Promoción de prácticas saludables para el cuidado de la salud sexual y reproductiva en familias', funcionalId: 'fun-3' },
      { id: 'act-4', tipo: 'Actividad', codigo: '5000510', nombre: 'Atención especializada de la salud', funcionalId: 'fun-4' },
      { id: 'act-5', tipo: 'Actividad', codigo: '5000393', nombre: 'Administración de la gestión documentaria', funcionalId: 'fun-1' },
      { id: 'act-6', tipo: 'Actividad', codigo: '5000037', nombre: 'Apoyo a la comunidad', funcionalId: 'fun-2' },
      { id: 'act-7', tipo: 'Actividad', codigo: '5000002', nombre: 'Conducción y orientación superior', funcionalId: 'fun-3' },
      { id: 'act-8', tipo: 'Actividad', codigo: '5000808', nombre: 'Funcionamiento de servicios de salud', funcionalId: 'fun-4' },
      // Con un Proyecto elegido (PP) la búsqueda ofrece estos tipos en vez de la actividad predeterminada.
      { id: 'inv-1', tipo: 'Acción inversión', codigo: '5006085', nombre: 'Selección asignación y supervisión del bono familiar habitacional', funcionalId: 'fun-1' },
      { id: 'inv-2', tipo: 'Acción inversión', codigo: '5000050', nombre: 'Atender complicaciones obstétricas en unidades de cuidados intensivos', funcionalId: 'fun-2' },
      { id: 'inv-3', tipo: 'Acción inversión', codigo: '5005984', nombre: 'Promoción de prácticas saludables para el cuidado de la salud sexual y reproductiva en familias', funcionalId: 'fun-3' },
      { id: 'inv-4', tipo: 'Acción inversión', codigo: '5000510', nombre: 'Atención especializada de la salud', funcionalId: 'fun-4' },
      { id: 'inv-5', tipo: 'Acción inversión', codigo: '5000393', nombre: 'Administración de la gestión documentaria', funcionalId: 'fun-1' },
      { id: 'inv-6', tipo: 'Acción inversión', codigo: '5000037', nombre: 'Conducción y orientación superior', funcionalId: 'fun-2' },
      { id: 'obr-1', tipo: 'Obra', codigo: '6000012', nombre: 'Ejecución de obra de infraestructura vial', funcionalId: 'fun-3' },
      { id: 'obr-2', tipo: 'Obra', codigo: '6000145', nombre: 'Construcción de local institucional', funcionalId: 'fun-4' },
      { id: 'obr-3', tipo: 'Obra', codigo: '6000230', nombre: 'Rehabilitación de espacios públicos', funcionalId: 'fun-1' },
    ],
  },
];

/** Clasificadores funcionales. No se buscan: cada actividad lleva el suyo (`funcionalId`) y se asigna al elegirla. */
export const FUNCIONALES: ItemEstructura[] = [
  { id: 'fun-1', funcion: '20 Salud', division: '044 Salud individual', grupo: '0096 Atención médica básica' },
  { id: 'fun-2', funcion: '019 Vivienda y desarrollo urbano', division: '047 Educación básica', grupo: '0103 Educación inicial' },
  { id: 'fun-3', funcion: '23 Protección social', division: '004 Planeamiento gubernamental', grupo: '0043 Control de riesgos y daños para la salud' },
  { id: 'fun-4', funcion: '24 No salud', division: '004 Planeamiento gubernamental', grupo: '0043 Control de riesgos y daños para la salud' },
];

export const COLUMNAS_FUNCIONAL: { key: string; label: string }[] = [
  { key: 'funcion', label: 'Función' },
  { key: 'division', label: 'División funcional' },
  { key: 'grupo', label: 'Grupo funcional' },
];

/** Categorías presupuestarias y los campos de estructura que pide cada una (nodos de Figma 1274:152395 y 1245:141176). */
export const CAMPOS_POR_CATEGORIA: Record<string, CampoEstructura[]> = {
  PP: ['programa', 'producto', 'actividad'],
  AC: ['proyecto', 'actividad'],
  APNOP: ['proyecto', 'actividad'],
};

/** Un registro de clasificador agregado a la solicitud (fila de la tabla «Registro de clasificador»). */
export interface RegistroClasificador {
  id: string;
  /** Códigos de proceso marcados (`P`, `G` o ambos). */
  procesos: string[];
  categoriaPresupuestaria: string;
  estructura: Partial<Record<CampoEstructura, ItemEstructura>> & { actividad: ItemEstructura; funcional: ItemEstructura };
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
