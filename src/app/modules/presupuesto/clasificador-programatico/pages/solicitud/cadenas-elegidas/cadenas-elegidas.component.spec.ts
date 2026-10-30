import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CADENAS_PP } from '../../../models/cadenas-programaticas.mock';
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

  it('al cambiar la lista quita las marcas de las cadenas que ya no están', () => {
    tabla.marcar('cad-1', true);
    tabla.marcar('cad-3', true);
    fixture.componentRef.setInput('cadenas', CADENAS_PP.slice(2, 4));
    expect(tabla.marcadas()).toEqual(['cad-3']);
  });
});
