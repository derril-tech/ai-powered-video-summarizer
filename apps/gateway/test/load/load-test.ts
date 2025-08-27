// Created automatically by Cursor AI (2024-12-19)
import { check } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const videoCreationTime = new Trend('video_creation_time');
const videoProcessingTime = new Trend('video_processing_time');
const videoRetrievalTime = new Trend('video_retrieval_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'], // Error rate should be below 10%
    errors: ['rate<0.1'],
    video_creation_time: ['p(95)<5000'], // 95% of video creations below 5s
    video_processing_time: ['p(95)<30000'], // 95% of processing starts below 30s
    video_retrieval_time: ['p(95)<1000'], // 95% of retrievals below 1s
  },
};

// Test data
const testUsers = [
  { id: 'user-1', orgId: 'org-1', token: 'mock-jwt-token-1' },
  { id: 'user-2', orgId: 'org-1', token: 'mock-jwt-token-2' },
  { id: 'user-3', orgId: 'org-2', token: 'mock-jwt-token-3' },
  { id: 'user-4', orgId: 'org-2', token: 'mock-jwt-token-4' },
  { id: 'user-5', orgId: 'org-3', token: 'mock-jwt-token-5' },
];

const videoTitles = [
  'Load Test Video 1',
  'Load Test Video 2',
  'Load Test Video 3',
  'Load Test Video 4',
  'Load Test Video 5',
];

// Helper function to get random user
function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

// Helper function to get random video title
function getRandomVideoTitle() {
  return videoTitles[Math.floor(Math.random() * videoTitles.length)];
}

// Helper function to create headers
function createHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Request-ID': `load-test-${Date.now()}-${Math.random()}`,
  };
}

export default function () {
  const user = getRandomUser();
  const baseUrl = __ENV.API_URL || 'http://localhost:3001';

  // Test 1: Video Creation
  const createVideoPayload = {
    title: getRandomVideoTitle(),
    description: 'Load test video description',
    url: 'https://example.com/load-test-video.mp4',
  };

  const createStartTime = Date.now();
  const createResponse = http.post(
    `${baseUrl}/api/videos`,
    JSON.stringify(createVideoPayload),
    { headers: createHeaders(user.token) }
  );

  const createEndTime = Date.now();
  videoCreationTime.add(createEndTime - createStartTime);

  check(createResponse, {
    'video creation successful': (r) => r.status === 201,
    'video creation has video ID': (r) => r.json('video.id') !== undefined,
    'video creation has upload URL': (r) => r.json('uploadUrl') !== undefined,
  }) || errorRate.add(1);

  if (createResponse.status === 201) {
    const videoId = createResponse.json('video.id');

    // Test 2: Video Processing
    const processingPayload = {
      steps: ['probe', 'asr', 'summarization'],
    };

    const processingStartTime = Date.now();
    const processingResponse = http.post(
      `${baseUrl}/api/videos/${videoId}/process`,
      JSON.stringify(processingPayload),
      { headers: createHeaders(user.token) }
    );

    const processingEndTime = Date.now();
    videoProcessingTime.add(processingEndTime - processingStartTime);

    check(processingResponse, {
      'video processing started': (r) => r.status === 200,
      'processing has job IDs': (r) => r.json('jobIds').length > 0,
      'processing status is processing': (r) => r.json('status') === 'processing',
    }) || errorRate.add(1);

    // Test 3: Video Retrieval
    const retrievalStartTime = Date.now();
    const retrievalResponse = http.get(
      `${baseUrl}/api/videos/${videoId}`,
      { headers: createHeaders(user.token) }
    );

    const retrievalEndTime = Date.now();
    videoRetrievalTime.add(retrievalEndTime - retrievalStartTime);

    check(retrievalResponse, {
      'video retrieval successful': (r) => r.status === 200,
      'video has correct ID': (r) => r.json('id') === videoId,
      'video has correct org ID': (r) => r.json('orgId') === user.orgId,
    }) || errorRate.add(1);

    // Test 4: Video Status Check
    const statusResponse = http.get(
      `${baseUrl}/api/videos/${videoId}/status`,
      { headers: createHeaders(user.token) }
    );

    check(statusResponse, {
      'status check successful': (r) => r.status === 200,
      'status has progress info': (r) => r.json('progress') !== undefined,
    }) || errorRate.add(1);

    // Test 5: Video Search
    const searchResponse = http.get(
      `${baseUrl}/api/videos?query=load&limit=10&offset=0`,
      { headers: createHeaders(user.token) }
    );

    check(searchResponse, {
      'search successful': (r) => r.status === 200,
      'search returns array': (r) => Array.isArray(r.json()),
    }) || errorRate.add(1);
  }

  // Test 6: Concurrent Video Processing (simulate multiple videos)
  if (Math.random() < 0.3) { // 30% chance to create multiple videos
    const concurrentVideos = [];
    
    for (let i = 0; i < 3; i++) {
      const concurrentPayload = {
        title: `Concurrent Video ${i}`,
        description: 'Concurrent load test video',
        url: `https://example.com/concurrent-${i}.mp4`,
      };

      const concurrentResponse = http.post(
        `${baseUrl}/api/videos`,
        JSON.stringify(concurrentPayload),
        { headers: createHeaders(user.token) }
      );

      if (concurrentResponse.status === 201) {
        concurrentVideos.push(concurrentResponse.json('video.id'));
      }
    }

    // Start processing for all concurrent videos
    concurrentVideos.forEach(videoId => {
      const processPayload = {
        steps: ['asr'],
      };

      http.post(
        `${baseUrl}/api/videos/${videoId}/process`,
        JSON.stringify(processPayload),
        { headers: createHeaders(user.token) }
      );
    });
  }
}

// Test cleanup
export function teardown(data: any) {
  console.log('Load test completed');
  console.log('Final metrics:', JSON.stringify(data, null, 2));
}

// Test setup
export function setup() {
  console.log('Starting load test...');
  console.log('API URL:', __ENV.API_URL || 'http://localhost:3001');
  console.log('Test users:', testUsers.length);
  
  return {
    startTime: new Date().toISOString(),
    testUsers: testUsers.length,
  };
}
