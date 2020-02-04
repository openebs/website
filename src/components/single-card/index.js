/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Card } from '@theme-ui/components'
import { ChevronRight } from 'react-feather'
import Image from 'components/image'
const SingleCard = ({ src, url, text }) => {
  if (url === 'https://github.com/openebs/openebs') {
    return (
      <Card
        sx={{
          maxWidth: '300px',
          p: '0',
          mx: 'auto',
          width: '100%',
        }}
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Image src={src} style={{ maxWidth: '100%' }} />
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          <div sx={{ py: '4', px: '4' }}>
            <Styled.p>{text}</Styled.p>
          </div>
        </a>
      </Card>
    )
  } else {
    return (
      <Card
        sx={{
          maxWidth: '300px',
          p: '0',
          mx: 'auto',
          width: '100%',
        }}
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Image src={src} style={{ maxWidth: '100%' }} />
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          <div sx={{ py: '4', px: '4' }}>
            <Styled.p>{text}</Styled.p>
          </div>
        </a>
      </Card>
    )
  }
}

export default SingleCard
