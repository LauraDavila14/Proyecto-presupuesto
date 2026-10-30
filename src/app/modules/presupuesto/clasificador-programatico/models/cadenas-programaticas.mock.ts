/**
 * Cadenas programáticas de ejemplo para el panel «Seleccionar cadena» (nodos de Figma 2009:315630 y 1865:311851).
 * No hay backend: son datos fijos del taller. Las primeras filas son las del diseño; el resto se arma con las
 * mismas bases para llegar a un total que permita probar la paginación.
 */

export interface Concepto {
  codigo: string;
  nombre: string;
}

export interface CadenaProgramatica {
  id: string;
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
    programa: PROGRAMA_0062,
    producto: { codigo: '3000144', nombre: 'Personas reciben servicios consulares en el exterior' },
    actividad: { codigo: '5004339', nombre: 'Atención de trámites consulares y difusión de derechos y deberes de los migrantes' },
    ...RELACIONES_EXTERIORES,
  },
  {
    id: 'cad-2',
    categoria: 'PP',
    programa: PROGRAMA_0062,
    producto: { codigo: '3000260', nombre: 'Peruanos en el exterior reciben protección y asistencia' },
    actividad: { codigo: '5002719', nombre: 'Asistencia legal y humanitaria' },
    ...RELACIONES_EXTERIORES,
  },
  {
    id: 'cad-3',
    categoria: 'PP',
    programa: PROGRAMA_0062,
    producto: { codigo: '3000260', nombre: 'Peruanos en el exterior reciben protección y asistencia' },
    actividad: { codigo: '5006182', nombre: 'Suscripción de instrumentos orientados a la protección de los peruanos en el exterior' },
    ...RELACIONES_EXTERIORES,
  },
  {
    id: 'cad-4',
    categoria: 'PP',
    programa: PROGRAMA_0133,
    producto: { codigo: '3000710', nombre: 'Estado peruano representado ante la comunidad internacional' },
    actividad: { codigo: '5005219', nombre: 'Representación diplomática y defensa de los intereses nacionales en el exterior' },
    ...RELACIONES_EXTERIORES,
  },
  {
    id: 'cad-5',
    categoria: 'PP',
    programa: PROGRAMA_0133,
    producto: { codigo: '3000710', nombre: 'Estado peruano representado ante la comunidad internacional' },
    actividad: { codigo: '5005220', nombre: 'Representación y negociación en organismos y foros internacionales' },
    ...RELACIONES_EXTERIORES,
  },
  {
    id: 'cad-6',
    categoria: 'PP',
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
    programa: base.programa,
    producto: base.producto,
    actividad: { codigo: String(5007000 + i * 3), nombre: ACTIVIDADES[i % ACTIVIDADES.length] },
    funcion: base.funcion,
    division: base.division,
    grupo: base.grupo,
  };
});

export const CADENAS_PP: CadenaProgramatica[] = [...CADENAS_DISENO, ...CADENAS_GENERADAS];

/** Texto «código nombre» con el que el detalle muestra cada nivel de la cadena. */
export const codigoNombre = (c: Concepto): string => `${c.codigo} ${c.nombre}`;
