/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import Layout from 'components/layout'
import { Support, SlackCard } from 'views/support'
import { MetaData } from 'components/common/meta'
const CommunityPage = ({ location }) => {
  return (
    <Layout location={location}>
      <MetaData location={location} />
      <Support />
    </Layout>
  )
}

export default SupportPage
