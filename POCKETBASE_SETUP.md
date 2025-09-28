# 🚀 PocketBase Setup Guide

## Step 1: Start PocketBase Server

1. **Open Terminal/Command Prompt** in your project directory
2. **Run PocketBase:**
   ```bash
   ./pocketbase serve
   ```
   If you don't have the executable, download it from: https://pocketbase.io/docs/

## Step 2: Access PocketBase Admin

1. **Open Browser:** http://127.0.0.1:8090/_/
2. **Create Admin Account** (first time only)
3. **Login to Admin Panel**

## Step 3: Create Users Collection

1. **Go to Collections** in the admin panel
2. **Click "New Collection"**
3. **Collection Settings:**
   - **Name:** `users`
   - **Type:** `Auth`
   - **Click "Create"**

## Step 4: Add Fields to Users Collection

After creating the collection, add these fields:

### Required Fields:
1. **email** (already exists for auth)
2. **password** (already exists for auth)
3. **role** - Select field:
   - **Name:** `role`
   - **Type:** `Select`
   - **Required:** Yes
   - **Options:** `admin,manager,accountant,worker`
4. **firstName** - Text field:
   - **Name:** `firstName`
   - **Type:** `Text`
   - **Required:** No
5. **lastName** - Text field:
   - **Name:** `lastName`
   - **Type:** `Text`
   - **Required:** No
6. **isActive** - Boolean field:
   - **Name:** `isActive`
   - **Type:** `Bool`
   - **Required:** Yes
   - **Default:** `true`

## Step 5: Create Some Test Users

1. **Go to Collections → users**
2. **Click "New Record"**
3. **Create test users:**

### Admin User:
- **Email:** `admin@company.com`
- **Password:** `admin123`
- **Role:** `admin`
- **First Name:** `Admin`
- **Last Name:** `User`
- **Is Active:** `true`

### Manager User:
- **Email:** `manager@company.com`
- **Password:** `manager123`
- **Role:** `manager`
- **First Name:** `Manager`
- **Last Name:** `User`
- **Is Active:** `true`

### Worker Users:
- **Email:** `worker1@company.com`
- **Password:** `worker123`
- **Role:** `worker`
- **First Name:** `Worker`
- **Last Name:** `One`
- **Is Active:** `true`

- **Email:** `worker2@company.com`
- **Password:** `worker123`
- **Role:** `worker`
- **First Name:** `Worker`
- **Last Name:** `Two`
- **Is Active:** `true`

## Step 6: Test Your App

1. **Keep PocketBase running:** `./pocketbase serve`
2. **Start your Next.js app:** `npm run dev`
3. **Go to:** http://localhost:3000
4. **Login with any of the test users**
5. **Check the shift planning page**

## 🔧 Troubleshooting

### "Cannot connect to server"
- Make sure PocketBase is running: `./pocketbase serve`
- Check the URL in your app matches: `http://127.0.0.1:8090`

### "Collection not found"
- Make sure you created the `users` collection
- Check the collection name is exactly `users`

### "Field not found"
- Make sure you added all required fields to the users collection
- Check field names match exactly: `role`, `firstName`, `lastName`, `isActive`

### "Permission denied"
- Check the collection rules in PocketBase admin
- For now, you can set simple rules or leave them empty for testing

## 📝 Collection Rules (Optional)

If you want to set up rules later, here are some basic ones:

### Users Collection Rules:
- **List Rule:** `@request.auth.id != ""`
- **View Rule:** `@request.auth.id != ""`
- **Create Rule:** `@request.auth.id != ""`
- **Update Rule:** `@request.auth.id != ""`
- **Delete Rule:** `@request.auth.id != ""`

## ✅ Success Indicators

You'll know it's working when:
- ✅ No error messages in the shift planning page
- ✅ "Verfügbare Mitarbeiter" list shows your test users
- ✅ You can drag and drop workers to stations
- ✅ Navigation shows role-based menu items

## 🆘 Still Having Issues?

1. **Check PocketBase logs** in the terminal
2. **Verify collection structure** in PocketBase admin
3. **Test with simple queries** in PocketBase admin
4. **Check browser console** for detailed error messages
