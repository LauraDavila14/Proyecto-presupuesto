import { Injectable, computed, signal } from '@angular/core';

import { ESTADO, ESTADOS_RESPUESTA_APROBADOR } from '../models/documento.model';

/** Clave de `localStorage` donde se guardan las solicitudes del clasificador programático. */
export const CLAVE_SOLICITUDES_CLASIFICADOR = 'taller-siaf-rp:clasificador-solicitudes';

export type EstadoSolicitudClasificador =
  | typeof ESTADO.ELABORADO
  | typeof ESTADO.VERIFICADO
  | typeof ESTADO.ELIMINADO
  | typeof ESTADO.APROBADO
  | typeof ESTADO.OBSERVADO
  | typeof ESTADO.RECHAZADO;

/** Solicitud de clasificador programático: lo que las bandejas necesitan saber de ella. */
export interface SolicitudClasificador {
  id: string;
  /** Correlativo de 4 dígitos (0001, 0002…). */
  numero: string;
  tipoDocumento: string;
  tipoAccion: string;
  estado: EstadoSolicitudClasificador;
  /** dd/mm/aaaa */
  fecha: string;
  entidadCodigo: string;
  entidad: string;
}

const ejemplo = (numero: string, estado: EstadoSolicitudClasificador, tipoAccion = 'Creación'): SolicitudClasificador => ({
  id: `clf-ejemplo-${numero}`,
  numero,
  tipoDocumento: 'Solicitud de clasificador programático',
  tipoAccion,
  estado,
  fecha: '15/06/2026',
  entidadCodigo: '0001',
  entidad: 'Ministerio de Economía y Finanzas',
});

/**
 * Solicitudes de ejemplo con las que arranca el navegador (una por sección de la Bandeja): Borradores, Enviados del
 * creador y Recibidos del aprobador, Recibidos del creador y Enviados del aprobador, y Papelera.
 */
export const SOLICITUDES_CLASIFICADOR_DE_EJEMPLO: SolicitudClasificador[] = [
  ejemplo('0004', ESTADO.ELIMINADO, 'Modificación'),
  ejemplo('0003', ESTADO.APROBADO),
  ejemplo('0002', ESTADO.VERIFICADO),
  ejemplo('0001', ESTADO.ELABORADO),
];

/** Lo guardado en el navegador; si no hay nada guardado todavía, los ejemplos. */
function leer(): SolicitudClasificador[] {
  try {
    const crudo = localStorage.getItem(CLAVE_SOLICITUDES_CLASIFICADOR);
    if (crudo === null) return SOLICITUDES_CLASIFICADOR_DE_EJEMPLO;
    const datos: unknown = JSON.parse(crudo);
    return Array.isArray(datos) ? (datos as SolicitudClasificador[]) : [];
  } catch {
    return [];
  }
}

/**
 * Solicitudes del clasificador programático, guardadas en el navegador (no hay backend para este proceso): «Grabar» la
 * deja Elaborada (Borradores del creador), «Verificar y enviar» la pasa a Verificada (Enviados del creador y Recibidos
 * del aprobador) y «Eliminar» la manda a la Papelera. Arranca con una solicitud de ejemplo por sección. Expone también
 * los contadores del menú de la Bandeja.
 */
@Injectable({ providedIn: 'root' })
export class ClasificadorSolicitudesService {
  private readonly lista = signal<SolicitudClasificador[]>(leer());

  readonly solicitudes = this.lista.asReadonly();

  private contar(estado: EstadoSolicitudClasificador) {
    return computed(() => this.lista().filter((s) => s.estado === estado).length);
  }

  readonly borradoresCount = this.contar(ESTADO.ELABORADO);
  /** Verificadas: son los Enviados del creador y los Recibidos del aprobador. */
  readonly verificadasCount = this.contar(ESTADO.VERIFICADO);
  readonly papeleraCount = this.contar(ESTADO.ELIMINADO);
  /** Con la respuesta del aprobador (Aprobado, Observado, Rechazado): Recibidos del creador y Enviados del aprobador. */
  readonly respuestasCount = computed(() => this.lista().filter((s) => ESTADOS_RESPUESTA_APROBADOR.includes(s.estado)).length);

  /** Siguiente correlativo: sigue al mayor ya usado, aunque esa solicitud esté en la Papelera. */
  siguienteNumero(): string {
    const mayor = this.lista().reduce((max, s) => Math.max(max, Number(s.numero) || 0), 0);
    return String(mayor + 1).padStart(4, '0');
  }

  /** Inserta la solicitud o, si ya existe, la actualiza. */
  guardar(solicitud: SolicitudClasificador): void {
    const existe = this.lista().some((s) => s.id === solicitud.id);
    this.actualizar(existe ? this.lista().map((s) => (s.id === solicitud.id ? solicitud : s)) : [solicitud, ...this.lista()]);
  }

  cambiarEstado(id: string, estado: EstadoSolicitudClasificador): void {
    this.actualizar(this.lista().map((s) => (s.id === id ? { ...s, estado } : s)));
  }

  /** Carga solicitudes solo en memoria, sin tocar el navegador (ejemplos del catálogo y pruebas). */
  cargarDeMuestra(solicitudes: SolicitudClasificador[]): void {
    this.lista.set(solicitudes);
  }

  private actualizar(lista: SolicitudClasificador[]): void {
    this.lista.set(lista);
    try {
      localStorage.setItem(CLAVE_SOLICITUDES_CLASIFICADOR, JSON.stringify(lista));
    } catch {
      // Sin almacenamiento disponible: la sesión sigue funcionando con lo que hay en memoria.
    }
  }
}
