/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import { useState } from 'react'
import { Container, Button } from '@theme-ui/components'
import ImageQuery from 'utils/image-query'
import Image from 'components/image'
import Asciinema from 'components/asciinema'

const asciinemaCasts = [
  {
    name: 'Bundle',
    src: '/251679.cast',
  },
  {
    name: 'Create React App',
    src: '/create-react-app.cast',
  },
]

const Workloads = ({ props }) => {
  const workloads = ImageQuery().allImages.edges.filter(
    (edge) => edge.node.relativeDirectory === 'workloads'
  )
  const [cast, setCast] = useState(asciinemaCasts[0])
  const [active, setActive] = useState(null)
  const handleCast = (cast) => {
    setCast(cast)
  }

  return (
    <Styled.div sx={{ backgroundColor: 'background', py: '5' }}>
      <Container>
        <Styled.h2 sx={{ textAlign: 'center', pb: ['3', '3', '5'] }}>
          Setting up OpenEBS is simple in any Application
        </Styled.h2>
        <div
          sx={{
            display: 'grid',
            gridGap: 4,
            gridTemplateColumns: ['auto', '1fr', '1fr 1fr'],
          }}
        >
          <div>
            <Styled.p
              sx={{
                pb: '3',
                fontSize: 3,
                fontWeight: '300',
                m: '0px',
                textAlign: ['center', 'center', 'left'],
              }}
            >
              OpenEBS can orchestrate storage for any Kubernetes app. Here’s how
              to get OpenEBS working on some top applications:
            </Styled.p>

            <div>
              <div
                sx={{
                  display: 'grid',
                  gridGap: 4,
                  gridTemplateColumns: ['1fr 1fr', '1fr 1fr 1fr'],
                  p: 3,
                  maxWidth: '520px',
                  margin: 'auto',
                }}
              >
                {workloads.map((edge) => {
                  return (
                    <div key={edge.node.id}>
                      <Image
                        src={edge.node.relativePath}
                        style={{
                          maxWidth: '80px',
                          display: 'flex',
                          filter: 'grayscale(100%)',
                          cursor: 'pointer',
                          margin: 'auto',
                        }}
                      />
                    </div>
                  )
                })}

                <div>
                  <Styled.p>& more...</Styled.p>
                </div>
              </div>
            </div>
          </div>
          <div
            sx={{
              backgroundColor: 'primary',
              p: '3',
              borderRadius: '5px',
            }}
          >
            <div>
              <div>
                <Styled.h4 sx={{ pb: '3', color: 'white' }}>
                  {cast.name}
                </Styled.h4>
                <Asciinema src={cast.src} />
              </div>

              {asciinemaCasts.map((cast) => {
                return (
                  <Button
                    sx={{
                      borderRadius: '5px',
                      px: '4',
                      my: '2',
                      mr: '3',
                      backgroundColor: 'darkOrange',
                      '&:focus': {
                        backgroundColor: 'extraDarkOrange',
                      },
                    }}
                    key={`cast-${cast.name}`}
                    onClick={() => handleCast(cast)}
                  >
                    {cast.name}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </Container>
    </Styled.div>
  )
}

export default Workloads
