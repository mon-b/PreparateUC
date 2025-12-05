# Configuración de Firebase Storage

## Error CORS

Si ves el siguiente error:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy
```

Necesitas configurar Firebase Storage correctamente.

## Pasos para Solucionar

### 1. Configurar Reglas de Storage

En la consola de Firebase:
1. Ve a **Storage** → **Rules**
2. Reemplaza las reglas existentes con el contenido del archivo `storage.rules`
3. Click en **Publicar**

O desde la terminal con Firebase CLI:
```bash
firebase deploy --only storage
```

### 2. Configurar CORS en el Bucket

**Opción A: Desde Google Cloud Console (Recomendado)**

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto: `preparateuc-512cf`
3. Ve a **Cloud Storage** → **Browser**
4. Encuentra tu bucket: `preparateuc-512cf.firebasestorage.app`
5. Click en **PERMISSIONS** (pestaña superior)
6. Click en **CORS configuration**
7. Agrega la siguiente configuración:

```json
[
  {
    "origin": ["http://localhost:3000", "http://localhost:3001"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

**Opción B: Desde la Terminal con gsutil**

Necesitas tener instalado `gcloud` CLI:

```bash
# Instalar gcloud (si no lo tienes)
# https://cloud.google.com/sdk/docs/install

# Autenticarte
gcloud auth login

# Configurar CORS
gsutil cors set cors.json gs://preparateuc-512cf.firebasestorage.app
```

### 3. Verificar la Configuración

Después de aplicar los cambios:

```bash
# Verificar reglas CORS
gsutil cors get gs://preparateuc-512cf.firebasestorage.app
```

### 4. Reiniciar el Servidor de Desarrollo

```bash
# Detener el servidor (Ctrl+C)
# Iniciar nuevamente
npm run dev
```

## Alternativa Temporal: Usar uploadBytes en vez de uploadBytesResumable

Si no puedes configurar CORS inmediatamente, puedes modificar temporalmente el servicio de Storage:

```typescript
// En src/services/storage.service.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

static async uploadFile(file: File, folder: string): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);

  // Subida simple sin tracking de progreso
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}
```

## Reglas de Producción

Una vez que implementes autenticación, actualiza las reglas a:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /preparaciones/{userId}/{allPaths=**} {
      // Solo el usuario puede leer/escribir sus propios archivos
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### Error: "Firebase Storage: User does not have permission"
- Verifica que las reglas de Storage estén publicadas
- Verifica que el bucket sea el correcto

### Error: "CORS policy error" persiste
- Limpia cache del navegador (Ctrl+Shift+Delete)
- Abre en ventana privada/incógnito
- Verifica que la configuración CORS esté aplicada con `gsutil cors get`

### Error: "gsutil command not found"
- Instala Google Cloud SDK: https://cloud.google.com/sdk/docs/install
- O usa la opción A (Google Cloud Console)
