// outputs.tf
// Outputs important endpoints and IDs
output "resource_group_name" {
  value = azurerm_resource_group.finassist_rg.name
}

output "cosmosdb_account_endpoint" {
  value = azurerm_cosmosdb_account.finassist_cosmos.endpoint
}

output "cosmosdb_db_name" {
  value = azurerm_cosmosdb_sql_database.finassist_db.name
}

output "cosmosdb_container_name" {
  value = azurerm_cosmosdb_sql_container.finassist_container.name
}

output "speech_service_endpoint" {
  value = azurerm_cognitive_account.finassist_speech.endpoint
}

output "language_service_endpoint" {
  value = azurerm_cognitive_account.finassist_language.endpoint
}

output "openai_service_endpoint" {
  value = azurerm_cognitive_account.finassist_openai.endpoint
}

output "search_service_name" {
  value = azurerm_search_service.finassist_search.name
}

output "search_service_id" {
  value = azurerm_search_service.finassist_search.id
}

output "webapp_url" {
  value = azurerm_linux_web_app.finassist_webapp.default_hostname
}

output "appinsights_instrumentation_key" {
  value     = azurerm_application_insights.finassist_appinsights.instrumentation_key
  sensitive = true
}