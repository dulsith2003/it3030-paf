# Smart Campus

Smart Campus is a Java Spring Boot backend with MongoDB connectivity checks and a simple web UI.

This workspace contains:

- `smartcampus/`: Spring Boot backend (Java 21, Maven Wrapper, MongoDB)
- `frontend/`: Optional standalone Vite frontend (proxies `/api` to backend)

## 1. Prerequisites

Install these tools before starting:

1. Java Development Kit (JDK) 21
2. Node.js 18+ (recommended: Node.js 20 LTS)
3. Internet access (for Maven/Node package downloads)
4. A running MongoDB instance
   - Local MongoDB (default host: `localhost:27017`) OR
   - MongoDB Atlas connection string

Optional (helpful):

- VS Code
- Git

## 2. Clone/Open Project

If you already have the project, skip to Step 3.

```bash
git clone https://github.com/dulsith2003/it3030-paf.git
cd "Smart Campus"
```

On Windows PowerShell, keep the quotes because the folder name has a space.

## 3. Configure Backend Environment

Backend config file:

- `smartcampus/src/main/resources/application.properties`

Current key config:

```properties
spring.application.name=smartcampus
spring.data.mongodb.uri=<your-mongodb-uri>
```

### Recommended MongoDB URI examples

Local MongoDB:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/smartcampus
```

MongoDB Atlas:

```properties
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

Important:

- Use your own database credentials.
- Do not commit real passwords to source control.

## 4. Run Backend (Spring Boot)

Open a terminal and run:

```powershell
cd "smartcampus"
.\mvnw.cmd spring-boot:run
```

Expected backend URL:

- `http://localhost:8080`

Health endpoint:

- `GET http://localhost:8080/api/health/mongodb`

Expected response shape:

```json
{
  "connected": true,
  "message": "MongoDB connected"
}
```

### If port 8080 is already in use

Either stop the conflicting process or change backend port in `application.properties`:

```properties
server.port=8081
```

If you change backend port, also update `frontend/vite.config.js` proxy target accordingly.

## 5. Run Frontend Option A (Integrated with Backend)

The backend already serves UI files from:

- `smartcampus/src/main/resources/static/`

So if backend is running, open:

- `http://localhost:8080`

This page calls `/api/health/mongodb` and shows MongoDB status.

## 6. Run Frontend Option B (Standalone Vite App)

Use this option for frontend development with hot reload.

In a new terminal:

```powershell
cd "frontend"
npm install
npm run dev
```

Expected frontend URL:

- `http://localhost:5173`

Vite proxy config forwards `/api` to backend:

- Target in `frontend/vite.config.js`: `http://localhost:8080`

If backend runs on a different port, update that target.

## 7. Build Commands

### Backend build

```powershell
cd "smartcampus"
.\mvnw.cmd clean package
```

### Backend tests

```powershell
cd "smartcampus"
.\mvnw.cmd test
```

### Frontend build

```powershell
cd "frontend"
npm run build
```

### Frontend preview

```powershell
cd "frontend"
npm run preview
```

## 8. Project Structure (Important Paths)

- `smartcampus/pom.xml`: Backend dependencies and plugins
- `smartcampus/src/main/java/com/example/smartcampus/SmartcampusApplication.java`: Spring Boot entry point
- `smartcampus/src/main/java/com/example/smartcampus/config/SecurityConfig.java`: Security config (all requests currently permitted)
- `smartcampus/src/main/java/com/example/smartcampus/controller/MongoHealthController.java`: MongoDB health endpoint
- `smartcampus/src/main/resources/application.properties`: Application settings
- `smartcampus/src/main/resources/static/`: Backend-served web UI
- `frontend/package.json`: Vite scripts and dependencies
- `frontend/vite.config.js`: Dev server and API proxy config

## 9. Troubleshooting

### 1) Backend startup fails with MongoDB connection errors

- Verify `spring.data.mongodb.uri` is valid.
- Confirm MongoDB service/cluster is running.
- Check firewall/network access for Atlas.

### 2) Backend startup fails due to port conflict

- Free port `8080`, or set `server.port=8081`.

### 3) Frontend shows "Backend unreachable"

- Ensure backend is running.
- Verify proxy target in `frontend/vite.config.js` matches backend port.
- Open browser devtools and check network errors for `/api/health/mongodb`.

### 4) Maven/Node command not found

- Reinstall JDK/Node.
- Restart terminal so PATH updates are applied.

## 10. Notes

- Backend currently excludes Spring AI MongoDB Atlas vector-store auto-configuration at startup to avoid requiring an `EmbeddingModel` bean for this project state.
- The project currently includes a MongoDB health endpoint and static UI status check.
