-- Created automatically by Cursor AI (2024-12-19)
-- Seed data for development

-- Insert sample organization
INSERT INTO organizations (id, name, slug, plan, settings) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Demo Organization',
    'demo-org',
    'pro',
    '{
        "maxVideoDuration": 14400,
        "maxVideoSize": 1073741824,
        "allowedDomains": ["youtube.com", "vimeo.com"],
        "piiMasking": false,
        "profanityFilter": true
    }'
);

-- Insert sample user
INSERT INTO users (id, org_id, email, name, role) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@demo.com',
    'Demo Admin',
    'owner'
);

-- Insert sample project
INSERT INTO projects (id, org_id, name, description) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'Sample Project',
    'A sample project for testing'
);

-- Insert sample video
INSERT INTO videos (id, org_id, project_id, title, description, duration, size, format, status, metadata) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440002',
    'Sample Video',
    'A sample video for testing',
    3600,
    1073741824,
    'mp4',
    'ready',
    '{
        "width": 1920,
        "height": 1080,
        "fps": 30,
        "bitrate": 5000000,
        "codec": "h264",
        "audioCodec": "aac",
        "audioChannels": 2,
        "audioSampleRate": 48000
    }'
);
