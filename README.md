# AI-Powered Video Summarizer

> Transform long videos into actionable insights with AI-powered analysis, summarization, and intelligent content extraction.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

## 🎯 What is AI Video Summarizer?

AI Video Summarizer is a comprehensive, production-ready platform that leverages cutting-edge AI technologies to automatically analyze, transcribe, summarize, and extract key insights from video content. Built for scalability and enterprise use, it transforms hours of video content into actionable intelligence in minutes.

### 🚀 Key Capabilities

- **🎬 Multi-format Video Processing**: Supports MP4, MOV, AVI, WebM, and YouTube URLs
- **🎤 Advanced Speech Recognition**: WhisperX-powered transcription with speaker diarization
- **🧠 Intelligent Summarization**: AI-generated executive summaries, chapter breakdowns, and key insights
- **🎯 Smart Highlight Extraction**: Automatically identifies and extracts the most important moments
- **🔍 Semantic Search**: Find specific content across your video library with natural language queries
- **📊 Entity Recognition**: Identifies people, organizations, locations, and key concepts
- **📱 Responsive Web Interface**: Modern, intuitive UI for seamless video analysis
- **⚡ Real-time Processing**: Live progress updates and WebSocket-based communication
- **🔒 Enterprise Security**: Role-based access control, data encryption, and audit logging

## ✨ Features

### 🎥 Video Analysis & Processing
- **Automatic Transcription**: High-accuracy speech-to-text with punctuation and formatting
- **Speaker Diarization**: Identify and track different speakers throughout the video
- **Scene Detection**: Intelligent scene boundary detection using PySceneDetect
- **Metadata Extraction**: Duration, resolution, codec, and technical specifications

### 📝 Content Summarization
- **Executive Summary**: Concise overview of the entire video content
- **Chapter Breakdown**: Automatic chapter creation with timestamps
- **Key Insights**: AI-extracted main points and takeaways
- **FAQ Generation**: Automatically generated questions and answers
- **Bullet Point Summaries**: Structured, scannable content summaries

### 🎯 Smart Highlighting
- **Importance Scoring**: AI-powered ranking of video segments by significance
- **Silence Detection**: Automatic removal of silent or low-value segments
- **Scene-based Clipping**: Intelligent clip generation with context preservation
- **Multiple Formats**: 16:9, 9:16, and 1:1 aspect ratios for different platforms

### 🔍 Advanced Search & Discovery
- **Semantic Search**: Find content using natural language queries
- **Timestamp Navigation**: Jump directly to relevant video segments
- **Entity Recognition**: Search by people, organizations, locations, and concepts
- **Filtering Options**: Filter by duration, confidence, sentiment, and content type

### 📤 Export & Integration
- **Multiple Export Formats**: SRT, VTT, PDF, Markdown, JSON
- **YouTube Integration**: Automatic chapter upload and description updates
- **Notion Sync**: Direct integration with Notion pages
- **Google Docs**: Seamless export to Google Documents
- **API Access**: RESTful API for custom integrations

### 🎨 User Experience
- **Drag & Drop Upload**: Simple video file upload with progress tracking
- **Real-time Updates**: Live processing status and progress indicators
- **Interactive Player**: Custom video player with transcript synchronization
- **Comments & Annotations**: Add notes and comments anchored to specific timestamps
- **Shareable Links**: Generate time-limited sharing links for summaries and highlights

## 🏗️ Architecture

### Frontend (Next.js 14)
- **React 18** with TypeScript for type safety
- **Tailwind CSS** and **shadcn/ui** for modern, responsive design
- **Socket.io** for real-time communication
- **React Query** for efficient data fetching and caching
- **Zustand** for state management

### API Gateway (NestJS)
- **RESTful API** with OpenAPI 3.1 documentation
- **JWT Authentication** with role-based access control
- **Rate Limiting** and request validation
- **WebSocket Gateway** for real-time updates
- **File Upload** with presigned URL support

### Workers (Python/FastAPI)
- **WhisperX** for advanced speech recognition
- **Pyannote** for speaker diarization
- **PySceneDetect** for scene detection
- **Sentence Transformers** for semantic search
- **FFmpeg** for video processing and manipulation

### Infrastructure
- **AWS ECS** for container orchestration
- **PostgreSQL 16** with pgvector for vector search
- **Redis** for caching and job queues
- **NATS** for message queuing and job orchestration
- **S3/R2** for scalable file storage
- **CloudFront** for global content delivery

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- Docker and Docker Compose
- AWS CLI (for deployment)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ai-powered-video-summarizer.git
   cd ai-powered-video-summarizer
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd apps/frontend
   npm install

   # Install API gateway dependencies
   cd ../gateway
   npm install

   # Install worker dependencies
   cd ../workers
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:3001
   - API Documentation: http://localhost:3001/api

