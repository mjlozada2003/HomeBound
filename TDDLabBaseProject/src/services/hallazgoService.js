import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export async function guardarHallazgo(publicacion) {
  const documento = doc(collection(db, 'hallazgos'));
  const { fotos, ...campos } = publicacion;
  const subidas = [];
  const urls = [];
  async function limpiar() {
    await Promise.all(subidas.map((referencia) => deleteObject(referencia)));
  }
  for (const [indice, foto] of fotos.entries()) {
    const referencia = ref(storage, 'hallazgos/' + documento.id + '/' + indice);
    try {
      await uploadBytes(referencia, foto, { contentType: foto.type });
    } catch (error) {
      await limpiar();
      throw error;
    }
    subidas.push(referencia);
    urls.push(await getDownloadURL(referencia));
  }
  const datos = { ...campos, fotos: urls, estado: 'Pendiente de revisión', creadoEn: serverTimestamp() };
  try {
    await setDoc(documento, datos);
  } catch (error) {
    await limpiar();
    throw error;
  }
  return { ...datos, id: documento.id };
}