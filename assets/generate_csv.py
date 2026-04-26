"""
CloudVaultUS — Shopify Product CSV Generator
Run: python3 assets/generate_csv.py
Output: assets/products-import.csv
"""

import csv

# ── SHOPIFY REQUIRED COLUMNS (exact order) ─────────────────
HEADERS = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Product Category",
    "Type", "Tags", "Published",
    "Option1 Name", "Option1 Value",
    "Option2 Name", "Option2 Value",
    "Option3 Name", "Option3 Value",
    "Variant SKU", "Variant Grams", "Variant Inventory Tracker",
    "Variant Inventory Qty", "Variant Inventory Policy",
    "Variant Fulfillment Service", "Variant Price",
    "Variant Compare At Price", "Variant Requires Shipping",
    "Variant Taxable", "Variant Barcode",
    "Image Src", "Image Position", "Image Alt Text",
    "Gift Card", "SEO Title", "SEO Description",
    "Google Shopping / Google Product Category",
    "Google Shopping / Gender", "Google Shopping / Age Group",
    "Google Shopping / MPN", "Google Shopping / AdWords Grouping",
    "Google Shopping / AdWords Labels", "Google Shopping / Condition",
    "Google Shopping / Custom Product",
    "Variant Image", "Variant Weight Unit", "Variant Tax Code",
    "Cost per item", "Status"
]

def body(title, tagline, specs, warning=True):
    """Build a clean, Shopify-safe HTML product description."""
    spec_items = "".join(f"<li><strong>{k}:</strong> {v}</li>" for k, v in specs)
    warn = (
        '<p style="background:#1a0a0a;border:1px solid #7f1d1d;border-radius:6px;'
        'padding:10px 14px;font-size:13px;color:#fca5a5;margin-top:16px;">'
        '<strong>WARNING:</strong> This product contains nicotine, which is an '
        'addictive chemical. Not for sale to persons under 21.</p>'
    ) if warning else ""
    return (
        f'<h3 style="font-size:18px;margin:0 0 12px;">{tagline}</h3>'
        f'<ul style="padding-left:0;list-style:none;margin:0 0 12px;">'
        f'{spec_items}'
        f'</ul>'
        f'{warn}'
    )


# ── PRODUCT DATA ────────────────────────────────────────────

GEEK_BAR_PULSE_BODY = body(
    "Geek Bar Pulse 15000",
    "World's First Full Screen Disposable Vape",
    [
        ("Puff Count", "Up to 15,000 puffs"),
        ("Nicotine Strength", "5% (50mg)"),
        ("Coil", "Dual Mesh Coil - Dual Core"),
        ("Output Power", "20W"),
        ("Display", "Full screen - battery and e-juice indicator"),
        ("Charging", "USB-C rechargeable"),
        ("Mouthpiece", "Transparent ergonomic shell"),
    ]
)

GEEK_BAR_PULSE_X_BODY = body(
    "Geek Bar Pulse X 25000",
    "World's First 3D Curved Screen with AI Power Adjustment",
    [
        ("Puff Count", "25,000 (Regular Mode) / 15,000 (Pulse Mode)"),
        ("Nicotine Strength", "5% (50mg)"),
        ("E-liquid Capacity", "18ml"),
        ("Coil", "Dual Mesh Coil - Dual Core"),
        ("Display", "3D Curved Screen - Star UI with lighting controls"),
        ("AI Feature", "AI Power Adjustment - one-button control"),
        ("Charging", "Quick Charge USB-C (80% in approx. 20 min)"),
    ]
)

LOST_MARY_BODY = body(
    "Lost Mary MT35000 Turbo",
    "Next-Level Disposable with Dual-Mode Technology",
    [
        ("Puff Count", "35,000 (Smooth Mode) / 20,000 (Turbo Mode)"),
        ("Nicotine Strength", "5% (50mg)"),
        ("E-liquid Capacity", "18ml"),
        ("Battery", "1000mAh rechargeable"),
        ("Coil", "Dual Mesh Coil"),
        ("Display", "Integrated screen - battery, e-juice and mode indicator"),
        ("Charging", "USB-C (approx. 10 min for a full day)"),
    ]
)

# ── PRODUCT DEFINITIONS ─────────────────────────────────────
# Each product: (handle, title, body, vendor, tags, price, flavors_with_images)

