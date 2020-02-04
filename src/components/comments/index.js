import React from 'react'
import { Disqus, CommentCount } from 'gatsby-plugin-disqus'

const Comments = ({ url, identifier, title }) => {
  const disqusConfig = {
    url,
    identifier,
    title,
  }
  return <Disqus config={disqusConfig} />
}

export default Comments
