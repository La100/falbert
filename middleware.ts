import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  try {
    const user = await getUser(supabase);
    
    if (!user && request.nextUrl.pathname.startsWith('/(authenticated)')) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    return res;
  } catch (error) {
    console.error('Błąd middleware:', error);
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}

export const config = {
  matcher: ['/(authenticated)/:path*']
};