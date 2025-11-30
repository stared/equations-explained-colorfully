# Navier-Stokes Equation

## Equation

$$
\mark[density]{\rho} \left( \mark[timederiv]{\frac{\partial \vec{v}}{\partial t}} + \mark[convection]{(\vec{v} \cdot \nabla) \vec{v}} \right) = \mark[pressure]{-\nabla p} + \mark[viscosity]{\mu \nabla^2 \vec{v}} + \mark[force]{\vec{f}}
$$

## Description

The [fluid mass]{.density} accelerates ([over time]{.timederiv} and [along paths]{.convection}) due to forces. These include [pressure]{.pressure}, [viscosity]{.viscosity}, and [external fields]{.force}.

## .density

Fluid density $\rho$ (mass per unit volume).

It acts as the "mass" term in $F=ma$. Heavier fluids (like water) carry more momentum and are harder to accelerate than lighter fluids (like air).

## .timederiv

Unsteady acceleration (local change).

Measures how the velocity changes at a fixed point in space over time. If the flow is "steady" (like a calm river), this term is zero, even if the water is moving fast.

## .convection

Convective acceleration (change due to movement).

This non-linear term captures how fluid particles accelerate as they move to a region with different velocity (e.g., water speeding up as it enters a narrow pipe). It is responsible for turbulence and the complex behavior of fluids.

## .pressure

Pressure gradient force.

Fluids naturally flow from high pressure to low pressure (down the gradient). This term drives the flow, pushing fluid parcels toward lower pressure zones. The negative sign ensures the force points _against_ the increase in pressure.

## .viscosity

Viscous diffusion (internal friction).

Describes how the fluid resists flow due to internal friction. The term $\mu \nabla^2 \vec{v}$ acts like diffusion for momentum, smoothing out velocity differences between neighboring layers of fluid. High viscosity (honey) suppresses turbulence; low viscosity (water) allows it.

## .force

External body forces.

Forces that act on the bulk of the fluid, such as gravity ($\rho \vec{g}$), magnetic forces, or Coriolis forces in atmospheric flows.
