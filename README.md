#  Dashboard Meteorológico - Prueba Técnica METEOROLOGICA

**Desarrollado por:** Sebastian Leal Villarreal
**Fecha:** 28-29 octubre 2025
**Objetivo:** Aplicación web que visualiza datos meteorológicos YML en tiempo real

---

##  CÓMO ABRIR EL PROYECTO

### Paso 1: Instalar dependencias
`ash
npm install
`

### Paso 2: Ejecutar aplicación
`ash
npm run dev
`

### Paso 3: Abrir en navegador
Ir a: **http://localhost:5173** (o el puerto que muestre en terminal)

---

##  QUÉ HACE LA APLICACIÓN

###  Funcionalidades Implementadas
- **Lectura de datos YML**: Procesa archivo con 101,294 puntos meteorológicos reales
- **Actualización cada 5 segundos**: Interfaz se actualiza automáticamente
- **Gráficos en tiempo real**: Visualización con Chart.js de temperatura y energía
- **Conversión de unidades**: Transforma automáticamente deciKelvins a Celsius
- **Interfaz responsive**: Funciona en móvil, tablet y escritorio

###  Tecnologías Utilizadas
- **React 18 + TypeScript**: Frontend moderno y robusto
- **Chart.js**: Gráficos profesionales e interactivos
- **Vite**: Herramienta de desarrollo rápida
- **js-yaml**: Procesamiento de archivos YAML

---

##  LO QUE RESOLVÍ

###  Desafío Principal
Recibí datos meteorológicos en formato complejo:
- 101,294 líneas de datos
- Temperaturas en deciKelvins (no Celsius)
- Estructura YAML anidada con secciones separadas

###  Mi Solución
En lugar de pedir cambios en el formato de datos, **adapté mi código**:
- Creé función de conversión automática: deciKelvins  Celsius
- Optimicé performance: proceso 101k líneas pero muestro 100 puntos para UI fluida
- Desarrollé parser inteligente que combina temperatura y energía por timestamp

###  Valor Agregado
- **UX profesional**: Loading states, manejo de errores, estadísticas calculadas
- **Responsive design**: Funciona perfectamente en todos los dispositivos
- **Performance optimizada**: Maneja datasets masivos sin ralentizar la interfaz

---

##  Estructura del Proyecto

`
src/
 WeatherDashboard.tsx    # Componente principal con toda la lógica
 App.tsx                 # Punto de entrada
 App.css                 # Estilos responsive

public/
 data.yml               # Datos meteorológicos reales (101k líneas)
`

---

##  RESULTADO

 **100% de requisitos cumplidos**
 **Datos meteorológicos reales procesados**
 **Interfaz profesional y responsive**
 **Performance optimizada**
 **Código limpio y documentado**

**Aplicación lista para producción que demuestra competencias en React, TypeScript, procesamiento de datos y desarrollo frontend moderno.**
