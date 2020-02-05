/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Container } from '@theme-ui/components'
import SingleCard from 'components/single-card'
import { motion } from 'framer-motion'
const Faq = () => {
  const getStartedCTAs = [
    {
      src: `get-started/community.png`,
      url: `/community`,
      text: `Join Our Slack Community`,
    },
    {
      src: `get-started/git.png`,
      url: `https://github.com/openebs/openebs`,
      text: `The Code Is Here`,
    },
    {
      src: `get-started/docs.png`,
      url: `https://docs.openebs.io`,
      text: `OpenEBS Documentation`,
    },
  ]

  const nextStepsCTAs = [
    {
      src: `get-started/architecture.png`,
      url: `https://docs.openebs.io/docs/next/architecture.html`,
      text: `Look at the architecture`,
    },
    {
      src: `get-started/monitoring.png`,
      url: `https://mayadata.io`,
      text: `Unlock the Additional Features and Free Monitoring for OpenEBS`,
    },
  ]

  return (
    <>
      <div sx={{ py: ['4', '4', '5'] }}>
        <Container sx={{ maxWidth: '998px' }}>
          <Styled.h3 sx={{ textAlign: ['center', 'left'] }}>
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
            {getStartedCTAs &&
              getStartedCTAs.map((cta) => {
                return (
                  <motion.div
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    key={`cta-${cta.text}`}
                    sx={{ display: 'flex', alignItems: 'stretch' }}
                  >
                    <SingleCard src={cta.src} url={cta.url} text={cta.text} />
                  </motion.div>
                )
              })}
          </div>
          <Styled.h3 sx={{ pt: '4', textAlign: ['center', 'left'] }}>
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
            {nextStepsCTAs &&
              nextStepsCTAs.map((cta) => {
                return (
                  <motion.div
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    key={`cta-${cta.text}`}
                    sx={{ display: 'flex', alignItems: 'stretch' }}
                  >
                    <SingleCard src={cta.src} url={cta.url} text={cta.text} />
                  </motion.div>
                )
              })}
          </div>
        </Container>
      </div>
    </>
  )
}

export default Faq
