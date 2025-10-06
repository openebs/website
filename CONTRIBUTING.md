# Contributing Guidelines
<BR>

## Umbrella Project
OpenEBS is an "umbrella project". Every project, repository and file in the OpenEBS organization adopts and follows the policies found in the Community repo umbrella project files.
<BR>

This project follows the [OpenEBS Contributor Guidelines](https://github.com/openebs/community/blob/HEAD/CONTRIBUTING.md)

# Contributing to OpenEBS Website

openebs/website uses the standard GitHub pull requests process to review and accept contributions.

## Steps to Contribute

OpenEBS is an Apache 2.0 Licensed project and all your commits should be signed with Developer Certificate of Origin. See [Sign your work](#sign-your-work). Here are general guidelines on how we accept the pull requests.

* Find an issue to work on or create a new issue. The issues are maintained at [openebs/website](https://github.com/openebs/website/issues).
* Claim your issue by commenting your intent to work on it to avoid duplication of efforts.
* Fork the repository on GitHub.
* Create a branch from where you want to base your work (usually main). Here are some additional guides to update specific parts of the website.
  - [update blog post](design/add_new_blog.md)
  - [update events](design/update_events.md)
  - [update testimonial](design/add_new_testimonial.md)
  - [update OpenEBS Documentation](design/updating_docs.md)
* Commit your changes by making sure the commit messages convey the need and notes about the commit.
* Push your changes to the branch in your fork of the repository.
* Submit a pull request to the original repository.


---

### Sign your work

We use the Developer Certificate of Origin (DCO) as an additional safeguard for the OpenEBS project. This is a well established and widely used mechanism to assure contributors have confirmed their right to license their contribution under the project's license. Please read [developer-certificate-of-origin](https://github.com/openebs/openebs/blob/HEAD/contribute/developer-certificate-of-origin).

Please certify it by just adding a line to every git commit message. Any PR with commits that do not have DCO Signoff will not be accepted:

```
  Signed-off-by: Random J Developer <random@developer.example.org>
```

or use the command `git commit -s -m "commit message comes here"` to sign-off on your commits.

Use your real name (sorry, no pseudonyms or anonymous contributions). If you set your `user.name` and `user.email` git configs, you can sign your commit automatically with `git commit -s`. You can also use git [aliases](https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases) like `git config --global alias.ci 'commit -s'`. Now you can commit with `git ci` and the commit will be signed.

---
