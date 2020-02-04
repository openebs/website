import React from 'react'
import { Link } from 'gatsby'
import Layout from 'components/layout'
import { GetStarted } from 'views/get-started'
import { MetaData } from 'components/common/meta'
const GetStartedPage = ({ location }) => {
  return (
    <Layout location={location}>
      <MetaData location={location} />
      <GetStarted />
    </Layout>
  )
}

export default GetStartedPage
