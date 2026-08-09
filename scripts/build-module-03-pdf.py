"""Build the Module 3 course PDF from its canonical Markdown source."""

from __future__ import annotations

import hashlib
import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "criptografia" / "03-criptografia-moderna.md"
OUTPUT = ROOT / "docs" / "criptografia" / "pdf" / "modulo-03-criptografia-moderna.pdf"

NAVY = colors.HexColor("#071829")
TEAL = colors.HexColor("#0F766E")
CYAN = colors.HexColor("#0891B2")
INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#526174")
PALE = colors.HexColor("#E8F5F3")
GRID = colors.HexColor("#BCD3D6")
CODE_BG = colors.HexColor("#EEF3F6")


def register_fonts() -> tuple[str, str, str]:
    candidates = [
        (
            Path("C:/Windows/Fonts/arial.ttf"),
            Path("C:/Windows/Fonts/arialbd.ttf"),
            Path("C:/Windows/Fonts/consola.ttf"),
        ),
        (
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"),
        ),
    ]
    for regular, bold, mono in candidates:
        if regular.exists() and bold.exists() and mono.exists():
            pdfmetrics.registerFont(TTFont("CourseSans", str(regular)))
            pdfmetrics.registerFont(TTFont("CourseSansBold", str(bold)))
            pdfmetrics.registerFont(TTFont("CourseMono", str(mono)))
            pdfmetrics.registerFontFamily("CourseSans", normal="CourseSans", bold="CourseSansBold")
            return "CourseSans", "CourseSansBold", "CourseMono"
    return "Helvetica", "Helvetica-Bold", "Courier"


FONT, FONT_BOLD, FONT_MONO = register_fonts()


class CourseDocument(BaseDocTemplate):
    def __init__(self, filename: str):
        super().__init__(
            filename,
            pagesize=A4,
            leftMargin=19 * mm,
            rightMargin=19 * mm,
            topMargin=21 * mm,
            bottomMargin=19 * mm,
            title="Módulo 3 - Criptografía moderna",
            author="Profesor Sergio Gevatschnaider",
            subject="Material didáctico de criptografía moderna",
        )
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="normal")
        self.addPageTemplates(PageTemplate(id="content", frames=frame, onPage=draw_page))

    def afterFlowable(self, flowable):
        if not isinstance(flowable, Paragraph):
            return
        level_map = {"H1": 0, "H2": 0, "H3": 1}
        if flowable.style.name not in level_map:
            return
        level = level_map[flowable.style.name]
        text = flowable.getPlainText()
        key = getattr(flowable, "_bookmark_name", None)
        if not key:
            return
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(text, key, level=level, closed=False)
        self.notify("TOCEntry", (level, text, self.page, key))


