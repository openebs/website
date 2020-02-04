/** @jsx jsx */
import { jsx } from 'theme-ui'
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import { ChevronLeft, ChevronRight } from 'react-feather'
const Pagination = ({ pageContext }) => {
  const {
    previousPagePath,
    nextPagePath,
    humanPageNumber,
    numberOfPages,
  } = pageContext

  return (
    <nav
      sx={{
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
        margin: 'auto',
        pt: '4',
        pb: '5',
        maxWidth: '364px',
      }}
    >
      <div sx={{ my: 'auto', mr: 'auto' }}>
        {previousPagePath && (
          <Link to={previousPagePath} rel="prev">
            <ChevronLeft size="32" />
          </Link>
        )}
      </div>

      {numberOfPages > 1 && (
        <div
          className="pagination-location"
          sx={{ my: 'auto', display: 'flex' }}
        >
          Page {humanPageNumber} of {numberOfPages}
        </div>
      )}
      <div sx={{ my: 'auto', ml: 'auto' }}>
        {nextPagePath && (
          <Link to={nextPagePath} rel="next">
            <ChevronRight size="32" />
          </Link>
        )}
      </div>
    </nav>
  )
}

Pagination.propTypes = {
  pageContext: PropTypes.object.isRequired,
}

export default Pagination
