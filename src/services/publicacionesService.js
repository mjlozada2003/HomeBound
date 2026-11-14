import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';

import { db } from './firebase';

const COLECCIONES = ['hallazgos', 'perdidas'];

function consultaPorCampo(nombre, campo, valor) {
  return query(collection(db, nombre), where(campo, '==', valor));
}

async function buscarEnColecciones(campo, valor) {
  const resultados = await Promise.all(
    COLECCIONES.map((nombre) => getDocs(consultaPorCampo(nombre, campo, valor)))
  );

  return resultados.flatMap((resultado, i) =>
    resultado.docs.map((documento) => ({
      ...documento.data(),
      id: documento.id,
      coleccion: COLECCIONES[i]
    }))
  );
}

export async function obtenerPublicacionesPorEstado(estado) {
  return buscarEnColecciones('estado', estado);
}

export async function actualizarEstadoPublicacion(coleccion, id, estado) {
  await updateDoc(doc(db, coleccion, id), { estado });
}

export async function obtenerPublicacionesPorAutor(correo) {
  return buscarEnColecciones('autor', correo);
}

export async function actualizarPublicacion(coleccion, id, cambios) {
  await updateDoc(doc(db, coleccion, id), cambios);
}

export async function borrarPublicacion(coleccion, id) {
  await deleteDoc(doc(db, coleccion, id));
}

export async function contarPublicacionesPorEstado(estado) {
  const conteos = await Promise.all(
    COLECCIONES.map((nombre) => getCountFromServer(consultaPorCampo(nombre, 'estado', estado)))
  );

  return Object.fromEntries(
    COLECCIONES.map((nombre, i) => [nombre, conteos[i].data().count])
  );
}
