import React from 'react'
import { Link } from 'gatsby'
import Layout from 'components/layout'
import { PrivacyPolicy } from 'views/privacy-policy'
import { MetaData } from 'components/common/meta'
const PrivacyPolicyPage = ({ location }) => {
  return (
    <Layout location={location}>
      <MetaData location={location} />
      <PrivacyPolicy />
    </Layout>
  )
}

export default PrivacyPolicyPage
