# El insomnio de Gretel

Blog editorial estático, responsive y listo para GitHub Pages. Está construido con **Eleventy (11ty)**, Nunjucks y Markdown, sin CMS ni base de datos.

La estructura está preparada para que publicar nuevas entradas sea un flujo de contenido: crear el Markdown en la categoría correcta, guardar sus imágenes en `content/images/<slug>/` y hacer `push`.

## Requisitos

- Node.js 20 o superior (recomendado: Node 22).
- npm.
- Una cuenta de GitHub para desplegar en GitHub Pages.

## Instalación local

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

Eleventy iniciará un servidor local y regenerará el sitio al modificar contenido, plantillas, CSS o SVG.

## Compilación de producción

```bash
npm run build
```

El sitio generado se guarda en `_site/`.

## Crear una nueva entrada

1. Crea un archivo `.md` dentro de la carpeta de categoría adecuada.
2. Crea una carpeta con el slug dentro de `content/images/`.
3. Añade `cover.svg`, `cover.jpg` o `cover.webp`.
4. Referencia la portada en el front matter.
5. Haz push a `main`.

No escribas la categoría en el front matter: Eleventy la detecta automáticamente a partir de la carpeta donde colocas el Markdown.

Ejemplo: `content/isla-perdida/mi-cronica.md` se publicará en:

```text
/isla-perdida/mi-cronica/
```

### Front matter mínimo recomendado

```md
---
title: "Título de la entrada"
subtitle: "Opcional: una línea de contexto"
date: 2026-06-27
author: "Nombre de autora o autor"
series: "Opcional"
cover: "/images/mi-cronica/cover.svg"
cover_alt: "Descripción accesible de la imagen de portada"
featured: false
draft: false
description: "Resumen breve que aparecerá en resultados y redes."
---

Aquí empieza el contenido del artículo.
```

Puedes usar Markdown normal: negritas, cursivas, enlaces, citas, encabezados, listas, imágenes y separadores. Para una imagen dentro del texto:

```md
![Descripción accesible](/images/mi-cronica/imagen-1.svg)
```

### Categorías disponibles

- `mundos-paralelos`
- `sueltos-y-sin-vacunar`
- `isla-perdida`
- `letras-y-mas-letras`
- `cuba-multicolor`
- `el-sueno-de-gretel`
- `voces-del-insomnio`

`draft: true` evita que una entrada se compile, aparezca en listados, RSS y sitemap.

## Añadir imágenes

Coloca los recursos de cada artículo dentro de su carpeta de slug:

```text
content/images/mi-cronica/
├── cover.webp
├── imagen-1.webp
└── imagen-2.svg
```

Después referencia las rutas con `/images/mi-cronica/...`. Eleventy las copia automáticamente al sitio publicado.

## Cambiar los datos del blog

Edita `src/_data/site.js` para modificar de forma centralizada:

- título, subtítulo y descripción;
- autoría;
- URL pública y `pathPrefix`;
- enlaces sociales;
- navegación principal.

Las categorías y sus descripciones están en `src/_data/categories.js`. Las series iniciales se controlan desde `src/_data/seriesList.js`.

## Configurar `pathPrefix`

GitHub Pages puede servir el blog desde un repositorio o un dominio propio. Configura ambos valores en `src/_data/site.js` antes del primer despliegue.

### Repositorio de proyecto

Para una URL como `https://TU-USUARIO.github.io/TU-REPOSITORIO/`:

```js
url: "https://TU-USUARIO.github.io",
pathPrefix: "/TU-REPOSITORIO/",
```

### Dominio propio o repositorio `TU-USUARIO.github.io`

Para una URL como `https://elinsomniodegretel.com/`:

```js
url: "https://elinsomniodegretel.com",
pathPrefix: "/",
```

El archivo `robots.txt` se genera automáticamente desde la configuración central y apunta al sitemap correcto.

## Despliegue en GitHub Pages

El workflow `.github/workflows/deploy.yml` utiliza las acciones oficiales de GitHub Pages y se ejecuta al hacer push a `main`.

1. Crea un repositorio vacío en GitHub.
2. Ajusta `url` y `pathPrefix` en `src/_data/site.js`.
3. Ejecuta exactamente estos comandos iniciales:

```bash
git init
git add .
git commit -m "Initial blog"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

4. En GitHub, abre **Settings → Pages** y selecciona **GitHub Actions** como fuente de despliegue.
5. Espera a que el workflow termine; GitHub mostrará la URL pública en la pestaña **Actions** o **Pages**.

Para publicar una nueva entrada solo debes crear el Markdown, subir las imágenes necesarias y ejecutar:

```bash
git add .
git commit -m "Nueva entrada"
git push
```

## Estructura principal

```text
content/                 # Entradas Markdown e imágenes
src/_data/               # Configuración editorial centralizada
src/_includes/           # Layouts, header, footer y tarjetas
src/category-pages/      # Páginas automáticas de categoría
src/series-pages/        # Páginas automáticas de serie
src/assets/              # CSS, JavaScript y logo SVG
.github/workflows/       # Deploy automático a GitHub Pages
```

## Verificación

Antes de publicar, ejecuta:

```bash
npm run build
```

Si termina sin errores, el contenido, las rutas, el RSS y el sitemap se generarán en `_site/`.
