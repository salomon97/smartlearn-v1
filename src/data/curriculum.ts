export interface Program {
  id: string;
  title: string;
  category: string;
  cycle: 'Premier Cycle' | 'Second Cycle Littéraire' | 'Second Cycle Scientifique' | 'Série Technique';
  description: string;
  objectives: string[];
  modules: string[];
  gradeLevels: string[];
  icon: string;
  color: string;
}

export const programs: Program[] = [
  {
    id: 'premier-cycle-maths',
    title: 'Mathématiques - Premier Cycle',
    category: 'Mathématiques',
    cycle: 'Premier Cycle',
    description: 'Bâtir un socle solide en calcul, géométrie et raisonnement logique pour réussir le BEPC.',
    objectives: [
      'Maîtriser les nombres décimaux et fractions',
      'Appliquer Thalès et Pythagore avec précision',
      'Résoudre des équations et systèmes complexes',
      'Analyser des données statistiques'
    ],
    modules: ['Nombres rationnels', 'Symétrie axiale', 'Proportionnalité', 'Calcul littéral', 'Racines carrées'],
    gradeLevels: ['6ème', '5ème', '4ème', '3ème'],
    icon: '📐',
    color: 'from-blue-600 to-cyan-500'
  },
  {
    id: 'premier-cycle-info',
    title: 'Informatique - Premier Cycle',
    category: 'Informatique',
    cycle: 'Premier Cycle',
    description: 'Initiation à l\'architecture des ordinateurs, à la bureautique et à l\'algorithmique de base.',
    objectives: [
      'Comprendre l\'architecture et les périphériques',
      'Maîtriser le traitement de texte et les tableurs',
      'S\'initier aux réseaux et adresses IP',
      'Apprendre les bases du raisonnement logique'
    ],
    modules: ['Architecture PC', 'Word/Excel', 'Topologies Réseaux', 'Binaire', 'Structures de contrôle'],
    gradeLevels: ['6ème', '5ème', '4ème', '3ème'],
    icon: '💻',
    color: 'from-indigo-600 to-purple-500'
  },
  {
    id: 'second-cycle-lit-maths',
    title: 'Mathématiques - Séries A',
    category: 'Mathématiques',
    cycle: 'Second Cycle Littéraire',
    description: 'Approfondissement des fonctions, de la dérivation et des probabilités pour les futurs gestionnaires.',
    objectives: [
      'Étudier les fonctions logarithmes et exponentielles',
      'Calculer des limites et dérivées complexes',
      'Appliquer les probabilités aux situations de vie',
      'Maîtriser le dénombrement'
    ],
    modules: ['Équations 2nd degré', 'Dérivation', 'Logarithmes', 'Intégrales simples'],
    gradeLevels: ['2nde A', '1ère A', 'Terminale A'],
    icon: '🖋️',
    color: 'from-purple-600 to-pink-500'
  },
  {
    id: 'second-cycle-sci-maths',
    title: 'Mathématiques - Séries C/D/E',
    category: 'Mathématiques',
    cycle: 'Second Cycle Scientifique',
    description: 'Niveau d\'excellence en analyse, géométrie plane et nombres complexes pour scientifiques.',
    objectives: [
      'Maîtriser les vecteurs et les homothéties',
      'Manipuler les nombres complexes avec aisance',
      'Résoudre des équations différentielles',
      'Analyser des fonctions avancées'
    ],
    modules: ['Vecteurs', 'Homothéties', 'Suites', 'Similitudes', 'Géométrie espace'],
    gradeLevels: ['2nde C', '1ère C', '1ère D', '1ère E', 'Terminale C', 'Terminale D', 'Terminale E'],
    icon: '🔬',
    color: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'second-cycle-sci-info',
    title: 'Informatique - Séries C/D/E',
    category: 'Informatique',
    cycle: 'Second Cycle Scientifique',
    description: 'Programmation, algorithmique avancée et sécurité informatique pour le baccalauréat.',
    objectives: [
      'Coder en Langage C et Python',
      'Sécuriser des systèmes d\'information',
      'Utiliser les logiciels d\'infographie',
      'Comprendre les structures itératives'
    ],
    modules: ['C/Python', 'Sécurité Informatique', 'Multimédia', 'Structures itératives', 'Réseaux IP'],
    gradeLevels: ['2nde C', '1ère C', '1ère D', '1ère E', 'Terminale C', 'Terminale D', 'Terminale E'],
    icon: '⚙️',
    color: 'from-blue-700 to-indigo-600'
  },
  {
    id: 'technique-ti',
    title: 'Série TI - Programmation & Réseaux',
    category: 'Informatique TI',
    cycle: 'Série Technique',
    description: 'Formation de pointe en développement Web (HTML/CSS/JS/PHP/SQL) et administration réseaux.',
    objectives: [
      'Développer des applications Web complètes',
      'Administrer des réseaux informatiques',
      'Maîtriser l\'arithmétique complexe',
      'Assurer la maintenance avancée'
    ],
    modules: ['SQL/PHP/JS', 'Algorithmique procédurale', 'HTML/CSS', 'Espaces vectoriels', 'Administration Réseau'],
    gradeLevels: ['2nde TI', '1ère TI', 'Terminale TI'],
    icon: '🚀',
    color: 'from-brand-orange to-red-500'
  }
];
