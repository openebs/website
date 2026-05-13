'use strict';

const DEVSTATS_URL = 'https://openebs.devstats.cncf.io/api/ds/query';
const DEVSTATS_DATASOURCE_UID = 'P172949F98CB31475';
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

function isBot(login) {
    return BOTS.has(login) || login.endsWith(BOT_SUFFIX);
}

function normalizeContributor(value) {
    if (typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    // DevStats returns some contributors as "Name (login)"; link using the login.
    const match = trimmed.match(/\(([^)]+)\)\s*$/);
    return match?.[1] ?? trimmed;
}

function readGrafanaFrameRows(frame) {
    const fieldNames = frame?.schema?.fields?.map((field) => field.name) ?? [];
    const columns = frame?.data?.values ?? [];
    if (fieldNames.length === 0 || columns.length === 0) {
        return [];
    }
    const rowCount = Array.isArray(columns[0]) ? columns[0].length : 0;
    return Array.from({length: rowCount}, (_, rowIndex) =>
        Object.fromEntries(
            fieldNames.map((fieldName, columnIndex) => [fieldName, columns[columnIndex]?.[rowIndex]]),
        ),
    );
}

function readGrafanaRows(payload) {
    const results = Object.values(payload?.results ?? {});
    const rows = [];
    for (const result of results) {
        for (const frame of result?.frames ?? []) {
            rows.push(...readGrafanaFrameRows(frame));
        }
    }
    return rows;
}

async function postGrafanaQuery(rawSql, {from = 'now-6M', to = 'now'} = {}) {
    /**
     * Query the public DevStats Grafana datasource directly.
     *
     * The SQL must match the public OpenEBS dashboards' Postgres schema, and
     * the relative time strings (for example `now-6M`) are Grafana-compatible
     * range values passed through to the datasource query API.
     */
    const response = await fetch(DEVSTATS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to,
            queries: [
                {
                    refId: 'A',
                    datasource: {
                        type: 'postgres',
                        uid: DEVSTATS_DATASOURCE_UID,
                    },
                    format: 'table',
                    rawQuery: true,
                    rawSql,
                },
            ],
        }),
    });
    if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
            `DevStats query to ${DEVSTATS_URL} failed with ${response.status}: ${responseText}`,
        );
    }
    return response.json();
}

async function fetchDevStatsContributors() {
    const [topPayload, newPayload] = await Promise.all([
        postGrafanaQuery(
            `select name, value
             from shpr_auth
             where series = 'hpr_authall'
               and period = 'm'
             order by value desc, name asc
             limit ${TOP_COUNT}`,
            {from: 'now-30d', to: 'now'},
        ),
        postGrafanaQuery(
            `select str, dt
             from snew_contributors_data
             where series = 'ncdall'
               and period = 'd'
             order by dt desc, str asc
             limit ${NEW_COUNT}`,
            {from: 'now-6M', to: 'now'},
        ),
    ]);

    const topContributors = readGrafanaRows(topPayload)
        .map((row) => normalizeContributor(row.name))
        .filter(Boolean);

    const newContributors = readGrafanaRows(newPayload)
        .map((row) => normalizeContributor(row.str))
        .filter(Boolean);

    return {topContributors, newContributors};
}

async function githubFetch(url, token) {
    const headers = {Accept: 'application/vnd.github.v3+json'};
    if (token) {
        headers.Authorization = `token ${token}`;
    }
    const response = await fetch(url, {headers});
    if (!response.ok) {
        throw new Error(`GitHub API error ${response.status} for ${url}`);
    }
    return response.json();
}

async function fetchGitHubFallback() {
    const token = process.env.GITHUB_TOKEN;
    const since30 = daysAgo(30);
    const since180 = daysAgo(180);

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
            if (newContributors.length >= NEW_COUNT) {
                break;
            }
        }
    }

    return {topContributors, newContributors};
}

/** @returns {import('@docusaurus/types').Plugin} */
module.exports = function contributorsPlugin() {
    return {
        name: 'contributors-plugin',

        async loadContent() {
            try {
                const contributors = await fetchDevStatsContributors();
                console.log('[contributors-plugin] Loaded contributor data from devstats');
                return contributors;
            } catch (devStatsError) {
                console.warn(
                    `[contributors-plugin] Could not fetch contributor data from devstats: ${devStatsError.message}`,
                );
            }

            try {
                const contributors = await fetchGitHubFallback();
                console.log('[contributors-plugin] Loaded contributor data from GitHub fallback');
                return contributors;
            } catch (githubError) {
                console.warn(
                    `[contributors-plugin] Could not fetch contributor data from GitHub fallback: ${githubError.message}`,
                );
                return {topContributors: [], newContributors: []};
            }
        },

        async contentLoaded({content, actions}) {
            actions.setGlobalData(content);
        },
    };
};
