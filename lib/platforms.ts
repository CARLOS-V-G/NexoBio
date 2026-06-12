export interface Platform {
  name: string;
  slug: string;       // Simple Icons slug (https://simpleicons.org)
  color: string;      // hex WITHOUT #
  bgColor?: string;   // optional override for button bg
  domains: string[];  // domains that match this platform
}

export const PLATFORMS: Platform[] = [
  // Social
  { name: 'Instagram', slug: 'instagram', color: 'E1306C', domains: ['instagram.com', 'instagr.am'] },
  { name: 'TikTok', slug: 'tiktok', color: '000000', domains: ['tiktok.com', 'vm.tiktok.com'] },
  { name: 'X / Twitter', slug: 'x', color: '000000', domains: ['twitter.com', 'x.com', 't.co'] },
  { name: 'Facebook', slug: 'facebook', color: '1877F2', domains: ['facebook.com', 'fb.com', 'fb.me'] },
  { name: 'Snapchat', slug: 'snapchat', color: 'FFFC00', bgColor: 'F7C600', domains: ['snapchat.com', 'snap.com'] },
  { name: 'Reddit', slug: 'reddit', color: 'FF4500', domains: ['reddit.com', 'redd.it'] },
  { name: 'LinkedIn', slug: 'linkedin', color: '0A66C2', domains: ['linkedin.com', 'lnkd.in'] },
  { name: 'Pinterest', slug: 'pinterest', color: 'E60023', domains: ['pinterest.com', 'pin.it'] },
  { name: 'Threads', slug: 'threads', color: '000000', domains: ['threads.net'] },
  { name: 'Mastodon', slug: 'mastodon', color: '6364FF', domains: ['mastodon.social', 'mastodon.online'] },
  { name: 'Bluesky', slug: 'bluesky', color: '0285FF', domains: ['bsky.app', 'bsky.social'] },

  // Messaging
  { name: 'Telegram', slug: 'telegram', color: '26A5E4', domains: ['t.me', 'telegram.org', 'telegram.me'] },
  { name: 'WhatsApp', slug: 'whatsapp', color: '25D366', domains: ['wa.me', 'whatsapp.com'] },
  { name: 'Discord', slug: 'discord', color: '5865F2', domains: ['discord.com', 'discord.gg', 'discordapp.com'] },
  { name: 'Signal', slug: 'signal', color: '3A76F0', domains: ['signal.org', 'signal.me'] },

  // Video
  { name: 'YouTube', slug: 'youtube', color: 'FF0000', domains: ['youtube.com', 'youtu.be', 'yt.be'] },
  { name: 'Twitch', slug: 'twitch', color: '9146FF', domains: ['twitch.tv'] },
  { name: 'Kick', slug: 'kick', color: '53FC18', bgColor: '2D8B0A', domains: ['kick.com'] },
  { name: 'Rumble', slug: 'rumble', color: '85C742', domains: ['rumble.com'] },
  { name: 'Vimeo', slug: 'vimeo', color: '1AB7EA', domains: ['vimeo.com'] },
  { name: 'Dailymotion', slug: 'dailymotion', color: '0099CC', domains: ['dailymotion.com', 'dai.ly'] },

  // Adult / Creator
  { name: 'OnlyFans', slug: 'onlyfans', color: '00AFF0', domains: ['onlyfans.com'] },
  { name: 'Fansly', slug: 'fansly', color: '0099FF', domains: ['fansly.com'] },
  { name: 'Fanvue', slug: 'fanvue', color: '00B2A9', domains: ['fanvue.com'] },
  { name: 'Patreon', slug: 'patreon', color: 'FF424D', domains: ['patreon.com'] },
  { name: 'Ko-fi', slug: 'kofi', color: 'FF5E5B', domains: ['ko-fi.com'] },
  { name: 'Buy Me a Coffee', slug: 'buymeacoffee', color: 'FFDD00', bgColor: 'E8A800', domains: ['buymeacoffee.com', 'buymeacoff.ee'] },
  { name: 'Gumroad', slug: 'gumroad', color: 'FF90E8', bgColor: 'E040FB', domains: ['gumroad.com'] },
  { name: 'Substack', slug: 'substack', color: 'FF6719', domains: ['substack.com'] },
  { name: 'Beehiiv', slug: 'beehiiv', color: 'FC4A1A', domains: ['beehiiv.com'] },

  // Music
  { name: 'Spotify', slug: 'spotify', color: '1DB954', domains: ['spotify.com', 'open.spotify.com', 'spoti.fi'] },
  { name: 'Apple Music', slug: 'applemusic', color: 'FB233B', domains: ['music.apple.com', 'itunes.apple.com'] },
  { name: 'SoundCloud', slug: 'soundcloud', color: 'FF3300', domains: ['soundcloud.com', 'on.soundcloud.com'] },
  { name: 'Bandcamp', slug: 'bandcamp', color: '1DA0C3', domains: ['bandcamp.com'] },
  { name: 'Audiomack', slug: 'audiomack', color: 'FF8800', domains: ['audiomack.com'] },
  { name: 'Deezer', slug: 'deezer', color: 'EF5466', domains: ['deezer.com'] },

  // Payments
  { name: 'PayPal', slug: 'paypal', color: '00457C', domains: ['paypal.com', 'paypal.me'] },
  { name: 'Stripe', slug: 'stripe', color: '635BFF', domains: ['stripe.com'] },
  { name: 'Cash App', slug: 'cashapp', color: '00D632', domains: ['cash.app', 'cash.me'] },
  { name: 'Venmo', slug: 'venmo', color: '3D95CE', domains: ['venmo.com'] },
  { name: 'Mercado Pago', slug: 'mercadopago', color: '00B1EA', domains: ['mercadopago.com', 'mpago.la'] },

  // Tech / Dev
  { name: 'GitHub', slug: 'github', color: '181717', domains: ['github.com', 'gist.github.com'] },
  { name: 'GitLab', slug: 'gitlab', color: 'FC6D26', domains: ['gitlab.com'] },
  { name: 'Codepen', slug: 'codepen', color: '000000', domains: ['codepen.io'] },
  { name: 'Dribbble', slug: 'dribbble', color: 'EA4C89', domains: ['dribbble.com'] },
  { name: 'Behance', slug: 'behance', color: '1769FF', domains: ['behance.net'] },

  // E-commerce
  { name: 'Amazon', slug: 'amazon', color: 'FF9900', domains: ['amazon.com', 'amzn.to', 'amazon.co.uk', 'amazon.es', 'amazon.de', 'amazon.fr', 'amazon.com.br', 'amazon.com.mx'] },
  { name: 'Etsy', slug: 'etsy', color: 'F56400', domains: ['etsy.com'] },
  { name: 'Shopify', slug: 'shopify', color: '96BF48', domains: ['shopify.com', 'myshopify.com'] },
  { name: 'WooCommerce', slug: 'woocommerce', color: '96588A', domains: ['woocommerce.com'] },

  // Productivity / Other
  { name: 'Notion', slug: 'notion', color: '000000', domains: ['notion.so', 'notion.com'] },
  { name: 'Medium', slug: 'medium', color: '000000', domains: ['medium.com'] },
  { name: 'Linktree', slug: 'linktree', color: '43E55E', domains: ['linktr.ee'] },
  { name: 'Beacons', slug: 'beacons', color: 'FF6B6B', domains: ['beacons.ai'] },
  { name: 'Calendly', slug: 'calendly', color: '006BFF', domains: ['calendly.com'] },
  { name: 'Zoom', slug: 'zoom', color: '2D8CFF', domains: ['zoom.us', 'us02web.zoom.us'] },
  { name: 'Google Meet', slug: 'googlemeet', color: '00897B', domains: ['meet.google.com'] },
  { name: 'Apple', slug: 'apple', color: '000000', domains: ['apple.com', 'apps.apple.com'] },
  { name: 'Google', slug: 'google', color: '4285F4', domains: ['google.com', 'g.co'] },
  { name: 'Microsoft', slug: 'microsoft', color: '0078D4', domains: ['microsoft.com', 'office.com'] },
  { name: 'WordPress', slug: 'wordpress', color: '21759B', domains: ['wordpress.com', 'wordpress.org'] },
  { name: 'Squarespace', slug: 'squarespace', color: '000000', domains: ['squarespace.com'] },
  { name: 'Wix', slug: 'wix', color: 'FAAD4D', bgColor: 'D48A00', domains: ['wix.com'] },
];

export function detectPlatform(url: string): Platform | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();
    for (const platform of PLATFORMS) {
      if (platform.domains.some(d => hostname === d || hostname.endsWith('.' + d))) {
        return platform;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function getPlatformIconUrl(platform: Platform, size = 24): string {
  return `https://cdn.simpleicons.org/${platform.slug}/${platform.bgColor ?? platform.color}`;
}

export function getPlatformColor(platform: Platform): string {
  return `#${platform.bgColor ?? platform.color}`;
}
