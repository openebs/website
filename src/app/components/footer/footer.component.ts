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
      src: 'assets/images/socials/gh.svg',
      alt: 'github',
      url: 'https://github.com/openebs'
    },
    {
      src: 'assets/images/socials/tw.svg',
      alt: 'twitter',
      url: 'https://twitter.com/openebs'
    },
    {
      src: 'assets/images/socials/sl.svg',
      alt: 'slack',
      url: 'https://slack.openebs.io'
    },
    {
      src: 'assets/images/socials/yt.svg',
      alt: 'youtube',
      url: 'https://www.youtube.com/channel/UC3ywadaAUQ1FI4YsHZ8wa0g'
    }
  ];
}
