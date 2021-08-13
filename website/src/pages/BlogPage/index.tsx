import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import useStyles from "./style";
import { useBlogName } from "../../hooks/extractBlogPath";
import { Avatar, Grid, Typography, Link, Button, Breadcrumbs } from "@material-ui/core";
import Footer from "../../components/Footer";
import ReactMarkdown from "react-markdown";
import { readingTime } from "../../utils/readingTime";
import { useViewport } from "../../hooks/viewportWidth";
import { SOCIAL_PLATFORMS, VIEW_PORT } from "../../constants";
import BlogsSlider from "../../components/BlogsSlider";
import Newsletter from "../../components/Newsletter";
import { SlackShareIcon } from "./slackShareIcon";
import BlogImage from '../../components/BlogImage';
import { useHistory } from "react-router-dom";
import { useCurrentHost } from "../../hooks/useCurrentHost";
import { Metadata } from "../../components/Metadata";
import ErrorPage from "../ErrorPage";
import CustomTag from "../../components/CustomTag";
import { toLowerCaseHyphenSeparatedString } from "../../utils/stringConversions";

const BlogPage: React.FC = () => {
  const { currentOrigin, currentLocation, currentPathname } = useCurrentHost();
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const [previousBlog, setPreviousBlog] = useState<any>({});
  const [nextBlog, setNextBlog] = useState<any>({});
  const [currentBlogDetails, setCurrentBlogDetails] = useState<any>({});
  const [recommendedBlogs, setRecommendedBlogs] = useState<any[]>([]);

  const queryBlogName = useBlogName();
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
  
  const handleRedirectPath = (slug: string) => { 
    history.push(`/blog/${slug}`);
  };
  
  useEffect(() => {
    const getBlogsData= async ()=>{
      const {default: posts_json} = await import(`../../posts.json`); 
      const currentBlog = posts_json?.filter((blog: { slug: string; }) => blog?.slug === queryBlogName)[0];
      setPreviousBlog(posts_json?.filter((blog: { id: number; }) => blog?.id === currentBlog?.id-1)[0]);
      setNextBlog(posts_json?.filter((blog: { id: number; }) => blog?.id === currentBlog?.id+1)[0]);
      setCurrentBlogDetails(currentBlog);
    }
  
    const filterRecommendedBlogs=async()=>{
      // 6 blogs per carousel
      // Get author and tag name from current blog
      // Filter with author and tags
      // Check if equal to 6
      // If not, filter by tags and filtered blogs to recommneded blogs array
      // Check if equal to 6
      // if not, then add random blogs till total recommneded blogs array lenght is 6
  
      let minimumRecommededBlogs = 6;
      const {default: blogs} = await import(`../../posts.json`);
      const currentBlog = blogs?.filter(blog => blog.slug === queryBlogName)[0];
      let recommendedBlogs = blogs?.filter(blog => (blog?.author === currentBlog?.author) && (blog?.tags).some((tag) => currentBlog.tags.includes(tag)));
      
      if(recommendedBlogs?.length<minimumRecommededBlogs){
        let filteredBlogs = blogs?.filter(blog => (blog?.author === currentBlog?.author) || (blog?.tags).some((tag) => currentBlog?.tags.includes(tag)));
        recommendedBlogs = recommendedBlogs?.concat(filteredBlogs).filter(blog => blog?.slug !== currentBlog?.slug);
        // Removes duplicates
        recommendedBlogs = recommendedBlogs.filter((item,index)=>{
          return (recommendedBlogs.indexOf(item) === index);
        })
        if(recommendedBlogs?.length<minimumRecommededBlogs){
          const getRandomBlogs = (arr: { title: string; author: string; excerpt: string; author_info: string; date: string; tags: Array<string>; content: string; id: number; slug: string; }[],count: number) => {
            let _arr = [...arr];
            return[...Array(count)].map( ()=> _arr.splice(Math.floor(Math.random() * _arr.length), 1)[0] ); 
          }
        recommendedBlogs = recommendedBlogs?.concat(getRandomBlogs(blogs, minimumRecommededBlogs-recommendedBlogs.length)).filter(blog => blog?.slug !== currentBlog?.slug);
        // Removes duplicates
        recommendedBlogs = recommendedBlogs.filter((item,index)=>{
          return (recommendedBlogs.indexOf(item) === index);
        })
        setRecommendedBlogs(recommendedBlogs);
        }
      }
      setRecommendedBlogs(recommendedBlogs);
    }
    getBlogsData();
    filterRecommendedBlogs();
  },[queryBlogName]);

  const socialLinks = [
    {
        label: SOCIAL_PLATFORMS.FACEBOOK,
        imgURL: "../images/logos/facebook_blue.svg",
    },
    {
        label: SOCIAL_PLATFORMS.SLACK,
        imgURL: "../images/logos/slack_blue.svg",
    },
    {
        label: SOCIAL_PLATFORMS.LINKEDIN,
        imgURL: "../images/logos/linkedin_blue.svg",
    },
    {
        label: SOCIAL_PLATFORMS.TWITTER,
        imgURL: "../images/logos/twitter_blue.svg",
    },
  ];

  const handleSocialSharing = (label:string) => {
    switch(label) {
      case SOCIAL_PLATFORMS.FACEBOOK:
        window.open(
          `http://www.facebook.com/sharer.php?u=${currentLocation}`, "_blank");
        break;
      case SOCIAL_PLATFORMS.LINKEDIN:
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${currentLocation}`, "_blank");
        break;
      case SOCIAL_PLATFORMS.TWITTER:
        window.open(
          `https://twitter.com/intent/tweet?original_referer=${currentLocation}&text=${currentBlogDetails.title}&url=${currentLocation}`, "_blank");
        break;
    }
  };
    
  const getTags = (tags: string[]) => {
    return tags.map((tag: string) => (
      <button
        key={tag}
        onClick={() => handleTagSelect(tag)}
        className={classes.tagButton}
      >
        <CustomTag blogLabel={tag} key={tag} />
      </button>
    ));
  };

  const handleTagSelect = (tag: string) => {
    history.push(`/blog/tag/${toLowerCaseHyphenSeparatedString(tag)}`)
  };

  return (
    <>
    {currentBlogDetails?.id && Boolean(currentBlogDetails?.notHasFeatureImage) && (
      <Metadata 
        title={currentBlogDetails?.title} 
        description={currentBlogDetails?.excerpt} 
        url={currentLocation} 
        image={`${currentOrigin}/images/blog/defaultImage.png`} 
        isPost={true}
        author={{ name: currentBlogDetails?.author, image: `${currentOrigin}/images/blog/authors/${currentBlogDetails?.author
        .toLowerCase().replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')}.png` }}
        tags={currentBlogDetails.tags}  />
    )}
    {currentBlogDetails?.id && !Boolean(currentBlogDetails?.notHasFeatureImage) && (
      <Metadata 
        title={currentBlogDetails?.title} 
        description={currentBlogDetails?.excerpt} 
        url={currentLocation} 
        image={`${currentOrigin}/images${currentPathname}.png`} 
        isPost={true}
        author={{ name: currentBlogDetails?.author, image: `${currentOrigin}/images/blog/authors/${currentBlogDetails?.author
        .toLowerCase().replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')}.png` }}
        tags={currentBlogDetails.tags}  />
    )}
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
      >
        {currentBlogDetails?.content ? (

          <Grid item xs={12}>
            <div className={classes.blogHeader}>
              {(width > mobileBreakpoint) &&
                <Breadcrumbs aria-label="breadcrumb" className={classes.breadCrumbs}>
                  <Link color="inherit" href="/blog">
                    {t('blog.blog')}
                  </Link>
                  <Link color="inherit" href={`/blog/${currentBlogDetails?.slug}`}>
                    {currentBlogDetails?.title}
                  </Link>
                </Breadcrumbs>
              }
            <ReactMarkdown children={currentBlogDetails?.title} className={classes.blogTitle} />
              <div>
                <div className={classes.container}> 
                  <div className={classes.author}>
                    <div className={classes.authorImgWrapper}>
                        <Avatar 
                          className={classes.authorImg} 
                          alt={currentBlogDetails?.author} 
                          src={`../images/blog/authors/${currentBlogDetails?.author
                            .toLowerCase().replace(/[^\w ]+/g,'')
                            .replace(/ +/g,'-')}.png`}
                        />
                    </div>
                    <div className={classes.date}>
                      <ReactMarkdown children={currentBlogDetails?.author} className={classes.authorName} />
                      <div className={classes.dateAndTimeWrapper}><ReactMarkdown children={currentBlogDetails?.date} />  / {readingTime(currentBlogDetails?.content)} {t('blog.minToRead')}</div>
                    </div>
                  </div>
                  <div className={classes.shareWrapper}>
                    <Typography className={classes.share}>{t('blog.share')}</Typography>
                    <div className={classes.socialIconsWrapper}>
                        {socialLinks.map(({ label, imgURL }) => {
                            return (   
                              (label === SOCIAL_PLATFORMS.SLACK) ? 
                                <SlackShareIcon key={label} />
                                :
                                <Link className={classes.socialIconButton} key={label} onClick={(() => handleSocialSharing(label))}>
                                    <img loading="lazy" src={imgURL} alt={label}/>
                                </Link>
                            );
                        })}
                    </div> 
                  </div> 
                </div>
              </div>
            </div>

            <div className={classes.blogBody}>
              <BlogImage imgPath={`/images/blog/${queryBlogName}.png`} alt={currentBlogDetails?.title} className={classes.blogImg} />
              <ReactMarkdown children={currentBlogDetails?.content} />
              <div className={classes.tagsWrapper}>
                {getTags(currentBlogDetails?.tags)}
              </div>
            </div>
            
          </Grid>
        ) : (
          " "
        )}
        {currentBlogDetails ? 
          <>
            <hr className={classes.divider}/>
            <div className={classes.footerDivWrapper}>
                <div>
                  <Typography className={classes.footerText}>{t('blog.greetings')} </Typography>
                </div>
                <div className={classes.shareWrapper}>
                  <Typography className={classes.share}>{t('blog.share')}</Typography>
                  <div className={classes.socialIconsWrapper}>
                      {socialLinks.map(({ label, imgURL }) => {
                          return (   
                            (label === SOCIAL_PLATFORMS.SLACK) ? 
                              <SlackShareIcon key={label} />
                              :
                              <Link className={classes.socialIconButton} key={label} onClick={(() => handleSocialSharing(label))}>
                                  <img loading="lazy" src={imgURL} alt={label}/>
                              </Link>
                          );
                      })}
                  </div> 
                </div>
            </div>
          </> : 
          <ErrorPage  blogStatus={true} />
        }
        <div className={classes.footerDivWrapper}>
          {previousBlog &&
            <div>
              {width < mobileBreakpoint ?
                <Button
                  className={classes.arrowButton}
                  endIcon={<img loading="lazy" src="../images/svg/right_arrow.svg" alt={t('home.adaptorsTestimonials.previousArrowAlt')} />}
                  onClick={() => handleRedirectPath(previousBlog.slug)}
                  disableFocusRipple={true}
                  disableRipple={true}
                >
                  {t('blog.previousArticle')}
                </Button>
              : 
                <Button
                    className={classes.arrowButton}
                    startIcon={<img loading="lazy" src="../images/svg/left_arrow.svg" alt={t('home.adaptorsTestimonials.previousArrowAlt')} />}
                    onClick={() => handleRedirectPath(previousBlog.slug)}
                    disableFocusRipple={true}
                    disableRipple={true}
                >
                  {t('blog.previousArticle')}
                </Button>
              }
              <Typography className={classes.blogLink} onClick={() => handleRedirectPath(previousBlog.slug)}>{previousBlog.title}</Typography>
            </div>
          }
          {nextBlog && 
            <div className={classes.rightArrowButtonWrapper}>
              <Button
                className={classes.arrowButton}
                endIcon={<img loading="lazy" src="../images/svg/right_arrow.svg" alt={t('home.adaptorsTestimonials.nextArrowAlt')} />}
                onClick={() => handleRedirectPath(nextBlog.slug)}
                disableFocusRipple={true}
                disableRipple={true}
              >
                {t('blog.nextArticle')}
              </Button>
              <Typography className={classes.blogLink} onClick={() => handleRedirectPath(nextBlog.slug)}>{nextBlog.title}</Typography>
            </div>
          }
            
        </div>
      </Grid>
      <div className={classes.blogSlider}>
          <Typography className={classes.blogRecommendationTitle}>{t('blog.recommendationsTitle')}</Typography>
          <section>
              <BlogsSlider recommendedBlogs={recommendedBlogs}/>
          </section>
      </div>

      {/* Section: Newsletter */}
      <section>
          <Newsletter newsletterTitle={t("home.newsLetterTitle")} />
      </section>

      {/* Display footer */}
      <footer className={classes.footer}>
        <Footer />
      </footer>
    </>
  );
};
export default BlogPage;
