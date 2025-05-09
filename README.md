# EliteState Manager 🏢

EliteState Manager es una aplicación web progresiva (PWA) diseñada para profesionales inmobiliarios que necesitan gestionar propiedades, citas y zonas de manera eficiente. Con una interfaz moderna y responsive, la aplicación permite mantener un control detallado de tu cartera inmobiliaria y agenda de actividades.

![EliteState Manager](/EliteState/public/icon.png)

## ✨ Características

### 📋 Gestión de Propiedades
- Catálogo completo de propiedades
- Detalles específicos de cada propiedad
- Estado de disponibilidad (venta/renta)

### 📍 Gestión de Zonas
- Organización de propiedades por zonas
- Estadísticas por zona

### 📅 Agenda y Calendario
- Calendario interactivo
- Programación de citas y visitas
- Recordatorios configurables
- Vista diaria, semanal y mensual
- Notificaciones de próximos eventos

### 📊 Estadísticas y Análisis
- Dashboard interactivo
- Métricas clave de negocio
- Gráficos de rendimiento
- Análisis de propiedades por zona

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React.js con Vite
- **Estilos**: Tailwind CSS
- **Backend**: Firebase
  - Authentication
  - Firestore
  - Storage
- **PWA**: Service Workers y Manifest
- **Notificaciones**: Web Push API
- **Gráficos**: Chart.js
- **Calendario**: FullCalendar

## 📁 Estructura del Proyecto

```
EliteState/
├── public/
│   ├── icon.png
│   ├── manifest.json
│   ├── index.html
│   ├── service-worker.js
│   └── sw.js
├── src/
│   ├── components/
│   │   ├── DetallePropiedad.jsx
│   │   ├── Layout.jsx
│   │   ├── PropiedadModal.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── Agenda.jsx
│   │   ├── Catalogo.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Estadisticas.jsx
│   │   ├── Login.jsx
│   │   ├── Perfil.jsx
│   │   ├── RecuperarContrasena.jsx
│   │   ├── Register.jsx
│   │   └── Zonas.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── firebase/
│   │   ├── authService.jsx
│   │   ├── config.js
│   │   ├── notificationsService.js
│   │   ├── storageService.js
│   │   └── zonasService.js
│   ├── routes/
│   │   ├── PrivateRoute.jsx
│   │   └── Router.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── .gitignore
├── index.html
├── postcss.config.mjs
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/EliteState-Manager.git
   cd EliteState-Manager
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Firebase**
   - Crear un proyecto en Firebase Console
   - Obtener las credenciales de configuración
   - Crear un archivo `.env` en la raíz del proyecto:
     ```env
     VITE_FIREBASE_API_KEY=tu-api-key
     VITE_FIREBASE_AUTH_DOMAIN=tu-auth-domain
     VITE_FIREBASE_PROJECT_ID=tu-project-id
     VITE_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
     VITE_FIREBASE_APP_ID=tu-app-id
     ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   ```

## 📱 Instalación como PWA

La aplicación puede instalarse como una PWA en dispositivos móviles y escritorio:

1. Abrir la aplicación en Chrome o navegador compatible
2. Hacer clic en el botón "Instalar" en la barra de direcciones
3. Seguir las instrucciones de instalación

## 🔒 Seguridad

- Autenticación segura mediante Firebase Auth
- Datos encriptados en tránsito y reposo
- Permisos basados en roles de usuario
- Backups automáticos de datos

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

Desarrollado con ❤️ para hacer la gestión inmobiliaria más eficiente.
