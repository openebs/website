/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import Layout from 'components/layout'
import { Subscribe } from 'views/subscribe'
import { MetaData } from 'components/common/meta'
const SubscribePage = ({ location }) => {
  return (
    <Layout location={location}>
      <MetaData location={location} />
      <Subscribe />
    </Layout>
  )
}

export default SubscribePage
