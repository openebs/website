/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import { useState } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Container, Button } from '@theme-ui/components'

const EasyStart = () => {
  const [copy, setCopy] = useState('Copy')
  const handleCopy = () => {
    setCopy('Copied')
  }
  const codeString = `helm install stable/openebs --name openebs --namespace openebs`
  return (
    <div
      sx={{
        py: ['4', '4', '5'],
        backgroundColor: 'background',
        textAlign: 'center',
      }}
    >
      <Container>
        <Styled.h3 sx={{ pb: '3' }}>
          Just one line of code and you’re up and running:
        </Styled.h3>

        <Styled.div
          sx={{
            display: ['block', 'flex'],
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <SyntaxHighlighter
            language="javascript"
            style={docco}
            sx={{ width: ['auto', '100%'] }}
          >
            {codeString}
          </SyntaxHighlighter>
          <div
            sx={{ maxWidth: '150px', width: '100%', my: 'auto', mx: 'auto' }}
          >
            <CopyToClipboard text={codeString} onCopy={handleCopy}>
              <Button
                sx={{ width: '100px', borderRadius: '0px' }}
                id="copy_gtm"
              >
                {copy}
              </Button>
            </CopyToClipboard>
          </div>
        </Styled.div>
      </Container>
    </div>
  )
}
export default EasyStart
