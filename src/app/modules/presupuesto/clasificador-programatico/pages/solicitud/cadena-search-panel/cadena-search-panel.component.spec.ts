import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CADENAS_PP } from '../../../models/cadenas-programaticas.mock';
import { CadenaSearchPanelComponent } from './cadena-search-panel.component';

describe('CadenaSearchPanelComponent', () => {
  let fixture: ComponentFixture<CadenaSearchPanelComponent>;
  let panel: CadenaSearchPanelComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CadenaSearchPanelComponent] });
    fixture = TestBed.createComponent(CadenaSearchPanelComponent);
    panel = fixture.componentInstance;
    fixture.componentRef.setInput('cadenas', CADENAS_PP);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  it('pagina de a 25 filas sobre el total de cadenas', () => {
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

  it('empieza de cero cada vez que se abre', () => {
    panel.buscar('0133');
    panel.marcar('cad-4', true);
    panel.abrirDetalle('cad-4');
    fixture.componentRef.setInput('open', false);
    fixture.componentRef.setInput('open', true);
    expect(panel.busqueda()).toBe('');
    expect(panel.marcadas()).toEqual([]);
    expect(panel.detalle()).toBeNull();
  });
});
