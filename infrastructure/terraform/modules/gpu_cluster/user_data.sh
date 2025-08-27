#!/bin/bash
# Created automatically by Cursor AI (2024-12-19)
# User data script for GPU instances

set -e

# Install Docker
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install ECS agent
yum install -y ecs-init
systemctl enable --now ecs

# Configure ECS agent
mkdir -p /etc/ecs
cat > /etc/ecs/ecs.config <<EOF
ECS_CLUSTER=${cluster_name}
ECS_ENABLE_TASK_ENI=true
ECS_ENABLE_TASK_IAM_ROLE=true
ECS_ENABLE_CONTAINER_METADATA=true
ECS_AVAILABLE_LOGGING_DRIVERS=["json-file","awslogs","fluentd"]
ECS_LOGLEVEL=info
EOF

# Install NVIDIA Docker runtime
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.repo | tee /etc/yum.repos.d/nvidia-docker.repo
yum install -y nvidia-docker2
systemctl restart docker

# Install GPU monitoring tools
yum install -y nvidia-smi

# Start ECS agent
systemctl start ecs

# Log GPU info
nvidia-smi > /var/log/gpu-info.log 2>&1 || echo "No GPU detected" > /var/log/gpu-info.log

echo "GPU instance setup complete for cluster: ${cluster_name}"
