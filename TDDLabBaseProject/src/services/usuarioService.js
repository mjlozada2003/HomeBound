import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

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
