import { recordPageview } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';

const IGNORED_PREFIXES = [
	'/admin',
	'/login',
	'/analytics',
	'/_app',
	'/.well-known'
];

const IGNORED_PATHS = new Set([
	'/favicon.ico',
	'/robots.txt',
	'/sitemap.xml'
]);

const ASSET_EXTENSION = /\.(avif|css|gif|ico|jpg|jpeg|js|json|map|pdf|png|svg|txt|webp|woff2?)$/i;

function empty(): Response {
	return new Response(null, { status: 204 });
}

function normalizePath(value: unknown, origin: string): string | null {
	if (typeof value !== 'string') return null;

	try {
		const url = new URL(value, origin);
		if (url.origin !== origin) return null;
		return url.pathname || '/';
	} catch {
		return null;
	}
}

function shouldTrackPath(path: string): boolean {
	if (IGNORED_PATHS.has(path)) return false;
	if (ASSET_EXTENSION.test(path)) return false;
	return !IGNORED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function classifyReferrer(value: unknown, origin: string): string {
	if (typeof value !== 'string' || !value.trim()) return 'direct';

	try {
		const referrer = new URL(value);
		if (referrer.origin === origin) return 'internal';

		const hostname = referrer.hostname.replace(/^www\./i, '').toLowerCase();
		if (/(^|\.)google\./.test(hostname) || hostname.endsWith('bing.com') || hostname.endsWith('duckduckgo.com') || hostname.endsWith('yahoo.com')) {
			return 'search';
		}

		if ([
			'facebook.com',
			'instagram.com',
			'linkedin.com',
			'reddit.com',
			't.co',
			'twitter.com',
			'x.com'
		].some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
			return 'social';
		}

		return 'external';
	} catch {
		return 'direct';
	}
}

function classifyDevice(userAgent: string | null): string {
	const ua = userAgent?.toLowerCase() ?? '';
	if (!ua) return 'unknown';
	if (/ipad|tablet|kindle|silk/.test(ua)) return 'tablet';
	if (/mobile|iphone|ipod|android.*mobile/.test(ua)) return 'mobile';
	if (/windows|macintosh|linux|x11/.test(ua)) return 'desktop';
	return 'unknown';
}

export const POST: RequestHandler = async ({ request, url }) => {
	const origin = request.headers.get('origin');
	if (origin && origin !== url.origin) {
		return json({ message: 'Forbidden' }, { status: 403 });
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return empty();
	}

	const path = normalizePath((payload as { path?: unknown }).path, url.origin);
	if (!path || !shouldTrackPath(path)) {
		return empty();
	}

	recordPageview({
		path,
		referrerSource: classifyReferrer((payload as { referrer?: unknown }).referrer, url.origin),
		deviceType: classifyDevice(request.headers.get('user-agent'))
	});

	return empty();
};
