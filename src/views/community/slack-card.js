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
                      '@media screen and (max-width: 78em)': {
                        maxWidth: '324px',
                        padding: 0,
                        margin: 'auto',
                      },
                    }}
                  >
                    <Box
                      p={4}
                      mx={2}
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
                        '@media screen and (max-width: 78em)': {
                          padding: 3,
                          margin: 'auto',
                        },
                      }}
                    >
                      <Image
                        src="community/slack-community.svg"
                        style={{ maxWidth: '25%' }}
                      />
                      <Styled.h4 sx={{ pt: '5', fontWeight: '600' }}>
                        Join OpenEBS Community on Slack
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
                        is one of the best places to reach out to.
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
                      src="https://heroku-slackinn.herokuapp.com/"
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 0 0 2px white',
                        marginTop: '20px',
                        height: '400px',
                        padding: '29px 50px',
                        margin: '21px 32px',
                        backgroundColor: '#fefefe',
                        borderRadius: '4px',
                        '@media screen and (max-width: 78em)': {
                          padding: 3,
                          margin: 'auto',
                        },
                      }}
                      height="400"
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
