import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

import { FormTableSearchComponent } from '../../../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../../../shared/components/pagination/pagination.component';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../../../../shared/ui/checkbox/checkbox.component';
import { RadioComponent, RadioOption } from '../../../../../../shared/ui/radio/radio.component';
import { SidePanelComponent } from '../../../../../../shared/ui/side-panel/side-panel.component';
import { TagComponent } from '../../../../../../shared/ui/tag/tag.component';
import { TextFieldComponent } from '../../../../../../shared/ui/text-field/text-field.component';
import {
  CadenaProgramatica,
  Concepto,
  NOMBRE_CATEGORIA,
  TipoCadena,
  codigoNombre,
} from '../../../models/cadenas-programaticas.mock';

/** Un desplegable del panel de filtros: su etiqueta y el valor de la cadena que filtra. */
interface CampoFiltro {
  clave: string;
  etiqueta: string;
  valor: (cadena: CadenaProgramatica) => string;
}

/** Una columna de ESTRUCTURA PROGRAMÁTICA de la tabla. */
interface ColumnaEstructura {
  etiqueta: string;
  valor: (cadena: CadenaProgramatica) => string;
}

interface CampoDetalle {
  etiqueta: string;
  valor: string;
}

/** Lo que cambia según la categoría y el tipo de cadena: columnas de la tabla, desplegables de los filtros y campos del detalle. */
interface ConfigCadena {
  columnas: ColumnaEstructura[];
  filtros: CampoFiltro[];
  detalle: (cadena: CadenaProgramatica) => CampoDetalle[];
}

const texto = (concepto: Concepto | undefined) => codigoNombre(concepto);
const codigo = (concepto: Concepto | undefined) => concepto?.codigo ?? '-';

const CAMPOS_FUNCIONALES: CampoFiltro[] = [
  { clave: 'funcion', etiqueta: 'Función', valor: (c) => texto(c.funcion) },
  { clave: 'division', etiqueta: 'División funcional', valor: (c) => texto(c.division) },
  { clave: 'grupo', etiqueta: 'Grupo funcional', valor: (c) => texto(c.grupo) },
];

const CATEGORIA: ColumnaEstructura = { etiqueta: 'Categ. pres.', valor: (c) => c.categoria };

const categoriaDetalle = (c: CadenaProgramatica): CampoDetalle => ({
  etiqueta: 'Categoría presupuestaria',
  valor: `${c.categoria} - ${NOMBRE_CATEGORIA[c.categoria] ?? ''}`,
});

const funcionalDetalle = (c: CadenaProgramatica): CampoDetalle[] => [
  { etiqueta: 'Función', valor: texto(c.funcion) },
  { etiqueta: 'División funcional', valor: texto(c.division) },
  { etiqueta: 'Grupo funcional', valor: texto(c.grupo) },
];

/**
 * Configuración por «categoría:tipo» (nodos de Figma del panel y de sus filtros, de PP y de AC). Los desplegables
 * de cada filtro muestran «código + nombre» y son de selección múltiple, con lo elegido como chips con X dentro del campo.
 */
