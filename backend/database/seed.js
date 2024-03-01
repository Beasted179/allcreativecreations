const bcrypt = require("bcrypt");
require("dotenv").config();
const pool = require("../Client");
const { users, customers, reservations } = require("./helper");

console.log("Starting to seed the database...");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await pool.query(`
      DROP TABLE IF EXISTS reservations;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (e) {
    console.error("Error dropping tables!!!");
    throw e;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await pool.query(`
        CREATE TABLE users(
            internal_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            role VARCHAR(10) DEFAULT 'user'
        );
        CREATE TABLE customers(
            internal_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            customer_id INTEGER UNIQUE NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL
            CONSTRAINT email_format CHECK (email LIKE '%_@__%.__%')
        );
        CREATE TABLE reservations(
            internal_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            reservation_id INTEGER UNIQUE NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            customer_id UUID REFERENCES customers(internal_id) NOT NULL
            CONSTRAINT check_dates CHECK (start_date < end_date)
        );
        CREATE TABLE services(
          internal_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          service_id INTEGER UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          note VARCHAR(255) NOT NULL,
        );
        CREATE TABLE reservation_services(
          internal_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          reservation_id UUID REFERENCES customers(internal_id) NOT NULL,
          service_id UUID REFERENCES services(internal_id) NOT NULL,
          CONSTRAINT unique_reservation_service UNIQUE (reservation_id, service_id)
        );
    `);

    console.log("Finished building tables!");
  } catch (e) {
    console.error("Error building tables!!!");
    throw e;
  }
}

async function insertInitialData() {
  try {
    console.log("Starting to insert initial data...");

    //+process.env.SALT_ROUNDS << the + before process.env.SALT_ROUNDS is to convert the string to a number
    const hashedPassword = await bcrypt.hash("admin", +process.env.SALT_ROUNDS);

    await users
      .create({
        username: "admin",
        password: hashedPassword,
        email: "admin@example.com",
        role: "admin",
      })
      .then((result) => {
        console.log(result);
      });

    const devCustomers = [
      {
        customer_id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "test@example.com",
      },
      {
        customer_id: 2,
        first_name: "John1",
        last_name: "Doe1",
        email: "test1@example.com",
      },
      {
        customer_id: 3,
        first_name: "John2",
        last_name: "Doe2",
        email: "test2@example.com",
      },
      {
        customer_id: 4,
        first_name: "John3",
        last_name: "Doe3",
        email: "test3@example.com",
      },
      {
        customer_id: 5,
        first_name: "John4",
        last_name: "Doe4",
        email: "test4@example.com",
      },
      {
        customer_id: 6,
        first_name: "John5",
        last_name: "Doe5",
        email: "test5@example.com",
      },
      {
        customer_id: 7,
        first_name: "John6",
        last_name: "Doe6",
        email: "test6@example.com",
      },
      {
        customer_id: 8,
        first_name: "John7",
        last_name: "Doe7",
        email: "test7@example.com",
      },
      {
        customer_id: 9,
        first_name: "John8",
        last_name: "Doe8",
        email: "test8@example.com",
      },
    ];

    const customerInternalId = [];

    await Promise.all(
      devCustomers.map(async (customer) => {
        await customers.create(customer).then((result) => {
          console.log(result[0]);
          customerInternalId.push(result[0].internal_id);
        });
      })
    );

    const devReservations = [
      {
        reservation_id: 1,
        start_date: "2021-01-01",
        end_date: "2021-01-02",
        customer_id: customerInternalId[0],
      },
      {
        reservation_id: 2,
        start_date: "2021-01-04",
        end_date: "2021-01-12",
        customer_id: customerInternalId[1],
      },
      {
        reservation_id: 3,
        start_date: "2021-01-20",
        end_date: "2021-01-30",
        customer_id: customerInternalId[2],
      },
      {
        reservation_id: 4,
        start_date: "2021-01-31",
        end_date: "2021-02-08",
        customer_id: customerInternalId[0],
      },
    ];

    await Promise.all(
      devReservations.map(async (reservation) => {
        await reservations.create(reservation).then((result) => {
          console.log(result);
        });
      })
    );

    console.log("Finished inserting initial data!");
  } catch (e) {
    console.error("Error inserting initial data!!!");
    throw e;
  }
}

async function seed() {
  try {
    await dropTables();
    await createTables();
    await insertInitialData();
    console.log("Database seeded successfully!");
  } catch (e) {
    console.error("Error seeding database!!!");
    throw e;
  }
}

if (require.main === module) {
  seed();
}
