import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
