import {
  collection,
  deleteDoc,
  doc,
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

export async function obtenerPublicacionesPorAutor(correo) {
  const resultados = await Promise.all(
    COLECCIONES.map((nombre) =>
      getDocs(query(collection(db, nombre), where('autor', '==', correo)))
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

export async function actualizarPublicacion(coleccion, id, cambios) {
  await updateDoc(doc(db, coleccion, id), cambios);
}

export async function borrarPublicacion(coleccion, id) {
  await deleteDoc(doc(db, coleccion, id));
}
