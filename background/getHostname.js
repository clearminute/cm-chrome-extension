function beautifyHost(url) {
  // remove protocols (http://, ...)
  // remove www.
  return url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '');
}

export default function getHostname(url) {
  try {
    const parsedURL = new URL(url);
    return beautifyHost(parsedURL.host || parsedURL.pathname).substr(0, 150);
  } catch (e) {
    console.error('Could not parse URL', e, url);
    return url;
  }
}
