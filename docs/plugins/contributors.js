/**
 * Docusaurus build-time plugin that fetches live contributor data from the
 * GitHub API and stores it as global plugin data for the Footer component.
 *
 * Top contributors: PR authors across org:openebs in the last 30 days.
 * New contributors: contributors whose first PR to any openebs repo was
 * merged in the last 180 days (FIRST_TIME_CONTRIBUTOR author-association).
 *
 * Set the GITHUB_TOKEN env variable to avoid the 60 req/hr anonymous
 * rate limit during builds.
 */

'use strict';

const GITHUB_API = 'https://api.github.com';
const ORG = 'openebs';
const TOP_COUNT = 6;
const NEW_COUNT = 6;
const BOT_SUFFIX = '[bot]';
const BOTS = new Set(['openebs-ci', 'web-flow', 'Copilot']);

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
}

async function githubFetch(url, token) {
    const headers = {Accept: 'application/vnd.github.v3+json'};
    if (token) {
        headers['Authorization'] = `token ${token}`;
    }
    const resp = await fetch(url, {headers});
    if (!resp.ok) {
        throw new Error(`GitHub API error ${resp.status} for ${url}`);
    }
    return resp.json();
}

function isBot(login) {
    return BOTS.has(login) || login.endsWith(BOT_SUFFIX);
}

/** @returns {import('@docusaurus/types').Plugin} */
module.exports = function contributorsPlugin(_context, _options) {
    return {
        name: 'contributors-plugin',

        async loadContent() {
            const token = process.env.GITHUB_TOKEN;
            const since30 = daysAgo(30);
            const since180 = daysAgo(180);

            try {
                // ── Top contributors: merged PRs in the last 30 days ──────────
                const topUrl =
                    `${GITHUB_API}/search/issues` +
                    `?q=org:${ORG}+type:pr+is:merged+merged:>${since30}` +
                    `&sort=created&order=desc&per_page=100`;
                const topData = await githubFetch(topUrl, token);

                const counts = {};
                for (const item of topData.items ?? []) {
                    const login = item.user?.login;
                    if (login && !isBot(login)) {
                        counts[login] = (counts[login] ?? 0) + 1;
                    }
                }
                const topContributors = Object.entries(counts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, TOP_COUNT)
                    .map(([login]) => login);

                // ── New contributors: first-ever PR, merged in last 180 days ──
                const newUrl =
                    `${GITHUB_API}/search/issues` +
                    `?q=org:${ORG}+type:pr+is:merged+merged:>${since180}` +
                    `&sort=created&order=desc&per_page=100`;
                const newData = await githubFetch(newUrl, token);

                const newContributors = [];
                const seen = new Set();
                for (const item of newData.items ?? []) {
                    const login = item.user?.login;
                    if (
                        login &&
                        !isBot(login) &&
                        !seen.has(login) &&
                        item.author_association === 'FIRST_TIME_CONTRIBUTOR'
                    ) {
                        seen.add(login);
                        newContributors.push(login);
                        if (newContributors.length >= NEW_COUNT) break;
                    }
                }

                console.log(
                    `[contributors-plugin] Top contributors (last 30 days):`,
                    topContributors,
                );
                console.log(
                    `[contributors-plugin] New contributors (last 180 days):`,
                    newContributors,
                );

                return {topContributors, newContributors};
            } catch (err) {
                console.warn(
                    `[contributors-plugin] Could not fetch contributor data: ${err.message}`,
                );
                return {topContributors: [], newContributors: []};
            }
        },

        async contentLoaded({content, actions}) {
            actions.setGlobalData(content);
        },
    };
};
