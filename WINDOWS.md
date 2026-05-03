# Run Task Manager SaaS on Windows

This guide uses Windows 10/11 + PowerShell.

## 1) Prerequisites

Install:

- Git for Windows
- CMake `>= 3.20`
- Visual Studio 2022 Build Tools (or Visual Studio 2022) with `Desktop development with C++`
- Node.js `>= 20` (npm included)
- vcpkg (recommended for SQLite3 library)

## 2) Clone and open repo

```powershell
git clone <your-repo-url>
cd OODP_Project
```

## 3) Install SQLite3 via vcpkg (recommended)

```powershell
git clone https://github.com/microsoft/vcpkg C:\dev\vcpkg
C:\dev\vcpkg\bootstrap-vcpkg.bat
C:\dev\vcpkg\vcpkg.exe install sqlite3:x64-windows
```

## 4) Configure + build backend

From repo root:

```powershell
cd backend
cmake -S . -B build -G "Visual Studio 17 2022" -A x64 -DCMAKE_TOOLCHAIN_FILE=C:/dev/vcpkg/scripts/buildsystems/vcpkg.cmake
cmake --build build --config Debug
```

`Crow`, `asio`, and `nlohmann/json` are fetched by CMake during configure.

## 5) Run backend

Keep terminal in `backend/` so DB path is predictable (`backend\tasks.db`):

```powershell
.\build\Debug\task_server.exe
```

Backend listens on `http://localhost:8080`.

## 6) Install and run frontend

Open second PowerShell terminal:

```powershell
cd <path-to>\OODP_Project\frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## 7) Run tests

Backend tests:

```powershell
cd <path-to>\OODP_Project\backend
ctest --test-dir build -C Debug --output-on-failure
```

HTTP smoke script (requires Git Bash, backend already running):

```bash
cd backend
./smoke.sh
```

## Common Windows issues

### CMake error: cannot find `sqlite3`

Usually missing vcpkg toolchain path. Re-run configure with:

```powershell
cmake -S . -B build -G "Visual Studio 17 2022" -A x64 -DCMAKE_TOOLCHAIN_FILE=C:/dev/vcpkg/scripts/buildsystems/vcpkg.cmake
```

### Port already in use

Check process using port:

```powershell
netstat -ano | findstr :8080
netstat -ano | findstr :3000
```

### FetchContent download fails

Backend configure needs internet access to GitHub for:

- Crow
- standalone Asio
- nlohmann/json

Fix network/proxy/firewall and rerun CMake configure.
