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
    // TODO: Set up modular popup
    if (email === '' || email === 'undefined') {
      console.log(`please enter valid email`)
    } else {
      const data = {
        fields: [
          {
            name: "email",
            value: email,
          },
        ],
        context: {
          pageUri: window.location.href,
        },
        legalConsentOptions: {
          consent: {
            consentToProcess: true,
            text:
              "I agree to allow MayaData to store and process my personal data.",
            communications: [
              {
                value: true,
                subscriptionTypeId: 999,
                text:
                  "I agree to receive marketing communications from MayaData."
              }
            ]
          }
        }
      }
      postData(GATSBY_NEWSLETTER_BACKEND_URL, data)
        .then((data) => {
          setIsSuccess(true)
          handleOpenModal()
          setEmail('')

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
   
  }
  const handleOnSubmit = (e) => {
    e.preventDefault()
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
        <Button sx={{ borderRadius: '4px' }}>Subscribe</Button>
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
