import re

def slugify(text):
    s = text.lower().strip()
    s = s.replace('&', 'and').replace("'", "")
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s]+', '-', s)
    return s.strip('-')

BOARDS = [
    {"name": "Cambridge IGCSE", "slug": "igcse", "description": "The world's most popular international qualification for 14-16 year olds. Rigorous, globally recognised curriculum."},
    {"name": "AS Level", "slug": "as-level", "description": "Advanced Subsidiary Level. The first half of a full A Level qualification, typically studied at age 16-17."},
    {"name": "A Level", "slug": "a-level", "description": "The gold standard pre-university qualification. Recognised by universities worldwide for admissions."},
]

SUBJECT_META = {
    "mathematics": {"icon": "calculator", "color": "#2563eb"},
    "physics": {"icon": "atom", "color": "#7c3aed"},
    "chemistry": {"icon": "flask", "color": "#16a34a"},
    "biology": {"icon": "leaf", "color": "#059669"},
}

IGCSE = {
    "chemistry": {
        "name": "Chemistry",
        "description": "Master chemical concepts from atomic structure to organic chemistry. Build strong foundations for advanced study.",
        "chapters": [
            {"name": "Atomic Structure", "topics": ["Particles in the Atom", "Atomic Number & Mass Number", "Isotopes", "Electronic Configuration", "Ions"]},
            {"name": "Bonding", "topics": ["Ionic Bonding", "Covalent Bonding", "Metallic Bonding", "Structure & Properties"]},
            {"name": "Stoichiometry", "topics": ["Relative Masses", "Mole Concept", "Formulae", "Reacting Masses", "Percentage Yield", "Titration"]},
            {"name": "Electrochemistry", "topics": ["Electrolysis", "Fuel Cells"]},
            {"name": "Energetics", "topics": ["Exothermic", "Endothermic", "Bond Energy"]},
            {"name": "Chemical Reactions", "topics": ["Rates of Reaction", "Reversible Reactions", "Equilibrium", "Redox"]},
            {"name": "Acids Bases Salts", "topics": ["Acids", "Bases", "Indicators", "Neutralisation", "Salt Preparation"]},
            {"name": "Periodic Table", "topics": ["Group Trends", "Group 1", "Group 7", "Transition Metals", "Noble Gases"]},
            {"name": "Metals", "topics": ["Reactivity Series", "Extraction", "Rusting", "Alloys"]},
            {"name": "Environment Chemistry", "topics": ["Water", "Fertilisers", "Air Pollution", "Climate Change"]},
            {"name": "Organic Chemistry", "topics": ["Alkanes", "Alkenes", "Alcohols", "Carboxylic Acids", "Polymers", "Cracking"]},
        ]
    },
    "physics": {
        "name": "Physics",
        "description": "Understand the fundamental laws governing the universe, from mechanics to nuclear physics.",
        "chapters": [
            {"name": "Motion", "topics": ["Speed", "Velocity", "Acceleration", "Distance Time Graphs", "Velocity Time Graphs"]},
            {"name": "Forces", "topics": ["Newton Laws", "Momentum", "Turning Effect", "Pressure"]},
            {"name": "Energy", "topics": ["Work Done", "Power", "Energy Stores", "Efficiency"]},
            {"name": "Thermal Physics", "topics": ["Temperature", "Expansion", "Specific Heat Capacity"]},
            {"name": "Waves", "topics": ["Reflection", "Refraction", "Sound", "Electromagnetic Spectrum"]},
            {"name": "Light", "topics": ["Lenses", "Mirrors", "Total Internal Reflection"]},
            {"name": "Electricity", "topics": ["Current", "Voltage", "Resistance", "Circuits", "Electrical Safety"]},
            {"name": "Magnetism", "topics": ["Magnets", "Electromagnets", "Motors", "Transformers"]},
            {"name": "Atomic Physics", "topics": ["Radioactivity", "Half Life", "Nuclear Energy"]},
        ]
    },
    "biology": {
        "name": "Biology",
        "description": "Explore life from cellular level to ecosystems. Build understanding of living organisms and their processes.",
        "chapters": [
            {"name": "Characteristics of Living Organisms", "topics": ["MRS GREN", "Classification"]},
            {"name": "Cell Structure", "topics": ["Animal Cells", "Plant Cells", "Cell Organelles"]},
            {"name": "Movement In and Out of Cells", "topics": ["Diffusion", "Osmosis", "Active Transport"]},
            {"name": "Biological Molecules", "topics": ["Carbohydrates", "Proteins", "Fats", "Testing for Nutrients"]},
            {"name": "Enzymes", "topics": ["Enzyme Action", "Factors Affecting Enzymes"]},
            {"name": "Plant Nutrition", "topics": ["Photosynthesis", "Leaf Structure"]},
            {"name": "Human Nutrition", "topics": ["Digestive System", "Digestive Enzymes", "Absorption"]},
            {"name": "Transport in Plants", "topics": ["Xylem & Phloem", "Transpiration"]},
            {"name": "Transport in Animals", "topics": ["Heart Structure", "Blood Vessels", "Blood"]},
            {"name": "Diseases and Immunity", "topics": ["Pathogens", "Body Defences", "Vaccination"]},
            {"name": "Gas Exchange", "topics": ["Lungs", "Alveoli", "Breathing"]},
            {"name": "Respiration", "topics": ["Aerobic Respiration", "Anaerobic Respiration"]},
            {"name": "Excretion", "topics": ["Kidney Structure", "Kidney Function"]},
            {"name": "Coordination and Response", "topics": ["Nervous System", "Reflex Arc", "Eye"]},
            {"name": "Hormones", "topics": ["Endocrine System", "Adrenaline", "Insulin"]},
            {"name": "Reproduction", "topics": ["Sexual Reproduction", "Menstrual Cycle", "Fertilisation"]},
            {"name": "Inheritance", "topics": ["DNA", "Genes", "Genetic Crosses", "Mutations"]},
            {"name": "Variation and Selection", "topics": ["Natural Selection", "Selective Breeding", "Evolution"]},
            {"name": "Ecosystems", "topics": ["Food Chains", "Energy Flow", "Nutrient Cycles"]},
            {"name": "Human Influence on Environment", "topics": ["Pollution", "Deforestation", "Conservation"]},
            {"name": "Biotechnology", "topics": ["Genetic Engineering", "Cloning", "Fermentation"]},
        ]
    },
    "mathematics": {
        "name": "Mathematics",
        "description": "Develop strong mathematical skills from number theory to advanced statistics and trigonometry.",
        "chapters": [
            {"name": "Number", "topics": ["Fractions", "Percentages", "Ratio", "Standard Form"]},
            {"name": "Algebra", "topics": ["Expressions", "Equations", "Inequalities", "Functions", "Sequences"]},
            {"name": "Graphs", "topics": ["Linear Graphs", "Quadratics", "Transformations"]},
            {"name": "Geometry", "topics": ["Angles", "Polygons", "Circle Theorems", "Constructions"]},
            {"name": "Mensuration", "topics": ["Area", "Surface Area", "Volume"]},
            {"name": "Trigonometry", "topics": ["SOHCAHTOA", "Sine Rule", "Cosine Rule"]},
            {"name": "Probability", "topics": ["Basic Probability", "Tree Diagrams", "Venn Diagrams"]},
            {"name": "Statistics", "topics": ["Mean Median Mode", "Histograms", "Cumulative Frequency"]},
            {"name": "Vectors", "topics": ["Vector Notation", "Vector Operations"]},
            {"name": "Matrices", "topics": ["Matrix Operations", "Transformations with Matrices"]},
        ]
    }
}

