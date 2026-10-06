/**
 * Árbol maestro de procesos + utilidad de búsqueda de ruta.
 * Vive en shared/utils/ (no en layout/) porque lo consumen tanto piezas
 * del shell (layout/process-menu-tree, layout/create-document) como
 * utilidades transversales de shared (breadcrumbs.util) — shared no debe
 * depender de layout, así que la fuente de verdad va acá.
 */
export interface ProcessMenuNode {
  id: string;
  label: string;
  selected?: boolean;
  // Rama abierta desde el arranque (a cualquier nivel): el nodo aparece expandido sin que el usuario haga clic.
  expanded?: boolean;
  // Ruta de la página principal del módulo (documentos y registros)
  moduleRoute?: string;
  // Si un nodo tiene estas propiedades, Crear documento puede completar documento/tipo y navegar.
  createRoute?: string;
  documentOptions?: string[];
  documentCreateOptions?: Array<{
    label: string;
    route?: string;
    actionTypes?: string[];
  }>;
  actionTypeOptions?: string[];
  /**
   * Marca un nodo como módulo planificado pero aún no implementado.
   * El menú lo renderiza con texto atenuado y badge "Próximamente",
   * y el click no navega (solo expande si tiene hijos).
   */
  comingSoon?: boolean;
  children?: ProcessMenuNode[];
}

/**
 * Árbol de procesos del taller. La mayoría de las hojas son ejemplos de cómo se ve un proceso
 * planificado («Próximamente»). Para sumar un proceso: una hoja con `moduleRoute` (Documentos y
 * registros) y otra para sus consultas, y sus rutas en `app.routes.ts`.
 *
 * Nota: «Gestión de tesorería» (Registro de cuentas bancarias) se sacó de este árbol a pedido, pero
 * su código y sus rutas en `modules/tesoreria/cuentas-bancarias/` siguen intactos — solo dejó de
 * aparecer en el menú «Procesos». Sus migas de pan usan `findProcessPathById('registro-cuentas-bancarias-documentos'
 * | 'registro-cuentas-bancarias-consultas')`, que ahora no encuentra esos ids: si se vuelve a acceder a esas
 * pantallas (por URL directa), la miga de pan del proceso queda vacía.
 */
export const DEFAULT_PROCESS_TREE: ProcessMenuNode[] = [
  // Rama del árbol de "Procesos presupuesto" según el nodo de Figma "Sidenav with tree view"
  // (CEL-001-CL08-Clasificador Programático, node-id 696:16061). Solo la hoja "Documentos y registros
  // del clasificador programático" tiene pantalla (nodo 406:10759): una vista de ejemplo fija, sin
  // modelo ni backend simulado detrás (ver clasificador-programatico-documents.config.ts). El resto de
  // las hojas van como «Próximamente».
  {
    id: 'procesos-presupuesto',
    label: 'Procesos presupuesto',
    expanded: true,
    comingSoon: true,
    children: [
      {
        id: 'clasificadores-catalogos',
        label: 'Clasificadores y catálogos',
        expanded: true,
        comingSoon: true,
        children: [
          {
            id: 'clasificadores',
            label: 'Clasificadores',
            expanded: true,
            comingSoon: true,
            children: [
              {
                id: 'clasificador-programatico',
                label: 'Clasificador programático',
                expanded: true,
                comingSoon: true,
                children: [
                  {
                    id: 'clasificador-programatico-documentos',
                    label: 'Documentos y registros del clasificador programático',
                    selected: true,
                    moduleRoute: '/procesos/clasificador-programatico',
                    createRoute: '/procesos/clasificador-programatico/solicitud',
                    documentOptions: ['Solicitud de clasificador programático UE', 'Solicitud de clasificador programático UE - Con plazos'],
                    documentCreateOptions: [
                      {
                        label: 'Solicitud de clasificador programático UE',
                        route: '/procesos/clasificador-programatico/solicitud',
                        actionTypes: ['Creación', 'Modificación', 'Anulación'],
                      },
                      {
                        label: 'Solicitud de clasificador programático UE - Con plazos',
                        route: '/procesos/clasificador-programatico/solicitud',
                        actionTypes: ['Creación', 'Modificación', 'Anulación'],
                      },
                    ],
                    actionTypeOptions: ['Creación', 'Modificación', 'Anulación'],
                  },
                  { id: 'clasificador-programatico-consultas', label: 'Consultas y reportes del clasificador programático', comingSoon: true },
                ],
              },
            ],
          },
          { id: 'catalogos', label: 'Catálogos', comingSoon: true },
        ],
      },
      { id: 'consultas-reportes', label: 'Consultas y reportes', comingSoon: true },
    ],
  },
];

export function findProcessPathById(id: string, nodes: readonly ProcessMenuNode[] = DEFAULT_PROCESS_TREE): ProcessMenuNode[] {
  for (const node of nodes) {
    if (node.id === id) {
      return [node];
    }

    const childPath = findProcessPathById(id, node.children || []);

    if (childPath.length > 0) {
      return [node, ...childPath];
    }
  }

  return [];
}

/**
 * Árbol del menú "Ajustes" (módulo de administración). Lo pinta el mismo `siaf-process-menu-tree`
 * que el menú de procesos, con otros textos. En el taller no hay módulo de administración: las hojas
 * van como «Próximamente» y no navegan.
 */
export const ADMIN_MENU_TREE: ProcessMenuNode[] = [
  {
    id: 'administracion',
    label: 'Administración',
    expanded: true,
    children: [
      {
        id: 'usuarios-accesos',
        label: 'Usuarios y accesos',
        expanded: true,
        children: [
          { id: 'gestion-usuarios', label: 'Gestión de usuarios', comingSoon: true },
          { id: 'perfiles-funcionales', label: 'Perfiles funcionales', comingSoon: true },
        ],
      },
      {
        id: 'organizacion',
        label: 'Organización',
        children: [
          { id: 'entidades', label: 'Entidades', comingSoon: true },
          { id: 'unidades', label: 'Unidades orgánicas', comingSoon: true },
        ],
      },
    ],
  },
];
