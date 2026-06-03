/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Toolbar,
  Paper,
  Typography,
  Link,
  Button,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import useStyles from './style';
import { socialLinks, getStarted } from './footerLinks';
import {
  EXTERNAL_LINKS, EXTERNAL_LINK_LABELS, VIEW_PORT, API,
} from '../../constants';
import useViewport from '../../hooks/viewportWidth';
import topContributorsFallback from '../../resources/topContributors.json';
import newContributorsFallback from '../../resources/newContributors.json';

const DEVSTATS_URL = 'https://openebs.devstats.cncf.io/api/ds/query';
const DEVSTATS_DATASOURCE_UID = 'P172949F98CB31475';
const GITHUB_API = 'https://api.github.com';
const ORG = 'openebs';
const TOP_COUNT = 6;
const NEW_COUNT = 6;
const BOT_SUFFIX = '[bot]';
const BOTS = new Set(['openebs-ci', 'web-flow', 'Copilot']);

type ContributorsData = {
  topContributors: string[];
  newContributors: string[];
};

const isBot = (login: string) => BOTS.has(login) || login.endsWith(BOT_SUFFIX);

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const monthsAgo = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().split('T')[0];
};

const normalizeContributor = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/\(([^)]+)\)\s*$/);
  return match?.[1] ?? trimmed;
};

const readGrafanaFrameRows = (frame: any): Record<string, unknown>[] => {
  const fieldNames = frame?.schema?.fields?.map((field: any) => field.name) ?? [];
  const columns = frame?.data?.values ?? [];

  if (fieldNames.length === 0 || columns.length === 0) {
    return [];
  }

  const rowCount = Array.isArray(columns[0]) ? columns[0].length : 0;

  return Array.from({ length: rowCount }, (_, rowIndex) => Object.fromEntries(
    fieldNames.map((fieldName: string, columnIndex: number) => [
      fieldName,
      columns[columnIndex]?.[rowIndex],
    ]),
  ));
};

const readGrafanaRows = (payload: any): Record<string, unknown>[] => {
  const results = Object.values(payload?.results ?? {});
  const rows: Record<string, unknown>[] = [];

  results.forEach((result: any) => {
    (result?.frames ?? []).forEach((frame: any) => {
      rows.push(...readGrafanaFrameRows(frame));
    });
  });

  return rows;
};

const postDevStatsQuery = async (queryName: string, rawSql: string, from = 'now-6M', to = 'now') => {
  const response = await fetch(DEVSTATS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      queries: [{
        refId: 'A',
        datasource: {
          type: 'postgres',
          uid: DEVSTATS_DATASOURCE_UID,
        },
        format: 'table',
        rawQuery: true,
        rawSql,
      }],
    }),
  });

  if (!response.ok) {
    throw new Error(`DevStats ${queryName} query failed with ${response.status} ${response.statusText}`);
  }

  return response.json();
};

const fetchGitHubFallback = async (): Promise<ContributorsData> => {
  const topUrl = `${GITHUB_API}/search/issues?q=org:${ORG}+type:pr+is:merged+merged:>${daysAgo(30)}&sort=created&order=desc&per_page=100`;
  const topResponse = await fetch(topUrl, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!topResponse.ok) {
    throw new Error(`GitHub API error ${topResponse.status} for top contributors`);
  }

  const topData = await topResponse.json();
  const counts: Record<string, number> = {};

  (topData.items ?? []).forEach((item: any) => {
    const login = item?.user?.login;
    if (typeof login === 'string' && !isBot(login)) {
      counts[login] = (counts[login] ?? 0) + 1;
    }
  });

  const topContributors = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_COUNT)
    .map(([login]) => login);

  const newUrl = `${GITHUB_API}/search/issues?q=org:${ORG}+type:pr+is:merged+merged:>${monthsAgo(6)}&sort=created&order=desc&per_page=100`;
  const newResponse = await fetch(newUrl, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!newResponse.ok) {
    throw new Error(`GitHub API error ${newResponse.status} for new contributors`);
  }

  const newData = await newResponse.json();
  const newContributors: string[] = [];
  const seen = new Set<string>();

  (newData.items ?? []).forEach((item: any) => {
    const login = item?.user?.login;
    if (
      typeof login === 'string'
      && !isBot(login)
      && !seen.has(login)
      && item.author_association === 'FIRST_TIME_CONTRIBUTOR'
      && newContributors.length < NEW_COUNT
    ) {
      seen.add(login);
      newContributors.push(login);
    }
  });

  return { topContributors, newContributors };
};

