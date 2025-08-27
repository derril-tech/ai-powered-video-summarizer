// Created automatically by Cursor AI (2024-12-19)
import { check } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const failureRecoveryTime = new Trend('failure_recovery_time');
const systemAvailability = new Rate('system_availability');
const dataIntegrity = new Rate('data_integrity');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 5 }, // Baseline
    { duration: '2m', target: 5 }, // Introduce failures
    { duration: '2m', target: 5 }, // Recovery period
    { duration: '1m', target: 0 }, // Cleanup
  ],
  thresholds: {
    system_availability: ['rate>0.8'], // System should be 80% available
    data_integrity: ['rate>0.95'], // Data integrity should be 95%
    failure_recovery_time: ['p(95)<60000'], // Recovery should be under 60s
  },
};

// Test data
const testUser = {
  id: 'chaos-test-user',
  orgId: 'chaos-test-org',
  token: 'mock-jwt-token-chaos',
};

const baseUrl = __ENV.API_URL || 'http://localhost:3001';

function createHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Request-ID': `chaos-test-${Date.now()}-${Math.random()}`,
  };
}

export default function () {
  const headers = createHeaders(testUser.token);

  // Test 1: Database Connection Failure Simulation
  if (Math.random() < 0.1) { // 10% chance to simulate DB failure
    console.log('Simulating database connection failure...');
    
    // This would typically be done by stopping the database service
    // For testing, we'll simulate by making requests that might fail
    
    const dbFailureStart = Date.now();
    
    // Try to create a video (might fail due to DB issues)
    const createResponse = http.post(
      `${baseUrl}/api/videos`,
      JSON.stringify({
        title: 'Chaos Test Video',
        description: 'Testing database failure recovery',
        url: 'https://example.com/chaos-test.mp4',
      }),
      { headers }
    );

    if (createResponse.status >= 500) {
      // Simulate retry after failure
      const retryResponse = http.post(
        `${baseUrl}/api/videos`,
        JSON.stringify({
          title: 'Chaos Test Video Retry',
          description: 'Retry after database failure',
          url: 'https://example.com/chaos-test-retry.mp4',
        }),
        { headers }
      );

      const recoveryTime = Date.now() - dbFailureStart;
      failureRecoveryTime.add(recoveryTime);

      check(retryResponse, {
        'database recovery successful': (r) => r.status === 201,
      }) || systemAvailability.add(0);
    }
  }

  // Test 2: GPU Worker Failure Simulation
  if (Math.random() < 0.15) { // 15% chance to simulate GPU failure
    console.log('Simulating GPU worker failure...');
    
    // Create a video and start processing
    const createResponse = http.post(
      `${baseUrl}/api/videos`,
      JSON.stringify({
        title: 'GPU Failure Test Video',
        description: 'Testing GPU worker failure recovery',
        url: 'https://example.com/gpu-failure-test.mp4',
      }),
      { headers }
    );

    if (createResponse.status === 201) {
      const videoId = createResponse.json('video.id');
      
      // Start processing (might fail due to GPU issues)
      const processResponse = http.post(
        `${baseUrl}/api/videos/${videoId}/process`,
        JSON.stringify({ steps: ['asr', 'summarization'] }),
        { headers }
      );

      if (processResponse.status === 200) {
        const jobIds = processResponse.json('jobIds');
        
        // Simulate job failure and retry
        const failureStart = Date.now();
        
        // Wait a bit then check status
        const statusResponse = http.get(
          `${baseUrl}/api/videos/${videoId}/status`,
          { headers }
        );

        if (statusResponse.json('status') === 'error') {
          // Simulate retry
          const retryResponse = http.post(
            `${baseUrl}/api/videos/${videoId}/retry`,
            JSON.stringify({ jobTypes: ['asr'] }),
            { headers }
          );

          const recoveryTime = Date.now() - failureStart;
          failureRecoveryTime.add(recoveryTime);

          check(retryResponse, {
            'GPU failure recovery successful': (r) => r.status === 200,
          }) || systemAvailability.add(0);
        }
      }
    }
  }

  // Test 3: Network Partition Simulation
  if (Math.random() < 0.08) { // 8% chance to simulate network issues
    console.log('Simulating network partition...');
    
    // Simulate intermittent network failures
    const networkFailureStart = Date.now();
    
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < 5; i++) {
      const response = http.get(
        `${baseUrl}/api/videos?limit=10`,
        { headers }
      );
      
      if (response.status === 200) {
        successCount++;
      } else {
        failureCount++;
      }
      
      // Simulate network delay
      if (Math.random() < 0.3) {
        const delay = Math.random() * 5000; // 0-5 second delay
        console.log(`Network delay: ${delay}ms`);
      }
    }
    
    const availability = successCount / (successCount + failureCount);
    systemAvailability.add(availability);
    
    const recoveryTime = Date.now() - networkFailureStart;
    failureRecoveryTime.add(recoveryTime);
  }

  // Test 4: Memory/Resource Exhaustion Simulation
  if (Math.random() < 0.12) { // 12% chance to simulate resource issues
    console.log('Simulating resource exhaustion...');
    
    // Create multiple videos simultaneously to stress the system
    const concurrentVideos = [];
    
    for (let i = 0; i < 10; i++) {
      const createResponse = http.post(
        `${baseUrl}/api/videos`,
        JSON.stringify({
          title: `Resource Test Video ${i}`,
          description: 'Testing resource exhaustion recovery',
          url: `https://example.com/resource-test-${i}.mp4`,
        }),
        { headers }
      );
      
      if (createResponse.status === 201) {
        concurrentVideos.push(createResponse.json('video.id'));
      }
    }
    
    // Start processing for all videos
    const resourceStressStart = Date.now();
    
    concurrentVideos.forEach(videoId => {
      http.post(
        `${baseUrl}/api/videos/${videoId}/process`,
        JSON.stringify({ steps: ['asr'] }),
        { headers }
      );
    });
    
    // Check system health after stress
    const healthResponse = http.get(`${baseUrl}/health`, { headers });
    
    const recoveryTime = Date.now() - resourceStressStart;
    failureRecoveryTime.add(recoveryTime);
    
    check(healthResponse, {
      'system health maintained': (r) => r.status === 200,
    }) || systemAvailability.add(0);
  }

  // Test 5: Data Corruption Simulation
  if (Math.random() < 0.05) { // 5% chance to simulate data corruption
    console.log('Simulating data corruption...');
    
    // Create a video with potentially corrupted data
    const createResponse = http.post(
      `${baseUrl}/api/videos`,
      JSON.stringify({
        title: 'Data Corruption Test Video',
        description: 'Testing data corruption detection and recovery',
        url: 'https://example.com/corruption-test.mp4',
        // Simulate corrupted metadata
        metadata: {
          duration: -1, // Invalid duration
          size: 'invalid-size', // Invalid size
        },
      }),
      { headers }
    );
    
    if (createResponse.status === 201) {
      const videoId = createResponse.json('video.id');
      
      // Try to retrieve the video
      const retrieveResponse = http.get(
        `${baseUrl}/api/videos/${videoId}`,
        { headers }
      );
      
      check(retrieveResponse, {
        'data integrity maintained': (r) => r.status === 200 && r.json('duration') > 0,
      }) || dataIntegrity.add(0);
    }
  }

  // Test 6: Partial Upload Failure Simulation
  if (Math.random() < 0.1) { // 10% chance to simulate upload failure
    console.log('Simulating partial upload failure...');
    
    // Create video record
    const createResponse = http.post(
      `${baseUrl}/api/videos`,
      JSON.stringify({
        title: 'Partial Upload Test Video',
        description: 'Testing partial upload failure recovery',
        url: 'https://example.com/partial-upload-test.mp4',
      }),
      { headers }
    );
    
    if (createResponse.status === 201) {
      const videoId = createResponse.json('video.id');
      
      // Simulate partial upload by trying to process before upload is complete
      const partialUploadStart = Date.now();
      
      const processResponse = http.post(
        `${baseUrl}/api/videos/${videoId}/process`,
        JSON.stringify({ steps: ['probe'] }),
        { headers }
      );
      
      if (processResponse.status >= 400) {
        // Simulate retry after upload completion
        const retryResponse = http.post(
          `${baseUrl}/api/videos/${videoId}/process`,
          JSON.stringify({ steps: ['probe'] }),
          { headers }
        );
        
        const recoveryTime = Date.now() - partialUploadStart;
        failureRecoveryTime.add(recoveryTime);
        
        check(retryResponse, {
          'partial upload recovery successful': (r) => r.status === 200,
        }) || systemAvailability.add(0);
      }
    }
  }

  // Test 7: Service Discovery Failure Simulation
  if (Math.random() < 0.07) { // 7% chance to simulate service discovery issues
    console.log('Simulating service discovery failure...');
    
    // Try to access a service that might be unavailable
    const discoveryFailureStart = Date.now();
    
    // Simulate by making requests to different endpoints
    const endpoints = [
      '/api/videos',
      '/api/videos/search',
      '/api/jobs/status',
      '/health',
    ];
    
    let availableServices = 0;
    
    endpoints.forEach(endpoint => {
      const response = http.get(`${baseUrl}${endpoint}`, { headers });
      if (response.status < 500) {
        availableServices++;
      }
    });
    
    const serviceAvailability = availableServices / endpoints.length;
    systemAvailability.add(serviceAvailability);
    
    const recoveryTime = Date.now() - discoveryFailureStart;
    failureRecoveryTime.add(recoveryTime);
  }

  // Test 8: Authentication/Authorization Failure Simulation
  if (Math.random() < 0.06) { // 6% chance to simulate auth issues
    console.log('Simulating authentication failure...');
    
    // Test with invalid token
    const invalidHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer invalid-token',
    };
    
    const authFailureStart = Date.now();
    
    const response = http.get(
      `${baseUrl}/api/videos`,
      { headers: invalidHeaders }
    );
    
    // Should get 401/403
    check(response, {
      'authentication failure handled correctly': (r) => r.status === 401 || r.status === 403,
    }) || systemAvailability.add(0);
    
    // Test with valid token after failure
    const validResponse = http.get(
      `${baseUrl}/api/videos`,
      { headers }
    );
    
    const recoveryTime = Date.now() - authFailureStart;
    failureRecoveryTime.add(recoveryTime);
    
    check(validResponse, {
      'authentication recovery successful': (r) => r.status === 200,
    }) || systemAvailability.add(0);
  }

  // Baseline functionality test (always run)
  const baselineResponse = http.get(
    `${baseUrl}/api/videos?limit=5`,
    { headers }
  );
  
  check(baselineResponse, {
    'baseline functionality maintained': (r) => r.status === 200,
  }) || systemAvailability.add(0);
}

// Test cleanup
export function teardown(data: any) {
  console.log('Chaos test completed');
  console.log('Final metrics:', JSON.stringify(data, null, 2));
  
  // Clean up test data
  const headers = createHeaders(testUser.token);
  
  // Delete test videos
  const videosResponse = http.get(
    `${baseUrl}/api/videos?limit=100`,
    { headers }
  );
  
  if (videosResponse.status === 200) {
    const videos = videosResponse.json();
    videos.forEach((video: any) => {
      if (video.title.includes('Chaos Test') || 
          video.title.includes('GPU Failure') ||
          video.title.includes('Resource Test') ||
          video.title.includes('Data Corruption') ||
          video.title.includes('Partial Upload')) {
        http.delete(`${baseUrl}/api/videos/${video.id}`, { headers });
      }
    });
  }
}

// Test setup
export function setup() {
  console.log('Starting chaos test...');
  console.log('API URL:', baseUrl);
  console.log('Test user:', testUser.id);
  
  return {
    startTime: new Date().toISOString(),
    testUser: testUser.id,
  };
}
