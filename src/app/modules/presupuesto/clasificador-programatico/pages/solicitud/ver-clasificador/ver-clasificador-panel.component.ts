import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

import { FormTableSearchComponent } from '../../../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../../../shared/components/pagination/pagination.component';
import type { DocumentsRecordsRow } from '../../../../../../shared/types/documents-records.types';
import {
  DocumentsRecordsSelectionChange,
  DocumentsRecordsTableComponent,
} from '../../../../../../shared/ui/documents-records-table/documents-records-table.component';
import { SidePanelComponent } from '../../../../../../shared/ui/side-panel/side-panel.component';
import { VER_CLASIFICADOR_COLUMNAS, VER_CLASIFICADOR_FILAS } from '../../../config/clasificador-programatico-documents.config';

/**
 * Panel «Ver clasificador programático» de la solicitud (Figma 2579:116032): consulta de los registros del
 * clasificador aprobados en el SIAF-RP, sin salir de la solicitud. Lleva buscador con el ícono de filtros, la tabla
 * con cabecera agrupada (estructura programática, clasificador funcional y vigencia), casillas que solo marcan y la
 * paginación con «Filas por página». La flecha ← del encabezado cierra el panel y deja la solicitud como estaba.
 *
 * Los datos son los registros de ejemplo del clasificador: no hay backend detrás.
 */
@Component({
  selector: 'siaf-ver-clasificador-panel',
  standalone: true,
  imports: [DocumentsRecordsTableComponent, FormTableSearchComponent, PaginationComponent, SidePanelComponent],
  template: `
    <siaf-side-panel
      [open]="open"
      title="Ver clasificador programático"
      [showClose]="false"
      [showReturn]="true"
      [showFooter]="false"
      (returned)="closed.emit()"
      (closed)="closed.emit()"
    >
      <div class="flex min-w-0 flex-col gap-siaf-md">
        <siaf-form-table-search [value]="busqueda()" [showMore]="false" (valueChange)="buscar($event)" />

        <siaf-documents-records-table
          activeTab="records"
          [columns]="columnas"
          [rows]="filasPagina()"
          [selectable]="true"
          [historial]="false"
          recordTrackKey="recordId"
          minWidthClass="min-w-[1150px]"
          (selectionChanged)="marcar($event)"
        />

        <siaf-pagination
          navigation="Activate"
          position="Bottom"
          [rowPage]="true"
          [page]="pagina()"
          [pageSize]="filasPorPagina()"
          [totalItems]="totalFilas()"
          [totalPages]="totalPaginas()"
          [rowsPerPage]="filasPorPagina()"
          (previous)="cambiarPagina(-1)"
          (next)="cambiarPagina(1)"
          (rowsPerPageChange)="cambiarFilasPorPagina($event)"
        />
      </div>
    </siaf-side-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerClasificadorPanelComponent {
  readonly columnas = VER_CLASIFICADOR_COLUMNAS;

  private abierto = false;

  /** Cada vez que se abre empieza de cero: sin texto, en la primera página y sin marcas. */
  @Input() set open(valor: boolean) {
    if (valor && !this.abierto) this.reiniciar();
    this.abierto = valor;
  }
  get open(): boolean {
    return this.abierto;
  }

  @Output() closed = new EventEmitter<void>();

  readonly busqueda = signal('');
  readonly pagina = signal(1);
  readonly filasPorPagina = signal(25);
  private readonly marcadas = signal<Set<string>>(new Set());

  private readonly filtradas = computed<DocumentsRecordsRow[]>(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const marcadas = this.marcadas();
    return VER_CLASIFICADOR_FILAS.filter(
      (fila) => !texto || this.columnas.some((c) => String(fila[c.key] ?? '').toLowerCase().includes(texto)),
    ).map((fila) => ({ ...fila, selected: marcadas.has(String(fila['recordId'])) }));
  });

  readonly totalFilas = computed(() => this.filtradas().length);
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalFilas() / this.filasPorPagina())));
  readonly filasPagina = computed(() => {
    const desde = (this.pagina() - 1) * this.filasPorPagina();
    return this.filtradas().slice(desde, desde + this.filasPorPagina());
  });

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(1);
  }

  marcar({ row, selected }: DocumentsRecordsSelectionChange): void {
    this.marcadas.update((actuales) => {
      const siguientes = new Set(actuales);
      if (selected) siguientes.add(String(row['recordId']));
      else siguientes.delete(String(row['recordId']));
      return siguientes;
    });
  }

  cambiarPagina(delta: number): void {
    this.pagina.update((p) => Math.min(this.totalPaginas(), Math.max(1, p + delta)));
  }

  cambiarFilasPorPagina(filas: number): void {
    this.filasPorPagina.set(filas);
    this.pagina.set(1);
  }

  private reiniciar(): void {
    this.busqueda.set('');
    this.pagina.set(1);
    this.marcadas.set(new Set());
  }
}
