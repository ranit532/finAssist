// app_service.tf
// Provisions Azure App Service Plan and Linux Web App for Python backend
resource "azurerm_service_plan" "finassist_plan" {
  name                = "finassist-app-plan"
  location            = azurerm_resource_group.finassist_rg.location
  resource_group_name = azurerm_resource_group.finassist_rg.name
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "random_id" "webapp_suffix" {
  byte_length = 4
}

resource "azurerm_linux_web_app" "finassist_webapp" {
  name                = "finassist-backend-${random_id.webapp_suffix.hex}"
  location            = azurerm_resource_group.finassist_rg.location
  resource_group_name = azurerm_resource_group.finassist_rg.name
  service_plan_id     = azurerm_service_plan.finassist_plan.id
  site_config {
    always_on = true
  }
}