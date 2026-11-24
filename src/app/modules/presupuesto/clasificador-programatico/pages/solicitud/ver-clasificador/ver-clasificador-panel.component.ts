import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

import { FormTableSearchComponent } from '../../../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../../../shared/components/pagination/pagination.component';
import type { DocumentsRecordsRow } from '../../../../../../shared/types/documents-records.types';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import {
  DocumentsRecordsSelectionChange,
  DocumentsRecordsTableComponent,
} from '../../../../../../shared/ui/documents-records-table/documents-records-table.component';
import { SidePanelComponent } from '../../../../../../shared/ui/side-panel/side-panel.component';
import { TagComponent } from '../../../../../../shared/ui/tag/tag.component';
import { TextFieldComponent } from '../../../../../../shared/ui/text-field/text-field.component';
import { VER_CLASIFICADOR_COLUMNAS, VER_CLASIFICADOR_FILAS } from '../../../config/clasificador-programatico-documents.config';
import { etiquetaDe } from './etiquetas-registro';

/** Un desplegable del panel «Filtros»: la columna de la fila que filtra y su etiqueta. */
const CAMPOS_FILTRO: { clave: string; etiqueta: string }[] = [
  { clave: 'categoria', etiqueta: 'Categoría presupuestaria' },
  { clave: 'programa', etiqueta: 'Programa' },
  { clave: 'producto', etiqueta: 'Producto / Proyecto' },
  { clave: 'actividad', etiqueta: 'Actividad / Acción Inversión / Obra' },
  { clave: 'finalidad', etiqueta: 'Finalidad' },
  { clave: 'funcion', etiqueta: 'Función' },
  { clave: 'division', etiqueta: 'División funcional' },
  { clave: 'grupoFuncional', etiqueta: 'Grupo funcional' },
];

/** Valores elegidos por `clave` de campo; vacío o ausente = sin filtrar. */
type Filtros = Record<string, string[]>;

/**
 * Panel «Ver clasificador programático» de la solicitud (Figma 2579:116032): consulta de los registros del
 * clasificador aprobados en el SIAF-RP, sin salir de la solicitud. Lleva buscador con el ícono de filtros, la tabla
 * con cabecera agrupada (estructura programática, clasificador funcional y vigencia), casillas que solo marcan y la
 * paginación con «Filas por página». La flecha ← del encabezado cierra el panel y deja la solicitud como estaba.
 *
 * El ícono de filtros abre a la derecha el panel «Filtros» (Figma 2579:116898) con ocho desplegables de selección
 * múltiple, cuyas opciones salen de los registros y se muestran como «código nombre». Aplicar filtra la tabla y muestra los chips de lo
 * aplicado con «Borrar filtros»; Cancelar cierra sin aplicar. Los filtros se suman al buscador.
 *
 * Los datos son los registros de ejemplo del clasificador: no hay backend detrás.
 */
