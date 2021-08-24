import React from 'react';

declare let asciinema : any;

class Asciinema extends React.Component <any> {
  ref: HTMLDivElement | null = null;

  static defaultProps = {
    theme: 'asciinema',
    idleTimeLimit: 2,
    poster: 'npt:0:3',
    autoPlay: true,
    loop: true,
    speed: 0.75,
    preload: true,
    startAt: '00:00:02',
  }

  componentDidMount() {
    asciinema.player.js.CreatePlayer(this.ref, this.props.src, this.props);
  }

  componentDidUpdate() {
    asciinema.player.js.UnmountPlayer(this.ref);
    asciinema.player.js.CreatePlayer(this.ref, this.props.src, this.props);
  }

  componentWillUnmount() {
    if (!this.ref) return;

    asciinema.player.js.UnmountPlayer(this.ref);
    this.ref = null;
  }

  bindRef = (ref: HTMLDivElement) => {
    this.ref = ref;
  }

  render() {
    return <div ref={this.bindRef} />;
  }
}

export default Asciinema;
