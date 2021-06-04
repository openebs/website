/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

export default function EditThisPage({editUrl}) {
  return (
    <a className="doc-button doc-button-outlined doc-button-secondary doc-button-secondary doc-button-align-center margin-right--md" href={editUrl} target="_blank" rel="noreferrer noopener">
      <span className="margin-right--xs">Edit</span>
      <img src="/docs/img/icons/gituhubicon_small.svg" alt="GitHub"/>
    </a>
  );
}
