import bcrypt from "bcryptjs";
import postgres from "postgres";
import { invoices, customers, revenue, users } from "../lib/placeholder-data";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

async function dropTable() {
  console.log("IN DROP TABLE");
  try {
    await sql`DROP TABLE IF EXISTS revenue, users, customers, invoices;`;
    Response.json({ message: "Table dropped successfully" });
  } catch (error) {
    Response.json("failed to drop table");
  }
  console.log("returning after drop table");
  return;
}

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;`;
    })
  );

  console.log("returning after USERS table");
  return insertedUsers;
}

async function seedInvoices() {
  console.log("IN INVOICES FUNC");
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );`;

  const insertedInvoices = await Promise.all(
    invoices.map((invoice) => {
      console.log("inserting invoice", invoice);
      return sql`INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;`;
    })
  );

  console.log("returning after INVOICES table");
  return insertedInvoices;
}

async function seedCustomers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );`;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => sql`INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;`
    )
  );

  console.log("returning after CUSTOMERS table");
  return insertedCustomers;
}

async function seedRevenue() {
  await sql`CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );`;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql`INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;`
    )
  );

  console.log("returning after REVENUE table");
  return insertedRevenue;
}

export async function GET(/*req: NextRequest, res: NextResponse*/) {
  console.log("IN SEED DB postgres GET");
  //console.log("context:", context);

  //const { req, res } = context;
  //console.log("req:", req, "\nres", res);

  try {
    console.log("IN TRY to drop table..");
    await dropTable();
    const result = await sql.begin((sql) => [
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
    ]);
    console.log("after all awaits, responding");

    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    console.log("error in GET:", error);
    return Response.json({ error }, { status: 500 });
  }
}
