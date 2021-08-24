import React from 'react';
import useStyles from './style';
import { useExternalScript } from '../../hooks/useExternalScript';

const SlackShareIcon: React.FC = () => {
  const classes = useStyles();
  const addThisScript = useExternalScript('//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-60a793659d5a70ad');

  return (addThisScript === 'ready') ? (
    <div className={['addthis_inline_share_toolbox', classes.socialIconButton].join(' ')} />) : (<div className={classes.socialIconButton} />
  );
};

export default SlackShareIcon;
