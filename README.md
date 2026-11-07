# 🐾 HomeBound — Búsqueda Colaborativa

> **Plataforma web colaborativa para el reporte, búsqueda y reencuentro de objetos y mascotas perdidas o encontradas.**

---

## 📖 Descripción del Proyecto

**HomeBound** es una plataforma comunitaria diseñada para conectar a personas que han extraviado una pertenencia o mascota con aquellas que la han encontrado. A través de publicaciones estructuradas, categorizadas y moderadas por un administrador, el sistema centraliza la información para acelerar el proceso de recuperación y asistencia comunitaria.

---

## 👥 Equipo e Historias de Usuario (Sprint 1)

| Historia | Descripción | Responsable |
| :--- | :--- | :--- |
| **HU-01** | Crear cuenta | Maria Jesus |
| **HU-02** | Iniciar / Cerrar sesión (roles Usuario y Admin) | Maria Jesus |
| **HU-03** | Publicar hallazgo | Katherine |
| **HU-04** | Publicar pérdida | Katherine |
| **HU-06** | Ver vista básica (lista pública paginada) | Maite |
| **HU-10** | Moderación de publicaciones por el Admin | Maite |

Los casos de prueba de cada historia están en [`tests-lists/`](tests-lists/).

---

## 🎨 Identidad Visual y Paleta de Colores

El diseño visual está basado en el logotipo institucional de **HomeBound**, transmitiendo calidez, esperanza, comunidad y claridad visual:

| Color | Código Hex | Rol en el Sistema |
| :--- | :--- | :--- |
| **Verde Bosque** | `#2D6A4F` | Color institucional primario, botones de acción, logotipo y badge de **Hallazgo** |
| **Verde Oliva / Salvia** | `#6B9E5A` | Color secundario, iconos de comunidad y filtros complementarios |
| **Crema Cálido** | `#F9F6EE` | Fondo general de la aplicación (suave, cálido y acogedor) |
| **Blanco Puro** | `#FFFFFF` | Superficie de tarjetas de publicaciones (cards), formularios y modales |
| **Terracota / Alerta** | `#C94A29` | Badge y acento visual prioritario para reportes de **Pérdida** |
| **Texto Principal** | `#1F2D24` | Tipografía principal (verde petróleo oscuro para alto contraste y accesibilidad) |

---

## 🏛️ Arquitectura del Sistema: Modelo - Vista - Presentador (MVP)

La aplicación sigue el patrón **Modelo - Vista - Presentador (MVP)** con desarrollo guiado por pruebas (**TDD**). Los datos se guardan en **Firebase Firestore** y las fotos en **Cloudinary**:

```
       ┌────────────────────────┐
       │         VISTA          │  (index.html + src/styles/styles.css)
       │  (Captura eventos y    │  - Single Page Application (SPA)
       │   muestra datos)       │  - Secciones que se muestran u ocultan
       └───────────▲────────────┘
                   │ Eventos del DOM / Actualización de interfaz
       ┌───────────▼────────────┐
       │      PRESENTADOR       │  (src/presenters/)
       │  (Orquesta el flujo    │  - authPresenter.js: registro, login y navegación
       │   entre vista, modelo  │  - postPresenter.js: formularios de hallazgo y pérdida
       │   y servicios)         │  - listaPresenter.js: lista pública paginada
       └─────▲─────────────▲────┘  - moderacionPresenter.js: bandeja del Admin
             │             │
   ┌─────────▼──────┐  ┌───▼────────────────┐
   │     MODELO     │  │     SERVICIOS      │  (src/services/)
   │ (src/models/)  │  │ - hallazgoService / perdidaService: guardan publicaciones
   │ Reglas de      │  │ - publicacionesService: lee por estado y modera
   │ negocio puras, │  │ - usuarioService: registro y login en Firestore
   │ probadas con   │  │ - cloudinaryService: sube las fotos
   │ Jest           │  └────────────────────┘
   └────────────────┘
```

