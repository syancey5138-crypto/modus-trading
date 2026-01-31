// Vercel Serverless Function - AI Analysis Proxy
// This securely stores your API key and proxies requests to OpenAI/Anthropic

export const config = {
  maxDuration: 60, // Allow up to 60 seconds for AI responses
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, prompt, provider = 'openai' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Get API key from environment variables (securely stored in Vercel)
    const apiKey = provider === 'anthropic'
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: `${provider.toUpperCase()} API key not configured. Add it to Vercel environment variables.`
      });
    }

    let response;

    if (provider === 'anthropic') {
      // Anthropic Claude API
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: image.includes('data:image/png') ? 'image/png' : 'image/jpeg',
                    data: image.replace(/^data:image\/\w+;base64,/, ''),
                  },
                },
                {
                  type: 'text',
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${error}`);
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        content: data.content[0].text,
        provider: 'anthropic',
      });

    } else {
      // OpenAI GPT-4 Vision API
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 8000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: image,
                    detail: 'high',
                  },
                },
                {
                  type: 'text',
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        content: data.choices[0].message.content,
        provider: 'openai',
      });
    }

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze image'
    });
  }
}
