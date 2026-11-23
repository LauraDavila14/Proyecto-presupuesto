import { Injectable, computed, signal } from '@angular/core';

import { ESTADO } from '../models/documento.model';

/** Clave de `localStorage` donde se guardan las solicitudes del clasificador programático. */
export const CLAVE_SOLICITUDES_CLASIFICADOR = 'taller-siaf-rp:clasificador-solicitudes';

export type EstadoSolicitudClasificador = typeof ESTADO.ELABORADO | typeof ESTADO.VERIFICADO | typeof ESTADO.ELIMINADO;

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

function leer(): SolicitudClasificador[] {
  try {
    const crudo = localStorage.getItem(CLAVE_SOLICITUDES_CLASIFICADOR);
    const datos: unknown = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(datos) ? (datos as SolicitudClasificador[]) : [];
  } catch {
    return [];
  }
}

/**
 * Solicitudes del clasificador programático, guardadas en el navegador (no hay backend para este proceso): «Grabar» la
 * deja Elaborada (Borradores del creador), «Verificar y enviar» la pasa a Verificada (Enviados del creador y Recibidos
 * del aprobador) y «Eliminar» la manda a la Papelera. Expone también los contadores del menú de la Bandeja.
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
