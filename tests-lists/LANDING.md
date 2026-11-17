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

## Manuales
- Sin sesión, la app abre en la landing (antes abría en el registro).
- "Crear una cuenta" → registro; "Ya tengo cuenta" → login.
- El hero muestra las 3 publicaciones más recientes reales; sin conexión, el hero queda sin tarjetas.
- "Cómo funciona" (pantalla ancha): al bajar, la sección queda fija y cambian los 4 pasos y el color de fondo; las rayas del costado llevan a cada paso.
- "Cómo funciona" (celular): los 4 pasos uno debajo del otro.
- "Avisos de esta semana" muestra 4 publicaciones reales; al tocarlas pide iniciar sesión.
- Footer en todas las vistas; sus enlaces respetan la sesión (sin sesión, "Publicaciones" lleva al login).
- El logo sin sesión y "Cerrar sesión" vuelven a la landing.
- Un enlace compartido (`?id=...`) sigue abriendo el detalle.
- Listas (publicaciones, mis publicaciones, panel) muestran tarjetas esqueleto mientras cargan.
- Con "reducir movimiento" activado en el sistema, nada se anima y todo se ve.
