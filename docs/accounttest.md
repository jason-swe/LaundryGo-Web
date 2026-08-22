# LaundryGo Test Accounts

Source: backend Flyway migrations in `LaundryGo_BE/src/main/resources/db/migration`.

## Main Mock Accounts From V15

File: `V15__insert_mock_data_laundrygo.sql`

Password for all V15 seed accounts:

```txt
123456
```

```txt
Customers:
cus01@laundrygo.com ... cus20@laundrygo.com

Shop owners:
owner01@laundrygo.com ... owner20@laundrygo.com

Shippers:
ship01@laundrygo.com ... ship20@laundrygo.com
```

Recommended smoke-test accounts:

```txt
Customer:   cus01@laundrygo.com   / 123456
Shop owner: owner01@laundrygo.com / 123456
Shipper:    ship01@laundrygo.com  / 123456
```

## Dedicated Local Shipper Test Account

File: `V17__seed_test_shipper_account.sql`

```txt
Shipper: shipper.test@laundrygo.com / pass123
```

Use this account first when testing `/driver/tasks`, `/driver/history`, or `/driver/overview`.

## Original Seed Accounts From V2

File: `V2__seed_data.sql`

```txt
Admin:      admin@laundrygo.com     / admin123
Shop owner: owner1@laundrygo.com    / owner123
Shop owner: owner2@laundrygo.com    / owner123
Customer:   customer1@laundrygo.com / pass123
Customer:   customer2@laundrygo.com / pass123
Customer:   customer3@laundrygo.com / pass123
```

## V16 Note

File: `V16__create_tasks_table_and_migrate_data.sql`

V16 does not create test accounts. It creates the `tasks` table and migrates existing `orders.shipper_id`
data into pickup/delivery task rows for the shipper dashboard.
