# 🐾 HomeBound — Búsqueda Colaborativa

> **Plataforma web colaborativa para el reporte, búsqueda y reencuentro de objetos y mascotas perdidas o encontradas.**

---

## 📖 Descripción del Proyecto

**HomeBound** es una plataforma comunitaria diseñada para conectar a personas que han extraviado una pertenencia o mascota con aquellas que la han encontrado. A través de publicaciones estructuradas, categorizadas y validadas, el sistema centraliza la información para acelerar el proceso de recuperación y asistencia comunitaria.

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

La aplicación sigue fielmente el patrón arquitectónico **Modelo - Vista - Presentador (MVP)** con desarrollo guiado por pruebas (**TDD**) y arquitectura **BaaS (Backend as a Service)** impulsada por Firebase:

```
       ┌────────────────────────┐
       │         VISTA          │  (index.html)
       │  (Captura eventos y    │  - Estructura visual Single Page Application (SPA)
       │   renderiza datos)     │  - Estilos centralizados en src/styles/styles.css
       └───────────▲────────────┘
                   │ Eventos del DOM / Actualización de interfaz
       ┌───────────▼────────────┐
       │      PRESENTADOR       │  (src/presenters/)
       │  (Orquesta el flujo    │  - authPresenter.js (Login, Registro, Perfil)
       │   entre vista y modelo)│  - postPresenter.js (Publicaciones y filtros)
       └───────────▲────────────┘  - statsPresenter.js (Métricas administrativas)
                   │ Invoca lógica pura / Recibe resultados
       ┌───────────▼────────────┐
       │         MODELO         │  (src/models/)
       │  (Reglas de negocio,   │  - Validaciones de campos y seguridad
       │   validadores, TDD)    │  - Detección de duplicados y filtros
       └───────────▲────────────┘  - 100% testeado con Jest (*.test.js)
                   │
       ┌───────────▼────────────┐
       │       SERVICIOS        │  (src/services/)
       │  (Firebase BaaS)       │  - Firestore (Base de datos NoSQL)
       │                        │  - Firebase Authentication (Gestión de usuarios)
       └────────────────────────┘  - Firebase Storage (Imágenes de mascotas y objetos)
```

* **Modelo (`src/models/`):** Contiene la lógica del dominio y reglas de negocio puras en JavaScript. No depende del DOM ni del navegador, lo que permite un ciclo **TDD rápido y estricto (Red-Green-Refactor)**.
* **Vista (`index.html` + `src/styles/`):** Estructura en una sola página (SPA) con secciones dinámicas, asegurando que la sesión y el estado se mantengan fluidos sin recargas de página.
* **Presentador (`src/presenters/` y `src/presenter.js`):** `presenter.js` actúa como el inicializador maestro, mientras que cada archivo en `src/presenters/` maneja los eventos de su dominio específico.
* **Servicios (`src/services/`):** Capa de conexión directa a **Firebase**, encargada de la persistencia de cuentas, sesiones y publicaciones en la nube.

---

## 📂 Estructura de Directorios

Toda la solución se encuentra organizada modularmente dentro de `TDDLabBaseProject`:

```text
HomeBound/
│
├── README.md                              # Documentación general del proyecto
│
└── TDDLabBaseProject/                     # Código fuente y configuración del proyecto
    ├── .github/                           # Flujos de integración continua (CI/CD)
    ├── .husky/                            # Git hooks (pre-commit, post-commit con telemetría TDD)
    ├── cypress/                           # Pruebas de Aceptación End-to-End (E2E)
    ├── script/                            # Scripts de seguimiento de métricas y commits de TDD
    ├── tests-lists/                       # Listas de casos de prueba por Historia de Usuario
    │   └── HU-01.md
    │
    ├── src/                               # Código Fuente
    │   ├── assets/                        # Recursos multimedia
    │   │   └── logo.jpg                   # Logotipo oficial
    │   │
    │   ├── models/                        # 🧠 MODELOS (Lógica de negocio pura + tests TDD)
    │   │   ├── Auth/                      # Dominio de Autenticación y Cuentas
    │   │   │   ├── cuenta.js
    │   │   │   └── cuenta.test.js         # (16 pruebas unitarias TDD)
    │   │   ├── Posts/                     # Dominio de Publicaciones (Hallazgos y Pérdidas)
    │   │   └── Stats/                     # Dominio de Estadísticas para Administradores
    │   │
    │   ├── presenters/                    # 🔄 PRESENTADORES (Orquestación MVP)
    │   │   ├── authPresenter.js           # Maneja Registro, Login y Perfil
    │   │   ├── postPresenter.js           # Maneja creación de Hallazgos y Pérdidas
    │   │   └── statsPresenter.js          # Maneja visualización de métricas
    │   │
    │   ├── services/                      # ☁️ SERVICIOS (Conexión con Firebase BaaS)
    │   │   └── firebase.js                # Inicialización de Firebase SDK y Firestore
    │   │
    │   ├── styles/                        # 🎨 SISTEMA DE DISEÑO
    │   │   └── styles.css                 # Paleta de colores y componentes visuales
    │   │
    │   └── presenter.js                   # Bootstrap / Inicializador principal de presentadores
    │
    ├── .babelrc                           # Configuración Babel para Jest
    ├── .parcelrc                          # Configuración del empaquetador Parcel
    ├── cypress.config.js                  # Configuración de Cypress E2E
    ├── index.html                         # 👁️ VISTA (Interfaz web con navegación y secciones SPA)
    ├── package.json                       # Dependencias y scripts de ejecución
    ├── semantic-commits.js                # Validador de commits semánticos
    └── tsconfig.json                      # Configuración de soporte y resolución de módulos
```

