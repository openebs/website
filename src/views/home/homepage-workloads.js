/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import { useState } from 'react'
import { Container, Button } from '@theme-ui/components'
import ImageQuery from 'utils/image-query'
import Image from 'components/image'
import Asciinema from 'components/asciinema'

// Make sure workloads image name and workloads cast name is same and in lowercase format
const workloadsDisplayNameMapping = {
  minio: 'MinIO',
  mongodb: 'MongoDB',
  mysql: 'MySQL',
  percona: 'Percona',
  prometheus: 'Prometheus',
  redis: 'Redis',
}

const Workloads = ({ props }) => {
  const workloads = ImageQuery().allImages.edges.filter(
    (edge) => edge.node.relativeDirectory === 'workloads'
  )
  const [cast, setCast] = useState(workloads[0])
  const [active, setActive] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const handleCast = (edge, index) => {
    setCast(edge)
    setActiveIndex(index)
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
              OpenEBS orchestrates storage for any Kubernetes stack. Here’s how
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
                {workloads.map((edge, index) => {
                  return (
                    <div
                      key={edge.node.id}
                      onClick={() => handleCast(edge, index)}
                    >
                      <div
                        key={`cast-${edge.node.name}`}
                        sx={{
                          filter:
                            activeIndex === index
                              ? 'grayscale(0%)'
                              : 'grayscale(100%)',
                          cursor: 'pointer',
                          ':focus': {
                            filter: 'grayscale(0%)',
                          },
                          ':hover': {
                            filter: 'grayscale(10%)',
                          },
                          ':active': {
                            filter: 'grayscale(0%)',
                          },
                        }}
                      >
                        <Image
                          src={edge.node.relativePath}
                          style={{
                            maxWidth: '80px',
                            display: 'flex',
                            margin: 'auto',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
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
                <Styled.h4
                  sx={{ pb: '3', color: 'white', textTransform: 'capitalize' }}
                >
                  {workloadsDisplayNameMapping[cast.node.name]}
                </Styled.h4>
                <Asciinema src={`${cast.node.name}.cast`} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Styled.div>
  )
}

export default Workloads
