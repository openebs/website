## Documentation Page Operations

### Update an already existing page in the docs:

In order to update the existing page, go to the corresponding markdown file and do the necessary changes and raise a PR.

Click on `Edit` button

![md preview](/website/public/images/guidelines/image14.png)

Edit the file

![raw md file](/website/public/images/guidelines/image2.png)

Edit the corresponding file in your forked repository and raise the PR.


### Some elements in markdown file:

Code snippet

![code snippet](/website/public/images/guidelines/image27.png)

Result:

![result screenshot](/website/public/images/guidelines/image4.png)

Code snippet without copy icon

![code snippet](/website/public/images/guidelines/image11.png)

In order to hide the ``COPY`` button, add ``hideCopy=true`` along like above. This can be helpful in showing the result of commands.

Result:

![kubectl cmd](/website/public/images/guidelines/image25.png)

Add table

![table](/website/public/images/guidelines/image5.png)

Result:

![result](/website/public/images/guidelines/image21.png)

> Add admonitions

This is sample code to add admonition
![sample code](/website/public/images/guidelines/image18.png)


And it’s corresponding result on the docs website

![small example](/website/public/images/guidelines/image22.png)

We can add `note`, `success`, `danger`, `caution` and `info` depending on our situation.

Here are some more examples.

![raw template admonitions](/website/public/images/guidelines/image1.png)


And the corresponding result 

![screenshot admonitions](/website/public/images/guidelines/image15.png)




## Update specific sidebar category, sidebar item title and its position in the sidebar


### Change the title of document


In order to update the sidebar item title, traverse to the corresponding markdown file and change the title value in the fragment.
If in the fragment, the title key is not present, it will automatically take the markdown file name as its title. In this case, for updating the title, add the `title` key with the corresponding value that you wanted to update.


For example,

![browser preview](/website/public/images/guidelines/image30.png)

Let’s say, we want to change the `ndm` to `Node disk manager`, change the title in the corresponding markdown file which is `ndm.md`.

![ndm md file](/website/public/images/guidelines/image16.png)

### Change document position

Change the position of the document sidebar item of a particular category by changing the `sidebar_position` value. Make sure that sibling docs don’t have the same value. As example

![document example](/website/public/images/guidelines/image16.png)


If you want to change the sidebar position of this document in a concepts category, change the value `sidebar_position`.

*Change a category name in the docs*

In order to change the category name, update the label value in `_category_.json`. As example

![change name](/website/public/images/guidelines/image6.png)

*Change position of category*

If you want to change the position of the category, change the value of position but make sure that sibling categories don’t have the same position value.

For e.g.

![concepts label](/website/public/images/guidelines/image6.png)

### Create a new document and add it to specific category

Let’s say you want to add `doc2.md` with title Doc 2 title in category concepts as it is in the above example.


Create the `doc2.md` in the folder of category concepts. On the top of the markdown file, add fragment such as

doc2.md

![doc2 md file](/website/public/images/guidelines/image8.png)

If you are adding this file in the `next` (unpublished) version of the docs, you are done.

If you are adding it to a specific version of the docs, you will have to update the corresponding `version_sidebar json`.

For e.g:

If you are updating in the `version-1.1.2-sidebars.json`, traverse to the concepts category and add these items in the docs.

![doc type](/website/public/images/guidelines/image20.png)

Here, id is path to md file including its name

Also as you can see that this new docs is added at 5th position of the items array. It will come at position number `5` in the sidebar also (in the browser). If you want to change the position, move the object up in items.

By default, position of the doc object in the items array will take precedence over `sidebar_position` in the markdown file.




### Create a new category

In order to add the category in the docs, add a folder named with category. Inside that folder, add markdown files as well as `_category_.json` according to your need.

Content of the category json key should match like

![new category object](/website/public/images/guidelines/image6.png)

The value of keys may be different for your case.

If you are adding a category in the `next` (unpublished) version of the docs, you are good to go now.

But if you are adding this category in some version, then you will have to add the category object in the version sidebar json.

For example, for ``v1.1.2``, change the content in version-1.1.2-sidebars.json 

Add a new category object in ``version-1.1.2/docs`` array.  ( `version-1.1.2/docs` is the array in version-1.1.2-sidebars.json )

![items object](/website/public/images/guidelines/image19.png)


Here you can see the label of the category is New Category.

There is a custom prop named icon. This is for displaying the icon along with the category name in the docs like this


![concept sidebar](/website/public/images/guidelines/image10.png)

Any valid name of the feather icon will work.

The position of the category object in the `version-1.1.2/docs` array will decide the position of the category on the sidebar.



### Adding  nested levels of sidebars


For the `next` (unpublished) version of the project related docs, just add the content (`directory`, `_category_.json`, markdown and other files) as it is in the folder.

For example,
Let’s say this is what we want to add as nested level in `introduction` category

![introduction category](/website/public/images/guidelines/image23.png)

After adding it, the folder structure will look like this.

![home highlighted](/website/public/images/guidelines/image29.png)

And you are done for the unpublished version.

If you are adding it to some published version, in addition to this change, you will also have to update the corresponding sidebar version json.

For e.g. if you are adding nested levels in `v1.1.2`, you will have to make changes in `version-1.1.2-sidebars.json` and changes will look like this

![nested sidebar](/website/public/images/guidelines/image12.png)

That’s all we need to do for adding nested levels of items into the sidebar.




## How  is versioning  done in the docs

Here is a screenshot of the source code folders of the docs.

![docs highlighted](/website/public/images/guidelines/image7.png)

Here the green rectangle box represents the `next` (unpublished) version of the project. This contains the unpublished version of the project documentation (currently on which project development would be going on).

Red rectangle box contains `versioned_docs` named directory. It contains all the published versions of the project. Directory name goes like `version-x.x.x`, here x.x.x is a particular version. `version-x.x.x` contains all the markdown and Json files in it that are of that particular version.


Yellow rectangle box contains `versioned_sidebars` named directory. It contains all the json files for different - 2 published versions. Based upon the content of these json files, a sidebar is created internally for that corresponding version.

And finally,

White rectangle box refers to `versions.json` . The content of this json file will look like this

![version.json file](/website/public/images/guidelines/image24.png)

It contains the version number of all the published versions.



### Publish the next version


Considering this situation

![sidebar content](/website/public/images/guidelines/image13.png)

Looking at this current screenshot, we can infer that the next version will be 1.1.3.

### Process of publishing the next version of the docs:

* Create a new folder in versioned_docs with name of `version-1.1.3`
* Move the content of docs to `version-1.1.3` folder
* Create a new json file with the name of `version-1.1.3-sidebars.json` and update the file with corresponding json object.
* Add version number in `versions.json`

After doing this, the folder structure will look like this

![version indicator](/website/public/images/guidelines/image28.png)

And `versions.json`

![version json file](/website/public/images/guidelines/image26.png)

That’s it. 

For more info -- [Versioning](https://docusaurus.io/docs/versioning) and https://docusaurus.io/docs/docs-introduction 
