/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import { Container, Button } from '@theme-ui/components'
const GetStarted = ({ location }) => {
  return (
    <>
      <Styled.div sx={{ bg: 'primary', py: ['4', '4', '5'] }}>
        <Container>
          <Styled.div sx={{ textAlign: 'center' }}>
            <Styled.h2 sx={{ pb: '3', color: 'white' }}>Get Started</Styled.h2>
            <Styled.h4 sx={{ pb: '4', color: 'white' }}>
              Get set up with your first OpenEBS cluster in under 90 seconds
            </Styled.h4>

            <Link
              to="/get-started"
              sx={{ display: ['block', 'block', 'inline-block'] }}
            >
              <Button
                sx={{
                  bg: 'white',
                  color: 'primary',
                  mx: ['0', '0', '4'],
                  mb: ['4', '4', '0'],
                  '&:focus': {
                    color: 'white',
                  },
                }}
              >
                Start Now
              </Button>
            </Link>
            <Link
              to="/community"
              sx={{ display: ['block', 'block', 'inline-block'] }}
            >
              <Button
                sx={{
                  bg: 'white',
                  color: 'primary',
                  mx: ['0', '0', '4'],
                  mb: ['4', '4', '0'],
                  '&:focus': {
                    color: 'white',
                  },
                }}
              >
                Join Our Community
              </Button>
            </Link>
          </Styled.div>
        </Container>
      </Styled.div>
    </>
  )
}

export default GetStarted
