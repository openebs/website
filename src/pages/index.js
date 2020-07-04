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
  GetSupport,
  Features,
  WhyOpenEBS,
  Hero,
  FoundingCompaniesList,
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
      <FoundingCompaniesList />
      <CompaniesList />
      <EasyStart />
      <WhatIsOpenEBS />
      <WhyOpenEBS />
      <Platforms />
      <Workloads />
      <GetSupport location={location} />
      <RecentUpdates />
      <Features />
      <Cncf />
    </Layout>
  )
}

export default IndexPage
