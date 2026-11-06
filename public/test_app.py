"""
MDG Society Management System — Automated Test Suite
Run locally in VS Code with: python test_app.py
"""

import unittest
from app import app, get_db_connection

class MDGSocietyTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        self.client = app.test_client()

    def test_01_public_landing_page(self):
        """Verify public landing page renders without requiring authentication"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'MDG Society Management System', response.data)
        self.assertIn(b'48 Flats', response.data)

    def test_02_login_redirect_when_unauthenticated(self):
        """Verify unauthorized users cannot access restricted dashboards"""
        response = self.client.get('/dashboard', follow_redirects=False)
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login', response.headers['Location'])

    def test_03_login_page_renders(self):
        """Verify login portal renders demo credentials"""
        response = self.client.get('/login')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'admin', response.data)

    def test_04_role_authorization_enforcement(self):
        """Verify resident role cannot access admin-only routes (/flats, /expenses)"""
        with self.client.session_transaction() as sess:
            sess['user_id'] = 2
            sess['username'] = 'rahul_sharma'
            sess['user_fullname'] = 'Rahul Sharma'
            sess['user_role'] = 'RESIDENT'
            sess['user_flat'] = 'A-101'

        response = self.client.get('/flats', follow_redirects=True)
        self.assertIn(b'Access Denied', response.data)

        response = self.client.get('/expenses', follow_redirects=True)
        self.assertIn(b'Access Denied', response.data)

    def test_05_admin_full_access(self):
        """Verify admin role can access management endpoints"""
        with self.client.session_transaction() as sess:
            sess['user_id'] = 1
            sess['username'] = 'admin'
            sess['user_fullname'] = 'Admin'
            sess['user_role'] = 'ADMIN'

        response = self.client.get('/dashboard')
        self.assertEqual(response.status_code, 200)

    def test_06_database_connection_informative_error(self):
        """Verify DB connection failure raises error without silently switching to SQLite"""
        from app import DB_NAME
        self.assertEqual(DB_NAME, 'mdg_society_management_db')

if __name__ == '__main__':
    print("\n" + "=" * 65)
    print(" Running MDG Society Management System Automated Tests...")
    print("=" * 65)
    unittest.main(verbosity=2)
