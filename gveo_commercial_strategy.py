#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur du document Stratégie Commerciale Complète GVEO
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.platypus.flowables import Flowable
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import os

# ─── PALETTE ──────────────────────────────────────────────────────────────────
C_TEAL       = HexColor("#1a6b7a")
C_TEAL_DARK  = HexColor("#0d4a5c")
C_TEAL_MID   = HexColor("#1e8a9e")
C_TEAL_LIGHT = HexColor("#d4eef3")
C_GREEN      = HexColor("#22c55e")
C_RED        = HexColor("#ef4444")
C_ORANGE     = HexColor("#f59e0b")
C_SLATE      = HexColor("#1e293b")
C_GRAY_DARK  = HexColor("#475569")
C_GRAY_MID   = HexColor("#94a3b8")
C_GRAY_LIGHT = HexColor("#f1f5f9")
C_WHITE      = HexColor("#ffffff")
C_DIVIDER    = HexColor("#cbd5e1")

PAGE_W, PAGE_H = A4
MARGIN_L = 2.0 * cm
MARGIN_R = 2.0 * cm
MARGIN_T = 2.0 * cm
MARGIN_B = 2.0 * cm

OUTPUT = "/home/user/smartlearn-v1/GVEO_Strategie_Commerciale.pdf"


# ─── FLOWABLES ────────────────────────────────────────────────────────────────

class ColorRect(Flowable):
    def __init__(self, width, height, fill_color, radius=0):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.fill_color = fill_color
        self.radius = radius

    def draw(self):
        self.canv.setFillColor(self.fill_color)
        if self.radius:
            self.canv.roundRect(0, 0, self.width, self.height, self.radius, fill=1, stroke=0)
        else:
            self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)


class SectionTag(Flowable):
    def __init__(self, text, width, number=""):
        Flowable.__init__(self)
        self.text = text
        self.width = width
        self.number = number
        self.height = 36

    def draw(self):
        c = self.canv
        c.setFillColor(C_GRAY_LIGHT)
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        c.setFillColor(C_TEAL)
        c.rect(0, 0, 5, self.height, fill=1, stroke=0)
        if self.number:
            c.setFillColor(C_TEAL_MID)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(14, 12, self.number)
        c.setFillColor(C_SLATE)
        c.setFont("Helvetica-Bold", 13)
        x_text = 14 + (30 if self.number else 0)
        c.drawString(x_text, 12, self.text)


class KPICard(Flowable):
    def __init__(self, label, value, color=None):
        Flowable.__init__(self)
        self.label = label
        self.value = value
        self.color = color or C_TEAL
        self.width = 84 * mm
        self.height = 28 * mm

    def draw(self):
        c = self.canv
        c.setFillColor(C_WHITE)
        c.roundRect(0, 0, self.width, self.height, 4, fill=1, stroke=0)
        c.setFillColor(C_DIVIDER)
        c.roundRect(0, 0, self.width, self.height, 4, fill=0, stroke=1)
        c.setFillColor(self.color)
        c.roundRect(0, self.height - 4, self.width, 4, 2, fill=1, stroke=0)
        c.setFillColor(C_GRAY_DARK)
        c.setFont("Helvetica", 8)
        c.drawString(8, self.height - 18, self.label.upper())
        c.setFillColor(C_SLATE)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(8, 8, self.value)


# ─── FOOTER ───────────────────────────────────────────────────────────────────

def on_page(canvas_obj, doc):
    page = doc.page
    if page == 1:
        return
    canvas_obj.saveState()
    canvas_obj.setFillColor(C_TEAL)
    canvas_obj.rect(0, 0, PAGE_W, 8 * mm, fill=1, stroke=0)
    canvas_obj.setFillColor(C_WHITE)
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.drawString(MARGIN_L, 3 * mm, "GVEO — Strategie Commerciale Complete — Confidentiel")
    canvas_obj.drawRightString(PAGE_W - MARGIN_R, 3 * mm, f"Page {page}")
    canvas_obj.restoreState()


# ─── COUVERTURE ───────────────────────────────────────────────────────────────

def build_cover(c, doc):
    c.saveState()
    c.setFillColor(C_TEAL_DARK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    c.setFillColor(C_TEAL)
    c.rect(0, PAGE_H * 0.38, PAGE_W, PAGE_H * 0.62, fill=1, stroke=0)

    c.setFillColor(C_WHITE)
    c.rect(0, PAGE_H * 0.38 - 2, PAGE_W, 4, fill=1, stroke=0)

    c.setFillColor(C_ORANGE)
    c.rect(MARGIN_L, PAGE_H * 0.38 + 8 * mm, 14 * mm, 3, fill=1, stroke=0)

    c.setFillColor(C_WHITE)
    c.setFont("Helvetica-Bold", 52)
    c.drawString(MARGIN_L, PAGE_H * 0.62, "GVEO")

    c.setFont("Helvetica", 13)
    c.setFillColor(C_TEAL_LIGHT)
    c.drawString(MARGIN_L, PAGE_H * 0.62 - 1.2 * cm, "GESTION DE FLOTTE")

    c.setFillColor(C_ORANGE)
    c.rect(MARGIN_L, PAGE_H * 0.62 - 2 * cm, 40 * mm, 2, fill=1, stroke=0)

    c.setFillColor(C_WHITE)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(MARGIN_L, PAGE_H * 0.62 - 3.2 * cm, "Strategie Commerciale Complete")
    c.setFont("Helvetica-Bold", 18)
    c.drawString(MARGIN_L, PAGE_H * 0.62 - 4.1 * cm, "Plan de Lancement Commercial")

    c.setFillColor(C_TEAL_LIGHT)
    c.setFont("Helvetica", 11)
    c.drawString(MARGIN_L, PAGE_H * 0.62 - 5.3 * cm,
                 "Plan de mise sur le marche | Prospection | Reseaux Sociaux | KPIs")

    c.setFillColor(C_GRAY_LIGHT)
    c.rect(0, 0, PAGE_W, PAGE_H * 0.36, fill=1, stroke=0)
    c.setFillColor(C_DIVIDER)
    c.rect(0, PAGE_H * 0.36, PAGE_W, 1, fill=1, stroke=0)

    c.setFillColor(C_GRAY_DARK)
    c.setFont("Helvetica", 9)
    c.drawString(MARGIN_L, PAGE_H * 0.34, "DOCUMENT CONFIDENTIEL — USAGE INTERNE")

    c.setFillColor(C_SLATE)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN_L, PAGE_H * 0.30, "Version 1.0 — Mai 2026")

    c.setFillColor(C_GRAY_DARK)
    c.setFont("Helvetica", 9)
    c.drawString(MARGIN_L, PAGE_H * 0.27, "Responsable Commercial | BUHT Sarl")

    c.setFillColor(C_TEAL)
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(PAGE_W - MARGIN_R, PAGE_H * 0.34, "BUHT Sarl — Business High Tech")
    c.setFillColor(C_GRAY_DARK)
    c.setFont("Helvetica", 9)
    c.drawRightString(PAGE_W - MARGIN_R, PAGE_H * 0.30, "gveo.org")
    c.drawRightString(PAGE_W - MARGIN_R, PAGE_H * 0.27, "Douala, Cameroun")

    c.setFillColor(C_ORANGE)
    c.setStrokeColor(C_ORANGE)
    for i, x in enumerate([PAGE_W * 0.72, PAGE_W * 0.78, PAGE_W * 0.84]):
        sz = 18 - i * 4
        c.roundRect(x, PAGE_H * 0.30, sz, sz, 3, fill=1, stroke=0)

    c.restoreState()


# ─── STYLES ───────────────────────────────────────────────────────────────────

