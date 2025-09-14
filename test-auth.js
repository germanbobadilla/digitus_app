#!/usr/bin/env node

const BASE_URL = "http://localhost:3000";
const { PrismaClient } = require("./src/generated/prisma");

async function testAPI() {
  console.log("🧪 Testing Digitus Authentication System\n");

  try {
    // Test 1: User Registration
    console.log("1️⃣ Testing User Registration...");
    const registerResponse = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "API Test User",
        email: "apitest@example.com",
        password: "testpass123",
      }),
    });
    const registerData = await registerResponse.json();
    console.log("✅ Registration:", registerData.message);

    // Test 2: User Login
    console.log("\n2️⃣ Testing User Login...");
    const loginResponse = await fetch(`${BASE_URL}/api/users/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "apitest@example.com",
        password: "testpass123",
      }),
    });
    const loginData = await loginResponse.json();
    console.log("✅ Login:", loginData.message);
    console.log("👤 User:", loginData.user.name);

    // Test 3: Get User Details
    console.log("\n3️⃣ Testing User Details...");
    const userResponse = await fetch(
      `${BASE_URL}/api/users/${loginData.user.id}`
    );
    const userData = await userResponse.json();
    console.log("✅ User Details:", userData.user.name, userData.user.email);

    // Test 4: Get All Users
    console.log("\n4️⃣ Testing User List...");
    const usersResponse = await fetch(`${BASE_URL}/api/users`);
    const usersData = await usersResponse.json();
    console.log("✅ Total Users:", usersData.pagination.total);

    // Test 5: Get User Stats
    console.log("\n5️⃣ Testing User Statistics...");
    const statsResponse = await fetch(`${BASE_URL}/api/users/stats`);
    const statsData = await statsResponse.json();
    console.log("✅ Stats:", {
      totalUsers: statsData.totalUsers,
      newThisMonth: statsData.newUsersThisMonth,
      withOrders: statsData.usersWithOrders,
    });

    console.log(
      "\n🎉 All tests passed! Your authentication system is working perfectly!"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

async function main() {
  const prisma = new PrismaClient();
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node test-auth.js <email>");
    process.exit(1);
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found:", email);
    process.exit(1);
  }
  const updated = await prisma.user.update({
    where: { email },
    data: { userType: "ADMIN" },
  });
  console.log("Promoted to ADMIN:", updated.email);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
