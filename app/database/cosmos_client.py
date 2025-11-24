import os
from azure.cosmos import CosmosClient

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
COSMOS_DB_NAME = os.getenv("COSMOS_DB_NAME")
COSMOS_CONTAINER_NAME = os.getenv("COSMOS_CONTAINER_NAME")

client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
database = client.get_database_client(COSMOS_DB_NAME)
container = database.get_container_client(COSMOS_CONTAINER_NAME)

# Example function to fetch conversation insights (to be used in insights.py)
def get_conversation_insights(session_id: str):
    query = f"SELECT * FROM c WHERE c.session_id = '{session_id}'"
    items = list(container.query_items(query=query, enable_cross_partition_query=True))
    return items