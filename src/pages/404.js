/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import Layout from 'components/layout'

const NotFoundPage = () => (
  <Layout>
    <div className="container">
      <article className="content" sx={{ textAlign: `center`, py: '7' }}>
        <h1 className="content-title">Error 404</h1>
        <section className="content-body">
          Page not found, <Link to="/">return home</Link> to start over
        </section>
      </article>
    </div>
  </Layout>
)

export default NotFoundPage
