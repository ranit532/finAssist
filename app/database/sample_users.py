import os
from dotenv import load_dotenv
import random
import string
from azure.cosmos import CosmosClient
from faker import Faker

load_dotenv()
# Load Cosmos DB credentials from environment variables
COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
COSMOS_DB_NAME = os.getenv("COSMOS_DB_NAME")
COSMOS_CONTAINER_NAME = os.getenv("COSMOS_CONTAINER_NAME")

client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
database = client.get_database_client(COSMOS_DB_NAME)
container = database.get_container_client(COSMOS_CONTAINER_NAME)

fake = Faker()

# Generate 100 sample users
users = []
for i in range(100):
    user_id = f"C{str(91000 + i).zfill(5)}"
    user = {
        "id": user_id,
        "userId": user_id,
        "name": fake.name(),
        "address": fake.address(),
        "creditCardNumber": fake.credit_card_number(card_type=None),
        "email": fake.email(),
        "phone": fake.phone_number(),
        "dob": fake.date_of_birth(minimum_age=18, maximum_age=80).isoformat(),
        "accountBalance": round(random.uniform(1000, 10000), 2),
        "createdAt": fake.date_time_this_decade().isoformat()
    }
    users.append(user)

# Insert users into Cosmos DB
for user in users:
    container.upsert_item(user)

print("Inserted 100 sample users into Cosmos DB.")
