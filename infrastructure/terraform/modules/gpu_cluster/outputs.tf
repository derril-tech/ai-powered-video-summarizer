# Created automatically by Cursor AI (2024-12-19)

output "cluster_id" {
  description = "ECS GPU cluster ID"
  value       = aws_ecs_cluster.gpu_cluster.id
}

output "cluster_name" {
  description = "ECS GPU cluster name"
  value       = aws_ecs_cluster.gpu_cluster.name
}

output "asg_name" {
  description = "Auto Scaling Group name"
  value       = aws_autoscaling_group.gpu_asg.name
}

output "load_balancer_dns" {
  description = "GPU load balancer DNS name"
  value       = aws_lb.gpu_lb.dns_name
}

output "target_group_arn" {
  description = "GPU target group ARN"
  value       = aws_lb_target_group.gpu_tg.arn
}

output "security_group_id" {
  description = "GPU security group ID"
  value       = aws_security_group.gpu_sg.id
}
