/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Container, Box } from '@theme-ui/components'
import Image from 'components/image'
import { graphql, StaticQuery } from 'gatsby'
const SlackCard = () => (
  <StaticQuery
    query={graphql`
      query {
        desktop: file(relativePath: { eq: "community/bg.png" }) {
          publicURL
          name
        }
      }
    `}
    render={(data) => {
      const imageData = data.desktop
      return (
        <>
          <div
            sx={{
              backgroundImage: `url("${imageData.publicURL}")`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              py: ['4', '4', '5'],
            }}
          >
            <Container>
              <div
                sx={{
                  display: 'grid',
                  gridGap: 4,
                  gridTemplateColumns: ['minmax(256px,auto)', '1fr', '1fr 1fr'],
                }}
              >
                <div>
                  <div
                    sx={{
                      maxWidth: '420px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'end',
                      flexDirection: 'column',
                      margin: 'auto',
                      height: '100%',
                      '@media screen and (max-width: 78em)': {
                        maxWidth: '324px',
                        maxWidth: '21.5em',
                        padding: 0,
                        margin: 'auto',
                        width: `100%`,
                      },
                    }}
                  >
                    <Box
                      p={4}
                      sx={{
                        marginTop: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        textAlign: 'center',
                        boxShadow: '0 0 0 2px white',
                        backgroundColor: '#fefefe',
                        borderRadius: '4px',
                        height: '100%',
                        margin: '21px 8px',
                        '@media screen and (max-width: 78em)': {
                          padding: 3,
                          margin: '0',
                          width: '100%',
                        },
                        '@media screen and (max-width: 25em)': {
                          padding: 3,
                          margin: 'auto',
                          width: '100%',
                          maxWidth: '100%',
                        },
                      }}
                    >
                      <Image
                        src="community/slack-community.svg"
                        style={{ maxWidth: '25%' }}
                      />
                      <Styled.h4 sx={{ pt: '5', fontWeight: '600' }}>
                        Join OpenEBS Community on{' '}
                        <Styled.a
                          href="https://kubernetes.slack.com/messages/openebs/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: 'none',
                          }}
                        >
                          Kubernetes Slack{' '}
                        </Styled.a>{' '}
                      </Styled.h4>
                      <hr
                        sx={{ width: '40%', borderTop: '2px solid #0063FF' }}
                      />
                      <p sx={{ fontSize: '2' }}>
                        OpenEBS is an extremely active community. Please expect
                        a response within 3-6 hours.
                      </p>
                      <p>
                        <Styled.a
                          href="https://github.com/openebs/openebs/issues"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          OpenEBS on GitHub
                        </Styled.a>{' '}
                        is a great place to join if you want to contribute to
                        our codebase.
                      </p>
                    </Box>
                  </div>
                </div>
                <div>
                  <div
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'start',
                      flexDirection: 'column',
                      height: '100%',
                      margin: 'auto',
                    }}
                  >
                    <iframe
                      src="https://slack.k8s.io/"
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 0 0 2px white',
                        marginTop: '20px',
                        height: '480px',
                        padding: '29px 50px',
                        margin: '21px 32px',
                        backgroundColor: '#fefefe',
                        borderRadius: '4px',
                        maxWidth: '315px',
                        width: '100%',
                        '@media screen and (max-width: 78em)': {
                          padding: 3,
                          margin: 'auto',
                          width: '100%',
                          maxWidth: '315px',
                        },
                        '@media screen and (max-width: 25em)': {
                          padding: 3,
                          margin: 'auto',
                          width: '100%',
                          maxWidth: '90%',
                        },
                      }}
                      height="480"
                      frameBorder="0"
                      scrolling="no"
                    ></iframe>
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </>
      )
    }}
  />
)

export default SlackCard