* **Modelo (`src/models/`):** lógica de negocio pura en JavaScript. No usa `document`, `window` ni Firebase: recibe datos y devuelve resultados, por eso se prueba con Jest sin abrir el navegador.
  * `Auth/cuenta.js` (validación de registro), `Auth/sesion.js` (login, sesión activa y roles).
  * `Posts/hallazgo.js` y `Posts/perdida.js` (validación y creación de publicaciones).
  * `Posts/publicaciones.js` (filtrar aprobadas, ordenar, paginar y formatear tarjetas).
  * `Posts/moderacion.js` (permiso de Admin, bandeja de pendientes, aprobar y rechazar).
  * `html.js` (escapa el texto del usuario antes de mostrarlo, para evitar XSS).
* **Vista (`index.html` + `src/styles/`):** una sola página con secciones que se muestran u ocultan. No contiene reglas de negocio.
* **Presentador (`src/presenters/` y `src/presenter.js`):** `presenter.js` inicia la aplicación; cada presenter maneja los eventos de su parte y es el único que conoce la vista y los servicios.
* **Servicios (`src/services/`):** única capa que se comunica con Firestore y Cloudinary. En Firestore solo se guarda la URL de cada foto.

### 🔄 Flujo de una publicación (HU-03 → HU-10 → HU-06)

1. El usuario completa el formulario. `postPresenter` valida con `hallazgo.js` o `perdida.js`, sube las fotos a Cloudinary y el servicio guarda la publicación en Firestore con estado **`Pendiente de revisión`**.
2. El Admin abre el panel. `moderacionPresenter` obtiene las pendientes con `publicacionesService` y las muestra usando `moderacion.js`.
3. Al **Aprobar** o **Rechazar**, se verifica el rol Admin y el estado cambia a **`APROBADA`** o **`RECHAZADA`**.
4. `listaPresenter` obtiene solo las `APROBADA` y `publicaciones.js` las ordena (de la más reciente a la más antigua) y pagina (10 por página).

### 🗄️ Datos en Firestore

| Colección | Contenido |
| :--- | :--- |
| `hallazgos` | Publicaciones de objetos o mascotas encontradas (`tipo: 'HALLAZGO'`) |
| `perdidas` | Publicaciones de objetos o mascotas perdidas (`tipo: 'PERDIDA'`) |
| `usuarios` | Cuentas registradas (el ID del documento es el correo) |

Cada publicación guarda `tipo`, `categoria` (`OBJETO`, `MASCOTA`), `titulo`, `descripcion`, `fecha` (`AAAA-MM-DD`), `fotos` (arreglo de URLs), `contacto`, `ubicacion`, `estado` y `creadoEn`.

---

## 📂 Estructura de Directorios

```text
HomeBound/
├── .github/workflows/        # Integración continua: corre Jest en cada push y pull request a main
├── .husky/                   # Git hooks (validación de commits y registro TDD)
├── cypress/                  # Pruebas End-to-End (E2E)
├── script/                   # Scripts de registro de pruebas y commits (tdd_log.json)
├── tests-lists/              # Listas de casos de prueba por Historia de Usuario
├── src/
│   ├── assets/               # Logotipo
│   ├── models/               # 🧠 Lógica de negocio pura + tests (*.test.js)
│   │   ├── Auth/             # Registro, sesión y roles
│   │   └── Posts/            # Hallazgos, pérdidas, lista pública y moderación
│   ├── presenters/           # 🔄 Presentadores
│   ├── services/             # ☁️ Firestore, Cloudinary y sus tests
│   ├── styles/               # 🎨 Estilos
│   └── presenter.js          # Inicializador de los presentadores
├── index.html                # 👁️ Vista
├── eslint.config.js          # Reglas de estilo de código
├── semantic-commits.js       # Validador de commits semánticos
└── package.json              # Dependencias y scripts
```

---

## 🛡️ Reglas de Negocio

