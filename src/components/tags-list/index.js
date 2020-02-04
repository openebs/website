/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import { Link, StaticQuery, graphql } from 'gatsby'

const Tags = ({ data }) => {
  const tags = data.allGhostPost.nodes
  const primaryTags = tags.map((tag) => tag.primary_tag)
  const uniqueArray = (a) =>
    [...new Set(a.map((o) => JSON.stringify(o)))].map((s) => JSON.parse(s))
  const nameAndSlugPrimaryTags = primaryTags.map(({ name, slug }) => ({
    name,
    slug,
  }))
  const uniquePrimaryTags = uniqueArray(nameAndSlugPrimaryTags)

  return (
    <>
      <div
        sx={{
          display: ['flex'],
          justifyContent: 'center',
          alignItems: 'center',
          m: 'auto',
          px: 4,
          maxWidth: '800px',
        }}
      >
        <ul
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            m: '0',
            p: '0',
          }}
        >
          {uniquePrimaryTags.map((tag) => {
            return (
              <li sx={{ listStyleType: 'none' }}>
                <Link
                  to={`/blog/tag/${tag.slug}`}
                  sx={{
                    fontSize: [2, 2, '18px'],
                    textDecoration: 'none',
                    ml: 3,
                    fontWeight: '300',
                  }}
                  activeStyle={{
                    color: '#F26D00',
                    paddingBottom: '3px',
                    marginBottom: '-3px',
                    borderBottom: '1px solid #f26d00',
                  }}
                  key={`edge-${tag.slug}`}
                >
                  {tag.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

const TagsList = () => (
  <StaticQuery
    query={graphql`
      query listOfGhostTagsTest {
        allGhostPost(sort: { order: ASC, fields: primary_tag___name }) {
          nodes {
            primary_tag {
              description
              feature_image
              meta_title
              name
              postCount
              slug
              url
              visibility
              meta_description
              id
            }
          }
        }
      }
    `}
    render={(data) => <Tags data={data} />}
  />
)

export default TagsList
