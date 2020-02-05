/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import ImageQuery from 'utils/image-query'
import Image from 'components/image'
import { Container, Button } from '@theme-ui/components'
import Img from 'gatsby-image'
import { motion } from 'framer-motion'
const Platforms = () => {
  const Images = ImageQuery().allImages.edges.filter((edge) => {
    return edge.node.relativeDirectory === 'platforms'
  })

  return (
    <>
      <div
        sx={{
          pb: ['4', '4', '5'],
          pt: ['2', '2', '3'],
          backgroundColor: 'white',
          textAlign: 'center',
        }}
      >
        <Container>
          <Styled.h2 sx={{ textAlign: 'center', pb: ['4', '4', '5'] }}>
            OpenEBS runs on any Kubernetes platform such as
          </Styled.h2>
          <div
            sx={{
              display: 'grid',
              gridGap: [2, 3, 4],
              gridTemplateColumns: [
                '1fr 1fr',
                '1fr 1fr 1fr 1fr',
                '1fr 1fr 1fr 1fr 1fr 1fr',
              ],
              px: ['auto', '4', '4', '6'],
            }}
          >
            {Images.map((edge) => {
              return (
                <motion.div
                  style={{ filter: 'grayscale(100%)' }}
                  whileHover={{ scale: 1.15, filter: 'grayscale(0%)' }}
                  whileTap={{ scale: 0.8 }}
                >
                  <Img
                    fluid={edge.node.childImageSharp.fluid}
                    sx={{
                      maxWidth: '80px',
                      mx: '2',
                      display: 'inline-block',
                      height: '80px',
                      width: '80px',
                    }}
                  />
                </motion.div>
              )
            })}
          </div>
        </Container>
      </div>
    </>
  )
}

export default Platforms
