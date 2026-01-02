# Database Connection Setup

## Current Issue
Direct connection (port 5432) is failing due to IPv4 compatibility. We need to use Session Pooler.

## Steps to Get Session Pooler Connection String

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/blixpaodicphgvdtjfiz
2. Click on **Settings** → **Database**
3. Scroll to **Connection string** section
4. In the **Method** dropdown, select **"Session Pooler"** (instead of "Direct connection")
5. Copy the connection string that appears
6. It should look like:
   ```
   postgresql://postgres.blixpaodicphgvdtjfiz:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

## Alternative: Try Common Regions

If you can't find the exact connection string, we can try common regions:
- `us-east-1` (US East)
- `us-west-1` (US West)  
- `eu-west-1` (Europe West)
- `ap-southeast-1` (Asia Pacific)

## Once You Have the Connection String

Share it here and I'll update the .env file and test the connection.


