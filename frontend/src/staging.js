import axios from 'axios';

const KEY = 'edv_staging';
const API = process.env.REACT_APP_BACKEND_URL;

// ?staging=<key> enables private staging mode in this browser; ?staging=off disables it.
export function initStaging() {
    const params = new URLSearchParams(window.location.search);
    const value = params.get('staging');
    if (value === 'off') {
        document.cookie = `${KEY}=; path=/; max-age=0`;
        localStorage.removeItem(KEY);
    } else if (value) {
        document.cookie = `${KEY}=${value}; path=/; max-age=2592000; samesite=lax; secure`;
        localStorage.setItem(KEY, '1');
    }
    if (!localStorage.getItem(KEY)) return false;

    const base = `${window.location.origin}/staging`;
    const rewrite = url => (typeof url === 'string' && url.startsWith(`${API}/api`) ? base + url.slice(API.length) : url);
    axios.interceptors.request.use(cfg => ({ ...cfg, url: rewrite(cfg.url) }));
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input, init) => nativeFetch(typeof input === 'string' ? rewrite(input) : input, init);

    const badge = document.createElement('div');
    badge.textContent = 'STAGING PREVIEW · edvnova_chem_staging';
    badge.setAttribute('data-testid', 'staging-badge');
    badge.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:9999;background:#B45309;color:#fff;font:600 11px/1 system-ui;padding:7px 10px;border-radius:8px;letter-spacing:.04em;pointer-events:none';
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(badge));
    if (document.body) document.body.appendChild(badge);
    return true;
}
