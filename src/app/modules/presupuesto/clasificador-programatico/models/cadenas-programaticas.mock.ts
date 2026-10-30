/**
 * Cadenas programáticas de ejemplo para el panel «Seleccionar cadena» de PP, AC y APNOP (nodos de Figma 2009:315630,
 * 1865:311851, los filtros por tipo y las capturas de AC y de la tabla de registros). No hay backend: son datos fijos del taller. Las primeras filas de cada tipo son las del diseño; el
 * resto se arma con las mismas bases para llegar a un total que permita probar la paginación.
 */

export interface Concepto {
  codigo: string;
  nombre: string;
}

/**
 * Tipo de la cadena: `producto` (PP con producto predeterminado), `actividad` (AC con actividad predeterminada) o
 * `inversion` (en esa el `producto` es la inversión y la actividad, la AI/Obra).
 */
export type TipoCadena = 'producto' | 'actividad' | 'inversion';

export interface CadenaProgramatica {
  id: string;
  tipo: TipoCadena;
  /** Código de la categoría presupuestaria (`PP` o `AC`). */
  categoria: string;
  /** Solo en PP: las cadenas de AC no llevan programa. */
  programa?: Concepto;
  /** Producto (PP) o inversión; en las cadenas de actividad de AC no hay. */
  producto?: Concepto;
  actividad: Concepto;
  funcion: Concepto;
  division: Concepto;
  grupo: Concepto;
}

/** Nombre completo de cada categoría, como se ve en el detalle de la cadena. */
export const NOMBRE_CATEGORIA: Record<string, string> = {
  PP: 'Programas presupuestales',
  AC: 'Acciones centrales',
  APNOP: 'Asignaciones presupuestarias que no resultan en productos',
};

const RELACIONES_EXTERIORES = {
  funcion: { codigo: '02', nombre: 'Relaciones exteriores' },
  division: { codigo: '002', nombre: 'Servicio diplomático' },
  grupo: { codigo: '0002', nombre: 'Servicio diplomático' },
};

const PROGRAMA_0062: Concepto = {
  codigo: '0062',
  nombre: 'Optimización de la política de protección y atención a las comunidades peruanas en el exterior',
};
const PROGRAMA_0133: Concepto = {
  codigo: '0133',
  nombre: 'Fortalecimiento de la representación del Estado peruano en el exterior',
};

/** Filas del diseño. */
const CADENAS_DISENO: CadenaProgramatica[] = [
  {
    id: 'cad-1',
    categoria: 'PP',
    tipo: 'producto',
    programa: PROGRAMA_0062,
    producto: { codigo: '3000144', nombre: 'Personas reciben servicios consulares en el exterior' },
    actividad: { codigo: '5004339', nombre: 'Atención de trámites consulares y difusión de derechos y deberes de los migrantes' },
    ...RELACIONES_EXTERIORES,
  },
  {
    id: 'cad-2',
    categoria: 'PP',
    tipo: 'producto',
    programa: PROGRAMA_0062,
    producto: { codigo: '3000260', nombre: 'Peruanos en el exterior reciben protección y asistencia' },
    actividad: { codigo: '5002719', nombre: 'Asistencia legal y humanitaria' },
    ...RELACIONES_EXTERIORES,
  },
  {
    id: 'cad-3',
    categoria: 'PP',
    tipo: 'producto',
    programa: PROGRAMA_0062,
    producto: { codigo: '3000260', nombre: 'Peruanos en el exterior reciben protección y asistencia' },
    actividad: { codigo: '5006182', nombre: 'Suscripción de instrumentos orientados a la protección de los peruanos en el exterior' },
    ...RELACIONES_EXTERIORES,
  },
  {
    id: 'cad-4',
    categoria: 'PP',
    tipo: 'producto',
    programa: PROGRAMA_0133,
    producto: { codigo: '3000710', nombre: 'Estado peruano representado ante la comunidad internacional' },
    actividad: { codigo: '5005219', nombre: 'Representación diplomática y defensa de los intereses nacionales en el exterior' },
    ...RELACIONES_EXTERIORES,
  },
  {
    id: 'cad-5',
    categoria: 'PP',
    tipo: 'producto',
    programa: PROGRAMA_0133,
    producto: { codigo: '3000710', nombre: 'Estado peruano representado ante la comunidad internacional' },
    actividad: { codigo: '5005220', nombre: 'Representación y negociación en organismos y foros internacionales' },
    ...RELACIONES_EXTERIORES,
  },
  {
    id: 'cad-6',
    categoria: 'PP',
    tipo: 'producto',
    programa: PROGRAMA_0133,
    producto: { codigo: '3000710', nombre: 'Estado peruano representado ante la comunidad internacional' },
    actividad: { codigo: '5005221', nombre: 'Organización de eventos internacionales de alto nivel' },
    ...RELACIONES_EXTERIORES,
  },
];

