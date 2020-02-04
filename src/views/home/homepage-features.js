/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import React from 'react'
import { Link } from 'gatsby'
import { Container, Button } from '@theme-ui/components'
import Image from 'components/image'
import Img from 'gatsby-image'
const features = [
  {
    title: `Container Storage`,
    description: `Storage that follows your workloads, adding agility and
  flexibility to your k8s apps.`,
    imageSrc: `features/container.svg`,
  },
  {
    title: `Granular Control`,
    description: `Every workloads has its own dynamic container based storage with
    any controls you need.`,
    imageSrc: `features/controls.svg`,
  },
  {
    title: `No Vendor Lockin`,
    description: `100% open source so you'll never find your critical data locked
    into expensive contracts.`,
    imageSrc: `features/vendor-lockin.svg`,
  },
  {
    title: `Save money on storage`,
    description: `Thin provisioning and ephemeral storage let you allocate storage
    on demand and save on pricey cloud storage.`,
    imageSrc: `features/investments.svg`,
  },
  {
    title: `Backups and more`,
    description: `Move your workloads & storage from dev to production, all
    powered by OpenEBS.`,
    imageSrc: `features/backups.svg`,
  },
  {
    title: `Run anywhere`,
    description: `Your K8s app can run on any cloud & improve resiliance across
    many availability zones.`,
    imageSrc: `features/run-anywhere.svg`,
  },
]
const Features = () => {
  return (
    <>
      <div sx={{ bg: 'background', py: ['4', '4', '5'] }}>
        <Container sx={{ maxWidth: 992 }}>
          <Styled.h2 sx={{ textAlign: 'center', pb: ['4', '4', '5'] }}>
            Key Features
          </Styled.h2>
          <div
            sx={{
              display: 'grid',
              gridGap: 4,
              gridTemplateColumns: ['auto', '1fr 1fr', '1fr 1fr 1fr'],
              p: ['3', '3', '0'],
            }}
          >
            {features &&
              features.map((feature) => {
                return (
                  <div sx={{ maxWidth: ['360px', '100%'], mx: 'auto' }}>
                    <Image
                      src={feature.imageSrc}
                      style={{ maxWidth: ['80px', '90px'] }}
                    />
                    <Styled.h4 sx={{ fontWeight: '500' }}>
                      {feature.title}
                    </Styled.h4>
                    <Styled.p sx={{ fontWeight: '300' }}>
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

export default Features