const CONFIG: Record<string, ConfigCadena> = {
  'PP:producto': {
    columnas: [
      CATEGORIA,
      { etiqueta: 'Programa', valor: (c) => codigo(c.programa) },
      { etiqueta: 'Pro / Inv', valor: (c) => codigo(c.producto) },
      { etiqueta: 'Act / AI / Obr', valor: (c) => texto(c.actividad) },
    ],
    filtros: [
      { clave: 'programa', etiqueta: 'Programa', valor: (c) => texto(c.programa) },
      { clave: 'producto', etiqueta: 'Producto', valor: (c) => texto(c.producto) },
      { clave: 'actividad', etiqueta: 'Actividad', valor: (c) => texto(c.actividad) },
      ...CAMPOS_FUNCIONALES,
    ],
    detalle: (c) => [
      categoriaDetalle(c),
      { etiqueta: 'Programa presupuestal', valor: texto(c.programa) },
      { etiqueta: 'Producto', valor: texto(c.producto) },
      { etiqueta: 'Actividad', valor: texto(c.actividad) },
      ...funcionalDetalle(c),
    ],
  },
  'PP:inversion': {
    columnas: [
      CATEGORIA,
      { etiqueta: 'Programa', valor: (c) => codigo(c.programa) },
      { etiqueta: 'Pro / Inv', valor: (c) => codigo(c.producto) },
      { etiqueta: 'Act / AI / Obr', valor: (c) => texto(c.actividad) },
    ],
    filtros: [
      { clave: 'programa', etiqueta: 'Programa', valor: (c) => texto(c.programa) },
      { clave: 'producto', etiqueta: 'Inversión', valor: (c) => texto(c.producto) },
      { clave: 'actividad', etiqueta: 'AI / OBR', valor: (c) => c.actividad.codigo },
      { clave: 'nombreActividad', etiqueta: 'Nombre de AI / OBR', valor: (c) => c.actividad.nombre },
      ...CAMPOS_FUNCIONALES,
    ],
    detalle: (c) => [
      categoriaDetalle(c),
      { etiqueta: 'Programa presupuestal', valor: texto(c.programa) },
      { etiqueta: 'Inversión', valor: texto(c.producto) },
      { etiqueta: 'AI / Obra', valor: texto(c.actividad) },
      ...funcionalDetalle(c),
    ],
  },
  'AC:actividad': {
    columnas: [CATEGORIA, { etiqueta: 'Inversión', valor: (c) => codigo(c.producto) }, { etiqueta: 'Act / AI / Obr', valor: (c) => texto(c.actividad) }],
    filtros: [
      { clave: 'actividad', etiqueta: 'Actividad', valor: (c) => c.actividad.codigo },
      { clave: 'nombreActividad', etiqueta: 'Nombre de actividad', valor: (c) => c.actividad.nombre },
      ...CAMPOS_FUNCIONALES,
    ],
    detalle: (c) => [categoriaDetalle(c), { etiqueta: 'Actividad', valor: texto(c.actividad) }, ...funcionalDetalle(c)],
  },
  'AC:inversion': {
    columnas: [CATEGORIA, { etiqueta: 'Inversión', valor: (c) => codigo(c.producto) }, { etiqueta: 'AI / OBR', valor: (c) => texto(c.actividad) }],
    filtros: [
      { clave: 'producto', etiqueta: 'Inversión', valor: (c) => texto(c.producto) },
      { clave: 'actividad', etiqueta: 'AI / OBR', valor: (c) => c.actividad.codigo },
      { clave: 'nombreActividad', etiqueta: 'Nombre de AI / OBR', valor: (c) => c.actividad.nombre },
      ...CAMPOS_FUNCIONALES,
    ],
    detalle: (c) => [
      categoriaDetalle(c),
      { etiqueta: 'Inversión', valor: texto(c.producto) },
      { etiqueta: 'AI / Obra', valor: texto(c.actividad) },
      ...funcionalDetalle(c),
    ],
  },
};

/** APNOP no tiene diseño propio: usa las mismas columnas, filtros y detalle que AC. */
const configDe = (categoria: string, tipo: TipoCadena): ConfigCadena =>
  CONFIG[`${categoria === 'APNOP' ? 'AC' : categoria}:${tipo}`] ?? CONFIG['PP:producto'];

/** Tipos que ofrece cada categoría; el primero es el de por defecto. */
const TIPOS_POR_CATEGORIA: Record<string, TipoCadena[]> = {
  PP: ['producto', 'inversion'],
  AC: ['actividad', 'inversion'],
  APNOP: ['actividad', 'inversion'],
};

const ETIQUETA_TIPO: Record<TipoCadena, string> = {
  producto: 'Producto predeterminado',
  actividad: 'Actividad predeterminada',
  inversion: 'Inversión',
};

interface FiltrosCadena {
  tipo: TipoCadena;
  /** Valores elegidos por `clave` de campo; vacío o ausente = sin filtrar. */
  valores: Record<string, string[]>;
}

/**
 * Panel «Seleccionar cadena» del registro de clasificador (nodos de Figma 2009:315630 y 1865:311851, y sus capturas de AC): un
 * `siaf-side-panel` con el buscador, la tabla de cadenas programáticas (estructura programática y clasificador
 * funcional) y la paginación. Las casillas permiten marcar varias cadenas; al hacer clic en una fila se abre a la
 * derecha su detalle (código + nombre de cada nivel) y la flecha lo cierra.
 *
 * Con PP ofrece los tipos Producto predeterminado e Inversión; con AC y APNOP, Actividad predeterminada e Inversión. Las
 * columnas, los filtros y el detalle cambian según la categoría y el tipo (AC y APNOP no llevan Programa).
 *
 * El ícono de filtros abre a la derecha el panel «Filtros» (tipo y desplegables con «código + nombre»); Aplicar filtra la tabla y, con Inversión, la cambia por las cadenas de inversión. Filtros y
 * detalle comparten ese lugar. Emite `confirmed` con las cadenas marcadas.
 */
