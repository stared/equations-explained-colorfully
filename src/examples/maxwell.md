# Maxwell's Equations

## Equation

$$
\begin{aligned}
\mark[divergence]{\nabla \cdot} \mark[electric]{\vec{E}} &= \frac{\mark[charge]{\rho}}{\mark[permittivity]{\varepsilon_0}} \\
\mark[divergence]{\nabla \cdot} \mark[magnetic]{\vec{B}} &= \mark[zero]{0} \\
\mark[curl]{\nabla \times} \mark[electric]{\vec{E}} &= -\mark[timederiv]{\frac{\partial}{\partial t}}\mark[magnetic]{\vec{B}} \\
\mark[curl]{\nabla \times} \mark[magnetic]{\vec{B}} &= \mark[permeability]{\mu_0}\mark[current]{\vec{J}} + \mark[permeability]{\mu_0}\mark[permittivity]{\varepsilon_0}\mark[timederiv]{\frac{\partial}{\partial t}}\mark[electric]{\vec{E}}
\end{aligned}
$$

## Description

Gauss's law: [Divergence]{.divergence} of [electric field]{.electric} equals [charge density]{.charge} over [permittivity]{.permittivity}. [Divergence]{.divergence} of [magnetic field]{.magnetic} is [zero]{.zero} (no monopoles). Faraday's law: [Curl]{.curl} of [electric field]{.electric} equals negative [time change]{.timederiv} of [magnetic field]{.magnetic}. Ampère-Maxwell: [Curl]{.curl} of [magnetic field]{.magnetic} equals [permeability]{.permeability} times [current]{.current} plus displacement current.

## .divergence

The divergence operator $\nabla \cdot$ measures how much a field spreads out from a point.

Positive divergence means field lines emanate (sources), negative means they converge (sinks), and zero means they just pass through.

## .curl

The curl operator $\nabla \times$ measures how much a field circulates or rotates around a point.

A paddle wheel placed in the field would spin if the curl is non-zero. The curl gives the axis and speed of rotation.

## .electric

The electric field $\vec{E}$ represents the force per unit charge.

Electric fields emanate from positive charges and terminate on negative charges. They also form loops when magnetic fields change with time.

## .magnetic

The magnetic field $\vec{B}$ represents the magnetic force on moving charges.

Unlike electric fields, magnetic field lines always form closed loops - they have no beginning or end points (no magnetic monopoles).

## .charge

The charge density $\rho$ is the amount of electric charge per unit volume.

Charges are the sources of electric fields, analogous to how mass creates gravitational fields.

## .permittivity

The permittivity of free space $\varepsilon_0 \approx 8.85 \times 10^{-12}$ F/m determines how electric fields respond to charges.

It relates the electric field strength to the amount of charge that creates it.

## .zero

The zero on the right side of Gauss's law for magnetism means magnetic monopoles don't exist.

Every magnetic field line that enters a region must also exit it - there are no isolated magnetic charges.

## .timederiv

The time derivative $\frac{\partial}{\partial t}$ describes how fields change at a fixed point in space.

Changing magnetic fields create electric fields (electromagnetic induction) and changing electric fields create magnetic fields.

## .permeability

The permeability of free space $\mu_0 = 4\pi \times 10^{-7}$ H/m determines how magnetic fields respond to currents.

Together with $\varepsilon_0$, it determines the speed of light: $c = 1/\sqrt{\mu_0\varepsilon_0}$.

## .current

The current density $\vec{J}$ is the flow of electric charge per unit area.

Moving charges (currents) create magnetic fields that circle around the direction of current flow.