import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export async function guardarHallazgo(publicacion) {
  const documento = doc(collection(db, 'hallazgos'));
  const { fotos, ...campos } = publicacion;
  const urls = [];
    for (const [indice, foto] of fotos.entries()) {
      const referencia = ref(storage, 'hallazgos/' + documento.id + '/' + indice);
      await uploadBytes(referencia, foto, { contentType: foto.type });
      urls.push(await getDownloadURL(referencia));
    }
    const datos = { ...campos, fotos: urls, estado: 'Pendiente de revisión', creadoEn: serverTimestamp() };
    await setDoc(documento, datos);
    return { ...datos, id: documento.id };
}