import { NextRequest, NextResponse } from 'next/server';

interface MetadataResponse {
  success: boolean;
  title?: string;
  caption?: string;
  provider?: string;
  error?: string;
}

// Timeout helper
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 4000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Bad Request', message: 'URL is required.' },
        { status: 400 }
      );
    }

    const urlLower = url.toLowerCase();
    let provider = 'Unknown';
    let title = '';
    let caption = '';

    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    // 1. YouTube oEmbed
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      provider = 'YouTube';
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const res = await fetchWithTimeout(oembedUrl, { headers: { 'User-Agent': userAgent } });
        if (res.ok) {
          const data = await res.json();
          title = data.title || '';
          caption = data.author_name ? `Video by ${data.author_name}` : '';
        } else {
          throw new Error(`oEmbed failed with status ${res.status}`);
        }
      } catch (err) {
        console.error('YouTube oEmbed extraction failed, trying fallback...', err);
        // Fallback to basic HTML parsing
        const htmlRes = await fetchWithTimeout(url, { headers: { 'User-Agent': userAgent } }).catch(() => null);
        if (htmlRes && htmlRes.ok) {
          const html = await htmlRes.text();
          title = extractMetaTag(html, 'og:title') || extractTitleTag(html) || '';
          caption = extractMetaTag(html, 'og:description') || '';
        }
      }
    }
    // 2. TikTok oEmbed
    else if (urlLower.includes('tiktok.com')) {
      provider = 'TikTok';
      try {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
        const res = await fetchWithTimeout(oembedUrl, { headers: { 'User-Agent': userAgent } });
        if (res.ok) {
          const data = await res.json();
          title = data.title || '';
          caption = data.author_name ? `Video by ${data.author_name}` : '';
        } else {
          throw new Error(`oEmbed failed with status ${res.status}`);
        }
      } catch (err) {
        console.error('TikTok oEmbed extraction failed, trying fallback...', err);
        // Fallback to basic HTML parsing
        const htmlRes = await fetchWithTimeout(url, { headers: { 'User-Agent': userAgent } }).catch(() => null);
        if (htmlRes && htmlRes.ok) {
          const html = await htmlRes.text();
          title = extractMetaTag(html, 'og:title') || extractTitleTag(html) || '';
          caption = extractMetaTag(html, 'og:description') || '';
        }
      }
    }
    // 3. Instagram (Direct OG extraction since oEmbed is auth-only)
    else if (urlLower.includes('instagram.com')) {
      provider = 'Instagram';
      try {
        const res = await fetchWithTimeout(url, { headers: { 'User-Agent': userAgent } });
        if (res.ok) {
          const html = await res.text();
          title = extractMetaTag(html, 'og:title') || extractTitleTag(html) || '';
          caption = extractMetaTag(html, 'og:description') || '';
        } else {
          throw new Error(`Fetch failed with status ${res.status}`);
        }
      } catch (err) {
        console.error('Instagram metadata extraction failed', err);
        // Clean fallback for Instagram since it blocks headless requests
        return NextResponse.json({
          success: true,
          provider,
          title: 'Instagram Post',
          caption: '(Instagram metadata access is restricted by the platform. Please write or paste the caption manually.)'
        } as MetadataResponse);
      }
    }
    // 4. Unknown providers (General HTML parser)
    else {
      try {
        const res = await fetchWithTimeout(url, { headers: { 'User-Agent': userAgent } });
        if (res.ok) {
          const html = await res.text();
          title = extractMetaTag(html, 'og:title') || extractTitleTag(html) || '';
          caption = extractMetaTag(html, 'og:description') || '';
        }
      } catch (err) {
        console.error('General page fetch failed', err);
      }
    }

    // Post-process title/caption to clean up any HTML entities or formatting issues
    title = cleanHtmlEntities(title);
    caption = cleanHtmlEntities(caption);

    // If both title and caption are empty, return success but with a notice
    if (!title && !caption) {
      return NextResponse.json({
        success: true,
        provider,
        title: `${provider} Video`,
        caption: '(Could not retrieve metadata automatically. Please paste caption manually.)'
      } as MetadataResponse);
    }

    return NextResponse.json({
      success: true,
      provider,
      title,
      caption
    } as MetadataResponse);

  } catch (error) {
    console.error('API metadata endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: 'Failed to extract video metadata.' },
      { status: 500 }
    );
  }
}

// Regex helpers to extract tags from HTML raw text
function extractMetaTag(html: string, propertyOrName: string): string | null {
  // Matches <meta property="propertyOrName" content="value"> or <meta name="propertyOrName" content="value">
  const regex = new RegExp(
    `<meta\\s+[^>]*?(?:property|name)=["']${propertyOrName}["'][^>]*?content=["'](.*?)["']`,
    'i'
  );
  const match = html.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  
  // Try alternative ordering: <meta content="value" property="propertyOrName">
  const altRegex = new RegExp(
    `<meta\\s+[^>]*?content=["'](.*?)["'][^>]*?(?:property|name)=["']${propertyOrName}["']`,
    'i'
  );
  const altMatch = html.match(altRegex);
  return altMatch && altMatch[1] ? altMatch[1] : null;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return match && match[1] ? match[1] : null;
}

function cleanHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}
