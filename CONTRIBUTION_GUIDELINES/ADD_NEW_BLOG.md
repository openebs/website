## Add a new blog post

* Create a markdown file and add your blog content along with the metadata in the following format
```
---
title: Title of the blog
author: Author name
author_info: Author information
tags: All the tags with comma separation in between (Example: OpenEBS, LocalPV)
date: Date of publication in dd-mm-yyyy format
excerpt: Short description about the blog in about 200 hundred words. Words beyond 200 range will be clipped.
---
 
Blog content in the markdown format goes here…

```
Reference for text formatting in markdown https://guides.github.com/features/mastering-markdown/
* Name of the markdown file should be the title of the blog converted to all small letters with hyphen(-) separation between the words.
For example, If the title of the blog is: ``Title of the blog``
Then, markdown file name will be ``title-of-the-blog.md``
* Add this markdown file to website/src/blogs
* The main blog image should be named as ``title-of-the-blog.png`` and add this file to ``website/website/public/images/blog``
* If you are a new author, add your photograph with file name as `author-name.png` to `website/website/public/images/blog/authors`. Make sure the name provided in the author section of the metadata of the blog matches with this filename

*Note:*

* **Bold text:** To bold text, add two asterisks or underscores before and after a word or phrase. For example, `**bold text**`, `__bold text__`. Both of these texts will be rendered as **bold text**.
* **Italic text:** To italicize text, add one asterisk or underscore before and after a word or phrase. For example, `*italic text*`, `_italic text_`. Both of these texts will be rendered as *italic text*
* **Bold and italic text:** To emphasize text with bold and italics at the same time, add three asterisks or underscores before and after a word or phrase. For example, `***bold and italic text***`, `___bold and italic text___`. Both of these texts will be rendered as ***bold and italic text***
* **Code block:** The basic Markdown syntax allows you to create code blocks by indenting lines by four spaces or one tab. Or, you can use three backticks (```) before and after the code block
* **Figure caption:** To display a figure caption, we use three asterisks before and after a word or phrase enclosed within curly braces. For example, `(***Figure caption***)`. Please add figure caption on the line next to the image in the markdown without leaving any line space in between