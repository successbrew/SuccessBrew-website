const isDev = process.env.NODE_ENV === "development";
export function contentSecurityPolicy(nonce: string) {
return `
  default-src 'self';
  script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://checkout.razorpay.com${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data: blob:;
  font-src 'self' data:;
  connect-src 'self' https://*.amazonaws.com https://api.razorpay.com https://checkout.razorpay.com https://lumberjack.razorpay.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  child-src 'self' https://www.google.com https://www.google.co.in https://maps.google.com https://*.google.com https://www.youtube.com https://www.youtube-nocookie.com https://*.amazonaws.com https://api.razorpay.com https://checkout.razorpay.com;
  frame-src 'self' https://www.google.com https://www.google.co.in https://maps.google.com https://*.google.com https://www.youtube.com https://www.youtube-nocookie.com https://*.amazonaws.com https://api.razorpay.com https://checkout.razorpay.com;
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();


}
