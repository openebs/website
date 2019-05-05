import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  social_icons = [
    {
      src: 'assets/images/socials/fb.svg',
      alt: 'facebook',
      url: 'https://www.facebook.com/openebs'
    },
    {
      src: 'assets/images/socials/tw.svg',
      alt: 'twitter',
      url: 'https://twitter.com/openebs'
    },
    {
      src: 'assets/images/socials/ln.svg',
      alt: 'linkedin',
      url: 'https://www.linkedin.com/company/openebs/'
    },
    {
      src: 'assets/images/socials/gh.svg',
      alt: 'github',
      url: 'https://github.com/openebs'
    },
    {
      src: 'assets/images/socials/yt.svg',
      alt: 'youtube',
      url: 'https://www.youtube.com/channel/UC3ywadaAUQ1FI4YsHZ8wa0g'
    }
  ];
}
