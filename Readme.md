# 🩹 Negative Pressure Wound Therapy (NPWT) System

A complete **Negative Pressure Wound Therapy (NPWT)** solution — consisting of a **React frontend** and a **Spring Boot backend** — for controlling, monitoring, and logging wound therapy device data over Bluetooth (ESP32).

---

## 🧩 Project Overview

This project provides:

- A **frontend control dashboard** built in React with Tailwind CSS.
- A **backend service** built in Spring Boot that connects to an ESP32 device via a serial (Bluetooth) interface.
- Real-time device monitoring and data logging.
- Full REST API support for control commands, data retrieval, and device status.

---

## 📁 Repository Structure

```
NPWT/
├── frontend/        # React UI for device control and monitoring
│   ├── src/
│   ├── public/
│   └── README.md
│
├── backend/         # Spring Boot API for ESP32 communication and data storage
│   ├── src/
│   ├── pom.xml
│   └── README.md
│
└── docs/            # Optional screenshots, diagrams, or setup guides
```

---

## ⚙️ Features

### 🖥️ Frontend (React + Tailwind)

- Start, pause, resume, or stop NPWT therapy.
- Continuous and cyclic modes supported.
- Live status panel with formatted metrics (pressure, mode, status, etc.).
- Logs panel to record user actions and backend errors.
- Light/Dark theme toggle with localStorage persistence.
- Responsive layout for desktop and tablet.

### ⚡ Backend (Spring Boot + Serial Communication)

- Reads JSON data from ESP32 over serial (Bluetooth COM port).
- Persists readings to `npwt_data.json` (or optional MySQL database).
- Exposes REST endpoints for:
  - Sending commands (`/api/bluetooth/send`)
  - Reading latest or all data (`/api/data/latest`, `/api/data/all`)
  - Device control and monitoring (`/api/device/...`)
- Fully CORS-enabled for frontend communication.

---

## 🚀 Quick Start

### 1️⃣ Backend Setup

#### **Prerequisites**

- Java 21+
- Maven
- ESP32 device connected to PC via serial (e.g., `COM3`)

#### **Steps**

```bash
cd backend
mvn -DskipTests package
java -jar target/npwt-0.0.1-SNAPSHOT.jar
```

#### **Configure Serial Port**

Open `BluetoothService.java` and set your port:

```java
String portName = "COM3"; // Replace with your device port
```

The backend runs by default on **http://localhost:8080**

---

### 2️⃣ Frontend Setup

#### **Prerequisites**

- Node.js >= 14
- Backend running and reachable (default: http://localhost:8080)

#### **Steps**

```bash
cd frontend
npm install
npm start
```

- Access UI at: **http://localhost:3000**
- API base (default): `http://localhost:8080/api/device`
  - To change, update `src/api/npwtApi.js` or use environment variables.

#### **Build for Production**

```bash
npm run build
```

---

## 📡 API Reference

### Command Endpoints

| Method | Endpoint              | Description                 |
| ------ | --------------------- | --------------------------- |
| POST   | `/api/device/command` | Send command to NPWT device |
| GET    | `/api/device/status`  | Get latest device status    |

### Command Payload Examples

#### Start Continuous Therapy

```json
{ "command": "start", "mode": "continuous", "setPressure": 100, "duration": 10 }
```

#### Start Cyclic Therapy

```json
{
  "command": "start",
  "mode": "cycle",
  "setPressure": 120,
  "duration": 20,
  "onTime": 5,
  "offTime": 3
}
```

#### Pause / Resume / Stop

```json
{ "command": "pause" }
{ "command": "resume" }
{ "command": "stop" }
```

#### Request Status

```json
{ "command": "status" }
```

---

## 🧠 UI Overview

| Section        | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| **Sidebar**    | Control panel for pressure, duration, mode, and therapy actions |
| **Main Area**  | Live device status (pressure, mode, status)                     |
| **Logs Panel** | Displays recent commands and error messages                     |
| **Header**     | Theme toggle (Light/Dark) and title bar                         |

---

## 🖼️ Screenshots

Add screenshots to `public/images/` or `docs/images/`:

```bash
mkdir -p public/images
```

Example:

- Light Mode  
  ![NPWT - Light mode](frontend/public/images/npwt-light.png)

- Dark Mode  
  ![NPWT - Dark mode](frontend/public/images/npwt-dark.png)

Recommended sizes:

- **Hero images:** 1200×700px
- **Detail shots:** 800×450px

---

## 🧰 Development Notes

**Frontend**

- Components: `src/components`
- Pages: `src/pages`
- API helpers: `src/api/npwtApi.js`
- Styles: `src/styles/App.css`

**Backend**

- Services: `com.gourav.npwt.service`
- Controllers: `com.gourav.npwt.controller`
- Repositories: `com.gourav.npwt.repo`

---

## 🌈 Tailwind CSS Setup (Optional)

If Tailwind is not already active:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Ensure `src/styles/App.css` includes:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Restart dev server:

```bash
npm start
```

---

## 🧩 Optional Enhancements

- `.env` support for backend URL and port.
- Example backend stubs for local testing.
- `CONTRIBUTING.md` and `CHANGELOG.md` files for team collaboration.

---

## 🧾 Troubleshooting

| Issue                                                    | Solution                                         |
| -------------------------------------------------------- | ------------------------------------------------ |
| `fatal: 'origin' does not appear to be a git repository` | Add remote: `git remote add origin <repo-url>`   |
| “Failed to open port”                                    | Check COM port availability and ESP32 connection |
| No JSON logs                                             | Ensure ESP32 sends newline-separated JSON        |
| Frontend 404s                                            | Confirm correct API URL and running backend      |

---

## 🪪 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute with attribution.
