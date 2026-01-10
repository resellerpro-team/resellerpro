# 🚀 Quick Fix: Run Database Migration

## The Problem
The `todos` table doesn't exist yet in your Supabase database.

## The Solution
Run the migration SQL in your Supabase dashboard.

---

## 📋 Step-by-Step Instructions

### Option 1: Supabase Dashboard (RECOMMENDED - 2 minutes) ✅

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your ResellerPro project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Copy & Paste the Migration**
   - Copy the ENTIRE contents from: `supabase/migrations/20260109_create_todos_table.sql`
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for "Success" message

5. **Verify Table Created**
   - Click "Table Editor" in sidebar
   - You should see new table: `todos`

6. **Restart Your Dev Server**
   ```bash
   # Stop the server (Ctrl+C in terminal)
   # Then restart:
   npm run dev
   ```

7. **Test the Feature**
   - Go to http://localhost:3000/dashboard
   - Try adding a task!

---

### Option 2: From Project Root (Alternative)

If your Supabase is linked to the CLI:

```bash
# Navigate to project
cd d:\WORKS\Reseller-pro\resellerpro

# Link to your Supabase project (if not already linked)
npx supabase link

# Push the migration
npx supabase db push

# Restart dev server
npm run dev
```

---

## ✅ How to Verify It Worked

After running the migration:

1. **Check for Success Message**
   - Should see "Success" in Supabase dashboard
   - OR "Finished supabase db push" in terminal

2. **Verify Table Exists**
   - In Supabase Dashboard → Table Editor
   - Look for `todos` table in the list

3. **Test the Feature**
   - Reload your dashboard
   - Try adding a task
   - Check browser console - no more "PGRST205" errors

---

## 🐛 Troubleshooting

**"Operation not permitted" or permission errors?**
- Make sure you're logged into the correct Supabase account
- Verify you have admin access to the project

**Still seeing PGRST205 error?**
- Clear browser cache
- Restart dev server completely
- Check if migration actually ran (verify in Table Editor)

**Table already exists error?**
- Migration already ran successfully!
- Just restart your dev server

---

## 📝 What the Migration Does

The migration creates:
- ✅ `todos` table with all necessary columns
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for fast queries  
- ✅ Auto-update trigger for timestamps

---

**Need more help?** Let me know if you encounter any errors! 🚀
