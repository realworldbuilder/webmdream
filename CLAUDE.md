# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Basic Commands
- **Start development server**: `npm start` or `npm run dev`
- **Install dependencies**: `npm install` or `pnpm install` (project uses pnpm)
- **Server runs on**: `http://localhost:3000` (configurable via PORT env var)

### Testing with Live URLs
- **Test conversion**: `curl -X POST http://localhost:3000/api/convert-simple -H "Content-Type: application/json" -d '{"url":"https://example.com"}'`
- **Test streaming**: `curl -X POST http://localhost:3000/api/convert -H "Content-Type: application/json" -d '{"url":"https://example.com"}'`

## Architecture Overview

This is a simple Express.js web application that provides a web interface for the mDream HTML-to-Markdown converter. The architecture consists of:

### Core Components
- **`server.js`**: Express.js backend with API endpoints and mDream integration
- **`public/index.html`**: Single-page frontend with vanilla HTML/CSS/JavaScript
- **`package.json`**: Node.js dependencies and npm scripts

### API Architecture
- **Two conversion modes**: 
  - `/api/convert` - Streaming conversion for large pages
  - `/api/convert-simple` - Non-streaming conversion for smaller pages
- **Three conversion presets**:
  - Standard (no preset)
  - Minimal preset (50% fewer tokens, LLM optimized)
  - Ultra Clean preset (aggressive content filtering for pure article content)

### mDream Integration
- Uses `mdream` package for HTML-to-Markdown conversion
- Implements streaming via `streamHtmlToMarkdown()` for real-time processing
- Custom `withUltraCleanPreset()` function combining multiple mDream plugins:
  - `isolateMainPlugin()` - Focus on main content
  - `filterPlugin()` - Remove social sharing, comments, navigation, ads, etc.
  - `readabilityPlugin()` - Content scoring and optimization

### Content Filtering Strategy
The Ultra Clean mode removes:
- Social sharing buttons and engagement elements
- Comments, ratings, and user interaction sections
- Navigation menus, headers, footers, sidebars
- Promotional content, ads, and newsletters
- Related articles and recommendations
- Author bios and metadata sections
- Interactive elements (forms, buttons, CTAs)

## Key Technical Details

### Server Configuration
- **Port**: Default 3000, configurable via `process.env.PORT`
- **CORS**: Enabled for cross-origin requests
- **User-Agent**: `mDream Web App/1.0.0 (HTML to Markdown Converter)`
- **Content validation**: Ensures HTML content type before processing

### Error Handling Patterns
- URL validation using native `URL()` constructor
- HTTP status code propagation from fetch failures
- Content-type validation (must be `text/html`)
- Comprehensive error responses with user-friendly messages
- Server-side logging for debugging

### Frontend Architecture
- **Single-page application** with vanilla JavaScript and dark theme UI
- **Modern dark interface** inspired by terminal/CLI aesthetics
- **Sidebar navigation** with functional icons (save, settings, donate, etc.)
- **Toggle-based mode selection** (auto/audio/mute corresponding to normal/minimal/ultra-clean)
- **Intelligent paste functionality** - automatically detects URLs from clipboard
- **Real-time feedback** during conversion process
- **Copy-to-clipboard** functionality for results
- **Responsive design** that adapts to mobile devices

### Streaming Implementation
- Uses `Transfer-Encoding: chunked` for real-time output
- Processes `response.body` stream directly from fetch
- Handles stream chunks asynchronously with `for await` loop
- Graceful error handling during streaming conversion

## Development Guidelines

### Adding New Features
- New conversion modes should extend the existing preset pattern
- API endpoints should maintain consistent error response format
- Frontend changes should preserve the existing vanilla JS approach
- Always validate URLs and content types before processing

### Plugin Integration
- mDream plugins are configured in the `withUltraCleanPreset()` function
- Order matters: isolate → filter → readability
- CSS selectors in `filterPlugin()` use attribute and class name patterns
- Test plugin combinations thoroughly as they can interact unexpectedly

### Performance Considerations
- Streaming mode preferred for large pages (>1MB)
- Simple mode better for quick conversions and API integration
- mDream is optimized for performance, avoid additional processing layers
- Consider memory usage when handling large HTML documents