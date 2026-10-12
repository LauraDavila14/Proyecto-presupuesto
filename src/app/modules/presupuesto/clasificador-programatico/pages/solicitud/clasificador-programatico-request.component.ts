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
  /** Solo en la búsqueda de actividad de PP: datos del clasificador funcional asociado a la actividad. */
  funcion: string;
  division: string;
  grupo: string;
}

/** Lo que muestra el resumen de registros cuando no hay programa ni producto/proyecto (Figma: captura del resumen). */
const CODIGO_PROGRAMA_VACIO = '0000';
const CODIGO_PRODUCTO_VACIO = '0000000';

const SIN_FILTROS: FiltrosBusqueda = { tipo: '', codigo: '', nombre: '', funcion: '', division: '', grupo: '' };
const FILTROS_PRODUCTO: FiltrosBusqueda = { ...SIN_FILTROS, tipo: 'Producto' };
/** Tipo de actividad de APNOP sin datos funcionales: ni columnas ni filtros de Función, División y Grupo (Figma 1309:104419). */
const TIPO_MAESTRO = 'Actividad (Maestro)';
const FILTROS_ACTIVIDAD_PP: FiltrosBusqueda = { ...SIN_FILTROS, tipo: 'Actividad' };
const FILTROS_INVERSION: FiltrosBusqueda = { ...SIN_FILTROS, tipo: 'Acción inversión' };

/**
 * Cómo se busca la actividad: `predeterminada` (sin proyecto elegido: Tipo fijo y filtros funcionales), `inversion`
 * (con un proyecto elegido: Tipo «Acción inversión» u «Obra» a elección), `apnop` (APNOP sin proyecto: Tipo «Actividad
 * predeterminada» o «Actividad (Maestro)» a elección, Figma 1309:104332) o `ninguno` (las demás búsquedas).
 */
