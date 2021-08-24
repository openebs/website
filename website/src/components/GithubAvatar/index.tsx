/**
 * @param userName
 * @returns <Github Avatar>
 *
 * If you append .png to usernames in GitHub you get redirected to the avatar image.
 * Thanks to: https://github.com/sindresorhus/refined-github/issues/95#issuecomment-204806394
 */

import React from 'react';
import { Avatar } from '@material-ui/core';

interface githubAvatar {
  userName: string;
}

const GithubAvatar: React.FC<githubAvatar> = ({ userName }) => (
  <Avatar
    src={`https://github.com/${userName}.png?size=100`}
    alt={userName}
  />
);

export default GithubAvatar;
