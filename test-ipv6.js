const dns = require('dns');
const { PrismaClient } = require('@prisma/client');

async function testIPv6() {
  console.log('Testing IPv6 connectivity...\n');
  
  // Test DNS lookup for IPv6
  return new Promise((resolve) => {
    dns.resolve6('db.blixpaodicphgvdtjfiz.supabase.co', (err, addresses) => {
      if (err) {
        console.log('❌ IPv6 DNS lookup failed:', err.message);
        console.log('\n💡 Your system/network may not support IPv6.');
        console.log('   Options:');
        console.log('   1. Enable IPv6 on your network/router');
        console.log('   2. Use Session Pooler (works with IPv4)');
        console.log('   3. Purchase IPv4 add-on from Supabase');
        resolve(false);
      } else {
        console.log('✅ IPv6 address found:', addresses[0]);
        console.log('\nTesting database connection with IPv6...\n');
        
        const prisma = new PrismaClient({
          log: ['error'],
        });
        
        prisma.$queryRaw`SELECT 1 as test`
          .then(() => {
            console.log('✅ Direct connection (IPv6) works!');
            prisma.$disconnect();
            resolve(true);
          })
          .catch((error) => {
            console.log('❌ Connection failed:', error.message);
            prisma.$disconnect();
            resolve(false);
          });
      }
    });
  });
}

testIPv6();

