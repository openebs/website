import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import useStyles from "./style";
import useQuery from "../../hooks/useQuery";
import { Grid, Typography, Link, Button, Breadcrumbs } from "@material-ui/core";
import Footer from "../../components/Footer";
import ReactMarkdown from "react-markdown";
import { readingTime } from "../../utils/readingTime";
import { useViewport } from "../../hooks/viewportWidth";
import { VIEW_PORT } from "../../constants";
import BlogsSlider from "../../components/BlogsSlider";
import Newsletter from "../../components/Newsletter";

const BlogPage: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [metadata, setMetadata] = useState<any>();
  const [content, setContent] = useState<string>("");
  const [previousBlog, setPreviousBlog] = useState<any>();
  const [nextBlog, setNextBlog] = useState<any>();
  const [currentBlogDetails, setCurrentBlogDetails] = useState<any>();
  const [recommendedBlogs, setRecommendedBlogs] = useState<any[]>([]);
  const queryBlogName = useQuery();
  const axios = require('axios');
  const parseMD = require('parse-md').default
  const { width } = useViewport();
  const mobileBreakpoint = VIEW_PORT.MOBILE_BREAKPOINT;
  
  let currentLocation = window.location.href;
  
  useEffect(() => {
    const getBlogsData= async ()=>{
      const {default: posts_json} = await import(`../../posts.json`); 
      const currentBlog = posts_json?.filter((blog: { slug: string; }) => blog?.slug === queryBlogName)[0];
      setPreviousBlog(posts_json?.filter((blog: { id: number; }) => blog?.id === currentBlog?.id-1)[0]);
      setNextBlog(posts_json?.filter((blog: { id: number; }) => blog?.id === currentBlog?.id+1)[0]);
      setCurrentBlogDetails(currentBlog);
    }
  
    const fetchBlogContent=async()=>{
      const {default: URL} = await import(`../../blogs/${queryBlogName}.md`)
      axios.get(URL)
      .then(function (response: any) {
        const { metadata, content } = parseMD(response.data)
        setMetadata(metadata);
        setContent(content);
      })
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
      let recommendedBlogs = blogs?.filter(blog => (blog.author === currentBlog.author) && (blog?.tags.split(",")).some((tag) => currentBlog.tags.includes(tag)));
      
      if(recommendedBlogs?.length<minimumRecommededBlogs){
        let filteredBlogs = blogs?.filter(blog => (blog.author === currentBlog.author) || (blog?.tags.split(",")).some((tag) => currentBlog.tags.includes(tag)));
        recommendedBlogs = recommendedBlogs?.concat(filteredBlogs);
        if(recommendedBlogs?.length<minimumRecommededBlogs){
          const getRandomBlogs = (arr: { title: string; author: string; date: string; tags: string; content: string; id: number; slug: string; }[],count: number) => {
            let _arr = [...arr];
            return[...Array(count)].map( ()=> _arr.splice(Math.floor(Math.random() * _arr.length), 1)[0] ); 
          }
        recommendedBlogs = recommendedBlogs.concat(getRandomBlogs(blogs, minimumRecommededBlogs-recommendedBlogs.length));
        recommendedBlogs = recommendedBlogs.filter((item,index)=>{
          return (recommendedBlogs.indexOf(item) === index);
        })
        setRecommendedBlogs(recommendedBlogs);
        }
      }
      setRecommendedBlogs(recommendedBlogs);
    }
    getBlogsData();
    fetchBlogContent();
    filterRecommendedBlogs();
  },[axios, parseMD, queryBlogName]);

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
              {(width > mobileBreakpoint) &&
                <Breadcrumbs aria-label="breadcrumb" className={classes.breadCrumbs}>
                  <Link color="inherit" href="/blog">
                    {t('blog.blog')}
                  </Link>
                  <Link color="inherit" href={`/blog/${currentBlogDetails.slug}`}>
                      {metadata.title}
                  </Link>
                </Breadcrumbs>
              }
            <ReactMarkdown children={metadata.title} className={classes.blogTitle} />
              <div>
              <div className={classes.container}>
                  
                    <div className={classes.author}>
                      <div className={classes.authorImg}>
                        <img src={`../Images/blog/authors/${metadata.author}.png`} alt={metadata.author}></img>
                      </div>
                      <div className={classes.date}>
                        <ReactMarkdown children={metadata.author} className={classes.authorName} />
                        <div className={classes.dateAndTimeWrapper}><ReactMarkdown children={metadata.date} />  / {readingTime(content)} {t('blog.minToRead')}</div>
                      </div>
                    </div>
                  
                  
                    <div className={classes.shareWrapper}>
                      <Typography className={classes.share}>{t('blog.share')}</Typography>
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
              <img src={`/Images/blog/${queryBlogName}.png`} alt={metadata.title} className={classes.blogImg}></img>
              <ReactMarkdown children={content} />
            </div>
            
          </Grid>
        ) : (
          " "
        )}
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
                {t('blog.previousArticle')}
              </Button>
              : 
              <Button
                  className={classes.arrowButton}
                  startIcon={<img src="../Images/svg/left_arrow.svg" alt={t('home.adaptorsTestimonials.previousArrowAlt')} />}
                  onClick={() => window.location.assign(`/blog/${previousBlog.slug}`) }
              >
                {t('blog.previousArticle')}
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
                    {t('blog.nextArticle')}
                  </Button>
                  <Typography className={classes.blogLink} onClick={() => window.location.assign(`/blog/${nextBlog.slug}`) }>{nextBlog.title}</Typography>
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
