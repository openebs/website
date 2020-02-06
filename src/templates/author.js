/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import PostCard from 'components/post-card'
import Layout from 'components/layout'
import Pagination from 'components/pagination'
import { MetaData } from 'components/common/meta'
import { Box, Container, Grid } from '@theme-ui/components'
/**
 * Author page (/author/:slug)
 *
 * Loads all posts for the requested author incl. pagination.
 *
 */
const Author = ({ data, location, pageContext }) => {
  const author = data.ghostAuthor
  const posts = data.allGhostPost.edges
  const twitterUrl = author.twitter
    ? `https://twitter.com/${author.twitter.replace(/^@/, ``)}`
    : null
  const facebookUrl = author.facebook
    ? `https://www.facebook.com/${author.facebook.replace(/^\//, ``)}`
    : null

  return (
    <>
      <MetaData data={data} location={location} type="profile" />
      <Layout>
        <Container>
          <Box sx={{ maxWidth: '1048px', margin: 'auto', py: '3' }}>
            <div
              sx={{
                display: 'grid',
                gridGap: [0, 4],
                gridTemplateColumns: ['auto', '128px 1fr', '128px 1fr'],
                maxWidth: ['100%'],
                p: ['3', '0'],
              }}
            >
              <div>
                <div
                  sx={{
                    display: 'flex',
                    justifyContent: 'start',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  {author.profile_image && (
                    <img
                      src={author.profile_image}
                      alt={author.name}
                      sx={{
                        height: '120px',
                        width: '120px',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </div>
              </div>
              <div>
                <div>
                  <h1>{author.name}</h1>
                  {author.bio && <p>{author.bio}</p>}
                  <div sx={{ display: 'flex', ml: '1em' }}>
                    {author.website && (
                      <a
                        sx={{ display: 'block', padding: '2px 10px' }}
                        href={author.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                      </a>
                    )}
                    {twitterUrl && (
                      <a
                        sx={{ display: 'block', padding: '2px 10px' }}
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Twitter
                      </a>
                    )}
                    {facebookUrl && (
                      <a
                        sx={{ display: 'block', padding: '2px 10px' }}
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div sx={{ py: '3' }}>
              <hr />
            </div>
          </Box>
          <section
            sx={{ maxWidth: '1048px', margin: 'auto', pt: '3', pb: '3' }}
          >
            <Grid
              columns={[
                [1, '1fr'],
                [2, '1fr 1fr'],
                [3, '1fr 1fr 1fr'],
              ]}
              gap={4}
            >
              {posts.map(({ node }) => (
                // The tag below includes the markup for each post - components/common/PostCard.js
                <PostCard key={node.id} post={node} />
              ))}
            </Grid>
          </section>
          <Pagination pageContext={pageContext} />
        </Container>
      </Layout>
    </>
  )
}

Author.propTypes = {
  data: PropTypes.shape({
    ghostAuthor: PropTypes.shape({
      name: PropTypes.string.isRequired,
      cover_image: PropTypes.string,
      profile_image: PropTypes.string,
      website: PropTypes.string,
      bio: PropTypes.string,
      location: PropTypes.string,
      facebook: PropTypes.string,
      twitter: PropTypes.string,
    }),
    allGhostPost: PropTypes.object.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  pageContext: PropTypes.object,
}

export default Author

export const pageQuery = graphql`
  query GhostAuthorQuery($slug: String!, $limit: Int!, $skip: Int!) {
    ghostAuthor(slug: { eq: $slug }) {
      ...GhostAuthorFields
    }
    allGhostPost(
      sort: { order: DESC, fields: [published_at] }
      filter: { authors: { elemMatch: { slug: { eq: $slug } } } }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          ...GhostPostFields
        }
      }
    }
  }
`
