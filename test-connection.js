require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connection successful!');
    console.log('Test query result:', result);
    
    // Try to list tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✅ Tables in database:', tables);
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if your Supabase database is paused (free tier pauses after inactivity)');
      console.log('2. Go to Supabase Dashboard → Your Project → Settings → Database');
      console.log('3. Check if your IP needs to be whitelisted');
      console.log('4. Verify the database password is correct');
      console.log('5. Try using the connection pooling port (6543) instead of direct (5432)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

