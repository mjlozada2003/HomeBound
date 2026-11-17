import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { CUENTA_ADMIN_PRECONFIGURADA, autenticarUsuario } from '../models/Auth/sesion';
import { normalizarCorreo } from '../models/Auth/validadorCorreo';

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
  if (!correo) {return null;}
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

export async function registrarUsuarioFirebase(usuario) {
  const correoNormalizado = usuario.correo.trim().toLowerCase();

  if (correoNormalizado === CUENTA_ADMIN_PRECONFIGURADA.correo.toLowerCase()) {
    return {
      exito: false,
      mensaje: 'El correo electrónico ya se encuentra registrado.'
    };
  }

  const usuarioExistente = await buscarUsuarioPorCorreo(correoNormalizado);
  if (usuarioExistente) {
    return {
      exito: false,
      mensaje: 'El correo electrónico ya se encuentra registrado.'
    };
  }

  const nuevoUsuario = await guardarUsuario(usuario);
  return {
    exito: true,
    mensaje: '¡Cuenta creada exitosamente! Bienvenido a HomeBound.',
    usuario: nuevoUsuario
  };
}

export async function autenticarUsuarioFirebase(correo, password) {
  const correoNormalizado = normalizarCorreo(correo);
  const esAdmin = correoNormalizado === normalizarCorreo(CUENTA_ADMIN_PRECONFIGURADA.correo);

  // El Admin está preconfigurado en el código: no se consulta Firestore.
  const usuario = esAdmin ? null : await buscarUsuarioPorCorreo(correoNormalizado);

  // La decisión (¿la contraseña es correcta?, ¿qué rol tiene?) la toma el modelo.
  return autenticarUsuario(correoNormalizado, password, usuario ? [usuario] : []);
}
