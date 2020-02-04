/** @jsx jsx */
import { jsx } from 'theme-ui'
import React, { useState } from 'react'
import Image from 'components/image'
import Logo from 'assets/images/openebs.svg'
import { Link, StaticQuery, graphql } from 'gatsby'
import { Input, Button, Container, Box, Flex } from '@theme-ui/components'
import Newsletter from 'components/newsletter'
import {
  Facebook,
  Twitter,
  GitHub,
  Linkedin,
  Slack,
  Youtube,
} from 'react-feather'

const FooterComponent = (data) => {
  const { allDataJson } = data.data
  const { edges } = allDataJson
  let about, links, social
  edges.map((edge) => {
    if (edge.node.footer !== null) {
      about = edge.node.footer.about
      links = edge.node.footer.links
      social = edge.node.footer.social
    }
  })

  const socials = (title) => {
    switch (title) {
      case 'facebook':
        return <Facebook />
      case 'twitter':
        return <Twitter />
      case 'github':
        return <GitHub />
      case 'linkedin':
        return <Linkedin />
      case 'slack':
        return <Slack />
      case 'youtube':
        return <Youtube />
      default:
        return null
    }
  }

  return (
    <>
      <div sx={{ bg: 'background' }}>
        <Container py={4}>
          <div
            sx={{
              display: `grid`,
              gridGap: 4,
              gridTemplateColumns: [`minmax(180px, auto)`, `1fr 1fr 1fr`],
            }}
          >
            <div sx={{ px: '3' }}>
              <Link to="/">
                <Image src="openebs.svg" style={{ maxWidth: '200px' }} />
              </Link>
              <p>{about.description}</p>
            </div>
            <div
              sx={{
                displey: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div
                sx={{
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '50%',
                  height: '100%',
                  margin: 'auto',
                }}
              >
                <ul
                  sx={{
                    listStyleType: 'none',
                    textDecoration: 'none',
                    pl: '0',
                  }}
                >
                  {links.slice(0, 3).map((link) => {
                    if (link.link !== null) {
                      if (link.link.external) {
                        return (
                          <li
                            sx={{
                              pb: '3',
                            }}
                            key={`footer-${link.title}`}
                          >
                            <a
                              href={link.link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                textDecoration: 'none',
                                color: 'dark',
                                fontWeight: 'bold',
                                ':hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              {link.title}
                            </a>
                          </li>
                        )
                      }
                      return (
                        <li
                          sx={{
                            pb: '3',
                            textDecoration: 'none',
                            color: 'dark',
                          }}
                          key={`footer-${link.title}`}
                        >
                          <Link
                            to={link.link.url}
                            sx={{
                              textDecoration: 'none',
                              color: 'dark',
                              fontWeight: 'bold',
                              ':hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {link.title}
                          </Link>
                        </li>
                      )
                    }
                    return (
                      <li
                        sx={{
                          textDecoration: 'none',
                          color: 'dark',
                          fontWeight: 'bold',
                          ':hover': {
                            textDecoration: 'underline',
                          },
                        }}
                        key={`footer-${link.title}`}
                      >
                        {link.title}
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div
                sx={{
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '50%',
                  height: '100%',
                  margin: 'auto',
                }}
              >
                <ul
                  sx={{ listStyleType: 'none', textDecoration: 'none', p: '0' }}
                >
                  {links.slice(3).map((link) => {
                    if (link.link !== null) {
                      if (link.link.external) {
                        return (
                          <li sx={{ pb: '3' }} key={`footer-${link.title}`}>
                            <a
                              href={link.link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                textDecoration: 'none',
                                color: 'dark',
                                fontWeight: 'bold',
                                ':hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              {link.title}
                            </a>
                          </li>
                        )
                      }
                      return (
                        <li sx={{ pb: '3' }} key={`footer-${link.title}`}>
                          <Link
                            to={link.link.url}
                            sx={{
                              textDecoration: 'none',
                              color: 'dark',
                              fontWeight: 'bold',
                              ':hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {link.title}
                          </Link>
                        </li>
                      )
                    }
                    return <li key={`footer-${link.title}`}>{link.title}</li>
                  })}
                </ul>
              </div>
            </div>
            <div>
              <ul
                sx={{
                  listStyleType: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: '0',
                  height: '33%',
                }}
              >
                {social.map((social) => {
                  if (social.link.external) {
                    return (
                      <li
                        sx={{ px: ['1', '2', '2'] }}
                        key={`footer-${social.title}`}
                      >
                        <a
                          href={social.link.url}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {socials(social.title)}
                        </a>
                      </li>
                    )
                  } else {
                    return (
                      <li
                        sx={{ px: ['1', '2', '2'] }}
                        key={`footer-${social.title}`}
                      >
                        <Link to={social.link.url}>
                          {socials(social.title)}
                        </Link>
                      </li>
                    )
                  }
                })}
              </ul>
              <div
                sx={{
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '33%',
                }}
              >
                <Newsletter />
              </div>
            </div>
          </div>
        </Container>
        <div sx={{ bg: 'black' }}>
          <Container>
            <div
              sx={{
                mx: 'auto',
                px: [3, 3, 0],
                py: 4,
                textAlign: 'center',
                color: 'white',
                display: ['block', 'block', 'flex'],
                justifyContent: ['center', 'center', 'space-between'],
                alignItems: 'center',
                fontSize: '0',
              }}
            >
              <p sx={{ textAlign: ['center', 'center', 'left'] }}>
                Copyright &copy; {new Date().getFullYear()} The OpenEBS Authors
                | All rights reserved
              </p>
              <Link
                to="privacy-policy"
                sx={{ color: 'white', textDecoration: 'none' }}
              >
                Privacy Policy
              </Link>
            </div>
          </Container>
        </div>
      </div>
    </>
  )
}

const Footer = (props) => (
  <StaticQuery
    query={graphql`
      query FooterQuery {
        allDataJson {
          edges {
            node {
              footer {
                about {
                  description
                  imgUrl
                }
                links {
                  link {
                    external
                    url
                  }
                  title
                }
                social {
                  link {
                    external
                    url
                  }
                  title
                }
              }
            }
          }
        }
      }
    `}
    render={(data) => <FooterComponent data={data} />}
  />
)
export default Footer
