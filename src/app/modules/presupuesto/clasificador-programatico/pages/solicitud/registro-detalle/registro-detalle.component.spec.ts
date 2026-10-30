import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RegistroClasificador } from '../../../models/clasificador-programatico.model';
import { RegistroDetalleComponent } from './registro-detalle.component';

const registroPp: RegistroClasificador = {
  id: 'reg-1',
  procesos: ['P'],
  categoriaPresupuestaria: 'PP',
  tipoCadena: 'producto',
  estructura: {
    programa: { id: 'p', codigo: '0062', nombre: 'Optimización de la política' },
    producto: { id: 'pr', codigo: '3000144', nombre: 'Personas reciben servicios consulares' },
    actividad: { id: 'a', codigo: '5004339', nombre: 'Atención de trámites consulares' },
    funcional: { id: 'f', funcion: '02 Relaciones exteriores', division: '002 Servicio diplomático', grupo: '0002 Servicio diplomático' },
  },
};

describe('RegistroDetalleComponent', () => {
  let fixture: ComponentFixture<RegistroDetalleComponent>;
  let detalle: RegistroDetalleComponent;

  const abrir = (registro: RegistroClasificador) => {
    fixture.componentRef.setInput('registro', registro);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RegistroDetalleComponent], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(RegistroDetalleComponent);
    detalle = fixture.componentInstance;
  });

  it('muestra la estructura de un registro PP como «código nombre»', () => {
    abrir(registroPp);
    expect(detalle.estructura()).toEqual([
      { etiqueta: 'Categoría presupuestaria', valor: 'PP - Programas presupuestales' },
      { etiqueta: 'Programa presupuestal', valor: '0062 Optimización de la política' },
      { etiqueta: 'Producto', valor: '3000144 Personas reciben servicios consulares' },
      { etiqueta: 'Actividad', valor: '5004339 Atención de trámites consulares' },
    ]);
    expect(detalle.funcional().map((c) => c.valor)).toEqual(['02 Relaciones exteriores', '002 Servicio diplomático', '0002 Servicio diplomático']);
  });

  it('en una cadena de inversión usa «Inversión» y «AI / Obra»', () => {
    abrir({ ...registroPp, tipoCadena: 'inversion' });
    expect(detalle.estructura().map((c) => c.etiqueta)).toEqual(['Categoría presupuestaria', 'Programa presupuestal', 'Inversión', 'AI / Obra']);
  });

  it('en AC muestra «Proyecto» y «-» donde no hay dato', () => {
    abrir({
      id: 'reg-2',
      procesos: ['P'],
      categoriaPresupuestaria: 'AC',
      estructura: {
        proyecto: { id: 'py', codigo: '2102', nombre: 'Mejoramiento vial' },
        actividad: { id: 'a', codigo: '5000037', nombre: 'Apoyo a la comunidad' },
        funcional: { id: 'f', funcion: '20 Salud', division: '044 Salud individual', grupo: '0096 Atención médica básica' },
      },
    });
    const campos = detalle.estructura();
    expect(campos[0].valor).toBe('AC - Acciones centrales');
    expect(campos[1]).toEqual({ etiqueta: 'Programa presupuestal', valor: '-' });
    expect(campos[2]).toEqual({ etiqueta: 'Proyecto', valor: '2102 Mejoramiento vial' });
  });

  it('la flecha de la cabecera emite returned', () => {
    abrir(registroPp);
    let avisos = 0;
    detalle.returned.subscribe(() => avisos++);
    ((fixture.nativeElement as HTMLElement).querySelector('siaf-solicitude-header button') as HTMLButtonElement).click();
    expect(avisos).toBe(1);
  });
});
