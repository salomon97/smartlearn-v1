#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur du document de présentation stratégique GVEO
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
from reportlab.platypus import Frame, PageTemplate
import os

# ─── PALETTE GRAPHIQUE ────────────────────────────────────────────────────────
C_TEAL       = HexColor("#1a6b7a")   # bleu-sarcelle principal (header app)
C_TEAL_DARK  = HexColor("#0d4a5c")   # fond couverture
C_TEAL_MID   = HexColor("#1e8a9e")   # accent section
C_TEAL_LIGHT = HexColor("#d4eef3")   # fond encadré clair
C_GREEN      = HexColor("#22c55e")   # actif / positif
C_RED        = HexColor("#ef4444")   # alerte critique
C_ORANGE     = HexColor("#f59e0b")   # avertissement
C_SLATE      = HexColor("#1e293b")   # texte principal
C_GRAY_DARK  = HexColor("#475569")   # sous-texte
C_GRAY_MID   = HexColor("#94a3b8")   # texte tertiaire
C_GRAY_LIGHT = HexColor("#f1f5f9")   # fond page / encadrés
C_WHITE      = HexColor("#ffffff")
C_DIVIDER    = HexColor("#cbd5e1")   # séparateurs

PAGE_W, PAGE_H = A4
MARGIN_L = 2.0 * cm
MARGIN_R = 2.0 * cm
MARGIN_T = 2.0 * cm
MARGIN_B = 2.0 * cm

OUTPUT = "/home/user/smartlearn-v1/GVEO_Presentation_Strategique.pdf"

# ─── CLASSE UTILITAIRES ───────────────────────────────────────────────────────

class ColorRect(Flowable):
    """Rectangle coloré de largeur pleine."""
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
    """Bandeau de titre de section avec accent latéral teal."""
    def __init__(self, text, width, number=""):
        Flowable.__init__(self)
        self.text = text
        self.width = width
        self.number = number
        self.height = 36

    def draw(self):
        c = self.canv
        # Fond gris très clair
        c.setFillColor(C_GRAY_LIGHT)
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        # Barre latérale teal
        c.setFillColor(C_TEAL)
        c.rect(0, 0, 5, self.height, fill=1, stroke=0)
        # Numéro
        if self.number:
            c.setFillColor(C_TEAL_MID)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(14, 12, self.number)
        # Texte
        c.setFillColor(C_SLATE)
        c.setFont("Helvetica-Bold", 13)
        x_text = 14 + (30 if self.number else 0)
        c.drawString(x_text, 12, self.text)


class KPICard(Flowable):
    """Carte de KPI avec icône et valeur."""
    def __init__(self, label, value, icon_char="•", color=None):
        Flowable.__init__(self)
        self.label = label
        self.value = value
        self.icon_char = icon_char
        self.color = color or C_TEAL
        self.width = 84 * mm
        self.height = 28 * mm

    def draw(self):
        c = self.canv
        c.setFillColor(C_WHITE)
        c.roundRect(0, 0, self.width, self.height, 4, fill=1, stroke=0)
        c.setFillColor(C_DIVIDER)
        c.roundRect(0, 0, self.width, self.height, 4, fill=0, stroke=1)
        # Accent top
        c.setFillColor(self.color)
        c.roundRect(0, self.height - 4, self.width, 4, 2, fill=1, stroke=0)
        # Label
        c.setFillColor(C_GRAY_DARK)
        c.setFont("Helvetica", 8)
        c.drawString(8, self.height - 18, self.label.upper())
        # Value
        c.setFillColor(C_SLATE)
        c.setFont("Helvetica-Bold", 13)
        c.drawString(8, 8, self.value)


# ─── NUMÉROTATION DES PAGES ───────────────────────────────────────────────────

def on_page(canvas_obj, doc):
    """Footer sur toutes les pages sauf la couverture."""
    page = doc.page
    if page == 1:
        return
    canvas_obj.saveState()
    canvas_obj.setFillColor(C_TEAL)
    canvas_obj.rect(0, 0, PAGE_W, 8 * mm, fill=1, stroke=0)
    canvas_obj.setFillColor(C_WHITE)
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.drawString(MARGIN_L, 3 * mm, "GVEO — Document de présentation stratégique — Confidentiel")
    canvas_obj.drawRightString(PAGE_W - MARGIN_R, 3 * mm, f"Page {page}")
    canvas_obj.restoreState()


# ─── COUVERTURE ───────────────────────────────────────────────────────────────

