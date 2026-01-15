import fs from 'fs';
import path from 'path';
import { chromium, devices } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:8081';
const outDir = path.resolve(process.cwd(), 'tmp', 'screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const routes = [
    { path: '/', name: 'home' },
    { path: '/procurar-bicos', name: 'procurar-bicos' },
    { path: '/post-job', name: 'post-job' },
    { path: '/jobs', name: 'jobs' },
];

const themes = ['light', 'dark'];
const viewports = [
    { name: 'desktop-1280x800', width: 1280, height: 800, device: null },
    { name: 'iphone-13-390x844', device: devices['iPhone 13'] },
];

(async () => {
    const browser = await chromium.launch();

    for (const vp of viewports) {
        const contextOptions = vp.device ? { ...vp.device } : { viewport: { width: vp.width, height: vp.height } };
        const context = await browser.newContext(contextOptions);

        const page = await context.newPage();

        for (const route of routes) {
            const url = `${BASE}${route.path}`;

            // wait for server to respond
            let up = false;
            for (let i = 0; i < 30; i++) {
                try {
                    const res = await fetch(url, { method: 'HEAD' });
                    if (res && res.ok) { up = true; break; }
                } catch (err) {
                    // ignore
                }
                await new Promise(r => setTimeout(r, 500));
            }
            if (!up) {
                console.error('Server not reachable at', url);
                continue;
            }

            for (const theme of themes) {
                await page.goto(url, { waitUntil: 'networkidle' });

                // Apply theme class for dark (global .dark) or remove it for light
                await page.evaluate((t) => {
                    if (t === 'dark') document.documentElement.classList.add('dark');
                    else document.documentElement.classList.remove('dark');
                }, theme);

                // Small wait to allow transitions and CSS to settle
                await page.waitForTimeout(700);

                const filename = `${route.name}__${theme}__${vp.name}.png`;
                const outPath = path.join(outDir, filename);

                await page.screenshot({ path: outPath, fullPage: true });
                console.log('Saved', outPath);
            }
        }

        await context.close();
    }

    await browser.close();
})();
