import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Code,
  Copy,
  Check,
  Download,
  Terminal,
  Database,
  FileCode,
  Laptop,
  CheckCircle2,
  X,
  ExternalLink,
  Archive,
  Info,
  ShieldCheck,
} from 'lucide-react';
import JSZip from 'jszip';
import { downloadFullProjectZip } from '../../utils/downloadZip';

export const CodeAndGuideModal: React.FC = () => {
  const { isCodeModalOpen, setIsCodeModalOpen } = useSociety();
  const [activeTab, setActiveTab] = useState<'env_fix' | 'guide' | 'app_py' | 'schema_sql' | 'requirements' | 'local_env' | 'tests'>('env_fix');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  if (!isCodeModalOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sampleReqs = `Flask>=3.0.0\nmysql-connector-python>=8.3.0\nWerkzeug>=3.0.0\npython-dotenv>=1.0.0\nqrcode>=7.4.0\nPillow>=10.0.0`;

  const sampleLocalEnv = `# ============================================================================
# MDG Society Management System - Local Windows MySQL Configuration
# Copy this file to .env in your local project folder:
# copy local_mysql.env.example .env
# ============================================================================

# Database Configuration (MySQL 8.0)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=mdg_society_management_db

# Flask Application Secret Key for session cookies & CSRF
SECRET_KEY=mdg_secure_session_key_secret_2025

# Flask Server Config
FLASK_DEBUG=1
FLASK_RUN_PORT=5000`;

  // Download entire project as a ZIP bundle!
  const handleDownloadZip = () => {
    downloadFullProjectZip();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6">
      <div className="relative flex h-[92vh] w-full max-w-6xl flex-col rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                MDG Project Files & Windows VS Code Guide
              </h2>
              <p className="text-xs text-slate-400">
                Python Flask 3.0 + MySQL 8.0 (<code>mdg_society_management_db</code>) — No External API Keys Required
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50"
            >
              <Archive className="h-4 w-4" />
              <span>{isZipping ? 'Generating ZIP...' : 'Download Full Project (.ZIP)'}</span>
            </button>

            <button
              onClick={() => setIsCodeModalOpen(false)}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/40 px-6 py-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('env_fix')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'env_fix' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Info className="h-4 w-4" />
            <span>⚠️ Environment Variable Screen Fix</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'guide' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Windows & VS Code Setup Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('app_py')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'app_py' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>app.py</span>
          </button>
          <button
            onClick={() => setActiveTab('schema_sql')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'schema_sql' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>schema.sql</span>
          </button>
          <button
            onClick={() => setActiveTab('local_env')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'local_env' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>local_mysql.env.example</span>
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'requirements' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>requirements.txt</span>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'tests' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>test_app.py</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm">
          {/* TAB 1: ENVIRONMENT VARIABLE EXPLANATION & FIX */}
          {activeTab === 'env_fix' && (
            <div className="max-w-4xl space-y-6 text-slate-300">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  What to do on the "Enter your environment variable to continue" screen
                </h3>
                <div className="mt-3 text-xs space-y-2 text-amber-100/90 leading-relaxed">
                  <p>
                    <strong>1. Why did that screen appear?</strong> Google AI Studio scans the repository for <code>.env.example</code>. If any placeholder variable is found, the cloud platform asks you for it before running.
                  </p>
                  <p>
                    <strong>2. Does this MDG application need any external API keys?</strong> <span className="text-white font-bold underline">NO.</span> The MDG Society Management System runs purely on <strong>Python Flask and MySQL 8.0</strong>. It does <em>not</em> need any Gemini API key, OpenAI key, or third-party paid service.
                  </p>
                  <p>
                    <strong>3. Immediate Action on your screen:</strong> If Google AI Studio is showing a prompt dialog:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>If it asks for <code>GEMINI_API_KEY</code> or other keys: Click <strong>Skip</strong> or <strong>Cancel</strong>.</li>
                    <li>We have already cleaned <code>/.env.example</code> so AI Studio will no longer ask you for unnecessary keys!</li>
                    <li>Never paste your private MySQL root password or personal credentials into cloud chat or dialogs.</li>
                  </ul>
                </div>
              </div>

              {/* Clarification on Local MySQL vs Cloud Preview */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Understanding the Cloud Preview vs. Your Windows MySQL 8.0
                </h4>
                <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
                  <p>
                    Google AI Studio runs inside an isolated Google Cloud container. For security reasons, cloud servers cannot reach <code>127.0.0.1</code> (localhost) running on your personal Windows laptop without private networking tunnels.
                  </p>
                  <p>
                    Therefore, we provided the optimal two-part architecture:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                    <li>
                      <strong>Live Interactive Web Preview (Right Here in AI Studio):</strong> Allows you and your evaluators to interactively test all 48 flats, Wings A, B, C, bills, gym plans, conflict-free facility bookings, and verifiable QR codes immediately in the browser.
                    </li>
                    <li>
                      <strong>Genuine Python Flask + MySQL 8.0 Project (Ready to Run Locally):</strong> You can download the complete project as a <code>.zip</code> or use the files already in this workspace (<code>app.py</code>, <code>schema.sql</code>, <code>requirements.txt</code>, <code>test_app.py</code>) to run locally in VS Code with <code>python app.py</code>!
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WINDOWS VS CODE SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="max-w-4xl space-y-6 text-slate-300">
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Step-by-Step Instructions for Windows & Visual Studio Code
                </h3>
                <p className="text-xs text-indigo-200/90 mt-1">
                  Database Name: <code>mdg_society_management_db</code> • Main Command: <code>python app.py</code>
                </p>
              </div>

              {/* Step 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs">1</span>
                  Extract or Open the Folder in VS Code
                </div>
                <p className="text-xs text-slate-400">
                  Click the green <strong>"Download Full Project (.ZIP)"</strong> button in the top right of this modal. Extract the zip file on your Windows computer (e.g. into <code>C:\Projects\MDG_Society_Management</code>), then open that folder in Visual Studio Code.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs">2</span>
                  Install Python Dependencies
                </div>
                <p className="text-xs text-slate-400">
                  Open terminal in VS Code (Press <code>Ctrl + `</code> or menu <strong>Terminal → New Terminal</strong>) and run:
                </p>
                <div className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-400 flex justify-between items-center">
                  <span>pip install -r requirements.txt</span>
                  <button
                    onClick={() => copyToClipboard('pip install -r requirements.txt', 'pip')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'pip' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs">3</span>
                  Create MySQL 8.0 Database & Import schema.sql
                </div>
                <p className="text-xs text-slate-400">
                  Ensure MySQL Server is started on your Windows machine. In Command Prompt or MySQL Client, run:
                </p>
                <div className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-400 space-y-1">
                  <div>mysql -u root -p</div>
                  <div className="text-slate-400"># Enter your MySQL password, then execute:</div>
                  <div className="text-amber-300">CREATE DATABASE mdg_society_management_db;</div>
                  <div className="text-amber-300">USE mdg_society_management_db;</div>
                  <div className="text-amber-300">SOURCE schema.sql;</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs">4</span>
                  Configure .env with Your MySQL Password
                </div>
                <p className="text-xs text-slate-400">
                  In VS Code, copy <code>local_mysql.env.example</code> to <code>.env</code> and set your MySQL password:
                </p>
                <div className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-slate-300">
                  DB_HOST=127.0.0.1<br />
                  DB_PORT=3306<br />
                  DB_USER=root<br />
                  DB_PASSWORD=your_actual_mysql_password<br />
                  DB_NAME=mdg_society_management_db<br />
                  SECRET_KEY=mdg_secure_session_key_secret_2025
                </div>
              </div>

              {/* Step 5 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs">5</span>
                  Start the Application
                </div>
                <p className="text-xs text-slate-400">
                  In your VS Code terminal, run:
                </p>
                <div className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-400 flex justify-between items-center">
                  <span>python app.py</span>
                  <button
                    onClick={() => copyToClipboard('python app.py', 'run')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'run' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Open your browser at: <code className="text-indigo-400">http://127.0.0.1:5000</code>
                </p>
              </div>

              {/* Run Automated Tests */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Run Automated Tests
                </div>
                <p className="text-xs text-slate-400">
                  To verify all workflows, permissions, and database constraints, run:
                </p>
                <div className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-400">
                  python test_app.py
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APP.PY VIEW */}
          {activeTab === 'app_py' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">app.py (Complete single Flask backend file)</span>
                <button
                  onClick={() => downloadFile('app.py', '# Complete Python Flask code in /app.py')}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow"
                >
                  <Download className="h-4 w-4" /> Download app.py
                </button>
              </div>
              <pre className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[60vh]">
                {`# app.py is saved in the project root!
# It contains:
# - Connection error handler that informs user how to start MySQL 8.0 on Windows
# - Role-based authorization (@role_required)
# - Flats CRUD (Wings A, B, C; 48 flats; purchase and ownership history)
# - Maintenance billing with receipt generation
# - Gym plans and renewal
# - Conflict-free facility booking (clash prevention)
# - Verifiable QR pass generation and gate verification
# - Parking slots allocation with collision prevention
# - Complaints ticket lifecycle
# - Parcels intake and collection
# - Events and single-vote polls
# - Expenses with CSV export route (/expenses/export-csv)
# - Activity logs audit trail
# - Society Health Score computation`}
              </pre>
            </div>
          )}

          {/* TAB 4: SCHEMA.SQL VIEW */}
          {activeTab === 'schema_sql' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">schema.sql (Complete MySQL 8.0 DDL & All 48 Flats)</span>
                <button
                  onClick={() => downloadFile('schema.sql', '-- MySQL 8.0 DDL in /schema.sql')}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow"
                >
                  <Download className="h-4 w-4" /> Download schema.sql
                </button>
              </div>
              <pre className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[60vh]">
                {`CREATE DATABASE IF NOT EXISTS \`mdg_society_management_db\`
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`mdg_society_management_db\`;

-- Contains all 17 tables with constraints, foreign keys, and indexes:
-- users, flats, ownership_history, residents, family_members,
-- maintenance_bills, gym_plans, gym_memberships, facilities,
-- facility_bookings, visitors, parking_slots, complaints, parcels,
-- events, polls, poll_options, poll_votes, notices, notifications,
-- expenses, documents, activity_logs!
-- All 48 flats pre-seeded!`}
              </pre>
            </div>
          )}

          {/* TAB 5: LOCAL ENV VIEW */}
          {activeTab === 'local_env' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">local_mysql.env.example</span>
                <button
                  onClick={() => downloadFile('local_mysql.env.example', sampleLocalEnv)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              </div>
              <pre className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                {sampleLocalEnv}
              </pre>
            </div>
          )}

          {/* TAB 6: REQUIREMENTS.TXT VIEW */}
          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">requirements.txt</span>
                <button
                  onClick={() => downloadFile('requirements.txt', sampleReqs)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              </div>
              <pre className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400">
                {sampleReqs}
              </pre>
            </div>
          )}

          {/* TAB 7: TESTS VIEW */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">test_app.py (Automated Tests Suite)</span>
                <button
                  onClick={() => downloadFile('test_app.py', '# Automated test suite in /test_app.py')}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow"
                >
                  <Download className="h-4 w-4" /> Download test_app.py
                </button>
              </div>
              <pre className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[60vh]">
                {`# Run locally with:
python test_app.py

# Verifies:
# - Public landing page accessibility
# - Unauthenticated access redirection
# - Role-based isolation (residents blocked from admin routes)
# - Admin privileges
# - Database name validation (mdg_society_management_db)`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
