# webmdream

Convert any URL to clean Markdown with a simple web interface.

## Features

- Clean, dark-themed web interface
- Fast HTML to Markdown conversion powered by mDream
- Copy to clipboard functionality
- Download as .md file
- Responsive design

## Getting Started

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open http://localhost:3000 in your browser

### Deploy to Vercel

1. Push to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

## API Endpoints

- `POST /api/convert` - Streaming conversion
- `POST /api/convert-simple` - Simple JSON response conversion

Both endpoints accept:
```json
{
  "url": "https://example.com"
}
```

## Built With

- [mDream](https://github.com/harlan-zw/mdream) - Ultra-performant HTML to Markdown conversion
- Express.js - Web framework
- Vanilla JavaScript - Frontend

## License

MIT