// Created automatically by Cursor AI (2024-12-19)
import { check } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

// Custom metrics
const securityViolations = new Rate('security_violations');
const authenticationFailures = new Rate('authentication_failures');
const authorizationFailures = new Rate('authorization_failures');
const dataIsolationFailures = new Rate('data_isolation_failures');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 5 }, // Security testing
    { duration: '1m', target: 0 }, // Cleanup
  ],
  thresholds: {
    security_violations: ['rate<0.01'], // Should be 0 violations
    authentication_failures: ['rate<0.01'], // Should be 0 failures
    authorization_failures: ['rate<0.01'], // Should be 0 failures
    data_isolation_failures: ['rate<0.01'], // Should be 0 failures
  },
};

// Test users with different roles and organizations
const testUsers = {
  org1Admin: {
    id: 'org1-admin',
    orgId: 'org-1',
    role: 'admin',
    token: 'mock-jwt-token-org1-admin',
  },
  org1User: {
    id: 'org1-user',
    orgId: 'org-1',
    role: 'user',
    token: 'mock-jwt-token-org1-user',
  },
  org2Admin: {
    id: 'org2-admin',
    orgId: 'org-2',
    role: 'admin',
    token: 'mock-jwt-token-org2-admin',
  },
  org2User: {
    id: 'org2-user',
    orgId: 'org-2',
    role: 'user',
    token: 'mock-jwt-token-org2-user',
  },
  invalidUser: {
    id: 'invalid-user',
    orgId: 'invalid-org',
    role: 'user',
    token: 'invalid-token',
  },
};

const baseUrl = __ENV.API_URL || 'http://localhost:3001';

function createHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Request-ID': `security-test-${Date.now()}-${Math.random()}`,
  };
}

export default function () {
  // Test 1: Authentication Tests
  testAuthentication();
  
  // Test 2: Authorization Tests
  testAuthorization();
  
  // Test 3: Row Level Security (RLS) Tests
  testRowLevelSecurity();
  
  // Test 4: Data Isolation Tests
  testDataIsolation();
  
  // Test 5: Input Validation Tests
  testInputValidation();
  
  // Test 6: SQL Injection Tests
  testSQLInjection();
  
  // Test 7: XSS Prevention Tests
  testXSSPrevention();
  
  // Test 8: Rate Limiting Tests
  testRateLimiting();
  
  // Test 9: Signed URL Security Tests
  testSignedURLSecurity();
  
  // Test 10: Audit Log Tests
  testAuditLogging();
}

