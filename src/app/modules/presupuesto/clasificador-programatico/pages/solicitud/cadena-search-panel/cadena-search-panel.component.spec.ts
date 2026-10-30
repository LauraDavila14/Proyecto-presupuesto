import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CADENAS_AC, CADENAS_AC_INVERSION, CADENAS_PP, CADENAS_TODAS } from '../../../models/cadenas-programaticas.mock';
import { CadenaSearchPanelComponent } from './cadena-search-panel.component';

describe('CadenaSearchPanelComponent', () => {
  let fixture: ComponentFixture<CadenaSearchPanelComponent>;
  let panel: CadenaSearchPanelComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CadenaSearchPanelComponent] });
    fixture = TestBed.createComponent(CadenaSearchPanelComponent);
    panel = fixture.componentInstance;
    fixture.componentRef.setInput('cadenas', CADENAS_TODAS);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  it('abre con las cadenas de producto predeterminado, de a 25 filas', () => {
    expect(panel.totalFilas()).toBe(CADENAS_PP.length);
    expect(panel.filasPagina().length).toBe(25);
    panel.cambiarPagina(1);
    expect(panel.pagina()).toBe(2);
    panel.cambiarFilasPorPagina(100);
    expect(panel.pagina()).toBe(1);
    expect(panel.filasPagina().length).toBe(CADENAS_PP.length);
  });

  it('busca por código o nombre y vuelve a la primera página', () => {
    panel.cambiarPagina(1);
    panel.buscar('asistencia legal');
    expect(panel.pagina()).toBe(1);
    expect(panel.totalFilas()).toBe(1);
    panel.buscar('0133');
    expect(panel.totalFilas()).toBe(3);
  });

  it('permite marcar varias cadenas y emite solo las marcadas al aceptar', () => {
    const emitidas: string[][] = [];
    panel.confirmed.subscribe((cadenas) => emitidas.push(cadenas.map((c) => c.id)));
    panel.marcar('cad-1', true);
    panel.marcar('cad-3', true);
    panel.marcar('cad-1', false);
    panel.aceptar();
    expect(emitidas).toEqual([['cad-3']]);
  });

  it('muestra el detalle con código y nombre de cada nivel y se cierra con la flecha', () => {
    panel.abrirDetalle('cad-1');
    const campos = panel.camposDetalle(panel.detalle()!);
    expect(campos[0]).toEqual({ etiqueta: 'Categoría presupuestaria', valor: 'PP - Programas presupuestales' });
    expect(campos.find((c) => c.etiqueta === 'Función')?.valor).toBe('02 Relaciones exteriores');
    panel.cerrarDetalle();
    expect(panel.detalle()).toBeNull();
  });

  it('en una cadena de inversión el detalle usa Inversión y AI / Obra', () => {
    panel.abrirDetalle('inv-1');
    const etiquetas = panel.camposDetalle(panel.detalle()!).map((c) => c.etiqueta);
    expect(etiquetas).toContain('Inversión');
    expect(etiquetas).toContain('AI / Obra');
    expect(etiquetas).not.toContain('Producto');
  });

  describe('filtros', () => {
    it('ofrece los desplegables del tipo con «código + nombre» en Programa', () => {
      panel.abrirFiltros();
      expect(panel.camposBorrador().map((c) => c.etiqueta)).toEqual([
        'Programa', 'Producto', 'Actividad', 'Nombre de actividad', 'Función', 'División funcional', 'Grupo funcional',
      ]);
      expect(panel.opcionesPorCampo()['programa'].map((o) => o.label)).toContain('0062 Optimización de la política de protección y atención a las comunidades peruanas en el exterior');
      expect(panel.opcionesPorCampo()['actividad'][0].label).toMatch(/^\d{7}$/);
    });

    it('Aplicar filtra la tabla; Cancelar descarta el borrador', () => {
      panel.abrirFiltros();
      panel.cambiarValor('funcion', '02 Relaciones exteriores');
      panel.cerrarFiltros();
      expect(panel.totalFilas()).toBe(CADENAS_PP.length);

      panel.abrirFiltros();
      panel.cambiarValor('funcion', '02 Relaciones exteriores');
      panel.aplicarFiltros();
      expect(panel.filtrosAbiertos()).toBe(false);
      expect(panel.totalFilas()).toBe(6);
    });

    it('con Inversión cambia las filas y los desplegables, y reinicia lo elegido', () => {
      panel.abrirFiltros();
      panel.cambiarValor('funcion', '02 Relaciones exteriores');
      panel.cambiarTipo('inversion');
      expect(panel.borrador().valores).toEqual({});
      expect(panel.camposBorrador().map((c) => c.etiqueta)).toEqual([
        'Programa', 'Inversión', 'AI / OBR', 'Nombre de AI / OBR', 'Función', 'División funcional', 'Grupo funcional',
      ]);
      panel.aplicarFiltros();
      expect(panel.filasPagina().every((c) => c.tipo === 'inversion')).toBe(true);
      expect(panel.filasPagina()[0].actividad.codigo).toBe('0000420');
    });

    it('tras Aplicar muestra las etiquetas de los filtros y «Borrar filtros» los quita', () => {
      expect(panel.filtrosVisibles()).toBe(false);
      panel.abrirFiltros();
      panel.cambiarTipo('inversion');
      panel.cambiarValor('actividad', '0000011');
      panel.aplicarFiltros();
      expect(panel.filtrosVisibles()).toBe(true);
      expect(panel.chips()).toEqual(['Inversión', '0000011']);

      panel.buscar('gestión');
      panel.marcar('inv-5', true);
      panel.borrarFiltros();
      expect(panel.filtrosVisibles()).toBe(false);
      expect(panel.aplicados().tipo).toBe('producto');
      expect(panel.totalFilas()).toBeGreaterThan(0);
      expect(panel.busqueda()).toBe('gestión');
      expect(panel.marcadas()).toEqual(['inv-5']);
    });

    it('abrir los filtros cierra el detalle y viceversa', () => {
      panel.abrirDetalle('cad-1');
      panel.abrirFiltros();
      expect(panel.detalle()).toBeNull();
      expect(panel.filtrosAbiertos()).toBe(true);
      panel.abrirDetalle('cad-2');
      expect(panel.filtrosAbiertos()).toBe(false);
    });
  });

  it('abre con las cadenas ya elegidas marcadas', () => {
    fixture.componentRef.setInput('open', false);
    fixture.componentRef.setInput('seleccionadas', ['cad-2', 'cad-5']);
    fixture.componentRef.setInput('open', true);
    expect(panel.marcadas()).toEqual(['cad-2', 'cad-5']);
  });

  describe('con AC', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('open', false);
      fixture.componentRef.setInput('categoria', 'AC');
      fixture.componentRef.setInput('open', true);
    });

    it('ofrece solo las cadenas de actividad de AC, sin la columna Programa', () => {
      expect(panel.totalFilas()).toBe(CADENAS_AC.length);
      expect(panel.filasPagina().every((c) => c.categoria === 'AC' && c.tipo === 'actividad')).toBe(true);
      expect(panel.columnas().map((c) => c.etiqueta)).toEqual(['Categ. pres.', 'Inversión', 'Act / AI / Obr']);
      expect(panel.columnas()[1].valor(panel.filasPagina()[0])).toBe('-');
    });

    it('el detalle de una actividad no lleva Programa ni Producto', () => {
      panel.abrirDetalle('ac-1');
      expect(panel.camposDetalle(panel.detalle()!).map((c) => c.etiqueta)).toEqual([
        'Categoría presupuestaria', 'Actividad', 'Función', 'División funcional', 'Grupo funcional',
      ]);
      expect(panel.camposDetalle(panel.detalle()!)[0].valor).toBe('AC - Acciones centrales');
    });

    it('los filtros ofrecen «Actividad predeterminada» e «Inversión» con sus desplegables', () => {
      panel.abrirFiltros();
      expect(panel.opcionesTipo().map((o) => o.label)).toEqual(['Actividad predeterminada', 'Inversión']);
      expect(panel.camposBorrador().map((c) => c.etiqueta)).toEqual(['Actividad', 'Nombre de actividad', 'Función', 'División funcional', 'Grupo funcional']);
      panel.cambiarTipo('inversion');
      expect(panel.camposBorrador().map((c) => c.etiqueta)).toEqual(['Inversión', 'AI / OBR', 'Nombre de AI / OBR', 'Función', 'División funcional', 'Grupo funcional']);
    });

    it('con Inversión cambia a las cadenas de inversión de AC, con la columna AI / OBR', () => {
      panel.abrirFiltros();
      panel.cambiarTipo('inversion');
      panel.aplicarFiltros();
      expect(panel.totalFilas()).toBe(CADENAS_AC_INVERSION.length);
      expect(panel.columnas().map((c) => c.etiqueta)).toEqual(['Categ. pres.', 'Inversión', 'AI / OBR']);
      expect(panel.filasPagina()[0].producto?.codigo).toBe('2355382');
      expect(panel.chips()).toEqual(['Inversión']);
    });
  });

  it('empieza de cero cada vez que se abre', () => {
    panel.buscar('0133');
    panel.marcar('cad-4', true);
    panel.abrirFiltros();
    panel.cambiarTipo('inversion');
    panel.aplicarFiltros();
    fixture.componentRef.setInput('open', false);
    fixture.componentRef.setInput('open', true);
    expect(panel.busqueda()).toBe('');
    expect(panel.marcadas()).toEqual([]);
    expect(panel.aplicados().tipo).toBe('producto');
    expect(panel.totalFilas()).toBe(CADENAS_PP.length);
  });
});
