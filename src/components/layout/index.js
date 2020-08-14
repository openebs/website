/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { Link, StaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import Logo from 'assets/images/openebs.svg'
import Navigation from 'components/navigation'
import config from 'config/siteConfig'
import Footer from '../footer'
import { Container } from '@theme-ui/components'
import Header from 'components/header'
import 'normalize.css/normalize.css'
import TagsList from 'components/tags-list'
import {
  Facebook,
  Twitter,
  GitHub,
  Linkedin,
  Slack,
  Youtube,
} from 'react-feather'

import { Banner } from "../banner";
// Styles
/**
 * Main layout component
 *
 * The Layout component wraps around each page and template.
 * It also provides the header, footer as well as the main
 * styles, and meta data for each page.
 *
 */
const DefaultLayout = ({ data, children, bodyClass, isHome, location }) => {
  const site = data.allGhostSettings.edges[0].node
  const logo = data.file.childImageSharp.fixed.src

  const twitterUrl = site.twitter
    ? `https://twitter.com/${site.twitter.replace(/^@/, ``)}`
    : null
  const facebookUrl = site.facebook
    ? `https://www.facebook.com/${site.facebook.replace(/^\//, ``)}`
    : null

  {
    /*
  // TODO : create a new file which contains all the links regarding social medias
  // links
  */
  }
  const linkedInUrl = `https://www.linkedin.com/company/openebs/`
  return (
    <>
      <Styled.root>
        <Helmet>
          <html lang={site.lang} />
          <style type="text/css">{`${site.codeinjection_styles}`}</style>
          <body className={bodyClass} />
        </Helmet>

        <div className="viewport">
          <div className="viewport-top">
            {/* The main header section on top of the screen */}
            <Banner />
            <Header />
            {!location && (
              <div
                sx={{
                  py: '3',
                  bg: 'white',
                  boxShadow: '0 4px 6px -7px grey',
                }}
              >
                <Container>
                  <header>
                    <div sx={{ display: ['block', 'flex'] }}>
                      <div>
                        <nav>
                          <div sx={{ display: 'flex', my: 'auto' }}>
                            <div sx={{ mr: '3' }}>
                              <Link
                                to="/blog"
                                activeStyle={{
                                  color: '#F26D00',
                                  paddingBottom: '3px',
                                  marginBottom: '-3px',
                                  borderBottom: '1px solid #f26d00',
                                }}
                                sx={{
                                  textDecoration: 'none',
                                  my: '0',
                                  fontSize: [2, 2, '18px'],
                                  textTransform: 'capitalize',
                                  fontWeight: '300',
                                }}
                              >
                                <Styled.p sx={{ m: '0' }}>
                                  OpenEBS Blog
                                </Styled.p>
                              </Link>
                            </div>
                            <TagsList />
                          </div>
                        </nav>
                      </div>
                      <div sx={{ ml: 'auto', pt: ['3', '0'] }}>
                        {site.twitter && (
                          <a
                            href={twitterUrl}
                            sx={{ mx: '2', textDecoration: 'none' }}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Twitter size={20} color={'#0063FF'} />
                          </a>
                        )}
                        {site.facebook && (
                          <a
                            href={facebookUrl}
                            sx={{ mx: '2', textDecoration: 'none' }}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Facebook size={20} color={'#0063FF'} />
                          </a>
                        )}
                        {/*
                        // Display it only when social media links are available
                        // from ghost TODO : create a new file which contains //
                        // all the links regarding social media links
                        */}
                        {site.facebook && site.twitter && (
                          <a
                            href={linkedInUrl}
                            sx={{ mx: '2', textDecoration: 'none' }}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Linkedin size={20} color={'#0063FF'} />
                          </a>
                        )}
                      </div>
                    </div>
                  </header>
                </Container>
              </div>
            )}
            <main>
              {/* All the main content gets inserted here, index.js, post.js */}
              {children}
            </main>
          </div>

          <div className="viewport-bottom">
            {/* The footer at the very bottom of the screen */}
            <Footer />
          </div>
        </div>
      </Styled.root>
    </>
  )
}

DefaultLayout.propTypes = {
  children: PropTypes.node.isRequired,
  bodyClass: PropTypes.string,
  isHome: PropTypes.bool,
  data: PropTypes.shape({
    file: PropTypes.object,
    allGhostSettings: PropTypes.object.isRequired,
  }).isRequired,
}

const DefaultLayoutSettingsQuery = (props) => (
  <StaticQuery
    query={graphql`
      query GhostSettingsTest {
        allGhostSettings {
          edges {
            node {
              ...GhostSettingsFields
            }
          }
        }
        file(relativePath: { eq: "openebs.png" }) {
          childImageSharp {
            fixed(height: 24) {
              ...GatsbyImageSharpFixed
            }
          }
        }
        allGhostTag(sort: { order: ASC, fields: name }) {
          edges {
            node {
              slug
              url
              postCount
            }
          }
        }
      }
    `}
    render={(data) => <DefaultLayout data={data} {...props} />}
  />
)

export default DefaultLayoutSettingsQuery
