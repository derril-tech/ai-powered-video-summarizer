# Created automatically by Cursor AI (2024-12-19)

# Video Processing Error Budget Exhausted

## Alert Description
Video processing error rate has exceeded 1% over the last 24 hours, indicating a significant degradation in service quality.

## Severity
**Critical** - This affects core business functionality and user experience.

## Impact Assessment
- **User Impact**: Users cannot process videos or get poor quality results
- **Business Impact**: Revenue loss, customer churn, support ticket increase
- **Technical Impact**: Resource waste, potential data corruption

## Immediate Actions (0-15 minutes)

### 1. Acknowledge Alert
- Respond to alert in monitoring system
- Update incident channel: "🚨 Video processing error budget exhausted - investigating"
- Notify on-call engineer if not already aware

### 2. Initial Investigation
```bash
# Check current error rate
curl -s "http://prometheus:9090/api/v1/query?query=sum(rate(video_processing_errors_total[1h]))/sum(rate(video_processing_total[1h]))*100"

# Check error types breakdown
curl -s "http://prometheus:9090/api/v1/query?query=sum(rate(video_processing_errors_total[1h])) by (error_type)"

# Check queue depth
curl -s "http://prometheus:9090/api/v1/query?query=sum(video_processing_queue_depth)"
```

### 3. Service Health Check
```bash
# Check worker status
kubectl get pods -n video-processing -l app=worker

# Check NATS connectivity
kubectl exec -n video-processing deployment/nats -- nats-sub test

# Check database connectivity
kubectl exec -n video-processing deployment/api-gateway -- curl -s http://localhost:8080/health
```

## Investigation (15-60 minutes)

### 1. Error Pattern Analysis
- **Check Error Types**: Are errors concentrated in specific processing steps?
- **Time Pattern**: When did errors start increasing?
- **Resource Correlation**: Are errors related to resource constraints?

### 2. Log Analysis
```bash
# Check recent error logs
kubectl logs -n video-processing deployment/gpu-worker --since=1h | grep ERROR

# Check API gateway logs
kubectl logs -n video-processing deployment/api-gateway --since=1h | grep "5xx"

# Check worker logs for specific error patterns
kubectl logs -n video-processing deployment/asr-worker --since=1h | grep -i "timeout\|memory\|gpu"
```

### 3. Resource Investigation
```bash
# Check GPU utilization
kubectl exec -n monitoring deployment/prometheus -- curl -s "http://localhost:9090/api/v1/query?query=nvidia_gpu_utilization"

# Check memory usage
kubectl exec -n monitoring deployment/prometheus -- curl -s "http://localhost:9090/api/v1/query?query=container_memory_usage_bytes"

# Check CPU usage
kubectl exec -n monitoring deployment/prometheus -- curl -s "http://localhost:9090/api/v1/query?query=container_cpu_usage_seconds_total"
```

### 4. Recent Changes Check
- **Deployments**: Any recent code deployments?
- **Configuration**: Any configuration changes?
- **Infrastructure**: Any infrastructure changes?
- **Dependencies**: Any third-party service issues?

## Mitigation Strategies

### 1. Immediate Mitigation (0-30 minutes)

#### If Resource Constrained:
```bash
# Scale up workers
kubectl scale deployment gpu-worker --replicas=10 -n video-processing
kubectl scale deployment asr-worker --replicas=5 -n video-processing

# Scale up API gateway
kubectl scale deployment api-gateway --replicas=5 -n video-processing
```

#### If Specific Error Type:
```bash
# Restart problematic workers
kubectl rollout restart deployment/gpu-worker -n video-processing

# Clear stuck jobs
kubectl exec -n video-processing deployment/api-gateway -- curl -X POST http://localhost:8080/api/jobs/clear-stuck
```

#### If Queue Overflow:
```bash
# Pause new video uploads temporarily
kubectl patch deployment api-gateway -n video-processing -p '{"spec":{"template":{"metadata":{"annotations":{"pause-uploads":"true"}}}}}'

# Process existing queue with higher priority
kubectl exec -n video-processing deployment/job-orchestrator -- curl -X POST http://localhost:8080/api/jobs/prioritize
```

### 2. Medium-term Mitigation (30-120 minutes)

#### If GPU Issues:
```bash
# Check GPU driver status
kubectl exec -n video-processing deployment/gpu-worker -- nvidia-smi

# Restart GPU workers with fresh drivers
kubectl rollout restart deployment/gpu-worker -n video-processing
```

#### If Database Issues:
```bash
# Check database connection pool
kubectl exec -n video-processing deployment/api-gateway -- curl -s http://localhost:8080/health/db

# Increase connection pool size
kubectl patch configmap api-gateway-config -n video-processing -p '{"data":{"DB_MAX_CONNECTIONS":"50"}}'
```

