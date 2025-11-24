// variables.tf
// Declares variables for resource names, locations, secrets
variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
  default     = "finassist-rg"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}