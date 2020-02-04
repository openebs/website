/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React, { useState } from 'react'
import { Box } from '@theme-ui/components'
import { ChevronRight } from 'react-feather'
import { MDXRenderer } from 'gatsby-plugin-mdx'
const DropdownCard = ({ data }) => {
  const toggleDisplay = () => {
    setToggle(!toggle)
  }
  const [toggle, setToggle] = useState(false)
  return (
    <div sx={{ my: '4' }}>
      <Box
        py={3}
        px={[3, 3, 4]}
        color="white"
        bg="primary"
        sx={{ display: 'flex' }}
        onClick={toggleDisplay}
      >
        <div sx={{ display: 'flex' }}>{data.frontmatter.query}</div>
        <div
          sx={{
            ml: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ChevronRight
            sx={{
              transform: `${
                toggle === true ? 'rotate(90deg)' : 'rotate(0deg)'
              }`,
              transition: 'all 0.5s ease-in-out',
            }}
          />
        </div>
      </Box>
      <Box
        p={4}
        color="primary"
        bg="background"
        sx={{
          display: `${toggle === true ? 'block' : 'none'}`,
          opacity: `${toggle === true ? 1 : 0}`,
          transition: 'opacity 0.5s ease-in-out',
          overflow: 'auto',
        }}
      >
        <MDXRenderer>{data.body}</MDXRenderer>
      </Box>
    </div>
  )
}

export default DropdownCard
