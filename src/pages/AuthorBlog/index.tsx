import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
} from "@material-ui/core";
import Footer from "../../components/Footer";
import ReactMarkdown from "react-markdown";
import Sponsor from "../../components/Sponsor";
import index from "../../blogs/index.md";
import CustomTag from "../../components/CustomTag";
import useQuery from "../../hooks/useQuery";
import { Pagination } from "@material-ui/lab";

interface TabProps {
  id: string;
  title: string;
  blog: string;
  description: string;
  image: string;
  tag: string;
  author: string;
  length: number;
}

const AutohorBlog: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const queryAuthorName = useQuery().substring(useQuery().lastIndexOf("/") + 1);
  const [jsonMdData, setJsonMdData] = useState<any>();
  const itemsPerPage = 6;
  const [page, setPage] = React.useState<number>(1);

  useEffect(() => {
    async function fetchBlogs() {
      const indexBlog: any = index;
      await fetch(indexBlog)
        .then((response) => {
          if (response.ok) return response.text();
          else return Promise.reject("could't fetch text correctly");
        })
        .then((text) => {
          const tb = require("mdtable2json").getTables(text);
          setJsonMdData(tb[0].json);
        })
        .catch((err) => console.error(err));
    }
    fetchBlogs();
  }, []);

  var filteredData = (jsonMdData || []).filter(
    (tabs: TabProps) => tabs.author === queryAuthorName
  );

  return (
    <>
      <div className={classes.root}>
        <Container maxWidth="md" className={classes.author}>
          <Avatar
            alt={queryAuthorName}
            src={`/blog/authors/${queryAuthorName}.png`}
            className={classes.large}
          />
          <h1 className={classes.mainText}>{queryAuthorName}</h1>
        </Container>
      </div>
      <div className={classes.cardWrapper}>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
        >
          {filteredData
            ? filteredData
                .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                .map((elm: any) => {
                  return (
                    <Grid
                      item
                      xs={12}
                      md={6}
                      key={elm.id}
                      className={classes.cardSize}
                    >
                      <Card className={classes.cardRoot}>
                        <CardMedia
                          className={classes.media}
                          image={`/blog/images/${elm.image}`}
                        />
                        <CardContent>
                          <CustomTag blogLabel={elm.tag} />
                          <Typography
                            className={classes.title}
                            color="textSecondary"
                            gutterBottom
                          >
                            <ReactMarkdown children={elm.title} />
                          </Typography>
                          <Typography>
                            <ReactMarkdown children={elm.description + "..."} />
                          </Typography>
                        </CardContent>
                        <CardActions className={classes.actionWrapper}>
                          <span className={classes.author}>
                            <Avatar
                              alt={elm.author}
                              src={`/blog/authors/${elm.avatar}`}
                              className={classes.small}
                            />
                            <Typography>{elm.author}</Typography>
                          </span>
                          <Button
                            size="large"
                            disableRipple
                            variant="text"
                            className={classes.cardActionButton}
                            onClick={() =>
                              window.location.assign(
                                `/blog/${queryAuthorName}/${elm.blog}`
                              )
                            }
                          >
                            {t("blog.read")}
                            <img
                              src="../Images/svg/arrow_orange.svg"
                              alt={t("header.submitAlt")}
                              className={classes.arrow}
                            />
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })
            : " "}
        </Grid>
          <Pagination
            count={
              filteredData.length > 6
                ? Math.ceil(filteredData.length / 6)
                : Math.ceil(filteredData.length / 6 + 1)
            }
            page={page}
            onChange={(_event, val) => setPage(val)}
            shape="rounded"
            className={classes.pagination}
          />
      </div>
      {/* Sponsor section  */}
      <Sponsor />
      {/* Display footer */}
      <footer className={classes.footer}>
        <Footer />
      </footer>
    </>
  );
};
export default AutohorBlog;
