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
    }
}

ALL_CURRICULUM = {"igcse": IGCSE, "as-level": AS_LEVEL, "a-level": A_LEVEL}
