/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import "./style.css"
import { Container } from '@theme-ui/components'
import { useFormik } from 'formik';
import ReactModal from 'react-modal'
import { useState } from 'react'
// import closeicon from '../../assets/images/error.png';
import {
  XCircle,
  ThumbsUp,
  Mail
} from 'react-feather'

const Subscribe = () => {
  const tag = `OpenEBS OF Newsletter`

  const [showModal, setModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const CustomModalStyle = {
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
      height: '100px',
      padding: '20px',
      color: 'white',
      textAlign: 'center',
    },
  }

  const GATSBY_NEWSLETTER_BACKEND_URL = process.env.GATSBY_NEWSLETTER_BACKEND_URL;

  const FormFields = {
    firstName: '',
    lastName: '',
    email: '',
  };

  const Success = () => {
    return (
      <div
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Styled.h4 sx={{ color: 'white', textAlign: 'center', margin: '20px' }}>
          <button onClick={handleCloseModal} className="closeicon"><XCircle></XCircle></button>
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
        <Styled.h4 sx={{ color: 'white', textAlign: 'center', margin: '20px' }}>
          <button onClick={handleCloseModal} className="closeicon"> <XCircle></XCircle></button>
          Error in submitting the form, please try again!!!
        </Styled.h4>
      </div>
    )
  }

  const sendData = (values, actions) => {
    // TODO: Set up modular popup
    if (values.email === '' || values.email === 'undefined') {
      console.log(`please enter valid email`)
    } else {
      postData(GATSBY_NEWSLETTER_BACKEND_URL, {
        firstname: values.firstName,
        lastname: values.lastName,
        email: values.email,
        tag: tag,
      })
        .then((data) => {
          setIsSuccess(true)
          handleOpenModal()
          actions.resetForm({
            values: FormFields
          });
        })
        .catch((err) => {
          console.error(err)
          setIsSuccess(false)
          handleOpenModal()
        })
    }
  }

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

  const handleOpenModal = () => {
    setModal(true)
  }

  const handleCloseModal = () => {
    setModal(false)
  }

  const formik = useFormik({
    initialValues: FormFields,
    validate: values => {
      const errors = {};

      if (!values.email) {
        errors.email = 'Please complete this required field.';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address.';
      }

      return errors;
    },
    onSubmit: (values, actions) => {
      sendData(values, actions)
    },
  });

  const { handleChange, values, handleBlur, handleSubmit, touched, errors } = formik;

  return (
    <>
      <Container sx={{ p: 4 }}>
        <div className="subscribe-class">
          <div className="sub-left">
            <div className="heading-class">
              <span>
                <span>Get all the OpenEBS updates & information straight to your inbox </span>
                <Mail></Mail>
              </span>
            </div>
            <p>
              <span>
                <ThumbsUp></ThumbsUp>
                <span className="points-class">
                  Monthly OpenEBS Newsletter
                </span>
              </span>
            </p>
            <p>
              <span>
                <ThumbsUp></ThumbsUp>
                <span className="points-class">
                  Updates about latest releases
                </span>
              </span>
            </p>
            <p>
              <span>
                <ThumbsUp></ThumbsUp>
                <span className="points-class">
                  Other OpenEBS Events
                </span>
              </span>
            </p>

          </div>
          <div className="sub-right">
            <label className="form-title-class">Fill the form</label>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" className="form-control" name="firstName"
                  onChange={handleChange}
                  value={values.firstName} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" className="form-control" name="lastName"
                  onChange={handleChange}
                  value={values.lastName} />
              </div>
              <div className="form-group">
                <label>Email*</label>
                <input type="email" className="form-control" name="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email} />
                {errors && errors.email && touched.email ?
                  <div className="text-danger">
                    {errors.email}
                  </div>
                  : null}
              </div>
              <div className="btn-wrap">
                <button type="submit" className="btn">I"m In</button>
              </div>
            </form>
          </div>
        </div>
        <div>
          <ReactModal
            className="modal-class"
            isOpen={showModal}
            contentLabel="modal"
            onRequestClose={handleCloseModal}
            shouldCloseOnOverlayClick={false}
            style={CustomModalStyle}
          >
            {isSuccess ? <Success /> : <Failed />}
          </ReactModal>
        </div>
      </Container>
    </>
  )
}

export default Subscribe
