/**
 * Cadenas programáticas de ejemplo para el panel «Seleccionar cadena» (nodos de Figma 2009:315630, 1865:311851 y los
 * filtros por tipo). No hay backend: son datos fijos del taller. Las primeras filas de cada tipo son las del diseño; el
 * resto se arma con las mismas bases para llegar a un total que permita probar la paginación.
 */

export interface Concepto {
  codigo: string;
  nombre: string;
}

/** Tipo de la cadena: con producto predeterminado o de inversión (en esa el `producto` es la inversión y la actividad, la AI/Obra). */
export type TipoCadena = 'producto' | 'inversion';

export interface CadenaProgramatica {
  id: string;
  tipo: TipoCadena;
  /** Código de la categoría presupuestaria (`PP`). */
  categoria: string;
  programa: Concepto;
  producto: Concepto;
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

/** Texto «código nombre» con el que el detalle muestra cada nivel de la cadena. */
export const codigoNombre = (c: Concepto): string => `${c.codigo} ${c.nombre}`;
