/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import { Tags } from '@tryghost/helpers-gatsby'
import { readingTime as readingTimeHelper } from '@tryghost/helpers'
import { Card, Button, Image, Text } from '@theme-ui/components'
const AuthorCard = ({ author }) => {
  return (
    <>
      <Card
        sx={{
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          mx: 'auto',
          p: 0,
        }}
      >
        <Link to={`blog/author/${author.slug}`}>
          <Image src={author.profile_image} alt={author.name} />
        </Link>
        <Link to={`blog/author/${author.slug}`} sx={{ textDecoration: 'none' }}>
          <div
            sx={{
              p: '3',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Styled.p
              sx={{
                textTransform: 'uppercase',
                fontSize: '1',
                color: 'bluesky',
                pt: '3',
              }}
            >
              {author.name}
            </Styled.p>
            <Styled.p sx={{ pt: '2', pb: '3' }}>{author.bio}</Styled.p>
          </div>
        </Link>
      </Card>
    </>
  )
}

export default AuthorCard
