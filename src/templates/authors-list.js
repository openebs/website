/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { graphql } from 'gatsby'
import PostCard from 'components/post-card'
import Layout from 'components/layout'
import Pagination from 'components/pagination'
import { MetaData } from 'components/common/meta'
import AuthorCard from 'components/author-card'
import { Grid, Container } from '@theme-ui/components'
import TagsList from 'components/tags-list'
/**
 * Author page (/author/:slug)
 *
 * Loads all posts for the requested author incl. pagination.
 *
 */
const AuthorsList = ({ data, location, pageContext }) => {
  const authors = data.allGhostAuthor.edges
  return (
    <>
      <MetaData data={data} location={location} type="profile" />
      <Layout>
        <Container sx={{ pb: '5' }}>
          <div
            sx={{
              maxWidth: '1048px',
              margin: 'auto',
              py: '3',
            }}
          >
            <div sx={{ pb: '4' }}>
              <TagsList />
            </div>
            <hr sx={{ mb: '3' }} />
            <div sx={{ maxWidth: `1048px` }}>
              <Styled.h3 sx={{ pb: '4', textAlign: ['center', 'left'] }}>
                Authors
              </Styled.h3>
              <div
                sx={{
                  display: 'grid',
                  gridGap: 4,
                  gridTemplateColumns: [
                    'auto',
                    'minmax(256px, 1fr) minmax(256px, 1fr)',
                    'minmax(256px, 1fr) minmax(256px, 1fr) minmax(256px, 1fr)',
                  ],
                }}
              >
                {authors.map((author) => (
                  <AuthorCard author={author.node} key={author.node.id} />
                ))}
              </div>
            </div>
            <Pagination pageContext={pageContext} />
          </div>
        </Container>
      </Layout>
    </>
  )
}

export default AuthorsList

export const pageQuery = graphql`
  query GhostAuthorsListQuery {
    allGhostAuthor {
      edges {
        node {
          bio
          cover_image
          facebook
          ghostId
          id
          location
          meta_description
          meta_title
          name
          postCount
          profile_image
          slug
          twitter
          url
          website
        }
      }
    }
  }
`
