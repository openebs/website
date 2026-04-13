import React from 'react';
import { DocProvider } from '@docusaurus/plugin-content-docs/client';
import DocItemMetadata from '@theme/DocItem/Metadata';
import DocItemLayout from '@theme/DocItem/Layout';

export default function DocItem(props) {
  const DocContent = props.content;
  return (
    <DocProvider content={DocContent}>
      <DocItemMetadata />
      <DocItemLayout>
        <DocContent />
      </DocItemLayout>
    </DocProvider>
  );
}
