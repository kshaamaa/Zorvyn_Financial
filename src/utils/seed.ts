import bcrypt from "bcryptjs";
import prisma from "../config/database";

/**
 * Database Seed Script
 * Creates sample users (admin, analyst, viewer) and financial records
 * for development and testing purposes.
 */
async function seed() {
  console.log("🌱 Seeding database...\n");

  // ─── Create Users ────────────────────────────────────
  const passwordHash = await bcrypt.hash("Password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@finance.com" },
    update: {},
    create: {
      email: "admin@finance.com",
      password: passwordHash,
      name: "Admin User",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@finance.com" },
    update: {},
    create: {
      email: "analyst@finance.com",
      password: passwordHash,
      name: "Analyst User",
      role: "ANALYST",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Analyst user created: ${analyst.email}`);

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@finance.com" },
    update: {},
    create: {
      email: "viewer@finance.com",
      password: passwordHash,
      name: "Viewer User",
      role: "VIEWER",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Viewer user created: ${viewer.email}`);

  // ─── Create Financial Records ────────────────────────
  const records = [
    // Income records
    { amount: 8500.0, type: "INCOME", category: "Salary", date: "2026-01-15", description: "January salary payment" },
    { amount: 8500.0, type: "INCOME", category: "Salary", date: "2026-02-15", description: "February salary payment" },
    { amount: 8500.0, type: "INCOME", category: "Salary", date: "2026-03-15", description: "March salary payment" },
    { amount: 2000.0, type: "INCOME", category: "Freelance", date: "2026-01-20", description: "Web development project" },
    { amount: 1500.0, type: "INCOME", category: "Freelance", date: "2026-03-10", description: "Consulting work" },
    { amount: 500.0, type: "INCOME", category: "Investment", date: "2026-02-01", description: "Dividend income from stocks" },
    { amount: 750.0, type: "INCOME", category: "Investment", date: "2026-03-01", description: "Bond interest payment" },
    { amount: 300.0, type: "INCOME", category: "Gifts", date: "2026-02-14", description: "Birthday gift received" },

    // Expense records
    { amount: 1800.0, type: "EXPENSE", category: "Rent", date: "2026-01-01", description: "Monthly rent payment" },
    { amount: 1800.0, type: "EXPENSE", category: "Rent", date: "2026-02-01", description: "Monthly rent payment" },
    { amount: 1800.0, type: "EXPENSE", category: "Rent", date: "2026-03-01", description: "Monthly rent payment" },
    { amount: 250.0, type: "EXPENSE", category: "Utilities", date: "2026-01-05", description: "Electricity and water" },
    { amount: 280.0, type: "EXPENSE", category: "Utilities", date: "2026-02-05", description: "Electricity and water" },
    { amount: 230.0, type: "EXPENSE", category: "Utilities", date: "2026-03-05", description: "Electricity, water, and gas" },
    { amount: 450.0, type: "EXPENSE", category: "Groceries", date: "2026-01-08", description: "Monthly grocery shopping" },
    { amount: 520.0, type: "EXPENSE", category: "Groceries", date: "2026-02-08", description: "Monthly grocery shopping" },
    { amount: 480.0, type: "EXPENSE", category: "Groceries", date: "2026-03-08", description: "Monthly grocery shopping" },
    { amount: 120.0, type: "EXPENSE", category: "Transportation", date: "2026-01-10", description: "Monthly transit pass" },
    { amount: 120.0, type: "EXPENSE", category: "Transportation", date: "2026-02-10", description: "Monthly transit pass" },
    { amount: 85.0, type: "EXPENSE", category: "Entertainment", date: "2026-01-20", description: "Movie tickets and dinner" },
    { amount: 150.0, type: "EXPENSE", category: "Entertainment", date: "2026-02-20", description: "Concert tickets" },
    { amount: 200.0, type: "EXPENSE", category: "Shopping", date: "2026-01-25", description: "New clothes" },
    { amount: 350.0, type: "EXPENSE", category: "Healthcare", date: "2026-02-12", description: "Doctor visit and medication" },
    { amount: 99.0, type: "EXPENSE", category: "Subscription", date: "2026-01-01", description: "Streaming services bundle" },
    { amount: 99.0, type: "EXPENSE", category: "Subscription", date: "2026-02-01", description: "Streaming services bundle" },
    { amount: 99.0, type: "EXPENSE", category: "Subscription", date: "2026-03-01", description: "Streaming services bundle" },
    { amount: 500.0, type: "EXPENSE", category: "Education", date: "2026-03-15", description: "Online course enrollment" },
    { amount: 1200.0, type: "EXPENSE", category: "Travel", date: "2026-02-25", description: "Weekend getaway trip" },
    { amount: 100.0, type: "EXPENSE", category: "Charity", date: "2026-03-20", description: "Monthly charity donation" },
  ];

  let recordCount = 0;
  for (const record of records) {
    await prisma.financialRecord.create({
      data: {
        ...record,
        date: new Date(record.date),
        userId: admin.id,
      },
    });
    recordCount++;
  }
  console.log(`\n✅ Created ${recordCount} financial records`);

  // ─── Summary ─────────────────────────────────────────
  const userCount = await prisma.user.count();
  const totalRecords = await prisma.financialRecord.count();

  console.log("\n══════════════════════════════════════════════");
  console.log("  Seed Complete");
  console.log("══════════════════════════════════════════════");
  console.log(`  Users   : ${userCount}`);
  console.log(`  Records : ${totalRecords}`);
  console.log("══════════════════════════════════════════════");
  console.log("\n📋 Test Credentials (all passwords: Password123):");
  console.log("  Admin   : admin@finance.com");
  console.log("  Analyst : analyst@finance.com");
  console.log("  Viewer  : viewer@finance.com");
  console.log("");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