def build_cover(c, doc):
    c.saveState()
    # Fond plein teal sombre
    c.setFillColor(C_TEAL_DARK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    # Bande décorative diagonale (simulation)
    c.setFillColor(C_TEAL)
    c.rect(0, PAGE_H * 0.38, PAGE_W, PAGE_H * 0.62, fill=1, stroke=0)

    # Bande blanche fine
    c.setFillColor(C_WHITE)
    c.rect(0, PAGE_H * 0.38 - 2, PAGE_W, 4, fill=1, stroke=0)

    # Ligne verte accent
    c.setFillColor(C_GREEN)
    c.rect(MARGIN_L, PAGE_H * 0.38 + 8 * mm, 14 * mm, 3, fill=1, stroke=0)

    # LOGO / Marque
    c.setFillColor(C_WHITE)
    c.setFont("Helvetica-Bold", 52)
    c.drawString(MARGIN_L, PAGE_H * 0.62, "GVEO")

    c.setFont("Helvetica", 13)
    c.setFillColor(C_TEAL_LIGHT)
    c.drawString(MARGIN_L, PAGE_H * 0.62 - 1.2 * cm, "GESTION DE FLOTTE")

    # Séparateur
    c.setFillColor(HexColor("#22c55e"))
    c.rect(MARGIN_L, PAGE_H * 0.62 - 2 * cm, 40 * mm, 2, fill=1, stroke=0)

    # Titre du document
    c.setFillColor(C_WHITE)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(MARGIN_L, PAGE_H * 0.62 - 3.2 * cm, "Document de présentation")
    c.setFont("Helvetica-Bold", 22)
    c.drawString(MARGIN_L, PAGE_H * 0.62 - 4.0 * cm, "stratégique & fonctionnelle")

    # Sous-titre
    c.setFillColor(C_TEAL_LIGHT)
    c.setFont("Helvetica", 11)
    c.drawString(MARGIN_L, PAGE_H * 0.62 - 5.2 * cm,
                 "Plateforme SaaS de gestion de flotte automobile — Afrique Centrale")

    # Section bas : infos
    c.setFillColor(C_GRAY_LIGHT)
    c.rect(0, 0, PAGE_W, PAGE_H * 0.36, fill=1, stroke=0)
    c.setFillColor(C_DIVIDER)
    c.rect(0, PAGE_H * 0.36, PAGE_W, 1, fill=1, stroke=0)

    # Infos bloc gauche
    c.setFillColor(C_GRAY_DARK)
    c.setFont("Helvetica", 9)
    c.drawString(MARGIN_L, PAGE_H * 0.34, "DOCUMENT CONFIDENTIEL")

    c.setFillColor(C_SLATE)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN_L, PAGE_H * 0.30, "Version 2.0 — Mai 2026")

    c.setFillColor(C_GRAY_DARK)
    c.setFont("Helvetica", 9)
    c.drawString(MARGIN_L, PAGE_H * 0.27, "Usage interne & partenaires autorisés")

    # Infos bloc droit
    c.setFillColor(C_TEAL)
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(PAGE_W - MARGIN_R, PAGE_H * 0.34, "BUHT Sarl — Business High Tech")
    c.setFillColor(C_GRAY_DARK)
    c.setFont("Helvetica", 9)
    c.drawRightString(PAGE_W - MARGIN_R, PAGE_H * 0.30, "gveo.org")
    c.drawRightString(PAGE_W - MARGIN_R, PAGE_H * 0.27, "Douala, Cameroun")

    # Décoration géométrique
    c.setFillColor(C_TEAL_MID)
    c.setStrokeColor(C_TEAL_MID)
    c.setLineWidth(1)
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
        textColor=C_SLATE, alignment=TA_JUSTIFY,
        spaceAfter=6
    )
    s['body_sm'] = ParagraphStyle(
        'body_sm', parent=base['Normal'],
        fontName='Helvetica', fontSize=9, leading=14,
        textColor=C_GRAY_DARK, alignment=TA_JUSTIFY,
        spaceAfter=4
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
        textColor=C_SLATE, leftIndent=12, bulletIndent=0,
        spaceAfter=3
    )
    s['toc_item'] = ParagraphStyle(
        'toc_item', parent=base['Normal'],
        fontName='Helvetica', fontSize=10, leading=16,
        textColor=C_SLATE
    )
    s['toc_number'] = ParagraphStyle(
        'toc_number', parent=base['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=16,
        textColor=C_TEAL
    )
    s['highlight'] = ParagraphStyle(
        'highlight', parent=base['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=15,
        textColor=C_TEAL_DARK
    )
    s['quote'] = ParagraphStyle(
        'quote', parent=base['Normal'],
        fontName='Helvetica-Oblique', fontSize=10, leading=15,
        textColor=C_TEAL_DARK, leftIndent=16, rightIndent=16,
        borderPad=8
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
    p = Paragraph(f'<font color="{color.hexval()}">▸</font>  {text}', styles['bullet'])
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
        ('ROUNDEDCORNERS', [4]),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))


def three_col_table(story, rows_data, styles, headers=None):
    w = (PAGE_W - MARGIN_L - MARGIN_R) / 3
    table_data = []
    if headers:
        table_data.append([Paragraph(h, styles['label']) for h in headers])
    for row in rows_data:
        table_data.append([Paragraph(str(cell), styles['body_sm']) for cell in row])

    t = Table(table_data, colWidths=[w, w, w])
    style = [
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, 0), C_TEAL_LIGHT),
    ]
    if headers:
        style.append(('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'))
        style.append(('TEXTCOLOR', (0, 0), (-1, 0), C_TEAL_DARK))
    t.setStyle(TableStyle(style))
    story.append(t)
    story.append(Spacer(1, 8))


# ─── CONTENU PRINCIPAL ────────────────────────────────────────────────────────

