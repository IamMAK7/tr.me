// API routes for themes
import { NextRequest } from 'next/server';
import { getThemes, getThemeById, createTheme } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const env = request.env as any;
  
  try {
    if (id) {
      const theme = await getThemeById(env.DB, parseInt(id));
      if (!theme) {
        return Response.json({ error: 'Theme not found' }, { status: 404 });
      }
      return Response.json(theme);
    } else {
      const themes = await getThemes(env.DB);
      return Response.json(themes);
    }
  } catch (error) {
    console.error('Error fetching themes:', error);
    return Response.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const env = request.env as any;
  
  try {
    const { name, description } = await request.json();
    
    if (!name) {
      return Response.json({ error: 'Theme name is required' }, { status: 400 });
    }
    
    const id = await createTheme(env.DB, name, description || null);
    return Response.json({ id, name, description }, { status: 201 });
  } catch (error) {
    console.error('Error creating theme:', error);
    return Response.json({ error: 'Failed to create theme' }, { status: 500 });
  }
}
