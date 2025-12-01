# Configuración del proyecto

## Backend

### Creación de entorno virtual he instalación de dependencias

```bash
cd Libreria-Back-End
#Crear entorno
python -m venv venv
#Activar Entorno
venv\Scripts\activate.bat

#   MAC
    python3 -m venv .venv
#   Windows
    .\.venv\Scripts\activate.bat # CMD
    .\.venv\Scripts\activate    # Powershell

source venv/bin/activate
pip install -r requirements.txt

#   Encender Entorno Virtual (BACKEND)
uvicorn main:app --reload 
#Si estás en Windows y tu Uvicorn está en .exe, entonces:
uvicorn.exe main:app --reload 


```

## Frontend

### Ejecución de la app

**Requerimientos**:

> Debes tener instalado Node.js y NPM

```bash
pnpm install -g browser-sync # o npm i -g browser-sync
```

**Ejecución**:

```bash
cd Libreria-Front-End
browser-sync start --server --port 5500 --files "**/*"
```
