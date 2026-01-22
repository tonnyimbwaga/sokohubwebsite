# Admin Access Guide for Sokohub Kenya

## Creating Your Admin Account

### Step 1: Sign Up
1. Go to your website: `https://sokohubkenya.com/signup`
2. Create an account with your email and password

### Step 2: Make Yourself Admin (via Supabase Dashboard)
1. Go to [Supabase Dashboard](https://rmgtdipwxieqlqkxyohv.supabase.co)
2. Navigate to **Authentication > Users**
3. Find your newly created user
4. Click on the user to edit
5. Scroll to **User Metadata** section
6. Add this JSON:
   ```json
   {
     "role": "admin"
   }
   ```
7. Click **Save**

### Step 3: Access Admin Panel
1. Go to: `https://sokohubkenya.com/admin`
2. Log in with your credentials
3. You now have full admin access!

## Admin Panel Features
- **Dashboard**: Overview of orders, products, and analytics
- **Products**: Add, edit, delete products
- **Categories**: Manage product categories
- **Orders**: View and manage customer orders
- **Settings**: Configure site settings

## Security Notes
- Keep your admin credentials secure
- Use a strong password
- Only assign admin role to trusted users
- Regularly review user access in Supabase Dashboard