interface BaseCadena {
  programa: Concepto;
  producto: Concepto;
  funcion: Concepto;
  division: Concepto;
  grupo: Concepto;
}

const BASES: BaseCadena[] = [
  {
    programa: { codigo: '0002', nombre: 'Salud materno neonatal' },
    producto: { codigo: '3033172', nombre: 'Atención prenatal reenfocada' },
    funcion: { codigo: '20', nombre: 'Salud' },
    division: { codigo: '044', nombre: 'Salud individual' },
    grupo: { codigo: '0096', nombre: 'Atención médica básica' },
  },
  {
    programa: { codigo: '0016', nombre: 'TBC-VIH/SIDA' },
    producto: { codigo: '3000609', nombre: 'Personas con tuberculosis reciben tratamiento oportuno' },
    funcion: { codigo: '20', nombre: 'Salud' },
    division: { codigo: '043', nombre: 'Salud colectiva' },
    grupo: { codigo: '0095', nombre: 'Control de riesgos y daños para la salud' },
  },
  {
    programa: { codigo: '0030', nombre: 'Reducción de delitos y faltas que afectan la seguridad ciudadana' },
    producto: { codigo: '3000551', nombre: 'Patrullaje por sector' },
    funcion: { codigo: '05', nombre: 'Orden público y seguridad' },
    division: { codigo: '016', nombre: 'Orden interno' },
    grupo: { codigo: '0034', nombre: 'Policía' },
  },
  {
    programa: { codigo: '0146', nombre: 'Acceso de las familias a vivienda y entorno urbano adecuado' },
    producto: { codigo: '3000830', nombre: 'Familias acceden a viviendas en condiciones adecuadas' },
    funcion: { codigo: '19', nombre: 'Vivienda y desarrollo urbano' },
    division: { codigo: '041', nombre: 'Vivienda' },
    grupo: { codigo: '0087', nombre: 'Desarrollo de la vivienda' },
  },
  {
    programa: { codigo: '0018', nombre: 'Enfermedades no transmisibles' },
    producto: { codigo: '3000699', nombre: 'Personas con factores de riesgo reciben tamizaje' },
    funcion: { codigo: '20', nombre: 'Salud' },
    division: { codigo: '043', nombre: 'Salud colectiva' },
    grupo: { codigo: '0095', nombre: 'Control de riesgos y daños para la salud' },
  },
];

const ACTIVIDADES: string[] = [
  'Atención especializada de la salud',
  'Supervisión y monitoreo de las intervenciones',
  'Capacitación al personal en la gestión de los servicios',
  'Promoción de prácticas saludables en las familias',
  'Entrega de bienes y servicios a la población beneficiaria',
  'Seguimiento de los compromisos de gestión',
  'Fortalecimiento de las capacidades locales',
  'Registro y control de los servicios brindados',
];

const TOTAL_CADENAS = 100;

const CADENAS_GENERADAS: CadenaProgramatica[] = Array.from({ length: TOTAL_CADENAS - CADENAS_DISENO.length }, (_, i) => {
  const base = BASES[i % BASES.length];
  return {
    id: `cad-${CADENAS_DISENO.length + i + 1}`,
    categoria: 'PP',
    tipo: 'producto',
    programa: base.programa,
    producto: base.producto,
    actividad: { codigo: String(5007000 + i * 3), nombre: ACTIVIDADES[i % ACTIVIDADES.length] },
    funcion: base.funcion,
    division: base.division,
    grupo: base.grupo,
  };
});

export const CADENAS_PP: CadenaProgramatica[] = [...CADENAS_DISENO, ...CADENAS_GENERADAS];

const INVERSION_0133: Concepto = { codigo: '2732524', nombre: 'Mejoramiento de los servicios de representación diplomática en el exterior' };
const INVERSION_0062: Concepto = { codigo: '2703586', nombre: 'Fortalecimiento de la atención consular a los peruanos en el exterior' };