---

## 🎯 Estado de Historias de Usuario (Sprint 1)

| Identificador | Historia de Usuario | Estado | Detalle |
| :---: | :--- | :---: | :--- |
| **HU-01** | **Crear cuenta** | ✅ **Completada** | 16 pruebas unitarias TDD cubriendo 5 casos: campos vacíos, formato de correo, longitud de contraseña (mínimo 6), longitud de nombre (mínimo 2) y registro exitoso con confirmación. |
| **HU-02** | **Iniciar / Cerrar sesión** | ⏳ *En desarrollo* | Autenticación con correo/contraseña, roles (Usuario vs Admin), persistencia de sesión al recargar y pantalla de perfil con opción de cerrar sesión. |
| **HU-03** | **Publicar hallazgo** | 📋 *Pendiente* | Reporte de objeto o mascota encontrada con detalles, fecha, fotografía y contacto opcional. |
| **HU-04** | **Publicar pérdida** | 📋 *Pendiente* | Reporte de objeto o mascota perdida con detalles, fecha, fotografía y contacto obligatorio. |
| **HU-06** | **Ver vista básica** | 📋 *Pendiente* | Exploración del feed con tarjetas de publicaciones recientes y badges diferenciadores. |
| **HU-08** | **Ver estadísticas básicas** | 📋 *Pendiente* | Panel exclusivo para el rol `ADMIN` con contadores de publicaciones activas y resueltas. |

### 🛡️ Reglas de Negocio Inquebrantables
1. **Separación estricta de categorías:** Los objetos (`OBJETO`) y las mascotas (`MASCOTA`) están rigurosamente separados; el sistema no permite mezclar publicaciones entre categorías.
2. **Diferenciación visual inequívoca:** Cada publicación distingue visualmente si se trata de un **Hallazgo** (Verde Bosque) o una **Pérdida** (Terracota).
3. **Prevención de duplicados:** Se bloquea el registro de publicaciones repetidas que posean idéntico contenido en una misma categoría.
4. **Validación de completitud:** Ninguna publicación puede enviarse si carece de sus campos obligatorios.

---

## 🛠️ Stack Tecnológico

* **Frontend:** JavaScript Moderno (ES Modules) + [Parcel](https://parceljs.org/)
* **Base de Datos & Auth:** [Firebase Firestore & Firebase Authentication](https://firebase.google.com/)
* **Pruebas Unitarias & TDD:** [Jest](https://jestjs.io/)
* **Pruebas End-to-End:** [Cypress](https://www.cypress.io/)
* **Calidad y Commits:** Husky + Semantic Commits

---

## 🚀 Instalación y Comandos de Ejecución

Todos los comandos se ejecutan situándose dentro de la carpeta `TDDLabBaseProject`:

```bash
cd TDDLabBaseProject
```

### 1. Iniciar Servidor de Desarrollo (Parcel)
```bash
npm start
```
La aplicación estará disponible en `http://localhost:1234`.

### 2. Ejecutar Pruebas Unitarias de TDD (Jest)
```bash
npm test
```
*Registra automáticamente la telemetría en `script/tdd_log.json`.*

### 3. Ejecutar Pruebas End-to-End (Cypress)
```bash
# Interfaz visual de Cypress
npm run cypress

# Modo terminal
npm run cypress-run
```
