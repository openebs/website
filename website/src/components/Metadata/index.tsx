import React from "react";
import {Helmet} from "react-helmet";
import { getHostOrigin } from "../../utils/getHostOrigin";

interface MetadataProps {
    title: string;
    description: string;
    url: string;
    isPost: boolean;
    image: string;
}

export const Metadata: React.FC<MetadataProps> = ({ title , description, url, isPost , image }) => {
    const defaultConfig = {
        title: `OpenEBS - Container Attached Storage`,
        description: `OpenEBS is an open source storage platform that provides persistent and containerized block storage for DevOps and
        container environments.`,
        url: `${getHostOrigin}`,
        image: `${getHostOrigin}/images/logos/logo.svg`,
        shareImageWidth: '1000px',
        shareImageHeight: '523px'
    }

    return(
        <Helmet>
            <title>{title || defaultConfig.title}</title>
            <meta name="description" content={description || defaultConfig.description} />
            <meta name="image" content={image} />
            <link rel="canonical" href={url || defaultConfig.url} />
             {/** Open Graph  */}
            <meta property="og:type" content={isPost ? 'article' : 'website'} />
            <meta property="og:url" content={url || defaultConfig.url} />
            <meta property="og:description" content={description || defaultConfig.description} />
            <meta property="og:image" content={image || defaultConfig.image} />
            <meta property="og:image:width" content={defaultConfig.shareImageWidth} />
            <meta property="og:image:height" content={defaultConfig.shareImageHeight} />
            {/** Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content="@openebs" />
            <meta name="twitter:title" content={title || defaultConfig.title} />
            <meta name="twitter:description" content={description || defaultConfig.description} />
            <meta name="twitter:image" content={image || defaultConfig.image} />
        </Helmet>
    )
}