AS_LEVEL = {
    "mathematics": {
        "name": "Mathematics",
        "description": "Pure Mathematics, Statistics and Mechanics at an advanced subsidiary level.",
        "chapters": [
            {"name": "Pure Mathematics 1", "topics": ["Quadratics", "Functions", "Coordinate Geometry", "Circular Measure", "Trigonometry", "Series", "Differentiation", "Integration"]},
            {"name": "Statistics 1", "topics": ["Representation of Data", "Permutations & Combinations", "Probability", "Discrete Random Variables", "Normal Distribution"]},
            {"name": "Mechanics 1", "topics": ["Forces & Equilibrium", "Kinematics", "Newton Laws of Motion", "Energy Work Power"]},
        ]
    },
    "physics": {
        "name": "Physics",
        "description": "Advanced physics covering mechanics, waves, electricity and particle physics.",
        "chapters": [
            {"name": "Physical Quantities & Units", "topics": ["SI Units", "Scalars & Vectors", "Measurement Techniques"]},
            {"name": "Kinematics", "topics": ["Equations of Motion", "Projectile Motion", "Displacement-Time Graphs"]},
            {"name": "Dynamics", "topics": ["Newton Laws", "Linear Momentum", "Collisions"]},
            {"name": "Forces Density Pressure", "topics": ["Turning Effects", "Equilibrium", "Density & Pressure"]},
            {"name": "Work Energy Power", "topics": ["Work & Energy", "Kinetic & Potential Energy", "Power & Efficiency"]},
            {"name": "Waves", "topics": ["Progressive Waves", "Transverse & Longitudinal", "Doppler Effect", "Superposition", "Stationary Waves", "Diffraction"]},
            {"name": "Electricity", "topics": ["Electric Current", "Potential Difference", "Resistance", "Kirchhoff Laws", "DC Circuits"]},
            {"name": "Particle Physics", "topics": ["Atomic Structure", "Fundamental Particles", "Radioactivity"]},
        ]
    },
    "chemistry": {
        "name": "Chemistry",
        "description": "Advanced chemistry covering physical, inorganic and organic chemistry.",
        "chapters": [
            {"name": "Atoms Molecules Stoichiometry", "topics": ["Atomic Structure", "Mole Calculations", "Chemical Equations"]},
            {"name": "Atomic Structure", "topics": ["Electron Configuration", "Ionisation Energy", "Orbitals"]},
            {"name": "Chemical Bonding", "topics": ["Ionic Bonding", "Covalent Bonding", "Shapes of Molecules", "Electronegativity", "Intermolecular Forces"]},
            {"name": "States of Matter", "topics": ["Gases", "Liquids", "Solids"]},
            {"name": "Chemical Energetics", "topics": ["Enthalpy Changes", "Hess Law", "Bond Energies"]},
            {"name": "Electrochemistry", "topics": ["Redox Reactions", "Electrolysis", "Electrode Potentials"]},
            {"name": "Chemical Equilibria", "topics": ["Equilibrium Concepts", "Le Chatelier Principle", "Equilibrium Constants"]},
            {"name": "Organic Chemistry Intro", "topics": ["Nomenclature", "Alkanes", "Alkenes", "Halogenoalkanes", "Alcohols"]},
        ]
    },
    "biology": {
        "name": "Biology",
        "description": "Advanced biology covering cell biology, biochemistry, transport and genetics.",
        "chapters": [
            {"name": "Cell Structure", "topics": ["Microscopy", "Cell Ultrastructure", "Prokaryotes vs Eukaryotes"]},
            {"name": "Biological Molecules", "topics": ["Water", "Carbohydrates", "Lipids", "Proteins", "Nucleic Acids"]},
            {"name": "Enzymes", "topics": ["Enzyme Kinetics", "Inhibitors", "Cofactors"]},
            {"name": "Cell Membranes & Transport", "topics": ["Membrane Structure", "Diffusion & Osmosis", "Active Transport & Endocytosis"]},
            {"name": "Cell Division", "topics": ["Mitosis", "Meiosis", "Cell Cycle"]},
            {"name": "Gas Exchange", "topics": ["Mammalian Gas Exchange", "Insect Gas Exchange", "Plant Gas Exchange"]},
            {"name": "Transport", "topics": ["Circulatory System", "Haemoglobin", "Plant Transport"]},
        ]
    }
}

