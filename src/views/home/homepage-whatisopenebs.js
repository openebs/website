/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import { Container, Button, Box } from '@theme-ui/components'
import Image from 'components/image'
import Img from 'gatsby-image'
const WhatIsOpenEBS = () => {
  return (
    <>
      <div sx={{ pb: ['4', '4', '5'], pt: ['5', '4', '5'], bg: 'primary' }}>
        <Container sx={{ maxWidth: 1024 }}>
          <div
            sx={{
              display: 'grid',
              gridGap: 4,
              gridTemplateColumns: ['auto', '1fr', '1fr 1fr'],
            }}
          >
            <div>
              <div>
                <Box
                  p={3}
                  color="white"
                  bg="dark"
                  sx={{
                    textAlign: 'center',
                    maxWidth: ['400px', '500px', '500px'],
                    margin: 'auto',
                  }}
                >
                  Any stateful Kubernetes application
                </Box>
                <div
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mx: 'auto',
                    mt: '2',
                    maxWidth: '240px',
                  }}
                >
                  {Array.from({ length: 2 }).map((el, index) => {
                    return (
                      <svg
                        id="downArrow"
                        enableBackground="new 0 0 64 64"
                        height="32"
                        viewBox="0 0 64 64"
                        width="32"
                        xmlns="http://www.w3.org/2000/svg"
                        key={`downArrow-${index}`}
                      >
                        <path
                          d="m32 8c-1.104 0-2 .896-2 2v39.892l-14.552-15.272c-.762-.798-2.027-.829-2.828-.068-.799.763-.83 2.028-.068 2.828l16.625 17.445c.758.758 1.76 1.175 2.823 1.175 1.062 0 2.063-.417 2.858-1.21l16.59-17.41c.762-.8.731-2.065-.068-2.828-.8-.762-2.063-.731-2.828.068l-14.552 15.341v-39.961c0-1.104-.896-2-2-2z"
                          fill="#fff"
                        />
                      </svg>
                    )
                  })}
                </div>

                <div
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 3,
                  }}
                >
                  <Image
                    src="openebs-white.svg"
                    style={{ maxWidth: '50%', height: '48px' }}
                  />
                </div>
                <div
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mx: 'auto',
                    mb: '2',
                    maxWidth: '240px',
                  }}
                >
                  {Array.from({ length: 2 }).map((el, index) => {
                    return (
                      <svg
                        id="upArrow"
                        enableBackground="new 0 0 64 64"
                        height="32"
                        viewBox="0 0 64 64"
                        width="32"
                        xmlns="http://www.w3.org/2000/svg"
                        key={`upArrow-${index}`}
                      >
                        <path
                          d="m32 56c1.104 0 2-.896 2-2v-39.899l14.552 15.278c.393.413.92.621 1.448.621.495 0 .992-.183 1.379-.552.8-.762.831-2.028.069-2.828l-16.619-17.448c-.756-.755-1.76-1.172-2.829-1.172s-2.073.417-2.862 1.207l-16.586 17.414c-.762.8-.731 2.066.069 2.828s2.067.731 2.828-.069l14.551-15.342v39.962c0 1.104.896 2 2 2z"
                          fill="#fff"
                        />
                      </svg>
                    )
                  })}
                </div>
                <Box
                  p={3}
                  color="white"
                  bg="dark"
                  sx={{
                    textAlign: 'center',
                    maxWidth: ['400px', '500px', '500px'],
                    margin: 'auto',
                  }}
                >
                  Any Storage System
                </Box>
              </div>
            </div>
            <div>
              <div
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  color: 'white',
                  margin: 'auto',
                  height: '100%',
                }}
              >
                <Styled.h2 sx={{ color: 'white', mb: 0 }}>
                  What is OpenEBS?
                </Styled.h2>
                <Styled.ul>
                  OpenEBS is the leading storage solution for Kubernetes
                  <Styled.li sx={{ ml: 3, mt: 3 }}>
                    Kubernetes native; runs in userspace
                  </Styled.li>
                  <Styled.li sx={{ ml: 3 }}>
                    Open Source; no vendor lock-in
                  </Styled.li>
                  <Styled.li sx={{ ml: 3 }}>
                    The only multi cloud storage solution
                  </Styled.li>
                </Styled.ul>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}

export default WhatIsOpenEBS
