/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import Layout from 'components/layout'
import { Community, SlackCard } from 'views/community'
import { MetaData } from 'components/common/meta'
const CommunityPage = ({ location }) => {
  return (
    <Layout location={location}>
      <MetaData location={location} />
      <SlackCard />
      <Community />
    </Layout>
  )
}

export default CommunityPage
