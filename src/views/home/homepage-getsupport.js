/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import { Container, Button } from '@theme-ui/components'
const GetSupport = ({ location }) => {
  return (
    <>
      <Styled.div sx={{ bg: 'primary', py: ['4', '4', '5'] }}>
        <Container>
          <Styled.div sx={{ textAlign: 'center' }}>
            <Styled.h2 sx={{ pb: '3', color: 'white' }}>Get Support</Styled.h2>
            <Styled.h4 sx={{ pb: '4', color: 'white' }}>
              Need help in getting OpenEBS up and running? Get support when you
              need it by visiting our support center!
            </Styled.h4>
            <Link
              to="/support"
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
                Get Support
              </Button>
            </Link>
          </Styled.div>
        </Container>
      </Styled.div>
    </>
  )
}

export default GetSupport