/** Filas de inversión del diseño. */
const CADENAS_INVERSION_DISENO: CadenaProgramatica[] = [
  { programa: PROGRAMA_0133, producto: INVERSION_0133, actividad: { codigo: '0000420', nombre: 'Adquisición de inmueble para el servicio de acción consular y representación diplomática' } },
  { programa: PROGRAMA_0133, producto: INVERSION_0133, actividad: { codigo: '0000426', nombre: 'Remodelación de edificio público para el servicio de representación diplomática' } },
  { programa: PROGRAMA_0133, producto: INVERSION_0133, actividad: { codigo: '0000107', nombre: 'Implementación de equipamiento para el servicio de representación diplomática' } },
  { programa: PROGRAMA_0133, producto: INVERSION_0133, actividad: { codigo: '0000814', nombre: 'Implementación de mobiliario de ambientes complementarios para la representación diplomática' } },
  { programa: PROGRAMA_0133, producto: INVERSION_0133, actividad: { codigo: '0000011', nombre: 'Gestión de proyecto' } },
  { programa: PROGRAMA_0062, producto: INVERSION_0062, actividad: { codigo: '0000012', nombre: 'Expediente técnico' } },
].map((fila, i) => ({ id: `inv-${i + 1}`, categoria: 'PP', tipo: 'inversion' as const, ...fila, ...RELACIONES_EXTERIORES }));

const INVERSIONES: Concepto[] = [
  { codigo: '2412035', nombre: 'Mejoramiento de los servicios de salud materno neonatal' },
  { codigo: '2398870', nombre: 'Ampliación de la capacidad de atención de la red de salud' },
  { codigo: '2451203', nombre: 'Mejoramiento del servicio de seguridad ciudadana' },
  { codigo: '2467781', nombre: 'Construcción de viviendas de interés social' },
  { codigo: '2433096', nombre: 'Instalación de servicios de prevención de enfermedades no transmisibles' },
];

const ACTIVIDADES_INVERSION: string[] = [
  'Expediente técnico',
  'Gestión de proyecto',
  'Supervisión de obra',
  'Construcción de infraestructura',
  'Adquisición de equipamiento',
  'Liquidación de obra',
];

const CADENAS_INVERSION_GENERADAS: CadenaProgramatica[] = Array.from({ length: TOTAL_CADENAS - CADENAS_INVERSION_DISENO.length }, (_, i) => {
  const base = BASES[i % BASES.length];
  return {
    id: `inv-${CADENAS_INVERSION_DISENO.length + i + 1}`,
    categoria: 'PP',
    tipo: 'inversion' as const,
    programa: base.programa,
    producto: INVERSIONES[i % INVERSIONES.length],
    actividad: { codigo: String(100 + i * 7).padStart(7, '0'), nombre: ACTIVIDADES_INVERSION[i % ACTIVIDADES_INVERSION.length] },
    funcion: base.funcion,
    division: base.division,
    grupo: base.grupo,
  };
});

/** Todas las cadenas de PP: las de producto predeterminado y las de inversión. */
export const CADENAS_PP_TODAS: CadenaProgramatica[] = [...CADENAS_PP, ...CADENAS_INVERSION_DISENO, ...CADENAS_INVERSION_GENERADAS];

// ── AC ────────────────────────────────────────────────────────────────

const FUNCION_AC: Concepto = { codigo: '02', nombre: 'Relaciones exteriores' };
const DIVISION_AC: Concepto = { codigo: '006', nombre: 'Gestión' };
const GRUPOS_AC: Concepto[] = [
  { codigo: '0005', nombre: 'Planeamiento institucional' },
  { codigo: '0007', nombre: 'Conducción superior' },
  { codigo: '0008', nombre: 'Gestión administrativa' },
  { codigo: '0011', nombre: 'Gestión de recursos humanos' },
  { codigo: '0012', nombre: 'Control interno' },
  { codigo: '0013', nombre: 'Defensa jurídica' },
];

const funcionalAc = (grupo: number) => ({ funcion: FUNCION_AC, division: DIVISION_AC, grupo: GRUPOS_AC[grupo % GRUPOS_AC.length] });

/** Funcional de las cadenas de inversión de AC (03 / 006 / 0010, como en la tabla de registros del diseño). */
const FUNCIONAL_AC_INVERSION = {
  funcion: { codigo: '03', nombre: 'Planeamiento, gestión y reserva de contingencia' },
  division: DIVISION_AC,
  grupo: { codigo: '0010', nombre: 'Gestión institucional' },
};

/** Filas de actividad predeterminada del diseño de AC (el número es el grupo funcional que llevan). */
const ACTIVIDADES_AC_DISENO: [string, string, number][] = [
  ['5000001', 'Planeamiento y presupuesto', 0],
  ['5000002', 'Conducción y orientación superior', 1],
  ['5000003', 'Gestión administrativa', 2],
  ['5000004', 'Asesoramiento técnico y jurídico', 2],
  ['5000005', 'Gestión de recursos humanos', 3],
  ['5000006', 'Acciones de control y auditoría', 4],
  ['5000007', 'Defensa judicial del estado', 5],
];