def draw_page(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setStrokeColor(GRID)
        canvas.line(doc.leftMargin, 14 * mm, A4[0] - doc.rightMargin, 14 * mm)
        canvas.setFont(FONT, 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(doc.leftMargin, 9.2 * mm, "Módulo 3 · Criptografía moderna")
        canvas.drawRightString(A4[0] - doc.rightMargin, 9.2 * mm, f"Página {doc.page}")
    canvas.restoreState()


def build_styles():
    sample = getSampleStyleSheet()
    return {
        "cover_kicker": ParagraphStyle(
            "CoverKicker", parent=sample["Normal"], fontName=FONT_BOLD, fontSize=10,
            leading=13, textColor=TEAL, alignment=TA_CENTER, spaceAfter=8,
        ),
        "cover_title": ParagraphStyle(
            "CoverTitle", parent=sample["Title"], fontName=FONT_BOLD, fontSize=31,
            leading=36, textColor=NAVY, alignment=TA_CENTER, spaceAfter=14,
        ),
        "cover_subtitle": ParagraphStyle(
            "CoverSubtitle", parent=sample["Normal"], fontName=FONT, fontSize=13,
            leading=19, textColor=MUTED, alignment=TA_CENTER, spaceAfter=16,
        ),
        "H1": ParagraphStyle(
            "H1", parent=sample["Heading1"], fontName=FONT_BOLD, fontSize=20,
            leading=24, textColor=NAVY, spaceBefore=16, spaceAfter=8, keepWithNext=True,
        ),
        "H2": ParagraphStyle(
            "H2", parent=sample["Heading2"], fontName=FONT_BOLD, fontSize=15,
            leading=19, textColor=TEAL, spaceBefore=13, spaceAfter=6, keepWithNext=True,
        ),
        "H3": ParagraphStyle(
            "H3", parent=sample["Heading3"], fontName=FONT_BOLD, fontSize=11.5,
            leading=15, textColor=CYAN, spaceBefore=9, spaceAfter=4, keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "Body", parent=sample["BodyText"], fontName=FONT, fontSize=9.3,
            leading=13.5, textColor=INK, alignment=TA_LEFT, spaceAfter=5.5,
        ),
        "bullet": ParagraphStyle(
            "Bullet", parent=sample["BodyText"], fontName=FONT, fontSize=9.1,
            leading=13.1, textColor=INK, leftIndent=14, firstLineIndent=-8, spaceAfter=3,
        ),
        "quote": ParagraphStyle(
            "Quote", parent=sample["BodyText"], fontName=FONT, fontSize=9.2,
            leading=13.4, textColor=NAVY, leftIndent=12, rightIndent=6,
            borderColor=TEAL, borderWidth=0, borderPadding=7, backColor=PALE, spaceAfter=7,
        ),
        "code": ParagraphStyle(
            "Code", parent=sample["Code"], fontName=FONT_MONO, fontSize=7.8,
            leading=11.2, textColor=NAVY, leftIndent=7, rightIndent=7,
            borderPadding=7, backColor=CODE_BG, spaceBefore=3, spaceAfter=7,
        ),
        "table": ParagraphStyle(
            "TableText", parent=sample["BodyText"], fontName=FONT, fontSize=7.4,
            leading=9.7, textColor=INK,
        ),
        "table_header": ParagraphStyle(
            "TableHeader", parent=sample["BodyText"], fontName=FONT_BOLD, fontSize=7.4,
            leading=9.7, textColor=colors.white,
        ),
        "toc_title": ParagraphStyle(
            "TocTitle", parent=sample["Heading1"], fontName=FONT_BOLD, fontSize=20,
            leading=24, textColor=NAVY, spaceAfter=14,
        ),
        "small": ParagraphStyle(
            "Small", parent=sample["BodyText"], fontName=FONT, fontSize=7.6,
            leading=10.5, textColor=MUTED, alignment=TA_CENTER,
        ),
    }


STYLES = build_styles()


def inline_markup(value: str) -> str:
    value = value.replace("\\(", "").replace("\\)", "")
    value = html.escape(value, quote=True)
    value = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<link href="\2" color="#0F766E">\1</link>', value)
    value = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", value)
    value = re.sub(r"\*\*([^*]+)\*\*", rf'<font name="{FONT_BOLD}">\1</font>', value)
    value = re.sub(r"`([^`]+)`", rf'<font name="{FONT_MONO}" color="#0B6670">\1</font>', value)
    value = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", value)
    return value


def table_flowable(lines: list[str]) -> Table:
    rows = []
    for index, line in enumerate(lines):
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if index == 1 and all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells):
            continue
        style = STYLES["table_header"] if not rows else STYLES["table"]
        rows.append([Paragraph(inline_markup(cell), style) for cell in cells])
    count = max(len(row) for row in rows)
    available = A4[0] - 38 * mm
    widths = [available / count] * count
    table = Table(rows, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.45, GRID),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F4F8F8")]),
    ]))
    return table


