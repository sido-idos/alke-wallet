# Alke Wallet — Prototipo

Proyecto educativo: prototipo de una wallet para la Evaluación Integradora.

Estructura principal:
- `index.html` - portada / entrada
- `login.html` - pantalla de login (validación básica)
- `menu.html` - menú principal con resumen
- `deposit.html` - realizar depósitos
- `sendmoney.html` - enviar dinero (autocompletar contactos)
- `transactions.html` - últimos movimientos
- `assets/css/style.css` - estilos base
- `assets/js/app.js` - lógica (validaciones, balance, transacciones)

Requisitos:
- Solo JavaScript para la lógica (jQuery usado cuando aplica)
- `app.js` está en `assets/js/app.js`
- Bootstrap y jQuery cargados por CDN

Cómo probar localmente:
1. Abrir `index.html` en el navegador (no requiere servidor para demo simple).
2. Iniciar sesión con credenciales de prueba: `user@alke.com` / `password123`.
3. Probar depósitos, envíos y ver movimientos.

Notas sobre persistencia:
- Datos (saldo, transacciones, contactos) se guardan en `localStorage` del navegador.

Logo PNG:
 - El proyecto busca `assets/img/logo.png` para mostrar el logotipo.
 - He incluido un placeholder codificado en base64 en `assets/img/logo.png.base64`.

 Después de ejecutar ese comando tendrás `assets/img/logo.png` y las páginas mostrarán el logotipo.
Also lateral logo:
- He añadido un placeholder base64 para `assets/img/logo_lateral.png` en `assets/img/logo_lateral.png.base64`.

Las páginas con navbar usan ahora `assets/img/logo_lateral.png`.

Siguientes pasos recomendados:
- Inicializar repositorio en GitHub `github.com/usuario/alke-wallet`.
- Crear ramas `feature/login`, `feature/transacciones`, `feature/depositos`.
- Añadir tests y mejorar seguridad de login (actualmente simulado).
