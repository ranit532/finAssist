// application_insights.tf
// Provisions Application Insights for monitoring
resource "azurerm_application_insights" "finassist_appinsights" {
  name                = "finassist-appinsights"
  location            = azurerm_resource_group.finassist_rg.location
  resource_group_name = azurerm_resource_group.finassist_rg.name
  application_type    = "web"
}