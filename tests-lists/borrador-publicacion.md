# Borrador al salir de publicar (hallazgo / pérdida)

## Modelo `src/models/Posts/borrador.js`
1. `tieneDatosIngresados`: responde false si el formulario está vacío.
2. `tieneDatosIngresados`: ignora campos que solo tienen espacios.
3. `tieneDatosIngresados`: responde true si el usuario escribió algún texto.
4. `tieneDatosIngresados`: responde true si el usuario solo eligió fotos.
5. `crearBorrador`: guarda los textos que el usuario escribió.
6. `crearBorrador`: deja fuera las fotos (no se pueden guardar en el navegador).
7. `claveBorrador`: una clave distinta por tipo de publicación y por usuario.
8. `claveBorrador`: normaliza el correo del usuario.

## Servicio `src/services/borradorService.js`
9. Guarda un borrador y lo recupera igual.
10. Responde null si no hay borrador guardado.
11. Responde null si el borrador guardado está dañado.
12. Elimina el borrador.

## Pruebas manuales
- Formulario vacío + "← Volver": vuelve a la lista sin preguntar.
- Con datos + "← Volver": aparece el diálogo "¿Salir sin publicar?".
  - "Seguir editando": se queda en el formulario con los datos.
  - "Guardar borrador": vuelve a la lista; al entrar otra vez (o recargar) los datos aparecen con el aviso de volver a elegir las fotos.
  - "Descartar": limpia el formulario, borra el borrador y vuelve a la lista.
- Enviar la publicación con éxito borra el borrador.
- Otro usuario en el mismo navegador no ve el borrador ajeno.
