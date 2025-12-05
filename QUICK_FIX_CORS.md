# Fix Rápido para Error de CORS

## El Problema
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...'
has been blocked by CORS policy
```

## Solución Rápida (Ya implementada en el código)

He cambiado el método de subida de `uploadBytesResumable` a `uploadBytes` que no requiere configuración CORS adicional.

## Lo que aún necesitas hacer en Firebase Console

### 1. Actualizar Reglas de Storage (IMPORTANTE)

Ve a [Firebase Console](https://console.firebase.google.com/project/preparateuc-512cf/storage/preparateuc-512cf.firebasestorage.app/rules)

Reemplaza las reglas con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /preparaciones/{allPaths=**} {
      // Permitir todo temporalmente (SOLO para desarrollo)
      allow read, write: if true;
    }
  }
}
```

Click en **Publicar**

**O desde la terminal:**
```bash
# Asegúrate de tener Firebase CLI instalado
npm install -g firebase-tools

# Login
firebase login

# Desplegar reglas
firebase deploy --only storage
```

### 2. Verificar que funciona

1. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

2. Ve a `http://localhost:3000/crear-preparacion`
3. Intenta subir un archivo
4. Debería funcionar sin errores de CORS

## ¿Qué cambió en el código?

**Antes (con CORS issues):**
```typescript
const uploadTask = uploadBytesResumable(storageRef, file);
// Esto requiere configuración CORS compleja
```

**Después (sin CORS issues):**
```typescript
const snapshot = await uploadBytes(storageRef, file);
// Esto funciona sin configuración adicional
```

## Nota de Producción

Cuando implementes autenticación, cambia las reglas a:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /preparaciones/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### Si aún ves errores:

1. **Limpia caché del navegador** (Ctrl+Shift+Delete)
2. **Abre en ventana privada/incógnito**
3. **Verifica las reglas en Firebase Console** - deben estar publicadas
4. **Revisa la consola del navegador** para errores específicos
