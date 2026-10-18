# EdVNova Interactive Lab: First Two Simulations (Proposal, not implemented)

Both simulations would run as a new lesson activity type inside the existing course workspace (Concept Notes lesson view). They would load only when opened and report completion through the same `/api/progress` system once the learning activities are done.

---

## 1. Physics: Waves Explorer

**Syllabus fit:** IGCSE Physics 0625 (general wave properties), AS/A Level Physics 9702 (progressive waves, superposition).

**Learning objectives**
- Tell transverse and longitudinal waves apart by particle motion relative to energy transfer.
- Use v = f λ and see that the medium fixes wave speed, so changing f changes λ.
- Read amplitude, wavelength and period from displacement–distance and displacement–time graphs.
- (AS/A) Relate intensity to amplitude squared; phase difference between two points.

**Student controls:** wave type (transverse / longitudinal), amplitude, frequency, medium (sets speed), play / pause / step / reset, 0.25× slow motion, "track one particle" marker, graph toggle (x–y or y–t).

**Physics model:** y(x, t) = A sin(2π(x/λ − f t)) with v fixed per medium and λ = v / f derived, never set independently. Longitudinal mode displaces particles along x using the same function. Shown assumptions: no damping, single frequency, ideal medium.

**Check understanding (3–5 questions):** predict λ after doubling f; identify compression/rarefaction; read the period from the y–t graph.

**Visual design:** light lesson surface, navy axes, EdVNova blue wave, one highlighted particle. No 3D.

**Technology:** a single SVG/Canvas 2D React component with `requestAnimationFrame` and no new library. It pauses offscreen and respects reduced motion (step mode only).

**Complexity:** low–medium (about 2–3 days including questions and testing).

---

## 2. Chemistry: Collision Theory and Rates of Reaction

**Syllabus fit:** IGCSE Chemistry 0620 (rate of reaction, collision theory), AS/A Level Chemistry 9701 (Boltzmann distribution, activation energy, catalysts).

**Learning objectives**
- Explain that a reaction needs collisions with energy ≥ Ea and the correct orientation.
- Show how temperature raises both collision frequency and, mainly, the fraction of particles above Ea.
- Show how concentration raises collision frequency without changing the energy distribution.
- (AS/A) Interpret the Maxwell–Boltzmann distribution and how a catalyst lowers Ea.

**Student controls:** temperature, concentration (particle count), activation energy / catalyst toggle, play / pause / reset, slow motion, live counters (collisions per second, successful collisions per second).

**Model:** 2D hard-sphere particles in a box. Speeds are sampled from a 2D Maxwell–Boltzmann distribution at temperature T. A collision counts as successful when the relative kinetic energy along the line of centres is at least Ea. The side graph shows the energy distribution with the Ea line and the shaded area above it. Stated assumptions: an ideal 2D gas, no orientation factor shown at IGCSE level, a simplified scale, not real molecules.

**Check understanding:** predict the effect of +10 °C on the shaded area; explain why concentration changes frequency but not the curve; place the catalyst Ea line.

**Visual design:** neutral particles (two species in navy and blue), a brief highlight on successful collisions, and the graph beside the box (below it on mobile).

**Technology:** Canvas 2D with a small fixed-step physics loop (about 60–150 particles). Particle count is capped on mobile, there is no new library, and it pauses offscreen.

**Complexity:** medium (about 4–5 days, mainly for model validation and teacher review).

---

## Integration notes
- An admin would mark a simulation as a lesson activity and choose whether it is required.
- Completion would mean finishing the guided steps and answering the check questions. Opening the simulation alone would not count.
- Scores are stored separately from completion, as agreed.
- Both simulations need review by a subject specialist before publishing.