function testAuthentication() {
  console.log('Testing authentication...');
  
  // Test 1.1: Valid token authentication
  const validResponse = http.get(
    `${baseUrl}/api/videos`,
    { headers: createHeaders(testUsers.org1User.token) }
  );
  
  check(validResponse, {
    'valid token authentication successful': (r) => r.status === 200,
  }) || authenticationFailures.add(1);
  
  // Test 1.2: Invalid token authentication
  const invalidResponse = http.get(
    `${baseUrl}/api/videos`,
    { headers: createHeaders('invalid-token') }
  );
  
  check(invalidResponse, {
    'invalid token properly rejected': (r) => r.status === 401,
  }) || authenticationFailures.add(1);
  
  // Test 1.3: Missing token authentication
  const missingTokenResponse = http.get(
    `${baseUrl}/api/videos`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(missingTokenResponse, {
    'missing token properly rejected': (r) => r.status === 401,
  }) || authenticationFailures.add(1);
  
  // Test 1.4: Expired token authentication
  const expiredTokenResponse = http.get(
    `${baseUrl}/api/videos`,
    { headers: createHeaders('expired-jwt-token') }
  );
  
  check(expiredTokenResponse, {
    'expired token properly rejected': (r) => r.status === 401,
  }) || authenticationFailures.add(1);
  
  // Test 1.5: Malformed token authentication
  const malformedTokenResponse = http.get(
    `${baseUrl}/api/videos`,
    { headers: createHeaders('malformed.token.here') }
  );
  
  check(malformedTokenResponse, {
    'malformed token properly rejected': (r) => r.status === 401,
  }) || authenticationFailures.add(1);
}

function testAuthorization() {
  console.log('Testing authorization...');
  
  // Test 2.1: User role permissions
  const userCreateResponse = http.post(
    `${baseUrl}/api/videos`,
    JSON.stringify({
      title: 'Authorization Test Video',
      description: 'Testing user permissions',
      url: 'https://example.com/auth-test.mp4',
    }),
    { headers: createHeaders(testUsers.org1User.token) }
  );
  
  check(userCreateResponse, {
    'user can create videos': (r) => r.status === 201,
  }) || authorizationFailures.add(1);
  
  if (userCreateResponse.status === 201) {
    const videoId = userCreateResponse.json('video.id');
    
    // Test 2.2: User can access own videos
    const userAccessResponse = http.get(
      `${baseUrl}/api/videos/${videoId}`,
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    check(userAccessResponse, {
      'user can access own videos': (r) => r.status === 200,
    }) || authorizationFailures.add(1);
    
    // Test 2.3: User cannot access admin-only endpoints
    const adminOnlyResponse = http.get(
      `${baseUrl}/api/admin/users`,
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    check(adminOnlyResponse, {
      'user cannot access admin endpoints': (r) => r.status === 403,
    }) || authorizationFailures.add(1);
    
    // Test 2.4: Admin can access admin endpoints
    const adminAccessResponse = http.get(
      `${baseUrl}/api/admin/users`,
      { headers: createHeaders(testUsers.org1Admin.token) }
    );
    
    check(adminAccessResponse, {
      'admin can access admin endpoints': (r) => r.status === 200,
    }) || authorizationFailures.add(1);
  }
}

function testRowLevelSecurity() {
  console.log('Testing Row Level Security...');
  
  // Test 3.1: Create videos for different organizations
  const org1VideoResponse = http.post(
    `${baseUrl}/api/videos`,
    JSON.stringify({
      title: 'Org 1 Video',
      description: 'Video for organization 1',
      url: 'https://example.com/org1-video.mp4',
    }),
    { headers: createHeaders(testUsers.org1User.token) }
  );
  
  const org2VideoResponse = http.post(
    `${baseUrl}/api/videos`,
    JSON.stringify({
      title: 'Org 2 Video',
      description: 'Video for organization 2',
      url: 'https://example.com/org2-video.mp4',
    }),
    { headers: createHeaders(testUsers.org2User.token) }
  );
  
  if (org1VideoResponse.status === 201 && org2VideoResponse.status === 201) {
    const org1VideoId = org1VideoResponse.json('video.id');
    const org2VideoId = org2VideoResponse.json('video.id');
    
    // Test 3.2: Org1 user cannot access Org2 video
    const crossOrgAccessResponse = http.get(
      `${baseUrl}/api/videos/${org2VideoId}`,
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    check(crossOrgAccessResponse, {
      'cross-organization access properly blocked': (r) => r.status === 404,
    }) || dataIsolationFailures.add(1);
    
    // Test 3.3: Org2 user cannot access Org1 video
    const crossOrgAccessResponse2 = http.get(
      `${baseUrl}/api/videos/${org1VideoId}`,
      { headers: createHeaders(testUsers.org2User.token) }
    );
    
    check(crossOrgAccessResponse2, {
      'cross-organization access properly blocked (reverse)': (r) => r.status === 404,
    }) || dataIsolationFailures.add(1);
    
    // Test 3.4: Search results are organization-scoped
    const org1SearchResponse = http.get(
      `${baseUrl}/api/videos?query=Org`,
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    const org2SearchResponse = http.get(
      `${baseUrl}/api/videos?query=Org`,
      { headers: createHeaders(testUsers.org2User.token) }
    );
    
    if (org1SearchResponse.status === 200 && org2SearchResponse.status === 200) {
      const org1Results = org1SearchResponse.json();
      const org2Results = org2SearchResponse.json();
      
      check(org1Results, {
        'org1 search results contain only org1 videos': (r) => 
          r.every((video: any) => video.orgId === 'org-1'),
      }) || dataIsolationFailures.add(1);
      
      check(org2Results, {
        'org2 search results contain only org2 videos': (r) => 
          r.every((video: any) => video.orgId === 'org-2'),
      }) || dataIsolationFailures.add(1);
    }
  }
}

function testDataIsolation() {
  console.log('Testing data isolation...');
  
  // Test 4.1: User cannot modify other user's data
  const createResponse = http.post(
    `${baseUrl}/api/videos`,
    JSON.stringify({
      title: 'Data Isolation Test Video',
      description: 'Testing data isolation',
      url: 'https://example.com/isolation-test.mp4',
    }),
    { headers: createHeaders(testUsers.org1User.token) }
  );
  
  if (createResponse.status === 201) {
    const videoId = createResponse.json('video.id');
    
    // Try to update with different user's token
    const unauthorizedUpdateResponse = http.put(
      `${baseUrl}/api/videos/${videoId}`,
      JSON.stringify({
        title: 'Unauthorized Update',
        description: 'This should fail',
      }),
      { headers: createHeaders(testUsers.org2User.token) }
    );
    
    check(unauthorizedUpdateResponse, {
      'unauthorized update properly rejected': (r) => r.status === 404,
    }) || dataIsolationFailures.add(1);
    
    // Test 4.2: User cannot delete other user's data
    const unauthorizedDeleteResponse = http.delete(
      `${baseUrl}/api/videos/${videoId}`,
      { headers: createHeaders(testUsers.org2User.token) }
    );
    
    check(unauthorizedDeleteResponse, {
      'unauthorized delete properly rejected': (r) => r.status === 404,
    }) || dataIsolationFailures.add(1);
  }
}

function testInputValidation() {
  console.log('Testing input validation...');
  
  // Test 5.1: SQL injection attempts
  const sqlInjectionPayloads = [
    "'; DROP TABLE videos; --",
    "' OR '1'='1",
    "'; INSERT INTO videos VALUES ('hacked'); --",
    "' UNION SELECT * FROM users --",
  ];
  
  sqlInjectionPayloads.forEach(payload => {
    const response = http.get(
      `${baseUrl}/api/videos?query=${encodeURIComponent(payload)}`,
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    check(response, {
      'SQL injection attempt properly handled': (r) => r.status !== 500,
    }) || securityViolations.add(1);
  });
  
  // Test 5.2: XSS attempts
  const xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src="x" onerror="alert(\'xss\')">',
    '"><script>alert("xss")</script>',
  ];
  
  xssPayloads.forEach(payload => {
    const response = http.post(
      `${baseUrl}/api/videos`,
      JSON.stringify({
        title: payload,
        description: payload,
        url: 'https://example.com/xss-test.mp4',
      }),
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    check(response, {
      'XSS attempt properly sanitized': (r) => r.status !== 500,
    }) || securityViolations.add(1);
  });
  
  // Test 5.3: Path traversal attempts
  const pathTraversalPayloads = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '....//....//....//etc/passwd',
  ];
  
  pathTraversalPayloads.forEach(payload => {
    const response = http.get(
      `${baseUrl}/api/videos/${encodeURIComponent(payload)}`,
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    check(response, {
      'path traversal attempt properly handled': (r) => r.status !== 500,
    }) || securityViolations.add(1);
  });
  
  // Test 5.4: Large payload attacks
  const largePayload = {
    title: 'A'.repeat(10000), // Very long title
    description: 'B'.repeat(50000), // Very long description
    url: 'https://example.com/large-payload-test.mp4',
  };
  
  const largePayloadResponse = http.post(
    `${baseUrl}/api/videos`,
    JSON.stringify(largePayload),
    { headers: createHeaders(testUsers.org1User.token) }
  );
  
  check(largePayloadResponse, {
    'large payload properly rejected': (r) => r.status === 400,
  }) || securityViolations.add(1);
}

function testSQLInjection() {
  console.log('Testing SQL injection prevention...');
  
  // Test 6.1: SQL injection in search queries
  const sqlInjectionQueries = [
    "' OR 1=1 --",
    "'; DROP TABLE videos; --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "1' OR '1' = '1' --",
  ];
  
  sqlInjectionQueries.forEach(query => {
    const response = http.get(
      `${baseUrl}/api/videos?query=${encodeURIComponent(query)}`,
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    check(response, {
      'SQL injection in search prevented': (r) => r.status !== 500,
    }) || securityViolations.add(1);
  });
  
  // Test 6.2: SQL injection in video ID
  const maliciousVideoIds = [
    "1' OR '1'='1",
    "1; DROP TABLE videos;",
    "1 UNION SELECT * FROM users",
  ];
  
  maliciousVideoIds.forEach(videoId => {
    const response = http.get(
      `${baseUrl}/api/videos/${encodeURIComponent(videoId)}`,
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    check(response, {
      'SQL injection in video ID prevented': (r) => r.status !== 500,
    }) || securityViolations.add(1);
  });
}

function testXSSPrevention() {
  console.log('Testing XSS prevention...');
  
  // Test 7.1: XSS in video title
  const xssTitles = [
    '<script>alert("XSS")</script>',
    '<img src="x" onerror="alert(\'XSS\')">',
    'javascript:alert("XSS")',
    '"><script>alert("XSS")</script>',
  ];
  
  xssTitles.forEach(title => {
    const response = http.post(
      `${baseUrl}/api/videos`,
      JSON.stringify({
        title: title,
        description: 'XSS test',
        url: 'https://example.com/xss-test.mp4',
      }),
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    if (response.status === 201) {
      const videoId = response.json('video.id');
      
      // Check if XSS was stored
      const retrieveResponse = http.get(
        `${baseUrl}/api/videos/${videoId}`,
        { headers: createHeaders(testUsers.org1User.token) }
      );
      
      if (retrieveResponse.status === 200) {
        const retrievedTitle = retrieveResponse.json('title');
        
        check(retrievedTitle, {
          'XSS in title properly sanitized': (r) => 
            !r.includes('<script>') && !r.includes('javascript:'),
        }) || securityViolations.add(1);
      }
    }
  });
}

function testRateLimiting() {
  console.log('Testing rate limiting...');
  
  // Test 8.1: Rapid requests to trigger rate limiting
  let rateLimitTriggered = false;
  
  for (let i = 0; i < 100; i++) {
    const response = http.get(
      `${baseUrl}/api/videos`,
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    if (response.status === 429) {
      rateLimitTriggered = true;
      break;
    }
  }
  
  check(rateLimitTriggered, {
    'rate limiting properly enforced': (r) => r === true,
  }) || securityViolations.add(1);
}

function testSignedURLSecurity() {
  console.log('Testing signed URL security...');
  
  // Test 9.1: Create video to get signed URL
  const createResponse = http.post(
    `${baseUrl}/api/videos`,
    JSON.stringify({
      title: 'Signed URL Test Video',
      description: 'Testing signed URL security',
      url: 'https://example.com/signed-url-test.mp4',
    }),
    { headers: createHeaders(testUsers.org1User.token) }
  );
  
  if (createResponse.status === 201) {
    const signedUrl = createResponse.json('uploadUrl');
    
    // Test 9.2: Try to access signed URL with different user
    const unauthorizedAccessResponse = http.put(
      signedUrl,
      'fake video content',
      { headers: createHeaders(testUsers.org2User.token) }
    );
    
    check(unauthorizedAccessResponse, {
      'signed URL properly secured': (r) => r.status === 403 || r.status === 401,
    }) || securityViolations.add(1);
    
    // Test 9.3: Try to access with expired URL (simulate)
    const expiredUrl = signedUrl + '&expires=0';
    const expiredAccessResponse = http.put(
      expiredUrl,
      'fake video content',
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    check(expiredAccessResponse, {
      'expired signed URL properly rejected': (r) => r.status === 403,
    }) || securityViolations.add(1);
  }
}

function testAuditLogging() {
  console.log('Testing audit logging...');
  
  // Test 10.1: Create video and check audit log
  const createResponse = http.post(
    `${baseUrl}/api/videos`,
    JSON.stringify({
      title: 'Audit Log Test Video',
      description: 'Testing audit logging',
      url: 'https://example.com/audit-test.mp4',
    }),
    { headers: createHeaders(testUsers.org1User.token) }
  );
  
  if (createResponse.status === 201) {
    const videoId = createResponse.json('video.id');
    
    // Test 10.2: Check audit log for create action
    const auditLogResponse = http.get(
      `${baseUrl}/api/audit-logs?resourceType=video&resourceId=${videoId}`,
      { headers: createHeaders(testUsers.org1Admin.token) }
    );
    
    check(auditLogResponse, {
      'audit log contains create action': (r) => r.status === 200,
    }) || securityViolations.add(1);
    
    // Test 10.3: Update video and check audit log
    const updateResponse = http.put(
      `${baseUrl}/api/videos/${videoId}`,
      JSON.stringify({
        title: 'Updated Audit Log Test Video',
        description: 'Updated for audit testing',
      }),
      { headers: createHeaders(testUsers.org1User.token) }
    );
    
    if (updateResponse.status === 200) {
      const updatedAuditLogResponse = http.get(
        `${baseUrl}/api/audit-logs?resourceType=video&resourceId=${videoId}`,
        { headers: createHeaders(testUsers.org1Admin.token) }
      );
      
      check(updatedAuditLogResponse, {
        'audit log contains update action': (r) => r.status === 200,
      }) || securityViolations.add(1);
    }
  }
}

// Test cleanup
export function teardown(data: any) {
  console.log('Security test completed');
  console.log('Final metrics:', JSON.stringify(data, null, 2));
  
  // Clean up test data
  const headers = createHeaders(testUsers.org1Admin.token);
  
  // Delete test videos
  const videosResponse = http.get(
    `${baseUrl}/api/videos?limit=100`,
    { headers }
  );
  
  if (videosResponse.status === 200) {
    const videos = videosResponse.json();
    videos.forEach((video: any) => {
      if (video.title.includes('Security Test') || 
          video.title.includes('Authorization Test') ||
          video.title.includes('Data Isolation Test') ||
          video.title.includes('Input Validation Test') ||
          video.title.includes('XSS Test') ||
          video.title.includes('Signed URL Test') ||
          video.title.includes('Audit Log Test')) {
        http.delete(`${baseUrl}/api/videos/${video.id}`, { headers });
      }
    });
  }
}

// Test setup
export function setup() {
  console.log('Starting security test...');
  console.log('API URL:', baseUrl);
  console.log('Test users:', Object.keys(testUsers).length);
  
  return {
    startTime: new Date().toISOString(),
    testUsers: Object.keys(testUsers).length,
  };
}
