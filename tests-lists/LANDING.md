# Landing page y acabados visuales

## Unitarios
### `src/presenters/pasosLanding.js` (Cómo funciona)
1. `calcularProgresoSeccion`: 0 cuando la sección todavía no llegó arriba.
2. `calcularProgresoSeccion`: 0.5 a la mitad del recorrido.
3. `calcularProgresoSeccion`: se queda en 1 cuando la sección ya pasó.
4. `calcularProgresoSeccion`: 0 si la sección no es más alta que la pantalla.
5. `calcularPasoActivo`: primer paso al empezar.
6. `calcularPasoActivo`: reparte el recorrido en partes iguales.
7. `calcularPasoActivo`: se queda en el último paso al final.
8. `calcularPasoActivo`: 0 si no hay pasos.

### `src/presenters/plantillaTarjeta.js` (carga)
9. `crearEsqueletosHtml`: crea la cantidad pedida.
10. `crearEsqueletosHtml`: ocultos para lectores de pantalla.
11. `crearEsqueletosHtml`: nada si la cantidad es 0.

### `src/models/Posts/destacadas.js` (hero)
12. Elige una encontrada activa, una perdida activa y una resuelta.
13. Para la perdida prefiere una mascota aunque haya un objeto más reciente.
14. Si no hay mascotas perdidas, usa la perdida más reciente.
15. Si falta algún estado, completa con las más recientes.
16. Ignora las publicaciones que no se ven en la lista pública.
17. Lista vacía si no hay publicaciones.
18. Devuelve las publicaciones listas para la tarjeta.

## Manuales
- Sin sesión, la app abre en la landing (antes abría en el registro).
- "Crear una cuenta" → registro; "Ya tengo cuenta" → login.
- El hero muestra 3 publicaciones reales, una de cada estado (encontrada, perdida —de preferencia mascota— y resuelta); sin conexión, el hero queda sin tarjetas.
- "Avisos de esta semana" no repite las del hero.
- "Cómo funciona" (pantalla ancha): al bajar, la sección queda fija y cambian los 4 pasos y el color de fondo; las rayas del costado llevan a cada paso. Al cambiar de paso no hay parpadeo ni se ven dos pasos mezclados.
- "Cómo funciona" (celular): los 4 pasos uno debajo del otro.
- "Avisos de esta semana" muestra 4 publicaciones reales; al tocarlas pide iniciar sesión.
- Footer en todas las vistas; sus enlaces respetan la sesión (sin sesión, "Publicaciones" lleva al login).
- El logo sin sesión y "Cerrar sesión" vuelven a la landing.
- Un enlace compartido (`?id=...`) sigue abriendo el detalle.
- Listas (publicaciones, mis publicaciones, panel) muestran tarjetas esqueleto mientras cargan.
- Con "reducir movimiento" activado en el sistema, nada se anima y todo se ve.
