/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'

const Tags = ({ tags }) => {
  return (
    <>
      <div
        sx={{
          py: '3',
          display: ['grid', 'grid', 'block'],
          gridTemplateColumns: ['1fr 1fr', '1fr 1fr 1fr', 'none'],
          gridAutoRows: ['auto', 'auto', 'unset'],
        }}
      >
        {tags &&
          tags.map((tag, i) => {
            return (
              <Link
                key={tag.id}
                to={`/blog/tag/${tag.slug}`}
                sx={{ textDecoration: 'none', mr: '2', mb: '3' }}
              >
                <span
                  sx={{
                    p: '2',
                    backgroundColor: 'gray',
                    fontSize: '0',
                    color: 'gray400',
                    borderRadius: '4px',
                  }}
                >
                  {tag.name}
                </span>
              </Link>
            )
          })}
      </div>
    </>
  )
}

export default Tags
