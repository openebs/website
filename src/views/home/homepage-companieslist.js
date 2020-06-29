/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import Image from 'components/image'
import { Container, Button } from '@theme-ui/components'
import { motion } from 'framer-motion'

const CompaniesList = () => {
  const companies = [
    {
      name: 'Optoro',
      src: 'companies/optoro.svg',
      dir: 'companies',
      url: 'https://github.com/openebs/openebs/blob/master/adopters/optoro/README.md',
    },
    {
      name: 'Orange',
      src: 'companies/orange.svg',
      dir: 'companies',
      url: 'https://github.com/openebs/openebs/blob/master/adopters/orange/README.md',
    },
    {
      name: 'Arista',
      src: 'companies/arista.svg',
      dir: 'companies',
      url: 'https://github.com/openebs/openebs/blob/master/adopters/arista/README.md',
    },
    {
      name: 'CNCF',
      src: 'companies/cncf.svg',
      dir: 'companies',
      url: 'https://github.com/openebs/openebs/blob/master/adopters/cncf/README.md',
    },
    {
      name: 'Comcast',
      src: 'companies/comcast.svg',
      dir: 'companies',
      url: 'https://github.com/openebs/openebs/blob/master/adopters/comcast/README.md',
    },
  ]

  return (
    <>
      <div sx={{ py: ['4', '4', '5'] }}>
        <Container>
          <Styled.h2 sx={{ textAlign: 'center', pb: ['3', '3', '4'] }}>
            Used in production by
          </Styled.h2>
          <div
            sx={{
              display: 'grid',
              gridGap: 3,
              gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
            }}
          >
            <div
              sx={{
                py: 2,
                px: [5, 5, 4],
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.8 }}
              >
                <Styled.h3 style={{ fontWeight: '800' }}>Bloomberg</Styled.h3>
              </motion.div>
            </div>
            {companies.map((company) => {
              return (
                <div
                  sx={{
                    py: 2,
                    px: [3, 3, 4],
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  key={`companies-${company.name}`}
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
                        width: ['80px', '85px', '90px'],
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
export default CompaniesList
