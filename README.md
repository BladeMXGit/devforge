<p align="center">
  <img src="assets/icon.svg" width="112" alt="DevForge glowing logo" />
</p>

<h1 align="center">DevForge</h1>

<p align="center">
  A blazing fast, private, and offline-first developer suite that runs 100% in your browser.
</p>

<p align="center">
  <a href="https://blademxgit.github.io/devforge/"><img alt="Open DevForge" src="https://img.shields.io/badge/Open-DevForge-6366f1?style=for-the-badge&logo=github&logoColor=white" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-38bdf8?style=for-the-badge" /></a>
  <img alt="Privacy 100% Client-Side" src="https://img.shields.io/badge/Privacy-100%25_Client--Side-10b981?style=for-the-badge" />
</p>

<p align="center"><a href="#english">English</a> · <a href="#español">Español</a></p>

---

## English

**DevForge** is a modern, lightweight, client-side developer toolbox. Everyday engineering utilities (cURL conversion, JWT inspection, JSON type generation, cryptography, regex, diff, and color contrast) in one clean workspace.

**Zero data leaves your browser.** Everything runs client-side using native modern Web APIs (`crypto.subtle`, `FileReader`, `URL`, `TextEncoder`). No trackers, no telemetry, no backend servers, and no build step required.

### ⚡ Included Tools

1. **cURL Converter:** Parse shell `curl` commands and convert them instantly to JavaScript (`fetch`, `axios`), Python (`requests`), Go (`net/http`), and Rust (`reqwest`).
2. **JWT Inspector & Debugger:** Decode JWT headers and payloads, inspect claims (`sub`, `roles`), format timestamps to local/UTC, and track real-time expiration with an active countdown.
3. **JSON Studio & Type Generator:** Format, minify, and validate JSON with syntax error pointers. Generate ready-to-use **TypeScript** interfaces, **Python Dataclasses**, and **Go Structs** with a single click.
4. **Crypto & Password Studio:** Native Web Crypto hashes (SHA-256, SHA-512, MD5, SHA-1), HMAC-SHA256 with custom keys, batch UUID v4/v7 generation, and cryptographically secure password generator with an entropy meter.
5. **Regex Playground:** Real-time regex matching, flags editor (`g`, `i`, `m`, `s`), interactive match highlighting, replacement preview, and built-in presets (email, URL, IPv4, ISO date, slug).
6. **Base64 & Asset Studio:** UTF-8 safe text encode/decode, drag-and-drop file/image converter to Data URI with live preview and one-click copy for CSS and HTML `<img>` tags.
7. **Cron Schedule Explainer:** Translates 5-field cron syntax (`* * * * *`) into plain English and Spanish speech, and calculates the next 5 upcoming execution times.
8. **Text Diff & Inspector:** Line-by-line diff comparing original vs modified text with additions/deletions visualizer, word count, character count, and reading time estimation.
9. **Color & WCAG Accessibility Lab:** Interactive color pickers and HEX/RGB/HSL sync. Calculates contrast ratios against WCAG 2.1 AA/AAA compliance thresholds (normal & large text) and generates palette tints/shades.
10. **URL & Query Inspector:** Parse full URLs into protocol, host, pathname, and hash. Edit query parameters in an interactive table with automatic real-time URL rebuilding.

### 🎯 Key Highlights

- **Command Palette (`Ctrl + K` / `Cmd + K`):** Jump between any tool in milliseconds with fuzzy search and keyboard arrows.
- **Dark & Light Mode:** Sleek dark-first UI with persistent theme preference in `localStorage`.
- **Offline & PWA-ready:** Runs completely offline without any internet connection.
- **Zero Build Step:** Built with modern vanilla ES Modules and clean CSS. Clone and run immediately.

### 🚀 Live Demo

