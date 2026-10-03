class TheaterMode {
  constructor() {
    this.$player = null;
    this.$video = null;
    this.$navigationProgress = null;
    this.$header = null;

    this.theaterObserver = this.createTheaterObserver();
    this.styleObserver = this.createStyleObserver();
  }

  init(player) {
    this.$player = player;
    this.onPlayerLoaded();
  }

  // OBSERVERS
  //
  createTheaterObserver() {
    return new MutationObserver((mutations) => {
      const theaterMutation = mutations.find(
        (mutation) => mutation.attributeName === "theater"
      );

      if (!theaterMutation) return;

      if (theaterMutation.target.hasAttribute("theater")) {
        this.onTheaterAdded();
      } else {
        this.onTheaterRemoved();
      }
    });
  }

  createStyleObserver() {
    return new MutationObserver((_mutations, self) => {
      self.disconnect();
      setTimeout(() => this.scrollToFullScreen(1000), 10);
    });
  }

  // EVENTS
  //
  onPlayerLoaded() {
    if (this.$player.hasAttribute("theater")) {
      this.onTheaterAdded();
      setTimeout(() => this.scrollToFullScreen(1000), 10);
    }

    this.theaterObserver.observe(this.$player, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["theater"],
    });
  }

  onTheaterAdded() {
    this.$header = document.querySelector("#masthead-container");
    this.$header?.addEventListener("pointerleave", this.hideHeader);
    document.addEventListener("pointermove", this.onPointerMove, {
      passive: true,
    });
    document.addEventListener("fullscreenchange", this.onFullscreenChange);

    this.styleObserver.observe(this.$player, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  onTheaterRemoved() {
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
    this.$header?.removeEventListener("pointerleave", this.hideHeader);
    this.hideHeader();
  }

  onFullscreenChange = () => {
    if (document.fullscreenElement) return;

    this.hideHeader();
    setTimeout(() => {
      if (this.$player.hasAttribute("theater"))
        this.scrollToFullScreen(1000);
    }, 100);
  };

  onPointerMove = (event) => {
    if (!this.$header) return;

    const isHeaderVisible = document.documentElement.hasAttribute(
      "data-theater-header-visible"
    );

    if (event.clientY <= this.$header.offsetHeight) {
      if (!isHeaderVisible)
        document.documentElement.setAttribute(
          "data-theater-header-visible",
          ""
        );
    } else if (isHeaderVisible) {
      this.hideHeader();
    }
  };

  hideHeader = () => {
    document.documentElement.removeAttribute("data-theater-header-visible");
  };

  // HELPERS
  //
  isNavigating() {
    if (!this.$navigationProgress)
      this.$navigationProgress = document.querySelector(
        "yt-page-navigation-progress"
      );

    return (
      this.$navigationProgress &&
      !this.$navigationProgress.hasAttribute("hidden")
    );
  }

  isLoadingVideo() {
    if (!this.$video) this.$video = this.$player.querySelector("video");

    return !this.$video;
  }

  scrollToFullScreen(maxTime) {
    if (this.isNavigating() || this.isLoadingVideo())
      return setTimeout(() => this.scrollToFullScreen(maxTime - 10), 10);

    this.$player.scrollIntoView();

    if (window.scrollY == 0 && maxTime > 0)
      setTimeout(() => this.scrollToFullScreen(maxTime - 10), 10);
  }
}
