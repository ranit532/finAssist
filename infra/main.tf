terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0.0"
    }
  }
  backend "local" {}
}

provider "azurerm" {
  features {}
  subscription_id = "e8f896b2-d879-4f42-9ddc-8951669e072f"
}

resource "azurerm_resource_group" "finassist_rg" {
  name     = var.resource_group_name
  location = var.location
}