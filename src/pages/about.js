import React from 'react'
import { Link } from 'gatsby'
import Layout from 'components/layout'
import { About } from 'views/about'
import { Container } from '@theme-ui/components'
import { MetaData } from 'components/common/meta'
const AboutPage = ({ location }) => {
  return (
    <Layout location={location}>
      <MetaData location={location} />
      <About />
    </Layout>
  )
}

export default AboutPage
