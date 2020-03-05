/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import Image from 'components/image'
import FileQuery from 'utils/file-query'
import { Container, Button } from '@theme-ui/components'
const Hero = () => {
  const whitepaper = FileQuery().allPdf.edges.find(
    (edge) => edge.node.name === 'openebs_1_4_whitepaper'
  )
  return (
    <>
      <div sx={{ py: ['4', '4', '5'], backgroundColor: 'background' }}>
        <Container>
          <div
            sx={{
              display: 'grid',
              gridGap: 1,
              gridTemplateColumns: ['auto', '1fr', '1fr 1fr'],
            }}
          >
            <div>
              <div
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: ['center', 'start', 'start'],
                  flexDirection: 'column',
                  height: '100%',
                  textAlign: ['center', 'center', 'left', 'left'],
                  maxWidth: ['100%', '100%', '500px'],
                }}
              >
                <Styled.h1 sx={{ m: 0 }}>
                  We make Kubernetes storage simple
                </Styled.h1>
                <Styled.p sx={{ mb: '0' }}>
                  We're an Open Source abstraction layer between your
                  applications and any local, network or cloud storage. Reduce
                  maintenance, lower storage costs, and simplify administration
                  with OpenEBS.
                </Styled.p>
                <Styled.p sx={{ fontWeight: '300' }}>
                  OpenEBS is a 100% Open Source CNCF project made with
                  <Image
                    src="heart.svg"
                    style={{ px: '2', height: '22px', mb: -1 }}
                  />{' '}
                  by MayaData & the community.
                </Styled.p>
                <div
                  sx={{
                    display: ['block', 'block', 'inline-block'],
                    margin: ['auto', 'auto', '0px'],
                    py: '4',
                  }}
                >
                  <a
                    href="https://github.com/openebs/openebs"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      mr: '3',
                      display: ['block', 'inline-block', 'inline-block'],
                    }}
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      sx={{ px: '40px', py: '15px' }}
                    >
                      Get it on GitHub
                    </Button>
                  </a>
                  <span sx={{ display: ['none', 'none', 'inline-block'] }}>
                    or{' '}
                  </span>
                  <a
                    href={whitepaper.node.publicURL}
                    target="_blank"
                    rel="nofollow noreferrer"
                    id="whitepaper_gtm"
                    sx={{
                      ml: ['0', '4', '4', '3'],
                      mt: ['3', '3', '0px'],
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      color: '#F26D00',
                      display: ['block', 'inline-block', 'inline-block'],
                    }}
                  >
                    Read the Whitepaper
                  </a>
                </div>
              </div>
            </div>
            <div>
              <div
                sx={{
                  maxWidth: ['100%', '75%', '100%'],
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 'auto',
                  height: '100%',
                }}
              >
                <Image src="dev.svg" style={{ maxWidth: '75%' }} />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}
export default Hero
