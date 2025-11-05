# Navier-Stokes Equation

## Equation

$$
\mark[density]{\rho}\left(\mark[timederiv]{\frac{\partial \vec{v}}{\partial t}} + \mark[convection]{\vec{v} \cdot \nabla \vec{v}}\right) = -\mark[pressure]{\nabla p} + \mark[viscosity]{\mu} \mark[laplacian]{\nabla^2 \vec{v}} + \mark[force]{\vec{f}}
$$

## Description

[Fluid density]{.density} times ([velocity change with time]{.timederiv} plus [convective acceleration]{.convection}) equals negative [pressure gradient]{.pressure} plus [viscosity]{.viscosity} times [Laplacian]{.laplacian} of velocity plus [external forces]{.force}.

## .density

The fluid density $\rho$ represents mass per unit volume.

For incompressible fluids like water, density is constant. For gases, it can vary significantly with pressure and temperature.

## .timederiv

The partial time derivative $\frac{\partial \vec{v}}{\partial t}$ captures how velocity changes at a fixed point in space.

This represents local acceleration - how fast the fluid speeds up or slows down at a specific location.

## .convection

The convective term $\vec{v} \cdot \nabla \vec{v}$ represents acceleration due to fluid being carried from one place to another.

Even in steady flow, particles accelerate as they move from regions of low to high velocity.

## .pressure

The pressure gradient $\nabla p$ represents the force due to pressure differences.

Fluid flows from high pressure to low pressure regions, like air flowing out of a balloon.

## .viscosity

The dynamic viscosity $\mu$ measures a fluid's resistance to flow.

Honey has high viscosity (flows slowly), while water has low viscosity (flows easily). Units: Pa·s (Pascal-seconds).

## .laplacian

The Laplacian $\nabla^2 = \frac{\partial^2}{\partial x^2} + \frac{\partial^2}{\partial y^2} + \frac{\partial^2}{\partial z^2}$ measures the difference between a point's value and its neighbors' average.

In the viscous term, it captures how velocity differences between neighboring fluid parcels create internal friction forces.

## .force

External body forces $\vec{f}$ include gravity, electromagnetic forces, or any other forces acting throughout the fluid volume.

For example, gravity causes water to flow downhill.