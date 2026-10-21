import {
  collection,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

import { db } from './firebase';
import { subirFoto } from './cloudinaryService';

export async function guardarPerdida(publicacion) {
  const documento = doc(collection(db, 'perdidas'));
  const { fotos, ...campos } = publicacion;

  const urls = [await subirFoto(fotos[0])];

  const datos = {
    ...campos,
    fotos: urls,
    creadoEn: serverTimestamp()
  };

  await setDoc(documento, datos);

  return { ...datos, id: documento.id };
}