import React from 'react'
import { Link } from 'gatsby'
import Layout from 'components/layout'
import { Faq } from 'views/faq'
import { MetaData } from 'components/common/meta'
const FaqPage = ({ location }) => {
  return (
    <Layout location={location}>
      <MetaData location={location} />
      <Faq />
    </Layout>
  )
}

export default FaqPage
