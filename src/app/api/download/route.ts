import { NextRequest, NextResponse } from 'next/server';
import { getSignedAssetFetchUrl } from '@/lib/domains/media';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('URL is required', { status: 400 });
  }

  try {
    const fetchUrl = getSignedAssetFetchUrl(url);

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary fetch failed:', response.status, errorText);
      throw new Error(`Cloudinary returned ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';

    // Determine extension from content type or original URL
    let extension = '';
    const lowerUrl = url.toLowerCase();
    
    if (contentType.includes('word') || contentType.includes('msword') || contentType.includes('officedocument')) {
      extension = '.docx';
    } else if (contentType.includes('pdf')) {
      extension = '.pdf';
    } else if (lowerUrl.endsWith('.docx')) {
      extension = '.docx';
    } else if (lowerUrl.endsWith('.doc')) {
      extension = '.doc';
    } else if (lowerUrl.endsWith('.pdf')) {
      extension = '.pdf';
    } else {
      extension = '.pdf';
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="Resume${extension}"`,
        'Cache-Control': 'no-cache'
      },
    });
  } catch (error: any) {
    console.error('Download proxy error:', error.message);
    // If proxy fails, redirect to the original URL as a absolute fallback
    return NextResponse.redirect(url);
  }
}
