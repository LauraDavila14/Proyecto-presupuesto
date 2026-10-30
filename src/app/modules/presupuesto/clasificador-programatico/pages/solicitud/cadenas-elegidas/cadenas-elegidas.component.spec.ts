import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CADENAS_AC, CADENAS_PP } from '../../../models/cadenas-programaticas.mock';
import { CadenasElegidasComponent } from './cadenas-elegidas.component';

describe('CadenasElegidasComponent', () => {
  let fixture: ComponentFixture<CadenasElegidasComponent>;
  let tabla: CadenasElegidasComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CadenasElegidasComponent] });
    fixture = TestBed.createComponent(CadenasElegidasComponent);
    tabla = fixture.componentInstance;
    fixture.componentRef.setInput('cadenas', CADENAS_PP.slice(0, 3));
    fixture.detectChanges();
  });

  it('muestra las cadenas elegidas sin la columna de categoría', () => {
    expect(tabla.totalFilas()).toBe(3);
    const cabecera = (fixture.nativeElement as HTMLElement).querySelector('thead')!.textContent!;
    expect(cabecera).toContain('Programa');
    expect(cabecera).not.toContain('Categ');
  });

  it('las cadenas de AC no llevan la columna Programa', () => {
    fixture.componentRef.setInput('cadenas', CADENAS_AC.slice(0, 2));
    fixture.detectChanges();
    const cabecera = (fixture.nativeElement as HTMLElement).querySelector('thead')!.textContent!;
    expect(cabecera).not.toContain('Programa');
    expect(cabecera).toContain('Pro / Inv');
  });

  it('busca entre las elegidas por código o nombre', () => {
    tabla.buscar('asistencia legal');
    expect(tabla.totalFilas()).toBe(1);
    tabla.buscar('0062');
    expect(tabla.totalFilas()).toBe(3);
  });

  it('pagina de a 10 filas y permite cambiarlo', () => {
    fixture.componentRef.setInput('cadenas', CADENAS_PP.slice(0, 25));
    expect(tabla.filasPagina().length).toBe(10);
    tabla.cambiarPagina(1);
    expect(tabla.pagina()).toBe(2);
    tabla.cambiarFilasPorPagina(25);
    expect(tabla.pagina()).toBe(1);
    expect(tabla.filasPagina().length).toBe(25);
  });

  it('marcar emite la lista de marcadas con la fila agregada o quitada', () => {
    const emitidas: string[][] = [];
    tabla.marcadasChange.subscribe((ids) => emitidas.push(ids));
    fixture.componentRef.setInput('marcadas', ['cad-1']);
    tabla.marcar('cad-2', true);
    tabla.marcar('cad-1', false);
    expect(emitidas).toEqual([['cad-1', 'cad-2'], []]);
  });

  it('«seleccionar todo» marca o desmarca solo las filas de la página visible', () => {
    fixture.componentRef.setInput('cadenas', CADENAS_PP.slice(0, 25));
    fixture.componentRef.setInput('marcadas', ['cad-20']);
    const emitidas: string[][] = [];
    tabla.marcadasChange.subscribe((ids) => emitidas.push(ids));
    tabla.marcarPagina(true);
    expect(emitidas[0]).toContain('cad-20');
    expect(emitidas[0].length).toBe(11);
    fixture.componentRef.setInput('marcadas', emitidas[0]);
    tabla.marcarPagina(false);
    expect(emitidas[1]).toEqual(['cad-20']);
  });

  it('la barra con Borrar solo aparece con filas marcadas y Borrar avisa', () => {
    const barra = () => (fixture.nativeElement as HTMLElement).querySelector('siaf-table-controls input[type=checkbox]');
    expect(barra()).toBeNull();
    fixture.componentRef.setInput('marcadas', ['cad-1']);
    fixture.detectChanges();
    expect(barra()).not.toBeNull();
    let avisos = 0;
    tabla.borrar.subscribe(() => avisos++);
    ((fixture.nativeElement as HTMLElement).querySelector('siaf-table-controls button[aria-label="Borrar"]') as HTMLButtonElement).click();
    expect(avisos).toBe(1);
  });

  it('si la página en que estaba ya no existe, pasa a la última', () => {
    fixture.componentRef.setInput('cadenas', CADENAS_PP.slice(0, 25));
    tabla.cambiarPagina(2);
    expect(tabla.pagina()).toBe(3);
    fixture.componentRef.setInput('cadenas', CADENAS_PP.slice(0, 12));
    expect(tabla.pagina()).toBe(2);
  });
});