const fetchContributorsData = async (): Promise<ContributorsData> => {
  try {
    const [topPayload, newPayload] = await Promise.all([
      postDevStatsQuery('top contributors', `select name, value
       from shpr_auth
       where series = 'hpr_authall'
         and period = 'm'
       order by value desc, name asc
       limit ${TOP_COUNT}`, 'now-30d', 'now'),
      postDevStatsQuery('new contributors', `select str, dt
       from snew_contributors_data
       where series = 'ncdall'
         and period = 'd'
       order by dt desc, str asc
       limit ${NEW_COUNT}`, 'now-6M', 'now'),
    ]);

    return {
      topContributors: readGrafanaRows(topPayload)
        .map((row) => normalizeContributor(row.name))
        .filter(Boolean) as string[],
      newContributors: readGrafanaRows(newPayload)
        .map((row) => normalizeContributor(row.str))
        .filter(Boolean) as string[],
    };
  } catch (error) {
    return fetchGitHubFallback();
  }
};

const Footer: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
  const [contributors, setContributors] = useState<ContributorsData>({
    topContributors: topContributorsFallback,
    newContributors: newContributorsFallback,
  });

  useEffect(() => {
    let isMounted = true;

    fetchContributorsData()
      .then((data) => {
        if (isMounted) {
          setContributors({
            topContributors: data.topContributors.slice(0, TOP_COUNT),
            newContributors: data.newContributors.slice(0, NEW_COUNT),
          });
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.warn('Unable to refresh contributors in footer; using bundled fallback data', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);
  // const [emailValue, setEmailValue] = useState<string>('');
  // const [disableContinueButton, setDisableContinueButton] = useState<boolean>(true);

  const openEBSLogo = (
    <img loading="lazy" src="/images/logos/logo.svg" className={classes.logo} alt={t('generic.openEBS')} />
  );

  // useEffect(() => {
  //     // Enable continue button when email is valid
  //     validateEmail(emailValue) ? setDisableContinueButton(false) : setDisableContinueButton(true);
  // },[emailValue]);

  // const handleNewsLetterEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //     event.preventDefault();
  //     // Need to write logic to save email
  //   };

  // This block of code is used to display social links
  const displaySocialLinks = () => (
    <div className={classes.socialIconsWrapper}>
      {socialLinks.map(({ label, href, imgURL }) => (
        <Link href={href} target="_blank" className={classes.socialIconButton} key={label}>
          <img loading="lazy" src={imgURL} alt={label} />
        </Link>
      ))}
    </div>
  );

  // This block of code is used to display newsletter
  const displayNewsLetter = () => (
    <div>
      <Typography variant="h6" className={classes.columnTitle}>
        {t('footer.newsLetterTitle')}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        className={classes.solidButton}
        onClick={() => { window.open(EXTERNAL_LINKS.SUBSCRIBE_NEWSLETTER, '_blank'); }}
      >
        {t('newsletter.subscribe')}
      </Button>
      {/* Comment code will be used later */}
      {/* <form noValidate autoComplete="on" onSubmit={handleNewsLetterEmailSubmit}>
                  <div className={classes.newsletterFormWrapper}>
                      <TextField
                      label={t('footer.emailLabel')}
                      fullWidth
                      name="email"
                      onChange={(e) =>
                          setEmailValue(e.target.value)
                      }
                      InputProps={{
                          className: classes.newsletterInput,
                      }}
                      InputLabelProps={{
                          className: classes.newsletterLabel,
                      }}
                      />
                      <IconButton aria-label="submit" className={classes.iconButton} disabled={disableContinueButton} type="submit">
                          <img src="../images/svg/arrow_orange.svg" alt={t('header.submitAlt')}/>
                      </IconButton>
                  </div>
              </form> */}
    </div>
  );

  const formatName = (str:string) => {
    if (str.indexOf('(') > -1) {
      return str.substring(str.lastIndexOf('(') + 1, str.lastIndexOf(')')).trim();
    }
    return str;
  };

  // This block of code is used to display get started links
  const displayGetStarted = () => (
    <div>
      <Typography variant="h6" className={classes.columnTitle}>
        {t('footer.getStarted')}
      </Typography>
      <Typography className={classes.columnListWrapper}>
        {getStarted.map(({ label, href }) => (
          <Link
            href={href}
            className={classes.columnListItem}
            key={label}
            target={(label === EXTERNAL_LINK_LABELS.GITHUB) ? '_blank' : '_parent'}
          >
            {label}
          </Link>
        ))}
      </Typography>
    </div>
  );

  /* To be uncommented later */
  // This block of code is used to display contact links
  // const displayContactUs = () => {
  //     return (
  //         <div>
  //             <Typography variant='h6' className={classes.columnTitle}>
  //                 {t('footer.contactUs')}
  //             </Typography>
  //             <Typography className={classes.columnListWrapper}>
  //             {contactUs.map(({ label, href }) => {
  //                 return (
  //                     <Link href={href} className={classes.columnListItem} key={label}>
  //                         {label}
  //                     </Link>
  //                 );
  //             })}
  //             </Typography>
  //         </div>
  //     );
  // };

  const DisplayTopContributors: React.FC = () => (
    <div>
      {contributors.topContributors.length > 0 && (
      <>
        <Typography variant="h6" className={classes.columnTitle}>
          <Link
            href={EXTERNAL_LINKS.TOP_GITHUB_CONTRIBUTORS_URL}
            target="_blank"
          >
            {t('footer.topContributors')}
          </Link>
        </Typography>
        <Typography className={classes.columnListWrapper}>
          {contributors.topContributors?.slice(0, TOP_COUNT).map((contributor: string) => (
            <Link
              href={`${API.GITHUB_URL}${contributor}`}
              target="_blank"
              className={classes.columnListItem}
              key={contributor}
            >
              {contributor}
            </Link>
          ))}
        </Typography>
      </>
      )}
    </div>
  );

  const DisplayNewContributors: React.FC = () => (
    <div>
      {contributors.newContributors.length > 0 && (
      <>
        <Typography variant="h6" className={classes.columnTitle}>
          <Link
            href={EXTERNAL_LINKS.NEW_GITHUB_CONTRIBUTORS_URL}
            target="_blank"
          >
            {t('footer.newContributors')}
          </Link>
        </Typography>
        <Typography className={classes.columnListWrapper}>
          {contributors.newContributors?.slice(0, NEW_COUNT).map((contributor: string) => (
            <Link
              href={`${API.GITHUB_URL}${formatName(contributor)}`}
              target="_blank"
              className={classes.columnListItem}
              key={contributor}
            >
              {formatName(contributor)}
            </Link>
          ))}
        </Typography>
      </>
      )}
    </div>
  );

  const displayMobileFooter = () => (
    <Toolbar className={classes.toolbar}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={[classes.paper, classes.firstGrid].join(' ')}>
            <div>
              <Link href="/">
                {openEBSLogo}
              </Link>
            </div>
            <div>
              <Link className={classes.contributeButton}>
                <img loading="lazy" src="/images/logos/githubLogo.svg" className={classes.githubMobileIcon} alt={t('generic.github')} />
                {t('footer.contribute')}
              </Link>
            </div>
          </Paper>
        </Grid>
        {/* make it 6 once contact us and top contributors is uncommented */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            {displayGetStarted()}
          </Paper>
        </Grid>
        {/* To be uncommented later */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            {/* {displayContactUs()} */}
            <div className={classes.contributorsMobile}>
              <DisplayTopContributors />
            </div>
          </Paper>
        </Grid>
        {/* New contributors code block mobile */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <div className={classes.contributorsMobile}>
              <DisplayNewContributors />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            {displayNewsLetter()}
            {displaySocialLinks()}
          </Paper>
        </Grid>
      </Grid>
    </Toolbar>
  );

  const displayDesktopFooter = () => (
    <Toolbar className={classes.toolbar}>
      <Grid container spacing={0} justify="center">
        <Grid item sm={6}>
          <Paper className={[classes.paper, classes.firstGrid].join(' ')}>
            <div>
              <Link href="/">
                {openEBSLogo}
              </Link>
            </div>
            <div>
              {displayNewsLetter()}
            </div>
            <div>
              {displaySocialLinks()}
            </div>
          </Paper>
        </Grid>
        {/* Make it just sm when other footer part is uncommneted */}
        <Grid item sm>
          <Paper className={classes.paper}>
            {displayGetStarted()}
          </Paper>
        </Grid>
        {/* To be uncommented later */}
        {/* <Grid item sm>
                      <Paper className={classes.paper}>
                          {displayContactUs()}
                      </Paper>
                  </Grid> */}
        <Grid item sm>
          <Paper className={classes.paper}>
            <DisplayTopContributors />
          </Paper>
        </Grid>
        {/* New contributors code block mobile */}
        <Grid item sm>
          <Paper className={classes.paper}>
            <DisplayNewContributors />
          </Paper>
        </Grid>
      </Grid>
    </Toolbar>
  );

  const year = new Date().getFullYear();

  return (
    <div className={classes.footer}>
      <hr className={classes.topDivider} />
      {width < mobileBreakpoint ? displayMobileFooter() : displayDesktopFooter()}

      {!(width < mobileBreakpoint)
              && <hr className={classes.bottomDivider} />}

      <div className={classes.copyrightsWrapper}>
        <Typography className={classes.copyrights}>
          {t('footer.copyrights', { year })}
        </Typography>
        <Link href="/privacy-policy" className={[classes.copyrights, classes.privacyPolicyLink].join(' ')}>
          {t('footer.privacyPolicy')}
        </Link>
      </div>
      <div className={classes.copyrightsWrapper}>
        <Typography className={classes.copyrights}>
          {t('footer.cncfCopyrights', { year })}
        </Typography>
        <Link href="https://www.linuxfoundation.org/legal/trademark-usage" className={[classes.copyrights, classes.privacyPolicyLink].join(' ')}>
          {t('footer.cncfTrademark')}
        </Link>
      </div>
    </div>
  );
};

export default Footer;