const ACTIVIDADES_AC_EXTRA: string[] = [
  'Gestión de la tecnología de información',
  'Comunicación institucional',
  'Gestión de la cooperación',
  'Logística y abastecimiento',
  'Gestión patrimonial',
  'Tesorería y contabilidad',
  'Archivo y gestión documental',
  'Seguridad y mantenimiento institucional',
];

/** Cadenas de AC con actividad predeterminada. */
export const CADENAS_AC: CadenaProgramatica[] = Array.from({ length: TOTAL_CADENAS }, (_, i) => {
  const [codigo, nombre, grupo] = ACTIVIDADES_AC_DISENO[i] ?? [
    String(5000001 + i),
    ACTIVIDADES_AC_EXTRA[(i - ACTIVIDADES_AC_DISENO.length) % ACTIVIDADES_AC_EXTRA.length],
    i,
  ];
  return { id: `ac-${i + 1}`, categoria: 'AC', tipo: 'actividad' as const, actividad: { codigo, nombre }, ...funcionalAc(grupo) };
});

const INVERSION_AC: Concepto = { codigo: '2355382', nombre: 'Mejoramiento del servicio de habitabilidad institucional' };
const INVERSIONES_AC: Concepto[] = [
  INVERSION_AC,
  { codigo: '2360118', nombre: 'Ampliación de los servicios administrativos institucionales' },
  { codigo: '2371450', nombre: 'Fortalecimiento de la gestión documentaria institucional' },
];

/** Filas de inversión del diseño de AC. */
const AI_OBR_AC_DISENO: [string, string][] = [
  ['0000420', 'Adquisición de inmueble para el servicio de habitabilidad institucional'],
  ['0000424', 'Adecuación de edificio público - Etapa 1 para el servicio de habitabilidad institucional'],
  ['0000425', 'Adecuación de edificio público - Etapa 2 para el servicio de habitabilidad institucional'],
  ['0000100', 'Adquisición e instalación de equipos para el servicio de habitabilidad institucional'],
  ['0000800', 'Adquisición e implementación de mobiliarios para el servicio de habitabilidad institucional'],
  ['0001201', 'Talleres de capacitación para el servicio de habitabilidad institucional'],
];

const AI_OBR_AC_EXTRA: string[] = [
  'Expediente técnico',
  'Supervisión de obra',
  'Gestión de proyecto',
  'Liquidación de obra',
  'Adquisición de equipamiento institucional',
  'Capacitación del personal usuario',
];

/** Cadenas de AC de inversión: la inversión va en `producto` y la AI/Obra en `actividad`. */
export const CADENAS_AC_INVERSION: CadenaProgramatica[] = Array.from({ length: TOTAL_CADENAS }, (_, i) => {
  const [codigo, nombre] = AI_OBR_AC_DISENO[i] ?? [
    String(1300 + i * 11).padStart(7, '0'),
    AI_OBR_AC_EXTRA[(i - AI_OBR_AC_DISENO.length) % AI_OBR_AC_EXTRA.length],
  ];
  const inversion = i < AI_OBR_AC_DISENO.length ? INVERSION_AC : INVERSIONES_AC[i % INVERSIONES_AC.length];
  return { id: `aci-${i + 1}`, categoria: 'AC', tipo: 'inversion' as const, producto: inversion, actividad: { codigo, nombre }, ...FUNCIONAL_AC_INVERSION };
});

// ── APNOP ─────────────────────────────────────────────────────────────

const FUNCIONAL_APNOP_EDUCACION = {
  funcion: { codigo: '22', nombre: 'Educación' },
  division: { codigo: '048', nombre: 'Educación superior' },
  grupo: { codigo: '0110', nombre: 'Educación superior de posgrado' },
};
const FUNCIONAL_APNOP_PREVISION = {
  funcion: { codigo: '24', nombre: 'Previsión social' },
  division: { codigo: '052', nombre: 'Previsión social' },
  grupo: { codigo: '0116', nombre: 'Sistema de pensiones' },
};
const FUNCIONAL_APNOP_DEUDA = {
  funcion: { codigo: '25', nombre: 'Deuda pública' },
  division: { codigo: '057', nombre: 'Deuda pública' },
  grupo: { codigo: '0129', nombre: 'Servicio de la deuda' },
};

type FuncionalApnop = typeof RELACIONES_EXTERIORES;

