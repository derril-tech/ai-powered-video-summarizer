# Created automatically by Cursor AI (2024-12-19)

resource "aws_db_subnet_group" "main" {
  name       = "${var.environment}-ai-video-summarizer-db-subnet-group"
  subnet_ids = var.private_subnets

  tags = {
    Name        = "${var.environment}-ai-video-summarizer-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "database" {
  name_prefix = "${var.environment}-ai-video-summarizer-db-"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment}-ai-video-summarizer-db-sg"
    Environment = var.environment
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.environment}-ai-video-summarizer-db"

  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "ai_video_summarizer"
  username = "postgres"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name        = "${var.environment}-ai-video-summarizer-db"
    Environment = var.environment
  }
}

# Security group for ECS tasks to access database
resource "aws_security_group" "ecs" {
  name_prefix = "${var.environment}-ai-video-summarizer-ecs-"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment}-ai-video-summarizer-ecs-sg"
    Environment = var.environment
  }
}
