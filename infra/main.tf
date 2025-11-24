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
}

resource "azurerm_resource_group" "finassist_rg" {
  name     = var.resource_group_name
  location = var.location
}