/** Filas de actividad predeterminada del diseño de APNOP. */
const ACTIVIDADES_APNOP_DISENO: [string, string, FuncionalApnop][] = [
  ['5000643', 'Desarrollo de acciones de política exterior', RELACIONES_EXTERIORES],
  ['5000670', 'Desarrollo de la enseñanza de post-grado', FUNCIONAL_APNOP_EDUCACION],
  ['5000991', 'Obligaciones previsionales', FUNCIONAL_APNOP_PREVISION],
  ['5001008', 'Organizar y ejecutar los procesos electorales', RELACIONES_EXTERIORES],
  ['5001123', 'Protocolo y ceremonial del estado', RELACIONES_EXTERIORES],
  ['5003630', 'Desarrollo de acciones de política exterior, soberanía e integridad territorial en el ámbito internacional', RELACIONES_EXTERIORES],
];

/** Actividades de relleno de APNOP, con la función que les corresponde. */
const ACTIVIDADES_APNOP_EXTRA: [string, FuncionalApnop][] = [
  ['Aportes a organismos internacionales', RELACIONES_EXTERIORES],
  ['Pago de cuotas a organismos internacionales', RELACIONES_EXTERIORES],
  ['Pago de pensiones y obligaciones previsionales', FUNCIONAL_APNOP_PREVISION],
  ['Becas de posgrado en el exterior', FUNCIONAL_APNOP_EDUCACION],
  ['Servicio de la deuda pública', FUNCIONAL_APNOP_DEUDA],
  ['Protocolo y relaciones institucionales', RELACIONES_EXTERIORES],
];

/** Cadenas de APNOP con actividad predeterminada; las primeras son las del diseño (5000643, 5000670…). */
export const CADENAS_APNOP: CadenaProgramatica[] = Array.from({ length: TOTAL_CADENAS }, (_, i) => {
  const [codigo, nombre, funcional] = ACTIVIDADES_APNOP_DISENO[i] ?? [
    String(5003631 + i - ACTIVIDADES_APNOP_DISENO.length),
    ...ACTIVIDADES_APNOP_EXTRA[(i - ACTIVIDADES_APNOP_DISENO.length) % ACTIVIDADES_APNOP_EXTRA.length],
  ];
  return { id: `apn-${i + 1}`, categoria: 'APNOP', tipo: 'actividad' as const, actividad: { codigo, nombre }, ...funcional };
});

const INVERSIONES_APNOP: Concepto[] = [
  { codigo: '2355896', nombre: 'Recuperación de servicios ambientales en áreas naturales' },
  { codigo: '2361204', nombre: 'Instalación de servicios de gestión de residuos sólidos' },
  { codigo: '2374832', nombre: 'Mejoramiento de la gestión de áreas naturales protegidas' },
];

const AI_OBR_APNOP: string[] = [
  'Elaboración de expediente técnico para la recuperación de servicios ambientales',
  'Supervisión de obra',
  'Gestión de proyecto',
  'Liquidación de obra',
  'Adquisición de equipamiento para el servicio',
  'Capacitación del personal usuario',
];

const FUNCIONAL_APNOP_INVERSION = {
  funcion: { codigo: '17', nombre: 'Ambiente' },
  division: { codigo: '054', nombre: 'Desarrollo estratégico, conservación y aprovechamiento sostenible del patrimonio natural' },
  grupo: { codigo: '0123', nombre: 'Gestión integrada de recursos naturales' },
};

/** Cadenas de APNOP de inversión; la primera es la de la tabla de registros del diseño (2355896 / 0000158). */
export const CADENAS_APNOP_INVERSION: CadenaProgramatica[] = Array.from({ length: TOTAL_CADENAS }, (_, i) => ({
  id: `apni-${i + 1}`,
  categoria: 'APNOP',
  tipo: 'inversion' as const,
  producto: INVERSIONES_APNOP[i % INVERSIONES_APNOP.length],
  actividad: { codigo: String(158 + i * 9).padStart(7, '0'), nombre: AI_OBR_APNOP[i % AI_OBR_APNOP.length] },
  ...FUNCIONAL_APNOP_INVERSION,
}));

/** Todas las cadenas que ofrece «Buscar cadena» (PP, AC y APNOP). */
export const CADENAS_TODAS: CadenaProgramatica[] = [
  ...CADENAS_PP_TODAS,
  ...CADENAS_AC,
  ...CADENAS_AC_INVERSION,
  ...CADENAS_APNOP,
  ...CADENAS_APNOP_INVERSION,
];

/** Texto «código nombre» con el que el detalle muestra cada nivel de la cadena. */
export const codigoNombre = (c: Concepto | undefined): string => (c ? `${c.codigo} ${c.nombre}` : '-');
