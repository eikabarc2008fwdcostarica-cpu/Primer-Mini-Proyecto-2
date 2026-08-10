# Gorilla Logic — Sistema Administrativo Web

Gorilla Logic es una aplicación web administrativa de una empresa tecnológica. Permite autenticar administradores y gestionar clientes, productos y proveedores desde una interfaz oscura, responsiva y conectada. Los datos ingresados se reflejan automáticamente en el Dashboard General.

## Características principales

- Inicio y cierre de sesión con persistencia en `localStorage`.
- Creación de nuevos administradores con validaciones de formulario.
- Administración CRUD de clientes, productos y proveedores.
- KPIs dinámicos en el Dashboard General.
- Diseño responsivo con modo oscuro y estética tecnológica.
- Persistencia local: los datos se conservan aunque se recargue la página en el mismo navegador.

## Tecnologías utilizadas

- HTML5
- CSS3 con variables CSS y diseño responsivo
- JavaScript ES6+
- Web Storage API (`localStorage`)
- Google Fonts: Inter y Space Grotesk

## Estructura del proyecto

```text
outputs/
├── login.html         # Pantalla de autenticación
├── login.css          # Estilos del login
├── login.js           # Lógica de acceso y sesión
├── dashboard.html     # Panel administrativo
├── dashboard.css      # Estilos del dashboard y módulos
├── dashboard.js       # CRUD, estadísticas y navegación
└── README.md          # Documentación del proyecto
```

## Instalación y ejecución

No requiere dependencias, compilación ni base de datos.

1. Descarga o copia todos los archivos en la misma carpeta.
2. Abre `login.html` en un navegador web moderno.
3. Inicia sesión y utiliza el sistema.

Para una experiencia más cercana a producción, puede abrirse la carpeta con una extensión de servidor local, por ejemplo **Live Server** en Visual Studio Code.

## Inicio de sesión

El proyecto incluye un administrador inicial:

| Campo | Valor |
| --- | --- |
| Correo | `admin@tech.com` |
| Contraseña | `admin123` |
| Nombre mostrado | Rick Sánchez |

Al iniciar sesión se crea una sesión en `localStorage`. El botón **Cerrar sesión** elimina la sesión actual y devuelve al login.

## Navegación por el Dashboard

El menú lateral permite acceder a las siguientes vistas:

- **Dashboard General:** muestra indicadores calculados desde la información registrada en los módulos.
- **Administración de Clientes:** permite registrar y administrar clientes.
- **Administración de Productos:** permite controlar productos, stock y unidades vendidas.
- **Administración de Proveedores:** permite registrar proveedores, pedidos pendientes y nivel de entregas a tiempo.
- **Crear nuevo admin:** registra un nuevo administrador con acceso al sistema.

En pantallas pequeñas, el botón de menú del encabezado abre y cierra la barra lateral.

## Funciones CRUD

Los módulos de Clientes, Productos y Proveedores disponen de un formulario y una tabla.

1. Completa el formulario y selecciona **Agregar registro**.
2. El registro se visualizará inmediatamente en la tabla.
3. Usa **Editar** para modificar sus datos.
4. Usa **Eliminar** para eliminarlo.

Cada modificación se guarda inmediatamente en `localStorage` y actualiza los KPIs del Dashboard General.

### Indicadores calculados

| Módulo | Indicadores en Dashboard |
| --- | --- |
| Clientes | Total, clientes activos y nuevos del mes |
| Productos | Stock total, productos con menos de 10 unidades y producto más vendido |
| Proveedores | Total registrado, pedidos pendientes y promedio de entregas a tiempo |

## Crear un nuevo administrador

Desde el menú lateral, selecciona **Crear nuevo admin**. El formulario aplica estas reglas:

- **Nombre completo:** únicamente letras, caracteres acentuados y espacios; no se admiten números.
- **Correo electrónico:** debe utilizar el dominio `@gmail.com`.
- **Contraseña:** debe contener exactamente 6 dígitos numéricos.
- **Correo único:** no es posible registrar dos administradores con el mismo correo.

Una vez creado, el nuevo administrador puede cerrar sesión e ingresar con las nuevas credenciales.

## Almacenamiento local

Los datos se guardan en el navegador bajo estas claves:

```text
gorillaLogicSession
gorillaLogicUsers
gorillaLogicClients
gorillaLogicProducts
gorillaLogicProviders
```

Para reiniciar completamente la demostración, elimina estas claves desde las herramientas de desarrollador del navegador, en **Application/Storage → Local Storage**.

## Consideraciones

Esta versión está diseñada como demostración frontend. Las contraseñas se almacenan en texto plano dentro del navegador, por lo que no debe utilizarse como mecanismo de autenticación para producción. En un entorno real, se debe integrar una API segura, autenticación en servidor, contraseñas cifradas y una base de datos.
