/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'

const Author = ({ author }) => {
  const authorUrl = `/blog/author/${author.slug}`
  return (
    <div sx={{ py: '4', display: 'flex' }}>
      <div sx={{ mr: '3' }}>
        <Link to={authorUrl} sx={{ textDecoration: 'none' }}>
          <img
            src={author.profile_image}
            alt={author.name}
            sx={{ height: '80px', width: '80px', borderRadius: '50%' }}
          />
        </Link>
      </div>
      <div>
        <span
          sx={{
            fontWeight: '400',
            textTransform: 'uppercase',
            fontSize: '0',
            color: 'gray400',
          }}
        >
          Written By
        </span>
        <div sx={{ pb: '2' }}>
          <Link to={authorUrl} sx={{ textDecoration: 'none' }}>
            <Styled.h4 sx={{ fontWeight: '500' }}>{author.name}</Styled.h4>
          </Link>
        </div>
        <div>
          <span sx={{ fontWeight: '300' }}>{author.bio}</span>
        </div>
      </div>
    </div>
  )
}

export default Author
