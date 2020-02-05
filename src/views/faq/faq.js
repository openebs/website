/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Container } from '@theme-ui/components'
import AccordionCard from 'components/accordion-card'
import { Link, StaticQuery, graphql } from 'gatsby'
const FaqComponent = ({ data }) => {
  return (
    <>
      <Container sx={{ py: ['4', '4', '5'] }}>
        <Styled.h3>Frequently Asked Questions (FAQs)</Styled.h3>
        {data.map((edge) => {
          return <AccordionCard data={edge.node} />
        })}
      </Container>
    </>
  )
}
const Faq = () => (
  <StaticQuery
    query={graphql`
      query FaqQuery {
        allMdx {
          edges {
            node {
              frontmatter {
                queryNum
                query
              }
              body
            }
          }
        }
      }
    `}
    render={(data) => {
      const { edges } = data.allMdx

      const faqData = edges.filter(
        (edge) =>
          edge.node.frontmatter.queryNum !== null &&
          edge.node.frontmatter.query !== null
      )
      return <FaqComponent data={faqData} />
    }}
  />
)

export default Faq
