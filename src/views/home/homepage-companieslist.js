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
    },
    {
      name: 'Orange',
      src: 'companies/orange.svg',
      dir: 'companies',
    },
    {
      name: 'Arista',
      src: 'companies/arista.svg',
      dir: 'companies',
    },
    {
      name: 'CNCF',
      src: 'companies/cncf.svg',
      dir: 'companies',
    },
    {
      name: 'Comcast',
      src: 'companies/comcast.svg',
      dir: 'companies',
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
                <Styled.h3
                  sx={{
                    fontFamily: "'BWHaasGrotesk-95Black-Web'",
                  }}
                >
                  Bloomberg
                </Styled.h3>
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
                    <Image
                      src={company.src}
                      style={{
                        maxWidth: '100%',
                        width: ['80px', '85px', '90px'],
                        filter: 'grayscale(90%)',
                        height: '100%',
                      }}
                    />
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
