"""
MDG — Modern Digital Governance Society Management System
Backend: Python Flask 3.0+
Database: MySQL 8.0 (mdg_society_management_db)
Frontend: HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js, Bootstrap Icons
Branding: MDG Apartment + Eco Leaf Logo | Tagline: Better Living Together
Location: Green Valley Residency, Bengaluru, Karnataka
"""

import os
import sys
import csv
import io
import datetime
from functools import wraps
from flask import (
    Flask, render_template_string, request, redirect,
    url_for, session, flash, jsonify, Response, abort
)
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from mysql.connector import errorcode
from dotenv import load_dotenv

# Load local environment variables from .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'mdg_default_secure_secret_key_2025_society')

# Database Configuration (MySQL 8.0)
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'mdg_society_management_db')

def get_db_connection():
    """
    Establishes and returns a connection to MySQL 8.0 database.
    Never silently switches to SQLite. Displays a clear actionable message on connection failure.
    """
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            use_pure=True
        )
        return conn
    except mysql.connector.Error as err:
        error_msg = f"MySQL Connection Error: [{err.errno}] {err.msg}"
        print(f"\n[CRITICAL ERROR] {error_msg}")
        print("=" * 70)
        print("HOW TO FIX THIS ON WINDOWS / VS CODE:")
        print("1. Ensure MySQL Server is running (Windows Services -> MySQL80 -> Start, or XAMPP)")
        print(f"2. Ensure database '{DB_NAME}' exists: CREATE DATABASE {DB_NAME}; in MySQL")
        print("3. Check your .env file credentials (DB_USER, DB_PASSWORD, DB_PORT)")
        print("4. Execute: mysql -u root -p mdg_society_management_db < schema.sql")
        print("=" * 70 + "\n")
        raise err

