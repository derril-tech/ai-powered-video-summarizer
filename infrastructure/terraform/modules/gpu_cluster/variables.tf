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

variable "ecs_security_group_id" {
  description = "ECS security group ID"
  type        = string
}

variable "bastion_security_group_id" {
  description = "Bastion security group ID"
  type        = string
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN for GPU instances"
  type        = string
}

variable "gpu_ami_id" {
  description = "AMI ID for GPU instances"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Deep Learning AMI GPU PyTorch 2.0.1
}

variable "gpu_instance_type" {
  description = "GPU instance type"
  type        = string
  default     = "g4dn.xlarge"
}

variable "min_size" {
  description = "Minimum number of GPU instances"
  type        = number
  default     = 0
}

variable "max_size" {
  description = "Maximum number of GPU instances"
  type        = number
  default     = 10
}

variable "desired_capacity" {
  description = "Desired number of GPU instances"
  type        = number
  default     = 0
}