def make_styles():
    base = getSampleStyleSheet()
    s = {}
    s['body'] = ParagraphStyle(
        'body', parent=base['Normal'],
        fontName='Helvetica', fontSize=10, leading=16,
        textColor=C_SLATE, alignment=TA_JUSTIFY, spaceAfter=6
    )
    s['body_sm'] = ParagraphStyle(
        'body_sm', parent=base['Normal'],
        fontName='Helvetica', fontSize=9, leading=14,
        textColor=C_GRAY_DARK, alignment=TA_JUSTIFY, spaceAfter=4
    )
    s['h1'] = ParagraphStyle(
        'h1', parent=base['Heading1'],
        fontName='Helvetica-Bold', fontSize=18, leading=24,
        textColor=C_TEAL_DARK, spaceBefore=18, spaceAfter=8
    )
    s['h2'] = ParagraphStyle(
        'h2', parent=base['Heading2'],
        fontName='Helvetica-Bold', fontSize=13, leading=18,
        textColor=C_TEAL, spaceBefore=14, spaceAfter=6
    )
    s['h3'] = ParagraphStyle(
        'h3', parent=base['Heading3'],
        fontName='Helvetica-Bold', fontSize=11, leading=16,
        textColor=C_SLATE, spaceBefore=10, spaceAfter=4
    )
    s['caption'] = ParagraphStyle(
        'caption', parent=base['Normal'],
        fontName='Helvetica-Oblique', fontSize=8, leading=12,
        textColor=C_GRAY_MID, alignment=TA_CENTER
    )
    s['label'] = ParagraphStyle(
        'label', parent=base['Normal'],
        fontName='Helvetica-Bold', fontSize=9, leading=12,
        textColor=C_TEAL, spaceBefore=2
    )
    s['bullet'] = ParagraphStyle(
        'bullet', parent=base['Normal'],
        fontName='Helvetica', fontSize=10, leading=15,
        textColor=C_SLATE, leftIndent=12, bulletIndent=0, spaceAfter=3
    )
    s['toc_item'] = ParagraphStyle(
        'toc_item', parent=base['Normal'],
        fontName='Helvetica', fontSize=10, leading=16, textColor=C_SLATE
    )
    s['toc_number'] = ParagraphStyle(
        'toc_number', parent=base['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=16, textColor=C_TEAL
    )
    s['highlight'] = ParagraphStyle(
        'highlight', parent=base['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=15, textColor=C_TEAL_DARK
    )
    s['orange'] = ParagraphStyle(
        'orange', parent=base['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=15, textColor=C_ORANGE
    )
    s['green'] = ParagraphStyle(
        'green', parent=base['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=15, textColor=C_GREEN
    )
    s['table_hdr'] = ParagraphStyle(
        'table_hdr', parent=base['Normal'],
        fontName='Helvetica-Bold', fontSize=9, leading=13,
        textColor=C_WHITE
    )
    s['table_cell'] = ParagraphStyle(
        'table_cell', parent=base['Normal'],
        fontName='Helvetica', fontSize=9, leading=13,
        textColor=C_SLATE
    )
    return s


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def sep(story, color=C_DIVIDER):
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1, color=color, spaceAfter=4))


def sp(story, h=6):
    story.append(Spacer(1, h))


def section_header(story, number, title, styles):
    story.append(Spacer(1, 12))
    story.append(SectionTag(title, PAGE_W - MARGIN_L - MARGIN_R, number))
    story.append(Spacer(1, 10))


def bullet_item(story, text, styles, color=C_TEAL):
    p = Paragraph(f'<font color="{color.hexval()}">&#9658;</font>  {text}', styles['bullet'])
    story.append(p)


def info_box(story, title, content_lines, styles, bg=None, border=None):
    bg = bg or C_TEAL_LIGHT
    border = border or C_TEAL_MID
    rows = [[Paragraph(f'<b>{title}</b>', styles['h3'])]]
    for line in content_lines:
        rows.append([Paragraph(line, styles['body_sm'])])
    t = Table(rows, colWidths=[PAGE_W - MARGIN_L - MARGIN_R - 2])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), bg),
        ('BACKGROUND', (0, 1), (-1, -1), C_WHITE),
        ('BOX', (0, 0), (-1, -1), 1, border),
        ('LINEBELOW', (0, 0), (-1, 0), 1, border),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))


def alert_box(story, title, content_lines, styles, color=C_ORANGE):
    rows = [[Paragraph(f'<b>{title}</b>', styles['h3'])]]
    for line in content_lines:
        rows.append([Paragraph(line, styles['body_sm'])])
    t = Table(rows, colWidths=[PAGE_W - MARGIN_L - MARGIN_R - 2])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor("#fff7ed")),
        ('BACKGROUND', (0, 1), (-1, -1), C_WHITE),
        ('BOX', (0, 0), (-1, -1), 1, color),
        ('LINEBELOW', (0, 0), (-1, 0), 1, color),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))


def data_table(story, headers, rows_data, styles, col_widths=None):
    W = PAGE_W - MARGIN_L - MARGIN_R
    if col_widths is None:
        n = len(headers)
        col_widths = [W / n] * n
    table_data = [[Paragraph(h, styles['table_hdr']) for h in headers]]
    for row in rows_data:
        table_data.append([Paragraph(str(cell), styles['table_cell']) for cell in row])
    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_TEAL),
        ('BACKGROUND', (0, 1), (-1, -1), C_WHITE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [C_WHITE, C_GRAY_LIGHT]),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))


def budget_table(story, headers, rows_data, total_row, styles, col_widths=None):
    W = PAGE_W - MARGIN_L - MARGIN_R
    if col_widths is None:
        n = len(headers)
        col_widths = [W / n] * n
    table_data = [[Paragraph(h, styles['table_hdr']) for h in headers]]
    for row in rows_data:
        table_data.append([Paragraph(str(cell), styles['table_cell']) for cell in row])
    if total_row:
        table_data.append([Paragraph(f'<b>{str(cell)}</b>', styles['table_cell']) for cell in total_row])
    t = Table(table_data, colWidths=col_widths)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), C_TEAL_DARK),
        ('BACKGROUND', (0, 1), (-1, -2), C_WHITE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [C_WHITE, C_GRAY_LIGHT]),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]
    if total_row:
        style_cmds += [
            ('BACKGROUND', (0, -1), (-1, -1), HexColor("#e0f2f7")),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, -1), (-1, -1), C_TEAL_DARK),
            ('LINEABOVE', (0, -1), (-1, -1), 1.5, C_TEAL),
        ]
    t.setStyle(TableStyle(style_cmds))
    story.append(t)
    story.append(Spacer(1, 8))


# ─── CONTENU ──────────────────────────────────────────────────────────────────