### Production Deployment

See [deployment documentation](./docs/deployment.md) for detailed production setup instructions.

## 📊 Performance & Scalability

### Processing Capabilities
- **Video Length**: Up to 8 hours per video
- **File Size**: Up to 10GB per file
- **Concurrent Processing**: 100+ videos simultaneously
- **Processing Speed**: 1-5 minutes for typical videos (depending on length and complexity)

### Scalability Features
- **Auto-scaling GPU Workers**: Dynamic scaling based on queue depth
- **Load Balancing**: Distributed processing across multiple nodes
- **Caching**: Redis-based caching for improved performance
- **CDN Integration**: Global content delivery for fast access

### Reliability
- **99.9% Uptime**: High availability with redundant infrastructure
- **Error Recovery**: Automatic retry with exponential backoff
- **Data Backup**: Automated backups with point-in-time recovery
- **Monitoring**: Comprehensive observability with Prometheus and Grafana

## 🔒 Security & Compliance

### Data Protection
- **Encryption at Rest**: All data encrypted using AES-256
- **Encryption in Transit**: TLS 1.3 for all communications
- **Access Control**: Role-based permissions and row-level security
- **Audit Logging**: Comprehensive audit trail for all operations

### Privacy Features
- **PII Masking**: Automatic detection and masking of sensitive information
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: Built-in privacy controls and data portability
- **Secure Deletion**: Complete data removal upon request

## 💡 Use Cases & Applications

### 🎓 Education
- **Lecture Summarization**: Convert long lectures into digestible summaries
- **Student Review**: Create study materials from educational videos
- **Content Indexing**: Build searchable video libraries for courses

### 💼 Business & Enterprise
- **Meeting Documentation**: Automatically summarize team meetings and presentations
- **Training Videos**: Extract key points from employee training materials
- **Market Research**: Analyze competitor videos and industry content
- **Sales Enablement**: Create highlight reels from product demos and pitches

### 📺 Media & Entertainment
- **Content Repurposing**: Transform long-form content into social media clips
- **Archive Management**: Index and search through video archives
- **Subtitle Generation**: Automatic subtitle creation for accessibility
- **Content Discovery**: Help users find relevant content quickly

### 🏥 Healthcare
- **Medical Training**: Summarize surgical procedures and medical lectures
- **Patient Education**: Create digestible content from complex medical explanations
- **Research Documentation**: Index and search through medical research videos

### 🎯 Marketing & Sales
- **Competitive Analysis**: Analyze competitor videos and presentations
- **Content Marketing**: Repurpose long-form content into multiple formats
- **Sales Training**: Extract key insights from sales calls and presentations
- **Customer Feedback**: Analyze customer testimonial videos

## 🔮 Future Potential

### AI/ML Enhancements
- **Multi-language Support**: Expand beyond English to support 50+ languages
- **Emotion Analysis**: Detect speaker emotions and sentiment throughout videos
- **Visual Content Analysis**: Extract insights from visual elements and graphics
- **Predictive Analytics**: Identify trending topics and content patterns

### Platform Extensions
- **Live Streaming Analysis**: Real-time processing of live video streams
- **Mobile App**: Native iOS and Android applications
- **API Marketplace**: Third-party integrations and plugins
- **White-label Solutions**: Customizable platform for enterprise clients

### Advanced Features
- **Collaborative Editing**: Multi-user video annotation and editing
- **AI-powered Storyboarding**: Automatic storyboard generation from videos
- **Content Recommendations**: AI-driven content suggestions based on user preferences
- **Advanced Analytics**: Deep insights into content performance and engagement

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and style enforcement
- **Prettier**: Automatic code formatting
- **Testing**: Minimum 80% test coverage required

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](./docs/)
- **API Reference**: [docs/api.md](./docs/api.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/ai-powered-video-summarizer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/ai-powered-video-summarizer/discussions)
- **Email**: support@ai-video-summarizer.com

## 🙏 Acknowledgments

- **OpenAI WhisperX** for advanced speech recognition
- **Pyannote** for speaker diarization
- **Sentence Transformers** for semantic search
- **FFmpeg** for video processing
- **NestJS** and **Next.js** communities for excellent frameworks

---

**Built with ❤️ by the AI Video Summarizer Team**

*Transform your video content into actionable intelligence.*
