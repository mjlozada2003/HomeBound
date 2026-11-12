# Refactoring HU-03 (Publicar hallazgo) y HU-04 (Publicar pérdida)

Rama: `refactor/HU03-04`. Objetivo: mejorar la legibilidad y la mantenibilidad **sin alterar la funcionalidad**.

## Proceso seguido

1. Pruebas en verde antes de cambiar nada (102 pruebas).
2. Pruebas de red de seguridad para el código que no tenía pruebas:
   `hallazgoService.test.js` y `postPresenter.test.js` (`enviarHallazgo` / `enviarPerdida`).
3. Un refactoring a la vez, ejecutando las pruebas después de cada uno.
4. Verificación extra: se comparó el código original con el refactorizado usando 120 000 entradas
   aleatorias (`validar*` / `crear*` / `crearEnlaceMapa`), sin ninguna diferencia, y el presenter con un DOM simulado.
5. Refactoring de las pruebas. Resultado final: 136 pruebas en verde.

## Code smells encontrados

| Code smell | Dónde | Refactoring aplicado |
|---|---|---|
| **Código duplicado**: `validarPerdida` era una copia de `validarHallazgo` (fecha, fotos, contacto, ubicación) | `perdida.js`, `hallazgo.js` | *Extract Function* + *Move Function* → `reglasPublicacion.js` con `validarPublicacion(...)`; cada HU solo define su categoría y su mensaje de fecha futura |
| **Código duplicado** al preparar la publicación (contacto, enlaces, ubicación) | `crearHallazgo`, `crearPerdida` | *Extract Function* → `prepararPublicacion(tipo, datos)` |
| **Código duplicado**: `guardarHallazgo` y `guardarPerdida` eran iguales salvo por la colección | `hallazgoService.js`, `perdidaService.js` | *Parameterize Function* → `guardarPublicacionConFotos(nombreColeccion, publicacion)` |
| **Código duplicado** en el presenter: dos formularios casi idénticos, dos `mostrarResumen`, dos `mostrarEnlace` | `postPresenter.js` | *Extract Function* → `iniciarFormularioPublicacion({...})`, `enviarPublicacion({...})`, `mostrarResumen` compartido |
| **Acoplamiento inapropiado**: `perdida.js` importaba utilidades desde `hallazgo.js` | `perdida.js` | Utilidades movidas a un módulo común (`reglasPublicacion.js`) |
| **Funciones largas / condiciones complejas** | `validarHallazgo`, `crearEnlaceMapa`, `subirFoto` | *Decompose Conditional*: `esFechaExistente`, `esFechaFutura`, `esCorreoValido`, `esWhatsappValido`, `esEnlaceDeGoogleMaps`, `esEnlaceSeguro`, `estaConfigurado`, `esUrlSegura`, `esSubidaCancelada` |
| **Números y textos mágicos** (`45000`, `'Pendiente de revisión'`, tipos MIME, expresiones regulares, `'https://wa.me/'`) | modelos, servicios, presenter | *Replace Magic Literal* → `TIEMPO_MAXIMO_SUBIDA_MS`, `ESTADO_PENDIENTE_REVISION`, `TIPOS_DE_FOTO_ADMITIDOS`, `FORMATO_CORREO`, `MENSAJES_*`… |
| **Mala indentación** | `perdida.js`, `perdidaService.js` | Formato uniforme |
| **Manejo de errores inconsistente** (solo el hallazgo registraba el error) | servicios | Un solo comportamiento en `guardarPublicacionConFotos` |
| **Dependencia oculta**: `iniciarPostPresenter` iniciaba el formulario de pérdida y su navegación de forma implícita | `postPresenter.js` | `iniciarFormularioHallazgo`, `iniciarFormularioPerdida`, `iniciarNavegacionEntreFormularios` |

## Nombres (Código Limpio)

| Antes | Después | Principio |
|---|---|---|
| `fechaLocal()` | `obtenerFechaLocal()` | Los métodos se nombran con verbos |
| `enviando` | `estaEnviando` | Los booleanos se nombran como predicados |
| `esOtra` | `eligioOtro` / `esCategoriaOtro()` | Predicados que revelan la intención |
| `numero` | `normalizarWhatsapp(...)` | Revelar la intención |
| `form`, `boton`, `mensaje` | `formulario`, `botonEnviar`, `mensajeEstado` | Nombres pronunciables que revelan la intención |
| `datos` (en servicios), `urls`, `documento` | `publicacionGuardada`, `urlsFotos`, `referenciaDocumento` | Evitar nombres genéricos (*Datos*, *Info*) |
| `datos` (respuesta de Cloudinary) | `datosRespuesta` | Evitar la desinformación |
| `googleMaps` (booleano) | `esRutaMapsDeGoogle`, `esDominioDeMaps`, `esEnlaceCortoDeMaps` | Los booleanos se nombran como predicados |
| `segunda`, `resultado` (pruebas) | `segundaFoto`, `perdidaGuardada` | Revelar la intención |

## Refactoring de las pruebas

- Se agruparon con `describe` según los **casos de cada HU** (`HU-03 Caso 5: cantidad y formato de las fotos`…).
- Nombres uniformes que describen la regla de negocio (`deberia …`); por ejemplo, `exige al menos una foto` pasó a seguir el mismo formato que las demás.
- Se quitó la duplicación con los ayudantes `validarCon(cambios)`, `crearCon(cambios)` y `rechazo(mensaje)`.
- Las pruebas de WhatsApp del hallazgo ahora verifican también el **mensaje**, no solo `esValido`.
- Las pruebas de `crearEnlaceMapa` se movieron a `reglasPublicacion.test.js`; se agregaron casos para enlaces `http:` y con usuario o contraseña.
- Nuevas pruebas: `hallazgoService.test.js` (HU-03 no tenía pruebas de persistencia) y `postPresenter.test.js`.

## Observaciones de la revisión de las HU

- La HU-03 no lista casos de **persistencia** del hallazgo (la HU-04 sí: casos 12 a 14), aunque el código los implementa. Se agregaron pruebas equivalentes en `hallazgoService.test.js`; convendría añadir esos casos a `HU-03.md`.
- HU-03 y HU-04 repiten los casos de Cloudinary (12 a 15 y 15 a 18). Como el servicio es compartido, podrían documentarse una sola vez.
- El único cambio observable: al fallar el guardado de una **pérdida**, ahora también se registra el error en la consola, igual que en el hallazgo. Lo que ve el usuario no cambia.
