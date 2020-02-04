/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import Helmet from 'react-helmet'
import Layout from 'components/layout'
import { MetaData } from 'components/common/meta'
import {
  Cncf,
  WhatIsOpenEBS,
  RecentUpdates,
  GetStarted,
  Features,
  WhyOpenEBS,
  Hero,
  CompaniesList,
  Workloads,
  EasyStart,
  Platforms,
} from 'views/home'

const IndexPage = ({ location }) => {
  return (
    <Layout location={location}>
      <MetaData location={location} />
      <Hero />
      <CompaniesList />
      <EasyStart />
      <WhatIsOpenEBS />
      <WhyOpenEBS />
      <Platforms />
      <Workloads />
      <RecentUpdates />
      <GetStarted location={location} />
      <Features />
      <Cncf />
    </Layout>
  )
}

export default IndexPage
