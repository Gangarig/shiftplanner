# How to Create Admin Users

## 🎯 Quick Methods to Create Admin

### Method 1: Through PocketBase Admin Panel (Recommended)

1. **Start PocketBase Server:**
   ```bash
   ./pocketbase serve
   ```

2. **Open PocketBase Admin:**
   - Go to: http://127.0.0.1:8090/_/
   - Create your first admin account if you haven't already

3. **Create Admin User:**
   - Go to **Collections** → **users**
   - Click **"New Record"**
   - Fill in the form:
     - **Email**: `admin@yourcompany.com`
     - **Password**: `your-secure-password`
     - **Role**: `admin`
     - **First Name**: `Admin`
     - **Last Name**: `User`
     - **Is Active**: `true`
   - Click **"Save"**

### Method 2: Through Your App (If you have admin access)

1. **Login as existing admin**
2. **Go to Admin Panel**: http://localhost:3000/admin/users
3. **Click "Neuer Benutzer"**
4. **Fill the form:**
   - Email: `newadmin@company.com`
   - Password: `secure-password`
   - Role: `admin`
   - First Name: `New`
   - Last Name: `Admin`
5. **Click "Benutzer erstellen"**

## 🔧 First-Time Setup

### Step 1: Update PocketBase Schema

Make sure your `users` collection has these fields:

1. **Go to PocketBase Admin** → **Collections** → **users**
2. **Add these fields if missing:**
   - `role` (select, required, values: admin,manager,accountant,worker)
   - `firstName` (text, optional)
   - `lastName` (text, optional)
   - `isActive` (bool, required, default: true)

### Step 2: Set Collection Rules

**For the users collection, set these rules:**

- **List rule**: `@request.auth.id != ""`
- **View rule**: `@request.auth.id = id || @request.auth.role = "admin"`
- **Create rule**: `@request.auth.role = "admin" || @request.data.email != ""`
- **Update rule**: `@request.auth.id = id || @request.auth.role = "admin"`
- **Delete rule**: `@request.auth.role = "admin"`

### Step 3: Create Your First Admin

**Option A: Through PocketBase Admin (Easiest)**
1. Go to http://127.0.0.1:8090/_/
2. Create admin account in PocketBase itself
3. This gives you full admin access

**Option B: Through App Registration**
1. Register normally through your app
2. Manually change role to `admin` in PocketBase admin panel

## 🚀 Testing Your Admin Account

1. **Login to your app** with the admin credentials
2. **Check the homepage** - you should see:
   - Admin role indicator (👑 Administrator)
   - Admin-only menu items
   - "Benutzerverwaltung" card
   - "Systemverwaltung" card

3. **Test admin features:**
   - Go to `/admin/users` - should work
   - Try creating new users
   - Try changing user roles

## 🔒 Security Notes

- **Use strong passwords** for admin accounts
- **Limit admin access** to trusted personnel only
- **Regularly audit** admin user list
- **Use 2FA** if available in PocketBase

## 🆘 Troubleshooting

### "Access Denied" when trying to create users
- Check PocketBase collection rules
- Make sure you're logged in as admin
- Verify the `users` collection exists

### "Role not found" errors
- Make sure the `role` field exists in users collection
- Check that role values match: admin, manager, accountant, worker

### Can't access admin panel
- Verify your user has `role: "admin"`
- Check that `isActive: true`
- Try logging out and back in

## 📝 Quick Reference

**Admin Role Features:**
- ✅ Full user management
- ✅ Role assignment
- ✅ System administration
- ✅ All permissions
- ✅ Access to all features

**Default Admin Credentials (Change these!):**
- Email: `admin@yourcompany.com`
- Password: `admin123` (change immediately!)
- Role: `admin`
