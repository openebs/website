/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import { Container, Button } from '@theme-ui/components'
import Image from 'components/image'
import Img from 'gatsby-image'
const features = [
  {
    id: 1,
    title: `Multi Cloud Storage`,
    image: `multi-cloud-storage.svg`,
    description: `Automated provisioning and storage replication across pods is challenging. OpenEBS makes complex cross-cloud stateful application storage easy.`,
  },
  {
    id: 2,
    title: `Built in Kubernetes`,
    image: `k8s.png`,
    description: `Unlike CSI plugins or Linux kernel dependent software, OpenEBS
      runs entirely in userspace, making deployment and maintenance a
      snap.`,
  },
  {
    id: 3,
    title: `Open Source Leader`,
    image: `open-source-leader.svg`,
    description: `The largest, most active Kubernetes storage project with the
    biggest user base and community, OpenEBS is built by K8s SREs,
    and experts just like you, tailored to their needs.`,
  },
]
const WhyOpenEBS = () => {
  return (
    <>
      <div sx={{ pt: ['4', '4', '5'], pb: ['2', '2', '3'] }}>
        <Container sx={{ maxWidth: 1024 }}>
          <Styled.h2 sx={{ textAlign: 'center', pb: '4' }}>
            Why OpenEBS?
          </Styled.h2>
          <div
            sx={{
              display: 'grid',
              gridGap: [0, 2, 4],
              gridTemplateColumns: [
                'auto',
                '1fr 1fr',
                '1fr 1fr',
                '1fr 1fr 1fr',
              ],
              px: [2, 0, 0],
            }}
          >
            {features.map((feature) => {
              return (
                <div
                  sx={{
                    p: ['2', '4'],
                    border: '1px solid',
                    borderColor: 'transparent',
                  }}
                  key={`feature-${feature.id}`}
                >
                  <div
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <div sx={{ width: '100px', display: 'inline-block' }}>
                      <Image
                        src={feature.image}
                        style={{
                          width: '60px',
                          height: '60px',
                          maxWidth: '60x',
                        }}
                      />
                    </div>
                    <div sx={{ display: 'inline-block' }}>
                      <Styled.h4
                        sx={{
                          textTransform: 'uppercase',
                          fontSize: ['4', '4', '22px'],
                          fontWeight: '500',
                          ml: '3',
                        }}
                      >
                        {feature.title}
                      </Styled.h4>
                    </div>
                  </div>
                  <Styled.p
                    sx={{
                      m: '0',
                      pt: ['2', '4'],
                      pb: ['4', '2'],
                      fontWeight: 300,
                      textAlign: ['center', 'left'],
                    }}
                  >
                    {feature.description}
                  </Styled.p>
                </div>
              )
            })}
          </div>
        </Container>
      </div>
    </>
  )
}

export default WhyOpenEBS
