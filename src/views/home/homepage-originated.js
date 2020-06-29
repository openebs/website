/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import Image from 'components/image'
import { Container, Button } from '@theme-ui/components'
import { motion } from 'framer-motion'

const FoundingCompaniesList = () => {
  const foundingcompanies = [
    {
      name: 'MayaData',
      src: 'mayadata-logo.svg',
      url: 'https://mayadata.io',
    },
  ]

  return (
    <>
      <div sx={{ py: ['4', '4', '5'] }}>
        <Container>
          <Styled.h2 sx={{ textAlign: 'center', pb: ['3', '3', '4'] }}>
            Originally Created By
          </Styled.h2>
          <div
            sx={{
              display: 'grid',
              gridGap: 3,
              gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
            }}
          >
            {foundingcompanies.map((company) => {
              return (
                <div
                  sx={{
                    py: 2,
                    px: [3, 3, 4],
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  key={`foundingcompanies-${company.name}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <a href={company.url} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={company.src}
                      style={{
                        maxWidth: '100%',
                        width: ['180px', '190px', '200px'],
                        filter: 'grayscale(90%)',
                        height: '100%',
                      }}
                    />
                    </a>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </Container>
      </div>
    </>
  )
}
export default FoundingCompaniesList
