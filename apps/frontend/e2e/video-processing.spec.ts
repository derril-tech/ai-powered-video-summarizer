// Created automatically by Cursor AI (2024-12-19)
import { test, expect } from '@playwright/test';

test.describe('Video Processing E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the video analysis page
    await page.goto('/video/test-video-id');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="video-player"]');
  });

  test('complete video processing workflow', async ({ page }) => {
    // Step 1: Verify video player loads
    const videoPlayer = page.locator('[data-testid="video-player"]');
    await expect(videoPlayer).toBeVisible();

    // Step 2: Check video metadata
    const videoTitle = page.locator('[data-testid="video-title"]');
    await expect(videoTitle).toContainText('Test Video');

    // Step 3: Navigate to transcript tab
    const transcriptTab = page.locator('[data-testid="tab-transcript"]');
    await transcriptTab.click();
    await page.waitForSelector('[data-testid="transcript-panel"]');

    // Step 4: Verify transcript content
    const transcriptContent = page.locator('[data-testid="transcript-content"]');
    await expect(transcriptContent).toBeVisible();
    
    // Check for transcript segments
    const transcriptSegments = page.locator('[data-testid="transcript-segment"]');
    await expect(transcriptSegments.first()).toBeVisible();

    // Step 5: Test transcript word highlighting
    const firstWord = page.locator('[data-testid="transcript-word"]').first();
    await firstWord.click();
    
    // Verify video seeks to the word timestamp
    const currentTime = page.locator('[data-testid="current-time"]');
    await expect(currentTime).not.toContainText('0:00');

    // Step 6: Navigate to summary tab
    const summaryTab = page.locator('[data-testid="tab-summary"]');
    await summaryTab.click();
    await page.waitForSelector('[data-testid="summary-panel"]');

    // Step 7: Verify summary content
    const summaryContent = page.locator('[data-testid="summary-content"]');
    await expect(summaryContent).toBeVisible();

    // Check for executive summary
    const executiveSummary = page.locator('[data-testid="executive-summary"]');
    await expect(executiveSummary).toBeVisible();

    // Step 8: Test chapter navigation
    const chapters = page.locator('[data-testid="chapter-item"]');
    await expect(chapters.first()).toBeVisible();
    
    // Click on first chapter
    await chapters.first().click();
    
    // Verify video seeks to chapter start
    await expect(currentTime).not.toContainText('0:00');

    // Step 9: Navigate to highlights tab
    const highlightsTab = page.locator('[data-testid="tab-highlights"]');
    await highlightsTab.click();
    await page.waitForSelector('[data-testid="highlights-panel"]');

    // Step 10: Verify highlights
    const highlights = page.locator('[data-testid="highlight-item"]');
    await expect(highlights.first()).toBeVisible();

    // Test highlight playback
    await highlights.first().click();
    await expect(currentTime).not.toContainText('0:00');

    // Step 11: Test clip generation
    const generateClipButton = page.locator('[data-testid="generate-clip"]').first();
    await generateClipButton.click();
    
    // Wait for clip generation
    await page.waitForSelector('[data-testid="clip-generated"]', { timeout: 30000 });

    // Step 12: Navigate to comments tab
    const commentsTab = page.locator('[data-testid="tab-comments"]');
    await commentsTab.click();
    await page.waitForSelector('[data-testid="comments-panel"]');

    // Step 13: Add a comment
    const commentInput = page.locator('[data-testid="comment-input"]');
    await commentInput.fill('This is a test comment');
    
    const addCommentButton = page.locator('[data-testid="add-comment"]');
    await addCommentButton.click();
    
    // Verify comment appears
    const newComment = page.locator('[data-testid="comment-item"]').last();
    await expect(newComment).toContainText('This is a test comment');

    // Step 14: Navigate to entities tab
    const entitiesTab = page.locator('[data-testid="tab-entities"]');
    await entitiesTab.click();
    await page.waitForSelector('[data-testid="entities-panel"]');

    // Step 15: Verify entities
    const entities = page.locator('[data-testid="entity-item"]');
    await expect(entities.first()).toBeVisible();

    // Test entity selection
    await entities.first().click();
    const entityDetails = page.locator('[data-testid="entity-details"]');
    await expect(entityDetails).toBeVisible();

    // Step 16: Navigate to search tab
    const searchTab = page.locator('[data-testid="tab-search"]');
    await searchTab.click();
    await page.waitForSelector('[data-testid="search-panel"]');

    // Step 17: Test search functionality
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('test');
    
    const searchButton = page.locator('[data-testid="search-button"]');
    await searchButton.click();
    
    // Wait for search results
    await page.waitForSelector('[data-testid="search-result"]');
    
    const searchResults = page.locator('[data-testid="search-result"]');
    await expect(searchResults.first()).toBeVisible();

    // Step 18: Navigate to exports tab
    const exportsTab = page.locator('[data-testid="tab-exports"]');
    await exportsTab.click();
    await page.waitForSelector('[data-testid="exports-panel"]');

    // Step 19: Generate PDF export
    const pdfExportButton = page.locator('[data-testid="export-pdf"]');
    await pdfExportButton.click();
    
    // Wait for export generation
    await page.waitForSelector('[data-testid="export-completed"]', { timeout: 60000 });

    // Step 20: Download export
    const downloadButton = page.locator('[data-testid="download-export"]').first();
    await downloadButton.click();
    
    // Verify download starts
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('video upload and processing', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/upload');
    
    // Step 1: Test drag and drop upload
    const dropZone = page.locator('[data-testid="upload-dropzone"]');
    await expect(dropZone).toBeVisible();

    // Create a test file
    const testFile = {
      name: 'test-video.mp4',
      mimeType: 'video/mp4',
      buffer: Buffer.from('fake video content'),
    };

    // Simulate file drop
    await dropZone.setInputFiles([testFile]);
    
    // Wait for upload to start
    await page.waitForSelector('[data-testid="upload-progress"]');
    
    // Verify upload progress
    const progressBar = page.locator('[data-testid="upload-progress"]');
    await expect(progressBar).toBeVisible();

    // Wait for upload completion
    await page.waitForSelector('[data-testid="upload-complete"]', { timeout: 30000 });

    // Step 2: Fill video metadata
    const titleInput = page.locator('[data-testid="video-title-input"]');
    await titleInput.fill('E2E Test Video');

    const descriptionInput = page.locator('[data-testid="video-description-input"]');
    await descriptionInput.fill('This is a test video for E2E testing');

    // Step 3: Start processing
    const processButton = page.locator('[data-testid="start-processing"]');
    await processButton.click();

    // Wait for processing to start
    await page.waitForSelector('[data-testid="processing-status"]');
    
    // Verify processing status
    const processingStatus = page.locator('[data-testid="processing-status"]');
    await expect(processingStatus).toContainText('Processing');

    // Step 4: Monitor processing progress
    const progressSteps = page.locator('[data-testid="progress-step"]');
    await expect(progressSteps).toHaveCount(6); // probe, asr, diarization, segmentation, summarization, highlight

    // Wait for processing completion
    await page.waitForSelector('[data-testid="processing-complete"]', { timeout: 120000 });

    // Step 5: Verify processing results
    const completionMessage = page.locator('[data-testid="processing-complete"]');
    await expect(completionMessage).toContainText('Processing Complete');

    // Step 6: Navigate to video analysis
    const viewVideoButton = page.locator('[data-testid="view-video"]');
    await viewVideoButton.click();

    // Verify navigation to video page
    await expect(page).toHaveURL(/\/video\/.+/);
  });

  test('YouTube URL processing', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/upload');
    
    // Step 1: Switch to URL input mode
    const urlTab = page.locator('[data-testid="url-tab"]');
    await urlTab.click();

    // Step 2: Enter YouTube URL
    const urlInput = page.locator('[data-testid="url-input"]');
    await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    // Step 3: Start processing
    const processButton = page.locator('[data-testid="process-url"]');
    await processButton.click();

    // Wait for URL validation
    await page.waitForSelector('[data-testid="url-validated"]');

    // Wait for processing to start
    await page.waitForSelector('[data-testid="processing-status"]');

    // Step 4: Monitor processing
    await page.waitForSelector('[data-testid="processing-complete"]', { timeout: 180000 });

    // Step 5: Verify YouTube metadata
    const videoTitle = page.locator('[data-testid="video-title"]');
    await expect(videoTitle).not.toBeEmpty();

    // Step 6: Test YouTube chapter sync
    const syncChaptersButton = page.locator('[data-testid="sync-youtube-chapters"]');
    await syncChaptersButton.click();

    // Wait for sync completion
    await page.waitForSelector('[data-testid="sync-complete"]', { timeout: 30000 });
  });

  test('error handling and recovery', async ({ page }) => {
    // Navigate to video page
    await page.goto('/video/test-video-id');

    // Step 1: Test invalid video ID
    await page.goto('/video/invalid-video-id');
    
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toContainText('Video not found');

    // Step 2: Test network error recovery
    await page.goto('/video/test-video-id');
    
    // Simulate network error
    await page.route('**/api/videos/**', route => route.abort());
    
    // Try to refresh video data
    const refreshButton = page.locator('[data-testid="refresh-video"]');
    await refreshButton.click();
    
    // Verify error handling
    await expect(errorMessage).toContainText('Failed to load video');

    // Step 3: Test processing failure recovery
    // Restore network
    await page.unroute('**/api/videos/**');
    
    // Navigate to processing tab
    const processingTab = page.locator('[data-testid="tab-processing"]');
    await processingTab.click();

    // Simulate processing failure
    const retryButton = page.locator('[data-testid="retry-processing"]');
    await retryButton.click();

    // Wait for retry to complete
    await page.waitForSelector('[data-testid="processing-complete"]', { timeout: 60000 });
  });

  test('accessibility and keyboard navigation', async ({ page }) => {
    // Navigate to video page
    await page.goto('/video/test-video-id');

    // Step 1: Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Verify focus moves to first interactive element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Step 2: Test video player keyboard controls
    await page.keyboard.press('Space');
    
    // Verify video plays/pauses
    const playButton = page.locator('[data-testid="play-button"]');
    await expect(playButton).toHaveAttribute('aria-pressed', 'true');

    // Step 3: Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should reach transcript tab
    const transcriptTab = page.locator('[data-testid="tab-transcript"]');
    await expect(transcriptTab).toHaveAttribute('aria-selected', 'true');

    // Step 4: Test screen reader support
    const videoPlayer = page.locator('[data-testid="video-player"]');
    await expect(videoPlayer).toHaveAttribute('aria-label');
    
    const transcriptContent = page.locator('[data-testid="transcript-content"]');
    await expect(transcriptContent).toHaveAttribute('role', 'region');
  });

  test('responsive design and mobile compatibility', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to video page
    await page.goto('/video/test-video-id');

    // Step 1: Verify mobile layout
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();

    // Step 2: Test mobile navigation
    await mobileMenu.click();
    
    const mobileTabs = page.locator('[data-testid="mobile-tab"]');
    await expect(mobileTabs.first()).toBeVisible();

    // Step 3: Test mobile video player
    const mobileVideoPlayer = page.locator('[data-testid="mobile-video-player"]');
    await expect(mobileVideoPlayer).toBeVisible();

    // Step 4: Test mobile touch interactions
    await mobileVideoPlayer.tap();
    
    const mobileControls = page.locator('[data-testid="mobile-video-controls"]');
    await expect(mobileControls).toBeVisible();

    // Step 5: Test mobile search
    const mobileSearchButton = page.locator('[data-testid="mobile-search-button"]');
    await mobileSearchButton.click();
    
    const mobileSearchInput = page.locator('[data-testid="mobile-search-input"]');
    await expect(mobileSearchInput).toBeVisible();
  });
});