#### If NATS Issues:
```bash
# Check NATS cluster health
kubectl exec -n video-processing deployment/nats -- nats-server --version

# Restart NATS if needed
kubectl rollout restart deployment/nats -n video-processing
```

## Resolution Steps

### 1. Verify Fix
```bash
# Monitor error rate improvement
watch -n 30 'curl -s "http://prometheus:9090/api/v1/query?query=sum(rate(video_processing_errors_total[5m]))/sum(rate(video_processing_total[5m]))*100"'

# Check success rate
watch -n 30 'curl -s "http://prometheus:9090/api/v1/query?query=sum(rate(video_processing_success_total[5m]))/sum(rate(video_processing_total[5m]))*100"'
```

### 2. Resume Normal Operations
```bash
# Resume video uploads if paused
kubectl patch deployment api-gateway -n video-processing -p '{"spec":{"template":{"metadata":{"annotations":{"pause-uploads":"false"}}}}}'

# Scale back to normal levels
kubectl scale deployment gpu-worker --replicas=5 -n video-processing
kubectl scale deployment asr-worker --replicas=3 -n video-processing
```

### 3. Update Status
- Update incident channel: "✅ Video processing error budget restored - monitoring"
- Update status page if customer-facing impact
- Document resolution steps

## Post-Incident Actions

### 1. Root Cause Analysis
- **Schedule Post-Mortem**: Within 24 hours
- **Document Findings**: Update this runbook
- **Implement Preventive Measures**

### 2. Monitoring Improvements
- **Add Additional Alerts**: Earlier warning thresholds
- **Improve Dashboards**: Better visibility into error patterns
- **Enhance Logging**: More detailed error context

### 3. Process Improvements
- **Update Runbooks**: Based on lessons learned
- **Improve Automation**: Reduce manual intervention time
- **Enhance Training**: Share knowledge with team

## Common Root Causes

### 1. Resource Exhaustion
- **GPU Memory**: Large video files exceeding GPU memory
- **System Memory**: Insufficient RAM for processing
- **Disk Space**: Temporary storage full
- **CPU**: Overloaded processing pipeline

### 2. External Dependencies
- **Database**: Connection pool exhaustion
- **Storage**: S3/R2 upload failures
- **NATS**: Message queue overflow
- **Third-party APIs**: Rate limiting or outages

### 3. Code Issues
- **Memory Leaks**: Gradual resource consumption
- **Race Conditions**: Concurrent processing conflicts
- **Configuration Errors**: Invalid settings
- **Version Incompatibilities**: Dependency conflicts

### 4. Infrastructure Issues
- **Node Failures**: Hardware or network issues
- **Network Latency**: Slow external service responses
- **Load Balancer**: Traffic distribution problems
- **DNS**: Resolution failures

## Prevention Measures

### 1. Proactive Monitoring
- **Early Warning Alerts**: 0.5% error rate threshold
- **Resource Monitoring**: GPU, memory, disk usage
- **Queue Monitoring**: Processing queue depth
- **Health Checks**: Regular service health validation

### 2. Capacity Planning
- **Auto-scaling**: Based on queue depth and error rates
- **Resource Limits**: Proper resource allocation
- **Load Testing**: Regular performance validation
- **Capacity Reviews**: Monthly capacity assessment

### 3. Code Quality
- **Error Handling**: Comprehensive error handling
- **Retry Logic**: Exponential backoff for transient failures
- **Circuit Breakers**: Prevent cascade failures
- **Graceful Degradation**: Partial functionality during issues

### 4. Infrastructure Resilience
- **Redundancy**: Multiple availability zones
- **Backup Systems**: Failover mechanisms
- **Monitoring**: Comprehensive observability
- **Documentation**: Up-to-date runbooks and procedures

## Escalation Path

### 1. Primary On-Call Engineer
- **Response Time**: 15 minutes
- **Actions**: Initial investigation and mitigation

### 2. Secondary On-Call Engineer
- **Escalation**: 30 minutes if no response
- **Support**: Assist with complex issues

### 3. Engineering Manager
- **Escalation**: 1 hour if unresolved
- **Coordination**: Cross-team communication

### 4. CTO/VP Engineering
- **Escalation**: 2 hours if critical business impact
- **Decision Making**: Strategic response coordination

## Communication Templates

### Internal Update
```
🚨 Video Processing Error Budget Exhausted
- Current error rate: X%
- Impact: Users unable to process videos
- Status: Investigating root cause
- ETA: TBD
```

### Customer Communication
```
We're currently experiencing issues with video processing that may affect your ability to process new videos. Our team is actively working to resolve this issue. We'll provide updates as we have more information.
```

### Resolution Update
```
✅ Video Processing Error Budget Restored
- Root cause: [Brief description]
- Resolution: [Actions taken]
- Prevention: [Measures implemented]
- Monitoring: [Ongoing monitoring]
```
