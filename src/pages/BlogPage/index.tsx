import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import useStyles from "./styles";
import useQuery from "../../hooks/useQuery";
import { Grid, Typography, Link, Button } from "@material-ui/core";
import Footer from "../../components/Footer";
import ReactMarkdown from "react-markdown";
import { readingTime } from "../../utils/readingTime";
import { useViewport } from "../../hooks/viewportWidth";
import { VIEW_PORT } from "../../constants";

const BlogPage: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [metadata, setMetadata] = useState<any>();
  const [content, setContent] = useState<any>();
  const [previousBlog, setPreviousBlog] = useState<any>();
  const [nextBlog, setNextBlog] = useState<any>();
  const queryBlogName = useQuery();
  const axios = require('axios');
  const parseMD = require('parse-md').default
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
  
  let currentLocation = window.location.href;
  
  useEffect(() => {
    const getBlogsData= async ()=>{
      const {default: posts_json} = await import(`../../posts.json`)
      const currentBlog = posts_json?.filter((blog: { slug: string; }) => blog.slug === queryBlogName)[0];
      setPreviousBlog(posts_json?.filter((blog: { id: number; }) => blog.id === currentBlog.id-1)[0]);
      setNextBlog(posts_json?.filter((blog: { id: number; }) => blog.id === currentBlog.id+1)[0]);
    }
    getBlogsData();
  },[queryBlogName]);

  useEffect(() => {
    const fetchBlogContent=async()=>{
      const {default: URL} = await import(`../../blogs/${queryBlogName}.md`)
      axios.get(URL)
      .then(function (response: any) {
        const { metadata, content } = parseMD(response.data)
        setMetadata(metadata);
        setContent(content);
      })
    }
  
    fetchBlogContent();
  }, [axios, parseMD, queryBlogName]);
  

  const socialLinks = [
    {
        label: "Facebook",
        imgURL: "../Images/logos/facebook_blue.svg",
    },
    {
        label: "Slack",
        imgURL: "../Images/logos/slack_blue.svg",
    },
    {
        label: "LinkedIn",
        imgURL: "../Images/logos/linkedin_blue.svg",
    },
    {
        label: "Twitter",
        imgURL: "../Images/logos/twitter_blue.svg",
    },
  ];

  const handleSocialSharing = (label:string) => {
    switch(label) {
      case "Facebook":
        window.open(
          `http://www.facebook.com/sharer.php?u=${currentLocation}`, "_blank");
        break;
      case "LinkedIn":
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&amp;url=${currentLocation}&amp;title=${metadata.title}`, "_blank");
        break;
      case "Twitter":
        window.open(
          `https://twitter.com/intent/tweet?original_referer=${currentLocation}&amp;text=${metadata.title};url=${currentLocation}`, "_blank");
        break;
    }
  };

  return (
    <>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
      >
        {content ? (
          <Grid item xs={12}>
            <div className={classes.blogHeader}>
            
            <ReactMarkdown children={metadata.title} className={classes.blogTitle} />
              <div>
              <div className={classes.container}>
                  
                    <div className={classes.author}>
                      <div className={classes.authorImg}>
                        <img src="../Images/blog/authors/OPENEBS.png" alt=""></img>
                      </div>
                      <div className={classes.date}>
                        <ReactMarkdown children={metadata.author} className={classes.authorName} />
                        <div className={classes.dateAndTimeWrapper}><ReactMarkdown children={metadata.date} />  / {readingTime(content)} mins to read</div>
                      </div>
                    </div>
                  
                  
                    <div className={classes.shareWrapper}>
                      <Typography className={classes.share}>Share</Typography>
                      <div className={classes.socialIconsWrapper}>
                          {socialLinks.map(({ label, imgURL }) => {
                              return (   
                                (label === "Slack") ? 
                                  <div className={["addthis_inline_share_toolbox", classes.socialIconButton].join(' ')} key={label}></div>
                                  :
                                  <Link className={classes.socialIconButton} key={label} onClick={(() => handleSocialSharing(label))}>
                                      <img src={imgURL} alt={label}/>
                                  </Link>
                              );
                          })}
                      </div> 
                    </div>
                  
              </div>
              </div>
            </div>

            <div className={classes.blogBody}>
              <img src={`/Images${queryBlogName}.png`} alt="" className={classes.blogImg}></img>
              <ReactMarkdown children={content} />
            </div>
            
          </Grid>
        ) : (
          " "
        )}
        <hr className={classes.divider}/>
        <div className={classes.footerDivWrapper}>
            <div>
              <Typography className={classes.footerText}>Great news! You’re 1 article smarter! </Typography>
            </div>
            <div className={classes.shareWrapper}>
              <Typography className={classes.share}>Share</Typography>
              <div className={classes.socialIconsWrapper}>
                  {socialLinks.map(({ label, imgURL }) => {
                      return (   
                        (label === "Slack") ? 
                          <div className={["addthis_inline_share_toolbox", classes.socialIconButton].join(' ')} key={label}></div>
                          :
                          <Link className={classes.socialIconButton} key={label} onClick={(() => handleSocialSharing(label))}>
                              <img src={imgURL} alt={label}/>
                          </Link>
                      );
                  })}
              </div> 
            </div>
        </div>
        <div className={classes.footerDivWrapper}>
          {previousBlog &&
              <div>
                {width < mobileBreakpoint ?
                <Button
                  className={classes.arrowButton}
                  endIcon={<img src="../Images/svg/right_arrow.svg" alt={t('home.adaptorsTestimonials.previousArrowAlt')} />}
                  onClick={() => window.location.assign(`/blog/${previousBlog.slug}`) }
              >
                Previous article
              </Button>
              : 
              <Button
                  className={classes.arrowButton}
                  startIcon={<img src="../Images/svg/left_arrow.svg" alt={t('home.adaptorsTestimonials.previousArrowAlt')} />}
                  onClick={() => window.location.assign(`/blog/${previousBlog.slug}`) }
              >
                Previous article
              </Button>
              }
                
                <Typography className={classes.blogLink} onClick={() => window.location.assign(`/blog/${previousBlog.slug}`) }>{previousBlog.title}</Typography>
            </div>
          }
          {nextBlog && 
              <div className={classes.rightArrowButtonWrapper}>
                  <Button
                    className={classes.arrowButton}
                    endIcon={<img src="../Images/svg/right_arrow.svg" alt={t('home.adaptorsTestimonials.nextArrowAlt')} />}
                    onClick={() => window.location.assign(`/blog/${nextBlog.slug}`) }
                  >
                    Next article
                  </Button>
                  <Typography className={classes.blogLink} onClick={() => window.location.assign(`/blog/${nextBlog.slug}`) }>{nextBlog.title}</Typography>
              </div>
          }
            
        </div>

        <div>
            <Typography className={classes.blogRecommendationTitle}>Based on your reading story</Typography>
        </div>
      </Grid>

      {/* Display footer */}
      <footer className={classes.footer}>
        <Footer />
      </footer>
    </>
  );
};
export default BlogPage;
