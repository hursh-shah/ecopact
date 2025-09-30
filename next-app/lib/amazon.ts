import { load } from "cheerio";

export type AmazonInfo = {
  title: string | null;
  isRenewed: boolean;
  productType: string | null;
  materialsHint: string | null;
  url: string;
};

export async function extractAmazonInfo(url: string): Promise<AmazonInfo> {
  const info: AmazonInfo = {
    title: null,
    isRenewed: false,
    productType: null,
    materialsHint: null,
    url,
  };
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    const $ = load(html);
    const t = $("#productTitle").text().trim() || $("title").text().replace(/\s*:\s*Amazon\..+$/i, "").trim();
    info.title = t || null;

    const bullets = $("#feature-bullets li").text().toLowerCase();
    const renewed = /renewed|refurbished/.test((t || "").toLowerCase()) || /renewed|refurbished/.test(bullets);
    info.isRenewed = renewed;

    const details = $("#productDetails_techSpec_section_1,#productDetails_detailBullets_sections1").text().toLowerCase();
    const combined = `${t} ${bullets} ${details}`;
    const materialsMatch = combined.match(/(stainless steel|aluminum|glass|plastic|polycarbonate|recycled|biodegradable|leather|cotton|nylon|polyester)/i);
    info.materialsHint = materialsMatch ? materialsMatch[1] : null;

    const bc = $("#wayfinding-breadcrumbs_feature_div").text().toLowerCase();
    const corpus = `${bc} ${t}`;
    const typeMatch = corpus.match(/(phone|smartphone|laptop|computer|headphones|earbuds|camera|backpack|jacket|shoes|bottle|notebook|charger|battery|tablet|vacuum|cleaner|bag|watch|speaker|keyboard|mouse|monitor|chair|desk|lamp|fan|heater|blender|mixer|kettle|toaster|iron|dryer|washer|dishwasher|refrigerator|microwave)/i);
    info.productType = typeMatch ? typeMatch[1].toLowerCase() : null;
  } catch {
    // ignore network errors and return best-effort info
  }
  return info;
}

export type AmazonSearchResult = {
  title: string;
  url: string;
  isRenewed: boolean;
};

export async function searchAmazon(query: string, limit = 6): Promise<AmazonSearchResult[]> {
  const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(searchUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!res.ok) {
      console.error(`❌ Amazon search failed: HTTP ${res.status} for query "${query}"`);
      return [];
    }
    
    const html = await res.text();
    
    // Check if Amazon is blocking us (CAPTCHA or bot detection)
    if (html.includes('api-services-support@amazon.com') || html.includes('Robot Check')) {
      console.error(`🤖 Amazon bot detection triggered for query: "${query}"`);
      return [];
    }
    
    const $ = load(html);
    const results: AmazonSearchResult[] = [];
    $(".s-main-slot .s-result-item[data-component-type='s-search-result'] h2 a").each((_, el) => {
      if (results.length >= limit) return;
      const href = $(el).attr("href") || "";
      const title = $(el).text().trim();
      if (!href || !title) return;
      const url = href.startsWith("http") ? href : `https://www.amazon.com${href}`;
      const isRenewed = /renewed|refurbished/i.test(title);
      // De-dup by URL
      if (!results.find((r) => r.url === url)) {
        results.push({ title, url, isRenewed });
      }
    });
    
    if (results.length === 0) {
      console.warn(`⚠️ No products found on Amazon for query: "${query}". Selectors may need updating.`);
    }
    
    return results.slice(0, limit);
  } catch (err: any) {
    console.error(`❌ Amazon search error for "${query}":`, err.message);
    return [];
  }
} 