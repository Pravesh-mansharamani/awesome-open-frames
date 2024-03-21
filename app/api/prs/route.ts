import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const fetchOpenPRCount = async () => {
  const repo = 'open-frames/awesome-open-frames';
  const url = `https://api.github.com/repos/${repo}/pulls?state=open`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Number of open PRs: ${data.length}`);
    return data.length;
  } catch (error) {
    console.error('Error fetching open PR count:', error);
  }
};

async function generateAndSavePNG(svgContent: string): Promise<string> {
  const pngBuffer = await sharp(Buffer.from(svgContent)).png().toBuffer();
  const fileName = `satori-${Date.now()}.png`;
  const filePath = path.join(process.cwd(), 'public', fileName);
  fs.writeFileSync(filePath, pngBuffer);
  return `${fileName}`;
}

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const openPRCount = await fetchOpenPRCount();

  const svgContent = `
  <svg width="500" height="250" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="50%" y="50%" font-family="Arial" font-size="30" fill="black" text-anchor="middle" dominant-baseline="middle">${openPRCount} Frames submitted!</text>
  </svg>
`;

  console.log(svgContent);
  const imageUrl = await generateAndSavePNG(svgContent);

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Back to the main page`,
        },
      ],
      image: `${NEXT_PUBLIC_URL}/${imageUrl}`,
      postUrl: `${NEXT_PUBLIC_URL}/`,
    }),
  );
}

export async function GET(req: NextRequest): Promise<Response> {
  return getResponse(req);
}
export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}
