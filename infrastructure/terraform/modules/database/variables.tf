# Created automatically by Cursor AI (2024-12-19)

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnets" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
