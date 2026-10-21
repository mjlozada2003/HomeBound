import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { CUENTA_ADMIN_PRECONFIGURADA } from '../models/Auth/sesion';

export async function guardarUsuario(usuario) {
  const correoNormalizado = usuario.correo.trim().toLowerCase();
  const referenciaDoc = doc(db, 'usuarios', correoNormalizado);

  const datosAGuardar = {
    nombre: usuario.nombre.trim(),
    correo: correoNormalizado,
    password: usuario.password,
    rol: 'USER',
    creadoEn: serverTimestamp()
  };

  await setDoc(referenciaDoc, datosAGuardar);

  return {
    id: correoNormalizado,
    nombre: datosAGuardar.nombre,
    correo: datosAGuardar.correo,
    rol: datosAGuardar.rol
  };
}

export async function buscarUsuarioPorCorreo(correo) {
  if (!correo) return null;
  const correoNormalizado = correo.trim().toLowerCase();
  const referenciaDoc = doc(db, 'usuarios', correoNormalizado);
  const snapshot = await getDoc(referenciaDoc);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}

export async function autenticarUsuarioFirebase(correo, password) {
  const correoNormalizado = correo.trim().toLowerCase();

  // Caso especial: Cuenta Admin preconfigurada
  if (correoNormalizado === CUENTA_ADMIN_PRECONFIGURADA.correo.toLowerCase()) {
    if (password === CUENTA_ADMIN_PRECONFIGURADA.password) {
      return {
        exito: true,
        mensaje: '¡Inicio de sesión exitoso!',
        usuario: {
          nombre: CUENTA_ADMIN_PRECONFIGURADA.nombre,
          correo: CUENTA_ADMIN_PRECONFIGURADA.correo,
          rol: CUENTA_ADMIN_PRECONFIGURADA.rol
        }
      };
    }
    return {
      exito: false,
      mensaje: 'Credenciales incorrectas. Verifica tu correo y contraseña.'
    };
  }

  const usuario = await buscarUsuarioPorCorreo(correoNormalizado);

  if (!usuario || usuario.password !== password) {
    return {
      exito: false,
      mensaje: 'Credenciales incorrectas. Verifica tu correo y contraseña.'
    };
  }

  return {
    exito: true,
    mensaje: '¡Inicio de sesión exitoso!',
    usuario: {
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol || 'USER'
    }
  };
}
