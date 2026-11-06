# MDG — Modern Digital Governance Society Management System

> **Green Valley Residency, Bengaluru, Karnataka**  
> **Tagline:** *Better Living Together*  
> Complete Society Management System with Role-Based Access Control for **Admin**, **Resident**, and **Security Staff**.

---

## 📋 Table of Contents
1. [Overview & Architecture](#-overview--architecture)
2. [Project Files & Directory Structure](#-project-files--directory-structure)
3. [Windows & Visual Studio Code Setup Guide](#-windows--visual-studio-code-setup-guide)
4. [Connecting to Your Existing MySQL Database (Zero Data Loss)](#-connecting-to-your-existing-mysql-database-zero-data-loss)
5. [Running the Application (Mode A: Python Flask Backend)](#-running-the-application-mode-a-python-flask-backend)
6. [Running the Application (Mode B: React + Vite Frontend)](#-running-the-application-mode-b-react--vite-frontend)
7. [Default Demo Accounts & Roles](#-default-demo-accounts--roles)
8. [Comprehensive Feature Verification Checklist](#-comprehensive-feature-verification-checklist)
9. [Troubleshooting & Windows Tips](#-troubleshooting--windows-tips)

---

## 🏛 Overview & Architecture
MDG (Modern Digital Governance) is a full-featured residential society management system designed for Indian residential societies (specifically **Green Valley Residency, Bengaluru**).

### Technology Stack:
- **Backend:** Python Flask 3.0+ (with Werkzeug password hashing, session-based RBAC)
- **Database:** MySQL 8.0 (`mdg_society_management_db`) with transactional integrity
- **Frontend Options:**
  - **Embedded Flask Templates:** HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js, Bootstrap Icons
  - **Interactive SPA:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Security:** Strict role separation (ADMIN, RESIDENT, SECURITY), encrypted passwords, CSRF protection, and audit logs.

---

## 📂 Project Files & Directory Structure
```
MDG_Society_Management_System/
├── app.py                      # Complete Python Flask application (All routes, views, RBAC)
├── schema.sql                  # MySQL 8.0 DDL & seed data (All 48 flats, Wings A, B, C)
├── requirements.txt            # Python dependencies (Flask, mysql-connector, etc.)
├── package.json                # Frontend Node.js dependencies (React, Vite, Tailwind)
├── vite.config.ts              # Vite bundler configuration
├── tsconfig.json               # TypeScript configuration
├── index.html                  # HTML5 entry point for modern React UI
├── .env.example                # General environment template
├── local_mysql.env.example     # Windows local MySQL configuration template
├── test_app.py                 # Automated testing script for database & routes
├── README.md                   # This comprehensive documentation
├── public/                     # Static assets (MDG Logo SVG, downloadable files)
│   └── mdg-logo.svg            # Official MDG Apartment + Eco Leaf Logo
└── src/                        # Complete modern React/TypeScript source code
    ├── components/
    │   ├── common/             # MDGLogo, StatusBadge, etc.
    │   ├── dashboard/          # AdminDashboard, ResidentDashboard, SecurityDashboard
    │   ├── landing/            # LandingPage with college evaluation demo launchers
    │   ├── layout/             # Navbar, Sidebar, Footer
    │   └── modules/            # FlatsManagement, MaintenanceBilling, Visitors, etc.
    ├── context/                # SocietyContext (Full state, transactions, purchases)
    ├── data/                   # 48 flats initial dataset across Wings A, B, C
    ├── types/                  # TypeScript interface contracts
    └── utils/                  # Helper utilities and ZIP export
```

---

## 🖥 Windows & Visual Studio Code Setup Guide

### Step 1: Install Prerequisites on Windows
1. **Python 3.10+**:
   - Download installer from [python.org](https://www.python.org/downloads/windows/).
   - ⚠️ **CRITICAL:** Check the box that says **"Add python.exe to PATH"** before clicking Install.
2. **MySQL Server 8.0** or **XAMPP**:
   - Download MySQL Community Installer from [mysql.com](https://dev.mysql.com/downloads/installer/) OR install XAMPP with MySQL.
   - Ensure the MySQL service is running in Windows Services (`services.msc` -> `MySQL80` -> Status: Running).
3. **Visual Studio Code**:
   - Download and install VS Code from [code.visualstudio.com](https://code.visualstudio.com/).
   - Recommended extensions in VS Code:
     - **Python** (by Microsoft)
     - **MySQL** or **Database Client**

---

### Step 2: Open Project in VS Code
1. Extract the downloaded `MDG_Society_Management_System.zip` into a clean folder, e.g.:
   `C:\Projects\MDG_Society_Management_System`
2. Open Visual Studio Code.
3. Click **File → Open Folder...** and select `C:\Projects\MDG_Society_Management_System`.
4. Open the integrated terminal (`Ctrl + ~` or **Terminal → New Terminal**).

---

### Step 3: Create & Activate Python Virtual Environment
In your VS Code terminal (PowerShell or Command Prompt):
```powershell
# Create a virtual environment named 'venv'
python -m venv venv

# Activate on Windows PowerShell:
.\venv\Scripts\Activate.ps1

# (If PowerShell gives an execution policy error, run once:
#  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser)

# Or activate on Windows Command Prompt (CMD):
venv\Scripts\activate.bat
```
*(You will see `(venv)` appear at the start of your terminal prompt).*

---

### Step 4: Install Python Dependencies
With `(venv)` active:
```powershell
pip install -r requirements.txt
```
Dependencies installed:
- `Flask>=3.0.0`
- `mysql-connector-python>=8.3.0`
- `Werkzeug>=3.0.0`
- `python-dotenv>=1.0.0`
- `qrcode>=7.4.0`
- `Pillow>=10.0.0`

---

## 🗄 Connecting to Your Existing MySQL Database (Zero Data Loss)

### ⚠️ IMPORTANT: Safe Database Connection & No Data Reset
If you already have the `mdg_society_management_db` database on your local MySQL with existing data:
- **DO NOT** drop your database!
- `schema.sql` is carefully written using `CREATE TABLE IF NOT EXISTS` and `ON DUPLICATE KEY UPDATE`.
- Running `schema.sql` will **only create any missing tables** and will **never delete or overwrite** your existing 48 flats, owners, or resident records.

### Configuring Database Credentials:
1. In the project root, copy `local_mysql.env.example` to `.env`:
   ```powershell
   copy local_mysql.env.example .env
   ```
2. Open `.env` in VS Code and fill in your MySQL credentials:
   ```ini
   # Database Configuration (MySQL 8.0)
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password_here
   DB_NAME=mdg_society_management_db

   # Flask Security & Session
   SECRET_KEY=mdg_secure_session_key_2025_society_secret
   FLASK_DEBUG=1
   FLASK_RUN_PORT=5000
   ```

### (Only if Database does not exist yet) Import Schema:
If you need to initialize the database for the first time:
```powershell
# In Windows PowerShell / CMD:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mdg_society_management_db CHARACTER SET utf8mb4;"
mysql -u root -p mdg_society_management_db < schema.sql
```

---

## 🚀 Running the Application (Mode A: Python Flask Backend)

In VS Code terminal with `(venv)` active:
```powershell
python app.py
```
Output:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```
Open your browser to:
👉 **`http://127.0.0.1:5000`**

### Running Backend Unit & Route Tests:
To verify that all routes and database connectivity work properly:
```powershell
python test_app.py
```

---

## ⚡ Running the Application (Mode B: React + Vite Frontend)

If you wish to run the interactive React SPA with Tailwind CSS:
1. Ensure Node.js 18+ is installed (`node -v`).
2. In VS Code terminal:
   ```powershell
   npm install
   npm run dev
   ```
3. Open your browser to:
   👉 **`http://localhost:3000`**

---

## 🔑 Default Demo Accounts & Roles

| Role | Username | Password | Flat / Wing Assignment | Permissions & Access Scope |
|---|---|---|---|---|
| **Administrator** | `admin` | `admin123` | Management Office | Full society governance, 48 flats directory, billing, flat purchase, expense ledger, documents, and reports. |
| **Resident (Owner)** | `rahul_sharma` | `admin123` | Flat A-101 (Wing A) | Personal flat records, maintenance bills, payment history, facility booking, complaints, gym pass, and voting. |
| **Resident (Tenant)** | `sneha_patel` | `admin123` | Flat B-203 (Wing B) | Flat B-203 tenant records, bills, parking slot P-B203, parcel alerts, and community notices. |
| **Security Staff** | `security_head`| `admin123` | Main Gate 1 | Visitor registration, QR pass validation, check-in/out, parcel intake logging, and gate activity logs. |

---

## 🎯 Comprehensive Feature Verification Checklist
For your college viva and live demonstration:

1. **MDG Official Logo:** Displayed prominently on landing page, navbar, dashboards, receipts, and reports.
2. **All 48 Flats Directory:** Wings A, B, and C (16 flats per wing, 4 floors, 4 flats/floor) with BHK, sq ft, occupancy status, and current owner.
3. **Live Flat Purchase Demonstration:**
   - Go to All Flats Directory → click **"New Buyer Purchase"** (or click **"Purchase Flat"** on any Vacant flat).
   - Enter Buyer Name, Phone (10 digits), Email, Emergency Contact, and Agreement Number.
   - Click **"Complete Purchase & Generate Deed"**.
   - Watch the flat status instantly update to **"Owner-Occupied"**, owner name updated, transaction saved to MySQL `ownership_history`, and an official printable Allotment Certificate generated!
4. **Role-Based Isolation:**
   - Log in as `rahul_sharma` (Resident) → see only Flat A-101 data.
   - Attempting to access admin routes displays an access restriction warning.
   - Log in as `security_head` (Security) → restricted to Gate 1 visitor and parcel operations.
5. **Maintenance & Financial Ledger:**
   - View monthly maintenance calculations per flat.
   - Generate official printable payment receipts.
   - Export society ledger to real CSV.
6. **QR Visitor Passes:**
   - Expected visitor pre-authorization generates verifiable QR code.
   - Security gate scanner validates QR code against database.
7. **Facility & Gym Booking:**
   - Booking engine prevents double-booking for the Clubhouse and Swimming Pool.

---

## 💡 Troubleshooting & Windows Tips

- **Issue:** `mysql.connector.errors.ProgrammingError: 1045: Access denied for user 'root'@'localhost'`
  - **Fix:** Update your `DB_PASSWORD` in `.env` to match your local MySQL root password.
- **Issue:** `mysql.connector.errors.DatabaseError: 1049: Unknown database 'mdg_society_management_db'`
  - **Fix:** Run `CREATE DATABASE mdg_society_management_db;` in MySQL before starting `app.py`.
- **Issue:** `Port 5000 is already in use`
  - **Fix:** Change `FLASK_RUN_PORT=5001` in `.env` or terminate the process using port 5000:
    ```powershell
    netstat -ano | findstr :5000
    taskkill /PID <PID_NUMBER> /F
    ```
- **Issue:** `ModuleNotFoundError: No module named 'flask'`
  - **Fix:** Ensure you activated the virtual environment (`.\venv\Scripts\Activate.ps1`) before running `pip install -r requirements.txt`.

---
*Created for Green Valley Residency Society Management • Modern Digital Governance (MDG)*
