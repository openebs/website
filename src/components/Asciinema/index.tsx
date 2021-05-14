import React from "react";

declare var asciinema : any;

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
  
  bindRef = (ref: HTMLDivElement) => {
    this.ref = ref
  }

  componentDidMount() {
    asciinema.player.js.CreatePlayer(this.ref, this.props.src, this.props)
  }

  componentDidUpdate() {
    asciinema.player.js.UnmountPlayer(this.ref)
    asciinema.player.js.CreatePlayer(this.ref, this.props.src, this.props)
  }

  componentWillUnmount() {
    if (!this.ref) return

    asciinema.player.js.UnmountPlayer(this.ref)
    this.ref = null
  }

  render() {
    return <div ref={this.bindRef} />
  }
}

export default Asciinema