type ModoActividad = 'ninguno' | 'predeterminada' | 'inversion' | 'apnop';

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
      programa: r.estructura.programa?.['codigo'] ?? CODIGO_PROGRAMA_VACIO,
      producto: (r.estructura.producto ?? r.estructura.proyecto)?.['codigo'] ?? CODIGO_PRODUCTO_VACIO,
      actividad: r.estructura.actividad['codigo'],
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
  /**
   * Clasificador funcional asignado: el del Proyecto elegido (apenas se elige, Figma 1274:162180; en AC y APNOP,
   * Figma 1315:114230) o, con un Producto, el de la actividad elegida.
   */
  readonly funcionalAsignado = computed<ItemEstructura | null>(() => {
    const sel = this.seleccion();
    const origen = sel.proyecto ?? (sel.producto?.['tipo'] === 'Proyecto' ? sel.producto : sel.actividad);
    return FUNCIONALES.find((f) => f.id === origen?.['funcionalId']) ?? null;
  });
  readonly campoAbierto = signal<CampoEstructura | null>(null);
  readonly busqueda = signal('');
  readonly tempSeleccionId = signal<string | null>(null);
  readonly hayFilaElegida = computed(() => !!this.tempSeleccionId());

  readonly configCampoAbierto = computed(() => CAMPOS_ESTRUCTURA.find((c) => c.campo === this.campoAbierto()) ?? null);
  /** En la actividad de PP la grilla suma los datos del clasificador funcional asociado (Figma 1274:158317). */
  private readonly columnasFuncionalesActividad = COLUMNAS_FUNCIONAL.map((c) => ({ ...c, widthClass: 'w-[200px]' }));
  /**
   * Las columnas funcionales aparecen en la actividad de PP y en Producto/Proyecto con el Tipo «Proyecto» aplicado
   * (Figma 1274:161392). Los desplegables correspondientes del panel siguen el Tipo marcado en el borrador.
   */
  readonly mostrarFuncionales = computed(
    () => this.actividadPP() || (this.actividadApnop() && this.chipsFiltros().length > 0 && this.filtros().tipo !== TIPO_MAESTRO) || this.campoAbierto() === 'proyecto' || (this.campoAbierto() === 'producto' && this.filtros().tipo === 'Proyecto'),
  );
  readonly filtrosFuncionalesVisibles = computed(
    () => this.actividadPP() || (this.actividadApnop() && this.filtrosBorrador().tipo !== TIPO_MAESTRO) || (this.campoAbierto() === 'producto' && this.filtrosBorrador().tipo === 'Proyecto'),
  );
  readonly columnasBusqueda = computed<{ key: string; label: string; widthClass?: string }[]>(() => {
    const columnas = this.configCampoAbierto()?.columnas ?? [];
    return this.mostrarFuncionales() ? [...columnas, ...this.columnasFuncionalesActividad] : columnas;
  });

  // Filtros de la búsqueda (panel «Filtros» de `siaf-side-panel`). Se editan en un borrador y recién «Aplicar» los pasa
  // a la grilla. Producto/Proyecto (PP): Tipo, Código y Nombre. Actividad (PP, nodo de Figma 1311:108206): abre con el
  // panel visible y el Tipo fijo en «Actividad predeterminada» (solo se puede elegir una actividad); además filtra por
  // Función, División y Grupo del clasificador funcional asociado.
  private readonly opcionesTipoProducto: RadioOption[] = [
    { label: 'Producto predeterminado', value: 'Producto' },
    { label: 'Proyecto', value: 'Proyecto' },
  ];
  private readonly opcionesTipoActividad: RadioOption[] = [{ label: 'Actividad predeterminada', value: 'Actividad' }];
  private readonly opcionesTipoApnop: RadioOption[] = [
    { label: 'Actividad predeterminada', value: 'Actividad' },
    { label: 'Actividad (Maestro)', value: TIPO_MAESTRO },
  ];
  private readonly opcionesTipoInversion: RadioOption[] = [
    { label: 'Acción Inversión', value: 'Acción inversión' },
    { label: 'Obra', value: 'Obra' },
  ];
  readonly modoActividad = signal<ModoActividad>('ninguno');
  readonly actividadPP = computed(() => this.modoActividad() === 'predeterminada');
  readonly actividadInversion = computed(() => this.modoActividad() === 'inversion');
  readonly actividadApnop = computed(() => this.modoActividad() === 'apnop');
  readonly opcionesTipo = computed(() =>
    this.actividadPP()
      ? this.opcionesTipoActividad
      : this.actividadInversion()
        ? this.opcionesTipoInversion
        : this.actividadApnop()
          ? this.opcionesTipoApnop
          : this.opcionesTipoProducto,
  );
  /** En PP el panel dice «Seleccionar tipo» (Figma 1274:163749); en AC y APNOP, «Tipo» (Figma 1315:115224). */
  readonly etiquetaTipo = computed(() => (this.actividadInversion() && this.categoria() === 'PP' ? 'Seleccionar tipo' : 'Tipo'));
  readonly paginacionSuperior = computed(() => this.actividadInversion() || this.actividadApnop() || !!this.configCampoAbierto()?.paginacionSuperior);
  readonly tituloBusqueda = computed(() => {
    if (this.actividadPP()) return 'Seleccionar actividad predeterminada';
    // APNOP: «Seleccionar actividad» al abrir y la versión larga una vez aplicado un filtro (los dos nodos de Figma).
    if (this.actividadApnop()) return this.chipsFiltros().length > 0 ? 'Seleccionar actividad/acción inversión/ obra' : 'Seleccionar actividad';
    if (this.actividadInversion()) return this.categoria() === 'PP' ? 'Seleccionar actividad/acción inversión/ obra' : 'Seleccionar acción inversión/obra';
    return this.configCampoAbierto()?.tituloSeleccion ?? '';
  });
  /** Catálogo de la búsqueda abierta; en actividad, solo los tipos que corresponden al modo. */
  private readonly catalogoBusqueda = computed<ItemEstructura[]>(() => {
    const catalogo = this.configCampoAbierto()?.catalogo ?? [];
    if (this.campoAbierto() !== 'actividad') return catalogo;
    const tipos = this.actividadInversion() ? ['Acción inversión', 'Obra'] : this.actividadApnop() ? ['Actividad', 'Actividad (Maestro)'] : ['Actividad'];
    return catalogo.filter((i) => tipos.includes(i['tipo']));
  });
  readonly filtrosAbiertos = signal(false);
  readonly filtros = signal<FiltrosBusqueda>({ ...SIN_FILTROS });
  readonly filtrosBorrador = signal<FiltrosBusqueda>({ ...FILTROS_PRODUCTO });
  readonly hayFiltrosAvanzados = computed(() => this.actividadPP() || this.actividadInversion() || this.actividadApnop() || !!this.configCampoAbierto()?.filtrosAvanzados);
  readonly navFiltrosVisible = computed(() => this.hayFiltrosAvanzados() && this.filtrosAbiertos());
  /** «Aplicar» se habilita cuando el borrador difiere de lo ya aplicado. */
  readonly borradorCambiado = computed(() => JSON.stringify(this.filtrosBorrador()) !== JSON.stringify(this.filtros()));
  readonly chipsFiltros = computed(() => {
    const f = this.filtros();
    return [
      f.tipo && (this.opcionesTipo().find((o) => o.value === f.tipo)?.label ?? f.tipo),
      f.codigo,
      f.nombre,
      f.funcion,
      f.division,
      f.grupo,
    ].filter(Boolean) as string[];
  });
  /** Los mismos chips con su clave, para quitar uno solo (✕, solo en APNOP). */
  readonly chipsFiltrosItems = computed(() => {
    const f = this.filtros();
    const etiquetaTipo = this.opcionesTipo().find((o) => o.value === f.tipo)?.label ?? f.tipo;
    const items: { clave: keyof FiltrosBusqueda; texto: string }[] = [
      { clave: 'tipo', texto: etiquetaTipo },
      { clave: 'codigo', texto: f.codigo },
      { clave: 'nombre', texto: f.nombre },
      { clave: 'funcion', texto: f.funcion },
      { clave: 'division', texto: f.division },
      { clave: 'grupo', texto: f.grupo },
    ];
    return items.filter((i) => !!i.texto);
  });

  /** «Borrar filtros»: con el Tipo fijo de actividad solo cuenta lo demás, que es lo que se puede quitar. */
  readonly puedeBorrarFiltros = computed(() => {
    const f = this.filtros();
    const extra = f.codigo || f.nombre || f.funcion || f.division || f.grupo;
    // En la actividad de PP el botón se muestra siempre (Figma 1274:158317); solo quita lo extra.
    return this.actividadPP() ? true : !!(f.tipo || extra);
  });
  /** Opciones de los desplegables: las del catálogo, del tipo elegido en el borrador. */
  readonly opcionesCodigo = computed(() => this.valoresDeColumna((i) => i['codigo']));
  readonly opcionesNombre = computed(() => this.valoresDeColumna((i) => i['nombre']));
  readonly opcionesFuncion = computed(() => this.valoresDeColumna((i) => this.datoFuncional(i, 'funcion')));
  readonly opcionesDivision = computed(() => this.valoresDeColumna((i) => this.datoFuncional(i, 'division')));
  readonly opcionesGrupo = computed(() => this.valoresDeColumna((i) => this.datoFuncional(i, 'grupo')));

  // Paginación de la ventana de selección (en memoria).
  readonly pagina = signal(1);
  readonly filasPorPagina = signal(10);
  private readonly filasFiltradas = computed<ItemEstructura[]>(() => {
    const catalogo = this.catalogoBusqueda();
    const f = this.filtros();
    const texto = this.busqueda().trim().toLowerCase();
    const filtrado = catalogo.filter(
      (i) =>
        (!f.tipo || i['tipo'] === f.tipo) &&
        (!f.codigo || i['codigo'] === f.codigo) &&
        (!f.nombre || i['nombre'] === f.nombre) &&
        (!f.funcion || this.datoFuncional(i, 'funcion') === f.funcion) &&
        (!f.division || this.datoFuncional(i, 'division') === f.division) &&
        (!f.grupo || this.datoFuncional(i, 'grupo') === f.grupo),
    );
    if (!texto) return filtrado;
    const claves = this.columnasBusqueda().map((c) => c.key);
    return filtrado.filter((i) => claves.some((clave) => this.textoDeColumna(i, clave).toLowerCase().includes(texto)));
  });
  readonly totalFilas = computed(() => this.filasFiltradas().length);
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalFilas() / this.filasPorPagina())));
  readonly filasBusqueda = computed<ItemEstructura[]>(() => {
    const desde = (this.pagina() - 1) * this.filasPorPagina();
    const pagina = this.filasFiltradas().slice(desde, desde + this.filasPorPagina());
    if (!this.mostrarFuncionales()) return pagina;
    return pagina.map((i) => ({
      ...i,
      funcion: this.datoFuncional(i, 'funcion'),
      division: this.datoFuncional(i, 'division'),
      grupo: this.datoFuncional(i, 'grupo'),
    }));
  });

  // «Vigencia»: solo lectura (Estado «Sí»; las fechas las asigna el sistema al aceptarse la solicitud).
  readonly opcionesEstado: RadioOption[] = [
    { label: 'Sí', value: 'si' },
    { label: 'No', value: 'no' },
  ];

  /**
   * PP pide todos sus campos. AC y APNOP aceptan una actividad predeterminada sola (sin proyecto, Figma 1315:115224 y
   * captura de la solicitud con la actividad elegida) o un proyecto con su acción de inversión u obra.
   */
  readonly puedeAceptar = computed(() => {
    if (!this.mostrarEstructura()) return false;
    const sel = this.seleccion();
    if (this.categoria() === 'PP') return this.camposEstructura().every((c) => !!sel[c.campo]);
    return !!sel.actividad && (!!sel.proyecto || sel.actividad['tipo'].startsWith('Actividad'));
  });

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
    // AC y APNOP: con una actividad predeterminada elegida no hay proyecto (es una u otra vía).
    if (this.categoria() !== 'PP') return campo === 'proyecto' && !!this.seleccion().actividad?.['tipo'].startsWith('Actividad');
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
    // En PP, la actividad se busca distinto según el ítem elegido en Producto/Proyecto.
    const eligioProyecto = this.seleccion().producto?.['tipo'] === 'Proyecto';
    // PP: según el ítem de Producto/Proyecto. AC y APNOP: según haya o no un proyecto elegido (Figma 1315:115224, y la
    // actividad predeterminada si se busca sin proyecto).
    const hayProyecto = this.categoria() === 'PP' ? eligioProyecto : !!this.seleccion().proyecto;
    const modo: ModoActividad =
      campo !== 'actividad' ? 'ninguno' : hayProyecto ? 'inversion' : this.categoria() === 'APNOP' ? 'apnop' : 'predeterminada';
    this.modoActividad.set(modo);
    const configCampo = CAMPOS_ESTRUCTURA.find((c) => c.campo === campo);
    this.filasPorPagina.set(modo === 'predeterminada' || modo === 'inversion' || modo === 'apnop' ? 25 : (configCampo?.filasPorPagina ?? 10));
    // «Predeterminada» abre con el filtro de Tipo ya aplicado; «inversión» solo con el panel visible. Ambas abren con el panel.
    this.filtros.set(modo === 'predeterminada' ? { ...FILTROS_ACTIVIDAD_PP } : { ...SIN_FILTROS });
    this.filtrosBorrador.set(modo === 'predeterminada' ? { ...FILTROS_ACTIVIDAD_PP } : modo === 'inversion' ? { ...FILTROS_INVERSION } : modo === 'apnop' ? { ...FILTROS_ACTIVIDAD_PP } : { ...FILTROS_PRODUCTO });
    this.filtrosAbiertos.set(modo !== 'ninguno');
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
    this.filtrosBorrador.set(this.chipsFiltros().length > 0 ? { ...f } : { ...(this.actividadInversion() ? FILTROS_INVERSION : this.actividadApnop() ? FILTROS_ACTIVIDAD_PP : FILTROS_PRODUCTO) });
    this.filtrosAbiertos.set(true);
  }

  cerrarFiltros(): void {
    this.filtrosAbiertos.set(false);
  }

  cambiarFiltro<K extends keyof FiltrosBusqueda>(campo: K, valor: FiltrosBusqueda[K]): void {
    this.filtrosBorrador.update((f) => ({
      ...f,
      [campo]: valor,
      ...(campo === 'tipo' ? { codigo: '', nombre: '', funcion: '', division: '', grupo: '' } : {}),
    }));
  }

  aplicarFiltros(): void {
    this.filtros.set({ ...this.filtrosBorrador() });
    this.pagina.set(1);
    this.filtrosAbiertos.set(false);
  }

  quitarFiltro(clave: keyof FiltrosBusqueda): void {
    this.filtros.update((f) => ({ ...f, [clave]: '' }));
    this.pagina.set(1);
  }

  borrarFiltros(): void {
    this.filtros.set(this.actividadPP() ? { ...FILTROS_ACTIVIDAD_PP } : { ...SIN_FILTROS });
    this.pagina.set(1);
  }

  /** Texto de una celda: la propiedad del catálogo o, para las columnas funcionales, el dato de su clasificador. */
  private textoDeColumna(item: ItemEstructura, clave: string): string {
    return clave === 'funcion' || clave === 'division' || clave === 'grupo' ? this.datoFuncional(item, clave) : (item[clave] ?? '');
  }

  /** Función, división o grupo del clasificador funcional asociado a una actividad. */
  private datoFuncional(item: ItemEstructura, clave: 'funcion' | 'division' | 'grupo'): string {
    return FUNCIONALES.find((f) => f.id === item['funcionalId'])?.[clave] ?? '';
  }

  private valoresDeColumna(valor: (item: ItemEstructura) => string): { label: string; value: string }[] {
    const tipo = this.filtrosBorrador().tipo;
    const catalogo = this.catalogoBusqueda();
    const valores = catalogo.filter((i) => !tipo || i['tipo'] === tipo).map(valor).filter(Boolean);
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
