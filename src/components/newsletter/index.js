/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import { Box, Input, Button, Alert } from '@theme-ui/components'
import { useState } from 'react'
import ReactModal from 'react-modal'
const Success = () => {
  return (
    <div
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Styled.h4 sx={{ color: 'white' }}>
        You have successfully subscribed to OpenEBS Newsletter.
      </Styled.h4>
    </div>
  )
}

const Failed = () => {
  return (
    <div
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Styled.h4 sx={{ color: 'white' }}>
        Error in submitting the form, please try again!!!
      </Styled.h4>
    </div>
  )
}

const Newsletter = () => {
  const tag = `OpenEBS OE Newsletter`
  const [email, setEmail] = useState('')
  const [showModal, setModal] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const GATSBY_NEWSLETTER_BACKEND_URL =
    process.env.GATSBY_NEWSLETTER_BACKEND_URL
  const handleChange = (e) => {
    setEmail(e.target.value)
  }

  const sendData = () => {
    async function postData(url = '', data = {}) {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data),
      })
      return await response.json()
    }

    postData(GATSBY_NEWSLETTER_BACKEND_URL, {
      email: email,
      tag: tag,
    })
      .then((data) => {
        setIsSuccess(true)
        handleOpenModal()
      })
      .catch((err) => {
        console.error(err)
        setIsSuccess(false)
        handleOpenModal()
        setTimeout(() => {
          handleCloseModal()
        }, 1000)
      })
  }
  const handleOnSubmit = (e) => {
    e.preventDefault()
    setEmail('')
    sendData()
  }
  const handleOpenModal = () => {
    setModal(true)
  }

  const handleCloseModal = () => {
    setModal(false)
  }

  return (
    <div>
      <Box as="form" onSubmit={handleOnSubmit} id="newsletter_gtm">
        <Input
          type="email"
          name="email"
          value={email}
          mb={3}
          sx={{ maxWidth: 415, borderRadius: '4px', borderColor: 'grey' }}
          placeholder="Subscribe to Newsletter"
          onChange={handleChange}
        />
        <Button sx={{ borderRadius: '4px' }}>Submit</Button>
      </Box>
      <ReactModal
        isOpen={showModal}
        contentLabel="modal"
        onRequestClose={handleCloseModal}
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
          },
          content: {
            position: 'absolute',
            border: `1px solid ${isSuccess ? '#28a745' : '#dc3545'}`,
            background: `${isSuccess ? '#28a745' : '#dc3545'}`,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            height: '60px',
            width: '400px',
            padding: '20px',
            margin: 'auto',
            color: 'white',
            textAlign: 'center',
          },
        }}
      >
        {isSuccess ? <Success /> : <Failed />}
      </ReactModal>
    </div>
  )
}

export default Newsletter
