import { PawPrint } from 'lucide';
import { iconoSvg } from './iconos.js';

describe('Íconos de Lucide como texto HTML', () => {
  test('Debería crear un svg con el formato común de la app', () => {
    const html = iconoSvg(PawPrint);
    expect(html.startsWith('<svg ')).toBe(true);
    expect(html).toContain('class="icono"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('aria-hidden="true"');
  });

  test('Debería incluir las figuras del ícono de Lucide', () => {
    const html = iconoSvg(PawPrint);
    expect(html).toContain('<circle cx="11" cy="4" r="2"></circle>');
    expect(html.endsWith('</svg>')).toBe(true);
  });

  test('Debería agregar una clase extra si se indica', () => {
    expect(iconoSvg(PawPrint, 'detalle-icono-svg')).toContain('class="icono detalle-icono-svg"');
  });
});
