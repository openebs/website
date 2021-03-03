import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import url from 'url'

import config from 'config/siteConfig'
import ArticleMeta from './ArticleMeta'
import WebsiteMeta from './WebsiteMeta'
import AuthorMeta from './AuthorMeta'
import ImageQuery from 'utils/image-query'

/**
 * MetaData will generate all relevant meta data information incl.
 * JSON-LD (schema.org), Open Graph (Facebook) and Twitter properties.
 *
 */
const MetaData = ({ data, settings, title, description, image, location }) => {
  const canonical = url.resolve(config.siteUrl, location.pathname)
  const { ghostPost, ghostTag, ghostAuthor, ghostPage } = data
  let pagesSeo = settings.seo.nodes.find((node) => node.pages !== null)
  settings = settings.allGhostSettings.edges[0].node
  let page
  switch (location.pathname) {
    case '/':
      page = pagesSeo.pages.home
      break
    case '/about':
      page = pagesSeo.pages.about
      break
    case '/get-started':
      page = pagesSeo.pages.getstarted
      break
    case '/faq':
      page = pagesSeo.pages.faq
      break
    case '/community':
      page = pagesSeo.pages.community
      break
    case '/support':
      page = pagesSeo.pages.support
      break
    case '/privacy-policy':
      page = pagesSeo.pages.privacypolicy
      break
    case '/subscribe':
      page = pagesSeo.pages.subscribe
      break
    default:
      page = false
  }

  if (ghostPost) {
    return <ArticleMeta data={ghostPost} canonical={canonical} />
  } else if (ghostTag) {
    return <WebsiteMeta data={ghostTag} canonical={canonical} type="Series" />
  } else if (ghostAuthor) {
    return <AuthorMeta data={ghostAuthor} canonical={canonical} />
  } else if (ghostPage) {
    return <WebsiteMeta data={ghostPage} canonical={canonical} type="WebSite" />
  } else {
    title = title || page.title || settings.title || config.siteTitleMeta
    description =
      description ||
      page.description ||
      settings.description ||
      config.siteDescriptionMeta

    let imagePublicUrl
    if (page) {
      imagePublicUrl =
        ImageQuery().allImages.edges.find(
          (edge) => edge.node.relativePath === page.image
        ).node.publicURL || null
    }
    image = image || imagePublicUrl || settings.cover_image || null

    image = image ? imagePublicUrl : null
    return (
      <WebsiteMeta
        data={{}}
        canonical={canonical}
        title={title}
        description={description}
        image={image}
        type="WebSite"
      />
    )
  }
}

MetaData.defaultProps = {
  data: {},
}

MetaData.propTypes = {
  data: PropTypes.shape({
    ghostPost: PropTypes.object,
    ghostTag: PropTypes.object,
    ghostAuthor: PropTypes.object,
    ghostPage: PropTypes.object,
  }).isRequired,
  settings: PropTypes.shape({
    allGhostSettings: PropTypes.object.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
}

const MetaDataQuery = (props) => (
  <StaticQuery
    query={graphql`
      query GhostSettingsMetaData {
        allGhostSettings: allGhostSettings {
          edges {
            node {
              title
              description
            }
          }
        }
        seo: allDataJson {
          nodes {
            pages {
              about {
                description
                image
                title
              }
              community {
                description
                image
                title
              }
              support {
                description
                image
                title
              }
              faq {
                description
                image
                title
              }
              getstarted {
                description
                image
                title
              }
              home {
                description
                image
                title
              }
              privacypolicy {
                description
                image
                title
              }
              subscribe {
                description
                image
                title
              }
            }
          }
        }
      }
    `}
    render={(data) => <MetaData settings={data} {...props} />}
  />
)

export default MetaDataQuery
