/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import Image from 'components/image'
import FileQuery from 'utils/file-query'
import { Container, Button } from '@theme-ui/components'
const Hero = () => {
  const whitepaper = FileQuery().allPdf.edges.find(
    (edge) => edge.node.name === 'openebs_1.3_whitepaper'
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
                  Kubernetes storage simplified
                </Styled.h1>
                <Styled.p sx={{ mb: '0' }}>
                  OpenEBS builds on Kubernetes to enable Stateful applications 
                   to easily access Dynamic Local PVs or Replicated PVs.
                  By using the Container Attached Storage pattern users report 
                  lower costs, easier management, and more control for their teams.
                </Styled.p>
                <Styled.p sx={{ fontWeight: '300' }}>
                  OpenEBS is a 100% Open Source CNCF project made with
                  <Image
                    src="heart.svg"
                    style={{ px: '2', height: '22px', mb: -1 }}
                  />{' '}
                  by MayaData & the community. Prominent users include Arista, 
                  Optoro, Orange, Comcast and the CNCF itself.
                </Styled.p>
                <div
                  sx={{
                    display: ['block', 'block', 'inline-block'],
                    margin: ['auto', 'auto', '0px'],
                    py: '4',
                  }}
                >
                  <Link
                    to="/get-started"
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
                      Get Started
                    </Button>
                  </Link>
                  <span sx={{ display: ['none', 'none', 'inline-block'] }}>
                    or{' '}
                  </span>
                  <a
                    href="https://github.com/openebs/openebs/blob/master/ADOPTERS.md"
                    target="_blank"
                    rel="nofollow noreferrer"
                    id="adopter_gtm"
                    sx={{
                      ml: ['0', '4', '4', '3'],
                      mt: ['3', '3', '0px'],
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      color: '#F26D00',
                      display: ['block', 'inline-block', 'inline-block'],
                    }}
                  >
                    Read the Adopter stories.
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