def markdown_story(source: str):
    lines = source.splitlines()
    story = []
    paragraph = []
    index = 0
    in_code = False
    code_lines = []
    heading_index = 0

    def flush_paragraph():
        if paragraph:
            story.append(Paragraph(inline_markup(" ".join(paragraph)), STYLES["body"]))
            paragraph.clear()

    while index < len(lines):
        line = lines[index].rstrip()
        if line.startswith("```"):
            flush_paragraph()
            if in_code:
                story.append(Paragraph(html.escape("\n".join(code_lines)).replace("\n", "<br/>"), STYLES["code"]))
                code_lines = []
            in_code = not in_code
            index += 1
            continue
        if in_code:
            code_lines.append(line)
            index += 1
            continue
        if line.startswith("|") and index + 1 < len(lines) and lines[index + 1].lstrip().startswith("|"):
            flush_paragraph()
            table_lines = []
            while index < len(lines) and lines[index].lstrip().startswith("|"):
                table_lines.append(lines[index])
                index += 1
            story.extend([table_flowable(table_lines), Spacer(1, 7)])
            continue
        heading = re.match(r"^(#{1,3})\s+(.+)$", line)
        if heading:
            flush_paragraph()
            level = len(heading.group(1))
            heading_index += 1
            heading_paragraph = Paragraph(inline_markup(heading.group(2)), STYLES[f"H{level}"])
            heading_paragraph._bookmark_name = f"heading-{heading_index}"
            story.append(heading_paragraph)
            index += 1
            continue
        if re.fullmatch(r"-{3,}", line.strip()):
            flush_paragraph()
            story.append(HRFlowable(width="100%", thickness=0.7, color=GRID, spaceBefore=5, spaceAfter=8))
            index += 1
            continue
        if line.startswith(">"):
            flush_paragraph()
            story.append(Paragraph(inline_markup(line.lstrip("> ")), STYLES["quote"]))
            index += 1
            continue
        bullet = re.match(r"^\s*[-*]\s+(.+)$", line)
        numbered = re.match(r"^\s*(\d+)\.\s+(.+)$", line)
        if bullet or numbered:
            flush_paragraph()
            prefix = "-" if bullet else f"{numbered.group(1)}."
            content = bullet.group(1) if bullet else numbered.group(2)
            story.append(Paragraph(inline_markup(content), STYLES["bullet"], bulletText=prefix))
            index += 1
            continue
        if not line.strip():
            flush_paragraph()
        else:
            paragraph.append(line.strip())
        index += 1
    flush_paragraph()
    return story


def build():
    if not SOURCE.exists():
        raise SystemExit(f"No se encontró la fuente: {SOURCE}")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    source = SOURCE.read_text(encoding="utf-8")
    digest = hashlib.sha256(source.encode("utf-8")).hexdigest()[:12]

    story = [
        Spacer(1, 35 * mm),
        Paragraph("CRIPTOGRAFÍA Y BLOCKCHAIN", STYLES["cover_kicker"]),
        Paragraph("Módulo 3", STYLES["cover_title"]),
        Paragraph("Criptografía moderna", STYLES["cover_title"]),
        HRFlowable(width="52%", thickness=2.2, color=TEAL, spaceBefore=5, spaceAfter=18),
        Paragraph(
            "Fundamentos, clasificación, criptografía simétrica, bits de seguridad, bloque y flujo, "
            "modos, padding, AES, ChaCha20, RSA, curvas elípticas, claves de sesión y laboratorio de contraseñas.",
            STYLES["cover_subtitle"],
        ),
        Spacer(1, 24 * mm),
        Paragraph("Material elaborado por el profesor Sergio Gevatschnaider", STYLES["cover_subtitle"]),
        Spacer(1, 16 * mm),
        Paragraph(f"Documento generado desde la fuente curricular · SHA-256 {digest}", STYLES["small"]),
        PageBreak(),
        Paragraph("Contenido", STYLES["toc_title"]),
    ]

    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle("TOC0", fontName=FONT_BOLD, fontSize=9.5, leading=14, leftIndent=0, textColor=NAVY, spaceBefore=3),
        ParagraphStyle("TOC1", fontName=FONT, fontSize=8.5, leading=12, leftIndent=14, textColor=MUTED),
    ]
    story.extend([toc, PageBreak()])

    parsed = markdown_story(source)
    if parsed and isinstance(parsed[0], Paragraph) and parsed[0].style.name == "H1":
        parsed = parsed[1:]
    story.extend(parsed)

    document = CourseDocument(str(OUTPUT))
    document.multiBuild(story)
    print(f"PDF generado: {OUTPUT}")


if __name__ == "__main__":
    build()