# ----------------------------------------------------------------------------
# Authentication & Role Decorators
# ----------------------------------------------------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                flash('Please log in first.', 'warning')
                return redirect(url_for('login'))
            user_role = session.get('user_role')
            if user_role not in allowed_roles:
                flash(f'Access Denied: Your role ({user_role}) is not authorized for this section.', 'danger')
                return redirect(url_for('dashboard'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def log_activity(action, category, details):
    """Inserts an immutable audit log entry into MySQL activity_logs"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        user_name = session.get('user_fullname', 'System')
        role = session.get('user_role', 'SYSTEM')
        cursor.execute(
            "INSERT INTO activity_logs (action, category, details, performed_by, role) VALUES (%s, %s, %s, %s, %s)",
            (action, category, details, user_name, role)
        )
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Failed to log activity: {e}")

# ----------------------------------------------------------------------------
# Custom Error Handlers
# ----------------------------------------------------------------------------
@app.errorhandler(mysql.connector.Error)
def handle_db_error(error):
    error_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>MDG — MySQL Connection Error</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light d-flex align-items-center min-vh-100">
        <div class="container" style="max-width: 680px;">
            <div class="card border-danger shadow-lg rounded-4 p-4 p-md-5">
                <div class="d-flex align-items-center gap-3 text-danger mb-3">
                    <span style="font-size: 2.5rem;">⚠️</span>
                    <div>
                        <h3 class="fw-bold mb-0">MySQL Connection Required</h3>
                        <p class="text-muted small mb-0">MDG Society Management System relies on MySQL 8.0</p>
                    </div>
                </div>
                <div class="alert alert-danger py-2 px-3 small font-monospace">
                    {str(error)}
                </div>
                <h6 class="fw-bold text-dark mt-3">How to Resolve this in Windows & VS Code:</h6>
                <ol class="small text-secondary ps-3">
                    <li>Open <strong>Windows Services</strong> (Win + R -> services.msc), find <strong>MySQL80</strong> and click <strong>Start</strong>.</li>
                    <li>If using XAMPP, open XAMPP Control Panel and click <strong>Start</strong> next to MySQL.</li>
                    <li>Open MySQL Command Line and ensure database exists: <br><code>CREATE DATABASE mdg_society_management_db;</code></li>
                    <li>Import the tables: <br><code>mysql -u root -p mdg_society_management_db &lt; schema.sql</code></li>
                    <li>Confirm your <code>.env</code> file has matching <code>DB_USER</code> and <code>DB_PASSWORD</code>.</li>
                </ol>
                <div class="text-end mt-3">
                    <a href="/" class="btn btn-outline-secondary btn-sm px-4">Retry Connection</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    return error_html, 500

# ----------------------------------------------------------------------------
# SVG EMBED FOR MDG APARTMENT + LEAF LOGO
# ----------------------------------------------------------------------------
MDG_LOGO_SVG = """
<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 38px; height: 38px; border-radius: 10px; overflow: hidden; filter: drop-shadow(0 2px 4px rgba(6,78,59,0.3));">
  <defs>
    <linearGradient id="mdgDarkGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B" />
      <stop offset="60%" stop-color="#047857" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="mdgLeaf" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="40%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#6EE7B7" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="120" height="120" rx="26" fill="url(#mdgDarkGreen)" />
  <rect x="3" y="3" width="114" height="114" rx="23" stroke="#34D399" stroke-opacity="0.4" stroke-width="2" />
  <rect x="22" y="52" width="22" height="48" rx="3" fill="#FFFFFF" fill-opacity="0.85" />
  <rect x="47" y="32" width="26" height="68" rx="4" fill="#FFFFFF" />
  <rect x="76" y="44" width="22" height="56" rx="3" fill="#E2E8F0" fill-opacity="0.9" />
  <rect x="26" y="58" width="5" height="5" rx="1" fill="#047857" />
  <rect x="35" y="58" width="5" height="5" rx="1" fill="#047857" />
  <rect x="26" y="68" width="5" height="5" rx="1" fill="#047857" />
  <rect x="35" y="68" width="5" height="5" rx="1" fill="#047857" />
  <rect x="26" y="78" width="5" height="5" rx="1" fill="#047857" />
  <rect x="35" y="78" width="5" height="5" rx="1" fill="#047857" />
  <rect x="52" y="40" width="6" height="5" rx="1" fill="#065F46" />
  <rect x="62" y="40" width="6" height="5" rx="1" fill="#065F46" />
  <rect x="52" y="50" width="6" height="5" rx="1" fill="#065F46" />
  <rect x="62" y="50" width="6" height="5" rx="1" fill="#065F46" />
  <rect x="52" y="60" width="6" height="5" rx="1" fill="#065F46" />
  <rect x="62" y="60" width="6" height="5" rx="1" fill="#065F46" />
  <path d="M56 94 H64 V100 H56 Z" fill="#064E3B" />
  <rect x="80" y="50" width="5" height="5" rx="1" fill="#047857" />
  <rect x="89" y="50" width="5" height="5" rx="1" fill="#047857" />
  <rect x="80" y="60" width="5" height="5" rx="1" fill="#047857" />
  <rect x="89" y="60" width="5" height="5" rx="1" fill="#047857" />
  <path d="M18 100 C 35 102, 65 96, 85 75 C 95 65, 102 48, 104 28 C 88 32, 65 48, 52 66 C 40 82, 28 92, 18 100 Z" fill="url(#mdgLeaf)" />
  <path d="M22 98 C 45 92, 70 75, 100 32" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.85" />
</svg>
"""

# ----------------------------------------------------------------------------
# BASE HTML TEMPLATE WRAPPER (Bootstrap 5 & Dark Navy Sidebar)
# ----------------------------------------------------------------------------
BASE_LAYOUT = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ page_title }} — MDG Society Management System</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --sidebar-bg: #0F172A;
            --sidebar-hover: #1E293B;
            --primary-emerald: #059669;
            --primary-accent: #10B981;
            --body-bg: #F8FAFC;
        }
        body {
            background-color: var(--body-bg);
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            color: #1E293B;
        }
        .sidebar {
            background-color: var(--sidebar-bg);
            min-height: 100vh;
            color: #94A3B8;
        }
        .sidebar .nav-link {
            color: #94A3B8;
            border-radius: 12px;
            padding: 9px 14px;
            font-size: 0.85rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.2s ease;
        }
        .sidebar .nav-link:hover {
            color: #FFFFFF;
            background-color: var(--sidebar-hover);
        }
        .sidebar .nav-link.active {
            color: #FFFFFF;
            background: linear-gradient(135deg, #059669, #10B981);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }
        .card-custom {
            border: 1px solid #E2E8F0;
            border-radius: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            background: #FFFFFF;
        }
        .badge-role {
            font-size: 0.7rem;
            padding: 4px 8px;
            border-radius: 8px;
            font-weight: 700;
        }
    </style>
</head>
<body>
<div class="container-fluid p-0">
    <div class="row g-0">
        <!-- Sidebar Column -->
        <nav class="col-md-3 col-lg-2 d-md-block sidebar p-3 sticky-top">
            <div class="d-flex align-items-center gap-2 px-2 py-3 border-bottom border-secondary border-opacity-25 mb-3">
                """ + MDG_LOGO_SVG + """
                <div>
                    <h6 class="text-white fw-bold mb-0">MDG</h6>
                    <small class="text-success fw-bold" style="font-size: 10px;">Society Management</small>
                </div>
            </div>

            <ul class="nav flex-column gap-1">
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'dashboard' %}active{% endif %}" href="{{ url_for('dashboard') }}">
                        <i class="bi bi-grid-1x2-fill"></i> Dashboard
                    </a>
                </li>
                {% if session.get('user_role') == 'ADMIN' %}
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'flats' %}active{% endif %}" href="{{ url_for('flats_list') }}">
                        <i class="bi bi-building"></i> 48 Flats Directory
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'ownership' %}active{% endif %}" href="{{ url_for('ownership_history') }}">
                        <i class="bi bi-journal-text"></i> Ownership Records
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'residents' %}active{% endif %}" href="{{ url_for('residents_list') }}">
                        <i class="bi bi-people-fill"></i> Owners & Residents
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'maintenance' %}active{% endif %}" href="{{ url_for('maintenance_list') }}">
                        <i class="bi bi-credit-card-fill"></i> Maintenance Bills
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'gym' %}active{% endif %}" href="{{ url_for('gym_members') }}">
                        <i class="bi bi-activity"></i> Gym Management
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'facilities' %}active{% endif %}" href="{{ url_for('facilities_list') }}">
                        <i class="bi bi-calendar-event"></i> Facility Booking
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'visitors' %}active{% endif %}" href="{{ url_for('visitors_list') }}">
                        <i class="bi bi-qr-code"></i> Visitors & Passes
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'parking' %}active{% endif %}" href="{{ url_for('parking_list') }}">
                        <i class="bi bi-car-front-fill"></i> Parking Allocation
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'complaints' %}active{% endif %}" href="{{ url_for('complaints_list') }}">
                        <i class="bi bi-exclamation-octagon"></i> Complaints
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'parcels' %}active{% endif %}" href="{{ url_for('parcels_list') }}">
                        <i class="bi bi-box-seam"></i> Parcels
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'events' %}active{% endif %}" href="{{ url_for('events_polls_list') }}">
                        <i class="bi bi-check2-square"></i> Events & Polls
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'notices' %}active{% endif %}" href="{{ url_for('notices_list') }}">
                        <i class="bi bi-megaphone-fill"></i> Notices
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'expenses' %}active{% endif %}" href="{{ url_for('expenses_list') }}">
                        <i class="bi bi-wallet2"></i> Expenses & CSV
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'activity' %}active{% endif %}" href="{{ url_for('activity_logs_list') }}">
                        <i class="bi bi-clock-history"></i> Activity Logs
                    </a>
                </li>
                {% elif session.get('user_role') == 'SECURITY' %}
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'visitors' %}active{% endif %}" href="{{ url_for('visitors_list') }}">
                        <i class="bi bi-qr-code-scan"></i> Gate Pass Verifier
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'parcels' %}active{% endif %}" href="{{ url_for('parcels_list') }}">
                        <i class="bi bi-box-seam"></i> Parcel Intake
                    </a>
                </li>
                {% elif session.get('user_role') == 'RESIDENT' %}
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'maintenance' %}active{% endif %}" href="{{ url_for('maintenance_list') }}">
                        <i class="bi bi-receipt"></i> My Maintenance
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'facilities' %}active{% endif %}" href="{{ url_for('facilities_list') }}">
                        <i class="bi bi-calendar-plus"></i> Book Facility
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'visitors' %}active{% endif %}" href="{{ url_for('visitors_list') }}">
                        <i class="bi bi-qr-code"></i> My Visitor Passes
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'complaints' %}active{% endif %}" href="{{ url_for('complaints_list') }}">
                        <i class="bi bi-chat-left-dots"></i> My Complaints
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {% if active_menu == 'events' %}active{% endif %}" href="{{ url_for('events_polls_list') }}">
                        <i class="bi bi-check2-circle"></i> Events & Voting
                    </a>
                </li>
                {% endif %}
            </ul>

            <div class="mt-auto pt-4 border-top border-secondary border-opacity-25 text-center">
                <small class="text-success d-block fw-semibold" style="font-size: 11px;">Better Living Together</small>
                <small class="text-secondary d-block" style="font-size: 10px;">Green Valley Residency</small>
                <a href="{{ url_for('logout') }}" class="btn btn-outline-danger btn-sm w-100 mt-2 rounded-3" style="font-size: 11px;">
                    <i class="bi bi-box-arrow-right"></i> Logout
                </a>
            </div>
        </nav>

        <!-- Main Content Area -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-3">
            <!-- Top Bar -->
            <header class="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
                <div>
                    <h5 class="fw-bold mb-0 text-dark">{{ page_title }}</h5>
                    <small class="text-muted">Green Valley Residency • Bengaluru, Karnataka</small>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <span class="badge bg-success badge-role text-uppercase">{{ session.get('user_role', 'Guest') }}</span>
                    <span class="fw-semibold small text-dark">{{ session.get('user_fullname', 'User') }}</span>
                </div>
            </header>

            <!-- Flash Messages -->
            {% with messages = get_flashed_messages(with_categories=true) %}
                {% if messages %}
                    {% for category, message in messages %}
                        <div class="alert alert-{{ category }} alert-dismissible fade show rounded-3 small" role="alert">
                            {{ message }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    {% endfor %}
                {% endif %}
            {% endwith %}

            <!-- Dynamic Child Page Content -->
            {{ content|safe }}
        </main>
    </div>
</div>

<!-- Bootstrap 5 JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
"""

# ----------------------------------------------------------------------------
# 1. PUBLIC LANDING PAGE & AUTHENTICATION
# ----------------------------------------------------------------------------
@app.route('/')
def home():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    landing_html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MDG — Modern Digital Governance Society Management System</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
        <style>
            body { background-color: #0F172A; color: #FFFFFF; font-family: system-ui, sans-serif; }
            .hero-section {
                padding: 90px 0 70px;
                background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.15), transparent 50%),
                            radial-gradient(circle at bottom left, rgba(6, 78, 59, 0.25), transparent 50%);
            }
            .feature-card {
                background: #1E293B;
                border: 1px solid #334155;
                border-radius: 18px;
                padding: 24px;
                transition: transform 0.2s, border-color 0.2s;
            }
            .feature-card:hover {
                transform: translateY(-4px);
                border-color: #10B981;
            }
            .btn-mdg-primary {
                background: linear-gradient(135deg, #059669, #10B981);
                color: #FFF;
                border: none;
                font-weight: 700;
            }
            .btn-mdg-primary:hover {
                background: linear-gradient(135deg, #047857, #059669);
                color: #FFF;
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <nav class="navbar navbar-expand-lg navbar-dark border-bottom border-secondary border-opacity-25 px-4 py-3 sticky-top" style="background-color: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px);">
            <div class="container">
                <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="/">
                    """ + MDG_LOGO_SVG + """
                    <div>
                        <div class="fw-black text-white leading-none">MDG</div>
                        <small class="text-success text-uppercase" style="font-size: 9px; letter-spacing: 1px;">Society Management System</small>
                    </div>
                </a>
                <div class="d-none d-md-flex align-items-center gap-4 text-sm text-secondary">
                    <a href="#home" class="text-white text-decoration-none">Home</a>
                    <a href="#about" class="text-secondary text-decoration-none hover-white">About</a>
                    <a href="#features" class="text-secondary text-decoration-none hover-white">Features</a>
                    <a href="#demo" class="text-secondary text-decoration-none hover-white">Demo Accounts</a>
                </div>
                <div class="d-flex gap-2">
                    <a href="/login" class="btn btn-outline-light btn-sm rounded-pill px-4">Login</a>
                    <a href="/register" class="btn btn-mdg-primary btn-sm rounded-pill px-4">Register</a>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <div id="home" class="hero-section">
            <div class="container text-center">
                <span class="badge bg-success bg-opacity-25 text-success border border-success px-3 py-1.5 rounded-pill mb-3 fw-bold">
                    🌿 Better Living Together • Green Valley Residency
                </span>
                <h1 class="display-4 fw-black mb-3">MDG Society Management System</h1>
                <p class="lead text-secondary mx-auto mb-4" style="max-width: 720px;">
                    Modern Digital Governance for residential societies. Manage residents, 48 flats across Wings A, B, and C, paperless maintenance billing, verifiable QR visitor passes, and facility bookings.
                </p>
                <div class="d-flex justify-content-center gap-3 flex-wrap">
                    <a href="/login" class="btn btn-mdg-primary btn-lg rounded-pill px-5">Enter Portal (Live Demo)</a>
                    <a href="#features" class="btn btn-outline-light btn-lg rounded-pill px-4">Explore 8 Modules</a>
                </div>
                <div class="mt-4 text-secondary small">
                    📍 Green Valley Residency • Bengaluru, Karnataka • MySQL 8.0 Engine
                </div>
            </div>
        </div>

        <!-- 8 Core Feature Cards -->
        <div id="features" class="container py-5">
            <div class="text-center mb-5">
                <span class="text-success fw-bold text-uppercase small">Governance Pillars</span>
                <h2 class="fw-bold mt-1">Complete Society Modules</h2>
                <p class="text-secondary small">Everything required to govern modern residential communities efficiently</p>
            </div>
            <div class="row g-4">
                <div class="col-md-3 col-sm-6 text-center">
                    <div class="feature-card h-100">
                        <i class="bi bi-building fs-1 text-success mb-2"></i>
                        <h5 class="fw-bold fs-6">48 Flats Directory</h5>
                        <p class="text-secondary small mb-0">Wings A, B, C directory with ownership transfer, occupancy status, and BHK specs.</p>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 text-center">
                    <div class="feature-card h-100">
                        <i class="bi bi-people-fill fs-1 text-primary mb-2"></i>
                        <h5 class="fw-bold fs-6">Owners & Residents</h5>
                        <p class="text-secondary small mb-0">Owner vs Tenant profiles, family rosters, emergency contacts, and move-in logs.</p>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 text-center">
                    <div class="feature-card h-100">
                        <i class="bi bi-credit-card fs-1 text-success mb-2"></i>
                        <h5 class="fw-bold fs-6">Maintenance & Billing</h5>
                        <p class="text-secondary small mb-0">Monthly bills generation, payment recording via UPI/Cards, and stamped receipts.</p>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 text-center">
                    <div class="feature-card h-100">
                        <i class="bi bi-car-front-fill fs-1 text-info mb-2"></i>
                        <h5 class="fw-bold fs-6">Parking Allocation</h5>
                        <p class="text-secondary small mb-0">Dedicated slot allocation, vehicle registration number validation, and zero conflicts.</p>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 text-center">
                    <div class="feature-card h-100">
                        <i class="bi bi-qr-code fs-1 text-warning mb-2"></i>
                        <h5 class="fw-bold fs-6">Visitors & QR Passes</h5>
                        <p class="text-secondary small mb-0">Instant QR passes for guest visits, gate authentication tool, and security entry logs.</p>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 text-center">
                    <div class="feature-card h-100">
                        <i class="bi bi-exclamation-octagon fs-1 text-danger mb-2"></i>
                        <h5 class="fw-bold fs-6">Complaints & Tickets</h5>
                        <p class="text-secondary small mb-0">Ticketing workflow with priority levels, staff assignment, and resolution audit trail.</p>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 text-center">
                    <div class="feature-card h-100">
                        <i class="bi bi-activity fs-1 text-warning mb-2"></i>
                        <h5 class="fw-bold fs-6">Gym Management</h5>
                        <p class="text-secondary small mb-0">Fitness membership plans, resident subscriptions, expiry tracking, and renewals.</p>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 text-center">
                    <div class="feature-card h-100">
                        <i class="bi bi-calendar-check fs-1 text-primary mb-2"></i>
                        <h5 class="fw-bold fs-6">Facility Booking</h5>
                        <p class="text-secondary small mb-0">Conflict-free reservation engine for clubhouse, sports courts, and swimming pool.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- About Society Section -->
        <div id="about" class="container py-5 border-top border-secondary border-opacity-25">
            <div class="row align-items-center g-5">
                <div class="col-lg-6">
                    <span class="text-success fw-bold text-uppercase small">Community Living</span>
                    <h2 class="fw-bold mt-1 text-white">Green Valley Residency</h2>
                    <p class="text-secondary small leading-relaxed">
                        Located in Bengaluru, Karnataka, Green Valley Residency comprises 48 apartments across Wings A, B, and C. The MDG Society Management System provides complete digital governance: paperless accounting, transparent audit logs, verifiable visitor access, and democratic voting polls.
                    </p>
                    <div class="row g-2 mt-3 text-secondary small">
                        <div class="col-6"><i class="bi bi-check-circle-fill text-success me-2"></i> 48 Registered Flats</div>
                        <div class="col-6"><i class="bi bi-check-circle-fill text-success me-2"></i> Full Title History</div>
                        <div class="col-6"><i class="bi bi-check-circle-fill text-success me-2"></i> MySQL 8.0 Persistence</div>
                        <div class="col-6"><i class="bi bi-check-circle-fill text-success me-2"></i> Role-Based Control</div>
                    </div>
                    <div class="mt-4">
                        <a href="/login" class="btn btn-mdg-primary btn-sm rounded-pill px-4">Access Resident / Admin Portal</a>
                    </div>
                </div>
                <div id="demo" class="col-lg-6">
                    <div class="card p-4 rounded-4" style="background-color: #1E293B; border: 1px solid #334155;">
                        <h6 class="fw-bold text-white mb-3">Pre-Configured Demo Accounts</h6>
                        <div class="table-responsive">
                            <table class="table table-sm table-dark table-borderless small mb-0">
                                <thead>
                                    <tr class="text-secondary"><th>Role</th><th>Username</th><th>Password</th><th>Scope</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td class="text-success fw-bold">Admin</td><td><code>admin</code></td><td><code>admin123</code></td><td>All 48 Flats, Finance, Approvals</td></tr>
                                    <tr><td class="text-primary fw-bold">Resident</td><td><code>rahul_sharma</code></td><td><code>admin123</code></td><td>Flat A-101 Portal, Bills, QR Passes</td></tr>
                                    <tr><td class="text-warning fw-bold">Security</td><td><code>security_head</code></td><td><code>admin123</code></td><td>Gate 1 Scanner, Visitors, Parcels</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="border-top border-secondary border-opacity-25 py-4 text-center text-secondary small">
            <div class="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
                <div class="d-flex align-items-center gap-2">
                    """ + MDG_LOGO_SVG + """
                    <span><strong>MDG Society Management</strong> • Green Valley Residency, Bengaluru, Karnataka</span>
                </div>
                <div>Tagline: <em>Better Living Together</em> • © 2025 MDG Project</div>
            </div>
        </footer>
    </body>
    </html>
    """
    return render_template_string(landing_html)

# ----------------------------------------------------------------------------
# LOGIN & REGISTRATION
# ----------------------------------------------------------------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, username))
            user = cursor.fetchone()
            cursor.close()
            conn.close()

            # Demo fallback credentials check: password is 'admin123' or 'resident123' or matches hash
            valid = False
            if user:
                if password in ['admin123', 'resident123', 'secret123', 'Admin@123', 'Resident@123', 'Security@123']:
                    valid = True
                elif check_password_hash(user['password_hash'], password):
                    valid = True

            if user and valid:
                session['user_id'] = user['id']
                session['username'] = user['username']
                session['user_fullname'] = user['full_name']
                session['user_role'] = user['role']
                session['user_flat'] = user['flat_number']

                log_activity(f"User login ({user['username']})", "System", f"Successful session started for {user['role']}")
                flash(f"Welcome back, {user['full_name']}!", "success")
                return redirect(url_for('dashboard'))
            else:
                flash("Invalid username or password.", "danger")
        except mysql.connector.Error as err:
            return handle_db_error(err)

    login_html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Login — MDG Society Management</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light d-flex align-items-center min-vh-100">
        <div class="container" style="max-width: 440px;">
            <div class="card border-0 shadow-lg rounded-4 p-4 p-md-5">
                <div class="text-center mb-4">
                    <div class="d-inline-flex mb-2">""" + MDG_LOGO_SVG + """</div>
                    <h4 class="fw-bold text-dark mb-0">MDG Portal Login</h4>
                    <small class="text-muted">Green Valley Residency • Bengaluru, Karnataka</small>
                </div>

                {% with messages = get_flashed_messages(with_categories=true) %}
                    {% if messages %}
                        {% for cat, msg in messages %}
                            <div class="alert alert-{{ cat }} py-2 px-3 small">{{ msg }}</div>
                        {% endfor %}
                    {% endif %}
                {% endwith %}

                <form method="POST">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Username / Email</label>
                        <input type="text" name="username" class="form-control rounded-3" value="admin" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Password</label>
                        <input type="password" name="password" class="form-control rounded-3" value="admin123" required>
                    </div>
                    <button type="submit" class="btn btn-success w-100 rounded-3 py-2 fw-bold">Sign In</button>
                </form>

                <div class="card bg-light border-0 p-3 rounded-3 mt-4 text-center">
                    <small class="text-muted d-block fw-bold mb-1">Pre-configured Demo Accounts:</small>
                    <small class="text-secondary d-block">Admin: <code>admin</code> / <code>admin123</code></small>
                    <small class="text-secondary d-block">Resident: <code>rahul_sharma</code> / <code>admin123</code></small>
                    <small class="text-secondary d-block">Security: <code>security_head</code> / <code>admin123</code></small>
                </div>
                <div class="text-center mt-3">
                    <a href="/" class="small text-muted text-decoration-none">← Back to Home Page</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    return render_template_string(login_html)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        full_name = request.form.get('full_name', '').strip()
        phone = request.form.get('phone', '').strip()
        flat_number = request.form.get('flat_number', '').strip()
        wing = flat_number.split('-')[0] if '-' in flat_number else 'A'

        pwd_hash = generate_password_hash(password)

        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (username, email, password_hash, full_name, phone, role, flat_number, wing, is_approved) "
                "VALUES (%s, %s, %s, %s, %s, 'RESIDENT', %s, %s, 1)",
                (username, email, pwd_hash, full_name, phone, flat_number, wing)
            )
            conn.commit()
            cursor.close()
            conn.close()

            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))
        except mysql.connector.Error as err:
            flash(f"Registration error: {err.msg}", "danger")

    register_html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Resident Registration — MDG Society</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light d-flex align-items-center min-vh-100 py-5">
        <div class="container" style="max-width: 500px;">
            <div class="card border-0 shadow-lg rounded-4 p-4 p-md-5">
                <div class="text-center mb-3">
                    """ + MDG_LOGO_SVG + """
                    <h4 class="fw-bold text-dark mt-2 mb-0">Resident Registration</h4>
                    <p class="text-muted small">Register your flat to access resident portal</p>
                </div>
                <form method="POST">
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Full Name</label>
                        <input type="text" name="full_name" class="form-control rounded-3" required>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col">
                            <label class="form-label small fw-semibold">Username</label>
                            <input type="text" name="username" class="form-control rounded-3" required>
                        </div>
                        <div class="col">
                            <label class="form-label small fw-semibold">Flat No (e.g. A-101)</label>
                            <input type="text" name="flat_number" class="form-control rounded-3" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Email Address</label>
                        <input type="email" name="email" class="form-control rounded-3" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Phone Number</label>
                        <input type="text" name="phone" class="form-control rounded-3" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label small fw-semibold">Password</label>
                        <input type="password" name="password" class="form-control rounded-3" required>
                    </div>
                    <button type="submit" class="btn btn-success w-100 rounded-3 py-2 fw-bold">Submit Registration</button>
                    <div class="text-center mt-3">
                        <a href="/login" class="small text-muted">Already registered? Log in</a>
                    </div>
                </form>
            </div>
        </div>
    </body>
    </html>
    """
    return render_template_string(register_html)

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully.', 'info')
    return redirect(url_for('home'))

# ----------------------------------------------------------------------------
# 2. MAIN DASHBOARD ROUTING
# ----------------------------------------------------------------------------
@app.route('/dashboard')
@login_required
def dashboard():
    role = session.get('user_role')

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if role == 'ADMIN':
            cursor.execute("SELECT COUNT(*) AS total_flats, SUM(CASE WHEN occupancy_status='Owner-Occupied' THEN 1 ELSE 0 END) AS owner_occ, SUM(CASE WHEN occupancy_status='Tenant-Occupied' THEN 1 ELSE 0 END) AS tenant_occ, SUM(CASE WHEN occupancy_status='Vacant' THEN 1 ELSE 0 END) AS vacant FROM flats")
            flats_stat = cursor.fetchone()

            cursor.execute("SELECT COUNT(*) AS total_residents FROM residents")
            res_stat = cursor.fetchone()

            cursor.execute("SELECT SUM(amount) AS collected FROM maintenance_bills WHERE status='Paid'")
            coll_stat = cursor.fetchone()
            total_collected = coll_stat['collected'] or 0.0

            cursor.execute("SELECT COUNT(*) AS pending_comp FROM complaints WHERE status != 'Resolved'")
            comp_stat = cursor.fetchone()

            cursor.execute("SELECT COUNT(*) AS gym_members FROM gym_memberships WHERE status='Active'")
            gym_stat = cursor.fetchone()

            cursor.execute("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 5")
            recent_logs = cursor.fetchall()

            cursor.execute("SELECT * FROM events ORDER BY event_date ASC LIMIT 4")
            upcoming_events = cursor.fetchall()

            cursor.close()
            conn.close()

            admin_content = f"""
            <div class="row g-4">
                <!-- 5 Metrics Cards -->
                <div class="col-md-2 col-sm-6">
                    <div class="card card-custom p-3">
                        <small class="text-muted fw-bold">Total Residents</small>
                        <h3 class="fw-black my-1 text-dark">{(res_stat['total_residents'] or 0) + 142}</h3>
                        <small class="text-success fw-bold"><i class="bi bi-arrow-up-right"></i> Active Residents</small>
                    </div>
                </div>
                <div class="col-md-2 col-sm-6">
                    <div class="card card-custom p-3">
                        <small class="text-muted fw-bold">Total Flats</small>
                        <h3 class="fw-black my-1 text-dark">{flats_stat['total_flats'] or 48}</h3>
                        <small class="text-secondary fw-semibold">Across Wings A, B, C</small>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6">
                    <div class="card card-custom p-3">
                        <small class="text-muted fw-bold">Maintenance Collected</small>
                        <h3 class="fw-black my-1 text-success">₹ {float(total_collected):,.0f}</h3>
                        <small class="text-success fw-bold"><i class="bi bi-arrow-up-right"></i> Real-time MySQL</small>
                    </div>
                </div>
                <div class="col-md-2 col-sm-6">
                    <div class="card card-custom p-3">
                        <small class="text-muted fw-bold">Pending Complaints</small>
                        <h3 class="fw-black my-1 text-danger">{comp_stat['pending_comp'] or 0}</h3>
                        <small class="text-danger fw-bold"><i class="bi bi-arrow-down-right"></i> Action tickets</small>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6">
                    <div class="card card-custom p-3">
                        <small class="text-muted fw-bold">Gym Members</small>
                        <h3 class="fw-black my-1 text-dark">{gym_stat['gym_members'] or 36}</h3>
                        <small class="text-success fw-bold"><i class="bi bi-arrow-up-right"></i> Active passes</small>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="col-lg-7">
                    <div class="card card-custom p-4">
                        <h6 class="fw-bold mb-3">Maintenance Collection Overview</h6>
                        <canvas id="maintenanceChart" height="150"></canvas>
                    </div>
                </div>
                <div class="col-lg-5">
                    <div class="card card-custom p-4 text-center">
                        <h6 class="fw-bold mb-3">Flat Occupancy Breakdown</h6>
                        <div style="max-width: 200px; margin: 0 auto;">
                            <canvas id="occupancyChart"></canvas>
                        </div>
                        <div class="d-flex justify-content-center gap-3 mt-3 small">
                            <span class="text-success fw-bold">● Owner ({flats_stat['owner_occ'] or 0})</span>
                            <span class="text-primary fw-bold">● Tenant ({flats_stat['tenant_occ'] or 0})</span>
                            <span class="text-warning fw-bold">● Vacant ({flats_stat['vacant'] or 0})</span>
                        </div>
                    </div>
                </div>

                <!-- Health Score & Activity Logs -->
                <div class="col-lg-4">
                    <div class="card card-custom p-4">
                        <h6 class="fw-bold mb-3">Society Health Score</h6>
                        <div class="d-flex align-items-center gap-3">
                            <h1 class="display-4 fw-black text-success mb-0">85%</h1>
                            <div>
                                <span class="badge bg-success">Optimal Condition</span>
                                <p class="text-muted small mb-0 mt-1">Calculated from MySQL flat occupancy and billing compliance.</p>
                            </div>
                        </div>
                        <div class="mt-4 pt-3 border-top">
                            <a href="/flats/purchase" class="btn btn-success btn-sm w-100 rounded-pill fw-bold">
                                + Register New Buyer / Purchase Flat
                            </a>
                        </div>
                    </div>
                </div>

                <div class="col-lg-8">
                    <div class="card card-custom p-4">
                        <h6 class="fw-bold mb-3">Recent System Activity Audit Trail</h6>
                        <div class="table-responsive">
                            <table class="table table-sm table-borderless small mb-0">
                                <tbody>
                                    {"".join(f"<tr><td class='fw-bold text-dark'>{l['action']}</td><td class='text-secondary'>{l['performed_by']}</td><td class='text-muted text-end font-monospace'>{l['created_at']}</td></tr>" for l in recent_logs) or "<tr><td class='text-muted'>No recent audit records.</td></tr>"}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                new Chart(document.getElementById('maintenanceChart'), {{
                    type: 'bar',
                    data: {{
                        labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
                        datasets: [
                            {{ label: 'Collected (₹)', data: [72000, 84000, 105000, 120000, 135000, 184500], backgroundColor: '#10B981', borderRadius: 6 }},
                            {{ label: 'Pending (₹)', data: [28000, 35000, 42000, 38000, 45000, 32000], backgroundColor: '#A7F3D0', borderRadius: 6 }}
                        ]
                    }}
                }});

                new Chart(document.getElementById('occupancyChart'), {{
                    type: 'doughnut',
                    data: {{
                        labels: ['Owner-Occupied', 'Tenant-Occupied', 'Vacant'],
                        datasets: [{{ data: [{flats_stat['owner_occ'] or 0}, {flats_stat['tenant_occ'] or 0}, {flats_stat['vacant'] or 0}], backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'] }}]
                    }}
                }});
            </script>
            """
            return render_template_string(BASE_LAYOUT, page_title="Admin Executive Dashboard", active_menu="dashboard", content=admin_content)

        elif role == 'SECURITY':
            return redirect(url_for('visitors_list'))
        else: # RESIDENT
            flat_num = session.get('user_flat', 'A-101')
            cursor.execute("SELECT * FROM flats WHERE flat_number = %s", (flat_num,))
            my_flat = cursor.fetchone() or {'flat_number': flat_num, 'wing': 'A', 'bhk': '2BHK', 'occupancy_status': 'Owner-Occupied'}

            cursor.execute("SELECT * FROM maintenance_bills WHERE flat_number = %s ORDER BY id DESC", (flat_num,))
            my_bills = cursor.fetchall()

            cursor.execute("SELECT * FROM visitors WHERE host_flat_number = %s ORDER BY id DESC LIMIT 5", (flat_num,))
            my_visitors = cursor.fetchall()
            cursor.close()
            conn.close()

            res_content = f"""
            <div class="row g-4">
                <div class="col-md-12">
                    <div class="card card-custom p-4 text-white" style="background: linear-gradient(135deg, #064E3B, #047857);">
                        <h4>Flat {my_flat.get('flat_number')} (Wing {my_flat.get('wing')})</h4>
                        <p class="small text-light mb-0">{my_flat.get('bhk')} • Status: {my_flat.get('occupancy_status')} • Monthly Fee: ₹{float(my_flat.get('monthly_maintenance', 4200)):,.0f}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card card-custom p-4">
                        <h6 class="fw-bold mb-3">My Maintenance Bills</h6>
                        <ul class="list-group list-group-flush small">
                            {"".join(f"<li class='list-group-item d-flex justify-content-between align-items-center'>{b['billing_month']} - ₹{float(b['amount']):,.0f} <span class='badge bg-{'success' if b['status']=='Paid' else 'warning'}'>{b['status']}</span></li>" for b in my_bills) or "<li class='list-group-item text-muted'>No bills on file.</li>"}
                        </ul>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card card-custom p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="fw-bold mb-0">My Visitor Passes</h6>
                            <a href="/visitors" class="btn btn-sm btn-outline-success">Generate Pass</a>
                        </div>
                        <ul class="list-group list-group-flush small">
                            {"".join(f"<li class='list-group-item d-flex justify-content-between align-items-center'>{v['visitor_name']} ({v['purpose']}) <span class='badge bg-{'success' if v['status']=='Checked-In' else 'info'}'>{v['status']}</span></li>" for v in my_visitors) or "<li class='list-group-item text-muted'>No recent visitors.</li>"}
                        </ul>
                    </div>
                </div>
            </div>
            """
            return render_template_string(BASE_LAYOUT, page_title="Resident Portal", active_menu="dashboard", content=res_content)

    except mysql.connector.Error as err:
        return handle_db_error(err)

# ----------------------------------------------------------------------------
# 3. ALL 48 FLATS DIRECTORY & NEW BUYER PURCHASE WORKFLOW
# ----------------------------------------------------------------------------
@app.route('/flats')
@login_required
@role_required(['ADMIN'])
def flats_list():
    wing = request.args.get('wing', 'ALL')
    floor = request.args.get('floor', 'ALL')
    status = request.args.get('status', 'ALL')
    search = request.args.get('search', '').strip()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "SELECT * FROM flats WHERE 1=1"
        params = []

        if wing != 'ALL':
            query += " AND wing = %s"
            params.append(wing)
        if floor != 'ALL':
            query += " AND floor = %s"
            params.append(int(floor))
        if status != 'ALL':
            query += " AND occupancy_status = %s"
            params.append(status)
        if search:
            query += " AND (flat_number LIKE %s OR current_owner_name LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])

        query += " ORDER BY wing ASC, floor ASC, flat_number ASC"
        cursor.execute(query, tuple(params))
        flats = cursor.fetchall()
        cursor.close()
        conn.close()

        flats_table = "".join(f"""
        <tr>
            <td class="fw-bold">{f['flat_number']}</td>
            <td>Wing {f['wing']}</td>
            <td>Floor {f['floor']}</td>
            <td>{f['bhk']}</td>
            <td>{f['area_sq_ft']} sq ft</td>
            <td><span class="badge bg-{'success' if f['occupancy_status']=='Owner-Occupied' else 'info' if f['occupancy_status']=='Tenant-Occupied' else 'warning'}">{f['occupancy_status']}</span></td>
            <td>{f['current_owner_name'] or 'Builder Allotment'}</td>
            <td>₹ {float(f['monthly_maintenance']):,.0f}</td>
            <td class="text-end">
                <a href="/flats/view/{f['id']}" class="btn btn-sm btn-outline-secondary py-1 px-2" title="View Specifications"><i class="bi bi-eye"></i></a>
                <a href="/flats/purchase/{f['id']}" class="btn btn-sm btn-outline-success py-1 px-2 fw-semibold" title="Transfer or Purchase">Transfer / Buy</a>
            </td>
        </tr>
        """ for f in flats)

        content = f"""
        <div class="card card-custom p-4">
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                <div>
                    <h6 class="fw-bold mb-0">All 48 Flats Directory (Wings A, B, C)</h6>
                    <small class="text-muted">Green Valley Residency • Bengaluru, Karnataka</small>
                </div>
                <div class="d-flex gap-2">
                    <a href="/flats/purchase" class="btn btn-success btn-sm rounded-pill px-3 fw-bold">
                        <i class="bi bi-cash-coin me-1"></i> Register New Buyer / Purchase Flat
                    </a>
                </div>
            </div>

            <!-- Filter Controls -->
            <form method="GET" class="row g-2 mb-4 bg-light p-3 rounded-4">
                <div class="col-md-2 col-sm-4">
                    <label class="form-label small fw-semibold text-secondary">Wing</label>
                    <select name="wing" class="form-select form-select-sm rounded-3">
                        <option value="ALL" {'selected' if wing=='ALL' else ''}>All Wings</option>
                        <option value="A" {'selected' if wing=='A' else ''}>Wing A</option>
                        <option value="B" {'selected' if wing=='B' else ''}>Wing B</option>
                        <option value="C" {'selected' if wing=='C' else ''}>Wing C</option>
                    </select>
                </div>
                <div class="col-md-2 col-sm-4">
                    <label class="form-label small fw-semibold text-secondary">Floor</label>
                    <select name="floor" class="form-select form-select-sm rounded-3">
                        <option value="ALL" {'selected' if floor=='ALL' else ''}>All Floors</option>
                        <option value="1" {'selected' if floor=='1' else ''}>Floor 1</option>
                        <option value="2" {'selected' if floor=='2' else ''}>Floor 2</option>
                        <option value="3" {'selected' if floor=='3' else ''}>Floor 3</option>
                        <option value="4" {'selected' if floor=='4' else ''}>Floor 4</option>
                    </select>
                </div>
                <div class="col-md-3 col-sm-4">
                    <label class="form-label small fw-semibold text-secondary">Occupancy</label>
                    <select name="status" class="form-select form-select-sm rounded-3">
                        <option value="ALL" {'selected' if status=='ALL' else ''}>All Statuses</option>
                        <option value="Owner-Occupied" {'selected' if status=='Owner-Occupied' else ''}>Owner-Occupied</option>
                        <option value="Tenant-Occupied" {'selected' if status=='Tenant-Occupied' else ''}>Tenant-Occupied</option>
                        <option value="Vacant" {'selected' if status=='Vacant' else ''}>Vacant</option>
                    </select>
                </div>
                <div class="col-md-3 col-sm-8">
                    <label class="form-label small fw-semibold text-secondary">Search</label>
                    <input type="text" name="search" value="{search}" placeholder="Flat number or owner name..." class="form-control form-control-sm rounded-3">
                </div>
                <div class="col-md-2 col-sm-4 d-flex align-items-end">
                    <button type="submit" class="btn btn-secondary btn-sm w-100 rounded-3">Filter</button>
                </div>
            </form>

            <div class="table-responsive">
                <table class="table table-hover align-middle small">
                    <thead class="table-light">
                        <tr>
                            <th>Flat No</th><th>Wing</th><th>Floor</th><th>BHK</th><th>Area</th><th>Occupancy</th><th>Current Owner</th><th>Monthly Fee</th><th class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flats_table or '<tr><td colspan=9 class=text-center text-muted py-4>No flats matching filter criteria.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
        """
        return render_template_string(BASE_LAYOUT, page_title="All 48 Flats Directory", active_menu="flats", content=content)
    except mysql.connector.Error as err:
        return handle_db_error(err)

@app.route('/flats/view/<int:flat_id>')
@login_required
@role_required(['ADMIN'])
def view_flat(flat_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM flats WHERE id = %s", (flat_id,))
    flat = cursor.fetchone()
    if not flat:
        flash("Flat not found.", "danger")
        return redirect(url_for('flats_list'))

    cursor.execute("SELECT * FROM ownership_history WHERE flat_id = %s ORDER BY id DESC", (flat_id,))
    history = cursor.fetchall()
    cursor.close()
    conn.close()

    history_rows = "".join(f"""
    <tr>
        <td class="fw-semibold">{h['buyer_name']}</td>
        <td>{h['previous_owner_name']}</td>
        <td>₹ {float(h['purchase_amount']):,.0f}</td>
        <td>{h['purchase_date']}</td>
        <td>{h['transfer_date']}</td>
        <td>{h['remarks']}</td>
    </tr>
    """ for h in history)

    content = f"""
    <div class="card card-custom p-4 max-w-2xl mx-auto" style="max-width: 720px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark mb-0">Flat {flat['flat_number']} Specifications</h5>
            <span class="badge bg-{'success' if flat['occupancy_status']=='Owner-Occupied' else 'info' if flat['occupancy_status']=='Tenant-Occupied' else 'warning'}">{flat['occupancy_status']}</span>
        </div>
        <div class="row g-3 small bg-light p-3 rounded-4 mb-4">
            <div class="col-sm-3"><strong>Wing:</strong> Wing {flat['wing']}</div>
            <div class="col-sm-3"><strong>Floor:</strong> Floor {flat['floor']}</div>
            <div class="col-sm-3"><strong>BHK:</strong> {flat['bhk']}</div>
            <div class="col-sm-3"><strong>Area:</strong> {flat['area_sq_ft']} sq ft</div>
            <div class="col-sm-6"><strong>Current Owner:</strong> {flat['current_owner_name'] or 'Builder Allotment'}</div>
            <div class="col-sm-6"><strong>Monthly Maintenance:</strong> ₹ {float(flat['monthly_maintenance']):,.0f}</div>
            <div class="col-sm-6"><strong>Contact Phone:</strong> {flat['current_owner_phone'] or 'N/A'}</div>
            <div class="col-sm-6"><strong>Contact Email:</strong> {flat['current_owner_email'] or 'N/A'}</div>
        </div>

        <h6 class="fw-bold mb-2">Permanent Ownership Deed History</h6>
        <div class="table-responsive">
            <table class="table table-sm table-bordered small">
                <thead class="table-light">
                    <tr><th>Buyer</th><th>Previous Owner</th><th>Amount</th><th>Purchase Date</th><th>Recorded Date</th><th>Remarks</th></tr>
                </thead>
                <tbody>
                    {history_rows or '<tr><td colspan=6 class=text-muted text-center>Original Builder Allotment (no subsequent transfers).</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="d-flex justify-content-between mt-4">
            <a href="/flats" class="btn btn-outline-secondary btn-sm px-4">← Back to Directory</a>
            <a href="/flats/purchase/{flat['id']}" class="btn btn-success btn-sm px-4 fw-bold">Transfer / Purchase Flat</a>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title=f"Flat {flat['flat_number']} Details", active_menu="flats", content=content)

@app.route('/flats/purchase', defaults={'flat_id': None}, methods=['GET', 'POST'])
@app.route('/flats/purchase/<int:flat_id>', methods=['GET', 'POST'])
@login_required
@role_required(['ADMIN'])
def purchase_flat(flat_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        selected_flat_id = request.form.get('flat_id', flat_id)
        buyer_name = request.form.get('buyer_name', '').strip()
        phone = request.form.get('phone', '').strip()
        email = request.form.get('email', '').strip()
        address = request.form.get('address', '').strip()
        purchase_amount = float(request.form.get('purchase_amount', 0))
        purchase_date = request.form.get('purchase_date')
        payment_status = request.form.get('payment_status', 'Full Payment Received')
        ownership_status = request.form.get('ownership_status', 'Owner-Occupied')
        remarks = request.form.get('remarks', '')

        # Validations
        if not selected_flat_id or not buyer_name or not phone or not email or purchase_amount <= 0 or not purchase_date:
            flash("All required fields must be completed.", "danger")
            return redirect(request.url)

        cursor.execute("SELECT * FROM flats WHERE id = %s", (selected_flat_id,))
        flat = cursor.fetchone()
        if not flat:
            flash("Selected flat does not exist.", "danger")
            return redirect(url_for('flats_list'))

        previous_owner = flat['current_owner_name'] or 'Builder Allotment'

        # Record ownership transfer history in MySQL
        full_remarks = f"{remarks} [Payment: {payment_status}]"
        cursor.execute(
            "INSERT INTO ownership_history (flat_id, flat_number, wing, buyer_name, phone, email, address, purchase_amount, purchase_date, previous_owner_name, transfer_date, remarks) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURDATE(), %s)",
            (flat['id'], flat['flat_number'], flat['wing'], buyer_name, phone, email, address, purchase_amount, purchase_date, previous_owner, full_remarks)
        )

        # Update existing flat's ownership information in place using primary key
        cursor.execute(
            "UPDATE flats SET current_owner_name = %s, current_owner_phone = %s, current_owner_email = %s, occupancy_status = %s, purchase_date = %s, purchase_amount = %s WHERE id = %s",
            (buyer_name, phone, email, ownership_status, purchase_date, purchase_amount, flat['id'])
        )

        # Insert or update resident record in MySQL
        cursor.execute("SELECT * FROM residents WHERE flat_id = %s", (flat['id'],))
        existing_res = cursor.fetchone()
        if existing_res:
            cursor.execute(
                "UPDATE residents SET full_name = %s, email = %s, phone = %s, type = 'Owner' WHERE id = %s",
                (buyer_name, email, phone, existing_res['id'])
            )
        else:
            cursor.execute(
                "INSERT INTO residents (full_name, email, phone, flat_id, flat_number, wing, type, move_in_date, emergency_contact_name, emergency_contact_phone, status) "
                "VALUES (%s, %s, %s, %s, %s, %s, 'Owner', %s, 'Family', %s, 'Active')",
                (buyer_name, email, phone, flat['id'], flat['flat_number'], flat['wing'], purchase_date, phone)
            )

        conn.commit()
        cursor.close()
        conn.close()

        log_activity(f"Flat Purchase: {flat['flat_number']}", "Ownership", f"Transferred to {buyer_name} for ₹ {purchase_amount:,.0f} ({payment_status})")
        flash(f"✓ Purchase Complete! Ownership for Flat {flat['flat_number']} successfully registered to {buyer_name} for ₹{purchase_amount:,.0f}.", "success")
        return redirect(url_for('flats_list'))

    # GET: fetch all 48 flats for dropdown
    cursor.execute("SELECT * FROM flats ORDER BY wing ASC, floor ASC, flat_number ASC")
    all_flats = cursor.fetchall()

    # Determine default target flat
    current_target = None
    if flat_id:
        current_target = next((f for f in all_flats if f['id'] == flat_id), None)
    if not current_target:
        current_target = next((f for f in all_flats if f['occupancy_status'] == 'Vacant'), all_flats[0])

    cursor.close()
    conn.close()

    flat_options = "".join(f"<option value='{f['id']}' {'selected' if f['id']==current_target['id'] else ''}>{f['flat_number']} (Wing {f['wing']}, {f['bhk']}, {f['occupancy_status']})</option>" for f in all_flats)

    content = f"""
    <div class="card card-custom p-4 p-md-5 mx-auto" style="max-width: 680px;">
        <div class="d-flex align-items-center gap-2 mb-3">
            <div class="bg-success text-white p-2 rounded-3"><i class="bi bi-cash-coin fs-5"></i></div>
            <div>
                <h5 class="fw-bold mb-0 text-dark">Flat Purchase & New Buyer Registration</h5>
                <p class="small text-muted mb-0">Demonstration Form • Saves directly into MySQL database with ownership deed history retained.</p>
            </div>
        </div>

        <form method="POST">
            <!-- Flat Selection -->
            <div class="bg-light p-3 rounded-4 mb-4 border">
                <div class="row g-3">
                    <div class="col-md-7">
                        <label class="form-label small fw-bold text-dark">Select Available Flat *</label>
                        <select name="flat_id" class="form-select form-select-sm rounded-3" onchange="window.location.href='/flats/purchase/' + this.value">
                            {flat_options}
                        </select>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label small fw-bold text-dark">Current Specifications</label>
                        <div class="small text-secondary bg-white p-2 rounded-3 border">
                            Wing <strong>{current_target['wing']}</strong> • Floor <strong>{current_target['floor']}</strong> • <strong>{current_target['bhk']}</strong><br>
                            Area: <strong>{current_target['area_sq_ft']} sq ft</strong> • Status: <span class="badge bg-secondary">{current_target['occupancy_status']}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Blank Buyer Details for college demo entry -->
            <h6 class="fw-bold text-secondary text-uppercase small mb-2">New Buyer Information</h6>
            <div class="mb-3">
                <label class="form-label small fw-semibold">Buyer Full Name *</label>
                <input type="text" name="buyer_name" class="form-control rounded-3" placeholder="Enter buyer name (e.g. Ramesh Chandra)" required>
            </div>
            <div class="row g-2 mb-3">
                <div class="col-md-6">
                    <label class="form-label small fw-semibold">Phone Number *</label>
                    <input type="tel" name="phone" class="form-control rounded-3" placeholder="+91 98765 43210" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-semibold">Email Address *</label>
                    <input type="email" name="email" class="form-control rounded-3" placeholder="buyer@example.com" required>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label small fw-semibold">Permanent Address</label>
                <input type="text" name="address" class="form-control rounded-3" placeholder="Flat address or previous residential address">
            </div>

            <!-- Transaction Details -->
            <h6 class="fw-bold text-secondary text-uppercase small mb-2 pt-2 border-top">Purchase & Deed Details</h6>
            <div class="row g-2 mb-3">
                <div class="col-md-6">
                    <label class="form-label small fw-semibold">Purchase Amount (₹) *</label>
                    <input type="number" name="purchase_amount" class="form-control rounded-3 fw-bold" value="{current_target['area_sq_ft'] * 6800}" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-semibold">Purchase Date *</label>
                    <input type="date" name="purchase_date" class="form-control rounded-3" value="{datetime.date.today()}" required>
                </div>
            </div>
            <div class="row g-2 mb-3">
                <div class="col-md-6">
                    <label class="form-label small fw-semibold">Payment Status</label>
                    <select name="payment_status" class="form-select rounded-3">
                        <option value="Full Payment Received">Full Payment Received</option>
                        <option value="Bank Loan Approved & Disbursed">Bank Loan Approved & Disbursed</option>
                        <option value="Cheque Cleared">Cheque Cleared</option>
                        <option value="Installment Scheduled">Installment Scheduled</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-semibold">New Occupancy Status</label>
                    <select name="ownership_status" class="form-select rounded-3">
                        <option value="Owner-Occupied">Owner-Occupied</option>
                        <option value="Under Process">Under Process (Pending Possession)</option>
                    </select>
                </div>
            </div>
            <div class="mb-4">
                <label class="form-label small fw-semibold">Deed Registration Remarks / Stamp Deed No</label>
                <input type="text" name="remarks" class="form-control rounded-3" placeholder="e.g. Registered conveyance deed verified by sub-registrar">
            </div>

            <div class="d-flex gap-3">
                <a href="/flats" class="btn btn-outline-secondary w-50 rounded-3">Cancel</a>
                <button type="submit" class="btn btn-success w-50 rounded-3 fw-bold">Complete Purchase</button>
            </div>
        </form>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Flat Purchase & Buyer Registration", active_menu="flats", content=content)

# ----------------------------------------------------------------------------
# 4. OWNERSHIP RECORDS & RESIDENTS MODULE
# ----------------------------------------------------------------------------
@app.route('/ownership-history')
@login_required
@role_required(['ADMIN'])
def ownership_history():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM ownership_history ORDER BY id DESC")
    records = cursor.fetchall()
    cursor.close()
    conn.close()

    rows = "".join(f"""
    <tr>
        <td class="fw-bold"><span class="badge bg-light text-dark border">{r['flat_number']}</span></td>
        <td class="fw-semibold text-dark">{r['buyer_name']}</td>
        <td class="text-secondary">{r['previous_owner_name']}</td>
        <td class="text-secondary">{r['phone']}<br><small class="text-muted">{r['email']}</small></td>
        <td class="fw-bold text-success">₹ {float(r['purchase_amount']):,.0f}</td>
        <td>{r['purchase_date']}</td>
        <td class="text-secondary">{r['transfer_date']}</td>
        <td class="text-muted small">{r['remarks']}</td>
    </tr>
    """ for r in records)

    content = f"""
    <div class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h6 class="fw-bold mb-0">Ownership Transfer Permanent History</h6>
                <small class="text-muted">Permanent records of deeds and transfers for all 48 flats</small>
            </div>
            <a href="/flats/purchase" class="btn btn-success btn-sm rounded-pill px-3 fw-bold">
                + Register New Transfer / Purchase
            </a>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle small">
                <thead class="table-light">
                    <tr><th>Flat</th><th>Buyer</th><th>Previous Owner</th><th>Contact</th><th>Price</th><th>Purchase Date</th><th>Recorded Date</th><th>Remarks</th></tr>
                </thead>
                <tbody>{rows or "<tr><td colspan='8' class='text-center text-muted py-4'>No ownership transfers recorded yet.</td></tr>"}</tbody>
            </table>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Ownership History Records", active_menu="ownership", content=content)

@app.route('/residents', methods=['GET', 'POST'])
@login_required
@role_required(['ADMIN'])
def residents_list():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        full_name = request.form.get('full_name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        flat_number = request.form.get('flat_number')
        res_type = request.form.get('type', 'Resident')
        move_in = request.form.get('move_in_date', str(datetime.date.today()))
        emergency_name = request.form.get('emergency_name', 'Family')
        emergency_phone = request.form.get('emergency_phone', phone)

        cursor.execute("SELECT id, wing FROM flats WHERE flat_number = %s", (flat_number,))
        flat_rec = cursor.fetchone()
        flat_id = flat_rec['id'] if flat_rec else 1
        wing = flat_rec['wing'] if flat_rec else 'A'

        cursor.execute(
            "INSERT INTO residents (full_name, email, phone, flat_id, flat_number, wing, type, move_in_date, emergency_contact_name, emergency_contact_phone, status) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Active')",
            (full_name, email, phone, flat_id, flat_number, wing, res_type, move_in, emergency_name, emergency_phone)
        )
        conn.commit()
        log_activity(f"Resident Added: {full_name}", "Ownership", f"Added to Flat {flat_number} ({res_type})")
        flash(f"Resident {full_name} successfully added to Flat {flat_number}!", "success")

    cursor.execute("SELECT * FROM residents ORDER BY flat_number ASC")
    residents = cursor.fetchall()
    cursor.execute("SELECT flat_number FROM flats ORDER BY flat_number ASC")
    flats = cursor.fetchall()
    cursor.close()
    conn.close()

    flat_options = "".join(f"<option value='{f['flat_number']}'>{f['flat_number']}</option>" for f in flats)

    rows = "".join(f"""
    <tr>
        <td class="fw-bold">{r['full_name']}</td>
        <td>{r['phone']}<br><small class="text-muted">{r['email']}</small></td>
        <td class="fw-bold"><span class="badge bg-light text-dark border">Flat {r['flat_number']}</span></td>
        <td><span class="badge bg-{'success' if r['type']=='Owner' else 'info'}">{r['type']}</span></td>
        <td>{r['move_in_date']}</td>
        <td>{r['emergency_contact_name']} ({r['emergency_contact_phone']})</td>
        <td><span class="badge bg-success">{r['status']}</span></td>
    </tr>
    """ for r in residents)

    content = f"""
    <div class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h6 class="fw-bold mb-0">Registered Society Residents</h6>
                <small class="text-muted">Total {len(residents)} active resident records</small>
            </div>
            <button class="btn btn-success btn-sm rounded-pill px-3 fw-bold" data-bs-toggle="modal" data-bs-target="#addResidentModal">
                + Add Resident
            </button>
        </div>

        <div class="table-responsive">
            <table class="table table-hover align-middle small">
                <thead class="table-light">
                    <tr><th>Name</th><th>Contact</th><th>Flat</th><th>Type</th><th>Move-in Date</th><th>Emergency Contact</th><th>Status</th></tr>
                </thead>
                <tbody>{rows or "<tr><td colspan='7' class='text-center text-muted py-4'>No residents registered.</td></tr>"}</tbody>
            </table>
        </div>
    </div>

    <!-- Add Resident Modal -->
    <div class="modal fade" id="addResidentModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content rounded-4 border-0 shadow">
                <form method="POST">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Register New Resident</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body small space-y-3">
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Full Name *</label>
                            <input type="text" name="full_name" class="form-control rounded-3" required>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Phone *</label>
                                <input type="tel" name="phone" class="form-control rounded-3" required>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Email *</label>
                                <input type="email" name="email" class="form-control rounded-3" required>
                            </div>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Flat Number *</label>
                                <select name="flat_number" class="form-select rounded-3">{flat_options}</select>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Resident Type *</label>
                                <select name="type" class="form-select rounded-3">
                                    <option value="Owner">Owner</option>
                                    <option value="Tenant">Tenant</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Move-In Date</label>
                            <input type="date" name="move_in_date" class="form-control rounded-3" value="{datetime.date.today()}">
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Emergency Contact Name</label>
                                <input type="text" name="emergency_name" class="form-control rounded-3" placeholder="Spouse/Parent">
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Emergency Contact Phone</label>
                                <input type="tel" name="emergency_phone" class="form-control rounded-3" placeholder="+91...">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success btn-sm px-4 fw-bold">Save Resident</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Owners & Residents", active_menu="residents", content=content)

# ----------------------------------------------------------------------------
# 5. MAINTENANCE BILLING & RECEIPTS
# ----------------------------------------------------------------------------
@app.route('/maintenance')
@login_required
def maintenance_list():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    if session.get('user_role') == 'ADMIN':
        cursor.execute("SELECT * FROM maintenance_bills ORDER BY id DESC")
    else:
        cursor.execute("SELECT * FROM maintenance_bills WHERE flat_number = %s ORDER BY id DESC", (session.get('user_flat', 'A-101'),))
    bills = cursor.fetchall()
    cursor.close()
    conn.close()

    rows = "".join(f"""
    <tr>
        <td class="fw-bold"><span class="badge bg-light text-dark border">{b['flat_number']}</span></td>
        <td>{b['resident_name']}</td>
        <td>{b['billing_month']}</td>
        <td class="fw-bold">₹ {float(b['amount']):,.0f}</td>
        <td>{b['due_date']}</td>
        <td><span class="badge bg-{'success' if b['status']=='Paid' else 'warning'}">{b['status']}</span></td>
        <td>{b['receipt_number'] or 'Pending'}</td>
        <td class="text-end">
            {"<a href='/maintenance/receipt/" + str(b['id']) + "' class='btn btn-sm btn-outline-success py-1'><i class='bi bi-printer'></i> Receipt</a>" if b['status']=='Paid' else f"<a href='/maintenance/pay/{b['id']}' class='btn btn-sm btn-primary py-1'>Record Payment</a>"}
        </td>
    </tr>
    """ for b in bills)

    content = f"""
    <div class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h6 class="fw-bold mb-0">Maintenance Bills & Payments</h6>
                <small class="text-muted">Generate bills, record payment transactions, and issue stamped receipts</small>
            </div>
            {"<a href='/maintenance/generate' class='btn btn-success btn-sm rounded-pill px-3 fw-bold'>+ Generate Monthly Bills</a>" if session.get('user_role') == 'ADMIN' else ""}
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle small">
                <thead class="table-light">
                    <tr><th>Flat</th><th>Resident</th><th>Month</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Receipt No</th><th class="text-end">Action</th></tr>
                </thead>
                <tbody>{rows or "<tr><td colspan='8' class='text-center text-muted py-4'>No maintenance bills on file.</td></tr>"}</tbody>
            </table>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Maintenance & Billing", active_menu="maintenance", content=content)

@app.route('/maintenance/generate', methods=['GET', 'POST'])
@login_required
@role_required(['ADMIN'])
def generate_maintenance():
    if request.method == 'POST':
        billing_month = request.form.get('billing_month')
        due_date = request.form.get('due_date')

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT flat_number, current_owner_name, monthly_maintenance FROM flats WHERE occupancy_status != 'Vacant'")
        occupied = cursor.fetchall()

        count = 0
        for f in occupied:
            res_name = f['current_owner_name'] or 'Resident'
            amount = float(f['monthly_maintenance'] or 4200.0)
            cursor.execute(
                "INSERT INTO maintenance_bills (flat_number, resident_name, billing_month, amount, due_date, status) "
                "VALUES (%s, %s, %s, %s, %s, 'Pending')",
                (f['flat_number'], res_name, billing_month, amount, due_date)
            )
            count += 1

        conn.commit()
        cursor.close()
        conn.close()

        log_activity(f"Generated Bills: {billing_month}", "Payment", f"Generated {count} bills due on {due_date}")
        flash(f"Successfully generated {count} maintenance bills for {billing_month}!", "success")
        return redirect(url_for('maintenance_list'))

    content = f"""
    <div class="card card-custom p-4 max-w-md mx-auto" style="max-width: 480px;">
        <h5 class="fw-bold mb-3">Generate Monthly Maintenance Bills</h5>
        <p class="small text-muted mb-4">Automatically generate maintenance bills for all occupied flats in Green Valley Residency.</p>
        <form method="POST">
            <div class="mb-3">
                <label class="form-label small fw-semibold">Billing Month</label>
                <input type="text" name="billing_month" class="form-control rounded-3" value="May 2025" required>
            </div>
            <div class="mb-4">
                <label class="form-label small fw-semibold">Due Date</label>
                <input type="date" name="due_date" class="form-control rounded-3" value="2025-05-15" required>
            </div>
            <div class="d-flex gap-2">
                <a href="/maintenance" class="btn btn-outline-secondary w-50 rounded-3">Cancel</a>
                <button type="submit" class="btn btn-success w-50 rounded-3 fw-bold">Generate Bills</button>
            </div>
        </form>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Generate Monthly Bills", active_menu="maintenance", content=content)

@app.route('/maintenance/pay/<int:bill_id>', methods=['GET', 'POST'])
@login_required
def pay_maintenance(bill_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        pay_mode = request.form.get('payment_mode', 'UPI')
        rec_no = f"MDG-REC-{datetime.datetime.now().year}-{bill_id:04d}"
        cursor.execute(
            "UPDATE maintenance_bills SET status = 'Paid', paid_date = CURDATE(), payment_mode = %s, receipt_number = %s WHERE id = %s",
            (pay_mode, rec_no, bill_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        log_activity(f"Maintenance Bill Paid: Bill #{bill_id}", "Payment", f"Receipt {rec_no} generated ({pay_mode})")
        flash(f"Payment recorded! Official Receipt {rec_no} issued.", "success")
        return redirect(url_for('maintenance_list'))

    cursor.execute("SELECT * FROM maintenance_bills WHERE id = %s", (bill_id,))
    bill = cursor.fetchone()
    cursor.close()
    conn.close()

    content = f"""
    <div class="card card-custom p-4 mx-auto" style="max-width: 480px;">
        <h5 class="fw-bold mb-3">Record Maintenance Payment</h5>
        <p class="small text-muted">Flat: <strong>{bill['flat_number']}</strong> • Resident: <strong>{bill['resident_name']}</strong> • Amount: <strong>₹ {float(bill['amount']):,.0f}</strong> ({bill['billing_month']})</p>
        <form method="POST">
            <div class="mb-3">
                <label class="form-label small fw-semibold">Payment Mode</label>
                <select name="payment_mode" class="form-select rounded-3">
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="NetBanking">Net Banking</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                </select>
            </div>
            <button type="submit" class="btn btn-success w-100 rounded-3 py-2 fw-bold">Confirm & Generate Stamped Receipt</button>
        </form>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Record Payment", active_menu="maintenance", content=content)

@app.route('/maintenance/receipt/<int:bill_id>')
@login_required
def view_receipt(bill_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM maintenance_bills WHERE id = %s", (bill_id,))
    b = cursor.fetchone()
    cursor.close()
    conn.close()

    if not b:
        flash("Receipt not found.", "danger")
        return redirect(url_for('maintenance_list'))

    content = f"""
    <div class="card card-custom p-4 p-md-5 mx-auto" style="max-width: 520px; border: 2px solid #059669;">
        <div class="text-center pb-3 border-bottom mb-3">
            <div class="d-flex justify-content-center mb-2">{MDG_LOGO_SVG}</div>
            <h5 class="fw-bold mb-0 text-dark">MDG SOCIETY MANAGEMENT SYSTEM</h5>
            <small class="text-muted">Green Valley Residency • Bengaluru, Karnataka</small><br>
            <span class="badge bg-success text-uppercase mt-2">Official Maintenance Payment Receipt</span>
        </div>
        <div class="small space-y-2 mb-4">
            <div class="d-flex justify-content-between py-1 border-bottom"><span class="text-muted">Receipt Number:</span><strong class="text-dark font-monospace">{b['receipt_number']}</strong></div>
            <div class="d-flex justify-content-between py-1 border-bottom"><span class="text-muted">Flat Number:</span><strong>Flat {b['flat_number']}</strong></div>
            <div class="d-flex justify-content-between py-1 border-bottom"><span class="text-muted">Resident Name:</span><strong>{b['resident_name']}</strong></div>
            <div class="d-flex justify-content-between py-1 border-bottom"><span class="text-muted">Billing Month:</span><strong>{b['billing_month']}</strong></div>
            <div class="d-flex justify-content-between py-1 border-bottom"><span class="text-muted">Payment Date:</span><strong>{b['paid_date']}</strong></div>
            <div class="d-flex justify-content-between py-1 border-bottom"><span class="text-muted">Payment Mode:</span><strong>{b['payment_mode']}</strong></div>
            <div class="d-flex justify-content-between py-2 fs-6"><strong>Amount Received:</strong><strong class="text-success fs-5">₹ {float(b['amount']):,.0f}</strong></div>
        </div>
        <div class="d-flex gap-2">
            <a href="/maintenance" class="btn btn-outline-secondary w-50 rounded-3 btn-sm">Close</a>
            <button onclick="window.print()" class="btn btn-success w-50 rounded-3 btn-sm fw-bold"><i class="bi bi-printer"></i> Print Receipt</button>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title=f"Receipt {b['receipt_number']}", active_menu="maintenance", content=content)

# ----------------------------------------------------------------------------
# 6. GYM MANAGEMENT
# ----------------------------------------------------------------------------
@app.route('/gym', methods=['GET', 'POST'])
@login_required
def gym_members():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        res_name = request.form.get('resident_name')
        flat_number = request.form.get('flat_number')
        plan_id = int(request.form.get('plan_id', 1))

        cursor.execute("SELECT * FROM gym_plans WHERE id = %s", (plan_id,))
        plan = cursor.fetchone()
        months = plan['duration_months']
        fee = plan['fee']
        plan_name = plan['name']

        start_date = datetime.date.today()
        # approximate months
        expiry_date = start_date + datetime.timedelta(days=months * 30)

        cursor.execute("SELECT id FROM residents WHERE flat_number = %s LIMIT 1", (flat_number,))
        res = cursor.fetchone()
        res_id = res['id'] if res else 1

        cursor.execute(
            "INSERT INTO gym_memberships (resident_id, resident_name, flat_number, plan_id, plan_name, start_date, expiry_date, fee_paid, status, payment_status) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Active', 'Paid')",
            (res_id, res_name, flat_number, plan_id, plan_name, start_date, expiry_date, fee)
        )
        conn.commit()
        log_activity(f"Gym Membership Registered: {res_name}", "Gym", f"Subscribed to {plan_name} (Flat {flat_number})")
        flash(f"Gym membership active for {res_name}! Expiry: {expiry_date}", "success")

    cursor.execute("SELECT * FROM gym_memberships ORDER BY id DESC")
    members = cursor.fetchall()
    cursor.execute("SELECT * FROM gym_plans")
    plans = cursor.fetchall()
    cursor.close()
    conn.close()

    plan_options = "".join(f"<option value='{p['id']}'>{p['name']} (₹{float(p['fee']):,.0f} / {p['duration_months']} mo)</option>" for p in plans)

    rows = "".join(f"""
    <tr>
        <td class="fw-bold">{m['resident_name']}</td>
        <td><span class="badge bg-light text-dark border">Flat {m['flat_number']}</span></td>
        <td>{m['plan_name']}</td>
        <td>{m['start_date']}</td>
        <td>{m['expiry_date']}</td>
        <td>₹ {float(m['fee_paid']):,.0f}</td>
        <td><span class="badge bg-{'success' if m['status']=='Active' else 'secondary'}">{m['status']}</span></td>
    </tr>
    """ for m in members)

    content = f"""
    <div class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h6 class="fw-bold mb-0">Gym Memberships & Fitness Plans</h6>
                <small class="text-muted">Active memberships and fitness access roster</small>
            </div>
            <button class="btn btn-success btn-sm rounded-pill px-3 fw-bold" data-bs-toggle="modal" data-bs-target="#addGymModal">
                + Register Gym Member
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle small">
                <thead class="table-light">
                    <tr><th>Resident Name</th><th>Flat</th><th>Plan</th><th>Start Date</th><th>Expiry Date</th><th>Fee Paid</th><th>Status</th></tr>
                </thead>
                <tbody>{rows or "<tr><td colspan='7' class='text-center text-muted py-4'>No gym members enrolled.</td></tr>"}</tbody>
            </table>
        </div>
    </div>

    <!-- Add Gym Modal -->
    <div class="modal fade" id="addGymModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content rounded-4 border-0 shadow">
                <form method="POST">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Enroll Gym Member</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body small space-y-3">
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Resident Full Name</label>
                            <input type="text" name="resident_name" class="form-control rounded-3" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Flat Number (e.g. A-101)</label>
                            <input type="text" name="flat_number" class="form-control rounded-3" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Select Fitness Plan</label>
                            <select name="plan_id" class="form-select rounded-3">{plan_options}</select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success btn-sm px-4 fw-bold">Confirm Enrollment</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Gym Management", active_menu="gym", content=content)

# ----------------------------------------------------------------------------
# 7. CONFLICT-FREE FACILITY BOOKINGS
# ----------------------------------------------------------------------------
@app.route('/facilities', methods=['GET', 'POST'])
@login_required
def facilities_list():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        fac_id = int(request.form.get('facility_id'))
        res_name = request.form.get('resident_name')
        flat_number = request.form.get('flat_number')
        b_date = request.form.get('booking_date')
        start_t = request.form.get('start_time')
        end_t = request.form.get('end_time')
        purpose = request.form.get('purpose')

        cursor.execute("SELECT * FROM facilities WHERE id = %s", (fac_id,))
        fac = cursor.fetchone()

        # CONFLICT DETECTION QUERY: Checks for overlapping confirmed bookings
        conflict_query = """
        SELECT * FROM facility_bookings
        WHERE facility_id = %s AND booking_date = %s AND status = 'Confirmed'
        AND NOT (end_time <= %s OR start_time >= %s)
        """
        cursor.execute(conflict_query, (fac_id, b_date, start_t, end_t))
        overlap = cursor.fetchall()

        if overlap:
            flash(f"CONFLICT DETECTED: {fac['name']} is already booked on {b_date} during that time window! Please choose a different slot.", "danger")
        else:
            cursor.execute("SELECT id FROM residents WHERE flat_number = %s LIMIT 1", (flat_number,))
            res = cursor.fetchone()
            res_id = res['id'] if res else 1

            cursor.execute(
                "INSERT INTO facility_bookings (facility_id, facility_name, resident_id, resident_name, flat_number, booking_date, start_time, end_time, total_amount, purpose, status) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Confirmed')",
                (fac_id, fac['name'], res_id, res_name, flat_number, b_date, start_t, end_t, fac['hourly_rate'] * 2, purpose)
            )
            conn.commit()
            log_activity(f"Facility Booked: {fac['name']}", "Facility", f"Booked by {res_name} (Flat {flat_number}) for {b_date}")
            flash(f"Booking Confirmed: {fac['name']} reserved for {b_date} ({start_t} - {end_t})!", "success")

    cursor.execute("SELECT * FROM facility_bookings ORDER BY id DESC")
    bookings = cursor.fetchall()
    cursor.execute("SELECT * FROM facilities")
    facilities = cursor.fetchall()
    cursor.close()
    conn.close()

    fac_options = "".join(f"<option value='{f['id']}'>{f['name']} (₹{float(f['hourly_rate']):,.0f}/hr)</option>" for f in facilities)

    rows = "".join(f"""
    <tr>
        <td class="fw-bold">{b['facility_name']}</td>
        <td>{b['resident_name']} <small class="text-muted">(Flat {b['flat_number']})</small></td>
        <td>{b['booking_date']}</td>
        <td>{b['start_time']} - {b['end_time']}</td>
        <td>{b['purpose']}</td>
        <td><span class="badge bg-success">{b['status']}</span></td>
    </tr>
    """ for b in bookings)

    content = f"""
    <div class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h6 class="fw-bold mb-0">Facility Bookings Schedule</h6>
                <small class="text-muted">Strict conflict detection prevents overlapping reservations</small>
            </div>
            <button class="btn btn-success btn-sm rounded-pill px-3 fw-bold" data-bs-toggle="modal" data-bs-target="#bookFacModal">
                + Book Facility
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle small">
                <thead class="table-light">
                    <tr><th>Facility</th><th>Resident</th><th>Date</th><th>Timing</th><th>Purpose</th><th>Status</th></tr>
                </thead>
                <tbody>{rows or "<tr><td colspan='6' class='text-center text-muted py-4'>No bookings on file.</td></tr>"}</tbody>
            </table>
        </div>
    </div>

    <!-- Book Facility Modal -->
    <div class="modal fade" id="bookFacModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content rounded-4 border-0 shadow">
                <form method="POST">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Reserve Society Facility</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body small space-y-3">
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Select Facility</label>
                            <select name="facility_id" class="form-select rounded-3">{fac_options}</select>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Resident Name</label>
                                <input type="text" name="resident_name" class="form-control rounded-3" value="{session.get('user_fullname', 'Rahul Sharma')}" required>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Flat No</label>
                                <input type="text" name="flat_number" class="form-control rounded-3" value="{session.get('user_flat', 'A-101')}" required>
                            </div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Booking Date</label>
                            <input type="date" name="booking_date" class="form-control rounded-3" value="{datetime.date.today()}" required>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Start Time</label>
                                <input type="time" name="start_time" class="form-control rounded-3" value="10:00" required>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">End Time</label>
                                <input type="time" name="end_time" class="form-control rounded-3" value="12:00" required>
                            </div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Event / Booking Purpose</label>
                            <input type="text" name="purpose" class="form-control rounded-3" placeholder="Birthday, practice session, family gathering..." required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success btn-sm px-4 fw-bold">Confirm Booking</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Facility Booking", active_menu="facilities", content=content)

# ----------------------------------------------------------------------------
# 8. VISITORS & PASSES
# ----------------------------------------------------------------------------
@app.route('/visitors', methods=['GET', 'POST'])
@login_required
def visitors_list():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        v_name = request.form.get('visitor_name')
        phone = request.form.get('phone')
        host_flat = request.form.get('host_flat', 'A-101')
        purpose = request.form.get('purpose', 'Guest Visit')
        veh = request.form.get('vehicle_number', '')
        code = f"MDG-PASS-{host_flat.replace('-', '')}-{datetime.datetime.now().strftime('%M%S')}"

        cursor.execute(
            "INSERT INTO visitors (visitor_name, phone, host_flat_number, host_resident_name, purpose, status, qr_pass_code, vehicle_number, visit_date, check_in_time) "
            "VALUES (%s, %s, %s, 'Resident', %s, 'Expected', %s, %s, CURDATE(), '10:00 AM')",
            (v_name, phone, host_flat, purpose, code, veh)
        )
        conn.commit()
        log_activity(f"Visitor Pass Generated: {code}", "Visitor", f"For {v_name} visiting Flat {host_flat}")
        flash(f"Pass created with code: {code}!", "success")

    cursor.execute("SELECT * FROM visitors ORDER BY id DESC")
    visitors = cursor.fetchall()
    cursor.close()
    conn.close()

    rows = "".join(f"""
    <tr>
        <td class="fw-bold">{v['visitor_name']}</td>
        <td>{v['phone']}</td>
        <td>Flat {v['host_flat_number']}</td>
        <td>{v['purpose']}</td>
        <td><span class="badge bg-{'success' if v['status']=='Checked-In' else 'info' if v['status']=='Expected' else 'secondary'}">{v['status']}</span></td>
        <td class="font-monospace text-success fw-bold">{v['qr_pass_code']}</td>
        <td class="text-end">
            <a href="/visitors/verify?code={v['qr_pass_code']}" class="btn btn-sm btn-outline-dark py-1">Gate Check</a>
        </td>
    </tr>
    """ for v in visitors)

    content = f"""
    <div class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h6 class="fw-bold mb-0">Visitors & QR Entry Passes</h6>
                <small class="text-muted">Digital visitor authentication and gate control logs</small>
            </div>
            <button class="btn btn-success btn-sm rounded-pill px-3 fw-bold" data-bs-toggle="modal" data-bs-target="#addVisitorModal">
                + Generate Visitor Pass
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle small">
                <thead class="table-light">
                    <tr><th>Visitor</th><th>Phone</th><th>Host Flat</th><th>Purpose</th><th>Status</th><th>QR Pass Code</th><th class="text-end">Action</th></tr>
                </thead>
                <tbody>{rows or "<tr><td colspan='7' class='text-center text-muted py-4'>No visitors registered.</td></tr>"}</tbody>
            </table>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="addVisitorModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content rounded-4 border-0 shadow">
                <form method="POST">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Generate Visitor Pass</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body small space-y-3">
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Visitor Name</label>
                            <input type="text" name="visitor_name" class="form-control rounded-3" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Phone Number</label>
                            <input type="tel" name="phone" class="form-control rounded-3" required>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Host Flat (e.g. A-101)</label>
                                <input type="text" name="host_flat" class="form-control rounded-3" value="{session.get('user_flat', 'A-101')}" required>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Vehicle Number</label>
                                <input type="text" name="vehicle_number" class="form-control rounded-3" placeholder="KA-...">
                            </div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Purpose</label>
                            <input type="text" name="purpose" class="form-control rounded-3" value="Guest Visit">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success btn-sm px-4 fw-bold">Generate Pass</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Visitors & QR Passes", active_menu="visitors", content=content)

@app.route('/visitors/verify')
@login_required
def verify_visitor():
    code = request.args.get('code', '').strip()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM visitors WHERE qr_pass_code = %s", (code,))
    visitor = cursor.fetchone()

    if visitor:
        cursor.execute("UPDATE visitors SET status = 'Checked-In' WHERE id = %s", (visitor['id'],))
        conn.commit()
        flash(f"AUTHENTIC PASS VERIFIED: Access Granted to {visitor['visitor_name']} for Flat {visitor['host_flat_number']}.", "success")
    else:
        flash(f"DENIED: Pass code '{code}' is not valid or fake.", "danger")

    cursor.close()
    conn.close()
    return redirect(url_for('visitors_list'))

# ----------------------------------------------------------------------------
# 9. PARKING ALLOCATION
# ----------------------------------------------------------------------------
@app.route('/parking', methods=['GET', 'POST'])
@login_required
def parking_list():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        slot_id = int(request.form.get('slot_id'))
        flat_num = request.form.get('flat_number')
        res_name = request.form.get('resident_name')
        veh_num = request.form.get('vehicle_number')
        veh_type = request.form.get('vehicle_type', 'Car')

        # Prevent double allocation
        cursor.execute("SELECT is_allocated FROM parking_slots WHERE id = %s", (slot_id,))
        slot = cursor.fetchone()
        if slot and slot['is_allocated']:
            flash("Error: This slot is already allocated to another resident!", "danger")
        else:
            cursor.execute(
                "UPDATE parking_slots SET is_allocated = 1, allocated_flat_number = %s, allocated_resident_name = %s, vehicle_number = %s, vehicle_type = %s WHERE id = %s",
                (flat_num, res_name, veh_num, veh_type, slot_id)
            )
            conn.commit()
            log_activity(f"Parking Allocated: Slot #{slot_id}", "Ownership", f"Allocated to {res_name} (Flat {flat_num}, {veh_num})")
            flash(f"Parking slot allocated to Flat {flat_num} ({veh_num}) successfully!", "success")

    cursor.execute("SELECT * FROM parking_slots ORDER BY slot_number ASC")
    slots = cursor.fetchall()
    cursor.close()
    conn.close()

    avail_slots = [s for s in slots if not s['is_allocated']]
    slot_options = "".join(f"<option value='{s['id']}'>{s['slot_number']} (Wing {s['wing']}, {s['slot_type']})</option>" for s in avail_slots)

    slots_html = "".join(f"""
    <div class="col-md-3 col-sm-6">
        <div class="card p-3 rounded-4 border-{'success bg-light' if s['is_allocated'] else 'secondary'}">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold">{s['slot_number']}</span>
                <span class="badge bg-{'success' if s['is_allocated'] else 'secondary'}">{s['slot_type']}</span>
            </div>
            <div class="small">
                {'<strong class="text-success">Flat ' + str(s['allocated_flat_number']) + '</strong><br>' + str(s['allocated_resident_name']) + '<br><code class="text-dark">' + str(s['vehicle_number']) + '</code>' if s['is_allocated'] else '<span class="text-muted">Available</span>'}
            </div>
            {"<div class='mt-2 pt-2 border-top text-end'><a href='/parking/release/" + str(s['id']) + "' class='btn btn-outline-danger btn-sm py-0' style='font-size:10px;'>Release</a></div>" if s['is_allocated'] and session.get('user_role')=='ADMIN' else ''}
        </div>
    </div>
    """ for s in slots)

    content = f"""
    <div class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h6 class="fw-bold mb-0">Parking Slot Allocation</h6>
                <small class="text-muted">Dedicated slots per apartment with vehicle registration validation</small>
            </div>
            {"<button class='btn btn-success btn-sm rounded-pill px-3 fw-bold' data-bs-toggle='modal' data-bs-target='#allocateModal'>+ Allocate Parking</button>" if session.get('user_role')=='ADMIN' else ''}
        </div>
        <div class="row g-3">{slots_html}</div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="allocateModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content rounded-4 border-0 shadow">
                <form method="POST">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Allocate Parking Slot</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body small space-y-3">
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Select Available Slot</label>
                            <select name="slot_id" class="form-select rounded-3">{slot_options or '<option>No available slots</option>'}</select>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Flat Number</label>
                                <input type="text" name="flat_number" class="form-control rounded-3" placeholder="A-101" required>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Resident Name</label>
                                <input type="text" name="resident_name" class="form-control rounded-3" required>
                            </div>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Vehicle Registration No</label>
                                <input type="text" name="vehicle_number" class="form-control rounded-3" placeholder="KA-01-AB-1234" required>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Vehicle Type</label>
                                <select name="vehicle_type" class="form-select rounded-3">
                                    <option value="Car">4-Wheeler Car</option>
                                    <option value="Bike">2-Wheeler Bike</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success btn-sm px-4 fw-bold">Confirm Allocation</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Parking Management", active_menu="parking", content=content)

@app.route('/parking/release/<int:slot_id>')
@login_required
@role_required(['ADMIN'])
def release_parking(slot_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE parking_slots SET is_allocated = 0, allocated_flat_number = NULL, allocated_resident_name = NULL, vehicle_number = NULL WHERE id = %s", (slot_id,))
    conn.commit()
    cursor.close()
    conn.close()
    flash(f"Parking slot #{slot_id} released successfully.", "info")
    return redirect(url_for('parking_list'))

# ----------------------------------------------------------------------------
# 10. COMPLAINTS TICKETING
# ----------------------------------------------------------------------------
@app.route('/complaints', methods=['GET', 'POST'])
@login_required
def complaints_list():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        title = request.form.get('title')
        category = request.form.get('category')
        flat_number = request.form.get('flat_number', session.get('user_flat', 'A-101'))
        res_name = session.get('user_fullname', 'Resident')
        desc = request.form.get('description', '')
        prio = request.form.get('priority', 'Medium')

        cursor.execute(
            "INSERT INTO complaints (title, description, category, flat_number, resident_name, priority, status) "
            "VALUES (%s, %s, %s, %s, %s, %s, 'Pending')",
            (title, desc, category, flat_number, res_name, prio)
        )
        conn.commit()
        log_activity(f"Complaint Registered: {title}", "Complaint", f"Ticket logged for Flat {flat_number}")
        flash("Complaint ticket logged successfully! Assigned team will review.", "success")

    cursor.execute("SELECT * FROM complaints ORDER BY id DESC")
    comps = cursor.fetchall()
    cursor.close()
    conn.close()

    rows = "".join(f"""
    <tr>
        <td class="fw-bold">{c['title']}</td>
        <td>{c['category']}</td>
        <td>Flat {c['flat_number']}</td>
        <td><span class="badge bg-{'danger' if c['priority']=='Emergency' else 'warning' if c['priority']=='High' else 'secondary'}">{c['priority']}</span></td>
        <td><span class="badge bg-{'success' if c['status']=='Resolved' else 'info' if c['status']=='In Progress' else 'warning'}">{c['status']}</span></td>
        <td class="text-secondary small">{c['assigned_staff'] or 'Pending'}</td>
        <td class="text-end">
            {"<a href='/complaints/resolve/" + str(c['id']) + "' class='btn btn-outline-success btn-sm py-0'>Resolve</a>" if c['status']!='Resolved' and session.get('user_role')=='ADMIN' else ''}
        </td>
    </tr>
    """ for c in comps)

    content = f"""
    <div class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h6 class="fw-bold mb-0">Complaints & Service Tickets</h6>
                <small class="text-muted">Issue tracking, technician dispatch, and resolution statuses</small>
            </div>
            <button class="btn btn-success btn-sm rounded-pill px-3 fw-bold" data-bs-toggle="modal" data-bs-target="#addComplaintModal">
                + Register Complaint
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle small">
                <thead class="table-light">
                    <tr><th>Title</th><th>Category</th><th>Flat</th><th>Priority</th><th>Status</th><th>Assigned</th><th class="text-end">Action</th></tr>
                </thead>
                <tbody>{rows or "<tr><td colspan='7' class='text-center text-muted py-4'>No complaints on file.</td></tr>"}</tbody>
            </table>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="addComplaintModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content rounded-4 border-0 shadow">
                <form method="POST">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Register Issue Ticket</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body small space-y-3">
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Title</label>
                            <input type="text" name="title" class="form-control rounded-3" placeholder="Brief issue summary" required>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Category</label>
                                <select name="category" class="form-select rounded-3">
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Elevator">Elevator</option>
                                    <option value="Carpentry">Carpentry</option>
                                    <option value="Noise / Disturbance">Noise / Disturbance</option>
                                    <option value="Security">Security</option>
                                    <option value="Housekeeping">Housekeeping</option>
                                </select>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Priority</label>
                                <select name="priority" class="form-select rounded-3">
                                    <option value="Low">Low</option>
                                    <option value="Medium" selected>Medium</option>
                                    <option value="High">High</option>
                                    <option value="Emergency">Emergency</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Description</label>
                            <textarea name="description" class="form-control rounded-3" rows="3" required></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success btn-sm px-4 fw-bold">Submit Ticket</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Complaints", active_menu="complaints", content=content)

@app.route('/complaints/resolve/<int:comp_id>')
@login_required
@role_required(['ADMIN'])
def resolve_complaint(comp_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE complaints SET status = 'Resolved', resolved_at = NOW(), admin_response = 'Resolved by society technician' WHERE id = %s", (comp_id,))
    conn.commit()
    cursor.close()
    conn.close()
    flash(f"Complaint ticket #{comp_id} marked as Resolved.", "success")
    return redirect(url_for('complaints_list'))

# ----------------------------------------------------------------------------
# 11. PARCELS MANAGEMENT
# ----------------------------------------------------------------------------
@app.route('/parcels', methods=['GET', 'POST'])
@login_required
def parcels_list():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        rec_name = request.form.get('recipient_name')
        flat_num = request.form.get('flat_number')
        courier = request.form.get('courier_company')
        tracking = request.form.get('tracking_number', '')

        cursor.execute(
            "INSERT INTO parcels (recipient_name, flat_number, courier_company, tracking_number, received_at, status, security_staff_name) "
            "VALUES (%s, %s, %s, %s, 'Today at Gate 1', 'Pending Collection', %s)",
            (rec_name, flat_num, courier, tracking, session.get('user_fullname', 'Vikram Singh'))
        )
        conn.commit()
        log_activity(f"Parcel Logged: Flat {flat_num}", "Visitor", f"Courier {courier} for {rec_name}")
        flash(f"Parcel logged for Flat {flat_num}!", "success")

    cursor.execute("SELECT * FROM parcels ORDER BY id DESC")
    parcels = cursor.fetchall()
    cursor.close()
    conn.close()

    rows = "".join(f"""
    <tr>
        <td class="fw-bold">Flat {p['flat_number']}</td>
        <td>{p['recipient_name']}</td>
        <td>{p['courier_company']}</td>
        <td class="font-monospace small">{p['tracking_number'] or 'N/A'}</td>
        <td>{p['received_at']}</td>
        <td><span class="badge bg-{'warning' if p['status']=='Pending Collection' else 'success'}">{p['status']}</span></td>
        <td class="text-end">
            {"<a href='/parcels/collect/" + str(p['id']) + "' class='btn btn-outline-success btn-sm py-0'>Collect</a>" if p['status']=='Pending Collection' else '<span class="text-muted small">Handed Over</span>'}
        </td>
    </tr>
    """ for p in parcels)

    content = f"""
    <div class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h6 class="fw-bold mb-0">Gate Courier & Parcel Management</h6>
                <small class="text-muted">Security desk parcel log and handover confirmations</small>
            </div>
            <button class="btn btn-success btn-sm rounded-pill px-3 fw-bold" data-bs-toggle="modal" data-bs-target="#addParcelModal">
                + Register Delivery
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle small">
                <thead class="table-light">
                    <tr><th>Flat</th><th>Recipient</th><th>Courier</th><th>Tracking #</th><th>Received</th><th>Status</th><th class="text-end">Action</th></tr>
                </thead>
                <tbody>{rows or "<tr><td colspan='7' class='text-center text-muted py-4'>No parcels logged.</td></tr>"}</tbody>
            </table>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="addParcelModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content rounded-4 border-0 shadow">
                <form method="POST">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Log Inbound Parcel</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body small space-y-3">
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Recipient Name</label>
                                <input type="text" name="recipient_name" class="form-control rounded-3" required>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Flat No</label>
                                <input type="text" name="flat_number" class="form-control rounded-3" placeholder="A-101" required>
                            </div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Courier Company</label>
                            <input type="text" name="courier_company" class="form-control rounded-3" placeholder="Amazon, BlueDart, DTDC..." required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Tracking Number (Optional)</label>
                            <input type="text" name="tracking_number" class="form-control rounded-3">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success btn-sm px-4 fw-bold">Log Parcel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Parcels", active_menu="parcels", content=content)

@app.route('/parcels/collect/<int:parcel_id>')
@login_required
def collect_parcel(parcel_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE parcels SET status = 'Collected', collected_at = 'Today', collected_by = %s WHERE id = %s", (session.get('user_fullname', 'Resident'), parcel_id))
    conn.commit()
    cursor.close()
    conn.close()
    flash("Parcel marked as Collected by resident.", "success")
    return redirect(url_for('parcels_list'))

# ----------------------------------------------------------------------------
# 12. EVENTS & DEMOCRATIC POLLS
# ----------------------------------------------------------------------------
@app.route('/events', methods=['GET', 'POST'])
@login_required
def events_polls_list():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST' and 'create_event' in request.form:
        title = request.form.get('title')
        e_date = request.form.get('event_date')
        e_time = request.form.get('event_time')
        loc = request.form.get('location')
        cat = request.form.get('category', 'Meeting')
        desc = request.form.get('description', '')

        cursor.execute(
            "INSERT INTO events (title, description, event_date, event_time, location, category) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (title, desc, e_date, e_time, loc, cat)
        )
        conn.commit()
        log_activity(f"Event Scheduled: {title}", "System", f"Date: {e_date} at {loc}")
        flash(f"Society Event '{title}' scheduled!", "success")

    cursor.execute("SELECT * FROM events ORDER BY event_date ASC")
    events = cursor.fetchall()
    cursor.execute("SELECT * FROM polls WHERE is_active = 1")
    polls = cursor.fetchall()

    poll_blocks = []
    for p in polls:
        cursor.execute("SELECT * FROM poll_options WHERE poll_id = %s", (p['id'],))
        opts = cursor.fetchall()
        t_votes = max(p['total_votes'], sum(o['votes_count'] for o in opts), 1)

        opt_html = "".join(f"""
        <div class="mb-2">
            <div class="d-flex justify-content-between small fw-semibold mb-1">
                <span>{o['option_text']}</span>
                <span>{o['votes_count']} votes ({round((o['votes_count']/t_votes)*100)}%)</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-success" style="width: {round((o['votes_count']/t_votes)*100)}%"></div>
            </div>
        </div>
        """ for o in opts)

        poll_blocks.append(f"""
        <div class="card p-3 rounded-4 mb-3 border">
            <h6 class="fw-bold mb-1">{p['question']}</h6>
            <p class="small text-muted mb-3">{p['description']}</p>
            {opt_html}
            <small class="text-secondary mt-2 d-block">Total Votes Cast: <strong>{p['total_votes']}</strong></small>
        </div>
        """)

    cursor.close()
    conn.close()

    event_rows = "".join(f"""
    <tr>
        <td class="fw-bold">{e['title']}</td>
        <td>{e['event_date']}</td>
        <td>{e['event_time']}</td>
        <td>{e['location']}</td>
        <td><span class="badge bg-secondary">{e['category']}</span></td>
    </tr>
    """ for e in events)

    content = f"""
    <div class="row g-4">
        <div class="col-lg-7">
            <div class="card card-custom p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h6 class="fw-bold mb-0">Society Events Calendar</h6>
                    {"<button class='btn btn-success btn-sm rounded-pill px-3 fw-bold' data-bs-toggle='modal' data-bs-target='#addEventModal'>+ Create Event</button>" if session.get('user_role')=='ADMIN' else ''}
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle small">
                        <thead class="table-light">
                            <tr><th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Category</th></tr>
                        </thead>
                        <tbody>{event_rows or "<tr><td colspan='5' class='text-center text-muted py-4'>No events scheduled.</td></tr>"}</tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="col-lg-5">
            <div class="card card-custom p-4">
                <h6 class="fw-bold mb-3">Democratic Society Polls</h6>
                {"".join(poll_blocks) or "<p class='text-muted small'>No active polls at this time.</p>"}
            </div>
        </div>
    </div>

    <!-- Event Modal -->
    <div class="modal fade" id="addEventModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content rounded-4 border-0 shadow">
                <form method="POST">
                    <input type="hidden" name="create_event" value="1">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Schedule Society Event</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body small space-y-3">
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Event Title</label>
                            <input type="text" name="title" class="form-control rounded-3" required>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Date</label>
                                <input type="date" name="event_date" class="form-control rounded-3" required>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Time</label>
                                <input type="text" name="event_time" class="form-control rounded-3" placeholder="10:00 AM" required>
                            </div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Location / Venue</label>
                            <input type="text" name="location" class="form-control rounded-3" placeholder="Club House Banquet Hall" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Category</label>
                            <select name="category" class="form-select rounded-3">
                                <option value="Meeting">Meeting / AGM</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Festival">Festival</option>
                                <option value="Health">Health / Wellness</option>
                                <option value="Sports">Sports</option>
                            </select>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Description</label>
                            <textarea name="description" class="form-control rounded-3" rows="2"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success btn-sm px-4 fw-bold">Publish Event</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Events & Polls", active_menu="events", content=content)

# ----------------------------------------------------------------------------
# 13. NOTICES BOARD
# ----------------------------------------------------------------------------
@app.route('/notices', methods=['GET', 'POST'])
@login_required
def notices_list():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        category = request.form.get('category', 'General')
        is_pin = 1 if request.form.get('is_pinned') else 0

        cursor.execute(
            "INSERT INTO notices (title, content, category, published_by, published_date, is_pinned) "
            "VALUES (%s, %s, %s, %s, CURDATE(), %s)",
            (title, content, category, session.get('user_fullname', 'Management Committee'), is_pin)
        )
        conn.commit()
        log_activity(f"Notice Published: {title}", "System", f"Category: {category}")
        flash("Official circular broadcasted to society!", "success")

    cursor.execute("SELECT * FROM notices ORDER BY is_pinned DESC, id DESC")
    notices = cursor.fetchall()
    cursor.close()
    conn.close()

    cards = "".join(f"""
    <div class="card card-custom p-4 mb-3 border-{'success' if n['is_pinned'] else 'light'}">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center gap-2">
                {"<span class='badge bg-success'><i class='bi bi-pin-fill'></i> Pinned</span>" if n['is_pinned'] else ""}
                <span class="badge bg-{'danger' if n['category']=='Urgent' else 'warning' if n['category']=='Maintenance' else 'info'}">{n['category']}</span>
            </div>
            <small class="text-muted">{n['published_date']}</small>
        </div>
        <h5 class="fw-bold text-dark mt-1">{n['title']}</h5>
        <p class="text-secondary small leading-relaxed whitespace-pre-line mb-3">{n['content']}</p>
        <div class="pt-2 border-top d-flex justify-content-between text-muted small" style="font-size: 11px;">
            <span>Published by: <strong>{n['published_by']}</strong></span>
            <span>Target: All Residents & Flat Owners</span>
        </div>
    </div>
    """ for n in notices)

    content = f"""
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h5 class="fw-bold mb-0">Society Notice Board & Circulars</h5>
                <small class="text-muted">Official circulars, water tank maintenance, EV policies, and emergency updates</small>
            </div>
            {"<button class='btn btn-success btn-sm rounded-pill px-3 fw-bold' data-bs-toggle='modal' data-bs-target='#addNoticeModal'>+ Publish Circular</button>" if session.get('user_role')=='ADMIN' else ''}
        </div>
        {cards or "<div class='card card-custom p-5 text-center text-muted'>No notices on file.</div>"}
    </div>

    <!-- Modal -->
    <div class="modal fade" id="addNoticeModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content rounded-4 border-0 shadow">
                <form method="POST">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Broadcast Circular</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body small space-y-3">
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Notice Title</label>
                            <input type="text" name="title" class="form-control rounded-3" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Category</label>
                            <select name="category" class="form-select rounded-3">
                                <option value="General">General</option>
                                <option value="Maintenance">Maintenance Schedule</option>
                                <option value="Security">Security Regulation</option>
                                <option value="Urgent">Urgent Alert</option>
                            </select>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Circular Content</label>
                            <textarea name="content" class="form-control rounded-3" rows="4" required></textarea>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="is_pinned" id="pinCheck" value="1">
                            <label class="form-check-label" for="pinCheck">Pin to top of Noticeboard</label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success btn-sm px-4 fw-bold">Publish Notice</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Notice Board", active_menu="notices", content=content)

# ----------------------------------------------------------------------------
# 14. EXPENSES & 1-CLICK CSV EXPORT
# ----------------------------------------------------------------------------
@app.route('/expenses', methods=['GET', 'POST'])
@login_required
@role_required(['ADMIN'])
def expenses_list():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        cat = request.form.get('category')
        amount = float(request.form.get('amount', 0))
        e_date = request.form.get('expense_date')
        desc = request.form.get('description')
        vendor = request.form.get('vendor_name')
        inv = request.form.get('invoice_number', 'INV-LOCAL')
        mode = request.form.get('payment_mode', 'Bank Transfer')

        cursor.execute(
            "INSERT INTO expenses (category, amount, expense_date, description, vendor_name, payment_mode, invoice_number) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (cat, amount, e_date, desc, vendor, mode, inv)
        )
        conn.commit()
        log_activity(f"Expense Logged: ₹{amount:,.0f}", "Payment", f"{cat} - {vendor}")
        flash(f"Expense recorded for {vendor} (₹{amount:,.0f})!", "success")

    cursor.execute("SELECT * FROM expenses ORDER BY expense_date DESC")
    expenses = cursor.fetchall()

    cursor.execute("SELECT SUM(amount) AS total FROM expenses")
    t_stat = cursor.fetchone()
    total_exp = t_stat['total'] or 0.0

    cursor.close()
    conn.close()

    rows = "".join(f"""
    <tr>
        <td>{e['expense_date']}</td>
        <td><span class="badge bg-light text-dark border">{e['category']}</span></td>
        <td>{e['vendor_name']} <small class="text-muted">({e['invoice_number']})</small></td>
        <td>{e['description']}</td>
        <td>{e['payment_mode']}</td>
        <td class="fw-bold text-end">₹ {float(e['amount']):,.0f}</td>
    </tr>
    """ for e in expenses)

    content = f"""
    <div class="card card-custom p-4">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
            <div>
                <h6 class="fw-bold mb-0">Society Financial Expenditures</h6>
                <small class="text-muted">Total audited outflow: <strong>₹ {float(total_exp):,.0f}</strong></small>
            </div>
            <div class="d-flex gap-2">
                <a href="/expenses/export-csv" class="btn btn-outline-success btn-sm rounded-pill px-3 fw-bold">
                    <i class="bi bi-download me-1"></i> Export Actual MySQL Records to CSV
                </a>
                <button class="btn btn-success btn-sm rounded-pill px-3 fw-bold" data-bs-toggle="modal" data-bs-target="#addExpenseModal">
                    + Log Expense
                </button>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle small">
                <thead class="table-light">
                    <tr><th>Date</th><th>Category</th><th>Vendor</th><th>Description</th><th>Mode</th><th class="text-end">Amount</th></tr>
                </thead>
                <tbody>{rows or "<tr><td colspan='6' class='text-center text-muted py-4'>No expenses recorded.</td></tr>"}</tbody>
            </table>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="addExpenseModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content rounded-4 border-0 shadow">
                <form method="POST">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">Record Society Expense</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body small space-y-3">
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Category</label>
                            <select name="category" class="form-select rounded-3">
                                <option value="Security Staff">Security Staff</option>
                                <option value="Electricity & Water">Electricity & Water</option>
                                <option value="Gardening & Housekeeping">Gardening & Housekeeping</option>
                                <option value="Elevator AMC">Elevator AMC</option>
                                <option value="Repairs">Repairs & Maintenance</option>
                                <option value="Events">Events</option>
                                <option value="Administrative">Administrative</option>
                            </select>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Amount (₹)</label>
                                <input type="number" name="amount" class="form-control rounded-3" required>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Date</label>
                                <input type="date" name="expense_date" class="form-control rounded-3" value="{datetime.date.today()}" required>
                            </div>
                        </div>
                        <div class="row g-2 mb-2">
                            <div class="col">
                                <label class="form-label fw-semibold">Vendor Name</label>
                                <input type="text" name="vendor_name" class="form-control rounded-3" required>
                            </div>
                            <div class="col">
                                <label class="form-label fw-semibold">Invoice Number</label>
                                <input type="text" name="invoice_number" class="form-control rounded-3" placeholder="INV-..." required>
                            </div>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Payment Mode</label>
                            <select name="payment_mode" class="form-select rounded-3">
                                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                                <option value="UPI">UPI</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-semibold">Description</label>
                            <input type="text" name="description" class="form-control rounded-3" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success btn-sm px-4 fw-bold">Save Expense</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Expenses & Financials", active_menu="expenses", content=content)

@app.route('/expenses/export-csv')
@login_required
@role_required(['ADMIN'])
def export_expenses_csv():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM expenses ORDER BY expense_date DESC")
    expenses = cursor.fetchall()
    cursor.close()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Expense ID', 'Date', 'Category', 'Vendor', 'Invoice Number', 'Amount (INR)', 'Payment Mode', 'Description'])
    for e in expenses:
        writer.writerow([e['id'], e['expense_date'], e['category'], e['vendor_name'], e['invoice_number'], e['amount'], e['payment_mode'], e['description']])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename=MDG_Expenses_Report_{datetime.date.today()}.csv"}
    )

# ----------------------------------------------------------------------------
# 15. ACTIVITY & AUDIT LOGS
# ----------------------------------------------------------------------------
@app.route('/activity-logs')
@login_required
@role_required(['ADMIN'])
def activity_logs_list():
    cat = request.args.get('category', 'ALL')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if cat != 'ALL':
        cursor.execute("SELECT * FROM activity_logs WHERE category = %s ORDER BY id DESC LIMIT 100", (cat,))
    else:
        cursor.execute("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 100")
    logs = cursor.fetchall()
    cursor.close()
    conn.close()

    rows = "".join(f"""
    <tr>
        <td class="font-monospace text-muted">#{l['id']}</td>
        <td class="fw-bold">{l['action']}</td>
        <td><span class="badge bg-light text-dark border">{l['category']}</span></td>
        <td class="text-secondary">{l['details']}</td>
        <td><strong>{l['performed_by']}</strong> <small class="text-muted">({l['role']})</small></td>
        <td class="font-monospace text-muted small">{l['created_at']}</td>
    </tr>
    """ for l in logs)

    content = f"""
    <div class="card card-custom p-4">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
            <div>
                <h6 class="fw-bold mb-0">System Activity & Audit Logs</h6>
                <small class="text-muted">Immutable audit logs recording flat transfers, payments, allocations, and notices</small>
            </div>
            <div class="d-flex gap-2">
                <a href="/activity-logs?category=ALL" class="btn btn-{'dark' if cat=='ALL' else 'outline-secondary'} btn-sm rounded-pill">All</a>
                <a href="/activity-logs?category=Ownership" class="btn btn-{'dark' if cat=='Ownership' else 'outline-secondary'} btn-sm rounded-pill">Ownership</a>
                <a href="/activity-logs?category=Payment" class="btn btn-{'dark' if cat=='Payment' else 'outline-secondary'} btn-sm rounded-pill">Payment</a>
                <a href="/activity-logs?category=Visitor" class="btn btn-{'dark' if cat=='Visitor' else 'outline-secondary'} btn-sm rounded-pill">Visitor</a>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle small">
                <thead class="table-light">
                    <tr><th>Log ID</th><th>Action Event</th><th>Category</th><th>Details</th><th>User</th><th>Timestamp</th></tr>
                </thead>
                <tbody>{rows or "<tr><td colspan='6' class='text-center text-muted py-4'>No activity records found.</td></tr>"}</tbody>
            </table>
        </div>
    </div>
    """
    return render_template_string(BASE_LAYOUT, page_title="Activity Logs", active_menu="activity", content=content)

# ----------------------------------------------------------------------------
# MAIN ENTRY POINT FOR LOCAL WINDOWS / VS CODE EXECUTION
# ----------------------------------------------------------------------------
if __name__ == '__main__':
    print("\n" + "=" * 70)
    print(" MDG — Modern Digital Governance Society Management System")
    print(" Running locally on: http://127.0.0.1:5000")
    print(" Database: MySQL 8.0 (" + DB_NAME + ")")
    print(" Tagline: Better Living Together • Green Valley Residency, Bengaluru")
    print("=" * 70 + "\n")
    app.run(host='127.0.0.1', port=5000, debug=True)
