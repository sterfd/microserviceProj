resource "azurerm_resource_group" "flixtube" { #resource group called flixtube, type is azurerm_resource_group
  name     = var.app_name
  location = var.location
}
