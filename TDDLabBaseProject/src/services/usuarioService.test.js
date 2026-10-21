import {
  guardarUsuario,
  buscarUsuarioPorCorreo,
  autenticarUsuarioFirebase
} from './usuarioService';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

jest.mock('./firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
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

  it('deberia retornar los datos del usuario si existe en Firestore', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'carlos@example.com',
      data: () => ({
        nombre: 'Carlos Perez',
        correo: 'carlos@example.com',
        password: 'password123',
        rol: 'USER'
      })
    });

    const resultado = await buscarUsuarioPorCorreo('  Carlos@Example.COM ');

    expect(doc).toHaveBeenCalledWith(
      expect.anything(),
      'usuarios',
      'carlos@example.com'
    );

    expect(resultado).toEqual({
      id: 'carlos@example.com',
      nombre: 'Carlos Perez',
      correo: 'carlos@example.com',
      password: 'password123',
      rol: 'USER'
    });
  });

  it('deberia retornar null si el usuario no existe en Firestore', async () => {
    getDoc.mockResolvedValue({
      exists: () => false
    });

    const resultado = await buscarUsuarioPorCorreo('inexistente@example.com');

    expect(resultado).toBeNull();
  });

  it('deberia autenticar exitosamente si el correo y la contraseña coinciden con Firestore', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'carlos@example.com',
      data: () => ({
        nombre: 'Carlos Perez',
        correo: 'carlos@example.com',
        password: 'password123',
        rol: 'USER'
      })
    });

    const resultado = await autenticarUsuarioFirebase('carlos@example.com', 'password123');

    expect(resultado).toEqual({
      exito: true,
      mensaje: '¡Inicio de sesión exitoso!',
      usuario: {
        nombre: 'Carlos Perez',
        correo: 'carlos@example.com',
        rol: 'USER'
      }
    });
  });

  it('deberia rechazar la autenticacion si la contraseña no coincide', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'carlos@example.com',
      data: () => ({
        nombre: 'Carlos Perez',
        correo: 'carlos@example.com',
        password: 'password123',
        rol: 'USER'
      })
    });

    const resultado = await autenticarUsuarioFirebase('carlos@example.com', 'incorrecta');

    expect(resultado).toEqual({
      exito: false,
      mensaje: 'Credenciales incorrectas. Verifica tu correo y contraseña.'
    });
  });

  it('deberia rechazar la autenticacion si el usuario no existe en Firestore', async () => {
    getDoc.mockResolvedValue({
      exists: () => false
    });

    const resultado = await autenticarUsuarioFirebase('noexiste@example.com', '123456');

    expect(resultado).toEqual({
      exito: false,
      mensaje: 'Credenciales incorrectas. Verifica tu correo y contraseña.'
    });
  });

  it('deberia autenticar al administrador preconfigurado con rol ADMIN sin consultar Firestore', async () => {
    const resultado = await autenticarUsuarioFirebase('admin@homebound.com', 'admin123');

    expect(getDoc).not.toHaveBeenCalled();
    expect(resultado).toEqual({
      exito: true,
      mensaje: '¡Inicio de sesión exitoso!',
      usuario: {
        nombre: 'Administrador HomeBound',
        correo: 'admin@homebound.com',
        rol: 'ADMIN'
      }
    });
  });

  it('deberia rechazar al administrador si la contraseña es incorrecta', async () => {
    const resultado = await autenticarUsuarioFirebase('admin@homebound.com', 'password-falsa');

    expect(resultado).toEqual({
      exito: false,
      mensaje: 'Credenciales incorrectas. Verifica tu correo y contraseña.'
    });
  });
});
