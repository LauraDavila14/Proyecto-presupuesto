import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';

import { FormTableSearchComponent } from '../../../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../../../shared/components/pagination/pagination.component';
import { CheckboxComponent } from '../../../../../../shared/ui/checkbox/checkbox.component';
import { CadenaProgramatica, codigoNombre } from '../../../models/cadenas-programaticas.mock';

/**
 * Cadenas elegidas en «Buscar cadena» del registro de clasificador (nodo de Figma 1769:174293): buscador, paginación
 * y tabla con la estructura programática (Programa, Pro / Inv, Act / AI / Obr) y el clasificador funcional de cada
 * cadena. Las casillas se pueden marcar, sin acción por ahora. El embudo del buscador es solo visual.
 */
@Component({
  selector: 'siaf-cadenas-elegidas',
  standalone: true,
  imports: [CheckboxComponent, FormTableSearchComponent, PaginationComponent],
  template: `
    <div class="flex flex-col gap-siaf-md">
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
        <table class="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr class="bg-[var(--sys-color-bg-surfaces-surface-high)] text-center">
              <th rowspan="2" class="w-12 border-b border-[var(--sys-color-divider-strong)] px-siaf-sm"></th>
              <th colspan="3" class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Estructura programática</th>
              <th colspan="3" class="border-b border-l border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Clasificador funcional</th>
            </tr>
            <tr class="bg-[var(--sys-color-bg-surfaces-surface-high)] text-left">
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
              <tr class="border-b border-[var(--sys-color-divider-default)] text-[var(--sys-color-text-neutral-medium)]" [class.bg-[var(--sys-color-bg-states-light-selected)]]="marcadas().includes(fila.id)">
                <td class="px-siaf-sm py-siaf-sm">
                  <siaf-checkbox [checked]="marcadas().includes(fila.id)" (checkedChange)="marcar(fila.id, $event)" />
                </td>
                <td class="px-siaf-md py-siaf-sm">{{ fila.programa.codigo }}</td>
                <td class="px-siaf-md py-siaf-sm">{{ fila.producto.codigo }}</td>
                <td class="min-w-[320px] px-siaf-md py-siaf-sm">{{ codigoNombre(fila.actividad) }}</td>
                <td class="border-l border-[var(--sys-color-divider-default)] px-siaf-md py-siaf-sm">{{ fila.funcion.codigo }}</td>
                <td class="px-siaf-md py-siaf-sm">{{ fila.division.codigo }}</td>
                <td class="px-siaf-md py-siaf-sm">{{ fila.grupo.codigo }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="px-siaf-md py-siaf-lg text-center text-text-muted">No se encontraron resultados.</td>
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CadenasElegidasComponent {
  private readonly cadenasSig = signal<CadenaProgramatica[]>([]);

  /** Cadenas elegidas; al cambiar la lista vuelve a la primera página y se quitan las marcas de las que ya no están. */
  @Input() set cadenas(valor: CadenaProgramatica[]) {
    this.cadenasSig.set(valor);
    this.pagina.set(1);
    this.marcadas.update((marcadas) => marcadas.filter((id) => valor.some((c) => c.id === id)));
  }

  readonly codigoNombre = codigoNombre;

  readonly busqueda = signal('');
  readonly pagina = signal(1);
  readonly filasPorPagina = signal(10);
  readonly marcadas = signal<string[]>([]);

  private readonly filtradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.cadenasSig();
    return this.cadenasSig().filter((c) =>
      [c.programa, c.producto, c.actividad].some((v) => `${v.codigo} ${v.nombre}`.toLowerCase().includes(texto)),
    );
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
}