def build_story(styles):
    story = []
    W = PAGE_W - MARGIN_L - MARGIN_R

    # ── PAGE BLANCHE après couverture ─────────────────────────────────────────
    story.append(PageBreak())

    # ── SOMMAIRE ──────────────────────────────────────────────────────────────
    story.append(Paragraph("Sommaire", styles['h1']))
    sep(story, C_TEAL)
    sp(story, 8)

    toc_items = [
        ("1.", "Présentation générale de GVEO", "3"),
        ("2.", "Architecture fonctionnelle — Les sept modules", "4"),
        ("3.", "Modes d'utilisation de la plateforme", "5"),
        ("4.", "Gestion des rôles, permissions et gouvernance", "7"),
        ("5.", "Analyse de l'expérience utilisateur (UX/UI)", "8"),
        ("6.", "Architecture technique et modèle SaaS", "9"),
        ("7.", "Analyse stratégique et valeur commerciale", "10"),
        ("8.", "Grille d'évaluation — Forces, faiblesses et recommandations", "11"),
        ("9.", "Conclusion", "12"),
    ]

    for num, title, page in toc_items:
        row_data = [[
            Paragraph(num, styles['toc_number']),
            Paragraph(title, styles['toc_item']),
            Paragraph(page, styles['toc_number'])
        ]]
        t = Table(row_data, colWidths=[1.0 * cm, W - 2.2 * cm, 1.2 * cm])
        t.setStyle(TableStyle([
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, C_DIVIDER),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
        ]))
        story.append(t)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 1 — PRÉSENTATION GÉNÉRALE
    # ════════════════════════════════════════════════════════════════════════
    section_header(story, "01", "Présentation générale de GVEO", styles)

    story.append(Paragraph(
        "GVEO est une plateforme SaaS (Software as a Service) dédiée à la "
        "<b>gestion intelligente de flotte automobile</b>. Conçue pour répondre "
        "aux besoins croissants des entreprises et des particuliers en Afrique "
        "centrale et subsaharienne, la solution offre un ensemble structuré "
        "d'outils numériques permettant de superviser, d'optimiser et de "
        "sécuriser l'exploitation d'un parc de véhicules.",
        styles['body']
    ))
    sp(story, 6)
    story.append(Paragraph(
        "Dans un contexte où la gestion de flotte reste majoritairement "
        "empirique ou repose sur des outils génériques inadaptés aux réalités "
        "locales (coût du carburant en FCFA, cadre réglementaire camerounais, "
        "infrastructure réseau variable), GVEO se positionne comme une "
        "réponse native, pensée pour le marché africain, avec une architecture "
        "modulaire et trois modes d'exploitation distincts.",
        styles['body']
    ))
    sp(story, 10)

    # Carte d'identité produit
    story.append(Paragraph("Carte d'identité du produit", styles['h2']))

    id_data = [
        ["Critère", "Détail"],
        ["Nom commercial", "GVEO"],
        ["Éditeur", "BUHT Sarl — Business High Tech"],
        ["Domaine", "gveo.org / app.staging.gveo.org"],
        ["Catégorie", "Fleet Management SaaS"],
        ["Marché primaire", "Cameroun — Afrique centrale"],
        ["Langue de l'interface", "Français / Anglais (bilingue)"],
        ["Devise de référence", "FCFA (Franc CFA)"],
        ["Statut actuel", "Version staging — pré-lancement commercial"],
        ["Modèle tarifaire", "Freemium (Découverte gratuit 6 mois) + abonnements payants"],
    ]

    id_table = Table(
        [[Paragraph(c, styles['label'] if i == 0 else styles['body_sm']) for c in row]
         for i, row in enumerate(id_data)],
        colWidths=[5.5 * cm, W - 5.5 * cm]
    )
    id_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BACKGROUND', (0, 1), (0, -1), C_TEAL_LIGHT),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), C_TEAL_DARK),
        ('FONTSIZE', (0, 1), (0, -1), 9),
    ]))
    story.append(id_table)
    sp(story, 10)

    # Vision
    story.append(Paragraph("Vision et ambition", styles['h2']))
    story.append(Paragraph(
        "La vision de GVEO est de devenir la référence africaine de la gestion "
        "de flotte numérique — accessible, abordable et adaptée aux structures "
        "aussi bien individuelles que corporate. La plateforme ambitionne de "
        "digitaliser une fonction longtemps sous-équipée dans les organisations "
        "camerounaises : la maîtrise du coût de possession d'un parc automobile.",
        styles['body']
    ))
    sp(story, 6)
    # Encadré vision
    vision_box_data = [[Paragraph(
        '<i>"Une flotte bien gérée, c\'est une entreprise qui maîtrise ses coûts, '
        'réduit ses risques et optimise sa productivité opérationnelle."</i>',
        styles['quote']
    )]]
    vt = Table(vision_box_data, colWidths=[W])
    vt.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1.5, C_TEAL),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 0), (-1, -1), C_TEAL_LIGHT),
    ]))
    story.append(vt)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 2 — ARCHITECTURE FONCTIONNELLE
    # ════════════════════════════════════════════════════════════════════════
    section_header(story, "02", "Architecture fonctionnelle — Les sept modules", styles)

    story.append(Paragraph(
        "L'application GVEO est structurée autour de <b>sept modules fonctionnels</b> "
        "accessibles depuis un menu de navigation latéral cohérent et hiérarchisé. "
        "Chaque module répond à une dimension précise du cycle de vie d'un véhicule "
        "en exploitation. L'ensemble forme un écosystème complet de gestion.",
        styles['body']
    ))
    sp(story, 10)

    modules = [
        ("01", "Entretien préventif", C_GREEN,
         "Suivi proactif des opérations de maintenance planifiées. "
         "Affiche les véhicules en alerte, les opérations en retard et "
         "le statut d'ensemble de la flotte (À traiter / À jour). "
         "Permet d'anticiper les pannes avant qu'elles surviennent."),
        ("02", "Carburant", C_TEAL_MID,
         "Enregistrement et suivi des pleins de carburant par véhicule. "
         "Agrège le total des litres rechargés, le coût total en FCFA "
         "et le nombre de véhicules actifs sur la période. "
         "Filtre par véhicule avec sélecteur dédié."),
        ("03", "Pannes (Réparations)", C_RED,
         "Gestion des incidents curatifs. Permet de signaler une panne, "
         "de suivre les incidents ouverts, les véhicules concernés, "
         "les réparations liées et les cas récemment résolus. "
         "Distingue incidents actifs et historique."),
        ("04", "Législation (Documents)", C_ORANGE,
         "Archivage et suivi des documents réglementaires de chaque véhicule "
         "(assurances, visites techniques, permis, etc.). "
         "Alertes sur les documents critiques (≤ 7 jours) et à renouveler "
         "(< 30 jours). Vue consolidée par véhicule et par document."),
        ("05", "Sorties (Départs)", C_TEAL,
         "Suivi des missions et déplacements en temps réel. "
         "Tableau de bord avec les véhicules en circulation, "
         "les trajets de la journée, la distance moyenne et hebdomadaire. "
         "Historique des trajets récents par véhicule."),
        ("06", "Statistiques globales", C_TEAL_DARK,
         "Tableau de bord analytique consolidé sur trois périodes "
         "(semaine / mois / année). Agrège les dépenses totales "
         "ventilées par catégorie : carburant, curatif, préventif, législation. "
         "Courbes d'évolution mensuelle sur 12 mois et graphique de "
         "comparaison pour la détection d'anomalies de coûts."),
        ("07", "Paramètres", C_GRAY_DARK,
         "Gestion du compte utilisateur, de l'abonnement actif, "
         "de la langue d'interface (FR/EN) et des données de profil. "
         "Point d'accès à la gestion de l'abonnement et aux options "
         "de déconnexion sécurisée."),
    ]

    for num, title, color, desc in modules:
        mod_data = [[
            Paragraph(f'<font color="{color.hexval()}"><b>{num}</b></font>', styles['body']),
            Paragraph(f'<b>{title}</b><br/><font color="#475569">{desc}</font>', styles['body_sm'])
        ]]
        mt = Table(mod_data, colWidths=[1.2 * cm, W - 1.2 * cm])
        mt.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, C_DIVIDER),
            ('BACKGROUND', (0, 0), (0, -1), C_GRAY_LIGHT),
        ]))
        story.append(mt)

    sp(story, 10)

    # Logique de navigation
    story.append(Paragraph("Logique de navigation et cohérence des parcours", styles['h2']))
    story.append(Paragraph(
        "L'application adopte une architecture de navigation à deux niveaux : "
        "un menu latéral escamotable (\"drawer\") accessible depuis l'icône hamburger, "
        "et un système d'onglets à l'intérieur de certains modules (ex. Alertes "
        "Préventives / Administratives). Cette structure garantit une navigation "
        "intuitive, adaptée à une utilisation mobile-first.",
        styles['body']
    ))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 3 — MODES D'UTILISATION
    # ════════════════════════════════════════════════════════════════════════
    section_header(story, "03", "Modes d'utilisation de la plateforme", styles)

    story.append(Paragraph(
        "GVEO se distingue par une architecture commerciale à <b>trois modes "
        "d'exploitation distincts</b>, permettant d'adresser simultanément des "
        "profils d'utilisateurs très différents — du particulier gérant ses "
        "véhicules personnels jusqu'à la grande entreprise souhaitant déployer "
        "la solution sur sa propre infrastructure sécurisée.",
        styles['body']
    ))
    sp(story, 12)

    # Mode 1
    story.append(Paragraph("Mode 1 — Individuel (B2C)", styles['h2']))

    mode1_data = [[
        Paragraph("<b>Profil cible</b>", styles['label']),
        Paragraph(
            "Particulier propriétaire d'un ou plusieurs véhicules personnels. "
            "Découverte du produit via le site marketing.",
            styles['body_sm']
        )
    ], [
        Paragraph("<b>Fonctionnement</b>", styles['label']),
        Paragraph(
            "L'utilisateur crée un compte personnel, enregistre ses véhicules "
            "et accède à l'ensemble des modules de gestion : entretien préventif, "
            "suivi carburant, archivage des documents réglementaires et gestion "
            "des pannes. Le compte est individuel, sans dimension organisationnelle.",
            styles['body_sm']
        )
    ], [
        Paragraph("<b>Abonnements</b>", styles['label']),
        Paragraph(
            "Découverte : Gratuit, 1 véhicule, 6 mois (période d'essai)\n"
            "Starter : 7 000 FCFA/mois, jusqu'à 3 véhicules\n"
            "Essentiel : 15 000 FCFA/mois, jusqu'à 5 véhicules",
            styles['body_sm']
        )
    ], [
        Paragraph("<b>Valeur apportée</b>", styles['label']),
        Paragraph(
            "Maîtrise des coûts de possession, anticipation des entretiens, "
            "conformité documentaire, historique des dépenses.",
            styles['body_sm']
        )
    ]]

    m1t = Table(mode1_data, colWidths=[3.8 * cm, W - 3.8 * cm])
    m1t.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, C_TEAL_MID),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, C_DIVIDER),
        ('BACKGROUND', (0, 0), (0, -1), C_TEAL_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(m1t)
    sp(story, 14)

    # Mode 2
    story.append(Paragraph("Mode 2 — Entreprise Cloud (B2B SaaS)", styles['h2']))

    mode2_data = [[
        Paragraph("<b>Profil cible</b>", styles['label']),
        Paragraph(
            "Entreprises disposant d'une flotte de véhicules mais sans "
            "infrastructure serveur propre. PME, TPE, sociétés de logistique, "
            "de BTP, de distribution, de field services.",
            styles['body_sm']
        )
    ], [
        Paragraph("<b>Fonctionnement</b>", styles['label']),
        Paragraph(
            "L'entreprise s'inscrit sur la plateforme. GVEO lui provisionne un "
            "<b>schéma de base de données dédié</b> (isolation multi-tenant stricte). "
            "Les données de l'entreprise sont complètement séparées de celles "
            "des autres clients. L'administrateur configure l'organigramme, "
            "crée les utilisateurs, attribue les rôles et les accès aux véhicules.",
            styles['body_sm']
        )
    ], [
        Paragraph("<b>Gouvernance</b>", styles['label']),
        Paragraph(
            "Système de rôles granulaire (voir Section 4). Chaque membre de "
            "l'équipe ne voit que les modules et les véhicules correspondant "
            "à ses droits d'accès. Séparation des responsabilités opérationnelles.",
            styles['body_sm']
        )
    ], [
        Paragraph("<b>Avantage clé</b>", styles['label']),
        Paragraph(
            "Zéro infrastructure à gérer côté client. Mise en service immédiate. "
            "Scalabilité automatique. Idéal pour les PME camerounaises sans DSI.",
            styles['body_sm']
        )
    ]]

    m2t = Table(mode2_data, colWidths=[3.8 * cm, W - 3.8 * cm])
    m2t.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, C_GREEN),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, C_DIVIDER),
        ('BACKGROUND', (0, 0), (0, -1), HexColor("#f0fdf4")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(m2t)
    sp(story, 14)

    # Mode 3
    story.append(Paragraph("Mode 3 — Entreprise On-Premise (B2B Licence)", styles['h2']))

    mode3_data = [[
        Paragraph("<b>Profil cible</b>", styles['label']),
        Paragraph(
            "Grandes entreprises ou institutions disposant de leur propre "
            "infrastructure serveur et souhaitant garder le contrôle total "
            "de leurs données (exigences de conformité, souveraineté des données).",
            styles['body_sm']
        )
    ], [
        Paragraph("<b>Fonctionnement</b>", styles['label']),
        Paragraph(
            "GVEO génère une <b>clé de licence chiffrée</b> spécifiant le nombre "
            "de véhicules autorisés et la durée d'exploitation. La solution "
            "est déployée sur les serveurs du client. Elle fonctionne de manière "
            "autonome, sans dépendance permanente à l'infrastructure GVEO.",
            styles['body_sm']
        )
    ], [
        Paragraph("<b>Gestion de l'expiration</b>", styles['label']),
        Paragraph(
            "À l'approche de la date d'expiration, le système envoie des "
            "notifications automatiques. Le client dispose d'une période de "
            "grâce de <b>6 mois</b> pour négocier le renouvellement de la licence "
            "auprès de BUHT Sarl.",
            styles['body_sm']
        )
    ], [
        Paragraph("<b>Avantage clé</b>", styles['label']),
        Paragraph(
            "Souveraineté totale des données. Adapté aux structures avec "
            "contraintes de conformité strictes (défense, santé, institutions "
            "publiques). Modèle de revenu récurrent via renouvellement de licence.",
            styles['body_sm']
        )
    ]]

    m3t = Table(mode3_data, colWidths=[3.8 * cm, W - 3.8 * cm])
    m3t.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, C_ORANGE),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, C_DIVIDER),
        ('BACKGROUND', (0, 0), (0, -1), HexColor("#fffbeb")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(m3t)
    sp(story, 10)

    # Tableau comparatif
    story.append(Paragraph("Tableau comparatif des trois modes", styles['h2']))
    comp_data = [
        ["Critère", "Individuel", "Entreprise Cloud", "On-Premise"],
        ["Cible", "Particulier", "PME / ETI", "Grande entreprise"],
        ["Hébergement", "GVEO Cloud", "GVEO Cloud", "Serveur client"],
        ["Isolation données", "Compte unique", "Schéma DB dédié", "Infrastructure dédiée"],
        ["Gestion des rôles", "Non", "Oui", "Oui"],
        ["Organigramme", "Non", "Oui", "Oui"],
        ["Licence chiffrée", "Non", "Non", "Oui"],
        ["Modèle tarifaire", "Abonnement", "Abonnement", "Licence + renouvellement"],
        ["Mise en service", "Immédiate", "Immédiate", "Déploiement on-site"],
    ]
    comp_widths = [4.2 * cm] + [(W - 4.2 * cm) / 3] * 3
    comp_rows = []
    for i, row in enumerate(comp_data):
        style_fn = styles['label'] if i == 0 else styles['body_sm']
        comp_rows.append([Paragraph(cell, style_fn) for cell in row])

    ct = Table(comp_rows, colWidths=comp_widths)
    ct.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BACKGROUND', (0, 1), (0, -1), C_GRAY_LIGHT),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), C_TEAL_DARK),
        ('FONTSIZE', (0, 1), (0, -1), 9),
    ]))
    story.append(ct)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 4 — GESTION DES RÔLES
    # ════════════════════════════════════════════════════════════════════════
    section_header(story, "04", "Gestion des rôles, permissions et gouvernance", styles)

    story.append(Paragraph(
        "En mode Entreprise (Cloud ou On-Premise), GVEO implémente un système "
        "de <b>contrôle d'accès basé sur les rôles</b> (RBAC — Role-Based Access "
        "Control). Ce dispositif permet à l'administrateur de l'organisation de "
        "définir précisément ce que chaque collaborateur peut voir et faire dans "
        "l'application, en accord avec ses responsabilités métier réelles.",
        styles['body']
    ))
    sp(story, 8)

    story.append(Paragraph("Principe de fonctionnement", styles['h2']))
    story.append(Paragraph(
        "L'administrateur configure l'<b>organigramme</b> de son organisation "
        "directement dans GVEO. Pour chaque poste ou fonction, il définit :",
        styles['body']
    ))
    bullet_item(story, "Les <b>modules visibles</b> dans l'interface (menus affichés ou masqués selon le rôle)", styles)
    bullet_item(story, "Les <b>actions autorisées</b> par module (lecture seule, saisie, validation, audit)", styles)
    bullet_item(story, "Les <b>véhicules accessibles</b> (accès total, partiel, ou limité à un véhicule attitré)", styles)
    sp(story, 10)

    story.append(Paragraph("Exemples de rôles métier et leurs permissions", styles['h2']))

    roles_data = [
        ["Rôle métier", "Accès modules", "Accès véhicules", "Actions typiques"],
        ["Directeur / Admin",
         "Tous les modules",
         "Flotte complète",
         "Supervision globale, paramétrage, audit financier"],
        ["Auditeur",
         "Statistiques, Législation, Entretien",
         "Flotte complète",
         "Consultation des KPIs, vérification conformité"],
        ["Comptable",
         "Carburant, Statistiques",
         "Flotte complète",
         "Saisie des coûts, rapports financiers"],
        ["Agent guérite / Saisie",
         "Carburant, Sorties",
         "Véhicules assignés",
         "Enregistrement des pleins, déclaration des sorties"],
        ["Conducteur",
         "Pannes, Sorties",
         "Véhicule attitré uniquement",
         "Signalement de panne, suivi de mission"],
    ]

    roles_rows = []
    for i, row in enumerate(roles_data):
        s = styles['label'] if i == 0 else styles['body_sm']
        roles_rows.append([Paragraph(cell, s) for cell in row])

    rw = [(W - 4 * 0.2 * cm) / 4] * 4
    rt = Table(roles_rows, colWidths=rw)
    rt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [C_WHITE, C_GRAY_LIGHT]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(rt)
    sp(story, 10)

    info_box(story,
             "Principe de moindre privilège",
             [
                 "GVEO applique nativement le principe du moindre privilège : "
                 "chaque utilisateur n'accède qu'aux informations strictement "
                 "nécessaires à l'exercice de ses fonctions. Cette approche "
                 "réduit les risques d'erreur, de fraude interne et de fuite "
                 "d'informations sensibles.",
                 "",
                 "La granularité du contrôle porte à la fois sur les modules "
                 "(menus masqués), les actions (boutons cachés selon le profil) "
                 "et les périmètres de données (véhicules accessibles).",
             ],
             styles)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 5 — ANALYSE UX/UI
    # ════════════════════════════════════════════════════════════════════════
    section_header(story, "05", "Analyse de l'expérience utilisateur (UX/UI)", styles)

    story.append(Paragraph("Identité visuelle et cohérence graphique", styles['h2']))
    story.append(Paragraph(
        "L'interface de GVEO présente une charte graphique structurée et reconnaissable, "
        "articulée autour d'un bleu-sarcelle profond (#1a6b7a) en tant que couleur "
        "primaire, déclinée sur la barre de navigation, les états actifs et les "
        "accents. Le fond général adopte un gris perle (#f1f5f9), conférant légèreté "
        "et lisibilité à l'ensemble des écrans.",
        styles['body']
    ))
    sp(story, 6)

    ux_items = [
        ("Navigation", "Drawer latéral teal, titre centré GVEO en blanc, cloche de notification à droite. Structure claire et intuitive, conforme aux conventions Material Design."),
        ("Cartes KPI", "Grille 2x2 de cartes avec icônes colorées codifiées sémantiquement : rouge (alerte critique), orange (avertissement), vert (état sain), gris (données neutres). Lecture immédiate de l'état de la flotte."),
        ("Typographie", "Hiérarchie typographique claire : titres de section en gras large, labels en corps standard, données chiffrées en typographie lourde bien lisible. Excellente scannabilité."),
        ("Charte couleur", "Palette fonctionnelle cohérente : teal (actions primaires), vert (actif / positif), rouge (critique), orange (vigilance), gris (neutre / vide). Code couleur stable entre les modules."),
        ("États vides", "Gestion correcte des états vides (\"No preventive alerts\", \"Aucun véhicule en mission\") avec messages lisibles. Pas d'illustration — à améliorer pour l'onboarding."),
        ("Bilingue", "Incohérence résiduelle : certains labels en anglais (\"Vehicles\", \"No preventive alerts\") dans une interface principalement française. À harmoniser avant le lancement."),
        ("Mobile-first", "Interface optimisée pour mobile (responsive web app). Navigation adaptée au format vertical. Boutons d'action (\"Ajouter\", \"Signaler\") bien positionnés et visibles."),
        ("Abonnement", "Page d'abonnement claire avec plan actuel mis en évidence, plans disponibles hiérarchisés visuellement avec prix en teal. CTA \"Demander\" distincts et visibles."),
    ]

    for label, desc in ux_items:
        row = [[
            Paragraph(f"<b>{label}</b>", styles['label']),
            Paragraph(desc, styles['body_sm'])
        ]]
        t = Table(row, colWidths=[3.2 * cm, W - 3.2 * cm])
        t.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, C_DIVIDER),
            ('BACKGROUND', (0, 0), (0, -1), C_TEAL_LIGHT),
        ]))
        story.append(t)

    sp(story, 10)

    story.append(Paragraph("Évaluation globale UX", styles['h2']))

    ux_scores = [
        ["Dimension", "Note /5", "Commentaire"],
        ["Cohérence visuelle", "4/5", "Charte teal homogène, légères incohérences linguistiques"],
        ["Ergonomie mobile", "4/5", "Navigation intuitive, layout adapté"],
        ["Lisibilité des données", "4.5/5", "KPI cards claires, typographie efficace"],
        ["Onboarding / états vides", "2.5/5", "Absence d'illustrations, no empty-state guidance"],
        ["Parité linguistique FR/EN", "3/5", "Mélange résiduel à corriger"],
        ["Design premium (gap marketing)", "2.5/5", "Site marketing Stripe-grade vs app Bootstrap-standard"],
    ]
    ux_rows = []
    for i, row in enumerate(ux_scores):
        s = styles['label'] if i == 0 else styles['body_sm']
        ux_rows.append([Paragraph(cell, s) for cell in row])

    ux_w = [5.5 * cm, 2.2 * cm, W - 7.7 * cm]
    uxr = Table(ux_rows, colWidths=ux_w)
    uxr.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (1, 1), (1, -1), 'CENTER'),
        ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1, 1), (1, -1), C_TEAL_DARK),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [C_WHITE, C_GRAY_LIGHT]),
    ]))
    story.append(uxr)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 6 — ARCHITECTURE TECHNIQUE
    # ════════════════════════════════════════════════════════════════════════
    section_header(story, "06", "Architecture technique et modèle SaaS", styles)

    story.append(Paragraph("Modèle multi-tenant et isolation des données", styles['h2']))
    story.append(Paragraph(
        "GVEO implémente un modèle <b>multi-tenant</b> avec isolation par schéma "
        "de base de données — l'approche la plus sécurisée dans l'architecture "
        "SaaS. Chaque client entreprise se voit attribuer un schéma DB dédié, "
        "garantissant une séparation physique des données sans risque de "
        "contamination croisée entre locataires.",
        styles['body']
    ))
    sp(story, 8)

    tech_points = [
        ("Application web progressive", "Interface responsive mobile-first, accessible via navigateur (URL app.staging.gveo.org). Architecture web app sans application native imposée — réduction de la friction d'adoption."),
        ("Multi-tenant par schéma DB", "Provisionnement automatique d'un schéma de base de données dédié par entreprise inscrite. Isolation forte, performances préservées, gestion simplifiée des migrations."),
        ("Système de licences chiffrées", "Mode On-Premise sécurisé par licence encryptée paramétrable (nombre de véhicules + durée). Mécanisme de notification avant expiration + période de grâce de 6 mois."),
        ("RBAC natif", "Contrôle d'accès basé sur les rôles implémenté au niveau applicatif. Masquage dynamique des menus et des actions selon le profil de l'utilisateur connecté."),
        ("Analytique intégrée", "Module Statistiques avec agrégation multi-catégorie, courbes temporelles (12 mois), comparaison mensuelle et détection d'anomalies de coûts. Persistance des données historiques."),
        ("Bilingue FR/EN", "Internationalisation native avec sélecteur de langue dans les paramètres. Cible les marchés francophones et anglophones d'Afrique centrale et de l'Ouest."),
    ]

    for label, desc in tech_points:
        bullet_item(story, f"<b>{label}</b> — {desc}", styles)

    sp(story, 10)

    info_box(story,
             "Architecture déduite — Note méthodologique",
             [
                 "Les éléments techniques décrits dans cette section sont déduits "
                 "de l'analyse fonctionnelle de l'application et de la description "
                 "orale du fondateur. Ils constituent des inférences solides basées "
                 "sur les pratiques standard SaaS, et non une documentation technique "
                 "officielle de l'architecture interne.",
             ],
             styles, bg=HexColor("#fffbeb"), border=C_ORANGE)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 7 — ANALYSE STRATÉGIQUE
    # ════════════════════════════════════════════════════════════════════════
    section_header(story, "07", "Analyse stratégique et valeur commerciale", styles)

    story.append(Paragraph("Problèmes métier résolus", styles['h2']))
    story.append(Paragraph(
        "GVEO s'attaque à des problèmes opérationnels concrets et coûteux "
        "pour les organisations africaines :",
        styles['body']
    ))

    problems = [
        ("Dérive des coûts de flotte", "Absence de suivi structuré du carburant et des réparations = surcoûts invisibles et non maîtrisés."),
        ("Non-conformité réglementaire", "Documents expirant sans alerte = risques légaux, amendes, immobilisation de véhicules."),
        ("Maintenance réactive coûteuse", "Entretien curatif systématique faute de planning préventif = coûts de réparation multipliés."),
        ("Dispersion de l'information", "Données sur papier, dans des tableurs ou dans des têtes = perte de mémoire institutionnelle."),
        ("Manque de visibilité managériale", "Absence de KPIs consolidés = décisions prises sans données fiables."),
    ]

    for label, desc in problems:
        bullet_item(story, f"<b>{label}</b> — {desc}", styles)

    sp(story, 10)

    story.append(Paragraph("Proposition de valeur par segment", styles['h2']))

    seg_data = [
        ["Segment", "Valeur principale", "Taille de marché (Cameroun)"],
        ["Transporteurs / Logistique", "Maîtrise des coûts carburant + réparations", "Très élevée — flotte ≥ 5 véhicules"],
        ["BTP / Travaux publics", "Conformité documentaire + suivi engins", "Élevée — projets multi-sites"],
        ["Distribution / FMCG", "Optimisation des sorties et kilomètres", "Élevée — flotte commerciale dense"],
        ["Institutions / ONG", "Reporting et conformité audit bailleurs", "Modérée — processus stricts"],
        ["Particuliers (Tourisme)", "Gestion personnelle, coût faible", "Large — B2C, ACV faible"],
        ["Transport scolaire", "Conformité + assurance + parents", "Niche émergente — potentiel fort"],
    ]

    seg_rows = []
    for i, row in enumerate(seg_data):
        s = styles['label'] if i == 0 else styles['body_sm']
        seg_rows.append([Paragraph(cell, s) for cell in row])

    seg_w = [4.5 * cm, (W - 4.5 * cm) * 0.55, (W - 4.5 * cm) * 0.45]
    segt = Table(seg_rows, colWidths=seg_w)
    segt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), C_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, C_DIVIDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [C_WHITE, C_GRAY_LIGHT]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(segt)
    sp(story, 10)

    story.append(Paragraph("Avantages concurrentiels identifiés", styles['h2']))

    avantages = [
        "Solution native africaine — pensée pour les réalités économiques locales (FCFA, réseau variable, absence de DSI interne en PME)",
        "Architecture trois modes complémentaires — du particulier à la grande entreprise sur une seule plateforme",
        "Modèle freemium inclusif — entrée gratuite à 6 mois supprimant la résistance initiale à l'adoption",
        "RBAC granulaire — adapté à la gouvernance réelle des entreprises africaines avec des organigrammes complexes et des rôles imbriqués",
        "Mode On-Premise — différenciateur fort face aux concurrents cloud-only pour les grandes organisations ou les institutions publiques",
        "Bilingue FR/EN natif — adresse directement les marchés d'Afrique centrale francophone et anglophone (Cameroun bilingue)",
    ]

    for a in avantages:
        bullet_item(story, a, styles, C_GREEN)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 8 — GRILLE D'ÉVALUATION
    # ════════════════════════════════════════════════════════════════════════
    section_header(story, "08", "Grille d'évaluation — Forces, faiblesses et recommandations", styles)

    story.append(Paragraph("Points forts", styles['h2']))

    forces = [
        "Architecture fonctionnelle complète et cohérente — les 7 modules couvrent l'intégralité du cycle de vie d'un véhicule",
        "Modèle commercial à trois niveaux — permet d'adresser tous les segments sans repositionnement de produit",
        "Isolation des données multi-tenant par schéma — approche technique sécurisée et scalable",
        "Système de rôles et permissions granulaire — vrai avantage concurrentiel en B2B",
        "Interface bilingue native — différenciateur sur le marché camerounais",
        "Analytique intégrée avec historique 12 mois — valeur réelle pour la prise de décision managériale",
        "Modèle de licence on-premise — source de revenus récurrents à haute valeur",
    ]
    for f in forces:
        bullet_item(story, f, styles, C_GREEN)

    sp(story, 10)
    story.append(Paragraph("Faiblesses et risques identifiés", styles['h2']))

    faiblesses = [
        "Gap qualité brand-produit — le site marketing est premium (Stripe-grade), l'interface actuelle est standard (Bootstrap-level) : écart perceptible à la découverte du produit",
        "Incohérences linguistiques résiduelles — labels en anglais dans une interface française (\"Vehicles\", \"No preventive alerts\") : à corriger avant le lancement",
        "Absence de GPS en tiers standard — fonctionnalité de tracking réservée à l'Enterprise Custom, absente des tiers abordables qui constituent le cœur de marché",
        "États vides sans guidance — aucune illustration ni message d'onboarding dans les écrans vides : expérience froide pour un nouvel utilisateur",
        "Zéro client en production — l'application est en staging : aucune validation marché réelle à ce jour",
        "Positionnement B2B/B2C simultané non tranché — risque de message dilué si les deux segments sont adressés avec les mêmes ressources",
        "Équipe produit non visible — absence de team page, de roadmap publique ou de social proof",
    ]
    for f in faiblesses:
        bullet_item(story, f, styles, C_RED)

    sp(story, 10)
    story.append(Paragraph("Recommandations stratégiques prioritaires", styles['h2']))

    recommandations = [
        ("Court terme (0-3 mois)",
         [
             "Corriger l'intégralité des labels anglais dans l'interface française",
             "Ajouter des illustrations et messages d'onboarding dans les états vides",
             "Créer un compte de démonstration avec données pré-remplies pour les prospects",
             "Aligner visuellement l'interface sur le niveau qualitatif du site marketing",
         ]),
        ("Moyen terme (3-6 mois)",
         [
             "Lancer un programme pilote rémunéré avec 3 à 5 entreprises cibles à Douala",
             "Produire les premiers cas clients (témoignages, études de cas, métriques)",
             "Trancher le positionnement B2B prioritaire (logistique ou BTP) pour concentrer les efforts go-to-market",
             "Intégrer une option GPS de base dans le tier Essentiel",
         ]),
        ("Long terme (6-18 mois)",
         [
             "Développer des partenariats stratégiques avec les assureurs (NSIA, Saham, Allianz)",
             "Intégrer les pétroliers (TotalEnergies, Tradex) pour un flux carburant automatisé",
             "Envisager une API publique pour les intégrations ERP locaux",
             "Construire un réseau de revendeurs agréés pour la commercialisation en région",
         ]),
    ]

    for period, items in recommandations:
        story.append(Paragraph(period, styles['h3']))
        for item in items:
            bullet_item(story, item, styles, C_TEAL)
        sp(story, 4)

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════════════════
    # SECTION 9 — CONCLUSION
    # ════════════════════════════════════════════════════════════════════════
    section_header(story, "09", "Conclusion", styles)

    story.append(Paragraph(
        "GVEO est une solution de gestion de flotte fonctionnellement complète, "
        "architecturalement solide et commercialement bien positionnée pour le "
        "marché camerounais et la sous-région. La plateforme couvre l'intégralité "
        "du cycle de gestion d'un véhicule — de l'entretien préventif au suivi "
        "carburant, en passant par la conformité documentaire, la gestion des "
        "pannes et l'analyse statistique.",
        styles['body']
    ))
    sp(story, 6)
    story.append(Paragraph(
        "Son architecture à trois modes — individuel, entreprise cloud et "
        "on-premise — lui confère une polyvalence rare qui lui permet d'adresser "
        "simultanément des particuliers, des PME et de grandes organisations "
        "institutionnelles, sans compromis sur la sécurité des données.",
        styles['body']
    ))
    sp(story, 6)
    story.append(Paragraph(
        "Le principal défi de la phase actuelle n'est pas technique mais "
        "<b>commercial et perceptuel</b> : transformer la plateforme fonctionnelle "
        "en offre crédible aux yeux des décideurs, en produisant les premiers "
        "cas clients, en alignant la qualité de l'interface sur le niveau du "
        "site marketing, et en structurant un go-to-market ciblé sur les "
        "segments à plus forte valeur.",
        styles['body']
    ))
    sp(story, 10)

    # Encadré de clôture
    closing_data = [[Paragraph(
        '<b>Niveau de maturité global de la solution</b><br/><br/>'
        'Fonctionnel : <font color="#22c55e"><b>★★★★☆</b></font>  '
        '(MVP complet et cohérent)<br/>'
        'UX/Design : <font color="#f59e0b"><b>★★★☆☆</b></font>  '
        '(Gap avec le site marketing)<br/>'
        'Technique : <font color="#22c55e"><b>★★★★☆</b></font>  '
        '(Architecture multi-tenant solide)<br/>'
        'Commercial : <font color="#ef4444"><b>★★☆☆☆</b></font>  '
        '(Zéro client — validation marché à construire)<br/>'
        'Potentiel marché : <font color="#22c55e"><b>★★★★★</b></font>  '
        '(Marché sous-équipé, concurrence faible localement)',
        styles['body']
    )]]

    ct2 = Table(closing_data, colWidths=[W])
    ct2.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 2, C_TEAL),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('TOPPADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ('BACKGROUND', (0, 0), (-1, -1), C_TEAL_LIGHT),
    ]))
    story.append(ct2)
    sp(story, 14)

    # Signature finale
    sig_data = [[
        Paragraph(
            "<b>GVEO</b><br/>Gestion de Flotte<br/>gveo.org",
            styles['body_sm']
        ),
        Paragraph(
            "Document préparé dans le cadre de la présentation "
            "stratégique de la solution GVEO.<br/>"
            "Usage confidentiel — BUHT Sarl, Mai 2026.",
            styles['caption']
        ),
    ]]
    sig_t = Table(sig_data, colWidths=[5 * cm, W - 5 * cm])
    sig_t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LINEABOVE', (0, 0), (-1, 0), 1, C_DIVIDER),
    ]))
    story.append(sig_t)

    return story


# ─── GÉNÉRATION DU PDF ────────────────────────────────────────────────────────

def generate():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=MARGIN_L,
        rightMargin=MARGIN_R,
        topMargin=MARGIN_T,
        bottomMargin=MARGIN_B + 10 * mm,
        title="GVEO — Document de présentation stratégique",
        author="BUHT Sarl",
        subject="Plateforme SaaS de gestion de flotte automobile",
    )

    styles = make_styles()
    story = build_story(styles)

    doc.build(
        story,
        onFirstPage=build_cover,
        onLaterPages=on_page,
    )
    print(f"PDF généré : {OUTPUT}")
    size_kb = os.path.getsize(OUTPUT) // 1024
    print(f"Taille : {size_kb} Ko")


if __name__ == "__main__":
    generate()