def build_story(styles):
    story = []
    W = PAGE_W - MARGIN_L - MARGIN_R

    story.append(PageBreak())

    # ── SOMMAIRE ────────────────────────────────────────────────────────────────
    story.append(Paragraph("Sommaire", styles['h1']))
    sep(story, C_TEAL)
    sp(story, 8)

    toc = [
        ("1.", "Strategie Commerciale Globale", "3"),
        ("2.", "Ciblage Geographique et Sectoriel", "4"),
        ("3.", "Strategie Reseaux Sociaux (8 canaux)", "5"),
        ("4.", "Budgets — Lancement & Operations", "7"),
        ("5.", "Plan de Prospection Terrain", "8"),
        ("6.", "KPIs et Indicateurs de Performance", "9"),
        ("7.", "Calendrier d'Execution — 6 Mois", "10"),
        ("8.", "Priorisation Strategique", "11"),
        ("9.", "Analyse B2B — Marche Africain/Camerounais", "12"),
        ("10.", "Plan Operationnel et ROI", "13"),
        ("11.", "Priorisation Budgetaire par Impact", "14"),
        ("12.", "Strategie Low-Budget vers Scale", "15"),
        ("13.", "Pipeline Commercial Professionnel", "16"),
        ("14.", "Reporting et Tableaux de Bord", "17"),
        ("15.", "Approche Realiste Marche Africain", "18"),
    ]

    toc_rows = [[
        Paragraph(num, styles['toc_number']),
        Paragraph(title, styles['toc_item']),
        Paragraph(f"p.{pg}", styles['caption'])
    ] for num, title, pg in toc]

    toc_table = Table(toc_rows, colWidths=[1.2 * cm, W - 2.5 * cm, 1.3 * cm])
    toc_table.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBELOW', (0, 0), (-1, -1), 0.3, C_DIVIDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(toc_table)
    story.append(PageBreak())

    # ── SECTION 1 : STRATEGIE GLOBALE ──────────────────────────────────────────
    section_header(story, "01", "Strategie Commerciale Globale", styles)
    story.append(Paragraph(
        "La strategie commerciale GVEO repose sur une approche en trois phases adaptee au contexte "
        "africain : validation rapide du marche, acquisition organique prioritaire, puis montee en "
        "puissance avec investissement mediatique mesure. L'objectif est d'atteindre la rentabilite "
        "sans levier financier externe.",
        styles['body']
    ))
    sp(story, 6)

    info_box(story, "Vision Commerciale", [
        "<b>Mission :</b> Devenir la reference SaaS de gestion de flotte en Afrique Centrale",
        "<b>Horizon :</b> 50 entreprises clientes en 12 mois | 500 vehicules sous gestion",
        "<b>Differentiateur :</b> Seul outil concu pour le contexte operationnel africain",
        "<b>Modele :</b> Freemium → upsell progressif → contrats Enterprise annuels",
    ], styles)

    story.append(Paragraph("Positionnement Concurrentiel", styles['h2']))
    data_table(story,
        ["Critere", "GVEO", "Solutions Generiques", "Tableurs/Excel"],
        [
            ["Adapte Afrique", "OUI — natif", "Partiel", "Non"],
            ["Mode hors-ligne", "Prevu", "Rare", "Oui mais manuel"],
            ["Freemium 6 mois", "OUI", "Non", "Gratuit mais limité"],
            ["RBAC granulaire", "OUI complet", "Basique", "Non"],
            ["Multi-tenant", "OUI schema isole", "Variable", "Non"],
            ["Prix FCFA adapte", "7 000–15 000/mois", "Trop cher", "Gratuit"],
        ], styles,
        col_widths=[4.5 * cm, 4.5 * cm, 4.5 * cm, 4.5 * cm]
    )

    story.append(Paragraph("Les 4 Piliers de la Strategie", styles['h2']))
    pillars = [
        ["1 — Credibilite", "Demonstrations live, cas d'usage concrets, temoignages clients pilotes"],
        ["2 — Accessibilite", "Freemium 6 mois, prix FCFA, onboarding simple en francais"],
        ["3 — Proximite", "Presence terrain Douala, WhatsApp Business, suivi personnalise"],
        ["4 — Contenu Educatif", "Posts LinkedIn, tutoriels YouTube, webinaires gratuits mensuels"],
    ]
    t = Table(
        [[Paragraph(f'<b>{r[0]}</b>', styles['label']), Paragraph(r[1], styles['body_sm'])] for r in pillars],
        colWidths=[5 * cm, W - 5 * cm]
    )
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), C_TEAL_LIGHT),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t)
    sp(story, 8)
    story.append(PageBreak())

    # ── SECTION 2 : CIBLAGE ─────────────────────────────────────────────────────
    section_header(story, "02", "Ciblage Geographique et Sectoriel", styles)
    story.append(Paragraph(
        "La concentration initiale sur Douala et Yaounde permet de maximiser les ressources "
        "limitees tout en touchant 80% du tissu economique formel camerounais. "
        "L'expansion regionale suit la validation du modele.",
        styles['body']
    ))
    sp(story, 6)

    story.append(Paragraph("Phase 1 — Cameroun (Mois 1-6)", styles['h2']))
    data_table(story,
        ["Ville", "Priorite", "Secteurs Cibles", "Nb Prospects Estimes"],
        [
            ["Douala", "PRIORITAIRE", "Transport, BTP, Distribution, Logistique", "120–150"],
            ["Yaounde", "SECONDAIRE", "Admin publique, ONG, Services", "60–80"],
            ["Bafoussam", "Phase 2", "Agro-industrie, PME", "30–40"],
            ["Kribi/Limbe", "Phase 3", "Industrie petroliere, Portuaire", "20–30"],
        ], styles,
        col_widths=[3.5 * cm, 3 * cm, 6 * cm, 4 * cm]
    )

    story.append(Paragraph("Secteurs Prioritaires par ROI Commercial", styles['h2']))
    data_table(story,
        ["Secteur", "Signal Achat", "Taille Flotte Typique", "Potentiel Mensuel"],
        [
            ["Transport & Logistique", "FORT", "10–50 vehicules", "35 000–75 000 F"],
            ["BTP & Travaux Publics", "FORT", "5–30 engins/vehicules", "35 000–45 000 F"],
            ["Distribution & FMCG", "MOYEN-FORT", "5–20 camions", "35 000–45 000 F"],
            ["ONG & Humanitaire", "MOYEN", "5–15 vehicules", "35 000–45 000 F"],
            ["Administrations pub.", "FAIBLE-MOYEN", "10–100 vehicules", "15 000 F ou custom"],
            ["PME Services", "MOYEN", "2–10 vehicules", "7 000–15 000 F"],
        ], styles,
        col_widths=[4.5 * cm, 2.5 * cm, 4 * cm, 4.5 * cm]
    )

    story.append(Paragraph("Personas Acheteurs Principaux", styles['h2']))
    personas = [
        ["Directeur Logistique", "Besoin : suivi temps reel, rapport carburant. Decision maker direct."],
        ["DG / PDG PME", "Besoin : vision globale couts fleet. Signe les contrats."],
        ["DAF / Comptable", "Besoin : maitrise budget vehicules, justificatifs. Influence achat."],
        ["Responsable Maintenance", "Besoin : alertes preventives, historique reparations. Champion interne."],
    ]
    t = Table(
        [[Paragraph(f'<b>{r[0]}</b>', styles['label']), Paragraph(r[1], styles['body_sm'])] for r in personas],
        colWidths=[5 * cm, W - 5 * cm]
    )
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor("#fff7ed")),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t)
    sp(story, 8)
    story.append(PageBreak())

    # ── SECTION 3 : RESEAUX SOCIAUX ─────────────────────────────────────────────
    section_header(story, "03", "Strategie Reseaux Sociaux — 8 Canaux", styles)
    story.append(Paragraph(
        "Strategie de contenu multi-canal adaptee au budget zero, avec priorite absolue "
        "sur les plateformes a fort ROI organique pour le B2B africain.",
        styles['body']
    ))
    sp(story, 6)

    channels = [
        {
            "name": "LinkedIn — Canal Prioritaire B2B",
            "color": HexColor("#0077b5"),
            "freq": "5 posts/semaine",
            "audience": "Directeurs, DG, DAF, Responsables logistique",
            "types": [
                "Lundi : Probleme metier (ex: 'Combien vous coute 1 vehicule fantome ?')",
                "Mercredi : Demo fonctionnalite (capture ecran + explication)",
                "Vendredi : Resultat client ou donnee sectorielle africaine",
                "Hebdo : Article long (800–1200 mots) sur gestion de flotte",
                "Mensuel : Etude de cas client (avec accord)",
            ]
        },
        {
            "name": "WhatsApp Business — Canal Conversion",
            "color": HexColor("#25d366"),
            "freq": "Quotidien (reponse < 2h)",
            "audience": "Prospects chauds, clients actifs, partenaires",
            "types": [
                "Catalogue produit : offres Starter/Essentiel avec visuels",
                "Broadcast hebdo : tip metier (max 1/semaine pour ne pas spammer)",
                "Groupe clients pilotes : feedback, annonces nouvelles fonctions",
                "Lien direct depuis LinkedIn et Instagram pour prise de contact",
            ]
        },
        {
            "name": "Facebook — Notoriete & Communaute Locale",
            "color": HexColor("#1877f2"),
            "freq": "3 posts/semaine",
            "audience": "PME locales, groupes professionnels camerounais",
            "types": [
                "Page pro GVEO : visuels produit, temoignages, offres",
                "Presence dans groupes : 'Entrepreneurs Cameroun', 'Transport Cameroun'",
                "Evenements : annonces webinaires, formations",
                "Boost payant cible (budget : 5 000–10 000 F/semaine Phase 2)",
            ]
        },
        {
            "name": "YouTube — Education & SEO Long Terme",
            "color": HexColor("#ff0000"),
            "freq": "1 video/semaine (15–20 min)",
            "audience": "Utilisateurs, decideurs recherchant solutions flotte",
            "types": [
                "Tutoriels : 'Comment configurer un vehicule dans GVEO'",
                "Comparatifs : 'Excel vs GVEO pour gerer sa flotte'",
                "Demos live : modules maintenance, carburant, statistiques",
                "Webinaires enregistres : sessions Q&A avec prospects",
            ]
        },
        {
            "name": "Instagram — Marque & Visuels",
            "color": HexColor("#e4405f"),
            "freq": "3 posts/semaine + Stories quotidiennes",
            "audience": "Jeunes entrepreneurs, startups, decideurs 25-40 ans",
            "types": [
                "Infographies : statistiques flotte, couts moyens Afrique",
                "Behind the scenes : equipe, developpement, evenements",
                "Stories : sondages, Q&A, teaser nouvelles features",
                "Reels : demo rapide 60s d'une fonctionnalite",
            ]
        },
        {
            "name": "X (Twitter) — Veille & Networking",
            "color": C_SLATE,
            "freq": "2–3 tweets/jour",
            "audience": "Tech community, journalistes, investisseurs africains",
            "types": [
                "Partage d'articles sectoriels avec commentaire personnel",
                "Thread hebdo : insight metier gestion de flotte",
                "Engagement : repondre aux conversations #StartupAfrique #Flotte",
                "Annonces produit : nouvelles features, mises a jour",
            ]
        },
        {
            "name": "TikTok — Croissance Organique Rapide",
            "color": HexColor("#010101"),
            "freq": "1 video/jour (60–90 sec)",
            "audience": "Entrepreneurs 20-35 ans, etudiants en gestion",
            "types": [
                "Probleme/Solution : format 'Saviez-vous que...' + demo GVEO",
                "Jour dans la vie d'un gestionnaire de flotte",
                "Tips rapides : optimiser carburant, maintenance preventive",
                "Reactions : commenter des news transport africain",
            ]
        },
        {
            "name": "Email Marketing — Nurturing & Fidelisation",
            "color": C_TEAL,
            "freq": "1 newsletter/semaine + sequences automatisees",
            "audience": "Leads, prospects en essai gratuit, clients actifs",
            "types": [
                "Sequence bienvenue (J0, J3, J7, J14, J30) pour nouveaux inscrits",
                "Newsletter hebdo : tips, nouvelles features, cas client",
                "Email de relance : inactifs apres 7 jours sans connexion",
                "Upsell : proposition upgrade Essentiel → Enterprise au mois 5",
                "Outil suggere : Brevo (gratuit jusqu'a 300 emails/jour)",
            ]
        },
    ]

    for ch in channels:
        story.append(Paragraph(ch["name"], styles['h2']))
        story.append(Paragraph(
            f'<b>Frequence :</b> {ch["freq"]} | <b>Cible :</b> {ch["audience"]}',
            styles['body_sm']
        ))
        for item in ch["types"]:
            bullet_item(story, item, styles, ch["color"])
        sp(story, 4)

    story.append(PageBreak())

    # ── SECTION 4 : BUDGETS LANCEMENT ───────────────────────────────────────────
    section_header(story, "04", "Budgets — Lancement & Operations", styles)
    alert_box(story, "Contexte de Lancement — Investissement Optimise", [
        "Ces budgets sont calibres pour une phase de lancement avec des ressources controlees.",
        "Priorite absolue : canaux organiques a fort impact. Les depenses payantes n'interviennent qu'en Phase 2.",
        "Tout ce qui peut etre realise en interne le sera en interne. Sous-traitance minimale.",
    ], styles, C_ORANGE)

    story.append(Paragraph("Budget Lancement (Unique — Mois 0)", styles['h2']))
    budget_table(story,
        ["Poste", "Details", "Cout (FCFA)"],
        [
            ["Domaine & Hebergement", "1 an domaine + hosting VPS basique", "15 000"],
            ["Identite visuelle", "Logo, charte (Canva Pro 1 mois ou freelance junior)", "10 000"],
            ["Photo/Video pro", "1 session shooting produit/equipe", "15 000"],
            ["Materiel de prospection", "Cartes de visite (100 ex), flyers A5 (200 ex)", "10 000"],
            ["Telephonie pro", "SIM dediee + abonnement WhatsApp Business", "5 000"],
        ],
        ["TOTAL LANCEMENT", "", "55 000 FCFA"],
        styles,
        col_widths=[5 * cm, 7.5 * cm, 4 * cm]
    )

    story.append(Paragraph("Budget Mensuel — Phase 1 (Mois 1-3)", styles['h2']))
    budget_table(story,
        ["Poste", "Details", "Cout/Mois (FCFA)"],
        [
            ["Transport prospection", "Deplacements terrain Douala (moto/taxi)", "20 000"],
            ["Contenu digital", "Canva Pro + outils creation (si pas forfait annuel)", "5 000"],
            ["Publicite cibelee", "Phase 1 = ZERO (100% organique)", "0"],
            ["Outils CRM/Email", "Brevo gratuit + Notion free tier", "0"],
            ["Evenements/Networking", "1 event professionnel/mois (inscription)", "15 000"],
            ["Divers (imprevu)", "Reserve 5% budget", "10 000"],
            ["Remuneration commerciale", "Commission sur ventes (% CA) ou forfait minimal", "35 000"],
        ],
        ["TOTAL PHASE 1/MOIS", "", "85 000 FCFA"],
        styles,
        col_widths=[5 * cm, 7.5 * cm, 4 * cm]
    )

    story.append(Paragraph("Budget Mensuel — Phase 2 (Mois 4-6)", styles['h2']))
    budget_table(story,
        ["Poste", "Details", "Cout/Mois (FCFA)"],
        [
            ["Transport prospection", "Intensification terrain + Yaounde", "35 000"],
            ["Publicite Facebook/Instagram", "Boost posts cibles PME Douala", "25 000"],
            ["Publicite LinkedIn", "Campagne Decision Makers (compte personnel)", "20 000"],
            ["Contenu video", "1 video YouTube pro/mois (montage)", "20 000"],
            ["Evenements", "1 webinaire gratuit ou presence salon", "20 000"],
            ["Outils premium", "CRM, outils analytics (si CA le justifie)", "15 000"],
            ["Remuneration commerciale", "Fixe + commission progressive", "75 000"],
            ["Reserve/Imprevu", "10% budget", "28 000"],
        ],
        ["TOTAL PHASE 2/MOIS", "", "238 000 FCFA"],
        styles,
        col_widths=[5 * cm, 7.5 * cm, 4 * cm]
    )

    story.append(Paragraph("Recapitulatif Budget 6 Mois", styles['h2']))
    budget_table(story,
        ["Periode", "Cout", "Cumul"],
        [
            ["Lancement (M0)", "55 000 F", "55 000 F"],
            ["Phase 1 — M1", "85 000 F", "140 000 F"],
            ["Phase 1 — M2", "85 000 F", "225 000 F"],
            ["Phase 1 — M3", "85 000 F", "310 000 F"],
            ["Phase 2 — M4", "238 000 F", "548 000 F"],
            ["Phase 2 — M5", "238 000 F", "786 000 F"],
            ["Phase 2 — M6", "238 000 F", "1 024 000 F"],
        ],
        ["INVESTISSEMENT TOTAL 6 MOIS", "~1 024 000 FCFA", "soit ~1 562 EUR"],
        styles,
        col_widths=[5 * cm, 5 * cm, 6.5 * cm]
    )

    info_box(story, "Point de rentabilite", [
        "Avec 7 clients Essentiel (15 000 F/mois) = 105 000 F/mois — couvre Phase 1",
        "Avec 3 clients Essentiel + 1 Enterprise (50 000 F) = 95 000 F — couvre Phase 1",
        "Break-even Phase 2 : ~16 clients Essentiel ou mix equivalent",
        "Objectif M6 : 25–30 clients actifs → CA mensuel 300 000–450 000 F",
    ], styles)
    story.append(PageBreak())

    # ── SECTION 5 : PROSPECTION TERRAIN ─────────────────────────────────────────
    section_header(story, "05", "Plan de Prospection Terrain", styles)
    story.append(Paragraph(
        "La prospection terrain reste le canal le plus efficace sur le marche camerounais. "
        "Le contact humain, la demonstration en live et le suivi personnalise ont un taux "
        "de conversion 3-5x superieur au digital pur.",
        styles['body']
    ))
    sp(story, 6)

    story.append(Paragraph("Methode de Prospection — Script en 5 Etapes", styles['h2']))
    etapes = [
        ["1 — Identification", "Reperer l'entreprise (Google Maps, annuaires, terrain). Identifier le bon contact."],
        ["2 — Accroche", "Appel ou visite : 'Bonjour, je suis de GVEO, on aide les entreprises a reduire de 20% leurs couts de flotte. Vous avez 10 minutes ?'"],
        ["3 — Demo Live", "Tablet/laptop : demo en temps reel de l'app. Montrer le module le plus pertinent pour leur secteur."],
        ["4 — Offre Zero Risque", "Proposer 6 mois gratuits Plan Decouverte. Objectif : entrer dans la boite sans friction."],
        ["5 — Follow-up", "WhatsApp J+3, email J+7, rappel J+14. CRM pour tracker chaque prospect."],
    ]
    t = Table(
        [[Paragraph(f'<b>{r[0]}</b>', styles['label']), Paragraph(r[1], styles['body_sm'])] for r in etapes],
        colWidths=[4 * cm, W - 4 * cm]
    )
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), C_TEAL_LIGHT),
        ('ROWBACKGROUNDS', (1, 0), (1, -1), [C_WHITE, C_GRAY_LIGHT]),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t)
    sp(story, 8)

    story.append(Paragraph("Objectifs Prospection Terrain Hebdomadaires", styles['h2']))
    data_table(story,
        ["Activite", "Frequence", "Objectif Mensuel"],
        [
            ["Appels de decouverte (cold call)", "10/jour", "200 appels"],
            ["Visites terrain entreprises", "5/jour", "100 visites"],
            ["Demos planifiees", "3/jour", "60 demos"],
            ["Propositions commerciales envoyees", "Selon demos", "20–30 propositions"],
            ["Contrats signes (cible)", "—", "5–8 nouveaux clients"],
        ], styles
    )

    story.append(Paragraph("Zones de Prospection Prioritaires — Douala", styles['h2']))
    zones = [
        "Bonanjo / Zone Portuaire : societes d'import-export, logistique, transitaires",
        "Akwa / Bonamoussadi : PME services, distribution, agences diverses",
        "Bonaberi / Zone Industrielle : usines, BTP, transport lourd",
        "Bassa / Cite des Palmiers : industrie, transport, artisans formes",
        "Zones commerciales : marches grossistes, grandes surfaces avec flotte livraison",
    ]
    for z in zones:
        bullet_item(story, z, styles)
    sp(story, 8)
    story.append(PageBreak())

    # ── SECTION 6 : KPIs ────────────────────────────────────────────────────────
    section_header(story, "06", "KPIs et Indicateurs de Performance", styles)
    story.append(Paragraph(
        "Les KPIs sont divises en 3 categories : acquisition (generer des leads), "
        "conversion (transformer en clients), retention (garder et faire grandir le compte).",
        styles['body']
    ))
    sp(story, 6)

    story.append(Paragraph("KPIs Acquisition", styles['h2']))
    data_table(story,
        ["Indicateur", "Cible M1-3", "Cible M4-6", "Mesure"],
        [
            ["Appels passes/semaine", "50", "80", "CRM quotidien"],
            ["Demos realisees/semaine", "10", "20", "Agenda + CRM"],
            ["Leads qualifies/mois", "30", "60", "Formulaire + appel"],
            ["Trafic LinkedIn/mois", "500 vues profil", "2 000 vues", "LinkedIn Analytics"],
            ["Abonnes LinkedIn", "+50/mois", "+100/mois", "LinkedIn Analytics"],
            ["Inscriptions Decouverte/mois", "10", "25", "Dashboard GVEO"],
        ], styles,
        col_widths=[5.5 * cm, 3 * cm, 3 * cm, 5 * cm]
    )

    story.append(Paragraph("KPIs Conversion", styles['h2']))
    data_table(story,
        ["Indicateur", "Cible M1-3", "Cible M4-6", "Mesure"],
        [
            ["Taux demo → client", "> 10%", "> 15%", "CRM / Contrats"],
            ["Duree cycle de vente", "< 21 jours", "< 14 jours", "CRM dates"],
            ["Clients actifs total", "8 a M3", "25 a M6", "Dashboard GVEO"],
            ["CA mensuel", "120 000 F", "375 000 F", "Comptabilite"],
            ["Panier moyen", "15 000 F", "20 000 F", "CA / Nb clients"],
            ["Taux de conversion essai", "> 30%", "> 40%", "Dashboard GVEO"],
        ], styles,
        col_widths=[5.5 * cm, 3 * cm, 3 * cm, 5 * cm]
    )

    story.append(Paragraph("KPIs Retention & Croissance", styles['h2']))
    data_table(story,
        ["Indicateur", "Cible", "Mesure"],
        [
            ["Taux de churn mensuel", "< 5%", "Dashboard GVEO"],
            ["NPS (satisfaction client)", "> 7/10", "Enquete mensuelle"],
            ["Upsell rate (Starter → Essentiel)", "> 20% au M5", "CRM + facturation"],
            ["Clients Enterprise", "2 contrats a M6", "Suivi commercial"],
            ["Referrals (bouche a oreille)", "2 introductions/client/an", "Tracking source lead"],
        ], styles
    )
    story.append(PageBreak())

    # ── SECTION 7 : CALENDRIER ──────────────────────────────────────────────────
    section_header(story, "07", "Calendrier d'Execution — 6 Mois", styles)
    story.append(Paragraph(
        "Calendrier operationnel detail par phase, avec jalons mesurables et actions prioritaires "
        "par semaine pour le responsable commercial.",
        styles['body']
    ))
    sp(story, 6)

    data_table(story,
        ["Mois", "Phase", "Actions Cles", "Jalon"],
        [
            ["M0 — Avant lancement", "Preparation", "Setup WhatsApp Business, profil LinkedIn pro, CRM Notion, materiel prospection", "Tout est pret J-1"],
            ["M1", "Lancement", "100 appels, 50 visites, 20 demos, 5 propositions. LinkedIn 5 posts/sem.", "3 clients Decouverte signes"],
            ["M2", "Acceleration", "200 appels, 80 visites, 30 demos, 10 propositions. Premier webinaire.", "6 clients actifs, 1er client payant"],
            ["M3", "Consolidation", "Convertir essais gratuits. Relances systematiques. Temoignages clients.", "8 clients actifs, 2 payants. Bilan Phase 1."],
            ["M4", "Montee puissance", "Debut pub payante LinkedIn/Facebook. Expansion Yaounde. 2 demos/jour.", "15 clients, 5 payants, 1 Enterprise"],
            ["M5", "Croissance", "Upsell clients Phase 1. Referrals. Evenement sectoriel. 3 demos/jour.", "20 clients, 10 payants, CA > 150 000 F"],
            ["M6", "Scale", "25 clients actifs cible. 1 partenariat revendeur. Bilan annuel.", "25 clients, break-even atteint"],
        ], styles,
        col_widths=[2.5 * cm, 2.5 * cm, 7.5 * cm, 4 * cm]
    )

    story.append(Paragraph("Routine Hebdomadaire Commerciale", styles['h2']))
    routine = [
        ["Lundi", "Bilan semaine precedente, planification visites, 20 appels, 2 posts LinkedIn"],
        ["Mardi", "Prospection terrain matin (5 visites), demos l'apres-midi, suivi CRM"],
        ["Mercredi", "Cold calls x20, relances prospects chauds, creation 1 post LinkedIn/Instagram"],
        ["Jeudi", "Prospection terrain, demos planifiees, envoi propositions commerciales"],
        ["Vendredi", "Relances hebdo (WhatsApp + email), reporting KPIs, preparation contenu sem. suivante"],
    ]
    t = Table(
        [[Paragraph(f'<b>{r[0]}</b>', styles['label']), Paragraph(r[1], styles['body_sm'])] for r in routine],
        colWidths=[3 * cm, W - 3 * cm]
    )
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor("#f0fdf4")),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t)
    sp(story, 8)
    story.append(PageBreak())

    # ── SECTION 8 : PRIORISATION ─────────────────────────────────────────────────
    section_header(story, "08", "Priorisation Strategique", styles)
    story.append(Paragraph(
        "La matrice de priorisation classe chaque action selon son impact commercial "
        "vs son cout en temps/argent. En phase de lancement, on execute d'abord les actions "
        "a fort impact et faible cout.",
        styles['body']
    ))
    sp(story, 6)

    data_table(story,
        ["Action", "Impact", "Cout", "Priorite", "Quand"],
        [
            ["Prospection terrain Douala", "TRES FORT", "Temps", "P0 — URGENT", "Des M1"],
            ["LinkedIn contenu organique", "FORT", "Temps", "P0 — URGENT", "Des M1"],
            ["WhatsApp Business setup", "FORT", "Gratuit", "P0 — URGENT", "Avant M1"],
            ["Demo personnalisee", "TRES FORT", "Temps", "P1", "Des M1"],
            ["Webinaire gratuit mensuel", "MOYEN-FORT", "Temps", "P1", "Des M2"],
            ["YouTube tutoriels", "MOYEN (long terme)", "Temps", "P2", "Des M2"],
            ["Email sequences auto", "FORT", "Gratuit (Brevo)", "P1", "Des M1"],
            ["Facebook/Instagram organic", "MOYEN", "Temps", "P2", "Des M2"],
            ["Pub payante Facebook", "FORT", "25 000 F/mois", "P3", "Phase 2 M4+"],
            ["Pub payante LinkedIn", "FORT", "20 000 F/mois", "P3", "Phase 2 M4+"],
            ["Partenariats revendeurs", "TRES FORT", "Temps", "P2", "Des M3"],
            ["TikTok organique", "VARIABLE", "Temps", "P3", "Si ressources dispo"],
        ], styles,
        col_widths=[5 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm, 3 * cm]
    )

    info_box(story, "Regle d'Or Commerciale", [
        "Faites d'abord ce qui est a FORT IMPACT : terrain + LinkedIn + WhatsApp",
        "Mesurez les resultats a chaque fin de mois avant d'intensifier les investissements",
        "N'activez la publicite payante que lorsque le message qui convertit est valide en organique",
        "Un franc investi en prospection terrain rapporte plus qu'un franc en publicite au stade de lancement",
    ], styles)
    story.append(PageBreak())

    # ── SECTION 9 : ANALYSE B2B AFRICAIN ────────────────────────────────────────
    section_header(story, "09", "Analyse B2B — Marche Africain/Camerounais", styles)
    story.append(Paragraph(
        "Le marche B2B camerounais a ses propres codes. Comprendre ces specificites "
        "est la cle pour adapter le pitch, le cycle de vente et les arguments commerciaux.",
        styles['body']
    ))
    sp(story, 6)

    story.append(Paragraph("Specificites du Marche Local", styles['h2']))
    specs = [
        ["Confiance avant tout", "La relation prime sur le produit. Soyez present, referable, fiable. Un prospect qui vous connait personnellement convertit 5x mieux."],
        ["Decision lente en PME", "Budget, ROI, validation DG : compter 4-8 semaines pour une PME. Etre patient et present sans etre intrusif."],
        ["Sensibilite au prix", "Le 'c'est trop cher' est une objection reflexe. Preparer un ROI chiffre : combien GVEO leur fait economiser en F/mois."],
        ["Reseau = pipeline", "80% des deals se font par introduction. Identifier les connector locaux (associations pro, GIE, clubs d'affaires)."],
        ["Mobile-first", "WhatsApp est LE canal business. Votre presence WhatsApp Business est plus importante que votre site web."],
        ["Peur du SaaS", "Certains ne font pas confiance au cloud. Avoir un argumentaire clair sur la securite des donnees et l'option on-premise."],
    ]
    t = Table(
        [[Paragraph(f'<b>{r[0]}</b>', styles['label']), Paragraph(r[1], styles['body_sm'])] for r in specs],
        colWidths=[4.5 * cm, W - 4.5 * cm]
    )
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), C_TEAL_LIGHT),
        ('ROWBACKGROUNDS', (1, 0), (1, -1), [C_WHITE, C_GRAY_LIGHT]),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t)
    sp(story, 8)

    story.append(Paragraph("Objections Frequentes et Reponses", styles['h2']))
    objections = [
        ["'On n'a pas le budget'",
         "Reponse : 'C'est gratuit 6 mois. Pendant ces 6 mois, GVEO vous fait economiser X FCFA sur le carburant et les reparations. Vous ne risquez rien.'"],
        ["'On gere deja avec Excel'",
         "Reponse : 'Excel ne vous envoie pas d'alerte quand un vehicule depasse son quota carburant. GVEO si. Et ca prend 5 minutes a configurer.'"],
        ["'On verra plus tard'",
         "Reponse : 'Je comprends. Puis-je vous envoyer notre calcul ROI pour votre taille de flotte ? Ca prend 2 minutes et vous decide vous-meme si c'est le bon moment.'"],
        ["'Nos donnees seront en securite ?'",
         "Reponse : 'Oui. Chaque client a sa propre base de donnees isolee (schema dedie). Vos donnees ne melangent jamais avec celles d'un autre client. Et vous pouvez choisir le mode On-Premise pour heberger chez vous.'"],
    ]
    for i, (obj, rep) in enumerate(objections):
        story.append(Paragraph(f'<b>Objection : {obj}</b>', styles['highlight']))
        story.append(Paragraph(rep, styles['body_sm']))
        sp(story, 3)
    story.append(PageBreak())

    # ── SECTION 10 : PLAN OPERATIONNEL & ROI ────────────────────────────────────
    section_header(story, "10", "Plan Operationnel et ROI", styles)
    story.append(Paragraph(
        "Projection financiere realiste sur 6 mois pour la phase de lancement, avec scenarios "
        "pessimiste, realiste et optimiste.",
        styles['body']
    ))
    sp(story, 6)

    story.append(Paragraph("Projections CA — 3 Scenarios", styles['h2']))
    data_table(story,
        ["Scenario", "M3 Clients", "M3 CA/mois", "M6 Clients", "M6 CA/mois", "ROI 6 mois"],
        [
            ["Pessimiste", "4 clients", "50 000 F", "12 clients", "168 000 F", "-856 000 F"],
            ["Realiste", "8 clients", "104 000 F", "25 clients", "325 000 F", "-374 000 F"],
            ["Optimiste", "15 clients", "195 000 F", "40 clients", "540 000 F", "+76 000 F"],
        ], styles,
        col_widths=[3 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm, 3.5 * cm]
    )

    story.append(Paragraph(
        "Note : Le scenario realiste genere un deficit de ~374 000 F sur 6 mois. "
        "Ce deficit doit etre couvert par les fonds propres de BUHT Sarl ou par une avance de l'associe. "
        "Break-even complet prevu entre M8 et M10.",
        styles['body_sm']
    ))
    sp(story, 6)

    story.append(Paragraph("Calcul ROI Client — Argument Commercial", styles['h2']))
    info_box(story, "Exemple : Entreprise avec 10 vehicules", [
        "Economie carburant estimee : -15% grace aux alertes depassement → ~45 000 F/mois",
        "Reduction couts reparation (maintenance preventive) : -20% → ~30 000 F/mois",
        "Gain de temps administratif : 5h/semaine → valeur 20 000 F/mois",
        "TOTAL GAINS ESTIMES : ~95 000 F/mois",
        "COUT GVEO Essentiel : 15 000 F/mois",
        "ROI MENSUEL POUR LE CLIENT : 6.3x — soit 530% de retour sur investissement",
    ], styles)
    story.append(PageBreak())

    # ── SECTION 11 : PRIORISATION BUDGETAIRE ────────────────────────────────────
    section_header(story, "11", "Priorisation Budgetaire par Impact", styles)
    story.append(Paragraph(
        "Comment allouer chaque franc disponible pour maximiser le retour commercial. "
        "Chaque poste est evalue sur son ratio impact/cout.",
        styles['body']
    ))
    sp(story, 6)

    data_table(story,
        ["Rang", "Canal/Action", "Cout Mensuel", "Impact Estime", "Ratio I/C"],
        [
            ["#1", "Prospection terrain (temps)", "0 F + transport", "5-8 clients/mois", "MAXIMAL"],
            ["#2", "LinkedIn organique (temps)", "0 F", "20-50 leads/mois", "MAXIMAL"],
            ["#3", "WhatsApp Business", "0 F", "Conversion +40%", "MAXIMAL"],
            ["#4", "Email sequences (Brevo)", "0 F", "Nurturing auto", "TRES FORT"],
            ["#5", "Webinaire mensuel (Zoom free)", "0 F", "5-15 leads qualifies", "TRES FORT"],
            ["#6", "Transport prospection", "20 000 F", "Acces 100+ prospects", "FORT"],
            ["#7", "Materiel (cartes/flyers)", "5 000 F/mois", "Credibilite +", "MOYEN"],
            ["#8", "Pub Facebook/Instagram", "25 000 F/mois", "Notoriete locale", "MOYEN"],
            ["#9", "Pub LinkedIn", "20 000 F/mois", "Decision makers B2B", "FORT (Phase 2)"],
            ["#10", "Video YouTube", "20 000 F/mois", "SEO long terme", "MOYEN-LONG"],
        ], styles,
        col_widths=[1.5 * cm, 5 * cm, 3.5 * cm, 3.5 * cm, 3 * cm]
    )
    story.append(PageBreak())

    # ── SECTION 12 : LOW-BUDGET → SCALE ─────────────────────────────────────────
    section_header(story, "12", "Strategie Low-Budget vers Scale", styles)
    story.append(Paragraph(
        "La trajectoire de croissance d'une startup zero-revenue est bien documentee. "
        "Voici le chemin de GVEO de la phase de lancement vers la croissance acceleree.",
        styles['body']
    ))
    sp(story, 6)

    phases_scale = [
        {
            "phase": "PHASE 0 — Validation (M0-M1)",
            "color": C_ORANGE,
            "actions": [
                "Signer les 3 premiers clients pilotes (critiques pour la credibilite)",
                "Identifier les 2-3 use cases ou GVEO cree le plus de valeur",
                "Collecter des temoignages et mesures d'impact concrets",
                "Valider le pricing : les clients sont-ils prets a payer apres l'essai ?",
            ]
        },
        {
            "phase": "PHASE 1 — Traction (M2-M4)",
            "color": C_TEAL,
            "actions": [
                "Atteindre 10 clients payants : preuve que le modele fonctionne",
                "Documenter le processus de vente qui marche (playbook commercial)",
                "Creer 2-3 cas clients detailles pour LinkedIn et site web",
                "Commencer a developper un reseau de partenaires/revendeurs",
            ]
        },
        {
            "phase": "PHASE 2 — Croissance (M5-M9)",
            "color": C_GREEN,
            "actions": [
                "Activer les canaux payants (pub) avec messages valides en organique",
                "Recruter un 2e commercial si CA le permet (commission)",
                "Expansion Yaounde avec le meme playbook",
                "Premiers contrats Enterprise (50 000+ F/mois)",
                "Reflexion levee de fonds ou autofinancement sur la croissance",
            ]
        },
        {
            "phase": "PHASE 3 — Scale (M10-M18)",
            "color": HexColor("#7c3aed"),
            "actions": [
                "100+ clients actifs au Cameroun",
                "Ouverture marche : Cote d'Ivoire ou Senegal",
                "Equipe commerciale dediee (2-3 personnes)",
                "Partenariats avec associations transport, BTP, ONG",
                "CA > 2 000 000 F/mois → model viable independant",
            ]
        },
    ]

    for ph in phases_scale:
        story.append(Paragraph(ph["phase"], styles['h2']))
        for action in ph["actions"]:
            bullet_item(story, action, styles, ph["color"])
        sp(story, 4)

    story.append(PageBreak())

    # ── SECTION 13 : PIPELINE COMMERCIAL ────────────────────────────────────────
    section_header(story, "13", "Pipeline Commercial Professionnel", styles)
    story.append(Paragraph(
        "Le pipeline est le systeme nerveux de votre activite commerciale. "
        "Chaque prospect doit etre classe a une etape precise, avec une action de suivi planifiee.",
        styles['body']
    ))
    sp(story, 6)

    story.append(Paragraph("Les 7 Etapes du Pipeline GVEO", styles['h2']))
    pipeline = [
        ["1 — LEAD", "Contact identifie, pas encore qualifie", "Entrer dans CRM", "< 24h"],
        ["2 — QUALIFIE", "A une flotte, un budget potentiel, un interlocuteur identifie", "Appel de qualification 15 min", "< 3 jours"],
        ["3 — DEMO", "Demo programmee ou realisee", "Envoyer recap + lien Decouverte", "J+1 apres demo"],
        ["4 — ESSAI", "En cours d'evaluation sur plan Decouverte gratuit", "Accompagnement actif, check-in J+7", "Hebdomadaire"],
        ["5 — PROPOSITION", "Offre tarifaire envoyee", "Relance J+3 puis J+7", "< 3 jours"],
        ["6 — NEGOCIATION", "Discussion prix/conditions", "Maintenir contact, proposer alternatives", "< 2 jours"],
        ["7 — GAGNE/PERDU", "Decision finale", "Si gagne : onboarding. Si perdu : analyser pourquoi.", "Immediat"],
    ]
    data_table(story,
        ["Etape", "Definition", "Action Cle", "Delai Max"],
        pipeline, styles,
        col_widths=[2.5 * cm, 4.5 * cm, 4.5 * cm, 5 * cm - 0.5 * cm]
    )

    story.append(Paragraph("Outils CRM Recommandes (Zero Budget)", styles['h2']))
    crm_tools = [
        ["Notion (gratuit)", "Tableau Kanban pipeline. Simple, visuel, accessible mobile."],
        ["Google Sheets", "Si l'equipe prefere tableur. Template pipeline disponible."],
        ["HubSpot CRM Free", "CRM professionnel gratuit. Email tracking, sequences, reporting."],
        ["Trello (gratuit)", "Tableau Kanban simple pour visualiser les etapes."],
        ["WhatsApp + Labels", "Labelliser les contacts WhatsApp Business par etape pipeline."],
    ]
    t = Table(
        [[Paragraph(f'<b>{r[0]}</b>', styles['label']), Paragraph(r[1], styles['body_sm'])] for r in crm_tools],
        colWidths=[4 * cm, W - 4 * cm]
    )
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor("#f0fdf4")),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t)
    sp(story, 8)
    story.append(PageBreak())

    # ── SECTION 14 : REPORTING ───────────────────────────────────────────────────
    section_header(story, "14", "Reporting et Tableaux de Bord", styles)
    story.append(Paragraph(
        "Un reporting regulier est essentiel pour piloter la performance, corriger les ecarts "
        "et justifier les investissements aupres des fondateurs. Ce qui ne se mesure pas ne s'ameliore pas.",
        styles['body']
    ))
    sp(story, 6)

    story.append(Paragraph("Reporting Quotidien (5 min)", styles['h2']))
    daily = [
        "Nb appels passes aujourd'hui",
        "Nb visites/demos realisees",
        "Nouveaux leads ajoutes au CRM",
        "Relances effectuees",
        "1 apprentissage cle du jour",
    ]
    for d in daily:
        bullet_item(story, d, styles)
    sp(story, 4)

    story.append(Paragraph("Reporting Hebdomadaire (30 min — Vendredi)", styles['h2']))
    weekly = [
        "Total appels/visites/demos de la semaine vs objectif",
        "Nouveaux prospects qualifies",
        "Evolution du pipeline (nb par etape)",
        "Contrats signes ou en cours",
        "Top 3 objections rencontrees et reponses utilisees",
        "1 ajustement de la strategie pour la semaine suivante",
    ]
    for w in weekly:
        bullet_item(story, w, styles)
    sp(story, 4)

    story.append(Paragraph("Reporting Mensuel (Bilan Strategique)", styles['h2']))
    data_table(story,
        ["Metrique", "Mois N", "Mois N-1", "Objectif", "Ecart"],
        [
            ["Clients actifs total", "—", "—", "Voir section 6", "—"],
            ["CA mensuel (FCFA)", "—", "—", "Voir section 10", "—"],
            ["Taux de conversion demos", "—", "—", "> 10%", "—"],
            ["Nouveaux leads qualifies", "—", "—", "30 / 60", "—"],
            ["Taux de churn", "—", "—", "< 5%", "—"],
            ["Abonnes LinkedIn", "—", "—", "+50 / +100", "—"],
        ], styles,
        col_widths=[5 * cm, 2.5 * cm, 2.5 * cm, 3.5 * cm, 3 * cm]
    )

    info_box(story, "Dashboard Recommande", [
        "Creer un Google Sheet 'Dashboard Commercial GVEO' mis a jour chaque vendredi",
        "Partager avec les fondateurs pour transparence et decision collaborative",
        "Inclure un graphique evolution CA cumulatif et projection fin d'annee",
        "Ajouter un onglet 'Learnings' pour capitaliser les apprentissages terrains",
    ], styles)
    story.append(PageBreak())

    # ── SECTION 15 : APPROCHE AFRICAINE ─────────────────────────────────────────
    section_header(story, "15", "Approche Realiste — Marche Africain", styles)
    story.append(Paragraph(
        "La derniere section est la plus importante. Elle recapitule les verites "
        "du terrain africain que toute strategie commerciale doit integrer pour reussir.",
        styles['body']
    ))
    sp(story, 6)

    truths = [
        {
            "title": "La patience est une strategie",
            "content": "En Afrique, les cycles de vente B2B prennent du temps. Un prospect "
                      "qui dit 'on verra' en M1 peut signer en M4. Ne jamais abandonner un lead "
                      "qualifie avant 90 jours minimum. Maintenir un contact bienveillant et utile."
        },
        {
            "title": "Le bouche-a-oreille est votre meilleur canal",
            "content": "Une recommandation d'un pair vaut 10 publicites. Chaque client satisfait "
                      "doit devenir un ambassadeur. Demandez explicitement des introductions. "
                      "Offrez un mois gratuit supplementaire pour chaque referral qui signe."
        },
        {
            "title": "Le terrain prime sur le digital",
            "content": "Ne vous illusionnez pas : les premiers 20 clients viendront du terrain, "
                      "pas des reseaux sociaux. Le digital amplifie, il ne remplace pas la relation "
                      "physique dans le contexte camerounais actuel."
        },
        {
            "title": "Adaptez votre discours a chaque interlocuteur",
            "content": "Au DG : parlez ROI et vision. Au DAF : parlez couts et economies. "
                      "Au responsable logistique : parlez efficacite et gain de temps. "
                      "Meme produit, pitch different selon la personne en face."
        },
        {
            "title": "L'informel est une realite",
            "content": "Beaucoup d'entreprises cibles ont des finances informelles. Etre flexible "
                      "sur les modalites de paiement (mensuel, trimestriel, Mobile Money) "
                      "peut faire la difference sur une signature."
        },
        {
            "title": "La persistance differentie",
            "content": "La plupart des commerciaux abandonnent apres 2-3 contacts. Les meilleurs "
                      "maintiennent le contact 8-12 fois avant d'obtenir une decision. "
                      "Soyez present sans etre intrusif : apportez de la valeur a chaque contact."
        },
    ]

    for truth in truths:
        story.append(Paragraph(truth["title"], styles['h3']))
        story.append(Paragraph(truth["content"], styles['body']))
        sep(story)
        sp(story, 4)

    sp(story, 8)
    story.append(ColorRect(W, 2, C_TEAL))
    sp(story, 8)

    story.append(Paragraph("Conclusion Strategique", styles['h1']))
    story.append(Paragraph(
        "GVEO dispose d'un produit solide, adapte au marche africain, avec un modele de prix "
        "competitif et une periode d'essai differenciante. Le succes commercial reposera sur "
        "trois facteurs : executer la prospection terrain avec discipline, construire la credibilite "
        "par le contenu et les temoignages clients, et maintenir une presence reguliere sur les canaux "
        "digitaux B2B.",
        styles['body']
    ))
    sp(story, 8)

    info_box(story, "Les 3 Principes Fondateurs de la Strategie GVEO", [
        "1. TERRAIN D'ABORD : chaque jour sans prospecter est un jour perdu. Minimum 10 contacts/jour.",
        "2. MESURER TOUT : un KPI non mesure ne s'ameliore pas. Reporting quotidien = discipline.",
        "3. CLIENT = PARTENAIRE : chaque client satisfait est le meilleur ambassadeur de GVEO.",
    ], styles, bg=HexColor("#f0fdf4"), border=C_GREEN)

    return story


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=MARGIN_L,
        rightMargin=MARGIN_R,
        topMargin=MARGIN_T,
        bottomMargin=MARGIN_B + 10 * mm,
        title="GVEO — Strategie Commerciale Complete",
        author="BUHT Sarl",
        subject="Strategie Commerciale Complete",
    )

    styles = make_styles()
    story = build_story(styles)

    doc.build(
        story,
        onFirstPage=build_cover,
        onLaterPages=on_page,
    )
    print(f"PDF genere : {OUTPUT}")


if __name__ == "__main__":
    main()
