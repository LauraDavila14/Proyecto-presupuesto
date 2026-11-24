import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsStateService } from '../../../../../../core/realtime/notifications-state.service';
import { EstadoNotificacionesDeMuestra } from '../../../../../../features/ui-kit/ejemplos/datos-de-muestra';
import { VER_CLASIFICADOR_FILAS } from '../../../config/clasificador-programatico-documents.config';
import { VerClasificadorPanelComponent } from './ver-clasificador-panel.component';

describe('VerClasificadorPanelComponent', () => {
  let fixture: ComponentFixture<VerClasificadorPanelComponent>;
  let panel: VerClasificadorPanelComponent;
  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VerClasificadorPanelComponent],
      providers: [{ provide: NotificationsStateService, useClass: EstadoNotificacionesDeMuestra }],
    });
    fixture = TestBed.createComponent(VerClasificadorPanelComponent);
    panel = fixture.componentInstance;
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  it('muestra los registros con «Sí» en el estado y sin columna de historial', () => {
    expect(html().textContent).toContain('Ver clasificador programático');
    expect(panel.totalFilas()).toBe(VER_CLASIFICADOR_FILAS.length);
    expect(VER_CLASIFICADOR_FILAS.every((fila) => fila['vigente'] === 'Sí')).toBeTrue();
    expect(html().querySelector('button[aria-label="Ver historial del registro"]')).toBeNull();
  });

  it('el buscador filtra las filas y vuelve a la primera página', () => {
    panel.buscar('apnop');
    fixture.detectChanges();
    expect(panel.totalFilas()).toBe(2);
    expect(panel.pagina()).toBe(1);
  });

  it('con 25 filas por página caben todos los registros; con menos, se reparten', () => {
    expect(panel.filasPorPagina()).toBe(25);
    expect(panel.totalPaginas()).toBe(1);
    panel.cambiarFilasPorPagina(10);
    expect(panel.totalPaginas()).toBe(1);
    panel.buscar('');
    panel.filasPorPagina.set(4);
    expect(panel.totalPaginas()).toBe(3);
    panel.cambiarPagina(1);
    expect(panel.pagina()).toBe(2);
    expect(panel.filasPagina().length).toBe(4);
  });

  it('las casillas marcan solo mientras el panel está abierto: al reabrirlo empieza sin marcas', () => {
    panel.marcar({ row: VER_CLASIFICADOR_FILAS[0], selected: true });
    expect(panel.filasPagina()[0]['selected']).toBeTrue();

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(panel.filasPagina()[0]['selected']).toBeFalse();
  });

  describe('panel «Filtros»', () => {
    it('el ícono lo abre, con Aplicar desactivado hasta que haya cambios', () => {
      panel.abrirFiltros();
      fixture.detectChanges();
      expect(panel.filtrosAbiertos()).toBeTrue();
      expect(panel.borradorCambiado()).toBeFalse();

      panel.cambiarValor('categoria', ['AC Acciones centrales']);
      expect(panel.borradorCambiado()).toBeTrue();
    });

    it('trae ocho desplegables y sus opciones salen de los registros', () => {
      expect(panel.camposFiltro.length).toBe(8);
      expect(panel.opcionesPorCampo['categoria'].map((o) => o.label)).toEqual([
        'AC Acciones centrales',
        'APNOP Asignaciones presupuestarias que no resultan en productos',
        'PP Programas presupuestales',
      ]);
    });

    it('las opciones muestran «código nombre» y un mismo código con otro nombre sale como opción aparte', () => {
      const programas = panel.opcionesPorCampo['programa'].map((o) => o.label);
      expect(programas).toContain('0062 Optimización de la política de protección y atención a las comunidades peruanas en el exterior');
      expect(programas).toContain('-');

      const actividades = panel.opcionesPorCampo['actividad'].map((o) => o.label).filter((l) => l.startsWith('0000420 '));
      expect(actividades.length).toBe(2);
      expect(panel.opcionesPorCampo['funcion'].map((o) => o.label)).toContain('02 Relaciones exteriores');
      expect(panel.opcionesPorCampo['finalidad'].map((o) => o.label)).toEqual(['-']);
    });

    it('Aplicar filtra la tabla, muestra los chips y cierra el panel; Borrar filtros lo deshace', () => {
      panel.abrirFiltros();
      panel.cambiarValor('categoria', ['AC Acciones centrales']);
      panel.aplicarFiltros();
      expect(panel.filtrosAbiertos()).toBeFalse();
      expect(panel.totalFilas()).toBe(4);
      expect(panel.chips()).toEqual(['AC Acciones centrales']);
      expect(panel.filtrosVisibles()).toBeTrue();

      panel.borrarFiltros();
      expect(panel.totalFilas()).toBe(VER_CLASIFICADOR_FILAS.length);
      expect(panel.filtrosVisibles()).toBeFalse();
    });

    it('Cancelar cierra sin aplicar y descarta lo cambiado', () => {
      panel.abrirFiltros();
      panel.cambiarValor('categoria', ['PP Programas presupuestales']);
      panel.cerrarFiltros();
      expect(panel.totalFilas()).toBe(VER_CLASIFICADOR_FILAS.length);

      panel.abrirFiltros();
      expect(panel.borrador()['categoria']).toBeUndefined();
    });

    it('los filtros se suman al buscador', () => {
      panel.abrirFiltros();
      panel.cambiarValor('categoria', ['AC Acciones centrales']);
      panel.aplicarFiltros();
      panel.buscar('2355382');
      expect(panel.totalFilas()).toBe(2);
    });
  });
});