1. **Categorías separadas:** cada publicación es de un solo tipo de categoría (`OBJETO` o `MASCOTA`).
2. **Diferenciación visual:** cada publicación indica si es un **Hallazgo** (Verde Bosque) o una **Pérdida** (Terracota).
3. **Moderación previa:** toda publicación nueva queda en `Pendiente de revisión` y solo aparece en la lista pública después de que un Admin la aprueba.
4. **Validación de completitud:** ninguna publicación puede enviarse sin sus campos obligatorios, y la fecha no puede ser futura.
5. **Roles:** solo usuarios con sesión pueden publicar y solo el rol `ADMIN` puede moderar.
6. **Cuentas únicas:** no se puede registrar dos veces el mismo correo electrónico.

---

## 🛠️ Stack Tecnológico

* **Frontend:** JavaScript moderno (ES Modules) + [Parcel](https://parceljs.org/)
* **Base de datos:** [Firebase Firestore](https://firebase.google.com/)
* **Fotos:** [Cloudinary](https://cloudinary.com/)
* **Pruebas unitarias y TDD:** [Jest](https://jestjs.io/)
* **Pruebas End-to-End:** [Cypress](https://www.cypress.io/)
* **Calidad:** ESLint, Husky y commits semánticos

---

## 🚀 Instalación y Comandos de Ejecución

Todos los comandos se ejecutan desde la raíz del repositorio:

```bash
npm install
```

### 1. Iniciar servidor de desarrollo (Parcel)
```bash
npm start
```
La aplicación estará disponible en `http://localhost:1234`.

### 2. Ejecutar pruebas unitarias (Jest)
```bash
npm test
```
*Registra cada ejecución en `script/tdd_log.json`, que sirve como evidencia del ciclo TDD.*

Para correr un solo archivo o una sola prueba (no queda registrado en el log):
```bash
npx jest src/models/Posts/moderacion.test.js
npx jest -t "nombre de la prueba"
```

### 3. Revisar el estilo de código (ESLint)
```bash
npm run lint
```

### 4. Ejecutar pruebas End-to-End (Cypress)
```bash
# Interfaz visual de Cypress
npm run cypress

# Modo terminal
npm run cypress-run
```

---

## 🔁 Flujo de Trabajo

### Ramas
* `main` es la rama principal.
* Cada historia se desarrolla en su propia rama (por ejemplo `feature/HU04` o `fix/HU06-HU10`) y se integra a `main` con un **Pull Request revisado por otra integrante**.

### Ciclo TDD
1. Escribir la prueba y correr `npm test`: debe **fallar** (rojo).
2. Escribir lo mínimo para que pase y correr `npm test`: debe **pasar** (verde).
3. Hacer commit. Ningún commit se sube con pruebas fallando; el rojo queda registrado en `script/tdd_log.json`.
4. Si hace falta, **refactorizar** sin cambiar el comportamiento y volver a confirmar que todo pasa.

### Commits semánticos
Los mensajes siguen el formato `<tipo>: <descripción>` (máximo 150 caracteres). Se puede activar la validación con `npm run semantic-commits-on`.

| Tipo | Uso |
| :--- | :--- |
| `test` | Nueva prueba y lo mínimo para que pase |
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de errores |
| `refactor` | Reorganizar código sin cambiar su comportamiento |
| `docs` | Documentación |
| `style` | Formato del código |
| `chore` | Configuración y mantenimiento |
| `perf` | Mejoras de rendimiento |

Ejemplo: `fix: la bandeja de HU-10 lee la foto desde fotos[0]`

Después de cada commit, el hook `post-commit` agrega automáticamente `script/tdd_log.json` y `script/commit-history.json` al commit.

### Definición de Terminado
Una historia pasa a **Hecho** cuando:
* Sus pruebas se escribieron antes del código y todas pasan.
* Respeta la arquitectura MVP y otra integrante revisó el Pull Request.
* Cada criterio de confirmación se probó manualmente y todos los mensajes están en español.
* Está integrada en `main`, la aplicación corre desde `main` y hay evidencia (captura o video) en la tarjeta de Trello.

---

## 📌 Pendientes conocidos

* La regla de HU-03/HU-04 *"la fecha no puede ser anterior a 5 años"* aún no está implementada.
* La verificación del rol Admin se hace en el navegador; falta configurar reglas de seguridad en Firestore.
* Las contraseñas se guardan sin cifrar en Firestore; una mejora es usar Firebase Authentication.
