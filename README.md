<p align="center">
<img src="https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg">
<img src="https://raw.githubusercontent.com/Safouene1/support-palestine-banner/master/banner-support.svg">
</p>


# Nathaniel's Portfolio

Welcome to my portfolio website! This site showcases my projects, experience, and research in web development and other areas. The portfolio is a static website hosted on GitHub Pages, built with HTML, CSS, and JavaScript.

## Overview

This portfolio website is designed to:
- Display my skills and experiences in web development and software engineering.
- Provide links to my social media profiles and GitHub repositories.
- Share information about my education and professional journey.
- Present my personal projects and research work.

**Note**: The site is still under construction, and not all files and content are available. Some links and pages may be incomplete or unavailable.

## Live Site

You can view the live version of my portfolio [here](https://nathaniel.world).

## Features

- **Responsive Design**: Adjusts to different screen sizes for a seamless experience on mobile, tablet, and desktop.
- **Navigation Menu**: Easy access to different sections like Home, Experience, Projects, Research, and Education.
- **Custom 404 Page**: A custom error page for a better user experience when encountering broken links.
- **GitHub Workflow**: Automatically deploys updates to GitHub Pages using a static.yml workflow.
- **VPN/Proxy Signal Banner**: Shows a warning banner when VPN/proxy/Tor/hosting indicators are detected by the configured IP intelligence provider.

## Getting Started

To run this portfolio locally on your machine, follow these steps:

### Prerequisites

Make sure you have the following installed:
- [Git](https://git-scm.com/)
- A modern web browser (e.g., Chrome, Firefox, Safari)

### Clone the Repository

1. Open your terminal or command prompt.
2. Run the following command to clone the repository:

   ```bash
   git clone https://github.com/nathaniel123x3rd/nathaniel123x3rd.github.io.git
   ```

3. Navigate into the project folder:

   ```bash
   cd nathaniel123x3rd.github.io
   ```

4. Open the `index.html` file in your browser to view the website locally.

### Editing and Customizing

If you want to make changes or add new content:

1. Open the project in your preferred code editor (e.g., VS Code).
2. Modify the HTML, CSS, or JavaScript files in the `assets` folder to customize the website.
3. To see your changes, open the `index.html` file in your browser again.

## VPN/Proxy Detection Setup

The site now includes `assets/js/vpnDetection.js`, which:
- gets the visitor IP address,
- calls an IP intelligence endpoint, and
- shows a dismissible warning banner when VPN/proxy/Tor/hosting signals are detected.

### Configure provider endpoint/key

By default, the script uses `proxycheck.io` with no API key.  
To use another provider (or set your own key), add a config object before loading `assets/js/vpnDetection.js`:

```html
<script>
  window.VPN_DETECTION_CONFIG = {
    providerName: "your-provider",
    providerUrlTemplate: "https://example.com/check/{ip}?key={key}",
    providerApiKey: "REPLACE_WITH_YOUR_KEY",
    playAudioOnDetection: true
  };
</script>
```

Supported normalized indicators:
- `vpn`
- `proxy`
- `tor`
- `hosting`

The warning appears when any of these evaluates to true.

### Static-site key safety note

Because this is a static GitHub Pages site, any API key used client-side can be exposed to visitors.  
Safer alternatives:
- Use a server-side proxy/function to call the intelligence API.
- Restrict the key by domain, quota, and endpoint where your provider supports it.
- Rotate keys regularly.

### Reliability and privacy notes

- IP intelligence checks are best-effort and can produce false positives/false negatives.
- Visitors can bypass client-side checks.
- Add a privacy disclosure noting that IP reputation/network checks may be sent to a third-party provider.

### Contributing

If you'd like to contribute to this project, feel free to fork the repository and submit a pull request. All contributions are welcome!

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](./LICENSE) file for more information.

## Contact

For any questions or suggestions, feel free to reach out to me through my social media profiles linked on the website, or create an issue in the repository.


Thank you for visiting my portfolio!