@Component({
  selector: 'siaf-cadena-search-panel',
  standalone: true,
  imports: [ButtonComponent, CheckboxComponent, FormTableSearchComponent, PaginationComponent, RadioComponent, SidePanelComponent, TagComponent, TextFieldComponent],
  template: `
    <siaf-side-panel
      [open]="open"
      title="Seleccionar cadena"
      [showFooter]="!detalle()"
      [confirmDisabled]="marcadas().length === 0"
      [showNav]="filtrosAbiertos()"
      navTitle="Filtros"
      navConfirmLabel="Aplicar"
      (navConfirmed)="aplicarFiltros()"
      (navCanceled)="cerrarFiltros()"
      (closed)="closed.emit()"
      (canceled)="closed.emit()"
      (confirmed)="aceptar()"
    >
      <div class="flex min-h-full">
        <div class="flex min-w-0 flex-1 flex-col gap-siaf-md" [class.pr-siaf-md]="!!detalle()">
          <siaf-form-table-search [value]="busqueda()" [showFilter]="true" [showMore]="false" (valueChange)="buscar($event)" (filter)="abrirFiltros()" />

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
                  <th [attr.colspan]="columnas().length" class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Estructura programática</th>
                  <th colspan="3" class="border-b border-l border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Clasificador funcional</th>
                </tr>
                <tr class="bg-[var(--sys-color-bg-surfaces-surface-high)] text-left">
                  @for (col of columnas(); track col.etiqueta) {
                    <th class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">{{ col.etiqueta }}</th>
                  }
                  <th class="border-b border-l border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Función</th>
                  <th class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Div_F</th>
                  <th class="border-b border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm text-xs font-bold uppercase text-text">Grp_F</th>
                </tr>
              </thead>
              <tbody>
                @for (fila of filasPagina(); track fila.id) {
                  <tr
                    class="cursor-pointer border-b border-[var(--sys-color-divider-default)] text-[var(--sys-color-text-neutral-medium)] hover:bg-surface-muted"
                    [class.bg-[var(--sys-color-bg-states-light-selected)]]="detalleId() === fila.id || marcadas().includes(fila.id)"
                    (click)="abrirDetalle(fila.id)"
                  >
                    <td class="px-siaf-sm py-siaf-sm" (click)="$event.stopPropagation()">
                      <siaf-checkbox [checked]="marcadas().includes(fila.id)" (checkedChange)="marcar(fila.id, $event)" />
                    </td>
                    @for (col of columnas(); track col.etiqueta; let ultima = $last) {
                      <td class="px-siaf-md py-siaf-sm" [class.min-w-[320px]]="ultima">{{ col.valor(fila) }}</td>
                    }
                    <td class="border-l border-[var(--sys-color-divider-default)] px-siaf-md py-siaf-sm">{{ fila.funcion.codigo }}</td>
                    <td class="px-siaf-md py-siaf-sm">{{ fila.division.codigo }}</td>
                    <td class="px-siaf-md py-siaf-sm">{{ fila.grupo.codigo }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td [attr.colspan]="columnas().length + 4" class="px-siaf-md py-siaf-lg text-center text-text-muted">No se encontraron resultados.</td>
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

      <div sidePanelNav class="flex flex-col gap-siaf-md p-siaf-md">
        <siaf-radio-group label="Tipo" name="cadena-filtro-tipo" [options]="opcionesTipo()" [value]="borrador().tipo" (valueChange)="cambiarTipo($any($event))" />
        @for (campo of camposBorrador(); track campo.clave) {
          <siaf-input
            type="select-multiple"
            [label]="campo.etiqueta"
            [options]="opcionesPorCampo()[campo.clave]"
            [value]="borrador().valores[campo.clave] ?? []"
            (valueChange)="cambiarValor(campo.clave, $any($event))"
          />
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

  private readonly categoriaSig = signal('PP');

  /** Categoría presupuestaria (`PP`, `AC` o `APNOP`): enlazar antes que `open`. */
  @Input() set categoria(valor: string) {
    this.categoriaSig.set(valor);
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

  readonly busqueda = signal('');
  readonly pagina = signal(1);
  readonly filasPorPagina = signal(25);
  readonly marcadas = signal<string[]>([]);
  readonly detalleId = signal<string | null>(null);

  // Filtros: lo aplicado a la tabla y el borrador que se edita en el panel «Filtros» hasta pulsar Aplicar.
  readonly filtrosAbiertos = signal(false);
  readonly aplicados = signal<FiltrosCadena>({ tipo: 'producto', valores: {} });
  readonly borrador = signal<FiltrosCadena>({ tipo: 'producto', valores: {} });

  readonly opcionesTipo = computed<RadioOption[]>(() =>
    (TIPOS_POR_CATEGORIA[this.categoriaSig()] ?? TIPOS_POR_CATEGORIA['PP']).map((tipo) => ({ value: tipo, label: ETIQUETA_TIPO[tipo] })),
  );
  /** Cadenas de la categoría elegida. */
  private readonly cadenasCategoria = computed(() => this.cadenasSig().filter((c) => c.categoria === this.categoriaSig()));
  /** Columnas de la tabla: las del tipo aplicado. */
  readonly columnas = computed(() => configDe(this.categoriaSig(), this.aplicados().tipo).columnas);

  /** La fila «Filtros por» aparece al pulsar Aplicar y se va con «Borrar filtros». */
  readonly filtrosVisibles = signal(false);
  readonly chips = computed(() => {
    const { tipo, valores } = this.aplicados();
    return [ETIQUETA_TIPO[tipo], ...configDe(this.categoriaSig(), tipo).filtros.flatMap((campo) => valores[campo.clave] ?? [])];
  });

  readonly camposBorrador = computed(() => configDe(this.categoriaSig(), this.borrador().tipo).filtros);

  /** Opciones de cada desplegable: los valores distintos de las cadenas del tipo en edición, ordenados. */
  readonly opcionesPorCampo = computed<Record<string, { value: string; label: string }[]>>(() => {
    const delTipo = this.cadenasCategoria().filter((c) => c.tipo === this.borrador().tipo);
    return Object.fromEntries(
      this.camposBorrador().map((campo) => {
        const valores = [...new Set(delTipo.map((c) => campo.valor(c)))].sort((a, b) => a.localeCompare(b));
        return [campo.clave, valores.map((v) => ({ value: v, label: v }))];
      }),
    );
  });

  private readonly filtradas = computed(() => {
    const { tipo, valores } = this.aplicados();
    const campos = configDe(this.categoriaSig(), tipo).filtros;
    const buscado = this.busqueda().trim().toLowerCase();
    return this.cadenasCategoria().filter(
      (c) =>
        c.tipo === tipo &&
        campos.every((campo) => !valores[campo.clave]?.length || valores[campo.clave].includes(campo.valor(c))) &&
        (!buscado ||
          [c.categoria, texto(c.programa), texto(c.producto), texto(c.actividad)].some((v) => v.toLowerCase().includes(buscado))),
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
    this.filtrosAbiertos.set(false);
    this.detalleId.set(id);
  }

  abrirFiltros(): void {
    this.detalleId.set(null);
    this.borrador.set(this.aplicados());
    this.filtrosAbiertos.set(true);
  }

  cerrarFiltros(): void {
    this.filtrosAbiertos.set(false);
  }

  /** Cambiar de tipo vacía los desplegables: sus opciones salen de las cadenas del nuevo tipo. */
  cambiarTipo(tipo: TipoCadena): void {
    if (tipo !== this.borrador().tipo) this.borrador.set({ tipo, valores: {} });
  }

  cambiarValor(clave: string, valor: string[]): void {
    this.borrador.update((b) => ({ ...b, valores: { ...b.valores, [clave]: valor } }));
  }

  aplicarFiltros(): void {
    this.aplicados.set(this.borrador());
    this.filtrosVisibles.set(true);
    this.pagina.set(1);
    this.filtrosAbiertos.set(false);
  }

  /** Quita todos los filtros: vuelve al tipo por defecto con todas sus cadenas. El buscador y las marcas no cambian. */
  borrarFiltros(): void {
    this.aplicados.set(this.sinFiltros());
    this.borrador.set(this.sinFiltros());
    this.filtrosVisibles.set(false);
    this.pagina.set(1);
  }

  cerrarDetalle(): void {
    this.detalleId.set(null);
  }

  /** Campos del detalle de una cadena: cada nivel como «código nombre». */
  camposDetalle(cadena: CadenaProgramatica): CampoDetalle[] {
    return configDe(cadena.categoria, cadena.tipo).detalle(cadena);
  }

  /** Sin filtros: el primer tipo de la categoría (Producto o Actividad predeterminada) y ningún desplegable elegido. */
  private sinFiltros(): FiltrosCadena {
    return { tipo: (TIPOS_POR_CATEGORIA[this.categoriaSig()] ?? TIPOS_POR_CATEGORIA['PP'])[0], valores: {} };
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
    this.filtrosAbiertos.set(false);
    this.filtrosVisibles.set(false);
    this.aplicados.set(this.sinFiltros());
    this.borrador.set(this.sinFiltros());
  }
}
