# Created automatically by Cursor AI (2024-12-19)
# GPU Cluster with autoscaling for ASR and clip rendering

# ECS Cluster for GPU workloads
resource "aws_ecs_cluster" "gpu_cluster" {
  name = "${var.environment}-gpu-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Environment = var.environment
    Purpose     = "GPU Processing"
  }
}

# Auto Scaling Group for GPU instances
resource "aws_autoscaling_group" "gpu_asg" {
  name                = "${var.environment}-gpu-asg"
  desired_capacity    = var.desired_capacity
  max_size           = var.max_size
  min_size           = var.min_size
  target_group_arns  = [aws_lb_target_group.gpu_tg.arn]
  vpc_zone_identifier = var.private_subnets
  health_check_type  = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.gpu_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value              = "${var.environment}-gpu-instance"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value              = var.environment
    propagate_at_launch = true
  }
}

# Launch Template for GPU instances
resource "aws_launch_template" "gpu_lt" {
  name_prefix   = "${var.environment}-gpu-lt"
  image_id      = var.gpu_ami_id
  instance_type = var.gpu_instance_type

  network_interfaces {
    associate_public_ip_address = false
    security_groups            = [aws_security_group.gpu_sg.id]
    subnet_id                  = var.private_subnets[0]
  }

  iam_instance_profile {
    name = aws_iam_instance_profile.gpu_profile.name
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    cluster_name = aws_ecs_cluster.gpu_cluster.name
    environment  = var.environment
  }))

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.environment}-gpu-instance"
      Environment = var.environment
      Purpose     = "GPU Processing"
    }
  }
}

# Security Group for GPU instances
resource "aws_security_group" "gpu_sg" {
  name        = "${var.environment}-gpu-sg"
  description = "Security group for GPU processing instances"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
    description     = "Worker API from ECS"
  }

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [var.bastion_security_group_id]
    description     = "SSH from bastion"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment}-gpu-sg"
    Environment = var.environment
  }
}

# Application Load Balancer for GPU instances
resource "aws_lb" "gpu_lb" {
  name               = "${var.environment}-gpu-lb"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.gpu_lb_sg.id]
  subnets           = var.private_subnets

  enable_deletion_protection = false

  tags = {
    Name        = "${var.environment}-gpu-lb"
    Environment = var.environment
  }
}

# Security Group for GPU Load Balancer
resource "aws_security_group" "gpu_lb_sg" {
  name        = "${var.environment}-gpu-lb-sg"
  description = "Security group for GPU load balancer"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [var.ecs_security_group_id]
    description     = "Worker API from ECS"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment}-gpu-lb-sg"
    Environment = var.environment
  }
}

# Target Group for GPU instances
resource "aws_lb_target_group" "gpu_tg" {
  name     = "${var.environment}-gpu-tg"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  tags = {
    Name        = "${var.environment}-gpu-tg"
    Environment = var.environment
  }
}

# Load Balancer Listener
resource "aws_lb_listener" "gpu_listener" {
  load_balancer_arn = aws_lb.gpu_lb.arn
  port              = "8000"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gpu_tg.arn
  }
}

# Auto Scaling Policies
resource "aws_autoscaling_policy" "gpu_scale_up" {
  name                   = "${var.environment}-gpu-scale-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown              = 300
  autoscaling_group_name = aws_autoscaling_group.gpu_asg.name
}

resource "aws_autoscaling_policy" "gpu_scale_down" {
  name                   = "${var.environment}-gpu-scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown              = 300
  autoscaling_group_name = aws_autoscaling_group.gpu_asg.name
}

# CloudWatch Alarms for scaling
resource "aws_cloudwatch_metric_alarm" "gpu_cpu_high" {
  alarm_name          = "${var.environment}-gpu-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Scale up if CPU > 80% for 10 minutes"
  alarm_actions       = [aws_autoscaling_policy.gpu_scale_up.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.gpu_asg.name
  }
}

resource "aws_cloudwatch_metric_alarm" "gpu_cpu_low" {
  alarm_name          = "${var.environment}-gpu-cpu-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "20"
  alarm_description   = "Scale down if CPU < 20% for 10 minutes"
  alarm_actions       = [aws_autoscaling_policy.gpu_scale_down.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.gpu_asg.name
  }
}

# IAM Role for GPU instances
resource "aws_iam_role" "gpu_role" {
  name = "${var.environment}-gpu-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "gpu_profile" {
  name = "${var.environment}-gpu-profile"
  role = aws_iam_role.gpu_role.name
}

# IAM Policy for GPU instances
resource "aws_iam_role_policy" "gpu_policy" {
  name = "${var.environment}-gpu-policy"
  role = aws_iam_role.gpu_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:RegisterContainerInstance",
          "ecs:DeregisterContainerInstance",
          "ecs:DiscoverPollEndpoint",
          "ecs:Submit*",
          "ecs:Poll",
          "ecs:StartTelemetrySession"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${var.s3_bucket_arn}/*"
      }
    ]
  })
}
