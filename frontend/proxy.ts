import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
    const host = request.headers.get('host') || '';
    const pathname = request.nextUrl.pathname;

    // 1. Bypass Next.js internal routes, static files, videos, and APIs
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/sso') ||
        pathname.startsWith('/videos')
    ) {
        return NextResponse.next();
    }

    // 2. Parse subdomain from host (e.g. acme.opspilot.test:3000 -> acme)
    const hostname = host.split(':')[0];
    const parts = hostname.split('.');

    let subdomain = '';
    if (hostname.endsWith('.sslip.io')) {
        // e.g. platform.100.58.183.34.sslip.io
        if (parts.length > 6) {
            subdomain = parts[0].toLowerCase();
        }
    } else if (parts.length > 2) {
        subdomain = parts[0].toLowerCase();
    }

    // 3. Platform routes (subdomain === 'platform')
    if (subdomain === 'platform') {
        if (pathname.startsWith('/platform')) {
            return NextResponse.next();
        }
        return NextResponse.rewrite(new URL(`/platform${pathname}`, request.url));
    }

    // 4. Tenant routes (e.g. acme.opspilot.test or acme.100.58.183.34.sslip.io)
    if (subdomain && !['www', 'app'].includes(subdomain)) {
        if (pathname.startsWith('/tenant')) {
            return NextResponse.next();
        }
        return NextResponse.rewrite(new URL(`/tenant${pathname}`, request.url));
    }

    // 5. Platform routes explicitly targeted on root domain
    if (pathname.startsWith('/platform') || pathname.startsWith('/tenant')) {
        return NextResponse.next();
    }

    // 6. Root domain / marketing landing page
    if (pathname === '/') {
        return NextResponse.next();
    }

    // Fallback for /login on naked root domain -> tenant login
    if (pathname === '/login') {
        return NextResponse.rewrite(new URL('/tenant/login', request.url));
    }

    return NextResponse.next();
}
