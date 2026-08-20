# Project Documentation Guide

This folder is reserved for project documentation assets such as screenshots and supporting diagrams.

## Screenshots

Place UI screenshots in:

```text
docs/screenshots/
```

Recommended names:

```text
docs/screenshots/home.png
docs/screenshots/login.png
docs/screenshots/video-player.png
docs/screenshots/comments.png
docs/screenshots/downloads.png
docs/screenshots/premium.png
docs/screenshots/payment.png
docs/screenshots/video-call.png
```

Reference them from the root documentation with:

```md
![Home Page](docs/screenshots/home.png)
```

Or make them clickable:

```html
<a href="docs/screenshots/home.png">
  <img src="docs/screenshots/home.png" width="800" alt="Home Page" />
</a>
```