Use the live app on GitHub Pages: **[https://blademxgit.github.io/devforge/](https://blademxgit.github.io/devforge/)**

### 💻 Run Locally

Serve the repository with any local static server:

```bash
# Clone the repository
git clone https://github.com/BladeMXGit/devforge.git
cd devforge

# Using Python
python -m http.server 8080

# Or simply double-click index.html in your browser!
```

---

## Español

**DevForge** es una suite de herramientas de desarrollo moderna, ligera y 100% del lado del cliente. Reúne utilidades esenciales del día a día (conversión de cURL, inspección de JWT, generación de tipos desde JSON, criptografía, regex, diff y contraste de colores) en una sola interfaz rápida y elegante.

**Ningún dato sale de tu navegador.** Todo el procesamiento ocurre localmente con APIs web modernas (`crypto.subtle`, `FileReader`, `URL`, `TextEncoder`). Sin telemetría, sin cookies de rastreo, sin servidores backend y sin necesidad de procesos de compilación complejos.

### ⚡ Herramientas Incluidas

1. **Conversor de cURL:** Pasa comandos de terminal `curl` a JavaScript (`fetch`, `axios`), Python (`requests`), Go (`net/http`) y Rust (`reqwest`).
2. **Inspector de JWT:** Decodifica encabezados y payloads de JSON Web Tokens, inspecciona claims y muestra un contador en tiempo real de expiración o estado activo.
3. **JSON Studio & Generador de Tipos:** Formatea, minifica y valida JSON con detección de errores. Genera interfaces de **TypeScript**, **Python Dataclasses** y **Go Structs** en un clic.
4. **Laboratorio Criptográfico y Contraseñas:** Hashes nativos con Web Crypto (SHA-256, SHA-512, MD5, SHA-1), cálculo de HMAC con clave secreta, generador de UUIDs v4 y v7 por lotes, y contraseñas criptográficamente seguras con cálculo de entropía en bits.
5. **Regex Playground:** Evaluador en vivo de expresiones regulares con resaltado de coincidencias, soporte de flags, prueba de reemplazo y chuleta de patrones comunes (emails, URLs, IPv4, fechas ISO, slugs).
6. **Base64 y Assets:** Codificador/decodificador de texto UTF-8 seguro, conversor de imágenes por arrastrar y soltar a Data URI con vista previa y copia en formatos HTML `<img>` o CSS.
7. **Explicador de Expresiones Cron:** Traduce sintaxis cron de 5 campos a lenguaje natural (en español e inglés) y calcula las próximas 5 ejecuciones exactas.
8. **Inspector de Texto y Diff:** Comparador línea por línea entre texto original y modificado con resaltado visual de cambios, conteo de palabras, caracteres y tiempo de lectura.
9. **Color y Accesibilidad WCAG:** Selector de color y sincronización HEX/RGB/HSL. Calcula ratio de contraste con validación estricta de normas WCAG 2.1 (AA y AAA) y genera escalas de tonos.
10. **Inspector de URLs y Query Params:** Desglosa URLs en protocolo, host, ruta y hash. Permite editar parámetros de consulta en una tabla interactiva que reconstruye la URL en tiempo real.

### 🎯 Características Destacadas

- **Command Palette (`Ctrl + K` / `Cmd + K`):** Navega entre cualquier herramienta al instante con búsqueda rápida por teclado.
- **Modos Oscuro y Claro:** Interfaz visual moderna con persistencia en `localStorage`.
- **100% Privado y Offline:** Funciona sin conexión a internet y protege credenciales o tokens sensibles.
- **Sin compilación:** Código limpio en JavaScript vanilla moderno (ES Modules) y CSS nativo.

### 🚀 Demo en Vivo

Puedes usar la versión online desplegada en GitHub Pages: **[https://blademxgit.github.io/devforge/](https://blademxgit.github.io/devforge/)**

### 💻 Ejecutar en Local

```bash
# Clonar el repositorio
git clone https://github.com/BladeMXGit/devforge.git
cd devforge

# Ejecutar con Python
python -m http.server 8080

# O simplemente abre index.html directamente en cualquier navegador.
```

---

### 📄 License

Este proyecto está publicado bajo la licencia [MIT](LICENSE).
