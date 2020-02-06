/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import PropTypes from 'prop-types'
import { graphql, Link } from 'gatsby'
import Helmet from 'react-helmet'
import Layout from 'components/layout'
import { MetaData } from 'components/common/meta'
import { Container, Divider } from '@theme-ui/components'
import Comments from 'components/comments'
import Tags from 'components/tags'
import Author from 'components/author-short-bio'
import { siteUrl } from 'config/siteConfig'
import {
  Facebook,
  Twitter,
  GitHub,
  Linkedin,
  Slack,
  Youtube,
} from 'react-feather'

const Post = ({ data, location }) => {
  const post = data.ghostPost
  return (
    post && (
      <>
        <MetaData data={data} location={location} type="article" />
        <Helmet>
          <style type="text/css">{`${post.codeinjection_styles}`}</style>
        </Helmet>
        <Layout>
          <Container>
            <article
              className="content"
              sx={{ maxWidth: '800px', m: 'auto', pt: '3', pb: '5' }}
            >
              <section className="post-full-content">
                {post.primary_tag && (
                  <Link
                    to={`/blog/tag/${post.primary_tag.slug}`}
                    sx={{ textDecoration: 'none', color: 'blue' }}
                  >
                    <span
                      sx={{
                        textTransform: 'uppercase',
                        fontSize: '0',
                      }}
                    >
                      {post.primary_tag.name}
                    </span>
                  </Link>
                )}
                {post.title && (
                  <Styled.h1
                    sx={{
                      fontWeight: ['600', '500', '500'],
                      pt: '2',
                      pb: '2',
                      lineHeight: '1.25',
                      fontSize: [4, 5, 6],
                    }}
                  >
                    {post.title}
                  </Styled.h1>
                )}
                <Divider sx={{ mb: '4' }} />
              </section>
              {post.primary_author && (
                <div sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div sx={{ display: 'inline-flex' }}>
                    <Link to={`/blog/author/${post.primary_author.slug}`}>
                      <div>
                        <img
                          src={post.primary_author.profile_image}
                          sx={{
                            height: '48px',
                            width: '48px',
                            borderRadius: '50%',
                          }}
                        />
                      </div>
                    </Link>
                    <div sx={{ ml: '3', textTransform: 'uppercase' }}>
                      <div sx={{ display: 'block' }}>
                        <Link
                          to={`/blog/author/${post.primary_author.slug}`}
                          sx={{ textDecoration: 'none', color: 'black' }}
                        >
                          <span
                            sx={{
                              display: 'block',
                              fontSize: '1',
                            }}
                          >
                            {post.primary_author.name}
                          </span>
                        </Link>
                      </div>
                      <span sx={{ mr: '2', fontSize: '0', color: 'darkGray' }}>
                        {post.published_at_pretty}
                      </span>
                      <span sx={{ color: 'darkGray' }}>{'.'}</span>
                      <span
                        sx={{ ml: '2', fontSize: '0', color: 'darkGray' }}
                      >{`${post.reading_time} ${
                        post.reading_time < 2 ? 'min' : 'mins'
                      } read`}</span>
                    </div>
                  </div>
                  <div sx={{ display: 'inline-flex' }}>
                    <a
                      href={`https://twitter.com/intent/tweet?original_referer=${siteUrl}/blog/${post.slug}&text=${post.title}&url=${siteUrl}/blog/${post.slug}`}
                      target="_blank"
                      sx={{ mr: '3' }}
                    >
                      <Twitter size={20} color={'#0063FF'} />
                    </a>
                    <a
                      href={`http://www.facebook.com/sharer.php?u=${siteUrl}/blog/${post.slug}`}
                      target="_blank"
                      sx={{ mr: '3' }}
                    >
                      <Facebook size={20} color={'#0063FF'} />
                    </a>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${siteUrl}/blog/${post.slug}&title=${post.title}`}
                      target="_blank"
                    >
                      <Linkedin size={20} color={'#0063FF'} />
                    </a>
                  </div>
                </div>
              )}

              {post.feature_image && (
                <figure
                  sx={{
                    m: '0px',
                    pt: '4',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={post.feature_image}
                    alt={post.title}
                    sx={{ maxWidth: '100%' }}
                  />
                </figure>
              )}
              {/* The main post content */}
              <section
                sx={{
                  img: {
                    maxWidth: '100%',
                  },
                  py: '4',
                }}
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.html }}
              />

              {/* Tags Section */}
              {post.tags && <Tags tags={post.tags} />}

              <hr sx={{ borderColor: 'gray', borderWidth: '0.5px' }} />

              {/* About Author */}
              {post.primary_author && <Author author={post.primary_author} />}

              <hr sx={{ borderColor: 'gray', borderWidth: '0.5px', mb: '4' }} />

              {/* Disqus comments*/}
              {post.title && post.id && post.slug && (
                <Comments
                  title={post.title}
                  identifier={post.id}
                  url={`${siteUrl}/blog/${post.slug}`}
                />
              )}
            </article>
          </Container>
        </Layout>
      </>
    )
  )
}

Post.propTypes = {
  data: PropTypes.shape({
    ghostPost: PropTypes.shape({
      codeinjection_styles: PropTypes.object,
      title: PropTypes.string.isRequired,
      html: PropTypes.string.isRequired,
      feature_image: PropTypes.string,
    }).isRequired,
  }).isRequired,
  location: PropTypes.object.isRequired,
}

export default Post

export const postQuery = graphql`
  query($slug: String!) {
    ghostPost(slug: { eq: $slug }) {
      ...GhostPostFields
    }
  }
`
