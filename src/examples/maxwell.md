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

[Charges]{.charge} act as [sources or sinks]{.divergence} of the [electric field]{.electric}, while the [magnetic field]{.magnetic} has [no sources or sinks]{.zero}. [Changes over time]{.timederiv} in one field are linked to [circulation]{.curl} of the other; [electric currents]{.current} also produce magnetic circulation. The constants [permittivity]{.permittivity} and [permeability]{.permeability} set the strength of these relationships and the speed of electromagnetic waves.

These equations use SI units, with total charge and current densities as the sources.

## .divergence

The divergence operator $\nabla \cdot$. Measures how much a field flows outward or inward at a point.

## .curl

The curl operator $\nabla \times$. Measures how much a field swirls or rotates around a point.

## .electric

The electric field $\vec{E}$. Electric force per unit charge. Charges produce electric fields with sources and sinks; a changing magnetic field can also produce a circulating electric field.

## .magnetic

The magnetic field $\vec{B}$. Exerts a force $q\vec{v}\times\vec{B}$ on a charge $q$ moving with velocity $\vec{v}$. Its field lines have no beginnings or endings; they need not form closed loops.

## .charge

Charge density $\rho$. Electric charge per unit volume. Positive and negative charge act as sources and sinks of the electric field.

## .permittivity

Vacuum permittivity $\varepsilon_0$. Relates charge density to electric-field divergence and appears in the displacement-current term.

## .zero

Zero divergence $\nabla \cdot \vec{B}=0$. The net magnetic flux through any closed surface is zero. These equations contain no magnetic charges (monopoles).

## .timederiv

Time derivative $\frac{\partial}{\partial t}$. Measures change at a fixed location. A changing magnetic field is linked to electric-field curl; a changing electric field contributes to magnetic-field curl.

## .permeability

Vacuum permeability $\mu_0$. Sets the coupling of current to magnetic-field curl. Together with $\varepsilon_0$, it determines the speed of light in vacuum: $c=1/\sqrt{\mu_0\varepsilon_0}$.

## .current

Current density $\vec{J}$. Electric current per unit area, pointing in the direction of positive-charge flow. It contributes to the curl of the magnetic field.
