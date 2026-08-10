# LOCAL_SETUP

## Target
Run the real estate MVP locally with isolated backend, frontend, database, and environment.

## Clone Step
Clone the PropertyBikri repository into the target workspace.

```powershell
git clone https://github.com/dulal23x/RealEstate.git C:\realestatesite\app
cd C:\realestatesite\app
```

## Backend
```powershell
cd C:\realestatesite\app\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8090
```

## Frontend
```powershell
cd C:\realestatesite\app\nextjs-frontend
npm ci
npm run dev -- --port 3010
```

## Runtime Data
The current production DB is tracked at `backend\realestate_mvp_v1.db` for migration convenience.
Runtime property images are shipped as `migration\propertybikri-runtime-assets-20260810.tar.gz`.
Extract that archive into `backend\userdata` when a local install needs the same listing images as production.

## Health Check
```powershell
Invoke-WebRequest http://127.0.0.1:8090/health
```

## Rule
Do not start feature work until backend, frontend, auth, admin, and email console mode are verified in the clone.
