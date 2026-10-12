import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CurrentUserService } from '../../../../../core/auth/current-user.service';
import { BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { TableControlsComponent } from '../../../../../shared/components/table-controls/table-controls.component';
import { FormTableSearchComponent } from '../../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { SolicitudeInfoCardComponent, SolicitudeInfoField } from '../../../../../shared/components/solicitude-info-card/solicitude-info-card.component';
import { SolicitudePageLayoutComponent } from '../../../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../../../shared/ui/checkbox/checkbox.component';
import { DateTimePickerComponent } from '../../../../../shared/ui/date-time-picker/date-time-picker.component';
import { RadioComponent, RadioOption } from '../../../../../shared/ui/radio/radio.component';
import { RequestApprovalModalsComponent } from '../../../../../shared/components/request-approval-modals/request-approval-modals.component';
import { SolicitudeHeaderState } from '../../../../../shared/components/solicitude-header/solicitude-header.component';
import { DocumentSummaryCardComponent } from '../../../../../shared/ui/document-summary-card/document-summary-card.component';
import { ReadonlyFieldComponent } from '../../../../../shared/ui/readonly-field/readonly-field.component';
import { TagComponent } from '../../../../../shared/ui/tag/tag.component';
import { SidePanelComponent } from '../../../../../shared/ui/side-panel/side-panel.component';
import { SnackbarComponent, SnackbarVariant } from '../../../../../shared/ui/snackbar/snackbar.component';
import { SummaryCardComponent, SummaryCardField } from '../../../../../shared/ui/summary-card/summary-card.component';
import { TextFieldComponent } from '../../../../../shared/ui/text-field/text-field.component';
import { PROCESS_ROUTE } from '../../config/clasificador-programatico.rutas';
import {
  CAMPOS_ESTRUCTURA,
  CAMPOS_POR_CATEGORIA,
  COLUMNAS_FUNCIONAL,
  FUNCIONALES,
  CATEGORIAS_PRESUPUESTARIAS,
  CampoEstructura,
  FINALIDAD_FIJA,
  ItemEstructura,
  PROCESOS_CLASIFICADOR,
  RegistroClasificador,
  codigoFuncional,
} from '../../models/clasificador-programatico.model';

/** Filtros de la búsqueda de Producto/Proyecto; vacío = sin filtrar. */
interface FiltrosBusqueda {
  tipo: string;
  codigo: string;
  nombre: string;
}

/**
 * Solicitud de clasificador programático, tipo de acción «Creación» (nodo de Figma 1096:123152): pantalla de
 * ejemplo del taller. Los registros que agrega el usuario viven en memoria de este componente — no hay solicitud
 * real, backend simulado ni persistencia: «Grabar» solo confirma con un aviso y «Verificar y enviar» queda
 * deshabilitado, porque no hay un flujo de aprobación detrás.
 *
 * Al pulsar (+) en «Registro de clasificador» se abre el panel con «Proceso» (Programación y/o Gestión) y el
 * desplegable «Categoría presupuestaria» (PP, AC, APNOP). Con un proceso y una categoría elegidos aparecen
 * «Estructura programática» (cuatro campos que se eligen con la lupa) y «Vigencia» (Estado «Sí» y fechas que
 * asigna el sistema al aceptarse la solicitud: solo lectura). «Aceptar» se habilita con los cuatro campos
 * elegidos y agrega una fila a la tabla.
 */
@Component({
  selector: 'siaf-clasificador-programatico-request',
  standalone: true,
  imports: [
    ButtonComponent,
    CheckboxComponent,
    DocumentSummaryCardComponent,
    ReadonlyFieldComponent,
    RequestApprovalModalsComponent,
    DateTimePickerComponent,
    FormTableSearchComponent,
    PaginationComponent,
    RadioComponent,
    SidePanelComponent,
    SnackbarComponent,
    SummaryCardComponent,
    TableControlsComponent,
    TagComponent,
    SolicitudeInfoCardComponent,
    SolicitudePageLayoutComponent,
    TextFieldComponent,
  ],
  templateUrl: './clasificador-programatico-request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClasificadorProgramaticoRequestComponent {
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly currentUser = inject(CurrentUserService);

  readonly heading = 'Solicitud de clasificador programático';
  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    { label: 'Crear Documento', href: PROCESS_ROUTE },
    { label: 'Clasificador programático' },
  ];

  readonly camposEntidad = computed<SolicitudeInfoField[]>(() => {
    const usuario = this.currentUser.user();
    return [
      { label: 'Fecha', value: '' },
      { label: 'Unidad ejecutora', value: (usuario.unidad ?? usuario.office).toUpperCase() },
    ];
  });

  // ── Registros agregados ──────────────────────────────────────────
  readonly registros = signal<RegistroClasificador[]>([]);
  private correlativo = 0;

  readonly saveDisabled = computed(() => this.registros().length === 0);

  // ── Estado del documento (nodo de Figma 1232:139248) ───────────────
  // Nuevo → «Grabar» (modal) → Elaborado (solo lectura: Eliminar, Editar, Verificar y enviar). «Editar» vuelve a
  // la edición con los registros. No hay backend: el N°, «Elaborado por» y la fecha viven en memoria.
  readonly elaborado = signal(false);
  readonly enEdicion = signal(false);
  readonly numeroDocumento = signal('');
  readonly elaboradoPor = signal('');
  readonly fechaElaboracion = signal('');
  readonly headerState = computed<SolicitudeHeaderState>(() => (this.elaborado() ? 'elaborated' : this.enEdicion() ? 'edit' : 'new'));
  /** «Verificar y enviar» solo se habilita con el documento elaborado. */
  readonly verifyDisabled = computed(() => !this.elaborado());

  readonly modalGrabar = signal(false);
  readonly modalVerificar = signal(false);
  readonly modalEliminar = signal(false);
  private numeroSiguiente = 1;

  // ── Tabla de registros (nodo de Figma 1096:122648) ────────────────
  readonly busquedaRegistros = signal('');
  readonly paginaRegistros = signal(1);
  readonly filasRegistros = signal(10);
  /** Casillas marcadas: solo visuales, no hay acciones sobre la selección. */
  readonly filasMarcadas = signal<string[]>([]);

  /** Filas de la tabla con los códigos que muestra el diseño. */
  readonly filasTabla = computed(() =>
    this.registros().map((r) => ({
      id: r.id,
      categoria: r.categoriaPresupuestaria,
      programa: r.estructura.programa?.['codigo'] ?? '-',
      producto: (r.estructura.producto ?? r.estructura.proyecto)?.['codigo'] ?? '-',
      actividad: r.estructura.actividad['codigo'],
      finalidad: FINALIDAD_FIJA,
      funcion: codigoFuncional(r.estructura.funcional['funcion']),
      division: codigoFuncional(r.estructura.funcional['division']),
      grupo: codigoFuncional(r.estructura.funcional['grupo']),
      estado: 'SI',
      fechaDesde: '-',
    })),
  );
  private readonly filasTablaFiltradas = computed(() => {
    const texto = this.busquedaRegistros().trim().toLowerCase();
    if (!texto) return this.filasTabla();
    return this.filasTabla().filter((f) => Object.values(f).some((v) => v.toLowerCase().includes(texto)));
  });
  readonly totalRegistros = computed(() => this.filasTablaFiltradas().length);
  readonly totalPaginasRegistros = computed(() => Math.max(1, Math.ceil(this.totalRegistros() / this.filasRegistros())));
  readonly filasTablaPagina = computed(() => {
    const desde = (this.paginaRegistros() - 1) * this.filasRegistros();
    return this.filasTablaFiltradas().slice(desde, desde + this.filasRegistros());
  });
  readonly todasMarcadas = computed(() => this.filasTablaPagina().length > 0 && this.filasTablaPagina().every((f) => this.filasMarcadas().includes(f.id)));
  readonly algunaMarcada = computed(() => this.filasMarcadas().length > 0 && !this.todasMarcadas());

  buscarRegistros(texto: string): void {
    this.busquedaRegistros.set(texto);
    this.paginaRegistros.set(1);
  }

  cambiarPaginaRegistros(delta: number): void {
    this.paginaRegistros.update((p) => Math.min(this.totalPaginasRegistros(), Math.max(1, p + delta)));
  }

  cambiarFilasRegistros(filas: number): void {
    this.filasRegistros.set(filas);
    this.paginaRegistros.set(1);
  }

  marcarTodas(marcar: boolean): void {
    this.filasMarcadas.set(marcar ? this.filasTablaPagina().map((f) => f.id) : []);
  }

  marcarFila(id: string, marcar: boolean): void {
    this.filasMarcadas.update((m) => (marcar ? [...m.filter((x) => x !== id), id] : m.filter((x) => x !== id)));
  }

  // ── Panel «Registro de clasificador» ──────────────────────────────
  readonly agregando = signal(false);
  readonly procesos = PROCESOS_CLASIFICADOR;
  readonly categorias = CATEGORIAS_PRESUPUESTARIAS;

  readonly procesosMarcados = signal<string[]>([]);
  readonly categoria = signal('');

  /** «Estructura programática» y «Vigencia» aparecen cuando ya hay proceso y categoría. */
  readonly mostrarEstructura = computed(() => this.procesosMarcados().length > 0 && !!this.categoria());

  // «Estructura programática»: un campo por catálogo, elegido en el side-nav de selección.
  // Los campos dependen de la categoría: PP pide Programa → Producto/Proyecto → Actividad (cada lupa se habilita al
  // elegir el anterior); AC y APNOP piden Proyecto y Actividad, con las dos lupas activas. El clasificador funcional
  // no se busca: se asigna solo con la actividad elegida.
  readonly camposEstructura = computed(() =>
    (CAMPOS_POR_CATEGORIA[this.categoria()] ?? []).map((campo) => CAMPOS_ESTRUCTURA.find((c) => c.campo === campo)!),
  );
  readonly columnasFuncional = COLUMNAS_FUNCIONAL;
  readonly seleccion = signal<Record<CampoEstructura, ItemEstructura | null>>(this.seleccionVacia());
  readonly funcionalAsignado = computed<ItemEstructura | null>(() => {
    const funcionalId = this.seleccion().actividad?.['funcionalId'];
    return FUNCIONALES.find((f) => f.id === funcionalId) ?? null;
  });
  readonly campoAbierto = signal<CampoEstructura | null>(null);
  readonly busqueda = signal('');
  readonly tempSeleccionId = signal<string | null>(null);
  readonly hayFilaElegida = computed(() => !!this.tempSeleccionId());

  readonly configCampoAbierto = computed(() => CAMPOS_ESTRUCTURA.find((c) => c.campo === this.campoAbierto()) ?? null);
  readonly columnasBusqueda = computed(() => this.configCampoAbierto()?.columnas ?? []);

  // Filtros de la búsqueda de Producto/Proyecto (panel «Filtros» de `siaf-side-panel`): Tipo, Código y Nombre.
  // Se editan en un borrador y recién «Aplicar» los pasa a la grilla.
  readonly opcionesTipo: RadioOption[] = [
    { label: 'Producto predeterminado', value: 'Producto' },
    { label: 'Proyecto', value: 'Proyecto' },
  ];
  readonly filtrosAbiertos = signal(false);
  readonly filtros = signal<FiltrosBusqueda>({ tipo: '', codigo: '', nombre: '' });
  readonly filtrosBorrador = signal<FiltrosBusqueda>({ tipo: 'Producto', codigo: '', nombre: '' });
  readonly hayFiltrosAvanzados = computed(() => !!this.configCampoAbierto()?.filtrosAvanzados);
  readonly navFiltrosVisible = computed(() => this.hayFiltrosAvanzados() && this.filtrosAbiertos());
  readonly chipsFiltros = computed(() => {
    const f = this.filtros();
    return [
      f.tipo && (this.opcionesTipo.find((o) => o.value === f.tipo)?.label ?? f.tipo),
      f.codigo,
      f.nombre,
    ].filter(Boolean) as string[];
  });
  /** Opciones de los desplegables Código y Nombre: las del catálogo, del tipo elegido en el borrador. */
  readonly opcionesCodigo = computed(() => this.valoresDeColumna('codigo'));
  readonly opcionesNombre = computed(() => this.valoresDeColumna('nombre'));

  // Paginación de la ventana de selección (en memoria).
  readonly pagina = signal(1);
  readonly filasPorPagina = signal(10);
  private readonly filasFiltradas = computed<ItemEstructura[]>(() => {
    const catalogo = this.configCampoAbierto()?.catalogo ?? [];
    const f = this.filtros();
    const texto = this.busqueda().trim().toLowerCase();
    const filtrado = catalogo.filter(
      (i) => (!f.tipo || i['tipo'] === f.tipo) && (!f.codigo || i['codigo'] === f.codigo) && (!f.nombre || i['nombre'] === f.nombre),
    );
    if (!texto) return filtrado;
    const claves = this.columnasBusqueda().map((c) => c.key);
    return filtrado.filter((i) => claves.some((clave) => i[clave].toLowerCase().includes(texto)));
  });
  readonly totalFilas = computed(() => this.filasFiltradas().length);
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalFilas() / this.filasPorPagina())));
  readonly filasBusqueda = computed<ItemEstructura[]>(() => {
    const desde = (this.pagina() - 1) * this.filasPorPagina();
    return this.filasFiltradas().slice(desde, desde + this.filasPorPagina());
  });

  // «Vigencia»: solo lectura (Estado «Sí»; las fechas las asigna el sistema al aceptarse la solicitud).
  readonly opcionesEstado: RadioOption[] = [
    { label: 'Sí', value: 'si' },
    { label: 'No', value: 'no' },
  ];

  readonly puedeAceptar = computed(
    () => this.mostrarEstructura() && this.camposEstructura().every((c) => !!this.seleccion()[c.campo]),
  );

  // ── Aviso ──────────────────────────────────────────────────────────
  readonly avisoAbierto = signal(false);
  readonly aviso = signal<SnackbarVariant>('record-done');

  estaMarcado(codigo: string): boolean {
    return this.procesosMarcados().includes(codigo);
  }

  marcarProceso(codigo: string, marcado: boolean): void {
    this.procesosMarcados.update((actuales) =>
      marcado ? [...actuales.filter((c) => c !== codigo), codigo] : actuales.filter((c) => c !== codigo),
    );
  }

  cambiarCategoria(categoria: string): void {
    if (categoria === this.categoria()) return;
    this.categoria.set(categoria);
    this.seleccion.set(this.seleccionVacia());
  }

  /** La lupa de un campo se apaga con su selección hecha y, en PP, mientras falte elegir el campo anterior. */
  lupaDeshabilitada(campo: CampoEstructura): boolean {
    if (this.seleccion()[campo]) return true;
    if (this.categoria() !== 'PP') return false;
    const campos = this.camposEstructura();
    const indice = campos.findIndex((c) => c.campo === campo);
    return indice > 0 && !this.seleccion()[campos[indice - 1].campo];
  }

  /** Campos de la card del clasificador funcional asignado. */
  camposCardFuncional(item: ItemEstructura): SummaryCardField[] {
    return COLUMNAS_FUNCIONAL.map((c) => ({ label: c.label, value: item[c.key] }));
  }

  abrirPanel(): void {
    this.procesosMarcados.set([]);
    this.categoria.set('');
    this.seleccion.set(this.seleccionVacia());
    this.agregando.set(true);
  }

  cerrarPanel(): void {
    this.agregando.set(false);
  }

  abrirBusqueda(campo: CampoEstructura): void {
    this.busqueda.set('');
    this.pagina.set(1);
    this.filasPorPagina.set(CAMPOS_ESTRUCTURA.find((c) => c.campo === campo)?.filasPorPagina ?? 10);
    this.filtros.set({ tipo: '', codigo: '', nombre: '' });
    this.filtrosAbiertos.set(false);
    this.tempSeleccionId.set(this.seleccion()[campo]?.id ?? null);
    this.campoAbierto.set(campo);
  }

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

  /** Campos de la `siaf-summary-card` de un campo elegido: una etiqueta/valor por cada columna de su búsqueda. */
  camposCard(campo: CampoEstructura, item: ItemEstructura): SummaryCardField[] {
    const columnas = CAMPOS_ESTRUCTURA.find((c) => c.campo === campo)!.columnas;
    return columnas.map((c) => ({ label: c.label, value: item[c.key], widthClass: c.anchoCard }));
  }

  /** Quita la selección de un campo (✕ de la card): reactiva su lupa y le devuelve el foco. */
  quitarSeleccion(campo: CampoEstructura, titulo: string): void {
    // En PP, quitar un campo vacía también los siguientes: dependen de él.
    const campos = this.camposEstructura().map((c) => c.campo);
    const quitados = this.categoria() === 'PP' ? campos.slice(campos.indexOf(campo)) : [campo];
    this.seleccion.update((actual) => {
      const siguiente = { ...actual };
      for (const c of quitados) siguiente[c] = null;
      return siguiente;
    });
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(`button[aria-label="Buscar ${titulo.toLowerCase()}"]`)?.focus());
  }

  resumen(campo: CampoEstructura, item: ItemEstructura): string {
    return CAMPOS_ESTRUCTURA.find((c) => c.campo === campo)!.resumen(item);
  }

  abrirFiltros(): void {
    const f = this.filtros();
    this.filtrosBorrador.set(f.tipo || f.codigo || f.nombre ? { ...f } : { tipo: 'Producto', codigo: '', nombre: '' });
    this.filtrosAbiertos.set(true);
  }

  cerrarFiltros(): void {
    this.filtrosAbiertos.set(false);
  }

  cambiarFiltro<K extends keyof FiltrosBusqueda>(campo: K, valor: FiltrosBusqueda[K]): void {
    this.filtrosBorrador.update((f) => ({ ...f, [campo]: valor, ...(campo === 'tipo' ? { codigo: '', nombre: '' } : {}) }));
  }

  aplicarFiltros(): void {
    this.filtros.set({ ...this.filtrosBorrador() });
    this.pagina.set(1);
    this.filtrosAbiertos.set(false);
  }

  borrarFiltros(): void {
    this.filtros.set({ tipo: '', codigo: '', nombre: '' });
    this.pagina.set(1);
  }

  private valoresDeColumna(clave: 'codigo' | 'nombre'): { label: string; value: string }[] {
    const tipo = this.filtrosBorrador().tipo;
    const catalogo = this.configCampoAbierto()?.catalogo ?? [];
    const valores = catalogo.filter((i) => !tipo || i['tipo'] === tipo).map((i) => i[clave]);
    return [...new Set(valores)].map((v) => ({ label: v, value: v }));
  }

  cerrarBusqueda(): void {
    this.campoAbierto.set(null);
    this.filtrosAbiertos.set(false);
  }

  seleccionarFila(id: string): void {
    this.tempSeleccionId.set(id);
  }

  onAceptarBusqueda(): void {
    const campo = this.campoAbierto();
    if (campo) {
      const item = this.configCampoAbierto()?.catalogo.find((i) => i.id === this.tempSeleccionId()) ?? null;
      this.seleccion.update((actual) => ({ ...actual, [campo]: item }));
    }
    this.campoAbierto.set(null);
  }

  confirmarRegistro(): void {
    if (!this.puedeAceptar()) return;

    const sel = this.seleccion();
    this.correlativo += 1;
    this.registros.update((registros) => [
      ...registros,
      {
        id: `reg-${this.correlativo}`,
        procesos: this.procesosMarcados(),
        categoriaPresupuestaria: this.categoria(),
        estructura: {
          ...(sel.programa && { programa: sel.programa }),
          ...(sel.producto && { producto: sel.producto }),
          ...(sel.proyecto && { proyecto: sel.proyecto }),
          actividad: sel.actividad!,
          funcional: this.funcionalAsignado()!,
        },
      },
    ]);

    this.agregando.set(false);
    this.mostrarAviso('record-done');
  }

  grabar(): void {
    if (this.saveDisabled()) return;
    this.modalGrabar.set(true);
  }

  onConfirmarGrabar(): void {
    this.modalGrabar.set(false);
    if (!this.elaborado()) {
      this.numeroDocumento.set(String(this.numeroSiguiente++).padStart(4, '0'));
      this.elaboradoPor.set(this.currentUser.name);
    }
    this.fechaElaboracion.set(this.fechaYHoraActual());
    this.agregando.set(false);
    this.enEdicion.set(false);
    this.elaborado.set(true);
    this.mostrarAviso('creation-elaborated');
  }

  editar(): void {
    this.elaborado.set(false);
    this.enEdicion.set(true);
  }

  onConfirmarVerificar(): void {
    this.modalVerificar.set(false);
    this.mostrarAviso('creation-verified');
    this.regresar();
  }

  onConfirmarEliminar(): void {
    this.modalEliminar.set(false);
    this.mostrarAviso('creation-deleted');
    this.regresar();
  }

  regresar(): void {
    void this.router.navigate([PROCESS_ROUTE]);
  }

  private fechaYHoraActual(): string {
    const ahora = new Date();
    const dos = (n: number): string => String(n).padStart(2, '0');
    return `${dos(ahora.getDate())}/${dos(ahora.getMonth() + 1)}/${ahora.getFullYear()}   ${dos(ahora.getHours())}:${dos(ahora.getMinutes())}:${dos(ahora.getSeconds())}`;
  }

  private seleccionVacia(): Record<CampoEstructura, ItemEstructura | null> {
    return { programa: null, producto: null, proyecto: null, actividad: null };
  }

  private mostrarAviso(variante: SnackbarVariant): void {
    this.aviso.set(variante);
    this.avisoAbierto.set(true);
  }
}
