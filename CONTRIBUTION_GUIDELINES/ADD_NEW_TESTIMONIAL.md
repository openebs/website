## Add a new testimonial/adopter

* Go to https://github.com/openebs/openebs/blob/master/ADOPTERS.md and grab some of the testimonials from the list and add them to the websites as shown below.

* For an organization/user testimonial make a new entry in the `website/resources/adopters.json` file (`message` is required field).

  ```
    "githubUsername": Github username for the author if present
    "name": Name of the user if present
    "message": Testimonial
    "organizationName": Name of the organization if present
  ```