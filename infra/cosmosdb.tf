// cosmosdb.tf
// Provisions Azure Cosmos DB account, database, and container
resource "azurerm_cosmosdb_account" "finassist_cosmos" {
  name                = "finassist-cosmos-account"
  location            = azurerm_resource_group.finassist_rg.location
  resource_group_name = azurerm_resource_group.finassist_rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"
  consistency_policy {
    consistency_level = "Session"
  }
  geo_location {
    location          = azurerm_resource_group.finassist_rg.location
    failover_priority = 0
  }
}

resource "azurerm_cosmosdb_sql_database" "finassist_db" {
  name                = "finassist-db"
  resource_group_name = azurerm_resource_group.finassist_rg.name
  account_name        = azurerm_cosmosdb_account.finassist_cosmos.name
}

resource "azurerm_cosmosdb_sql_container" "finassist_container" {
  name                = "users"
  resource_group_name = azurerm_resource_group.finassist_rg.name
  account_name        = azurerm_cosmosdb_account.finassist_cosmos.name
  database_name       = azurerm_cosmosdb_sql_database.finassist_db.name
  partition_key_paths = ["/userId"]
  throughput          = 400
}