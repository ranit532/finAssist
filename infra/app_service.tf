// app_service.tf
// Provisions Azure App Service Plan and Linux Web App for Python backend
resource "azurerm_app_service_plan" "finassist_plan" {
  name                = "finassist-app-plan"
  location            = azurerm_resource_group.finassist_rg.location
  resource_group_name = azurerm_resource_group.finassist_rg.name
  kind                = "Linux"
  reserved            = true
  sku {
    tier = "Basic"
    size = "B1"
  }
}

resource "azurerm_linux_web_app" "finassist_webapp" {
  name                = "finassist-backend"
  location            = azurerm_resource_group.finassist_rg.location
  resource_group_name = azurerm_resource_group.finassist_rg.name
  service_plan_id     = azurerm_app_service_plan.finassist_plan.id
  site_config {
    always_on = true
    linux_fx_version = "PYTHON|3.10"
  }
}