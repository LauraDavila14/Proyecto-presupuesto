import { TestBed } from '@angular/core/testing';

import { CLAVE_SOLICITUDES_CLASIFICADOR, ClasificadorSolicitudesService, SOLICITUDES_CLASIFICADOR_DE_EJEMPLO, SolicitudClasificador } from './clasificador-solicitudes.service';

const solicitud = (id: string, numero: string): SolicitudClasificador => ({
  id,
  numero,
  tipoDocumento: 'Solicitud de clasificador programático',
  tipoAccion: 'Creación',
  estado: 'Elaborado',
  fecha: '15/06/2026',
  entidadCodigo: '0001',
  entidad: 'Ministerio de Economía y Finanzas',
});

describe('ClasificadorSolicitudesService', () => {
  let servicio: ClasificadorSolicitudesService;

  beforeEach(() => {
    localStorage.setItem(CLAVE_SOLICITUDES_CLASIFICADOR, '[]');
    servicio = TestBed.inject(ClasificadorSolicitudesService);
  });

  it('sin nada guardado arranca con una solicitud de ejemplo por sección de la Bandeja', () => {
    localStorage.removeItem(CLAVE_SOLICITUDES_CLASIFICADOR);
    TestBed.resetTestingModule();
    const conEjemplos = TestBed.inject(ClasificadorSolicitudesService);
    expect(conEjemplos.solicitudes()).toEqual(SOLICITUDES_CLASIFICADOR_DE_EJEMPLO);
    expect([conEjemplos.borradoresCount(), conEjemplos.verificadasCount(), conEjemplos.respuestasCount(), conEjemplos.papeleraCount()]).toEqual([1, 1, 1, 1]);
    expect(conEjemplos.siguienteNumero()).toBe('0005');
  });

  it('empieza vacío y el primer correlativo es 0001', () => {
    expect(servicio.solicitudes()).toEqual([]);
    expect(servicio.siguienteNumero()).toBe('0001');
  });

  it('guardar inserta y, con el mismo id, actualiza sin duplicar', () => {
    servicio.guardar(solicitud('a', '0001'));
    servicio.guardar({ ...solicitud('a', '0001'), fecha: '16/06/2026' });
    expect(servicio.solicitudes().length).toBe(1);
    expect(servicio.solicitudes()[0].fecha).toBe('16/06/2026');
    expect(servicio.siguienteNumero()).toBe('0002');
  });

  it('cambiar el estado mueve los contadores de las bandejas', () => {
    servicio.guardar(solicitud('a', '0001'));
    expect(servicio.borradoresCount()).toBe(1);
    servicio.cambiarEstado('a', 'Verificado');
    expect(servicio.borradoresCount()).toBe(0);
    expect(servicio.verificadasCount()).toBe(1);
    servicio.cambiarEstado('a', 'Eliminado');
    expect(servicio.papeleraCount()).toBe(1);
  });

  it('el correlativo no se reutiliza aunque la solicitud esté en la Papelera', () => {
    servicio.guardar(solicitud('a', '0003'));
    servicio.cambiarEstado('a', 'Eliminado');
    expect(servicio.siguienteNumero()).toBe('0004');
  });

  it('se guarda en el navegador y una instancia nueva lo recupera', () => {
    servicio.guardar(solicitud('a', '0001'));
    TestBed.resetTestingModule();
    expect(TestBed.inject(ClasificadorSolicitudesService).solicitudes().map((s) => s.id)).toEqual(['a']);
  });
});
