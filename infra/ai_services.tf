// ai_services.tf
// Provisions Azure AI Services (Language, Speech, OpenAI, AI Search)
// TODO: Add AI service resource definitions

resource "azurerm_cognitive_account" "finassist_speech" {
  name                = "finassist-speech"
  location            = azurerm_resource_group.finassist_rg.location
  resource_group_name = azurerm_resource_group.finassist_rg.name
  kind                = "SpeechServices"
  sku_name            = "S0"
}

resource "azurerm_cognitive_account" "finassist_language" {
  name                = "finassist-language"
  location            = azurerm_resource_group.finassist_rg.location
  resource_group_name = azurerm_resource_group.finassist_rg.name
  kind                = "TextAnalytics"
  sku_name            = "F0"
}

resource "azurerm_cognitive_account" "finassist_openai" {
  name                = "finassist-openai"
  location            = azurerm_resource_group.finassist_rg.location
  resource_group_name = azurerm_resource_group.finassist_rg.name
  kind                = "OpenAI"
  sku_name            = "S0"
}

resource "azurerm_search_service" "finassist_search" {
  name                = "finassist-search"
  location            = azurerm_resource_group.finassist_rg.location
  resource_group_name = azurerm_resource_group.finassist_rg.name
  sku                 = "standard"
  partition_count     = 1
  replica_count       = 1
}