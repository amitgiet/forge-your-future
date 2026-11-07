import math
import os
from PIL import Image, ImageDraw, ImageFont

def generate_apple_touch_icon():
    size = 180
    img = Image.new("RGB", (size, size), "#2563EB")
    draw = ImageDraw.Draw(img)

    # Diagonal gradient from #2563EB to #1D4ED8
    c1 = (0x25, 0x63, 0xEB)
    c2 = (0x1D, 0x4E, 0xD8)
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            r = int(c1[0] * (1 - t) + c2[0] * t)
            g = int(c1[1] * (1 - t) + c2[1] * t)
            b = int(c1[2] * (1 - t) + c2[2] * t)
            img.putpixel((x, y), (r, g, b))

    # Lightning glyph scaled to fit nicely in 180x180
    # Original SVG viewBox 0 0 32 32:
    # Points: (18.5, 4), (8, 17.5), (14.5, 17.5), (13.5, 28), (24, 14.5), (17.5, 14.5)
    scale = size / 32.0
    points = [
        (18.5 * scale, 4.0 * scale),
        (8.0 * scale, 17.5 * scale),
        (14.5 * scale, 17.5 * scale),
        (13.5 * scale, 28.0 * scale),
        (24.0 * scale, 14.5 * scale),
        (17.5 * scale, 14.5 * scale),
    ]
    draw = ImageDraw.Draw(img)
    draw.polygon(points, fill="#FFFFFF")

    out_path = os.path.join(os.path.dirname(__file__), "../public/apple-touch-icon.png")
    img.save(out_path, "PNG", optimize=True)
    print(f"Generated apple-touch-icon.png: {os.path.getsize(out_path)} bytes")

def generate_og_image():
    width = 1200
    height = 630
    img = Image.new("RGB", (width, height), "#0B0F19")
    draw = ImageDraw.Draw(img)

    # Background gradient from #0B0F19 to #1E293B
    bg1 = (0x0B, 0x0F, 0x19)
    bg2 = (0x1E, 0x29, 0x3B)
    for y in range(height):
        t = y / height
        r = int(bg1[0] * (1 - t) + bg2[0] * t)
        g = int(bg1[1] * (1 - t) + bg2[1] * t)
        b = int(bg1[2] * (1 - t) + bg2[2] * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Decorative subtle glow circles in the background
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    
    # Top right electric blue glow
    for radius in range(250, 0, -5):
        alpha = int(18 * (1 - radius / 250))
        ov_draw.ellipse([900 - radius, 100 - radius, 900 + radius, 100 + radius], fill=(37, 99, 235, alpha))
    
    # Bottom left cyan glow
    for radius in range(200, 0, -5):
        alpha = int(12 * (1 - radius / 200))
        ov_draw.ellipse([150 - radius, 520 - radius, 150 + radius, 520 + radius], fill=(14, 165, 233, alpha))

    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Load fonts
    font_bold_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
    font_regular_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
    
    title_font = ImageFont.truetype(font_bold_path, 60)
    badge_font = ImageFont.truetype(font_bold_path, 18)
    sub_font = ImageFont.truetype(font_regular_path, 26)
    feature_title_font = ImageFont.truetype(font_bold_path, 20)
    feature_desc_font = ImageFont.truetype(font_regular_path, 16)
    footer_font = ImageFont.truetype(font_bold_path, 20)

    # Top Category Badge (Pill)
    badge_text = "AI-POWERED NEET 2025 PREPARATION PLATFORM"
    badge_bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
    bw = badge_bbox[2] - badge_bbox[0] + 36
    bh = badge_bbox[3] - badge_bbox[1] + 18
    bx = 80
    by = 70
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=16, fill=(37, 99, 235, 40), outline="#2563EB", width=2)
    draw.text((bx + 18, by + 8), badge_text, font=badge_font, fill="#60A5FA")

    # Main Brand & Value Prop
    draw.text((80, 140), "NEET", font=title_font, fill="#2563EB")
    neet_bbox = draw.textbbox((80, 140), "NEET", font=title_font)
    draw.text((neet_bbox[2] + 4, 140), "FORGE", font=title_font, fill="#FFFFFF")

    tagline = "Convert Effort Into Marks: The Smarter Way to Crack NEET"
    draw.text((80, 220), tagline, font=sub_font, fill="#94A3B8")

    # 4 Pillar Cards (2x2 Grid)
    cards = [
        ("Daily Practice Problems (DPP)", "Chapter-wise NCERT-aligned consistency engine with instant explanations", "#38BDF8"),
        ("720-Mark Full Syllabus Mock Tests", "Authentic NTA pattern, national percentiles, and negative marking simulator", "#818CF8"),
        ("Spaced Repetition (NeuronZ)", "Algorithm-driven active recall scheduling for permanent long-term retention", "#A78BFA"),
        ("AI Weak-Area Diagnostics", "Pinpoint mark-leaking chapters, time-traps, and guess-penalty patterns", "#F472B6"),
    ]

    card_coords = [
        (80, 280, 560, 390),
        (620, 280, 1100, 390),
        (80, 420, 560, 530),
        (620, 420, 1100, 530),
    ]

    for (title, desc, accent), (x1, y1, x2, y2) in zip(cards, card_coords):
        draw.rounded_rectangle([x1, y1, x2, y2], radius=12, fill="#131B2E", outline="#1E293B", width=1)
        # Left accent stripe
        draw.rounded_rectangle([x1, y1 + 10, x1 + 4, y2 - 10], radius=2, fill=accent)
        draw.text((x1 + 22, y1 + 16), title, font=feature_title_font, fill="#FFFFFF")
        
        # Word wrap desc
        words = desc.split()
        line1, line2 = "", ""
        for w in words:
            if len(line1 + " " + w) < 46:
                line1 += (" " if line1 else "") + w
            else:
                line2 += (" " if line2 else "") + w
        draw.text((x1 + 22, y1 + 48), line1, font=feature_desc_font, fill="#94A3B8")
        if line2:
            draw.text((x1 + 22, y1 + 72), line2, font=feature_desc_font, fill="#94A3B8")

    # Trust indicator footer
    draw.text((80, 565), "Free to Start  •  Trusted by 10,000+ Aspirants  •  neetforge.in", font=footer_font, fill="#38BDF8")

    out_path = os.path.join(os.path.dirname(__file__), "../public/og-image.png")
    img.save(out_path, "PNG", optimize=True)
    print(f"Generated og-image.png: {os.path.getsize(out_path)} bytes")

if __name__ == "__main__":
    generate_apple_touch_icon()
    generate_og_image()