PRODUCTS = [
    {
        "handle":  "geek-bar-pulse",
        "title":   "Geek Bar Pulse 15000 Puffs",
        "body":    GEEK_BAR_PULSE_BODY,
        "vendor":  "Geek Bar",
        "type":    "Disposable Vape",
        "tags":    "geek-bar,pulse,disposable,15000-puffs,dual-mesh,nicotine",
        "price":   "19.99",
        "seo_title": "Geek Bar Pulse 15000 Puffs | CloudVaultUS",
        "seo_desc":  "Shop Geek Bar Pulse 15000 disposable vape. Full screen display, dual mesh coil, 5% nicotine. Multiple flavors available.",
        "flavors": [
            ("Strawberry Kiwi",    "GBP-SK",  "https://oss.geekbar.com/products/pulse/20251105/2.png"),
            ("Raspberry Watermelon","GBP-RW", "https://oss.geekbar.com/products/pulse/20251105/3.png"),
            ("Watermelon Ice",     "GBP-WI",  "https://oss.geekbar.com/products/pulse/20251105/4.png"),
            ("Banana Ice",         "GBP-BI",  "https://oss.geekbar.com/products/pulse/20251105/5.png"),
            ("Peach Lemonade",     "GBP-PL",  "https://oss.geekbar.com/products/pulse/20251105/6.png"),
            ("Punch",              "GBP-PU",  "https://oss.geekbar.com/products/pulse/20251105/1.png"),
            ("Blue Razz Ice",      "GBP-BRI", "https://oss.geekbar.com/uploads/image/editor/202407291905459806_650X650.png"),
            ("Miami Mint",         "GBP-MM",  "https://oss.geekbar.com/products/meloso-ultra/3/Miami%20Mint.png"),
        ],
    },
    {
        "handle":  "geek-bar-pulse-x",
        "title":   "Geek Bar Pulse X 25000 Puffs",
        "body":    GEEK_BAR_PULSE_X_BODY,
        "vendor":  "Geek Bar",
        "type":    "Disposable Vape",
        "tags":    "geek-bar,pulse-x,disposable,25000-puffs,dual-mesh,ai-power,quick-charge,nicotine",
        "price":   "24.99",
        "seo_title": "Geek Bar Pulse X 25000 Puffs | CloudVaultUS",
        "seo_desc":  "Shop Geek Bar Pulse X 25000 disposable vape. 3D curved screen, AI power adjustment, quick charge. 5% nicotine.",
        "flavors": [
            ("Watermelon Ice",       "GBPX-WI",  "https://oss.geekbar.com/products/pulsex/20251105/1.png"),
            ("Blue Razz Ice",        "GBPX-BRI", "https://oss.geekbar.com/products/pulsex/20251105/2.png"),
            ("Miami Mint",           "GBPX-MM",  "https://oss.geekbar.com/products/pulsex/20251105/3.png"),
            ("Strawberry B-Pop",     "GBPX-SBP", "https://oss.geekbar.com/products/pulsex/20251105/4.png"),
            ("Sour Apple Ice",       "GBPX-SAI", "https://oss.geekbar.com/products/pulsex/20251105/5.png"),
            ("Blackberry Blueberry", "GBPX-BB",  "https://oss.geekbar.com/products/pulsex/20251105/6.png"),
            ("Blue Rancher",         "GBPX-BR",  "https://oss.geekbar.com/product/BlueRancher.png"),
            ("Raspberry Peach Lime", "GBPX-RPL", "https://oss.geekbar.com/product/RaspberryPeachLime.png"),
        ],
    },
    {
        "handle":  "lost-mary-mt35000-turbo",
        "title":   "Lost Mary MT35000 Turbo 35000 Puffs",
        "body":    LOST_MARY_BODY,
        "vendor":  "Lost Mary",
        "type":    "Disposable Vape",
        "tags":    "lost-mary,mt35000,turbo,disposable,35000-puffs,dual-mesh,dual-mode,nicotine",
        "price":   "24.99",
        "seo_title": "Lost Mary MT35000 Turbo 35000 Puffs | CloudVaultUS",
        "seo_desc":  "Shop Lost Mary MT35000 Turbo. 35000 puffs in smooth mode, 18ml e-liquid, 1000mAh battery, USB-C charging. 5% nicotine.",
        "flavors": [
            ("Watermelon",      "LM-WP",  ""),
            ("Strawberry Kiwi", "LM-SKP", ""),
            ("Blue Razz Ice",   "LM-BRI", ""),
            ("Tigers Blood",    "LM-TB",  ""),
            ("Pink Lemonade",   "LM-PLP", ""),
            ("Miami Mint",      "LM-MM",  ""),
            ("Black Mint",      "LM-BMP", ""),
            ("Strawberry",      "LM-SP",  ""),
        ],
    },
]


# ── CSV BUILDER ─────────────────────────────────────────────

def empty_row(handle):
    """Return a dict with all headers empty except handle."""
    return {h: "" for h in HEADERS} | {"Handle": handle}


rows = []

for p in PRODUCTS:
    for i, (flavor, sku, img_src) in enumerate(p["flavors"]):
        row = empty_row(p["handle"])

        if i == 0:
            # First row carries all product-level data
            row.update({
                "Title":                   p["title"],
                "Body (HTML)":             p["body"],
                "Vendor":                  p["vendor"],
                "Product Category":        "Health & Beauty > Health Care > Medical Supplies & Equipment",
                "Type":                    p["type"],
                "Tags":                    p["tags"],
                "Published":               "TRUE",
                "Gift Card":               "FALSE",
                "SEO Title":               p["seo_title"],
                "SEO Description":         p["seo_desc"],
                "Status":                  "active",
            })

        row.update({
            "Option1 Name":                "Flavor",
            "Option1 Value":               flavor,
            "Variant SKU":                 sku,
            "Variant Grams":               "0",
            "Variant Inventory Tracker":   "shopify",
            "Variant Inventory Qty":       "50",
            "Variant Inventory Policy":    "deny",
            "Variant Fulfillment Service": "manual",
            "Variant Price":               p["price"],
            "Variant Compare At Price":    "",
            "Variant Requires Shipping":   "TRUE",
            "Variant Taxable":             "TRUE",
            "Variant Barcode":             "",
            "Variant Weight Unit":         "lb",
            "Image Src":                   img_src,
            "Image Position":              str(i + 1),
            "Image Alt Text":              f"{p['title']} - {flavor}" if img_src else "",
        })

        rows.append(row)


# ── WRITE FILE ──────────────────────────────────────────────
output_path = "assets/products-import.csv"

with open(output_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=HEADERS, quoting=csv.QUOTE_ALL)
    writer.writeheader()
    writer.writerows(rows)

print(f"CSV written to {output_path}")
print(f"Total rows (variants): {len(rows)}")
