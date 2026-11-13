import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';

import { db } from './firebase';

const COLECCIONES = ['hallazgos', 'perdidas'];

export async function obtenerPublicacionesPorEstado(estado) {
  const resultados = await Promise.all(
    COLECCIONES.map((nombre) =>
      getDocs(query(collection(db, nombre), where('estado', '==', estado)))
    )
  );

  return resultados.flatMap((resultado, i) =>
    resultado.docs.map((documento) => ({
      ...documento.data(),
      id: documento.id,
      coleccion: COLECCIONES[i]
    }))
  );
}

export async function actualizarEstadoPublicacion(coleccion, id, estado) {
  await updateDoc(doc(db, coleccion, id), { estado });
}

export async function buscarPublicacionPorId(id, coleccion = null) {
  if (!id) {
    return null;
  }
  if (coleccion) {
    const referenciaDoc = doc(db, coleccion, id);
    const snapshot = await getDoc(referenciaDoc);
    if (!snapshot.exists()) {
      return null;
    }
    return {
      ...snapshot.data(),
      id: snapshot.id,
      coleccion,
    };
  }
  for (const col of COLECCIONES) {
    const referenciaDoc = doc(db, col, id);
    const snapshot = await getDoc(referenciaDoc);
    if (snapshot.exists()) {
      return {
        ...snapshot.data(),
        id: snapshot.id,
        coleccion: col,
      };
    }
  }
  return null;
}