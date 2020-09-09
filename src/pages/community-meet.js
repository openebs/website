/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import Layout from 'components/layout'
import { CommunityMeet } from '../views/community-meet'
import { MetaData } from 'components/common/meta'
const CommunityMeetPage = ({ location }) => {
  return (
    <Layout location={location}>
      <MetaData location={location} />
      <CommunityMeet />
    </Layout>
  )
}

export default CommunityMeetPage
