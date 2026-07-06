# LOCAL_SETUP

## Target
Run the real estate MVP locally with isolated backend, frontend, database, and environment.

## Clone Step
Clone the reference repository only into the target workspace, then rename remote before implementation.

```powershell
git clone https://github.com/dulal23x/ClearlyHired.git C:\realestatesite\app
cd C:\realestatesite\app
git remote rename origin clearlyhired-origin
git checkout -b real-estate-mvp
```

## Backend
```powershell
cd C:\realestatesite\app\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8090
```

## Frontend
```powershell
cd C:\realestatesite\app\nextjs-frontend
npm install
npm run dev -- --port 3010
```

## Health Check
```powershell
Invoke-WebRequest http://127.0.0.1:8090/health
```

## Rule
Do not start feature work until backend, frontend, auth, admin, and email console mode are verified in the clone.

