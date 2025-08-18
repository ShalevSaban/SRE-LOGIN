# SRE Home Test – Mini System

This project demonstrates a full-stack system with **authentication, database integration, CDC streaming, and Kafka consumer**

## ✅ Mission Requirements Met
- **Frontend (HTML + Nginx):** Simple login page (email/password).
- **Backend (Node.js + Express):**
  - REST API with `/login`.
  - JWT authentication; tokens stored in DB.
  - JSON logging via **log4js**.
- **Database (TiDB):**
  - Schema + default user auto-loaded with `db/init.sql` and `db/init-db.sh`.
- **Message Queue (Kafka):**
  - Included in Docker Compose.
  - **TiCDC → Kafka** changefeed streams DB changes.
- **Consumer (Node.js + KafkaJS):**
  - Subscribes to Kafka topic.
  - Logs DB change events in JSON.

## 📂 Project Structure

```text
.
├── docker-compose.yml             # Orchestration for all services
│
├── db/                            # Database initialization
│   ├── init.sql                   # Schema + default user
│   └── init-db.sh                 # Applies schema on startup
│
├── server/                        # Backend API service (Node.js + Express)
│   ├── Dockerfile
│   ├── package.json
│   ├── app.js                     # Express routes (/login, /profile)
│   ├── auth.js                    # JWT handling
│   └── db.js                      # TiDB connection
│
├── consumer/                      # Kafka consumer service
│   ├── Dockerfile
│   ├── package.json
│   └── index.js                   # Subscribes to Kafka + logs events
│
└── client/                        # Frontend (Nginx + HTML)
    ├── Dockerfile
    ├── index.html                 # Simple login page
    └── nginx.conf                 # Nginx config
```


## ▶️ Run the System
From the project root:

with git bash : sh init.sh

This command **builds and starts everything**:
- TiDB (with PD/TiKV)
- TiCDC (streams DB changes)
- Kafka (broker)
- API (server)
- Consumer
- Client (Nginx + login page)

if everything is ok :

```text
[INIT] Bringing up all services...
[INIT] Waiting for PD to be healthy...
[INIT] PD is healthy.
[INIT] Waiting for TiDB to be healthy...
[INIT] TiDB is healthy.
[INIT] Waiting for TiCDC capture...
[INIT] TiCDC is ready.
[INIT] Ensuring Kafka topic 'cdc-events' exists...
[INIT] Ensuring TiCDC changefeed 'kafka' exists...
[INIT] creating changefeed...
Create changefeed successfully!
[INIT] Current changefeeds:
[
  {
    "id": "kafka",
    "namespace": "default",
    "summary": {
      "state": "normal",
      "error": null
    }
  }
]
[INIT] System ready!
  - API:      http://localhost:3000/health
  - Frontend: http://localhost:8088
  - Metrics:  http://localhost:3000/metrics , http://localhost:4001/metrics

  ```



## 🌐 Access
- **Client (login page):** http://localhost:8080
- **API (Node.js):** http://localhost:3000
  - `/login`, `/profile`
- **TiDB SQL:** available at `localhost:4000`

✅ With a single command, the system comes up ready with **DB + CDC + Kafka + API + Consumer + Client**.

**username and password to check**:
- username: shalev@gmail.com
- passoword: 123