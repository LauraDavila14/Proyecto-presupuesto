import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

import { FormTableSearchComponent } from '../../../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../../../shared/components/pagination/pagination.component';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../../../../shared/ui/checkbox/checkbox.component';
import { SidePanelComponent } from '../../../../../../shared/ui/side-panel/side-panel.component';
import {
  CadenaProgramatica,
  NOMBRE_CATEGORIA,
  codigoNombre,
} from '../../../models/cadenas-programaticas.mock';

/**
 * Panel «Seleccionar cadena» del registro de clasificador (nodos de Figma 2009:315630 y 1865:311851): un
 * `siaf-side-panel` con el buscador, la tabla de cadenas programáticas (estructura programática y clasificador
 * funcional) y la paginación. Las casillas permiten marcar varias cadenas; al hacer clic en una fila se abre a la
 * derecha su detalle (código + nombre de cada nivel) y la flecha lo cierra.
 *
 * El ícono de filtros de la búsqueda es solo visual por ahora. Emite `confirmed` con las cadenas marcadas.
 */
@Component({
  selector: 'siaf-cadena-search-panel',
  standalone: true,
  imports: [ButtonComponent, CheckboxComponent, FormTableSearchComponent, PaginationComponent, SidePanelComponent],
  template: `
    <siaf-side-panel
      [open]="open"
      title="Seleccionar cadena"
      [showFooter]="!detalle()"
      [confirmDisabled]="marcadas().length === 0"
      (closed)="closed.emit()"
      (canceled)="closed.emit()"
      (confirmed)="aceptar()"
    >
      <div class="flex min-h-full">
        <div class="flex min-w-0 flex-1 flex-col gap-siaf-md" [class.pr-siaf-md]="!!detalle()">
          <siaf-form-table-search [value]="busqueda()" [showFilter]="true" [showMore]="false" (valueChange)="buscar($event)" />

          <siaf-pagination
            navigation="Activate"
            position="Top"
            [page]="pagina()"
            [pageSize]="filasPorPagina()"
            [totalItems]="totalFilas()"
            [totalPages]="totalPaginas()"
            (previous)="cambiarPagina(-1)"
            (next)="cambiarPagina(1)"
          />

          <div class="overflow-x-auto">
            <table class="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr class="bg-[var(--sys-color-bg-surfaces-surface-high)] text-center">
                  <th rowspan="2" class="w-12 border-b border-[var(--sys-color-divider-strong)] px-siaf-sm"></th>
                  <th colspan="4" class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Estructura programática</th>
                  <th colspan="3" class="border-b border-l border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Clasificador funcional</th>
                </tr>
                <tr class="bg-[var(--sys-color-bg-surfaces-surface-high)] text-left">
                  <th class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Categ. pres.</th>
                  <th class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Programa</th>
                  <th class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Pro / Inv</th>
                  <th class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Act / AI / Obr</th>
                  <th class="border-b border-l border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Función</th>
                  <th class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Div_F</th>
                  <th class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Grp_F</th>
                </tr>
              </thead>
              <tbody>
                @for (fila of filasPagina(); track fila.id) {
                  <tr
                    class="cursor-pointer border-b border-[var(--sys-color-divider-default)] text-[var(--sys-color-text-neutral-medium)] hover:bg-surface-muted"
                    [class.bg-[var(--sys-color-bg-states-light-selected)]]="detalleId() === fila.id"
                    (click)="abrirDetalle(fila.id)"
                  >
                    <td class="px-siaf-sm py-siaf-sm" (click)="$event.stopPropagation()">
                      <siaf-checkbox [checked]="marcadas().includes(fila.id)" (checkedChange)="marcar(fila.id, $event)" />
                    </td>
                    <td class="px-siaf-md py-siaf-sm">{{ fila.categoria }}</td>
                    <td class="px-siaf-md py-siaf-sm">{{ fila.programa.codigo }}</td>
                    <td class="px-siaf-md py-siaf-sm">{{ fila.producto.codigo }}</td>
                    <td class="min-w-[320px] px-siaf-md py-siaf-sm">{{ codigoNombre(fila.actividad) }}</td>
                    <td class="border-l border-[var(--sys-color-divider-default)] px-siaf-md py-siaf-sm">{{ fila.funcion.codigo }}</td>
                    <td class="px-siaf-md py-siaf-sm">{{ fila.division.codigo }}</td>
                    <td class="px-siaf-md py-siaf-sm">{{ fila.grupo.codigo }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="px-siaf-md py-siaf-lg text-center text-text-muted">No se encontraron resultados.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

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

        @if (detalle(); as cadena) {
          <aside class="flex w-[320px] shrink-0 flex-col gap-siaf-md border-l border-[var(--sys-color-divider-default)] pl-siaf-md" aria-label="Detalle de la cadena">
            <header class="flex items-center gap-siaf-xs">
              <siaf-button variant="text" icon="arrow_back" [iconOnly]="true" ariaLabel="Volver a la lista" (click)="cerrarDetalle()" />
              <h3 class="m-0 text-sm font-bold uppercase text-text">Detalle</h3>
            </header>
            <dl class="m-0 flex flex-col gap-siaf-md">
              @for (campo of camposDetalle(cadena); track campo.etiqueta) {
                <div class="flex flex-col gap-1">
                  <dt class="text-xs text-[var(--sys-color-text-neutral-low)]">{{ campo.etiqueta }}</dt>
                  <dd class="m-0 text-sm text-text">{{ campo.valor }}</dd>
                </div>
              }
            </dl>
          </aside>
        }
      </div>
    </siaf-side-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CadenaSearchPanelComponent {
  private readonly cadenasSig = signal<CadenaProgramatica[]>([]);
  private abierto = false;

  /** Cadenas ofrecidas por la búsqueda. */
  @Input() set cadenas(valor: CadenaProgramatica[]) {
    this.cadenasSig.set(valor);
  }

  @Input() set open(valor: boolean) {
    // Cada vez que se abre, empieza de cero: sin texto, en la primera página, sin marcas ni detalle.
    if (valor && !this.abierto) this.reiniciar();
    this.abierto = valor;
  }
  get open(): boolean {
    return this.abierto;
  }

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<CadenaProgramatica[]>();

  readonly codigoNombre = codigoNombre;

  readonly busqueda = signal('');
  readonly pagina = signal(1);
  readonly filasPorPagina = signal(25);
  readonly marcadas = signal<string[]>([]);
  readonly detalleId = signal<string | null>(null);

  private readonly filtradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.cadenasSig();
    return this.cadenasSig().filter((c) =>
      [c.categoria, c.programa, c.producto, c.actividad].some((v) =>
        (typeof v === 'string' ? v : `${v.codigo} ${v.nombre}`).toLowerCase().includes(texto),
      ),
    );
  });
  readonly totalFilas = computed(() => this.filtradas().length);
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalFilas() / this.filasPorPagina())));
  readonly filasPagina = computed(() => {
    const desde = (this.pagina() - 1) * this.filasPorPagina();
    return this.filtradas().slice(desde, desde + this.filasPorPagina());
  });
  readonly detalle = computed(() => this.cadenasSig().find((c) => c.id === this.detalleId()) ?? null);

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(1);
  }

  cambiarPagina(delta: number): void {
    this.pagina.update((p) => Math.min(this.totalPaginas(), Math.max(1, p + delta)));
  }

  cambiarFilasPorPagina(filas: number): void {
    this.filasPorPagina.set(filas);
    this.pagina.set(1);
  }

  marcar(id: string, marcada: boolean): void {
    this.marcadas.update((actuales) => (marcada ? [...actuales.filter((m) => m !== id), id] : actuales.filter((m) => m !== id)));
  }

  abrirDetalle(id: string): void {
    this.detalleId.set(id);
  }

  cerrarDetalle(): void {
    this.detalleId.set(null);
  }

  /** Campos del detalle de una cadena: cada nivel como «código nombre». */
  camposDetalle(cadena: CadenaProgramatica): { etiqueta: string; valor: string }[] {
    return [
      { etiqueta: 'Categoría presupuestaria', valor: `${cadena.categoria} - ${NOMBRE_CATEGORIA[cadena.categoria] ?? ''}` },
      { etiqueta: 'Programa presupuestal', valor: codigoNombre(cadena.programa) },
      { etiqueta: 'Producto', valor: codigoNombre(cadena.producto) },
      { etiqueta: 'Actividad', valor: codigoNombre(cadena.actividad) },
      { etiqueta: 'Función', valor: codigoNombre(cadena.funcion) },
      { etiqueta: 'División funcional', valor: codigoNombre(cadena.division) },
      { etiqueta: 'Grupo funcional', valor: codigoNombre(cadena.grupo) },
    ];
  }

  aceptar(): void {
    const marcadas = this.marcadas();
    this.confirmed.emit(this.cadenasSig().filter((c) => marcadas.includes(c.id)));
  }

  private reiniciar(): void {
    this.busqueda.set('');
    this.pagina.set(1);
    this.filasPorPagina.set(25);
    this.marcadas.set([]);
    this.detalleId.set(null);
  }
}
