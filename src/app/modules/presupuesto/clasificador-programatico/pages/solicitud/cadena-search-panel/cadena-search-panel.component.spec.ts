import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CADENAS_AC, CADENAS_AC_INVERSION, CADENAS_APNOP, CADENAS_APNOP_INVERSION, CADENAS_PP, CADENAS_TODAS } from '../../../models/cadenas-programaticas.mock';
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

  it('muestra «Tipo de cadena» y «Detalle de cadena de…» en el cuerpo, y el tipo cambia la tabla sin filtros ni búsqueda', () => {
    fixture.detectChanges();
    const html = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(html).toContain('Tipo de cadena');
    expect(html).toContain('Detalle de cadena de producto predeterminado');
    expect(panel.opcionesTipo().map((o) => o.label)).toEqual(['Producto predeterminado', 'Proyecto']);
    expect(panel.columnas().map((c) => c.etiqueta)).toEqual(['Categ. pres.', 'Programa', 'Producto', 'Actividad']);

    panel.buscar('gestión');
    panel.cambiarTipo('inversion');
    fixture.detectChanges();
    expect(panel.busqueda()).toBe('');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Detalle de cadena de proyecto');
  });

  it('con Proyecto las columnas son «Proyecto» y «Acción inversión / Obra», con las primeras filas del diseño', () => {
    panel.cambiarTipo('inversion');
    expect(panel.columnas().map((c) => c.etiqueta)).toEqual(['Categ. pres.', 'Programa', 'Proyecto', 'Acción inversión / Obra']);
    const [fila] = panel.filasPagina();
    expect(panel.columnas().map((c) => c.valor(fila))).toEqual([
      'PP',
      '0133',
      '2732524',
      '0000420 Adquisición de inmueble para el servicio de acción consular y representación diplomática',
    ]);
  });

  describe('filtros', () => {
    it('Aplicar solo se activa cuando hay cambios respecto a lo aplicado', () => {
      panel.abrirFiltros();
      expect(panel.borradorCambiado()).toBe(false);

      panel.cambiarValor('programa', ['0062']);
      expect(panel.borradorCambiado()).toBe(true);

      panel.cambiarValor('programa', []);
      expect(panel.borradorCambiado()).toBe(false);
    });

    it('el ícono de filtros se marca mientras el panel «Filtros» está abierto', () => {
      const boton = () => (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button[aria-label="Filtrar"]');
      fixture.detectChanges();
      expect(boton()?.getAttribute('aria-pressed')).toBeNull();

      panel.abrirFiltros();
      fixture.detectChanges();
      expect(boton()?.getAttribute('aria-pressed')).toBe('true');

      panel.cerrarFiltros();
      fixture.detectChanges();
      expect(boton()?.getAttribute('aria-pressed')).toBeNull();
    });

    it('ofrece los desplegables del tipo con «código + nombre» en Programa', () => {
      panel.abrirFiltros();
      expect(panel.camposBorrador().map((c) => c.etiqueta)).toEqual([
        'Programa', 'Producto', 'Actividad', 'Función', 'División funcional', 'Grupo funcional',
      ]);
      expect(panel.opcionesPorCampo()['programa'].map((o) => o.label)).toContain('0062 Optimización de la política de protección y atención a las comunidades peruanas en el exterior');
      expect(panel.opcionesPorCampo()['actividad'][0].label).toMatch(/^\d{7} \S/);
    });

    it('Aplicar filtra la tabla; Cancelar descarta el borrador', () => {
      panel.abrirFiltros();
      panel.cambiarValor('funcion', ['02 Relaciones exteriores']);
      panel.cerrarFiltros();
      expect(panel.totalFilas()).toBe(CADENAS_PP.length);

      panel.abrirFiltros();
      panel.cambiarValor('funcion', ['02 Relaciones exteriores']);
      panel.aplicarFiltros();
      expect(panel.filtrosAbiertos()).toBe(false);
      expect(panel.totalFilas()).toBe(6);
    });

    it('con Proyecto cambia las filas al instante, y cambia los desplegables y reinicia lo elegido', () => {
      panel.abrirFiltros();
      panel.cambiarValor('funcion', ['02 Relaciones exteriores']);
      panel.cambiarTipo('inversion');
      expect(panel.aplicados().tipo).toBe('inversion');
      expect(panel.borrador().valores).toEqual({});
      expect(panel.camposBorrador().map((c) => c.etiqueta)).toEqual([
        'Programa', 'Proyecto', 'Acción inversión / Obra', 'Función', 'División funcional', 'Grupo funcional',
      ]);
      expect(panel.filasPagina().every((c) => c.tipo === 'inversion')).toBe(true);
      expect(panel.filasPagina()[0].actividad.codigo).toBe('0000420');
      expect(panel.opcionesPorCampo()['actividad'][0].label).toMatch(/^\d{7} \S/);
    });

    it('los desplegables son de selección múltiple: filtra por cualquiera de los valores y cada uno es un chip', () => {
      panel.abrirFiltros();
      panel.cambiarValor('producto', [CADENAS_PP[0], CADENAS_PP[3]].map((c) => `${c.producto!.codigo} ${c.producto!.nombre}`));
      panel.aplicarFiltros();
      expect(panel.filasPagina().every((c) => ['3000144', '3000710'].includes(c.producto!.codigo))).toBe(true);
      expect(panel.chips().length).toBe(2);
    });

    it('tras Aplicar muestra las etiquetas de los filtros y «Borrar filtros» los quita', () => {
      expect(panel.filtrosVisibles()).toBe(false);
      panel.cambiarTipo('inversion');
      panel.abrirFiltros();
      panel.cambiarValor('actividad', ['0000011']);
      panel.aplicarFiltros();
      expect(panel.filtrosVisibles()).toBe(true);
      expect(panel.chips()).toEqual(['0000011']);

      panel.buscar('gestión');
      panel.marcar('inv-5', true);
      panel.borrarFiltros();
      expect(panel.filtrosVisibles()).toBe(false);
      expect(panel.aplicados().tipo).toBe('inversion');
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

  it('abre sin ninguna fila marcada, aunque ya haya cadenas elegidas', () => {
    panel.marcar('cad-2', true);
    panel.marcar('cad-5', true);
    fixture.componentRef.setInput('open', false);
    fixture.componentRef.setInput('open', true);
    expect(panel.marcadas()).toEqual([]);
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
      expect(panel.columnas().map((c) => c.etiqueta)).toEqual(['Categ. pres.', 'Actividad']);
      expect(panel.columnas()[1].valor(panel.filasPagina()[0])).toBe('5000001 Planeamiento y presupuesto');
    });

    it('el detalle de una actividad no lleva Programa ni Producto', () => {
      panel.abrirDetalle('ac-1');
      expect(panel.camposDetalle(panel.detalle()!).map((c) => c.etiqueta)).toEqual([
        'Categoría presupuestaria', 'Actividad', 'Función', 'División funcional', 'Grupo funcional',
      ]);
      expect(panel.camposDetalle(panel.detalle()!)[0].valor).toBe('AC - Acciones centrales');
    });

    it('el tipo ofrece «Actividad predeterminada» y «Proyecto», y los filtros sus desplegables', () => {
      panel.abrirFiltros();
      expect(panel.opcionesTipo().map((o) => o.label)).toEqual(['Actividad predeterminada', 'Proyecto']);
      expect(panel.detalleTipo()).toBe('actividad predeterminada');
      expect(panel.camposBorrador().map((c) => c.etiqueta)).toEqual(['Actividad', 'Función', 'División funcional', 'Grupo funcional']);
      panel.cambiarTipo('inversion');
      expect(panel.camposBorrador().map((c) => c.etiqueta)).toEqual(['Inversión', 'AI / OBR', 'Función', 'División funcional', 'Grupo funcional']);
    });

    it('con Proyecto cambia a las cadenas de inversión de AC, con la columna AI / OBR y sin chips', () => {
      panel.cambiarTipo('inversion');
      expect(panel.totalFilas()).toBe(CADENAS_AC_INVERSION.length);
      expect(panel.detalleTipo()).toBe('proyecto');
      expect(panel.columnas().map((c) => c.etiqueta)).toEqual(['Categ. pres.', 'Proyecto', 'Acción inversión / Obra']);
      expect(panel.columnas().map((c) => c.valor(panel.filasPagina()[0]))).toEqual([
        'AC',
        '2355382',
        '0000420 Adquisición de inmueble para el servicio de habitabilidad institucional',
      ]);
      expect(panel.filasPagina()[0].producto?.codigo).toBe('2355382');
      expect(panel.chips()).toEqual([]);
      expect(panel.filtrosVisibles()).toBe(false);
    });
  });

  describe('con APNOP', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('open', false);
      fixture.componentRef.setInput('categoria', 'APNOP');
      fixture.componentRef.setInput('open', true);
    });

    it('usa las columnas, los tipos y el detalle de AC con sus propias cadenas', () => {
      expect(panel.totalFilas()).toBe(CADENAS_APNOP.length);
      expect(panel.filasPagina()[0].actividad.codigo).toBe('5000643');
      expect(panel.columnas().map((c) => c.etiqueta)).toEqual(['Categ. pres.', 'Actividad']);
      expect(panel.opcionesTipo().map((o) => o.label)).toEqual(['Actividad predeterminada', 'Proyecto']);
      panel.abrirDetalle('apn-1');
      expect(panel.camposDetalle(panel.detalle()!)[0].valor).toBe('APNOP - Asignaciones presupuestarias que no resultan en productos');
    });

    it('las primeras filas son las del diseño, con su clasificador funcional', () => {
      const filas = panel.filasPagina().slice(0, 6).map((c) => [c.actividad.codigo, c.funcion.codigo, c.division.codigo, c.grupo.codigo].join(' '));
      expect(filas).toEqual([
        '5000643 02 002 0002',
        '5000670 22 048 0110',
        '5000991 24 052 0116',
        '5001008 02 002 0002',
        '5001123 02 002 0002',
        '5003630 02 002 0002',
      ]);
      expect(panel.filasPagina()[1].actividad.nombre).toBe('Desarrollo de la enseñanza de post-grado');
      expect(panel.filasPagina()[5].actividad.nombre).toContain('ámbito regional');
      expect(panel.filasPagina()[6].actividad.codigo).toBe('5006412');
    });

    it('con Proyecto usa las columnas «Proyecto» y «Acción inversión / Obra», como AC', () => {
      panel.cambiarTipo('inversion');
      expect(panel.columnas().map((c) => c.etiqueta)).toEqual(['Categ. pres.', 'Proyecto', 'Acción inversión / Obra']);
    });

    it('con Inversión muestra las cadenas de inversión de APNOP', () => {
      panel.abrirFiltros();
      panel.cambiarTipo('inversion');
      panel.aplicarFiltros();
      expect(panel.totalFilas()).toBe(CADENAS_APNOP_INVERSION.length);
      expect(panel.filasPagina()[0].producto?.codigo).toBe('2355896');
      expect(panel.filasPagina().slice(0, 7).map((c) => c.actividad.codigo)).toEqual(['0000158', '0001427', '0001875', '0000192', '0000898', '0009728', '0003531']);
      expect(panel.filasPagina().slice(0, 7).every((c) => c.producto?.codigo === '2355896')).toBe(true);
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
