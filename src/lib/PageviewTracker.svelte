<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';

	const IGNORED_PREFIXES = ['/admin', '/login', '/analytics', '/_app', '/.well-known'];
	const IGNORED_PATHS = new Set(['/favicon.ico', '/robots.txt', '/sitemap.xml']);
	const ASSET_EXTENSION = /\.(avif|css|gif|ico|jpg|jpeg|js|json|map|pdf|png|svg|txt|webp|woff2?)$/i;

	let lastTrackedPath = '';

	function shouldTrackPath(path: string): boolean {
		if (IGNORED_PATHS.has(path)) return false;
		if (ASSET_EXTENSION.test(path)) return false;
		return !IGNORED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
	}

	function sendPageview(path: string, referrer: string): void {
		if (!browser || path === lastTrackedPath || !shouldTrackPath(path)) return;

		lastTrackedPath = path;
		const body = JSON.stringify({ path, referrer });

		if (navigator.sendBeacon) {
			navigator.sendBeacon('/analytics/pageview', new Blob([body], { type: 'application/json' }));
			return;
		}

		fetch('/analytics/pageview', {
			body,
			headers: { 'content-type': 'application/json' },
			keepalive: true,
			method: 'POST'
		}).catch(() => {
			lastTrackedPath = '';
		});
	}

	afterNavigate(({ from, to }) => {
		if (!browser || !to?.url) return;

		sendPageview(to.url.pathname, from?.url.href ?? document.referrer);
	});
</script>
