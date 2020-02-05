/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import Prism from '@theme-ui/prism'
export default {
  h1: (props) => (
    <h1 {...props} sx={{ fontSize: ['4', '4', '5'], fontWeight: '300' }}>
      {props.children}
    </h1>
  ),
  h3: (props) => <h3 {...props}>{props.children}</h3>,
  p: (props) => (
    <p {...props} sx={{ fontSize: [2, 2] }}>
      {props.children}
    </p>
  ),
  pre: (props) => props.children,
  code: Prism,
  img: (props) => (
    <img {...props} style={{ maxWidth: '200px', width: '100%' }} />
  ),
}
