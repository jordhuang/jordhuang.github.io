(function () {
  "use strict";

  document.querySelectorAll("[data-photo-gallery]").forEach(function (gallery) {
    var grid = gallery.querySelector("[data-gallery-grid]");
    var viewer = gallery.querySelector("[data-gallery-view]");
    var image = gallery.querySelector("[data-gallery-image]");
    var caption = gallery.querySelector("[data-gallery-caption]");
    var count = gallery.querySelector("[data-gallery-count]");
    var closeButton = gallery.querySelector("[data-gallery-close]");
    var previousButton = gallery.querySelector("[data-gallery-previous]");
    var nextButton = gallery.querySelector("[data-gallery-next]");
    var cards = Array.prototype.slice.call(gallery.querySelectorAll(".photo-card"));
    var currentIndex = 0;
    var thumbnailScrollPosition = 0;
    var thumbnailGap = 12;

    function layoutThumbnailGrid() {
      var isSingleColumn = window.innerWidth <= 680;

      grid.classList.add("photo-gallery__grid--masonry");

      if (isSingleColumn) {
        grid.style.height = "";
        cards.forEach(function (card) {
          card.style.width = "";
          card.style.transform = "";
        });
        return;
      }

      if (grid.hidden) return;

      var columnWidth = (grid.clientWidth - thumbnailGap) / 2;
      var columnHeights = [0, 0];

      cards.forEach(function (card) {
        card.style.width = columnWidth + "px";
      });

      cards.forEach(function (card, index) {
        var column = index % 2;
        var x = column * (columnWidth + thumbnailGap);
        var y = columnHeights[column];

        card.style.transform = "translate(" + x + "px, " + y + "px)";
        columnHeights[column] += card.offsetHeight + thumbnailGap;
      });

      grid.style.height = Math.max(columnHeights[0], columnHeights[1]) - thumbnailGap + "px";
    }

    function sizePhotograph() {
      var imageTop = Math.max(image.getBoundingClientRect().top, 0);
      var availableHeight = window.innerHeight - imageTop - 56;
      image.style.maxHeight = Math.max(availableHeight, 80) + "px";
    }

    function resetViewerPosition() {
      window.scrollTo(0, 0);
      window.requestAnimationFrame(function () {
        window.scrollTo(0, 0);
        sizePhotograph();
      });
    }

    function showPhotograph(index) {
      currentIndex = (index + cards.length) % cards.length;
      var card = cards[currentIndex];

      image.src = card.getAttribute("data-full");
      image.alt = card.getAttribute("data-alt");
      caption.textContent = card.getAttribute("data-caption");
      count.textContent = (currentIndex + 1) + " / " + cards.length;

      if (!viewer.hidden) resetViewerPosition();
    }

    function openViewer(index) {
      thumbnailScrollPosition = window.scrollY || window.pageYOffset;
      showPhotograph(index);
      grid.hidden = true;
      viewer.hidden = false;
      closeButton.focus({ preventScroll: true });
      resetViewerPosition();
    }

    function closeViewer() {
      viewer.hidden = true;
      grid.hidden = false;
      layoutThumbnailGrid();
      window.requestAnimationFrame(function () {
        layoutThumbnailGrid();
        window.scrollTo(0, thumbnailScrollPosition);
        cards[currentIndex].focus({ preventScroll: true });
      });
    }

    cards.forEach(function (card, index) {
      card.addEventListener("click", function () {
        openViewer(index);
      });
    });

    closeButton.addEventListener("click", closeViewer);
    previousButton.addEventListener("click", function () {
      showPhotograph(currentIndex - 1);
    });
    nextButton.addEventListener("click", function () {
      showPhotograph(currentIndex + 1);
    });

    image.addEventListener("load", function () {
      if (!viewer.hidden) resetViewerPosition();
    });

    cards.forEach(function (card) {
      var thumbnail = card.querySelector("img");
      thumbnail.addEventListener("load", layoutThumbnailGrid);
    });

    gallery.addEventListener("keydown", function (event) {
      if (viewer.hidden) return;

      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") showPhotograph(currentIndex - 1);
      if (event.key === "ArrowRight") showPhotograph(currentIndex + 1);
    });

    window.addEventListener("resize", function () {
      if (viewer.hidden) layoutThumbnailGrid();
      else sizePhotograph();
    });

    window.requestAnimationFrame(layoutThumbnailGrid);
  });
}());
