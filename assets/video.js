class VideoPlayer extends HTMLElement {
  constructor() {
    super();
    this.state = "loading";
    this.videoElement = this.querySelector(".video-js");

    if (!this.videoElement) {
      return;
    }

    this.playElement = this.querySelector('[js-video-player="play"]');
    this.pauseElement = this.querySelector('[js-video-player="pause"]');

    /**
     * Event listener.
     */
    this.playElement.addEventListener("click", this.playVideo.bind(this));
    this.pauseElement.addEventListener("click", this.pauseVideo.bind(this));
    this.videoElement.addEventListener("ended", this.videoEnded.bind(this));

    /**
     * Intersection Observer.
     */
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        threshold: 0.1,
      }
    );

    this.observer.observe(this.videoElement);
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.playVideo();
      } else {
        this.pauseVideo();
      }
    });
  }

  /**
   * Play video.
   */
  async playVideo() {
    try {
      await this.videoElement.play();
      this.state = "playing";
      this.updateButtonState();
    } catch (error) {
      console.warn("Autoplay failed. Attempting to play manually.", error);
      this.videoElement.muted = true;
      try {
        await this.videoElement.play();
        this.state = "playing";
        this.updateButtonState();
      } catch (manualError) {
        console.error("Failed to play video manually.", manualError);
      }
    }
  }

  /**
   * Pause video.
   */
  async pauseVideo() {
    try {
      await this.videoElement.pause();
      this.state = "paused";
      this.updateButtonState();
    } catch (error) {
      reportError("Failed to play video", error);
    }
  }

  /**
   * Update button state.
   */
  updateButtonState() {
    if (this.state === "playing") {
      this.playElement.classList.add("is-active");
      this.pauseElement.classList.remove("is-active");
    }

    if (this.state === "paused") {
      this.playElement.classList.remove("is-active");
      this.pauseElement.classList.add("is-active");
    }
  }

  /**
   * Video ended.
   */
  videoEnded() {
    this.videoElement.currentTime = 0;
    this.pauseVideo();
  }
}

customElements.define("video-player", VideoPlayer);
