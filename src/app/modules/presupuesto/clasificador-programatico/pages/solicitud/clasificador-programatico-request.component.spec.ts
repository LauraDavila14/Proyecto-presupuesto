import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CADENAS_PP } from '../../models/cadenas-programaticas.mock';
import { ClasificadorProgramaticoRequestComponent } from './clasificador-programatico-request.component';

describe('ClasificadorProgramaticoRequestComponent · registro con PP', () => {
  let fixture: ComponentFixture<ClasificadorProgramaticoRequestComponent>;
  let pagina: ClasificadorProgramaticoRequestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClasificadorProgramaticoRequestComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(ClasificadorProgramaticoRequestComponent);
    pagina = fixture.componentInstance;
    fixture.detectChanges();

    pagina.abrirPanel();
    pagina.marcarProceso('P', true);
    pagina.cambiarCategoria('PP');
  });

  it('Aceptar solo se activa con cadenas elegidas y sin filas marcadas en su tabla', () => {
    expect(pagina.puedeAceptar()).toBe(false);
    pagina.elegirCadenas(CADENAS_PP.slice(0, 2));
    expect(pagina.puedeAceptar()).toBe(true);
    pagina.cadenasMarcadas.set([CADENAS_PP[0].id]);
    expect(pagina.puedeAceptar()).toBe(false);
  });

  it('Aceptar agrega una fila por cadena, con códigos y finalidad «-»', () => {
    pagina.elegirCadenas(CADENAS_PP.slice(0, 2));
    pagina.confirmarRegistro();

    expect(pagina.agregando()).toBe(false);
    expect(pagina.filasTabla().map(({ id, ...fila }) => fila)).toEqual([
      { categoria: 'PP', programa: '0062', producto: '3000144', actividad: '5004339', finalidad: '-', funcion: '02', division: '002', grupo: '0002', estado: 'Si', fechaDesde: '-' },
      { categoria: 'PP', programa: '0062', producto: '3000260', actividad: '5002719', finalidad: '-', funcion: '02', division: '002', grupo: '0002', estado: 'Si', fechaDesde: '-' },
    ]);
    expect(pagina.cadenasElegidas()).toEqual([]);
    expect(pagina.saveDisabled()).toBe(false);
  });

  it('abre el detalle de un registro y la flecha vuelve a la solicitud con los registros intactos', () => {
    pagina.elegirCadenas(CADENAS_PP.slice(0, 2));
    pagina.confirmarRegistro();
    const id = pagina.filasTabla()[1].id;

    pagina.abrirDetalleRegistro(id);
    expect(pagina.registroDetalle()?.cadenaId).toBe(CADENAS_PP[1].id);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('siaf-registro-detalle')).not.toBeNull();

    pagina.cerrarDetalleRegistro();
    fixture.detectChanges();
    expect(pagina.registroDetalle()).toBeNull();
    expect(pagina.filasTabla().length).toBe(2);
  });

  describe('borrar registros', () => {
    beforeEach(() => {
      pagina.elegirCadenas(CADENAS_PP.slice(0, 3));
      pagina.confirmarRegistro();
    });

    it('quita los registros marcados y limpia las marcas', () => {
      const [primero, , tercero] = pagina.filasTabla();
      pagina.marcarFila(primero.id, true);
      pagina.marcarFila(tercero.id, true);
      pagina.borrarRegistrosMarcados();

      expect(pagina.filasTabla().map((f) => f.actividad)).toEqual(['5002719']);
      expect(pagina.filasMarcadas()).toEqual([]);
      expect(pagina.saveDisabled()).toBe(false);
    });

    it('al borrar todos desactiva Grabar y vacía el buscador', () => {
      pagina.buscarRegistros('0062');
      pagina.marcarTodas(true);
      pagina.borrarRegistrosMarcados();

      expect(pagina.filasTabla()).toEqual([]);
      expect(pagina.saveDisabled()).toBe(true);
      expect(pagina.busquedaRegistros()).toBe('');
    });

    it('la cadena de un registro borrado se puede volver a agregar', () => {
      pagina.marcarFila(pagina.filasTabla()[0].id, true);
      pagina.borrarRegistrosMarcados();

      pagina.abrirPanel();
      pagina.marcarProceso('P', true);
      pagina.cambiarCategoria('PP');
      pagina.elegirCadenas([CADENAS_PP[0]]);
      pagina.confirmarRegistro();

      expect(pagina.filasTabla().map((f) => f.actividad)).toEqual(['5002719', '5006182', '5004339']);
    });

    it('la papelera no aparece con la solicitud Elaborada', () => {
      const papelera = () => (fixture.nativeElement as HTMLElement).querySelector('siaf-table-controls button[aria-label="Borrar"]');
      pagina.marcarFila(pagina.filasTabla()[0].id, true);
      fixture.detectChanges();
      expect(papelera()).not.toBeNull();

      pagina.elaborado.set(true);
      fixture.detectChanges();
      expect(papelera()).toBeNull();
    });
  });

  it('no repite las cadenas que ya están en la tabla', () => {
    pagina.elegirCadenas(CADENAS_PP.slice(0, 2));
    pagina.confirmarRegistro();

    pagina.abrirPanel();
    pagina.marcarProceso('P', true);
    pagina.cambiarCategoria('PP');
    pagina.elegirCadenas([CADENAS_PP[0], CADENAS_PP[3]]);
    pagina.confirmarRegistro();

    expect(pagina.filasTabla().map((f) => f.actividad)).toEqual(['5004339', '5002719', '5005219']);
  });
});
