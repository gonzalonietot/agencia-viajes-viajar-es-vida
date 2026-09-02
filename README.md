# Viajar es Vida — Sitio Web Oficial

Sitio web oficial y catálogo dinámico de la agencia de viajes **Viajar es Vida** (Legajo Nº 21232 • Habilitados como Agencia de Viajes). Plataforma moderna de alta velocidad construida con **Astro 4**, con carga en tiempo real desde **Google Sheets** e integración directa con reservas vía **WhatsApp**.

---

## 🌟 Características Principales

- ⚡ **Rendimiento Ultrarrápido:** Desarrollado con [Astro](https://astro.build/) para una carga estática optimizada y componentes interactivos ligeros.
- 📊 **Gestión Dinámica con Google Sheets:**
  - Consulta en tiempo real de salidas y escapadas Full Day mediante Google Visualization API (GViz) con fallback a OpenSheet.
  - Soporte automático para imágenes alojadas en Google Drive (resolución y visualización directa mediante CDN).
  - Filtrado instantáneo por estado activo.
- 💬 **Integración con WhatsApp:** Generación automatizada de mensajes con información detallada de destino, fecha y tarifa al hacer clic en reservar.
- 📱 **Diseño 100% Responsivo:** Adaptado para móviles, tablets y ordenadores con diseño moderno y accesible.
- 🎨 **Categorías y Experiencias:** Navegación por categorías de viajes (Nacionales, Internacionales, Full Days, etc.).

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** [Astro 4](https://astro.build/)
- **Lenguaje:** TypeScript / JavaScript (ESModules)
- **Estilos:** CSS3 Moderno (Custom Properties, Flexbox, Grid)
- **Fuente de Datos:** Google Sheets API (vía GViz / JSON Endpoint)
- **Despliegue Recomendado:** Vercel / Netlify / Cloudflare Pages

---

## 📁 Estructura del Proyecto

```text
├── public/                # Archivos estáticos e imágenes públicas
├── src/
│   ├── components/        # Componentes reutilizables de UI
│   │   ├── CardFullDay.astro       # Tarjeta individual de viaje Full Day
│   │   └── LiveFullDaysGrid.astro  # Grilla dinámica de escapadas en vivo
│   ├── layouts/           # Layouts y plantillas base
│   │   └── Layout.astro            # Estructura principal, navbar y footer
│   ├── pages/             # Rutas y páginas del sitio
│   │   ├── categoria/
│   │   │   └── [categoria].astro   # Página dinámica por categoría
│   │   ├── experiencias.astro      # Catálogo de experiencias
│   │   └── index.astro             # Página de inicio
│   ├── services/          # Servicios y lógica de negocio
│   │   └── fullDayService.ts       # Integración con Google Sheets & WhatsApp
│   └── styles/            # Hojas de estilo globales
│       └── global.css
├── astro.config.mjs       # Configuración de Astro
├── package.json           # Dependencias y scripts
└── README.md
```

---

## 🚀 Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone https://github.com/gonzalonietot/agencia-viajes-viajar-es-vida.git
cd agencia-viajes-viajar-es-vida
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:4321`.

### 4. Compilar para producción
```bash
npm run build
```

Para previsualizar la compilación de producción:
```bash
npm run preview
```

---

## 📄 Licencia y Contacto

- **Agencia:** Viajar es Vida (Legajo Nº 21232)
- **WhatsApp:** [+54 9 3516 64-0325](https://wa.me/5493516640325)
- **Instagram:** [@viajaresvidacba](https://www.instagram.com/viajaresvidacba/)
- **Desarrollador:** [@gonzalonietot](https://github.com/gonzalonietot)
