import { guardarUsuario } from './usuarioService';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

jest.mock('./firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn()
}));

describe('Servicio de Usuarios (Firestore)', () => {
  const usuarioMock = {
    nombre: 'Carlos Perez',
    correo: 'carlos@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    jest.resetAllMocks();
    doc.mockReturnValue({ id: 'carlos@example.com' });
    serverTimestamp.mockReturnValue('FECHA_SERVIDOR');
    setDoc.mockResolvedValue(undefined);
  });

  it('deberia guardar un nuevo usuario con rol USER en la coleccion usuarios de Firestore', async () => {
    const resultado = await guardarUsuario(usuarioMock);

    expect(doc).toHaveBeenCalledWith(
      expect.anything(),
      'usuarios',
      'carlos@example.com'
    );

    expect(setDoc).toHaveBeenCalledWith(
      { id: 'carlos@example.com' },
      {
        nombre: 'Carlos Perez',
        correo: 'carlos@example.com',
        password: 'password123',
        rol: 'USER',
        creadoEn: 'FECHA_SERVIDOR'
      }
    );

    expect(resultado).toEqual({
      id: 'carlos@example.com',
      nombre: 'Carlos Perez',
      correo: 'carlos@example.com',
      rol: 'USER'
    });
  });
});
