import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
    const host = request.headers.get('host') || '';
    const pathname = request.nextUrl.pathname;

    // 1. Bypass Next.js internal routes, static files, and APIs
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/sso')
    ) {
        return NextResponse.next();
    }

    // 2. Parse subdomain from host (e.g. acme.opspilot.test:3000 -> acme)
    const hostname = host.split(':')[0];
    const parts = hostname.split('.');

    let subdomain = '';
    if (parts.length > 2) {
        subdomain = parts[0].toLowerCase();
    }

    // 3. Platform routes (no subdomain, or www/app/platform)
    if (!subdomain || ['www', 'app', 'platform'].includes(subdomain)) {
        // If the path already has /platform prefix, proceed
        if (pathname.startsWith('/platform')) {
            return NextResponse.next();
        }
        return NextResponse.rewrite(new URL(`/platform${pathname}`, request.url));
    }

    // 4. Tenant routes (e.g. acme.opspilot.test)
    // If the path already has /tenant prefix, proceed
    if (pathname.startsWith('/tenant')) {
        return NextResponse.next();
    }
    return NextResponse.rewrite(new URL(`/tenant${pathname}`, request.url));
}
