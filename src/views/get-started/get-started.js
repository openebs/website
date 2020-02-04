/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Container } from '@theme-ui/components'
import SingleCard from 'components/single-card'
const Faq = () => {
  return (
    <>
      <div sx={{ py: ['4', '4', '5'] }}>
        <Container sx={{ maxWidth: '998px' }}>
          <Styled.h3 sx={{ fontWeight: '500', textAlign: ['center', 'left'] }}>
            Get started with OpenEBS
          </Styled.h3>
          <div
            sx={{
              display: 'grid',
              gridGap: 4,
              gridTemplateColumns: ['auto', '1fr 1fr', '1fr 1fr 1fr'],
              pt: '4',
              px: ['4', '3', '0'],
            }}
          >
            <SingleCard
              src="get-started/community.png"
              url="/community"
              text="Join Our Slack Community"
            />
            <SingleCard
              src="get-started/git.png"
              url="https://github.com/openebs/openebs"
              text="The Code Is Here"
            />
            <SingleCard
              src="get-started/docs.png"
              url="https://docs.openebs.io"
              text="OpenEBS Documentation"
            />
          </div>
          <Styled.h3
            sx={{ pt: '4', fontWeight: '500', textAlign: ['center', 'left'] }}
          >
            Okay, its running. Now what?
          </Styled.h3>
          <div
            sx={{
              display: 'grid',
              gridGap: 4,
              gridTemplateColumns: ['auto', '1fr 1fr', '1fr 1fr 1fr'],
              pt: '4',
              px: ['4', '3', '0'],
            }}
          >
            <SingleCard
              src="get-started/architecture.png"
              url="https://docs.openebs.io/docs/next/architecture.html"
              text="Look at the architecture"
            />
            <SingleCard
              src="get-started/monitoring.png"
              url="https://mayadata.io"
              text="Unlock the Additional Features and Free Monitoring for OpenEBS"
            />
          </div>
        </Container>
      </div>
    </>
  )
}

export default Faq
