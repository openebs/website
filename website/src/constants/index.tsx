export enum EXTERNAL_LINKS {
  OPENEBS_GITHUB_REPO = 'https://github.com/openebs/openebs',
  OPENEBS_FACEBOOK = 'https://www.facebook.com/openebs',
  OPENEBS_LINKEDIN = 'https://www.linkedin.com/company/openebs',
  OPENEBS_YOUTUBE = 'https://www.youtube.com/channel/UC3ywadaAUQ1FI4YsHZ8wa0g',
  OPENEBS_TWITTER = 'https://twitter.com/openebs?s=20',
  CLOUDSKY_WEBSITE = 'https://cloudssky.com/en/',
  CODEWAVE_WEBSITE = 'https://codewave.eu/',
  GRIDWORKZ_WEBSITE = 'https://www.gridworkz.com/',
  MAYADATA_WEBSITE = 'https://mayadata.io/',
  CNCF_WEBSITE = 'https://www.cncf.io/',
  OPENEBS_BLOGS = 'https://openebs.io/blog',
  OPENEBS_GET_STARTED = 'https://docs.openebs.io/docs/next/quickstart.html', // This should be directed to new docs URL once
  OPENEBS_YOUTUBE_INTRO = 'https://www.youtube.com/watch?v=94SFY3xdjXs&t=1s',
  CONTRIBUTE_LINK = 'https://github.com/openebs/openebs/blob/master/CONTRIBUTING.md',
  GOVERNANCE_LINK = 'https://github.com/openebs/openebs/blob/master/GOVERNANCE.md',
  SUBSCRIBE_NEWSLETTER = 'https://lists.cncf.io/g/cncf-openebs-announcements',
  BECOME_ADOPTER = 'https://github.com/openebs/openebs/blob/master/ADOPTERS.md',
  CNCF_EVENTS = 'https://community.cncf.io/openebs-community',
  TOP_GITHUB_CONTRIBUTORS_URL = 'https://openebs.devstats.cncf.io/d/22/prs-authors-table?orgId=1&var-period_name=Last%20month&var-repogroup_name=All',
  NEW_GITHUB_CONTRIBUTORS_URL = 'https://openebs.devstats.cncf.io/d/52/new-contributors-table?orgId=1'
}

export const API = {
  GITHUB_URL: 'https://github.com/',
  GITHUB_CONTRIBUTORS:
    'https://api.github.com/repos/openebs/openebs-docs/contributors?q=contributions&order=desc',
};

export enum VIEW_PORT {
  MOBILE_BREAKPOINT = 760,
  TABLET_BREAKPOINT = 768,
  LAPTOP_BREAKPOINT = 960,
}

export enum EXTERNAL_LINK_LABELS {
  GITHUB = 'GitHub',
}

export const WORDS_PER_MINUTE = 250; // Based on wikipedia https://en.wikipedia.org/wiki/Speed_reading (Mental readers)

export enum BLOG_KEYWORDS {
  CHAOS_ENGINEERING = 'chaosengineering',
  OPENEBS = 'openebs',
  DEVOPS = 'devops',
  TUTORIALS = 'tutorials',
  SOLUTIONS = 'solutions',
}

export enum SOCIAL_PLATFORMS {
  SLACK = 'Slack',
  LINKEDIN = 'LinkedIn',
  TWITTER = 'Twitter',
  FACEBOOK = 'Facebook',
}

export enum SCRIPT_STATES {
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
  IDLE = 'idle',
}

export enum BLOG_TAGS {
  ALL = 'all',
}

export enum METADATA_TYPES {
  SERIES = 'Series',
  ARTICLE = 'Article',
  WEBSITE = 'Website',
  PERSON = 'Person',
  IMAGE_OBJECT = 'ImageObject',
  ORGANIZATION = 'Organization',
  WEBPAGE = 'WebPage',
}
