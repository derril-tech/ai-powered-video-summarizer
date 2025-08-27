# Created automatically by Cursor AI (2024-12-19)

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "database_endpoint" {
  description = "Database endpoint"
  value       = module.database.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.redis.endpoint
  sensitive   = true
}

output "nats_endpoint" {
  description = "NATS endpoint"
  value       = module.nats.endpoint
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = module.storage.bucket_name
}

output "cdn_domain" {
  description = "CloudFront CDN domain"
  value       = module.cdn.domain_name
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.ecs_cluster.api_url
}

output "load_balancer_dns" {
  description = "Load balancer DNS name"
  value       = module.ecs_cluster.load_balancer_dns
}
