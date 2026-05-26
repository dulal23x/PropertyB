# LINUX_INSTALL_COMMANDS_CHEATSHEET

## 1. Base packages
```bash
sudo apt update
sudo apt install -y git curl wget unzip ca-certificates software-properties-common build-essential pkg-config python3 python3-venv python3-pip python3-dev libffi-dev libssl-dev sqlite3 libsqlite3-dev nginx certbot python3-certbot-nginx logrotate
```

## 2. Node 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

## 3. User + directories
```bash
sudo useradd -r -m -d /srv/propertybikri -s /bin/bash propertybikri || true
sudo mkdir -p /srv/propertybikri/releases /srv/propertybikri/shared/backend-venv /srv/propertybikri/shared/data/db /srv/propertybikri/shared/data/property-images /srv/propertybikri/shared/data/email-logs /etc/propertybikri
sudo chown -R propertybikri:propertybikri /srv/propertybikri /etc/propertybikri
```

## 4. Pull release
```bash
export RELEASE_ID=$(date +%Y%m%d-%H%M%S)
sudo -u propertybikri git clone --depth 1 <YOUR_REPO_URL> /srv/propertybikri/releases/$RELEASE_ID
sudo ln -sfn /srv/propertybikri/releases/$RELEASE_ID /srv/propertybikri/current
```

## 5. Backend install
```bash
cd /srv/propertybikri/current/app/backend
python3 -m venv /srv/propertybikri/shared/backend-venv
source /srv/propertybikri/shared/backend-venv/bin/activate
python -m pip install --upgrade pip wheel setuptools
pip install -r requirements-prod.lock.txt
pip check
```

## 6. Frontend install/build
```bash
cd /srv/propertybikri/current/nextjs-frontend
npm ci
npm run lint
npm run build
```

## 7. systemd reload/restart
```bash
sudo systemctl daemon-reload
sudo systemctl enable propertybikri-backend propertybikri-frontend
sudo systemctl restart propertybikri-backend propertybikri-frontend
sudo systemctl status propertybikri-backend propertybikri-frontend --no-pager
```

## 8. nginx + tls
```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d propertybikri.com -d www.propertybikri.com -d api.propertybikri.com
sudo systemctl status certbot.timer --no-pager
```

## 9. smoke checks
```bash
curl -I https://propertybikri.com
curl -I https://www.propertybikri.com
curl -sS https://api.propertybikri.com/health
curl -sS https://api.propertybikri.com/health/email
```

## 10. live logs
```bash
sudo journalctl -u propertybikri-backend -f
sudo journalctl -u propertybikri-frontend -f
sudo tail -f /var/log/nginx/error.log
```
