import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { streamHtmlToMarkdown, htmlToMarkdown } from 'mdream'
import { isolateMainPlugin, readabilityPlugin, filterPlugin } from 'mdream/plugins'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// API endpoint to convert URL to Markdown
app.post('/api/convert', async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        message: 'Please provide a valid URL to convert'
      })
    }

    // Validate URL format
    let validUrl
    try {
      validUrl = new URL(url)
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        message: 'Please provide a valid URL (e.g., https://example.com)'
      })
    }

    console.log(`Converting URL: ${url}`)

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'webmdream Web App/1.0.0 (HTML to Markdown Converter)'
      }
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to fetch URL',
        message: `HTTP ${response.status}: ${response.statusText}`
      })
    }

    // Check if the response is HTML
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      return res.status(400).json({
        error: 'Unsupported content type',
        message: `The URL returned ${contentType}, but HTML content is required`
      })
    }

    // Prepare conversion options with comprehensive content extraction
    const conversionOptions = { 
      origin: validUrl.origin,
      plugins: [
        // First try to isolate main content areas
        isolateMainPlugin(),
        
        // Filter out obvious non-content elements
        filterPlugin({
          exclude: [
            'script', 'style', 'nav', '.nav', '#nav',
            '.header', '.footer', '.sidebar', '.advertisement',
            '[class*="ad-"]', '[class*="social"]', '[class*="share"]',
            'iframe[src*="facebook"]', 'img[src*="facebook.com/tr"]'
          ]
        }),
        
        // Use readability with very permissive settings
        readabilityPlugin({
          minContentLength: 10,
          minScore: -50,
          removeUnlikelyContent: false
        })
      ]
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')
    
    // Get readable stream from fetch response
    const htmlStream = response.body

    if (!htmlStream) {
      return res.status(500).json({
        error: 'No content received',
        message: 'The URL did not return any content'
      })
    }

    try {
      // Stream the markdown conversion
      for await (const chunk of streamHtmlToMarkdown(htmlStream, conversionOptions)) {
        if (chunk && chunk.length > 0) {
          res.write(chunk)
        }
      }
      res.end()
    } catch (conversionError) {
      console.error('Conversion error:', conversionError)
      res.status(500).json({
        error: 'Conversion failed',
        message: 'Failed to convert HTML to Markdown: ' + conversionError.message
      })
    }

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred: ' + error.message
    })
  }
})

// API endpoint to get simple (non-streaming) conversion
app.post('/api/convert-simple', async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        message: 'Please provide a valid URL to convert'
      })
    }

    // Validate URL format
    let validUrl
    try {
      validUrl = new URL(url)
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        message: 'Please provide a valid URL (e.g., https://example.com)'
      })
    }

    console.log(`Converting URL (simple): ${url}`)

    // Fetch the HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'webmdream Web App/1.0.0 (HTML to Markdown Converter)'
      }
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to fetch URL',
        message: `HTTP ${response.status}: ${response.statusText}`
      })
    }

    // Check if the response is HTML
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      return res.status(400).json({
        error: 'Unsupported content type',
        message: `The URL returned ${contentType}, but HTML content is required`
      })
    }

    // Get the HTML content as text
    const html = await response.text()

    // Prepare conversion options with comprehensive content extraction
    const conversionOptions = { 
      origin: validUrl.origin,
      plugins: [
        // First try to isolate main content areas
        isolateMainPlugin(),
        
        // Filter out obvious non-content elements
        filterPlugin({
          exclude: [
            'script', 'style', 'nav', '.nav', '#nav',
            '.header', '.footer', '.sidebar', '.advertisement',
            '[class*="ad-"]', '[class*="social"]', '[class*="share"]',
            'iframe[src*="facebook"]', 'img[src*="facebook.com/tr"]'
          ]
        }),
        
        // Use readability with very permissive settings
        readabilityPlugin({
          minContentLength: 10,
          minScore: -50,
          removeUnlikelyContent: false
        })
      ]
    }
    
    // Convert to markdown
    const markdown = htmlToMarkdown(html, conversionOptions)

    res.json({
      success: true,
      url: url,
      markdown: markdown,
      contentType: contentType,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred: ' + error.message
    })
  }
})

app.listen(port, () => {
  console.log(`🚀 webmdream Web App running at http://localhost:${port}`)
  console.log(`📖 Convert any URL to clean Markdown`)
  console.log(`🔗 Open http://localhost:${port} in your browser to get started`)
})