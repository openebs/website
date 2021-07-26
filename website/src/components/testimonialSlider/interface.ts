export interface Testimonials {
  testimonials: Testimonial[];
}

export interface Testimonial {
  organizationName?: string;
  name?: string;
  githubUsername?: string;
  message: string;
}
