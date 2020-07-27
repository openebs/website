/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React, { useState, useEffect, useRef } from 'react'
import { Container } from '@theme-ui/components'
import Logo from 'assets/images/openebs.svg'
import { Link, StaticQuery, graphql } from 'gatsby'
import MenuButton from './menu-button'
import { Sidenav } from '@theme-ui/sidenav'
import GitHubButton from 'react-github-btn'

const HeaderComponent = ({ data, props }) => {
  const { edges } = data
  const [isSlide, setOnSlide] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const nav = useRef(null)
  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY >= 1) {
        setOnSlide(true)
      }
      if (window.scrollY < 1) {
        setOnSlide(false)
      }
    })
  })

  const handleMenuOption = () => {
    setMenuOpen(!menuOpen)
    if (!menuOpen) {
      nav.current.style.transform = 'translate(0%)'
    } else {
      nav.current.style.transform = 'translate(-100%)'
    }
  }

  return (
    <>
      <div
        sx={{
          backgroundColor: 'background',
          width: '100%',
          position: `${isSlide ? 'sticky' : 'relative'}`,
          top: 0,
          zIndex: 100,
          boxShadow: `${isSlide ? '0 2px 12px 0 #D1D2D9' : 'none'}`,
          transition: 'all 0.1s ease-in-out',
        }}
      >
        <Container>
          <header
            sx={{
              display: `flex`,
              alignItems: `center`,
              variant: `styles.header`,
              paddingTop: ['8px'],
              paddingBottom: ['8px']
            }}
          >
            <div sx={{ display: ['block', 'flex'], justifyContent: 'center', alignItems: 'center', lineHeight: '0.9' }}>
              <Link
                to="/"
                title="openebs"
                sx={{
                  variant: `styles.navlink`,
                  py: 2,
                }}
                activeStyle={{ color: '#F26D00' }}
              >
                <Logo style={{ height: `40px` }} />
              </Link>
              <div sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: ['4px', '16px'], paddingTop: ['8px', '0px'], paddingBottom: ['8px', '0px'] }}>
                <GitHubButton className="github-button" href="https://github.com/openebs/openebs" data-icon="octicon-star" data-show-count="true" aria-label="Star openebs/openebs on GitHub">Star</GitHubButton>
              </div>
            </div>
            <div sx={{ mx: `auto` }} />
            <MenuButton onClick={handleMenuOption} />

            <div>
              <Sidenav
                {...props}
                ref={nav}
                sx={{
                  padding: ['40px 10px 40px 30px', '0px'],
                  maxWidth: ['256px', '100%'],
                  width: ['100%'],
                  backgroundColor: ['gray', 'transparent'],
                }}
              >
                {edges.map((edge) => {
                  if (edge.node.nav !== null) {
                    return edge.node.nav.map((el) => {
                      if (el.link.external) {
                        return (
                          <a
                            href={el.link.url}
                            sx={{
                              variant: `styles.navlink`,
                              mx: 3,
                              my: 2,
                              pb: [4, 0],
                              display: ['block', 'inline-flex'],
                            }}
                            key={`header-${el.title}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {el.title}
                          </a>
                        )
                      }
                      return (
                        <Link
                          to={el.link.url}
                          sx={{
                            variant: `styles.navlink`,
                            mx: 3,
                            my: 2,
                            mb: [4, 0],
                            width: 'fit-content',
                            display: ['block', 'inline-flex'],
                          }}
                          activeStyle={{
                            color: '#f26D00',
                            paddingBottom: '2px',

                            borderBottom: '2px solid #f26d00',
                          }}
                          key={`header-${el.title}`}
                        >
                          {el.title}
                        </Link>
                      )
                    })
                  }
                })}
              </Sidenav>
            </div>
          </header>
        </Container>
      </div>
    </>
  )
}

const Header = (props) => (
  <StaticQuery
    query={graphql`
      query NavQuery {
        allDataJson {
          edges {
            node {
              nav {
                title
                link {
                  external
                  url
                }
              }
            }
          }
        }
      }
    `}
    render={(data) => {
      const { allDataJson } = data

      return <HeaderComponent data={allDataJson} />
    }}
  />
)

export default Header
