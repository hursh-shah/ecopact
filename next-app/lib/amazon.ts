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
    const renewed = /renewed|refurbished/.test(t.toLowerCase()) || /renewed|refurbished/.test(bullets);
    info.isRenewed = renewed;

    // materials hints
    const details = $("#productDetails_techSpec_section_1,#productDetails_detailBullets_sections1").text().toLowerCase();
    const combined = `${t} ${bullets} ${details}`;
    const materialsMatch = combined.match(/(stainless steel|aluminum|glass|plastic|polycarbonate|recycled|biodegradable|leather|cotton|nylon|polyester)/i);
    info.materialsHint = materialsMatch ? materialsMatch[1] : null;

    // infer product type from breadcrumbs / title tokens
    const bc = $("#wayfinding-breadcrumbs_feature_div").text().toLowerCase();
    const corpus = `${bc} ${t}`;
    const typeMatch = corpus.match(/(phone|smartphone|laptop|headphones|earbuds|camera|backpack|jacket|shoes|bottle|notebook|charger|battery|tablet)/i);
    info.productType = typeMatch ? typeMatch[1].toLowerCase() : null;
  } catch {
    // ignore network errors and return best-effort info
  }
  return info;
} 