A_LEVEL = {
    "mathematics": {
        "name": "Mathematics",
        "description": "Full A Level Mathematics covering Pure Mathematics, Statistics and Mechanics.",
        "chapters": [
            {"name": "Pure Mathematics 2 & 3", "topics": ["Algebra", "Logarithms", "Trigonometry Advanced", "Differentiation Advanced", "Integration Advanced", "Numerical Methods", "Vectors", "Differential Equations", "Complex Numbers"]},
            {"name": "Statistics 2", "topics": ["Poisson Distribution", "Linear Combinations", "Continuous Random Variables", "Sampling", "Hypothesis Testing"]},
            {"name": "Mechanics 2", "topics": ["Motion in a Circle", "Equilibrium of a Rigid Body", "Hooke Law", "Linear Motion Under Variable Force"]},
        ]
    },
    "physics": {
        "name": "Physics",
        "description": "Full A Level Physics covering advanced mechanics, fields, and modern physics.",
        "chapters": [
            {"name": "Circular Motion", "topics": ["Angular Velocity", "Centripetal Force", "Circular Orbits"]},
            {"name": "Gravitational Fields", "topics": ["Newton Law of Gravitation", "Gravitational Field Strength", "Gravitational Potential"]},
            {"name": "Electric Fields", "topics": ["Coulomb Law", "Electric Field Strength", "Electric Potential"]},
            {"name": "Capacitance", "topics": ["Capacitors", "Charging & Discharging", "Energy Stored"]},
            {"name": "Magnetic Fields", "topics": ["Magnetic Flux", "Electromagnetic Induction", "Alternating Current"]},
            {"name": "Nuclear Physics", "topics": ["Nuclear Reactions", "Mass-Energy Equivalence", "Binding Energy"]},
        ]
    },
    "chemistry": {
        "name": "Chemistry",
        "description": "Full A Level Chemistry covering advanced physical, inorganic and organic chemistry.",
        "chapters": [
            {"name": "Reaction Kinetics", "topics": ["Rate Equations", "Order of Reaction", "Activation Energy"]},
            {"name": "Chemical Equilibria Advanced", "topics": ["Kc & Kp", "Acid-Base Equilibria", "Buffer Solutions", "Solubility Product"]},
            {"name": "Organic Chemistry Advanced", "topics": ["Aldehydes & Ketones", "Carboxylic Acids & Esters", "Nitrogen Compounds", "Polymerisation", "Organic Synthesis"]},
            {"name": "Analytical Chemistry", "topics": ["Infrared Spectroscopy", "Mass Spectrometry", "NMR Spectroscopy", "Chromatography"]},
        ]
    },
    "biology": {
        "name": "Biology",
        "description": "Full A Level Biology covering advanced physiology, genetics and ecology.",
        "chapters": [
            {"name": "Energy & Respiration", "topics": ["ATP", "Glycolysis", "Krebs Cycle", "Oxidative Phosphorylation"]},
            {"name": "Photosynthesis", "topics": ["Light Dependent Reactions", "Calvin Cycle", "Limiting Factors"]},
            {"name": "Homeostasis", "topics": ["Thermoregulation", "Blood Glucose Regulation", "Kidney Function"]},
            {"name": "Genetics & Selection", "topics": ["Gene Expression", "Genetic Engineering", "Natural Selection", "Speciation"]},
            {"name": "Biodiversity", "topics": ["Classification", "Conservation", "Ecosystems"]},
        ]
    }
}

