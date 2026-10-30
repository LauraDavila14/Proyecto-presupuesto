import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

import { BreadcrumbItem } from '../../../../../../shared/components/breadcrumb/breadcrumb.component';
import { SolicitudePageLayoutComponent } from '../../../../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { NOMBRE_CATEGORIA } from '../../../models/cadenas-programaticas.mock';
import { ItemEstructura, RegistroClasificador } from '../../../models/clasificador-programatico.model';

interface CampoDetalle {
  etiqueta: string;
  valor: string;
}

const SIN_DATO = '-';

/** Deja solo los campos con dato. */
const conDato = (campos: CampoDetalle[]): CampoDetalle[] => campos.filter((c) => c.valor !== SIN_DATO);

const codigoNombre = (item: ItemEstructura | undefined): string => (item ? `${item['codigo']} ${item['nombre']}` : SIN_DATO);

/**
 * Detalle de un registro de clasificador (nodo de Figma «Detalle de registro de clasificador»): página de solo lectura
 * con su estructura programática, clasificador funcional y vigencia, que se abre al elegir una fila de la tabla de
 * registros. Los campos sin dato no se muestran (ni la sección que se queda sin campos); Estado y las fechas de la
 * vigencia sí, porque el diseño las muestra aunque aún no tengan valor. La flecha de la cabecera emite `returned`. Los
 * dos botones de «Datos complementarios» son solo visuales.
 */
@Component({
  selector: 'siaf-registro-detalle',
  standalone: true,
  imports: [ButtonComponent, SolicitudePageLayoutComponent],
  template: `
    <siaf-solicitude-page-layout
      [breadcrumbs]="breadcrumbs"
      state="readonly"
      heading="Detalle de registro de clasificador"
      [showReturn]="true"
      [showTag]="false"
      [showButtonGroup]="false"
      (returned)="returned.emit()"
    >
      <section class="flex flex-col gap-siaf-lg rounded-siaf-md bg-surface p-siaf-lg">
        <div class="flex flex-col gap-siaf-md">
          <h2 class="m-0 text-sm font-bold uppercase text-text">Estructura programática</h2>
          <dl class="m-0 flex flex-col gap-siaf-md pl-siaf-sm">
            @for (campo of estructura(); track campo.etiqueta) {
              <div class="flex flex-col gap-1">
                <dt class="text-xs uppercase text-[var(--sys-color-text-neutral-low)]">{{ campo.etiqueta }}</dt>
                <dd class="m-0 text-sm text-text">{{ campo.valor }}</dd>
              </div>
            }
          </dl>
        </div>

        @if (funcional().length > 0) {
          <div class="flex flex-col gap-siaf-md">
            <h2 class="m-0 text-sm font-bold uppercase text-text">Clasificador funcional</h2>
            <dl class="m-0 grid gap-siaf-md pl-siaf-sm md:grid-cols-3">
              @for (campo of funcional(); track campo.etiqueta) {
                <div class="flex flex-col gap-1">
                  <dt class="text-xs uppercase text-[var(--sys-color-text-neutral-low)]">{{ campo.etiqueta }}</dt>
                  <dd class="m-0 text-sm text-text">{{ campo.valor }}</dd>
                </div>
              }
            </dl>
          </div>
        }

        <div class="flex flex-col gap-siaf-md">
          <h2 class="m-0 text-sm font-bold uppercase text-text">Vigencia</h2>
          <dl class="m-0 grid gap-siaf-md pl-siaf-sm md:grid-cols-3">
            <div class="flex flex-col gap-1">
              <dt class="text-xs uppercase text-[var(--sys-color-text-neutral-low)]">Estado</dt>
              <dd class="m-0 text-sm text-text">Si</dd>
            </div>
            <div class="flex flex-col gap-1">
              <dt class="text-xs uppercase text-[var(--sys-color-text-neutral-low)]">Fecha desde</dt>
              <dd class="m-0 text-sm text-text">--/--/----</dd>
              <span class="text-xs text-[var(--sys-color-text-neutral-low)]">Será asignada cuando se acepte el requerimiento de solicitud.</span>
            </div>
            <div class="flex flex-col gap-1">
              <dt class="text-xs uppercase text-[var(--sys-color-text-neutral-low)]">Fecha hasta</dt>
              <dd class="m-0 text-sm text-text">--/--/----</dd>
            </div>
          </dl>
        </div>

        <div class="flex flex-col gap-siaf-md">
          <h2 class="m-0 text-sm font-bold uppercase text-text">Datos complementarios</h2>
          <div class="grid gap-siaf-md md:grid-cols-2">
            <siaf-button class="block [&>button]:w-full [&>button]:justify-between" variant="outline" icon="open_in_new" iconPosition="end">Ver mayor detalle de clasificador</siaf-button>
            <siaf-button class="block [&>button]:w-full [&>button]:justify-between" variant="outline" icon="open_in_new" iconPosition="end">Ver mayor detalle del indicador</siaf-button>
          </div>
        </div>
      </section>
    </siaf-solicitude-page-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroDetalleComponent {
  private readonly registroSig = signal<RegistroClasificador | null>(null);

  @Input() breadcrumbs: BreadcrumbItem[] = [];

  @Input() set registro(valor: RegistroClasificador | null) {
    this.registroSig.set(valor);
  }

  @Output() returned = new EventEmitter<void>();

  /** Nivel «Producto» del registro; en una cadena de inversión es la inversión y, en AC y APNOP, el proyecto. */
  readonly estructura = computed<CampoDetalle[]>(() => {
    const registro = this.registroSig();
    if (!registro) return [];
    const { programa, producto, proyecto, actividad } = registro.estructura;
    const inversion = registro.tipoCadena === 'inversion';
    const nivel = producto ?? proyecto;
    return conDato([
      { etiqueta: 'Categoría presupuestaria', valor: `${registro.categoriaPresupuestaria} - ${NOMBRE_CATEGORIA[registro.categoriaPresupuestaria] ?? ''}` },
      { etiqueta: 'Programa presupuestal', valor: codigoNombre(programa) },
      { etiqueta: inversion ? 'Inversión' : !producto && proyecto ? 'Proyecto' : 'Producto', valor: codigoNombre(nivel) },
      { etiqueta: inversion ? 'AI / Obra' : 'Actividad', valor: codigoNombre(actividad) },
    ]);
  });

  readonly funcional = computed<CampoDetalle[]>(() => {
    const funcional = this.registroSig()?.estructura.funcional;
    return conDato([
      { etiqueta: 'Función', valor: funcional?.['funcion'] ?? SIN_DATO },
      { etiqueta: 'División funcional', valor: funcional?.['division'] ?? SIN_DATO },
      { etiqueta: 'Grupo funcional', valor: funcional?.['grupo'] ?? SIN_DATO },
    ]);
  });
}
