import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';

import { db } from './firebase';

const COLECCIONES = ['hallazgos', 'perdidas'];

export async function obtenerPublicacionesPorEstado(estado) {
  for (const nombre of COLECCIONES) {
    await getDocs(query(collection(db, nombre), where('estado', '==', estado)));
  }

  return [];
}
