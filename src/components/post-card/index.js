/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import { readingTime as readingTimeHelper } from '@tryghost/helpers'
import { Card } from '@theme-ui/components'
import { getTruncatedExcerpt } from 'utils/getTruncatedExcerpt'
const PostCard = ({ post }) => {
  const url = `/blog/${post.slug}/`
  const readingTime = readingTimeHelper(post)
  return (
    <Card
      sx={{
        maxWidth: '328px',
        display: 'flex',
        flexDirection: 'column',
        my: ['auto', '0', '0'],
        mx: ['auto'],
        p: '0',
      }}
    >
      <Link to={url} className="post-card" sx={{ textDecoration: 'none' }}>
        <header className="post-card-header">
          {post.feature_image && (
            <img
              src={post.feature_image}
              sx={{
                width: '100%',
                maxHeight: '240px',
                height: '100%',
                objectFit: 'cover',
                borderTopRightRadius: '4px',
                borderTopLeftRadius: '4px',
              }}
            />
          )}
          {post.primary_tag && (
            <div
              sx={{
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: 'bluesky',
                pt: '2',
                fontSize: '0',
                px: '3',
              }}
            >
              <span
                sx={{
                  textTransform: 'uppercase',
                  color: 'bluesky',
                  fontSize: '0',
                  textDecoration: 'none',
                }}
              >
                {post.primary_tag.name}
              </span>
            </div>
          )}
          {/*{post.featured && <span sx={{ px: '3' }}>Featured</span>}*/}
          <Styled.h4
            sx={{
              my: '2',
              px: '3',
              fontSize: ['3', '3', '3'],
              fontWeight: '400',
            }}
          >
            {post.title}
          </Styled.h4>
        </header>
      </Link>
      <Link
        to={url}
        className="post-card"
        sx={{ textDecoration: 'none', px: '3', pt: '2' }}
      >
        <section>
          <Styled.p sx={{ m: '0', fontSize: [2, 2, 2], fontWeight: '300' }}>
            {`${getTruncatedExcerpt(post.excerpt)}...`}
          </Styled.p>
        </section>
      </Link>
      <footer sx={{ display: 'flex', pt: '3', marginTop: 'auto', p: '3' }}>
        <div sx={{ display: 'inline-flex' }}>
          {post.primary_author.profile_image ? (
            <img
              className="author-profile-image"
              src={post.primary_author.profile_image}
              alt={post.primary_author.name}
              sx={{ height: '40px', width: '40px', borderRadius: '50%' }}
            />
          ) : (
            <img
              className="default-avatar"
              src="/images/icons/avatar.svg"
              alt={post.primary_author.name}
            />
          )}
          <Link
            sx={{
              my: 'auto',
              color: 'black',
              textDecoration: 'none',
              ':hover': {
                textDecoration: 'underline',
              },
            }}
            to={`/blog/author/${post.primary_author.slug}`}
          >
            <span
              sx={{
                my: 'auto',
                ml: '3',
                textTransform: 'uppercase',
                fontSize: '0',
              }}
            >
              {post.primary_author.name}
            </span>
          </Link>
        </div>
        <div sx={{ display: 'flex', ml: 'auto', my: 'auto' }}>
          <div sx={{ fontSize: '0' }}>{readingTime}</div>
        </div>
      </footer>
    </Card>
  )
}

PostCard.propTypes = {
  post: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    feature_image: PropTypes.string,
    featured: PropTypes.bool,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
      })
    ),
    excerpt: PropTypes.string.isRequired,
    primary_author: PropTypes.shape({
      name: PropTypes.string.isRequired,
      profile_image: PropTypes.string,
    }).isRequired,
  }).isRequired,
}

export default PostCard