@Component({
  selector: 'siaf-ver-clasificador-panel',
  standalone: true,
  imports: [
    ButtonComponent,
    DocumentsRecordsTableComponent,
    FormTableSearchComponent,
    PaginationComponent,
    SidePanelComponent,
    TagComponent,
    TextFieldComponent,
  ],
  template: `
    <siaf-side-panel
      [open]="open"
      title="Ver clasificador programático"
      [showClose]="false"
      [showReturn]="true"
      [showFooter]="false"
      [showNav]="filtrosAbiertos()"
      navTitle="Filtros"
      navConfirmLabel="Aplicar"
      [navConfirmDisabled]="!borradorCambiado()"
      (returned)="closed.emit()"
      (closed)="closed.emit()"
      (navConfirmed)="aplicarFiltros()"
      (navCanceled)="cerrarFiltros()"
    >
      <div class="flex min-w-0 flex-col gap-siaf-md">
        <siaf-form-table-search
          [value]="busqueda()"
          [showMore]="false"
          [filterActive]="filtrosAbiertos()"
          (valueChange)="buscar($event)"
          (filter)="abrirFiltros()"
        />

        @if (filtrosVisibles()) {
          <div class="flex items-center gap-siaf-sm">
            <span class="shrink-0 text-xs font-bold uppercase tracking-wide text-text">Filtros por</span>
            <div class="flex min-w-0 flex-1 flex-wrap items-center gap-siaf-sm">
              @for (chip of chips(); track chip) {
                <siaf-tag variant="input">{{ chip }}</siaf-tag>
              }
            </div>
            <siaf-button variant="outline" size="sm" icon="delete" (click)="borrarFiltros()">Borrar filtros</siaf-button>
          </div>
        }

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

      <div sidePanelNav class="flex flex-col gap-siaf-md p-siaf-md">
        @for (campo of camposFiltro; track campo.clave) {
          <siaf-input
            type="select-multiple"
            [label]="campo.etiqueta"
            [options]="opcionesPorCampo[campo.clave]"
            [value]="borrador()[campo.clave] ?? []"
            (valueChange)="cambiarValor(campo.clave, $any($event))"
          />
        }
      </div>
    </siaf-side-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerClasificadorPanelComponent {
  readonly columnas = VER_CLASIFICADOR_COLUMNAS;
  readonly camposFiltro = CAMPOS_FILTRO;

  /** Opciones de cada desplegable: los «código nombre» distintos de los registros, ordenados. */
  readonly opcionesPorCampo: Record<string, { value: string; label: string }[]> = Object.fromEntries(
    CAMPOS_FILTRO.map(({ clave }) => {
      const valores = [...new Set(VER_CLASIFICADOR_FILAS.map((fila) => etiquetaDe(fila, clave)))].sort((a, b) => a.localeCompare(b));
      return [clave, valores.map((valor) => ({ value: valor, label: valor }))];
    }),
  );

  private abierto = false;

  /** Cada vez que se abre empieza de cero: sin texto, en la primera página, sin marcas y sin filtros. */
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

  // Filtros: lo aplicado a la tabla y el borrador que se edita en el panel «Filtros» hasta pulsar Aplicar.
  readonly filtrosAbiertos = signal(false);
  readonly aplicados = signal<Filtros>({});
  readonly borrador = signal<Filtros>({});
  /** La fila «Filtros por» aparece al pulsar Aplicar y se va con «Borrar filtros». */
  readonly filtrosVisibles = signal(false);

  readonly chips = computed(() => CAMPOS_FILTRO.flatMap(({ clave }) => this.aplicados()[clave] ?? []));
  readonly borradorCambiado = computed(() => JSON.stringify(this.normalizar(this.borrador())) !== JSON.stringify(this.normalizar(this.aplicados())));

  private readonly filtradas = computed<DocumentsRecordsRow[]>(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const filtros = this.aplicados();
    const marcadas = this.marcadas();
    return VER_CLASIFICADOR_FILAS.filter(
      (fila) =>
        CAMPOS_FILTRO.every(({ clave }) => !filtros[clave]?.length || filtros[clave].includes(etiquetaDe(fila, clave))) &&
        (!texto || this.columnas.some((c) => String(fila[c.key] ?? '').toLowerCase().includes(texto))),
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

  abrirFiltros(): void {
    this.borrador.set(this.aplicados());
    this.filtrosAbiertos.set(true);
  }

  cerrarFiltros(): void {
    this.filtrosAbiertos.set(false);
  }

  cambiarValor(clave: string, valor: string[]): void {
    this.borrador.update((b) => ({ ...b, [clave]: valor }));
  }

  aplicarFiltros(): void {
    this.aplicados.set(this.normalizar(this.borrador()));
    this.filtrosVisibles.set(this.chips().length > 0);
    this.pagina.set(1);
    this.filtrosAbiertos.set(false);
  }

  /** Quita todos los filtros. El buscador y las marcas no cambian. */
  borrarFiltros(): void {
    this.aplicados.set({});
    this.borrador.set({});
    this.filtrosVisibles.set(false);
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

  /** Deja solo los campos con algo elegido, para comparar filtros sin que cuenten los vacíos. */
  private normalizar(filtros: Filtros): Filtros {
    return Object.fromEntries(CAMPOS_FILTRO.filter(({ clave }) => filtros[clave]?.length).map(({ clave }) => [clave, filtros[clave]]));
  }

  private reiniciar(): void {
    this.busqueda.set('');
    this.pagina.set(1);
    this.filasPorPagina.set(25);
    this.marcadas.set(new Set());
    this.filtrosAbiertos.set(false);
    this.filtrosVisibles.set(false);
    this.aplicados.set({});
    this.borrador.set({});
  }
}
