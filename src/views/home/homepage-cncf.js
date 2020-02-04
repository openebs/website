/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import { Container, Button } from '@theme-ui/components'
import Image from 'components/image'
import Img from 'gatsby-image'

const Cncf = () => {
  return (
    <>
      <div sx={{ py: ['4', '4', '5'], textAlign: 'center' }}>
        <Container sx={{ maxWidth: '778px' }}>
          <div
            sx={{
              display: 'grid',
              gridGap: 4,
              gridTemplateColumns: ['auto', '1fr', '1fr 1fr'],
              p: ['4', '3', '0px'],
            }}
          >
            <div>
              <Image src="cncf-sandbox.svg" style={{ maxWidth: ['320px'] }} />
            </div>
            <div>
              <div
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  maxWidth: 450,
                  margin: 'auto',
                  height: '100%',
                }}
              >
                <Styled.h3>OpenEBS is a proud member of the CNCF</Styled.h3>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}

export default Cncf
