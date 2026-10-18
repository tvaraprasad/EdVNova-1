"""Cambridge International AS & A Level Chemistry 9701 (2025-2027): EdVNova navigation spec.
Chapter numbers follow the syllabus. Subtopic labels are EdVNova organisational labels, unverified."""
import re

SPEC = """
C|as-level|1|atomic-structure|Atomic structure|Physical chemistry
T|1.1|Subatomic particles and atomic radius|Structure of the atom;Protons, neutrons and electrons;Atomic number, mass number and ions;Atomic and ionic radii
T|1.2|Isotopes|Isotopic notation;Properties of isotopes;Isotopes and atomic identity
T|1.3|Electrons, energy levels and orbitals|Electron shells and sub-shells;Atomic orbitals;Electronic configurations of atoms and ions;Orbital box notation;Free radicals and unpaired electrons
T|1.4|Ionisation energy|First and successive ionisation energies;Factors affecting ionisation energy;Periodic ionisation energy trends;Interpreting successive ionisation energy data
C|as-level|2|atoms-molecules-stoichiometry|Atoms, molecules and stoichiometry|Physical chemistry
T|2.1|Relative atomic and molecular masses|Relative isotopic mass;Relative atomic mass;Relative molecular and formula masses
T|2.2|The mole and Avogadro constant|Amount of substance;Avogadro constant;Mole, mass and particle conversions
T|2.3|Chemical formulae and equations|Ionic formulae;Balanced and ionic equations;Empirical and molecular formulae;Hydrated salts and water of crystallisation
T|2.4|Reacting masses, solutions and gases|Stoichiometric calculations;Limiting and excess reactants;Percentage yield;Concentration and solution calculations;Gas-volume calculations;Significant figures in chemical calculations
C|as-level|3|chemical-bonding|Chemical bonding|Physical chemistry
T|3.1|Electronegativity and chemical bonding|Electronegativity;Periodic electronegativity trends;Predicting bond character
T|3.2|Ionic bonding|Formation of ions;Electrostatic attraction;Ionic structures and properties
T|3.3|Metallic bonding|Metallic lattice;Delocalised electrons;Metallic properties
T|3.4|Covalent and coordinate bonding|Covalent bond formation;Single, double and triple bonds;Coordinate covalent bonds
T|3.5|Shapes of molecules|Electron-pair repulsion;Molecular shapes;Bond angles;Predicting molecular geometry
T|3.6|Intermolecular forces and bond polarity|Permanent dipole–dipole forces;Instantaneous dipole–induced dipole forces;Hydrogen bonding;Bond polarity and molecular polarity;Effects on physical properties
T|3.7|Dot-and-cross diagrams|Ionic structures;Covalent structures;Coordinate bonding diagrams
C|as-level|4|states-of-matter|States of matter|Physical chemistry
T|4.1|Gases|Kinetic particle model;Ideal and real gases;Gas pressure;Ideal gas equation, pV = nRT
T|4.2|Bonding and structure|Simple molecular structures;Giant ionic structures;Giant metallic structures;Giant covalent structures;Structure–property relationships
C|as-level|5|chemical-energetics|Chemical energetics|Physical chemistry
T|5.1|Enthalpy changes|Exothermic and endothermic reactions;Standard enthalpy changes;Reaction pathway diagrams;Calorimetry;Bond-energy calculations
T|5.2|Hess's law|Hess cycles;Enthalpy calculations;Indirect determination of enthalpy changes
C|as-level|6|electrochemistry|Electrochemistry: redox|Physical chemistry
T|6.1|Oxidation and reduction|Electron transfer;Oxidation numbers;Oxidising and reducing agents;Balancing redox equations;Disproportionation reactions
C|as-level|7|chemical-equilibria|Equilibria|Physical chemistry
T|7.1|Chemical equilibrium|Reversible reactions;Dynamic equilibrium;Le Chatelier's principle;Equilibrium constant Kc;Partial pressures and Kp;Equilibrium calculations;Haber and Contact processes
T|7.2|Acids, bases and titration|Brønsted–Lowry acids and bases;Strong and weak acids and bases;Neutralisation;pH and indicators;Titration curves;Indicator selection
C|as-level|8|reaction-kinetics-as|Reaction kinetics|Physical chemistry
T|8.1|Rates of reaction|Definition and measurement of reaction rate;Collision theory;Concentration and pressure effects;Reaction-rate calculations
T|8.2|Temperature and activation energy|Activation energy;Boltzmann distribution;Temperature effects
T|8.3|Catalysis|Catalysts and activation energy;Homogeneous catalysts;Heterogeneous catalysts
C|as-level|9|periodic-table-periodicity|The Periodic Table and chemical periodicity|Inorganic chemistry
T|9.1|Physical periodicity|Atomic and ionic radii;Ionisation energies;Electrical conductivity;Melting-point trends
T|9.2|Chemical periodicity|Period 3 oxides;Period 3 chlorides;Reactions with water;Acidic, basic and amphoteric behaviour
T|9.3|Interpreting periodic trends|Predicting properties;Explaining unfamiliar periodic patterns
C|as-level|10|group-2|Group 2|Inorganic chemistry
T|10.1|Group 2 elements and compounds|Physical and chemical trends;Reactions with oxygen, water and acids;Oxides, hydroxides and carbonates;Thermal decomposition;Solubility trends;Predicting Group 2 reactions
C|as-level|11|group-17|Group 17|Inorganic chemistry
T|11.1|Physical properties of halogens|Colours and physical states;Volatility;Bond strength trends
T|11.2|Chemical properties of halogens|Oxidising ability;Reactions with hydrogen;Hydrogen halide stability
T|11.3|Reactions of halide ions|Halide reducing ability;Silver nitrate and ammonia tests;Reactions with concentrated sulfuric acid
T|11.4|Chlorine reactions|Disproportionation;Reactions with aqueous alkalis;Chlorine in water purification
C|as-level|12|nitrogen-and-sulfur|Nitrogen and sulfur|Inorganic chemistry
T|12.1a|Nitrogen and ammonia|Bonding and reactivity of nitrogen;Ammonia and ammonium ions;Acid–base reactions of ammonia
T|12.1b|Atmospheric nitrogen and sulfur chemistry|Nitrogen oxides;Catalytic removal of nitrogen oxides;Photochemical smog;Acid rain and atmospheric sulfur dioxide
C|as-level|13|organic-chemistry-intro|Introduction to AS Level organic chemistry|Organic chemistry
T|13.1|Representing and naming organic compounds|Carbon bonding and hydrocarbons;Empirical and molecular formulae;Structural, displayed and skeletal formulae;Homologous series;Functional groups;Systematic nomenclature
T|13.2|Organic reactions and mechanisms|Reaction classifications;Homolytic and heterolytic bond fission;Free radicals;Nucleophiles and electrophiles;Curly-arrow notation;Addition, substitution and elimination;Hydrolysis, condensation, oxidation and reduction
T|13.3|Shapes and bonding in organic molecules|Sigma and pi bonds;sp, sp² and sp³ hybridisation;Bond angles and molecular geometry;Planarity and restricted rotation
T|13.4|Structural and stereoisomerism|Chain isomerism;Positional isomerism;Functional group isomerism;Geometrical isomerism;Optical isomerism;Chiral centres
C|as-level|14|hydrocarbons|Hydrocarbons|Organic chemistry
T|14.1|Alkanes|Structure and properties;Preparation of alkanes;Combustion;Free-radical substitution;Cracking;Environmental consequences of combustion
T|14.2|Alkenes|Structure and reactivity;Preparation of alkenes;Electrophilic addition;Alkene oxidation;Bromine test;Addition polymerisation;Carbocation stability and major products
C|as-level|15|halogen-compounds|Halogen compounds|Organic chemistry
T|15.1|Halogenoalkanes|Preparation;Primary, secondary and tertiary classification;Nucleophilic substitution;SN1 and SN2 mechanisms;Elimination;Relative reactivity and hydrolysis;Halide identification
C|as-level|16|hydroxy-compounds|Hydroxy compounds|Organic chemistry
T|16.1|Alcohols|Classification and structure;Preparation methods;Combustion and reactions with metals;Oxidation of alcohols;Distillation and reflux;Substitution reactions;Dehydration;Esterification;Tri-iodomethane test;Relative acidity
C|as-level|17|carbonyl-compounds|Carbonyl compounds|Organic chemistry
T|17.1|Aldehydes and ketones|Structures and nomenclature;Preparation by alcohol oxidation;Reduction reactions;Nucleophilic addition with HCN;2,4-DNPH test;Tollens' and Fehling's tests;Tri-iodomethane test
C|as-level|18|carboxylic-acids-derivatives|Carboxylic acids and derivatives|Organic chemistry
T|18.1|Carboxylic acids|Preparation;Acidic properties;Reactions with metals, bases and carbonates;Reduction;Esterification
T|18.2|Esters|Preparation;Acid hydrolysis;Alkaline hydrolysis;Reaction recognition and deductions
C|as-level|19|nitrogen-compounds|Nitrogen compounds|Organic chemistry
T|19.1|Primary amines|Amine functional group;Preparation from halogenoalkanes
T|19.2|Nitriles and hydroxynitriles|Nitrile formation;Hydroxynitrile formation;Reactions and conversions;Carbon-chain extension
C|as-level|20|polymerisation|Polymerisation|Organic chemistry
T|20.1|Addition polymerisation|Monomers and repeat units;Addition polymer formation;Deducing repeat units and monomers;Polymer structure questions
C|as-level|21|organic-synthesis|Organic synthesis|Organic chemistry
T|21.1|AS organic reaction pathways|Functional group interconversions;Reagents and conditions;Reaction maps;Multi-step synthesis;Unfamiliar synthesis questions
C|as-level|22|analytical-techniques|Analytical techniques|Analysis
T|22.1|Infrared spectroscopy|Bond vibrations and absorption;Interpreting IR spectra;Functional group identification
T|22.2|Mass spectrometry|Molecular ion and fragment ions;Interpreting mass spectra;Molecular structure deductions
C|a-level|23|chemical-energetics-a-level|Chemical energetics|Physical chemistry
T|23.1|Lattice energy and Born–Haber cycles|Atomisation enthalpy;Electron affinity;Lattice energy;Born–Haber cycles;Ionic radius and charge effects
T|23.2|Enthalpies of solution and hydration|Hydration enthalpy;Solution enthalpy;Energy cycles;Enthalpy calculations
T|23.3|Entropy|Entropy and particle arrangements;Predicting entropy changes;Standard entropy calculations
T|23.4|Gibbs free energy|Gibbs equation;Feasibility of reactions;Temperature and feasibility;Gibbs energy calculations
C|a-level|24|electrochemistry-a-level|Electrochemistry|Physical chemistry
T|24.1|Electrolysis|Products of electrolysis;Faraday constant;Charge calculations;Quantitative electrolysis;Electrolytic determination of Avogadro constant
T|24.2|Electrode potentials and electrochemical cells|Standard electrode potentials;Standard hydrogen electrode;Half-cells and cell potentials;Redox feasibility;Oxidising and reducing agents;Nernst equation;Gibbs energy and cell potential
C|a-level|25|chemical-equilibria-advanced|Equilibria|Physical chemistry
T|25.1|Acids, bases and solubility equilibria|Conjugate acid–base pairs;pH, Ka, pKa and Kw;Strong and weak acid calculations;Buffer solutions;Buffer pH calculations;Solubility product Ksp;Common ion effect
T|25.2|Partition coefficients|Distribution between solvents;Partition coefficient calculations;Effect of solvent polarity
C|a-level|26|reaction-kinetics|Reaction kinetics|Physical chemistry
T|26.1|Rate equations and reaction orders|Rate equations;Order and overall order;Initial-rate methods;Half-life;Rate constants;Kinetic calculations;Rate-determining step;Reaction mechanisms
T|26.2|Catalysis|Homogeneous catalytic mechanisms;Heterogeneous catalytic mechanisms;Adsorption and desorption;Catalytic reaction pathways
C|a-level|27|group-2-a-level|Group 2: further chemistry|Inorganic chemistry
T|27.1|Thermal stability of Group 2 compounds|Thermal decomposition of carbonates;Thermal decomposition of nitrates;Polarising power and ionic size;Explanation of thermal stability trends
C|a-level|28|transition-elements|Chemistry of transition elements|Inorganic chemistry
T|28.1|Transition elements and their properties|Transition element definition;d orbitals and electronic configurations;Variable oxidation states;Catalytic properties;Magnetic properties
T|28.2|Complex ions and ligands|Coordinate bonds;Ligands and denticity;Coordination number;Complex geometry;Ligand exchange;Redox reactions of transition elements
T|28.3|Colour of transition metal complexes|Splitting of d orbitals;d–d electronic transitions;Absorption and observed colour;Effect of changing ligands
T|28.4|Stereoisomerism in complex ions|Geometrical isomerism;Optical isomerism;Complex polarity
T|28.5|Stability constants|Kstab definition;Stability constant expressions;Calculations;Complex stability and ligand exchange
C|a-level|29|organic-chemistry-advanced|Introduction to A Level organic chemistry|Organic chemistry
T|29.1|Advanced organic structures and naming|Further functional groups;Advanced systematic nomenclature;Cyclic and aromatic compounds;Interpreting advanced structural formulae
T|29.2|Advanced organic reaction mechanisms|Electrophilic substitution;Addition–elimination reactions;Mechanism recognition
T|29.3|Aromatic bonding and molecular structure|Benzene bonding;Delocalised pi system;Aromatic molecular geometry
T|29.4|Optical isomerism and pharmaceuticals|Enantiomers;Optical activity;Racemic mixtures;Biological activity of enantiomers;Chiral synthesis and separation
C|a-level|30|arenes|Hydrocarbons: arenes|Organic chemistry
T|30.1|Benzene and arenes|Benzene structure and stability;Electrophilic aromatic substitution;Halogenation;Nitration;Friedel–Crafts alkylation;Friedel–Crafts acylation;Side-chain oxidation;Aromatic hydrogenation;Directing effects of substituents;Side-chain versus ring substitution
C|a-level|31|halogen-compounds-a-level|Halogen compounds: further chemistry|Organic chemistry
T|31.1|Halogenoarenes|Preparation of halogenoarenes;Halogen substitution on aromatic rings;Halogenoarenes versus halogenoalkanes;Explanation of differences in reactivity
C|a-level|32|hydroxy-compounds-a-level|Hydroxy compounds: further chemistry|Organic chemistry
T|32.1|Further reactions of alcohols|Reaction with acyl chlorides;Ester formation
T|32.2|Phenol|Phenol preparation;Acidic properties;Comparison with alcohols and water;Nitration and bromination;Ring activation and directing effects;Azo coupling;Related phenolic compounds
C|a-level|33|carboxylic-acids-a-level|Carboxylic acids and derivatives|Organic chemistry
T|33.1|Further chemistry of carboxylic acids|Benzoic acid formation;Preparation of acyl chlorides;Oxidation of methanoic and ethanedioic acids;Relative acidities;Substituent effects on acidity
T|33.2|Further ester formation|Esters from acyl chlorides;Reactions with alcohols and phenol
T|33.3|Acyl chlorides|Preparation and reagents;Hydrolysis;Reactions with alcohols;Reactions with phenol;Reactions with ammonia and amines;Addition–elimination mechanisms;Relative ease of hydrolysis
C|a-level|34|nitrogen-compounds-a-level|Nitrogen compounds|Organic chemistry
T|34.1|Primary and secondary amines|Preparation from halogenoalkanes;Reduction of nitriles;Reduction of amides;Basicity and reactions of amines
T|34.2|Phenylamine and azo compounds|Preparation of phenylamine;Basicity of phenylamine;Bromination of phenylamine;Diazotisation;Diazonium salts;Azo coupling and azo dyes
T|34.3|Amides|Amide formation;Acidic and alkaline hydrolysis;Reduction of amides;Relative basicity of amides
T|34.4|Amino acids and peptides|Amino acid acid–base properties;Zwitterions;Isoelectric point;Peptide bond formation;Dipeptides and tripeptides;Electrophoresis
C|a-level|35|polymerisation-a-level|Polymerisation|Organic chemistry
T|35.1|Condensation polymerisation|Polyesters;Polyamides;Monomers and repeat units;Formation and cleavage of linkages
T|35.2|Identifying polymerisation types|Addition versus condensation;Deduction of monomers;Deduction of repeat units
T|35.3|Degradable polymers|Non-biodegradable poly(alkenes);Photodegradation;Polyester hydrolysis;Polyamide hydrolysis;Polymer structure and degradability
C|a-level|36|organic-synthesis-a-level|Organic synthesis|Organic chemistry
T|36.1|Multi-step organic synthesis|Recognising multiple functional groups;Functional group interconversions;Reagents and conditions;Synthesis route planning;Reaction pathways;Reaction types and possible by-products;Advanced unfamiliar synthesis problems
C|a-level|37|analytical-chemistry|Analytical techniques|Analysis
T|37.1|Thin-layer chromatography|Stationary and mobile phases;Baseline and solvent front;Rf calculations;Separation and interpretation
T|37.2|Gas–liquid chromatography|Mobile and stationary phases;Retention times;Chromatogram interpretation;Mixture composition
T|37.3|Carbon-13 NMR spectroscopy|Carbon environments;Number of peaks;Carbon-13 spectra;Structure deductions
T|37.4|Proton NMR spectroscopy|Proton environments;Chemical shifts;Integration;Splitting patterns and n + 1 rule;TMS and deuterated solvents;D₂O exchange;Molecular structure deductions
P|as-level|P3|practical-skills-p3|Practical skills: Paper 3 (Advanced Practical Skills)|Practical skills
T|P3.1|Laboratory techniques|Apparatus and safety;Measurement;Titration;Heating and handling;Observations
T|P3.2|Qualitative analysis|Tests for cations;Tests for anions;Gas tests;Identifying unknown substances
T|P3.3|Data and evaluation|Recording measurements;Tables and graphs;Calculations;Conclusions;Errors and improvements
P|a-level|P5|practical-skills-p5|Practical skills: Paper 5 (Planning, Analysis and Evaluation)|Practical skills
T|P5.1|Planning|Experimental design;Independent and dependent variables;Controlled variables;Apparatus selection;Risk assessment
T|P5.2|Analysis|Processing data;Graphs and relationships;Calculations;Interpreting results
T|P5.3|Evaluation|Uncertainties;Systematic and random errors;Limitations;Method improvements;Reliability and validity
"""


def slugify(text):
    text = text.lower().replace("ₒ", "").replace("²", "2").replace("³", "3").replace("¹", "1").replace("₂", "2")
    text = re.sub(r"[σπΔ]", "", text)
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:80]


def parse():
    chapters = []
    for line in SPEC.strip().splitlines():
        kind, *f = line.split("|")
        if kind in ("C", "P"):
            board, num, slug, name, section = f
            chapters.append({"board": board, "syllabus_number": num, "slug": slug, "name": name, "section": section,
                             "kind": "practical" if kind == "P" else "theory",
                             "level": "AS" if board == "as-level" else "A", "topics": []})
        else:
            ref, title, subs = f
            chapters[-1]["topics"].append({"syllabus_ref": ref, "title": title, "slug": slugify(title),
                                           "subtopics": [{"id": slugify(s), "title": s} for s in subs.split(";")]})
    return chapters