SAMPLE_CONTENT = {
    ("igcse", "chemistry", "atomic-structure", "isotopes"): {
        "introduction": "Isotopes are atoms of the same element that have different numbers of neutrons. They have the same atomic number but different mass numbers. Understanding isotopes is fundamental to chemistry and has applications in medicine, archaeology, and energy production.",
        "sections": [
            {"title": "What are Isotopes?", "content": "All atoms of an element have the same number of protons (atomic number). However, the number of neutrons can vary. Atoms of the same element with different numbers of neutrons are called isotopes.\n\nFor example, carbon has three naturally occurring isotopes: Carbon-12, Carbon-13, and Carbon-14. They all have 6 protons, but have 6, 7, and 8 neutrons respectively."},
            {"title": "Properties of Isotopes", "content": "Isotopes of the same element have:\n- The same chemical properties (because they have the same electron configuration)\n- Different physical properties (such as density and rate of diffusion)\n- Different mass numbers\n\nThe chemical properties are the same because chemical reactions involve electrons, and isotopes have the same number of electrons."},
            {"title": "Relative Atomic Mass", "content": "Since elements exist as mixtures of isotopes, we use the relative atomic mass (Ar) which is the weighted average of the masses of all the isotopes. This is why relative atomic masses on the periodic table are not whole numbers."},
        ],
        "definitions": [
            {"term": "Isotope", "definition": "Atoms of the same element with the same number of protons but different numbers of neutrons."},
            {"term": "Atomic Number (Z)", "definition": "The number of protons in the nucleus of an atom."},
            {"term": "Mass Number (A)", "definition": "The total number of protons and neutrons in the nucleus of an atom."},
            {"term": "Relative Atomic Mass", "definition": "The weighted average mass of an atom of an element compared to 1/12 the mass of a carbon-12 atom."},
        ],
        "formulas": [
            {"name": "Mass Number", "formula": "A = Z + N", "description": "Where A is mass number, Z is atomic number (protons), N is number of neutrons."},
            {"name": "Relative Atomic Mass", "formula": "Ar = Sum(isotope mass x abundance) / 100", "description": "Weighted average based on natural abundance of each isotope."},
        ],
        "worked_examples": [
            {"question": "Chlorine has two isotopes: Cl-35 (75% abundance) and Cl-37 (25% abundance). Calculate the relative atomic mass of chlorine.", "solution": "Ar = (35 x 75 + 37 x 25) / 100\nAr = (2625 + 925) / 100\nAr = 3550 / 100\nAr = 35.5\n\nThe relative atomic mass of chlorine is 35.5"},
        ],
        "common_mistakes": [
            "Confusing atomic number with mass number",
            "Thinking isotopes have different chemical properties - they don't, because chemical properties depend on electrons",
            "Forgetting that the number of electrons equals the number of protons in a neutral atom",
            "Not using weighted average when calculating relative atomic mass",
        ],
        "examiner_tips": [
            "Always state that isotopes have the SAME number of protons but DIFFERENT number of neutrons",
            "When asked about properties, clearly distinguish between chemical (same) and physical (different) properties",
            "Show all working when calculating relative atomic mass - marks are awarded for method",
        ],
        "summary": [
            "Isotopes are atoms of the same element with different mass numbers",
            "They have the same number of protons but different numbers of neutrons",
            "Chemical properties are identical; physical properties differ",
            "Relative atomic mass is a weighted average of isotope masses",
        ],
    },
    ("igcse", "physics", "motion", "acceleration"): {
        "introduction": "Acceleration is the rate of change of velocity. It tells us how quickly an object is speeding up, slowing down, or changing direction. Understanding acceleration is key to analysing motion in physics.",
        "sections": [
            {"title": "Defining Acceleration", "content": "Acceleration is defined as the change in velocity per unit time. It is a vector quantity, meaning it has both magnitude and direction.\n\nAn object accelerates when it speeds up, slows down (deceleration/negative acceleration), or changes direction."},
            {"title": "Uniform Acceleration", "content": "When acceleration is constant (uniform), we can use the equations of motion (SUVAT equations) to solve problems. On a velocity-time graph, uniform acceleration appears as a straight line."},
            {"title": "Calculating from Graphs", "content": "The gradient (slope) of a velocity-time graph gives the acceleration. A positive gradient means acceleration, while a negative gradient means deceleration."},
        ],
        "definitions": [
            {"term": "Acceleration", "definition": "The rate of change of velocity with respect to time. SI unit: m/s^2"},
            {"term": "Deceleration", "definition": "Negative acceleration; the object is slowing down."},
            {"term": "Uniform Acceleration", "definition": "Acceleration that remains constant over time."},
        ],
        "formulas": [
            {"name": "Acceleration", "formula": "a = (v - u) / t", "description": "Where a = acceleration, v = final velocity, u = initial velocity, t = time taken."},
            {"name": "SUVAT (1)", "formula": "v = u + at", "description": "Final velocity from initial velocity, acceleration, and time."},
            {"name": "SUVAT (2)", "formula": "s = ut + 1/2 at^2", "description": "Displacement from initial velocity, acceleration, and time."},
            {"name": "SUVAT (3)", "formula": "v^2 = u^2 + 2as", "description": "Final velocity squared from initial velocity, acceleration, and displacement."},
        ],
        "worked_examples": [
            {"question": "A car accelerates from rest to 20 m/s in 8 seconds. Calculate its acceleration.", "solution": "Given: u = 0 m/s (starts from rest), v = 20 m/s, t = 8 s\n\na = (v - u) / t\na = (20 - 0) / 8\na = 20 / 8\na = 2.5 m/s^2\n\nThe car's acceleration is 2.5 m/s^2"},
        ],
        "common_mistakes": [
            "Forgetting to convert km/h to m/s when using SI units",
            "Confusing speed with velocity (velocity includes direction)",
            "Not recognising that deceleration is negative acceleration",
            "Using the wrong SUVAT equation for the given variables",
        ],
        "examiner_tips": [
            "Always list the known SUVAT variables before choosing an equation",
            "Check your units - acceleration should be in m/s^2",
            "On graph questions, remember that gradient of v-t graph = acceleration, and area under v-t graph = displacement",
        ],
        "summary": [
            "Acceleration = change in velocity / time",
            "SI unit is m/s^2",
            "It is a vector quantity",
            "Gradient of velocity-time graph gives acceleration",
            "Use SUVAT equations for uniform acceleration problems",
        ],
    },
    ("igcse", "biology", "movement-in-and-out-of-cells", "osmosis"): {
        "introduction": "Osmosis is the net movement of water molecules from a region of higher water potential to a region of lower water potential through a partially permeable membrane.",
        "sections": [
            {"title": "How Osmosis Works", "content": "Water molecules are small enough to pass through the tiny pores in a partially permeable membrane. They move randomly in all directions, but there is a net movement from the dilute solution (high water potential) to the concentrated solution (low water potential)."},
            {"title": "Osmosis in Plant Cells", "content": "When a plant cell is placed in pure water, water enters by osmosis. The cell swells but does not burst because the rigid cell wall provides support. The cell becomes turgid.\n\nWhen placed in a concentrated solution, water leaves the cell. The cell membrane pulls away from the cell wall — this is called plasmolysis."},
            {"title": "Osmosis in Animal Cells", "content": "Animal cells have no cell wall. In pure water, they swell and may burst (lysis). In concentrated solutions, they shrink and become crenated."},
        ],
        "definitions": [
            {"term": "Osmosis", "definition": "The net movement of water molecules from a region of higher water potential to a region of lower water potential through a partially permeable membrane."},
            {"term": "Partially Permeable Membrane", "definition": "A membrane that allows some molecules (like water) to pass through but not others."},
            {"term": "Turgid", "definition": "A plant cell that is firm and swollen because it has absorbed water by osmosis."},
            {"term": "Plasmolysis", "definition": "The shrinking of the cell membrane away from the cell wall when water leaves a plant cell by osmosis."},
        ],
        "formulas": [],
        "worked_examples": [
            {"question": "A piece of potato is placed in pure water. After 30 minutes, the potato has increased in mass. Explain why.", "solution": "1. The pure water has a higher water potential than the potato cells.\n2. Water molecules move into the potato cells by osmosis.\n3. This occurs through the partially permeable cell membranes.\n4. The net movement is from high water potential to low water potential.\n5. This causes the cells to gain water and increase in mass."},
        ],
        "common_mistakes": [
            "Saying water moves from low concentration to high concentration — use water potential terminology",
            "Forgetting to mention the partially permeable membrane",
            "Confusing osmosis with diffusion — osmosis is specifically about water through a membrane",
        ],
        "examiner_tips": [
            "Always mention: water molecules, water potential, partially permeable membrane",
            "In practical questions, explain the direction of water movement using water potential",
            "Know the difference between turgid, flaccid, and plasmolysed cells",
        ],
        "summary": [
            "Osmosis is the movement of water from high to low water potential through a partially permeable membrane",
            "Plant cells become turgid in water, plasmolysed in concentrated solutions",
            "Animal cells may burst in water or shrink in concentrated solutions",
        ],
    },
    ("igcse", "biology", "plant-nutrition", "photosynthesis"): {
        "introduction": "Photosynthesis is the process by which green plants use light energy to convert carbon dioxide and water into glucose and oxygen.",
        "sections": [
            {"title": "The Equation", "content": "6CO2 + 6H2O → C6H12O6 + 6O2\n\nCarbon dioxide + Water → Glucose + Oxygen\n\nLight energy is absorbed by chlorophyll in the chloroplasts."},
            {"title": "Limiting Factors", "content": "Three main factors limit the rate of photosynthesis:\n\n1. Light intensity — more light increases rate up to a point\n2. Carbon dioxide concentration — more CO2 increases rate\n3. Temperature — enzymes work faster up to an optimum, then denature"},
        ],
        "definitions": [
            {"term": "Photosynthesis", "definition": "The process by which plants use light energy to convert CO2 and water into glucose and oxygen."},
            {"term": "Chlorophyll", "definition": "The green pigment in chloroplasts that absorbs light energy."},
            {"term": "Limiting Factor", "definition": "The factor in shortest supply that restricts the rate of photosynthesis."},
        ],
        "formulas": [
            {"name": "Photosynthesis Equation", "formula": "6CO2 + 6H2O → C6H12O6 + 6O2", "description": "Requires light energy and chlorophyll."},
        ],
        "worked_examples": [
            {"question": "A student measured oxygen bubbles at different light distances. At 10cm: 5 bubbles/min. At 5cm: 18 bubbles/min. Explain.", "solution": "1. At 5cm, light intensity is higher.\n2. Higher light intensity increases rate of photosynthesis.\n3. More photosynthesis produces more oxygen.\n4. Therefore more oxygen bubbles are released per minute."},
        ],
        "common_mistakes": ["Thinking photosynthesis only happens in daytime — correct, but respiration happens all the time", "Forgetting temperature affects enzymes in photosynthesis"],
        "examiner_tips": ["Learn both word and balanced symbol equations", "In graph questions, explain what limits the rate at the plateau"],
        "summary": ["Photosynthesis converts CO2 and water into glucose and oxygen", "Chlorophyll absorbs light energy in chloroplasts", "Rate limited by light, CO2, and temperature"],
    },
    ("igcse", "chemistry", "bonding", "ionic-bonding"): {
        "introduction": "Ionic bonding involves the transfer of electrons from a metal atom to a non-metal atom, creating oppositely charged ions held together by strong electrostatic forces.",
        "sections": [
            {"title": "How Ionic Bonds Form", "content": "Metal atoms lose electrons to form positive ions (cations). Non-metal atoms gain electrons to form negative ions (anions).\n\nFor example, sodium (Na) loses one electron to become Na+, and chlorine (Cl) gains one electron to become Cl-."},
            {"title": "Properties of Ionic Compounds", "content": "Ionic compounds have:\n- High melting and boiling points\n- Conduct electricity when molten or dissolved (ions free to move)\n- Do not conduct when solid (ions fixed in lattice)\n- Usually soluble in water"},
        ],
        "definitions": [
            {"term": "Ionic Bond", "definition": "The strong electrostatic force of attraction between oppositely charged ions."},
            {"term": "Cation", "definition": "A positively charged ion formed when an atom loses electrons."},
            {"term": "Anion", "definition": "A negatively charged ion formed when an atom gains electrons."},
        ],
        "formulas": [],
        "worked_examples": [
            {"question": "Describe the formation of magnesium oxide (MgO).", "solution": "1. Magnesium (2,8,2) loses 2 electrons → Mg2+ (2,8)\n2. Oxygen (2,6) gains 2 electrons → O2- (2,8)\n3. Strong electrostatic attraction between Mg2+ and O2- forms the ionic bond.\n4. Both ions have stable full outer shells."},
        ],
        "common_mistakes": ["Saying electrons are shared — they are transferred", "Forgetting the compound is electrically neutral overall"],
        "examiner_tips": ["Always state 'electrostatic force of attraction between oppositely charged ions'", "Metals LOSE electrons, non-metals GAIN electrons"],
        "summary": ["Ionic bonds form by electron transfer from metals to non-metals", "Creates cations and anions", "High melting points, conduct when molten/dissolved"],
    },
    ("igcse", "chemistry", "stoichiometry", "mole-concept"): {
        "introduction": "The mole is the chemist's counting unit. One mole contains 6.02 x 10^23 particles (Avogadro's number). It links mass to number of particles.",
        "sections": [
            {"title": "What is a Mole?", "content": "A mole is the amount of substance containing 6.02 x 10^23 particles. The molar mass is the relative formula mass in grams. For water (H2O), molar mass = 18 g/mol."},
            {"title": "Mole Calculations", "content": "Key relationship: moles = mass / molar mass\n\nFor gases at RTP, one mole occupies 24 dm^3."},
        ],
        "definitions": [
            {"term": "Mole", "definition": "The amount of substance containing 6.02 x 10^23 particles."},
            {"term": "Avogadro's Constant", "definition": "6.02 x 10^23 — the number of particles in one mole."},
            {"term": "Molar Mass", "definition": "The mass of one mole of a substance in g/mol."},
        ],
        "formulas": [
            {"name": "Moles from Mass", "formula": "n = m / M", "description": "n = moles, m = mass (g), M = molar mass (g/mol)"},
            {"name": "Moles of Gas", "formula": "n = V / 24", "description": "V = volume in dm^3 at RTP"},
            {"name": "Concentration", "formula": "c = n / V", "description": "c = mol/dm^3, n = moles, V = volume (dm^3)"},
        ],
        "worked_examples": [
            {"question": "Calculate moles in 11g of CO2. [C=12, O=16]", "solution": "M(CO2) = 12 + (16 x 2) = 44 g/mol\nn = m/M = 11/44 = 0.25 mol"},
        ],
        "common_mistakes": ["Not converting cm^3 to dm^3 (divide by 1000)", "Forgetting the correct volume at RTP (24 dm^3)"],
        "examiner_tips": ["Always show working: write formula, substitute, calculate", "The triangle method (n = m/M) helps rearranging"],
        "summary": ["One mole = 6.02 x 10^23 particles", "Moles = mass / molar mass", "One mole of gas at RTP = 24 dm^3"],
    },
    ("igcse", "physics", "forces", "newton-laws"): {
        "introduction": "Newton's three laws of motion describe the relationship between forces acting on an object and its motion.",
        "sections": [
            {"title": "Newton's First Law", "content": "An object remains at rest or constant velocity unless acted upon by an unbalanced (resultant) force."},
            {"title": "Newton's Second Law", "content": "F = ma. Acceleration is proportional to resultant force and inversely proportional to mass."},
            {"title": "Newton's Third Law", "content": "For every action, there is an equal and opposite reaction. These force pairs act on different objects."},
        ],
        "definitions": [
            {"term": "Resultant Force", "definition": "The single force that has the same effect as all forces combined."},
            {"term": "Newton (N)", "definition": "SI unit of force. 1 N gives a 1 kg mass an acceleration of 1 m/s^2."},
        ],
        "formulas": [
            {"name": "Newton's Second Law", "formula": "F = ma", "description": "Force (N) = mass (kg) x acceleration (m/s^2)"},
            {"name": "Weight", "formula": "W = mg", "description": "Weight (N) = mass (kg) x g (9.8 N/kg on Earth)"},
        ],
        "worked_examples": [
            {"question": "A 1200 kg car accelerates at 2.5 m/s^2. Find the resultant force.", "solution": "F = ma = 1200 x 2.5 = 3000 N"},
        ],
        "common_mistakes": ["Confusing mass and weight", "Third Law pairs act on DIFFERENT objects", "F = ma uses RESULTANT force"],
        "examiner_tips": ["For Third Law, identify the TWO objects and TWO forces", "Draw free-body diagrams with all forces labelled"],
        "summary": ["1st Law: No resultant force = no change in motion", "2nd Law: F = ma", "3rd Law: Equal and opposite reaction on different objects"],
    },
    ("igcse", "physics", "electricity", "resistance"): {
        "introduction": "Resistance is the opposition to current flow, measured in ohms. It determines how much current flows for a given voltage.",
        "sections": [
            {"title": "Ohm's Law", "content": "For a conductor at constant temperature, current is proportional to voltage. V = IR. Ohmic conductors have a straight-line I-V graph through the origin."},
            {"title": "Factors Affecting Resistance", "content": "Resistance depends on: length (longer = more), cross-sectional area (thinner = more), material, and temperature (higher = more for metals)."},
        ],
        "definitions": [
            {"term": "Resistance", "definition": "Opposition to current flow, measured in ohms."},
            {"term": "Ohm's Law", "definition": "Current is proportional to voltage at constant temperature."},
        ],
        "formulas": [
            {"name": "Ohm's Law", "formula": "V = IR", "description": "Voltage (V) = Current (A) x Resistance (ohm)"},
            {"name": "Series", "formula": "R_total = R1 + R2 + R3", "description": "Total resistance in series"},
            {"name": "Parallel", "formula": "1/R_total = 1/R1 + 1/R2", "description": "Total resistance in parallel"},
        ],
        "worked_examples": [
            {"question": "A 12V battery connects to a 4 ohm resistor. Find the current.", "solution": "I = V/R = 12/4 = 3 A"},
        ],
        "common_mistakes": ["Confusing series and parallel formulas", "Parallel resistors DECREASE total resistance"],
        "examiner_tips": ["State Ohm's Law with 'at constant temperature'", "Gradient of V vs I graph = resistance"],
        "summary": ["V = IR (Ohm's Law)", "Series: resistances add", "Parallel: total resistance decreases", "Resistance depends on length, area, material, temperature"],
    },
    ("igcse", "mathematics", "algebra", "equations"): {
        "introduction": "Equations are mathematical statements where two expressions are equal. Solving means finding the unknown value that makes the equation true.",
        "sections": [
            {"title": "Linear Equations", "content": "Isolate the variable by performing the same operations on both sides.\n\nExample: 3x + 5 = 14 → 3x = 9 → x = 3"},
            {"title": "Simultaneous Equations", "content": "Two equations with two unknowns. Solve by elimination or substitution."},
        ],
        "definitions": [
            {"term": "Equation", "definition": "A mathematical statement that two expressions are equal."},
            {"term": "Simultaneous Equations", "definition": "A set of equations sharing variables, solved together."},
        ],
        "formulas": [
            {"name": "Quadratic Formula", "formula": "x = (-b +/- sqrt(b^2 - 4ac)) / 2a", "description": "Solves ax^2 + bx + c = 0"},
        ],
        "worked_examples": [
            {"question": "Solve: 2x + y = 7 and x - y = 2", "solution": "Add equations: 3x = 9, so x = 3\nSubstitute: 3 - y = 2, so y = 1\nSolution: x = 3, y = 1"},
        ],
        "common_mistakes": ["Forgetting to do same operation on BOTH sides", "Sign errors with negative brackets"],
        "examiner_tips": ["Show each step clearly", "Check by substituting back into original equation"],
        "summary": ["Solve by isolating the variable", "Simultaneous: elimination or substitution", "Always check your answer"],
    },
    ("igcse", "mathematics", "number", "percentages"): {
        "introduction": "Percentages express a number as a fraction of 100. Used for discounts, interest rates, tax, and data analysis.",
        "sections": [
            {"title": "Finding a Percentage", "content": "To find x% of an amount: multiply by x/100. Or use multiplier: 15% = 0.15."},
            {"title": "Percentage Change", "content": "Increase: multiplier = (1 + %/100). Decrease: multiplier = (1 - %/100).\n\nReverse: divide by multiplier to find original."},
        ],
        "definitions": [
            {"term": "Percentage", "definition": "A number expressed as a fraction of 100."},
            {"term": "Multiplier", "definition": "Decimal for percentage changes. E.g. 15% increase = 1.15."},
        ],
        "formulas": [
            {"name": "Percentage of Amount", "formula": "Amount x (% / 100)", "description": "Find a percentage of a number"},
            {"name": "Percentage Change", "formula": "(Difference / Original) x 100%", "description": "Calculate % increase or decrease"},
        ],
        "worked_examples": [
            {"question": "A jacket costs $85 after 15% discount. Find original price.", "solution": "Multiplier = 1 - 0.15 = 0.85\nOriginal = $85 / 0.85 = $100"},
        ],
        "common_mistakes": ["Using wrong base value in reverse percentage", "Adding percentage to new amount instead of using multiplier"],
        "examiner_tips": ["Use multiplier method — faster and less error-prone", "For reverse %, always divide by multiplier"],
        "summary": ["Percentages = fractions of 100", "Increase 25% = multiply by 1.25", "Reverse: divide by multiplier", "Change = (diff/original) x 100"],
    },
}

ALL_CURRICULUM = {"igcse": IGCSE, "as-level": AS_LEVEL, "a-level": A_LEVEL}
